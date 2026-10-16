import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ar } from '../i18n';

const DEMOS = [
  { roleKey: 'Employee',    email: 'alice@company.com',  color: '#2563eb', bg: '#dbeafe', init: 'أ' },
  { roleKey: 'Manager',     email: 'carol@company.com',  color: '#7c3aed', bg: '#ede9fe', init: 'م' },
  { roleKey: 'IT Dept.',    email: 'eve@company.com',    color: '#059669', bg: '#d1fae5', init: 'ت' },
  { roleKey: 'Procurement', email: 'grace@company.com',  color: '#d97706', bg: '#fef3c7', init: 'ش' },
];

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try { await login(email, password); navigate('/dashboard'); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  const L = ar.login;

  return (
    <div className="login-shell">

      {/* ── Brand panel (right in RTL) ── */}
      <div className="login-brand">
        {/* Glow orbs */}
        <div style={{ position:'absolute', top:'-100px', right:'-100px', width:'350px', height:'350px', borderRadius:'50%', background:'radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:'-80px', left:'-80px',  width:'300px', height:'300px', borderRadius:'50%', background:'radial-gradient(circle, rgba(124,58,237,0.14) 0%, transparent 70%)', pointerEvents:'none' }} />

        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:12, position:'relative', direction:'rtl' }}>
          <div style={{ width:40, height:40, borderRadius:10, background:'linear-gradient(135deg,#3b82f6,#7c3aed)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 12px rgba(59,130,246,0.4)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.75" width="20" height="20">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
          </div>
          <span style={{ color:'#fff', fontSize:18, fontWeight:800 }}>{ar.appName}</span>
        </div>

        {/* Hero text */}
        <div style={{ position:'relative', direction:'rtl' }}>
          <div style={{ fontSize:36, fontWeight:800, color:'#fff', lineHeight:1.3, marginBottom:16 }}>
            {L.heroTitle}<br />
            <span style={{ color:'rgba(255,255,255,0.4)' }}>{L.heroSub}</span>
          </div>
          <p style={{ color:'rgba(255,255,255,0.45)', fontSize:14, lineHeight:1.85, maxWidth:340 }}>
            {L.heroDesc}
          </p>

          {/* Workflow steps */}
          <div style={{ marginTop:36, display:'flex', flexDirection:'column', gap:12 }}>
            {L.steps.map((step, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:14, direction:'rtl' }}>
                <div className="step-number" style={{ width:26, height:26, borderRadius:'50%', background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.14)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, color:'rgba(255,255,255,0.55)', flexShrink:0 }}>{i+1}</div>
                <span style={{ fontSize:13.5, color:'rgba(255,255,255,0.6)', fontWeight:600 }}>{step}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ color:'rgba(255,255,255,0.18)', fontSize:12, position:'relative' }}>{L.footer}</div>
      </div>

      {/* ── Form panel (left in RTL) ── */}
      <div className="login-form-panel">
        <div style={{ width:'100%', maxWidth:380, direction:'rtl' }}>
          <div style={{ marginBottom:32 }}>
            <h2 style={{ fontSize:26, fontWeight:800, color:'#0f172a', marginBottom:6 }}>{L.formTitle}</h2>
            <p style={{ fontSize:14, color:'#64748b' }}>{L.formSubtitle}</p>
          </div>

          {error && (
            <div className="alert alert-error">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>{L.emailLabel}</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder={L.emailPlaceholder} required autoFocus style={{ direction:'ltr', textAlign:'right' }} />
            </div>
            <div className="form-group">
              <label>{L.passwordLabel}</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder={L.passwordPlaceholder} required />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}
              style={{ justifyContent:'center', padding:'11px 16px', fontSize:14, borderRadius:8, width:'100%' }}>
              {loading
                ? <><span className="spinner" style={{width:14,height:14,borderWidth:2}} />{L.signingIn}</>
                : L.submitBtn}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display:'flex', alignItems:'center', gap:12, margin:'28px 0 16px' }}>
            <div style={{ flex:1, height:1, background:'#e2e8f0' }} />
            <span style={{ fontSize:12, color:'#94a3b8', fontWeight:600 }}>{L.demoAccounts}</span>
            <div style={{ flex:1, height:1, background:'#e2e8f0' }} />
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            {DEMOS.map(d => (
              <button key={d.email}
                onClick={() => { setEmail(d.email); setPassword('password123'); setError(''); }}
                style={{ background:'#fff', border:'1.5px solid #e2e8f0', borderRadius:9, padding:'10px 12px', cursor:'pointer', textAlign:'right', display:'flex', alignItems:'center', gap:9, direction:'rtl', transition:'all 0.12s', fontFamily:'inherit' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor=d.color; e.currentTarget.style.background='#fafafa'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='#e2e8f0'; e.currentTarget.style.background='#fff'; }}>
                <div style={{ width:30, height:30, borderRadius:'50%', background:d.bg, color:d.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:800, flexShrink:0 }}>{d.init}</div>
                <div>
                  <div style={{ fontSize:12.5, fontWeight:700, color:'#0f172a', lineHeight:1.2 }}>{ar.login.demoRoles[d.roleKey]}</div>
                  <div style={{ fontSize:11, color:'#94a3b8', marginTop:1, direction:'ltr', textAlign:'right' }}>{d.email.split('@')[0]}</div>
                </div>
              </button>
            ))}
          </div>
          <p style={{ textAlign:'center', fontSize:11.5, color:'#94a3b8', marginTop:10 }}>
            {L.demoPassword} <code style={{ fontFamily:'monospace', background:'#f1f5f9', padding:'1px 5px', borderRadius:4, fontSize:11, direction:'ltr', display:'inline-block' }}>password123</code>
          </p>
        </div>
      </div>
    </div>
  );
}