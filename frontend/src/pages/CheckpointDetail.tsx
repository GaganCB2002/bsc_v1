import { useEffect, useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  Save,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Loader2,
  Paperclip,
} from 'lucide-react'
import { get, post } from '../lib/api'
import type { Submission } from '../lib/types'
import { Spinner, ErrorState } from '../components/States'
import StatusBadge from '../components/StatusBadge'
import EvidenceUploader from '../components/EvidenceUploader'
import { fmtDateTime } from '../lib/format'

interface CheckpointData {
  checkpoint: {
    id: string
    title: string
    description: string | null
    score: number
    isAccuracyRequired: boolean
    isCorrectiveActionRequired: boolean
    isPhotoRequired: boolean
    moduleName: string
    moduleSlug: string
    departmentName: string
  }
  assignment: { id: string; assignedDate: string; dueDate: string | null; frequency: string } | null
  submission: Submission | null
}

const COMPLIANCE_OPTIONS = [
  { value: 'FULLY_FOLLOWED', label: '1. Fully followed' },
  { value: 'PARTIALLY_FOLLOWED', label: '2. Partially followed' },
  { value: 'NOT_FOLLOWED', label: '3. Not followed' },
  { value: 'NO_TRANSACTION', label: '4. No transaction' },
  { value: 'YET_TO_IMPLEMENT', label: '5. Yet to implement' },
]
const ACCURACY_OPTIONS = [
  { value: 'FULLY_ACCURATE', label: '1. Fully accurate' },
  { value: 'PARTLY_ACCURATE', label: '2. Partly accurate' },
  { value: 'INACCURATE', label: '3. Inaccurate' },
  { value: 'NA', label: '4. N/A' },
]
const CORRECTIVE_STATUSES = ['NOT_FOLLOWED', 'PARTIALLY_FOLLOWED', 'YET_TO_IMPLEMENT']

