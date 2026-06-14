import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import QrModal from './QrModal';

export default function UrlCard({ url, onDelete, onUpdate }) {
  const navigate = useNavigate();
  const [copied,    setCopied]    = useState(false);
  const [hovered,   setHovered]   = useState(false);
  const [showQr,    setShowQr]    = useState(false);
  const [deleting,  setDeleting]  = useState(false);
  const [editing,   setEditing]   = useState(false);
  const [editVal,   setEditVal]   = useState(url.originalUrl);
  const [editErr,   setEditErr]   = useState('');
  const [saving,    setSaving]    = useState(false);

  const isExpired = url.isExpired;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url.shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for non-HTTPS
      window.prompt('Copy this URL:', url.shortUrl);
    }
  }

  async function handleDelete() {
    if (!window.confirm('Delete this link? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await onDelete(url._id);
    } catch {
      setDeleting(false);
    }
  }

  async function handleSaveEdit() {
    try { new URL(editVal); } catch { setEditErr('Enter a valid URL (include https://)'); return; }
    setSaving(true);
    try {
      await onUpdate(url._id, editVal);
      setEditing(false);
      setEditErr('');
    } catch (e) {
      setEditErr(e.response?.data?.error || 'Failed to update');
    } finally {
      setSaving(false);
    }
  }

  const cardStyle = {
    background: 'var(--bg2)',
    border: isExpired
      ? '0.5px solid rgba(226,75,74,0.3)'
      : hovered
        ? '0.5px solid rgba(212,83,126,0.5)'
        : '0.5px solid var(--border)',
    borderLeft: isExpired ? '3px solid var(--red)' : undefined,
    borderRadius: isExpired ? '0 14px 14px 0' : '14px',
    paddingLeft: isExpired ? '17px' : '20px',
    padding: '18px 20px',
    marginBottom: 10,
    transition: 'border-color 0.15s',
  };

  return (
    <>
      <div style={cardStyle} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>

        {/* Top row — short URL pill + click count */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div className={`ls-pill${isExpired ? ' ls-pill-expired' : ''}`}
            style={isExpired ? { background: 'rgba(226,75,74,0.12)', color: '#F09595', borderColor: 'rgba(226,75,74,0.3)' } : {}}>
            <i className="ti ti-link" aria-hidden="true" style={{ fontSize: 12 }} />
            {url.shortUrl.replace(/^https?:\/\//, '')}
          </div>
          {isExpired ? (
            <span className="ls-badge ls-badge-red">
              <i className="ti ti-clock-x" aria-hidden="true" style={{ fontSize: 11 }} />
              Expired
            </span>
          ) : (
            <span className="ls-badge ls-badge-teal">
              <i className="ti ti-chart-bar" aria-hidden="true" style={{ fontSize: 11 }} />
              {url.clickCount.toLocaleString()} clicks
            </span>
          )}
        </div>

        {/* Original URL */}
        {editing ? (
          <div style={{ marginTop: 8 }}>
            <input
              className={`ls-input${editErr ? ' ls-input-error' : ''}`}
              value={editVal}
              onChange={(e) => { setEditVal(e.target.value); setEditErr(''); }}
              placeholder="https://..."
            />
            {editErr && <div style={{ fontSize: 11, color: '#F09595', marginTop: 4 }}>{editErr}</div>}
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              <button className="ls-btn-primary" style={{ padding: '5px 14px', fontSize: 12 }} onClick={handleSaveEdit} disabled={saving}>
                {saving ? <><div className="ls-spinner" style={{ width: 12, height: 12 }} />Saving</> : 'Save'}
              </button>
              <button className="ls-btn-secondary" style={{ padding: '5px 12px', fontSize: 12 }} onClick={() => { setEditing(false); setEditVal(url.originalUrl); setEditErr(''); }}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="ls-url-truncate" style={{ marginTop: 6 }} title={url.originalUrl}>
            {url.originalUrl}
          </div>
        )}

        {/* Date */}
        <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>
          <i className={`ti ${isExpired ? 'ti-calendar-x' : 'ti-calendar'}`} aria-hidden="true" style={{ fontSize: 11, marginRight: 3 }} />
          {isExpired && url.expiresAt
            ? `Expired ${format(new Date(url.expiresAt), 'MMM d, yyyy')}`
            : `Created ${format(new Date(url.createdAt), 'MMM d, yyyy')}`}
        </div>

        <hr className="ls-divider" />

        {/* Action row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className={`ls-badge ${isExpired ? 'ls-badge-red' : 'ls-badge-teal'}`}>
            {isExpired ? 'Expired' : 'Active'}
          </span>

          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            {!isExpired && (
              <>
                {/* Copy */}
                <button
                  className={copied || hovered ? 'ls-btn-primary' : 'ls-btn-secondary'}
                  style={{ padding: '6px 14px', fontSize: 12 }}
                  onClick={handleCopy}
                  aria-label="Copy short URL"
                >
                  <i className={`ti ${copied ? 'ti-check' : 'ti-copy'}`} aria-hidden="true" style={{ fontSize: 13 }} />
                  {copied ? 'Copied!' : 'Copy'}
                </button>

                {/* Analytics */}
                <button
                  className="ls-icon-label-btn"
                  onClick={() => navigate(`/dashboard/analytics/${url._id}`)}
                  aria-label="View analytics"
                  title="View analytics"
                >
                  <i className="ti ti-chart-bar" aria-hidden="true" style={{ fontSize: 15 }} />
                  <span>Analytics</span>
                </button>

                {/* Edit */}
                <button
                  className="ls-icon-label-btn"
                  onClick={() => setEditing(true)}
                  aria-label="Edit destination URL"
                  title="Edit URL"
                >
                  <i className="ti ti-edit" aria-hidden="true" style={{ fontSize: 15 }} />
                  <span>Edit</span>
                </button>

                {/* QR */}
                <button
                  className="ls-icon-label-btn"
                  onClick={() => setShowQr(true)}
                  aria-label="Show QR code"
                  title="QR code"
                >
                  <i className="ti ti-qrcode" aria-hidden="true" style={{ fontSize: 15 }} />
                  <span>QR Code</span>
                </button>
              </>
            )}

            {/* Delete */}
            <button
              className="ls-icon-label-btn ls-icon-label-btn-danger"
              onClick={handleDelete}
              disabled={deleting}
              aria-label="Delete URL"
              title="Delete this link"
            >
              {deleting
                ? <div className="ls-spinner" style={{ width: 14, height: 14, borderColor: '#F09595', borderTopColor: 'transparent' }} />
                : <i className="ti ti-trash" aria-hidden="true" style={{ fontSize: 15 }} />}
              <span>{deleting ? 'Deleting…' : 'Delete'}</span>
            </button>
          </div>
        </div>
      </div>

      {showQr && <QrModal url={url} onClose={() => setShowQr(false)} />}
    </>
  );
}
