import { QRCodeSVG } from 'qrcode.react';
import { useEffect } from 'react';

export default function QrModal({ url, onClose }) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="ls-card"
        style={{ width: 280, textAlign: 'center', padding: 28 }}
      >
        {/* QR Code */}
        <div style={{ display: 'inline-block', padding: 12, background: '#fff', borderRadius: 12, marginBottom: 16 }}>
          <QRCodeSVG
            value={url.shortUrl}
            size={180}
            level="M"
            includeMargin={false}
          />
        </div>

        {/* Short URL label */}
        <div className="ls-pill" style={{ justifyContent: 'center', marginBottom: 8 }}>
          <i className="ti ti-link" aria-hidden="true" style={{ fontSize: 12 }} />
          {url.shortUrl.replace(/^https?:\/\//, '')}
        </div>

        <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 20 }}>
          Scan to visit this link
        </div>

        <button className="ls-btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={onClose}>
          <i className="ti ti-x" aria-hidden="true" style={{ fontSize: 13 }} />
          Close
        </button>
      </div>
    </div>
  );
}
