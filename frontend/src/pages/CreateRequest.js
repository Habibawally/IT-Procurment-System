import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/shared';
import { api } from '../api/client';
import { ar } from '../i18n';

const C = ar.create;

const PRIORITY_INFO = {
  low:      { color: '#64748b', bg: '#f1f5f9', emoji: '🟢' },
  medium:   { color: '#2563eb', bg: '#dbeafe', emoji: '🔵' },
  high:     { color: '#d97706', bg: '#fef3c7', emoji: '🟡' },
  critical: { color: '#dc2626', bg: '#fee2e2', emoji: '🔴' },
};

const ITEM_TYPES_AR = [
  { value: 'Hardware',    label: 'أجهزة' },
  { value: 'Software',    label: 'برامج' },
  { value: 'Accessories', label: 'ملحقات' },
  { value: 'Networking',  label: 'شبكات' },
  { value: 'Storage',     label: 'تخزين' },
  { value: 'Other',       label: 'أخرى' },
];

export default function CreateRequest() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', item_type: '', priority: '' });
  const [error, setError]       = useState('');
  const [submitting, setSubmitting] = useState(false);

  const set = field => e => setForm(f => ({ ...f, [field]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title || !form.description || !form.item_type || !form.priority)
      return setError(C.allRequired);
    setError(''); setSubmitting(true);
    try {
      const req = await api.createRequest(form);
      navigate(`/requests/${req.id}`);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  const pInfo = PRIORITY_INFO[form.priority];
  const pAr   = C.priorityInfo[form.priority];

  return (
    <Layout>
      <button className="back-btn" onClick={() => navigate(-1)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><polyline points="9 18 15 12 9 6"/></svg>
        {C.back}
      </button>

      <div className="page-header" style={{ marginBottom: 28 }}>
        <div>
          <div className="page-title">{C.title}</div>
          <div className="page-subtitle">{C.subtitle}</div>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:24, alignItems:'start' }}>

        {/* ── Form ── */}
        <div className="card">
          {error && (
            <div className="alert alert-error">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>{C.titleLabel} <span style={{ color:'var(--rose)' }}>*</span></label>
              <input value={form.title} onChange={set('title')} placeholder={C.titlePlaceholder} required autoFocus />
              <div style={{ fontSize:11.5, color:'var(--ink-4)', marginTop:5 }}>{C.titleHint}</div>
            </div>

            <div className="form-group">
              <label>{C.descLabel} <span style={{ color:'var(--rose)' }}>*</span></label>
              <textarea value={form.description} onChange={set('description')} placeholder={C.descPlaceholder} rows={5} required />
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              <div className="form-group">
                <label>{C.typeLabel} <span style={{ color:'var(--rose)' }}>*</span></label>
                <select value={form.item_type} onChange={set('item_type')} required>
                  <option value="">{C.typePlaceholder}</option>
                  {ITEM_TYPES_AR.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>{C.priorityLabel} <span style={{ color:'var(--rose)' }}>*</span></label>
                <select value={form.priority} onChange={set('priority')} required>
                  <option value="">{C.priorityPlaceholder}</option>
                  <option value="low">🟢 منخفضة</option>
                  <option value="medium">🔵 متوسطة</option>
                  <option value="high">🟡 عالية</option>
                  <option value="critical">🔴 حرجة</option>
                </select>
              </div>
            </div>

            {pInfo && pAr && (
              <div style={{ background:pInfo.bg, border:`1px solid ${pInfo.color}33`, borderRadius:8, padding:'12px 14px', marginBottom:20, display:'flex', alignItems:'center', gap:10, fontSize:13, color:pInfo.color, fontWeight:600, direction:'rtl' }}>
                <span style={{ fontSize:16 }}>{pInfo.emoji}</span>
                <span><strong>{pAr.label}</strong> — {pAr.desc}</span>
              </div>
            )}

            <div style={{ display:'flex', gap:10, justifyContent:'flex-start', paddingTop:4, borderTop:'1px solid var(--border)', flexDirection:'row-reverse' }}>
              <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>{C.cancel}</button>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting
                  ? <><span className="spinner" style={{width:13,height:13,borderWidth:2}} />{C.submitting}</>
                  : C.submitBtn}
              </button>
            </div>
          </form>
        </div>

        {/* ── Sidebar ── */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div className="card" style={{ padding:20 }}>
            <div style={{ fontWeight:800, fontSize:14, color:'var(--ink)', marginBottom:18 }}>{C.workflowTitle}</div>
            <div style={{ position:'relative' }}>
              {/* vertical line — right side for RTL */}
              <div style={{ position:'absolute', right:13, top:28, bottom:0, width:1.5, background:'var(--border)' }} />
              {C.workflowSteps.map((s, i) => (
                <div key={i} style={{ display:'flex', gap:14, marginBottom: i < 3 ? 18 : 0, position:'relative', flexDirection:'row-reverse' }}>
                  <div style={{ width:28, height:28, borderRadius:'50%', background:'var(--bg-white)', border:'1.5px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, color:'var(--ink-3)', flexShrink:0, zIndex:1 }}>{i+1}</div>
                  <div style={{ paddingTop:3, textAlign:'right' }}>
                    <div style={{ fontSize:13, fontWeight:700, color:'var(--ink)' }}>{s.label}</div>
                    <div style={{ fontSize:12, color:'var(--ink-3)', marginTop:1 }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding:16, background:'var(--bg)' }}>
            <div style={{ fontSize:12, color:'var(--ink-3)', lineHeight:1.75 }}>
              <strong style={{ color:'var(--ink)', fontWeight:700 }}>{C.tipsTitle}</strong>
              <ul style={{ marginTop:8, paddingRight:16, paddingLeft:0, display:'flex', flexDirection:'column', gap:5 }}>
                {C.tips.map((tip, i) => <li key={i}>{tip}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
