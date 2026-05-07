const map = {
  successful: { cls: 'badge-success', label: 'Successful' },
  successful_dim: { cls: 'badge-success', label: 'Success' },
  pending: { cls: 'badge-warn', label: 'Pending' },
  failed: { cls: 'badge-fail', label: 'Failed' },
  flagged: { cls: 'badge-flag', label: 'Flagged' },
  active: { cls: 'badge-success', label: 'Active' },
  blocked: { cls: 'badge-fail', label: 'Blocked' },
  open: { cls: 'badge-info', label: 'Open' },
  funded: { cls: 'badge-success', label: 'Funded' },
  draft: { cls: 'badge-muted', label: 'Draft' },
  closed: { cls: 'badge-muted', label: 'Closed' },
  safe: { cls: 'badge-success', label: 'Safe' },
  nearLimit: { cls: 'badge-warn', label: 'Near Limit' },
  exceeded: { cls: 'badge-fail', label: 'Exceeded' },
};

const StatusBadge = ({ status }) => {
  const cfg = map[status] || { cls: 'badge-muted', label: status };
  return <span className={`badge ${cfg.cls}`}>{cfg.label}</span>;
};

export default StatusBadge;
