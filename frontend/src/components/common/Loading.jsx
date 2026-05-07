export const Loading = ({ size = 'md' }) => (
  <div className="center-pad">
    <div className={`spinner ${size === 'lg' ? 'spinner-lg' : ''}`} />
  </div>
);

export const SkeletonRow = ({ rows = 3 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="skeleton" style={{ height: 16, width: `${70 + Math.random() * 30}%` }} />
    ))}
  </div>
);

export const EmptyState = ({ title, message, action }) => (
  <div className="empty-state">
    <h4>{title}</h4>
    <p>{message}</p>
    {action}
  </div>
);

export default Loading;
