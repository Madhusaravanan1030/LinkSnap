import Navbar        from '../components/Navbar';
import CreateUrlForm  from '../components/CreateUrlForm';
import UrlCard        from '../components/UrlCard';
import { useUrls }   from '../hooks/useUrls';

function SkeletonCard() {
  return (
    <div className="ls-card" style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="ls-skeleton" style={{ height: 28, width: 160, borderRadius: 999 }} />
        <div className="ls-skeleton" style={{ height: 22, width: 80, borderRadius: 6 }} />
      </div>
      <div className="ls-skeleton" style={{ height: 14, width: '70%', marginTop: 10 }} />
      <div className="ls-skeleton" style={{ height: 12, width: 100, marginTop: 8 }} />
      <hr className="ls-divider" />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div className="ls-skeleton" style={{ height: 22, width: 60, borderRadius: 6 }} />
        <div style={{ display: 'flex', gap: 6 }}>
          <div className="ls-skeleton" style={{ height: 32, width: 80, borderRadius: 9 }} />
          <div className="ls-skeleton" style={{ height: 32, width: 32, borderRadius: 8 }} />
          <div className="ls-skeleton" style={{ height: 32, width: 32, borderRadius: 8 }} />
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="ls-card" style={{ textAlign: 'center', padding: '32px 20px' }}>
      <div style={{
        width: 56, height: 56, borderRadius: 16,
        background: 'rgba(212,83,126,0.12)', border: '0.5px solid rgba(212,83,126,0.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 16px', fontSize: 24, color: 'var(--pink)',
      }}>
        <i className="ti ti-link" aria-hidden="true" />
      </div>
      <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--text)', marginBottom: 6 }}>No links yet</div>
      <div style={{ fontSize: 13, color: 'var(--text2)' }}>
        Shorten your first URL and start tracking clicks.
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { urls, loading, error, addUrl, deleteUrl, updateUrl } = useUrls();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '24px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <Navbar />

        {/* Page title */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 20, fontWeight: 500, color: 'var(--text)', margin: 0 }}>Dashboard</h1>
          <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 4 }}>
            {loading ? '...' : `${urls.length} link${urls.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Create form */}
        <CreateUrlForm onCreated={addUrl} />

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(226,75,74,0.12)', border: '0.5px solid rgba(226,75,74,0.3)',
            borderRadius: 10, padding: '12px 16px', fontSize: 13, color: '#F09595', marginBottom: 16,
          }}>
            <i className="ti ti-alert-circle" aria-hidden="true" /> {error}
          </div>
        )}

        {/* URL list */}
        {loading ? (
          [1, 2, 3].map((n) => <SkeletonCard key={n} />)
        ) : urls.length === 0 ? (
          <EmptyState />
        ) : (
          <div>
            {urls.map((url) => (
              <UrlCard
                key={url._id}
                url={url}
                onDelete={deleteUrl}
                onUpdate={updateUrl}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
