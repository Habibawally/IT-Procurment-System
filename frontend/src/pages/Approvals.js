import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layout, PriorityBadge, Loading, Empty } from '../components/shared';
import { api } from '../api/client';
import { timeAgo, calcDuration } from '../utils';
import { ar, itemTypeAr } from '../i18n';

const A = ar.approvals;
const PRIORITY_COLORS = { critical:'#dc2626', high:'#d97706', medium:'#2563eb', low:'#94a3b8' };

const ROLE_CONFIG = {
  manager:     { ...A.roles.manager,     status:'pending_manager' },
  it:          { ...A.roles.it,          status:'pending_it' },
  procurement: { ...A.roles.procurement, status:'pending_procurement' },
};

export default function Approvals() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  const config = ROLE_CONFIG[user?.role];
  const queueStatus = config?.status;

  useEffect(() => {
    if (!queueStatus) { setLoading(false); return; }
    api.getRequests({ status: queueStatus })
      .then(setRequests).catch(err => setError(err.message)).finally(() => setLoading(false));
  }, [queueStatus]);

  if (!config) return <Layout><div style={{ padding:40, color:'var(--ink-3)' }}>{A.noRole}</div></Layout>;

  const countLabel = loading
    ? ar.common.loading
    : `${requests.length} ${requests.length === 1 ? A.awaitingAction : A.awaitingActionPlural}`;

  return (
    <Layout>
      <div className="page-header">
        <div>
          <div className="page-title">{config.title}</div>
          <div className="page-subtitle">{countLabel}</div>
        </div>
      </div>

      {/* Role banner */}
      <div style={{ background: config.color + '0f', border:`1px solid ${config.color}33`, borderRadius:10, padding:'14px 18px', marginBottom:24, display:'flex', alignItems:'center', gap:12, flexDirection:'row-reverse', direction:'rtl' }}>
        <div style={{ width:36, height:36, borderRadius:8, background: config.color + '18', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke={config.color} strokeWidth="1.75" width="18" height="18">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontSize:13.5, fontWeight:800, color: config.color }}>
            {ar.roles[user?.role]} · {user?.name}
          </div>
          <div style={{ fontSize:12.5, color:'var(--ink-3)', marginTop:1 }}>{config.desc}</div>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Queue */}
      {loading ? <Loading /> : requests.length === 0 ? (
        <div className="card">
          <Empty title={A.allDone} sub={A.allDoneSub} />
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {requests.map(r => (
            <div key={r.id} className="queue-card" onClick={() => navigate(`/requests/${r.id}`)}>

              {/* Priority stripe */}
              <div className="queue-priority-stripe" style={{ background: PRIORITY_COLORS[r.priority] || '#94a3b8' }} />

              {/* Main info */}
              <div style={{ flex:1, minWidth:0, textAlign:'right' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:5, flexWrap:'wrap', flexDirection:'row-reverse' }}>
                  <span className="ltr" style={{ fontSize:11, color:'var(--ink-4)', background:'var(--bg-subtle)', padding:'1px 6px', borderRadius:3 }}>#{r.id}</span>
                  <span style={{ fontSize:14.5, fontWeight:800, color:'var(--ink)' }}>{r.title}</span>
                </div>
                <div style={{ fontSize:12.5, color:'var(--ink-3)', marginBottom:8 }}>
                  {A.requestedBy} <strong style={{ color:'var(--ink-2)' }}>{r.requester_name}</strong>
                </div>
                <div style={{ display:'flex', gap:6, alignItems:'center', flexWrap:'wrap', flexDirection:'row-reverse' }}>
                  <PriorityBadge priority={r.priority} />
                  <span className="type-pill">{itemTypeAr(r.item_type)}</span>
                </div>
              </div>

              {/* Waiting time */}
              <div style={{ textAlign:'center', flexShrink:0 }}>
                <div style={{ fontSize:11, color:'var(--ink-4)', fontWeight:700, marginBottom:3 }}>{A.waiting}</div>
                <div className="ltr" style={{ fontSize:18, fontWeight:800, color:'var(--amber)', lineHeight:1 }}>
                  {calcDuration(r.created_at, null)}
                </div>
                <div style={{ fontSize:11.5, color:'var(--ink-4)', marginTop:3 }}>{timeAgo(r.created_at)}</div>
              </div>

              {/* CTA */}
              <div style={{ padding:'8px 14px', background: config.color + '0f', border:`1px solid ${config.color}33`, borderRadius:7, fontSize:12.5, fontWeight:800, color: config.color, flexShrink:0, display:'flex', alignItems:'center', gap:5, flexDirection:'row-reverse' }}>
                {A.reviewBtn}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12"><polyline points="15 18 9 12 15 6"/></svg>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