export default function CheckpointDetail() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const [data, setData] = useState<CheckpointData | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const [compliance, setCompliance] = useState('')
  const [accuracy, setAccuracy] = useState('')
  const [comments, setComments] = useState('')
  const [corrective, setCorrective] = useState('')
  const [evidence, setEvidence] = useState<Submission['evidence']>([])
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [submitting, setSubmitting] = useState(false)
  const [notice, setNotice] = useState('')
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dirty = useRef(false)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const d = await get<CheckpointData>(`/api/checkpoints/${id}`)
      setData(d)
      if (d.submission) {
        setCompliance(d.submission.answer?.complianceStatus || '')
        setAccuracy(d.submission.answer?.accuracyStatus || '')
        setComments(d.submission.answer?.comments || '')
        setCorrective(d.submission.answer?.correctiveAction || '')
        setEvidence(d.submission.evidence || [])
      }
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current) }
  }, [id])

  const saveDraft = async (showState = true) => {
    if (!compliance && !accuracy && !comments && !corrective) return
    if (showState) setSaveState('saving')
    try {
      const created = await post<{ submissionId: string; status: string }>('/api/submissions/draft', {
        checkpointId: id,
        complianceStatus: compliance || null,
        accuracyStatus: accuracy || null,
        comments: comments || null,
        correctiveAction: corrective || null,
      })
      // Keep local state in sync so evidence upload & submit unlock immediately
      setData((prev) =>
        prev
          ? {
              ...prev,
              submission: prev.submission
                ? { ...prev.submission, id: prev.submission.id || created.submissionId, status: prev.submission.status === 'PENDING' ? 'DRAFT' : prev.submission.status }
                : {
                    id: created.submissionId,
                    status: 'DRAFT',
                    submittedAt: null,
                    approvedAt: null,
                    rejectedAt: null,
                    reviewComment: null,
                    answer: {
                      complianceStatus: compliance || null,
                      accuracyStatus: accuracy || null,
                      comments: comments || null,
                      correctiveAction: corrective || null,
                    },
                    evidence: [],
                  },
            }
          : prev
      )
      if (showState) setSaveState('saved')
      setTimeout(() => setSaveState('idle'), 2500)
      dirty.current = false
    } catch (e) {
      if (showState) setSaveState('error')
      setNotice((e as Error).message)
    }
  }

  // Debounced autosave on every field change (creates the draft on first input)
  useEffect(() => {
    if (loading) return
    if (locked) return
    if (!compliance && !accuracy && !comments && !corrective) return
    dirty.current = true
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => void saveDraft(), 900)
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compliance, accuracy, comments, corrective])

  const handleSubmit = async () => {
    if (!data?.submission) return
    if (!compliance) {
      setNotice('Please select a compliance status before submitting')
      return
    }
    setSubmitting(true)
    setNotice('')
    try {
      await saveDraft(false)
      await post(`/api/submissions/${data.submission.id}/submit`)
      await load()
      setSaveState('idle')
    } catch (e) {
      setNotice((e as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Spinner text="Loading checkpoint..." />
  if (error || !data) return <ErrorState message={error || 'Checkpoint not found'} onRetry={load} />

  const { checkpoint, submission } = data
  const locked = submission ? ['SUBMITTED', 'APPROVED', 'REJECTED'].includes(submission.status) : false
  const needCorrective = checkpoint.isCorrectiveActionRequired || CORRECTIVE_STATUSES.includes(compliance)
  const draftExists = !!submission

  return (
    <div>
      <div className="page-header">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1>{checkpoint.title}</h1>
            <p>
              {checkpoint.moduleName} · {checkpoint.departmentName} · {checkpoint.score} points
            </p>
          </div>
          <div className="flex items-center gap-2">
            {submission && <StatusBadge status={submission.status} />}
            <Link to={`/modules/${checkpoint.moduleSlug}`} className="inline-flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to module
            </Link>
          </div>
        </div>
      </div>

      {checkpoint.description && (
        <div className="card p-4 mb-4 -mt-3">
          <p className="text-sm text-text-secondary">{checkpoint.description}</p>
          <div className="flex items-center gap-3 mt-2 text-[11px] text-text-muted flex-wrap">
            {checkpoint.isAccuracyRequired && <span className="px-2 py-0.5 rounded-full bg-info-bg text-info font-semibold">Accuracy rating required</span>}
            {checkpoint.isCorrectiveActionRequired && <span className="px-2 py-0.5 rounded-full bg-warning-bg text-warning font-semibold">Corrective action required</span>}
            {checkpoint.isPhotoRequired && <span className="px-2 py-0.5 rounded-full bg-primary-light text-primary-deep font-semibold">Evidence upload required</span>}
            {data.assignment && (
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {data.assignment.frequency} · due {fmtDateTime(data.assignment.dueDate)}</span>
            )}
          </div>
        </div>
      )}

      {submission && submission.status === 'APPROVED' && (
        <div className="flex items-start gap-2.5 bg-success-bg border border-success/20 rounded-xl px-4 py-3 mb-4 text-success">
          <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0" />
          <div className="text-xs">
            <p className="font-bold">Approved{submission.autoApproved ? ' automatically' : ''} {fmtDateTime(submission.approvedAt)}</p>
            {submission.reviewComment && <p className="mt-0.5 opacity-90">{submission.reviewComment}</p>}
          </div>
        </div>
      )}
      {submission && submission.status === 'REJECTED' && (
        <div className="flex items-start gap-2.5 bg-danger-bg border border-danger/20 rounded-xl px-4 py-3 mb-4 text-danger">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <div className="text-xs">
            <p className="font-bold">Rejected {fmtDateTime(submission.rejectedAt)}</p>
            {submission.reviewComment && <p className="mt-0.5 opacity-90">{submission.reviewComment}</p>}
          </div>
        </div>
      )}
      {submission && submission.status === 'SUBMITTED' && (
        <div className="flex items-start gap-2.5 bg-info-bg border border-info/20 rounded-xl px-4 py-3 mb-4 text-info">
          <Clock className="w-4 h-4 mt-0.5 shrink-0" />
          <div className="text-xs">
            <p className="font-bold">Submitted for review {fmtDateTime(submission.submittedAt)}</p>
            <p className="mt-0.5 opacity-90">A reviewer will act on it — if nobody reviews within 1 hour, it will be auto-approved.</p>
          </div>
        </div>
      )}

      {notice && (
        <div className="flex items-center gap-2 bg-warning-bg border border-warning/20 rounded-xl px-4 py-2.5 mb-4 text-warning text-xs font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0" /> {notice}
        </div>
      )}

      {/* Form */}
      <div className="card p-5">
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="label">Compliance status *</label>
            <div className="space-y-1.5">
              {COMPLIANCE_OPTIONS.map((o) => (
                <label
                  key={o.value}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border text-sm cursor-pointer transition-colors ${
                    compliance === o.value
                      ? 'border-primary bg-primary-faint text-primary-deep font-semibold'
                      : 'border-border hover:border-primary/50 text-text-secondary'
                  } ${locked ? 'pointer-events-none opacity-60' : ''}`}
                >
                  <input type="radio" name="compliance" className="accent-sky-500" disabled={locked}
                    checked={compliance === o.value} onChange={() => setCompliance(o.value)} />
                  {o.label}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Accuracy rating {checkpoint.isAccuracyRequired ? '*' : '(optional)'}</label>
            <div className="space-y-1.5">
              {ACCURACY_OPTIONS.map((o) => (
                <label
                  key={o.value}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border text-sm cursor-pointer transition-colors ${
                    accuracy === o.value
                      ? 'border-primary bg-primary-faint text-primary-deep font-semibold'
                      : 'border-border hover:border-primary/50 text-text-secondary'
                  } ${locked ? 'pointer-events-none opacity-60' : ''}`}
                >
                  <input type="radio" name="accuracy" className="accent-sky-500" disabled={locked}
                    checked={accuracy === o.value} onChange={() => setAccuracy(o.value)} />
                  {o.label}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5">
          <label className="label">Comments / remarks</label>
          <textarea
            className="input min-h-[90px] resize-y"
            placeholder="Describe today's process execution..."
            value={comments}
            disabled={locked}
            onChange={(e) => setComments(e.target.value)}
          />
        </div>

        {needCorrective && (
          <div className="mt-4">
            <label className="label">Corrective action {checkpoint.isCorrectiveActionRequired ? '*' : ''}</label>
            <textarea
              className="input min-h-[70px] resize-y"
              placeholder="What corrective action will you take?"
              value={corrective}
              disabled={locked}
              onChange={(e) => setCorrective(e.target.value)}
            />
          </div>
        )}

        <div className="mt-5">
          <label className="label flex items-center gap-1.5">
            <Paperclip className="w-3.5 h-3.5" /> Evidence files {checkpoint.isPhotoRequired ? '*' : ''}
          </label>
          {draftExists ? (
            <EvidenceUploader
              checkpointId={checkpoint.id}
              submissionId={submission?.id || null}
              evidence={evidence}
              onChange={setEvidence}
              disabled={locked}
            />
          ) : (
            <p className="text-xs text-text-muted bg-surface-alt rounded-lg px-3 py-2.5">
              Save the form once (fill any field) and then you can attach evidence files.
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 mt-6 pt-4 border-t border-border flex-wrap">
          <div className="flex items-center gap-2 text-[11px]">
            {saveState === 'saving' && <span className="flex items-center gap-1.5 text-text-muted"><Loader2 className="w-3 h-3 animate-spin" /> Autosaving...</span>}
            {saveState === 'saved' && <span className="flex items-center gap-1.5 text-success font-semibold"><CheckCircle2 className="w-3 h-3" /> Draft saved</span>}
            {saveState === 'error' && <span className="text-danger font-semibold">Autosave failed</span>}
            {saveState === 'idle' && draftExists && !locked && <span className="text-text-muted">Changes autosave automatically</span>}
          </div>
          <div className="flex items-center gap-2">
            {!locked && (
              <>
                <button className="btn btn-outline" onClick={() => void saveDraft()} disabled={submitting || saveState === 'saving'}>
                  <Save className="w-3.5 h-3.5" /> Save draft
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => void handleSubmit()}
                  disabled={submitting || !draftExists}
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  Submit for review
                </button>
              </>
            )}
            {submission?.status === 'REJECTED' && (
              <p className="text-xs text-text-muted">Contact your supervisor to reopen this submission.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
