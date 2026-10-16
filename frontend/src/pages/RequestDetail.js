import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layout, StatusBadge, PriorityBadge, Loading, Modal } from '../components/shared';
import { api } from '../api/client';
import { formatDate, calcDuration } from '../utils';
import { ar, actionLabel } from '../i18n';

const D = ar.detail;

export default function RequestDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [request, setRequest]         = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [modal, setModal]             = useState(null);
  const [notes, setNotes]             = useState('');
  const [reason, setReason]           = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [success, setSuccess]         = useState('');
  const fileRef = useRef();

  const load = () => {
    api.getRequest(id).then(setRequest).catch(() => navigate('/requests')).finally(() => setLoading(false));
  };
  useEffect(load, [id]);

  async function handleApprove() {
    setActionLoading(true);
    try {
      await api.approveRequest(id, notes);
      setSuccess('تم اعتماد الطلب بنجاح.');
      setModal(null); setNotes(''); load();
    } catch (err) { setError(err.message); } finally { setActionLoading(false); }
  }

  async function handleReject() {
    setActionLoading(true);
    try {
      await api.rejectRequest(id, reason);
      setSuccess('تم رفض الطلب.');
      setModal(null); setReason(''); load();
    } catch (err) { setError(err.message); } finally { setActionLoading(false); }
  }

  async function handleComplete() {
    setActionLoading(true);
    try {
      const fd = new FormData();
      if (fileRef.current?.files[0]) fd.append('delivery_image', fileRef.current.files[0]);
      fd.append('notes', notes);
      await api.completeRequest(id, fd);
      setSuccess('تم إتمام الطلب وتسليمه بنجاح.');
      setModal(null); setNotes(''); load();
    } catch (err) { setError(err.message); } finally { setActionLoading(false); }
  }

  if (loading) return <Layout><Loading /></Layout>;
  if (!request) return null;

  const r = request;
  const canApprove  = (user.role === 'manager' && r.status === 'pending_manager') || (user.role === 'it' && r.status === 'pending_it');
  const canReject   = canApprove;
  const canComplete = user.role === 'procurement' && r.status === 'pending_procurement';

  const stages = [
    { label: D.stages[0], done: true,                          active: false },
    { label: D.stages[1], done: !!r.manager_approved_at,       active: r.status === 'pending_manager' },
    { label: D.stages[2], done: !!r.it_approved_at,            active: r.status === 'pending_it' },
    { label: D.stages[3], done: !!r.procurement_completed_at,  active: r.status === 'pending_procurement' },
  ];

  const SL = { fontSize:12, fontWeight:700, color:'var(--ink-3)', textTransform:'uppercase', letterSpacing:'0.04em', marginBottom:12 };

  return (
    <Layout>
      <button className="back-btn" onClick={() => navigate(-1)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><polyline points="9 18 15 12 9 6"/></svg>
        {D.backBtn}
      </button>

      {/* Header */}
      <div style={{ marginBottom:24 }}>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16, flexWrap:'wrap', direction:'rtl' }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8, flexWrap:'wrap' }}>
              <span className="ltr" style={{ fontSize:12, color:'var(--ink-4)', background:'var(--bg-subtle)', padding:'2px 8px', borderRadius:4 }}>#{r.id}</span>
              <StatusBadge status={r.status} />
              <PriorityBadge priority={r.priority} />
              <span className="type-pill">{r.item_type}</span>
            </div>
            <h1 style={{ fontSize:22, fontWeight:800, color:'var(--ink)', lineHeight:1.3 }}>{r.title}</h1>
            <div style={{ fontSize:13, color:'var(--ink-3)', marginTop:6 }}>
              {D.requestedBy} <strong style={{ color:'var(--ink-2)' }}>{r.requester_name}</strong> · {formatDate(r.created_at)}
            </div>
          </div>

          {(canApprove || canComplete) && (
            <div style={{ display:'flex', gap:8, flexShrink:0 }}>
              {canApprove && <>
                <button className="btn-success" onClick={() => setModal('approve')}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14"><polyline points="20 6 9 17 4 12"/></svg>
                  {D.approveBtn}
                </button>
                <button className="btn-danger" onClick={() => setModal('reject')}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  {D.rejectBtn}
                </button>
              </>}
              {canComplete && (
                <button className="btn-primary" onClick={() => setModal('complete')}>{D.completeBtn}</button>
              )}
            </div>
          )}
        </div>
      </div>

      {error   && <div className="alert alert-error"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>{error}</div>}
      {success && <div className="alert alert-success"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="15" height="15"><polyline points="20 6 9 17 4 12"/></svg>{success}</div>}

      {/* Stage progress */}
      {r.status !== 'rejected' && (
        <div className="card" style={{ marginBottom:20, padding:'20px 28px' }}>
          <div style={SL}>{D.progress}</div>
          <div className="stage-track">
            {stages.map((s, i) => (
              <div key={s.label} className={`stage-node${s.done ? ' done' : ''}${s.active ? ' active' : ''}`}>
                <div className="stage-circle">
                  {s.done
                    ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width="12" height="12"><polyline points="20 6 9 17 4 12"/></svg>
                    : i + 1}
                </div>
                <div className="stage-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {r.status === 'rejected' && r.rejection_reason && (
        <div style={{ background:'var(--rose-bg)', border:'1px solid #fca5a5', borderRadius:10, padding:'16px 20px', marginBottom:20, display:'flex', gap:12, direction:'rtl' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--rose)" strokeWidth="2" width="18" height="18" style={{ flexShrink:0, marginTop:1 }}><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          <div>
            <div style={{ fontSize:13, fontWeight:800, color:'var(--rose)', marginBottom:4 }}>{D.rejectedTitle}</div>
            <div style={{ fontSize:13, color:'var(--rose)', opacity:0.85 }}>{r.rejection_reason}</div>
          </div>
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:18, alignItems:'start' }}>

        {/* Left col */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div className="card">
            <div style={SL}>{D.description}</div>
            <p style={{ fontSize:14, color:'var(--ink)', lineHeight:1.85 }}>{r.description}</p>
          </div>

          <div className="card">
            <div style={SL}>{D.stageTiming}</div>
            <div className="timing-grid">
              {[
                { label: D.timingLabels.toManager,    from: r.created_at,          to: r.manager_approved_at },
                { label: D.timingLabels.inIT,          from: r.manager_approved_at, to: r.it_approved_at },
                { label: D.timingLabels.inProcurement, from: r.it_approved_at,      to: r.procurement_completed_at },
                { label: D.timingLabels.total,         from: r.created_at,          to: r.procurement_completed_at },
              ].map(t => (
                <div key={t.label} className="timing-cell">
                  <div className="timing-cell-label">{t.label}</div>
                  <div className="timing-cell-value ltr">{t.from ? calcDuration(t.from, t.to) : '—'}</div>
                </div>
              ))}
            </div>
          </div>

          {r.delivery_image && (
            <div className="card">
              <div style={SL}>{D.proofOfDelivery}</div>
              <img src={`/uploads/${r.delivery_image}`} alt="proof" style={{ maxWidth:'100%', borderRadius:8, border:'1px solid var(--border)' }} />
            </div>
          )}
        </div>

        {/* Right col */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div className="card">
            <div style={SL}>{D.details}</div>
            {[
              { label: D.detailRows.requestedBy, value: r.requester_name },
              { label: D.detailRows.email,       value: r.requester_email, mono: true },
              { label: D.detailRows.submitted,   value: formatDate(r.created_at) },
              { label: D.detailRows.mgrApproved, value: formatDate(r.manager_approved_at) },
              { label: D.detailRows.itApproved,  value: formatDate(r.it_approved_at) },
              { label: D.detailRows.completed,   value: formatDate(r.procurement_completed_at) },
            ].map(m => (
              <div key={m.label} className="info-row">
                <span className="info-key">{m.label}</span>
                <span className="info-val" style={{ fontFamily: m.mono ? 'var(--font-mono)' : undefined, fontSize: m.mono ? 11.5 : undefined, direction: m.mono ? 'ltr' : undefined }}>{m.value}</span>
              </div>
            ))}
          </div>

          <div className="card">
            <div style={SL}>{D.activityLog}</div>
            {(!r.logs || r.logs.length === 0)
              ? <div style={{ fontSize:13, color:'var(--ink-4)', textAlign:'center', padding:'16px 0' }}>{D.noActivity}</div>
              : (
                <div className="timeline">
                  {r.logs.map(log => (
                    <div className="timeline-item" key={log.id}>
                      <div className="timeline-dot" />
                      <div className="timeline-action">{actionLabel(log.action)}</div>
                      <div className="timeline-by">{log.user_name} · {ar.roles[log.user_role] || log.user_role}</div>
                      {log.details && <div className="timeline-by" style={{ color:'var(--ink-4)' }}>{log.details}</div>}
                      <div className="timeline-time">{formatDate(log.timestamp)}</div>
                    </div>
                  ))}
                </div>
              )}
          </div>
        </div>
      </div>

      {/* ── Approve Modal ── */}
      {modal === 'approve' && (
        <Modal title={D.approveModal.title} onClose={() => setModal(null)}>
          <p style={{ fontSize:13.5, color:'var(--ink-2)', marginBottom:18, lineHeight:1.75 }}>
            {D.approveModal.body} <strong style={{ color:'var(--ink)' }}>{r.title}</strong>. {D.approveModal.next}
          </p>
          <div className="form-group">
            <label>{D.approveModal.notes}</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder={D.approveModal.notesPlaceholder} rows={3} />
          </div>
          <div style={{ display:'flex', gap:10, justifyContent:'flex-start', flexDirection:'row-reverse' }}>
            <button className="btn-secondary" onClick={() => setModal(null)}>{D.approveModal.cancel}</button>
            <button className="btn-success" onClick={handleApprove} disabled={actionLoading}>
              {actionLoading ? ar.common.processing : D.approveModal.confirm}
            </button>
          </div>
        </Modal>
      )}

      {/* ── Reject Modal ── */}
      {modal === 'reject' && (
        <Modal title={D.rejectModal.title} onClose={() => setModal(null)}>
          <p style={{ fontSize:13.5, color:'var(--ink-2)', marginBottom:6, lineHeight:1.75 }}>
            {D.rejectModal.body} <strong style={{ color:'var(--ink)' }}>{r.title}</strong>.
          </p>
          <p style={{ fontSize:12.5, color:'var(--ink-3)', marginBottom:18 }}>{D.rejectModal.hint}</p>
          <div className="form-group">
            <label>{D.rejectModal.reason}</label>
            <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder={D.rejectModal.reasonPlaceholder} rows={3} />
          </div>
          <div style={{ display:'flex', gap:10, justifyContent:'flex-start', flexDirection:'row-reverse' }}>
            <button className="btn-secondary" onClick={() => setModal(null)}>{D.rejectModal.cancel}</button>
            <button className="btn-danger" onClick={handleReject} disabled={actionLoading}
              style={{ background:'var(--rose)', color:'white', border:'none' }}>
              {actionLoading ? ar.common.processing : D.rejectModal.confirm}
            </button>
          </div>
        </Modal>
      )}

      {/* ── Complete Modal ── */}
      {modal === 'complete' && (
        <Modal title={D.completeModal.title} onClose={() => setModal(null)}>
          <p style={{ fontSize:13.5, color:'var(--ink-2)', marginBottom:18, lineHeight:1.75 }}>
            {D.completeModal.body} <strong style={{ color:'var(--ink)' }}>{r.title}</strong>؟
          </p>
          <div className="form-group">
            <label>{D.completeModal.imageLabel}</label>
            <input type="file" ref={fileRef} accept="image/*"
              style={{ padding:8, background:'var(--bg)', border:'1.5px dashed var(--border)', cursor:'pointer', borderRadius:'var(--radius)' }} />
            <div style={{ fontSize:11.5, color:'var(--ink-4)', marginTop:5 }}>{D.completeModal.imageHint}</div>
          </div>
          <div className="form-group">
            <label>{D.completeModal.notesLabel}</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder={D.completeModal.notesPlaceholder} rows={3} />
          </div>
          <div style={{ display:'flex', gap:10, justifyContent:'flex-start', flexDirection:'row-reverse' }}>
            <button className="btn-secondary" onClick={() => setModal(null)}>{D.completeModal.cancel}</button>
            <button className="btn-success" onClick={handleComplete} disabled={actionLoading}>
              {actionLoading ? ar.common.processing : D.completeModal.confirm}
            </button>
          </div>
        </Modal>
      )}
    </Layout>
  );
}
