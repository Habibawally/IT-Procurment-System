import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ar, statusLabel, priorityLabel } from '../i18n';

/* ── Icons ──────────────────────────────────────────────────────────────── */
export const IconDashboard = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{display:'block'}}><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/></svg>;
export const IconRequests  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{display:'block'}}><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>;
export const IconPlus      = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{display:'block'}}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
export const IconApprovals = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{display:'block'}}><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>;
export const IconLogout    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{display:'block'}}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
export const IconX         = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{display:'block'}}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
export const IconCheck     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{display:'block'}}><polyline points="20 6 9 17 4 12"/></svg>;
export const IconSearch    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{display:'block'}}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
export const IconBack      = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{display:'block'}}><polyline points="9 18 15 12 9 6"/></svg>;
export const IconInbox     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{display:'block'}}><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>;

/* ── Layout ─────────────────────────────────────────────────────────────── */
export function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const initials = (user?.name || '?').split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase();

  const nav = [
    { to: '/dashboard',    label: ar.nav.dashboard,  Icon: IconDashboard, roles: ['employee','manager','it','procurement'] },
    { to: '/requests',     label: ar.nav.requests,   Icon: IconRequests,  roles: ['employee','manager','it','procurement'] },
    { to: '/requests/new', label: ar.nav.newRequest, Icon: IconPlus,      roles: ['employee'] },
    { to: '/approvals',    label: ar.nav.approvals,  Icon: IconApprovals, roles: ['manager','it','procurement'] },
  ].filter(i => i.roles.includes(user?.role));

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.75" style={{display:'block',width:18,height:18}}>
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
          </div>
          <div className="sidebar-logo-text">
            <h1>{ar.appName}</h1>
            <p>{ar.appTagline}</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">{ar.nav.menu}</div>
          {nav.map(({ to, label, Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <span className="nav-item-icon"><Icon /></span>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <div className="user-name">{user?.name}</div>
              <div className="user-role">{ar.roles[user?.role] || user?.role}</div>
            </div>
          </div>
          <button className="btn-signout" onClick={() => { logout(); navigate('/login'); }}>
            <IconLogout /> {ar.nav.signOut}
          </button>
        </div>
      </aside>

      <div className="main-area">
        <div className="page-wrap">{children}</div>
      </div>
    </div>
  );
}

/* ── Badges ─────────────────────────────────────────────────────────────── */
const DOT_COLORS = {
  pending_manager: '#7c3aed', pending_it: '#2563eb',
  pending_procurement: '#d97706', completed: '#059669', rejected: '#dc2626',
};

export function StatusBadge({ status }) {
  return (
    <span className={`badge badge-${status}`}>
      <span className="badge-dot" style={{ background: DOT_COLORS[status] || '#94a3b8' }} />
      {statusLabel(status)}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  return <span className={`badge badge-${priority}`}>{priorityLabel(priority)}</span>;
}

/* ── Modal ──────────────────────────────────────────────────────────────── */
export function Modal({ title, onClose, children }) {
  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="btn-ghost btn-icon" onClick={onClose}><IconX /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ── Loading ────────────────────────────────────────────────────────────── */
export function Loading() {
  return (
    <div className="spinner-wrap">
      <div className="spinner" />
      <span className="spinner-text">{ar.common.loading}</span>
    </div>
  );
}

/* ── Empty ──────────────────────────────────────────────────────────────── */
export function Empty({ title = ar.common.noResults, sub }) {
  return (
    <div className="empty-state">
      <div className="empty-icon"><IconInbox /></div>
      <p className="empty-title">{title}</p>
      {sub && <span className="empty-sub">{sub}</span>}
    </div>
  );
}
/* by :Eng.Habiba Wally ]*/