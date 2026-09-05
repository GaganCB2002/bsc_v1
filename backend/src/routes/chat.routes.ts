import { Router } from 'express'
import { z } from 'zod'
import { query } from '../db.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)

// ── Get all conversations for current user ─────────────────
router.get('/', async (req, res) => {
  const userId = req.user!.id
  try {
    const { rows } = await query(
      `SELECT c.id, c.title, c.is_group, c.created_at, c.updated_at,
              cm.role AS my_role,
              (SELECT content FROM messages m WHERE m.conversation_id = c.id AND m.is_deleted = FALSE ORDER BY m.created_at DESC LIMIT 1) AS last_message,
              (SELECT sender_id FROM messages m WHERE m.conversation_id = c.id AND m.is_deleted = FALSE ORDER BY m.created_at DESC LIMIT 1) AS last_sender_id,
              (SELECT created_at FROM messages m WHERE m.conversation_id = c.id AND m.is_deleted = FALSE ORDER BY m.created_at DESC LIMIT 1) AS last_message_at,
              (SELECT COUNT(*) FROM messages m
               WHERE m.conversation_id = c.id AND m.is_deleted = FALSE
                 AND m.created_at > COALESCE((SELECT read_at FROM message_reads mr WHERE mr.message_id IN (SELECT id FROM messages WHERE conversation_id = c.id) AND mr.user_id = $1 ORDER BY mr.read_at DESC LIMIT 1), '1970-01-01')
              )::int AS unread_count
       FROM conversations c
       JOIN conversation_members cm ON cm.conversation_id = c.id AND cm.user_id = $1
       ORDER BY COALESCE(
         (SELECT created_at FROM messages m WHERE m.conversation_id = c.id AND m.is_deleted = FALSE ORDER BY m.created_at DESC LIMIT 1),
         c.created_at
       ) DESC`,
      [userId]
    )

    // Get members for each conversation
    const convIds = rows.map(r => r.id)
    let memberMap: Record<string, { userId: string; fullName: string; roleName: string }[]> = {}

    if (convIds.length > 0) {
      const { rows: members } = await query(
        `SELECT cm.conversation_id, cm.user_id, u.full_name, u.role_name
         FROM conversation_members cm
         JOIN users u ON u.id = cm.user_id
         WHERE cm.conversation_id = ANY($1)`,
        [convIds]
      )
      for (const m of members) {
        if (!memberMap[m.conversation_id]) memberMap[m.conversation_id] = []
        memberMap[m.conversation_id].push({ userId: m.user_id, fullName: m.full_name, roleName: m.role_name })
      }
    }

    const conversations = rows.map(r => ({
      id: r.id,
      title: r.title || (rows.length === 1 && !r.is_group ? memberMap[r.id]?.find(m => m.userId !== userId)?.fullName : 'Group Chat'),
      isGroup: r.is_group,
      lastMessage: r.last_message,
      lastMessageAt: r.last_message_at,
      unreadCount: r.unread_count,
      members: memberMap[r.id] || [],
      createdAt: r.created_at,
    }))

    res.json({ success: true, data: conversations })
  } catch (err) {
    console.error('[chat] list error:', err)
    res.status(500).json({ success: false, message: 'Failed to load conversations' })
  }
})

// ── Create a conversation (one-to-one or group) ────────────
router.post('/', async (req, res) => {
  const userId = req.user!.id
  const schema = z.object({
    title: z.string().max(150).optional(),
    isGroup: z.boolean().optional(),
    memberIds: z.array(z.string().uuid()).min(1).max(50),
  })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.issues[0].message })

  const { title, isGroup = false, memberIds } = parsed.data

  try {
    // For one-to-one, check if conversation already exists
    if (!isGroup && memberIds.length === 1) {
      const otherId = memberIds[0]
      const { rows: existing } = await query(
        `SELECT c.id FROM conversations c
         WHERE c.is_group = FALSE
           AND EXISTS (SELECT 1 FROM conversation_members WHERE conversation_id = c.id AND user_id = $1)
           AND EXISTS (SELECT 1 FROM conversation_members WHERE conversation_id = c.id AND user_id = $2)
         LIMIT 1`,
        [userId, otherId]
      )
      if (existing.length > 0) {
        return res.json({ success: true, data: { id: existing[0].id }, message: 'Conversation already exists' })
      }
    }

    // Create conversation
    const { rows: [conv] } = await query(
      `INSERT INTO conversations (title, is_group, created_by) VALUES ($1, $2, $3) RETURNING id`,
      [title || null, isGroup, userId]
    )

    // Add creator as OWNER
    await query(
      `INSERT INTO conversation_members (conversation_id, user_id, role) VALUES ($1, $2, 'OWNER')`,
      [conv.id, userId]
    )

    // Add other members
    const uniqueMembers = [...new Set(memberIds.filter(id => id !== userId))]
    for (const memberId of uniqueMembers) {
      await query(
        `INSERT INTO conversation_members (conversation_id, user_id, role) VALUES ($1, $2, 'MEMBER') ON CONFLICT DO NOTHING`,
        [conv.id, memberId]
      )
    }

    res.status(201).json({ success: true, data: { id: conv.id } })
  } catch (err) {
    console.error('[chat] create error:', err)
    res.status(500).json({ success: false, message: 'Failed to create conversation' })
  }
})

