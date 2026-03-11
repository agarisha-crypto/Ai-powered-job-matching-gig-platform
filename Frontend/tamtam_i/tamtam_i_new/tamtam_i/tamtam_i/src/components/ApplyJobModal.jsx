import { useEffect, useState } from "react"
import "./ApplyJobModal.css"

function ApplyJobModal({ job, isSubmitting, onClose, onSubmit }) {
  const [amountProposed, setAmountProposed] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    setAmountProposed(job?.budget ? String(job.budget) : "")
    setError("")
  }, [job])

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && !isSubmitting) {
        onClose()
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isSubmitting, onClose])

  if (!job) {
    return null
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const numericAmount = Number(amountProposed)
    if (!amountProposed || Number.isNaN(numericAmount) || numericAmount <= 0) {
      setError("Enter a valid proposed amount.")
      return
    }

    setError("")
    await onSubmit({ amountProposed: numericAmount })
  }

  return (
    <div className="apply-job-modal-overlay" onClick={!isSubmitting ? onClose : undefined}>
      <div
        className="apply-job-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="apply-job-title"
      >
        <div className="apply-job-modal-header">
          <div>
            <h2 id="apply-job-title">Apply for {job.title || "Job"}</h2>
            <p>Submit your proposed amount for this job.</p>
          </div>
          <button
            className="apply-job-close"
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close"
          >
            x
          </button>
        </div>

        <form className="apply-job-form" onSubmit={handleSubmit}>
          <div className="apply-job-summary">
            <p>
              <strong>Budget:</strong> {job.budget ?? "Not specified"}
            </p>
            <p>
              <strong>Status:</strong> {job.status || "Unknown"}
            </p>
          </div>

          <label className="apply-job-label" htmlFor="amountProposed">
            Proposed Amount
          </label>
          <input
            id="amountProposed"
            className="apply-job-input"
            type="number"
            min="1"
            step="0.01"
            value={amountProposed}
            onChange={(event) => setAmountProposed(event.target.value)}
            disabled={isSubmitting}
            required
          />

          {error && <div className="apply-job-error">{error}</div>}

          <div className="apply-job-actions">
            <button
              className="apply-job-secondary"
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button className="apply-job-primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ApplyJobModal
