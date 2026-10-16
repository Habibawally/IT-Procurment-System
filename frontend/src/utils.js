export const STATUS_LABELS = {
  pending_manager:     'Pending Manager',
  pending_it:          'Pending IT',
  pending_procurement: 'Pending Procurement',
  completed:           'Completed',
  rejected:            'Rejected',
};

export const PRIORITY_LABELS = { low: 'Low', medium: 'Medium', high: 'High', critical: 'Critical' };

export const ITEM_TYPES = ['Hardware', 'Software', 'Accessories', 'Networking', 'Storage', 'Other'];

export function formatDate(str) {
  if (!str) return '—';
  return new Date(str).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

export function formatDateShort(str) {
  if (!str) return '—';
  return new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function timeAgo(str) {
  if (!str) return '—';
  const diff = Date.now() - new Date(str).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDateShort(str);
}

export function formatHours(h) {
  if (h == null) return '—';
  if (h < 1) return `${Math.round(h * 60)}m`;
  if (h < 24) return `${h.toFixed(1)}h`;
  return `${(h / 24).toFixed(1)}d`;
}

export function calcDuration(from, to) {
  if (!from) return null;
  const end = to ? new Date(to) : new Date();
  const hours = (end - new Date(from)) / 3600000;
  return formatHours(hours);
}

export function getRoleColor(role) {
  const map = { employee: '#5b9bd5', manager: '#9b7fd4', it: '#4caf7d', procurement: '#f0a500' };
  return map[role] || '#888';
}

// Action label mapping
export function actionLabel(action) {
  const map = {
    created: 'Request Created',
    manager_approved: 'Manager Approved',
    manager_rejected: 'Manager Rejected',
    it_approved: 'IT Approved',
    it_rejected: 'IT Rejected',
    procurement_completed: 'Procurement Completed',
  };
  return map[action] || action;
}