// ── Get messages for a conversation ────────────────────────
router.get('/:id/messages', async (req, res) => {
  const userId = req.user!.id
  const { id } = req.params
  const limit = Math.min(parseInt(req.query.limit as string) || 50, 100)
  const before = req.query.before as string | undefined

  try {
    // Verify membership
    const { rows: member } = await query(
      `SELECT 1 FROM conversation_members WHERE conversation_id = $1 AND user_id = $2`,
      [id, userId]
    )
    if (member.length === 0) return res.status(403).json({ success: false, message: 'Not a member' })

    let sql = `
      SELECT m.id, m.sender_id, m.content, m.message_type, m.is_edited, m.is_deleted, m.created_at,
             u.full_name AS sender_name, u.role_name AS sender_role
      FROM messages m
      JOIN users u ON u.id = m.sender_id
      WHERE m.conversation_id = $1
    `
    const params: any[] = [id]

    if (before) {
      params.push(before)
      sql += ` AND m.created_at < (SELECT created_at FROM messages WHERE id = $${params.length})`
    }

    sql += ` AND m.is_deleted = FALSE ORDER BY m.created_at DESC LIMIT $${params.length + 1}`
    params.push(limit)

    const { rows } = await query(sql, params)

    // Mark as read
    if (rows.length > 0) {
      const latestMsgId = rows[0].id
      await query(
        `INSERT INTO message_reads (message_id, user_id) VALUES ($1, $2) ON CONFLICT (message_id, user_id) DO UPDATE SET read_at = NOW()`,
        [latestMsgId, userId]
      )
    }

    res.json({ success: true, data: rows.reverse() })
  } catch (err) {
    console.error('[chat] messages error:', err)
    res.status(500).json({ success: false, message: 'Failed to load messages' })
  }
})

// ── Send a message ─────────────────────────────────────────
router.post('/:id/messages', async (req, res) => {
  const userId = req.user!.id
  const { id } = req.params
  const schema = z.object({
    content: z.string().min(1).max(5000),
    messageType: z.enum(['TEXT', 'IMAGE', 'FILE']).optional(),
  })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.issues[0].message })

  const { content, messageType = 'TEXT' } = parsed.data

  try {
    // Verify membership
    const { rows: member } = await query(
      `SELECT 1 FROM conversation_members WHERE conversation_id = $1 AND user_id = $2`,
      [id, userId]
    )
    if (member.length === 0) return res.status(403).json({ success: false, message: 'Not a member' })

    // Insert message
    const { rows: [msg] } = await query(
      `INSERT INTO messages (conversation_id, sender_id, content, message_type) VALUES ($1, $2, $3, $4) RETURNING id, created_at`,
      [id, userId, content, messageType]
    )

    // Update conversation timestamp
    await query(`UPDATE conversations SET updated_at = NOW() WHERE id = $1`, [id])

    // Get sender info
    const { rows: [sender] } = await query(
      `SELECT full_name, role_name FROM users WHERE id = $1`,
      [userId]
    )

    res.status(201).json({
      success: true,
      data: {
        id: msg.id,
        senderId: userId,
        senderName: sender.full_name,
        senderRole: sender.role_name,
        content,
        messageType,
        isEdited: false,
        isDeleted: false,
        createdAt: msg.created_at,
      }
    })
  } catch (err) {
    console.error('[chat] send error:', err)
    res.status(500).json({ success: false, message: 'Failed to send message' })
  }
})

// ── Get all users for starting a chat ──────────────────────
router.get('/users', async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT id, full_name, role_name, employee_code FROM users WHERE status = 'ACTIVE' ORDER BY full_name`
    )
    res.json({ success: true, data: rows })
  } catch (err) {
    console.error('[chat] users error:', err)
    res.status(500).json({ success: false, message: 'Failed to load users' })
  }
})

// ── Get conversation members ───────────────────────────────
router.get('/:id/members', async (req, res) => {
  const userId = req.user!.id
  const { id } = req.params
  try {
    const { rows: member } = await query(
      `SELECT 1 FROM conversation_members WHERE conversation_id = $1 AND user_id = $2`,
      [id, userId]
    )
    if (member.length === 0) return res.status(403).json({ success: false, message: 'Not a member' })

    const { rows } = await query(
      `SELECT cm.user_id, u.full_name, u.role_name, cm.role, cm.joined_at
       FROM conversation_members cm
       JOIN users u ON u.id = cm.user_id
       WHERE cm.conversation_id = $1
       ORDER BY cm.role DESC, u.full_name`,
      [id]
    )
    res.json({ success: true, data: rows })
  } catch (err) {
    console.error('[chat] members error:', err)
    res.status(500).json({ success: false, message: 'Failed to load members' })
  }
})

// ── Delete a message (soft delete) ─────────────────────────
router.delete('/:id/messages/:messageId', async (req, res) => {
  const userId = req.user!.id
  const { id, messageId } = req.params
  try {
    const { rows } = await query(
      `UPDATE messages SET is_deleted = TRUE, content = 'This message was deleted', updated_at = NOW()
       WHERE id = $1 AND sender_id = $2 AND conversation_id = $3 RETURNING id`,
      [messageId, userId, id]
    )
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Message not found or not yours' })
    res.json({ success: true })
  } catch (err) {
    console.error('[chat] delete msg error:', err)
    res.status(500).json({ success: false, message: 'Failed to delete message' })
  }
})

// ── Leave a conversation ───────────────────────────────────
router.post('/:id/leave', async (req, res) => {
  const userId = req.user!.id
  const { id } = req.params
  try {
    await query(
      `DELETE FROM conversation_members WHERE conversation_id = $1 AND user_id = $2 AND role != 'OWNER'`,
      [id, userId]
    )
    res.json({ success: true })
  } catch (err) {
    console.error('[chat] leave error:', err)
    res.status(500).json({ success: false, message: 'Failed to leave conversation' })
  }
})

export default router
