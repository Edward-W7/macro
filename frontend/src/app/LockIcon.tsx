// Standalone LockIcon component for use in dashboard

export function LockIcon({ locked }: { locked: boolean }) {
  return (
    <span
      style={{
        display: 'inline-block',
        marginRight: '0.7rem',
        cursor: 'pointer',
        transition: 'transform 0.2s',
        transform: locked ? 'scale(1.2) rotate(-10deg)' : 'scale(1)',
        color: locked ? '#6366f1' : '#a1a1aa',
        verticalAlign: 'middle',
      }}
      aria-label={locked ? 'Unlock meal' : 'Lock meal'}
    >
      {locked ? (
        <svg width="22" height="22" viewBox="0 0 20 20" fill="currentColor"><path d="M6 8V6a4 4 0 118 0v2h1a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2h1zm2-2a2 2 0 114 0v2H8V6zm-3 4v6a1 1 0 001 1h10a1 1 0 001-1v-6a1 1 0 00-1-1H5a1 1 0 00-1 1z"/></svg>
      ) : (
        <svg width="22" height="22" viewBox="0 0 20 20" fill="currentColor"><path d="M6 8V6a4 4 0 118 0v2h1a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2h1zm2-2a2 2 0 114 0v2H8V6zm-3 4v6a1 1 0 001 1h10a1 1 0 001-1v-6a1 1 0 00-1-1H5a1 1 0 00-1 1z" opacity="0.4"/></svg>
      )}
    </span>
  );
}
