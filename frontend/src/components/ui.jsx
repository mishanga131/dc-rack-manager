import { STATUS_LABELS } from '../validation.js';

export function StatusBadge({ status }) {
  return <span className={`badge badge-${status}`}>{STATUS_LABELS[status]}</span>;
}

export function Skeleton({ height = 16, width = '100%' }) {
  return <div className="skeleton" style={{ height, width }} />;
}
