import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layout, StatusBadge, PriorityBadge, Loading } from '../components/shared';
import { api } from '../api/client';
import { timeAgo, formatHours } from '../utils';
import { ar, itemTypeAr } from '../i18n';

const D = ar.dashboard;

const STATS = [
  { key:'pending_manager',     color:'#7c3aed', bg:'#ede9fe',
    icon:<svg viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.75" style={{display:'block'}} width="17" height="17"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { key:'pending_it',          color:'#2563eb', bg:'#dbeafe',
    icon:<svg viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.75" style={{display:'block'}} width="17" height="17"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg> },
  { key:'pending_procurement', color:'#d97706', bg:'#fef3c7',
    icon:<svg viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="1.75" style={{display:'block'}} width="17" height="17"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg> },
  { key:'completed',           color:'#059669', bg:'#d1fae5',
    icon:<svg viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="1.75" style={{display:'block'}} width="17" height="17"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> },
  { key:'rejected',            color:'#dc2626', bg:'#fee2e2',
    icon:<svg viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="1.75" style={{display:'block'}} width="17" height="17"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg> },
];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats]     = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    Promise.all([api.getStats(), api.getRequests()])
      .then(([s, r]) => { setStats(s); setRequests(r.slice(0, 8)); })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Layout><Loading /></Layout>;

  const sMap = {};
  (stats?.statusCounts || []).forEach(s => sMap[s.status] = s.count);

  const stageTimes = [
    { label: D.managerReview, val: stats?.avgTimes?.avg_manager_hours,     color:'#7c3aed' },
    { label: D.itReview,      val: stats?.avgTimes?.avg_it_hours,          color:'#2563eb' },
    { label: D.procurement,   val: stats?.avgTimes?.avg_procurement_hours, color:'#d97706' },
  ];
  // Bar length is relative to the slowest stage
  const maxStage = Math.max(0, ...stageTimes.map(t => t.val || 0));

  const h = new Date().getHours();
  const greeting = h < 12 ? D.greetMorning : h < 18 ? D.greetAfternoon : D.greetEvening;

  return (
    <Layout>
      {/* Header */}
      <div className="page-header">
        <div>
          <div style={{ fontSize:12.5, color:'#64748b', fontWeight:600, marginBottom:4 }}>{greeting} {D.wave}</div>
          <div className="page-title">{user?.name}</div>
          <div className="page-subtitle">
            {D.loggedAs} <strong style={{color:'#334155'}}>{ar.roles[user?.role]}</strong>
            {' · '}{new Date().toLocaleDateString('ar-SA', { weekday:'long', month:'long', day:'numeric' })}
          </div>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          {user?.role === 'employee' && (
            <button className="btn-primary" onClick={() => navigate('/requests/new')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" style={{display:'block'}}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              {D.newRequest}
            </button>
          )}
          {['manager','it','procurement'].includes(user?.role) && (
            <button className="btn-primary" onClick={() => navigate('/approvals')}>
              {D.approvalsQueue}
            </button>
          )}
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-card-top-bar" style={{ background:'#1e293b' }} />
          <div className="stat-icon-wrap" style={{ background:'#f1f5f9' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#1e293b" strokeWidth="1.75" style={{display:'block'}} width="17" height="17">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          </div>
          <div className="stat-number">{stats?.total ?? 0}</div>
          <div className="stat-name">{D.totalRequests}</div>
        </div>

        {STATS.map(s => (
          <div key={s.key} className="stat-card">
            <div className="stat-card-top-bar" style={{ background: s.color }} />
            <div className="stat-icon-wrap" style={{ background: s.bg }}>{s.icon}</div>
            <div className="stat-number" style={{ color: s.color }}>{sMap[s.key] ?? 0}</div>
            <div className="stat-name">{D.statLabels[s.key]}</div>
          </div>
        ))}
      </div>

      {/* Body */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 290px', gap:18, alignItems:'start' }}>

        {/* Requests table */}
        <div className="card" style={{ padding:0, overflow:'hidden' }}>
          <div style={{ padding:'16px 20px', borderBottom:'1px solid #e2e8f0', display:'flex', alignItems:'center', justifyContent:'space-between', direction:'rtl' }}>
            <div>
              <div style={{ fontWeight:800, fontSize:15, color:'#0f172a' }}>{D.recentRequests}</div>
              <div style={{ fontSize:12.5, color:'#64748b', marginTop:2 }}>{D.recentSub}</div>
            </div>
            <button className="btn-secondary btn-sm" onClick={() => navigate('/requests')}>{D.viewAll}</button>
          </div>

          {requests.length === 0
            ? <div style={{padding:'20px 0'}}><div className="empty-state"><div className="empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" width="20" height="20" style={{display:'block'}}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div><p className="empty-title">{D.noRequests}</p></div></div>
            : (
              <div className="table-wrap">
                <table>
                  <thead><tr>
                    <th style={{paddingRight:20}}>{ar.requests.cols.request}</th>
                    <th>{ar.requests.cols.type}</th>
                    <th>{ar.requests.cols.priority}</th>
                    <th>{ar.requests.cols.status}</th>
                    <th style={{paddingLeft:20}}>{ar.requests.cols.created}</th>
                  </tr></thead>
                  <tbody>
                    {requests.map(r => (
                      <tr key={r.id} className="clickable" onClick={() => navigate(`/requests/${r.id}`)}>
                        <td style={{paddingRight:20}}>
                          <div style={{fontWeight:700, color:'#0f172a', fontSize:13.5}}>{r.title}</div>
                          <div className="ltr" style={{fontSize:11, color:'#94a3b8', marginTop:2}}>#{r.id}</div>
                        </td>
                        <td><span className="type-pill">{itemTypeAr(r.item_type)}</span></td>
                        <td><PriorityBadge priority={r.priority} /></td>
                        <td><StatusBadge status={r.status} /></td>
                        <td style={{paddingLeft:20, fontSize:12.5, color:'#64748b'}}>{timeAgo(r.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
        </div>

        {/* Right column */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {/* Stage durations */}
          <div className="card" style={{ padding:20 }}>
            <div style={{ fontWeight:800, fontSize:14, color:'#0f172a', marginBottom:16 }}>{D.avgStageTime}</div>
            {stageTimes.map(t => (
              <div key={t.label} style={{ marginBottom:13 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5, direction:'rtl' }}>
                  <span style={{ fontSize:12.5, color:'#64748b', fontWeight:600 }}>{t.label}</span>
                  <span className="ltr" style={{ fontSize:12.5, fontWeight:800, color:'#0f172a' }}>{formatHours(t.val)}</span>
                </div>
                <div style={{ height:4, background:'#f1f5f9', borderRadius:4, overflow:'hidden' }}>
                  <div style={{ height:'100%', width: t.val && maxStage ? `${Math.max(5, Math.round((t.val / maxStage) * 100))}%` : '5%', background:t.color, borderRadius:4, transition:'width 0.8s ease' }} />
                </div>
              </div>
            ))}
          </div>

          {/* Role card */}
          <div className="card" style={{ padding:20 }}>
            <div style={{ fontWeight:800, fontSize:14, color:'#0f172a', marginBottom:14 }}>{D.yourRole}</div>
            <div style={{ background:'#f8f7f4', border:'1px solid #e2e8f0', borderRadius:9, padding:14, textAlign:'center', marginBottom:12 }}>
              <div style={{ width:40, height:40, borderRadius:'50%', background:'linear-gradient(135deg,#3b82f6,#7c3aed)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 8px', fontSize:16, fontWeight:800, color:'#fff' }}>
                {user?.name?.charAt(0)}
              </div>
              <div style={{ fontWeight:800, fontSize:14, color:'#0f172a' }}>{user?.name}</div>
              <div style={{ fontSize:12, color:'#64748b', marginTop:2 }}>{ar.roles[user?.role]}</div>
            </div>
            <p style={{ fontSize:12.5, color:'#64748b', lineHeight:1.75 }}>
              {D.roleDesc[user?.role]}
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}