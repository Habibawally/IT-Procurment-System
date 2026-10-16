import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layout, StatusBadge, PriorityBadge, Loading, Empty } from '../components/shared';
import { api } from '../api/client';
import { timeAgo } from '../utils';
import { ar, itemTypeAr } from '../i18n';

const R = ar.requests;

const FILTERS = [
  { key:'', label: R.filterAll },
  { key:'pending_manager',     label: R.filters.pending_manager },
  { key:'pending_it',          label: R.filters.pending_it },
  { key:'pending_procurement', label: R.filters.pending_procurement },
  { key:'completed',           label: R.filters.completed },
  { key:'rejected',            label: R.filters.rejected },
];

export default function Requests() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [all, setAll]       = useState([]);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  // Load everything once; status filter and search are applied locally so
  // the per-status counts on the filter buttons stay correct.
  useEffect(() => {
    api.getRequests()
      .then(setAll).catch(err => setError(err.message)).finally(() => setLoading(false));
  }, []);

  const q = search.trim().toLowerCase();
  const shown = all.filter(r =>
    (!filter || r.status === filter) && (
      !q ||
      r.title.toLowerCase().includes(q) ||
      (r.item_type || '').toLowerCase().includes(q) ||
      itemTypeAr(r.item_type).includes(q)
    )
  );

  return (
    <Layout>
      <div className="page-header">
        <div>
          <div className="page-title">{R.title}</div>
          <div className="page-subtitle">{shown.length} {R.of} {all.length} {R.requestsWord}</div>
        </div>
        {user?.role === 'employee' && (
          <button className="btn-primary" onClick={() => navigate('/requests/new')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" style={{display:'block'}}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            {R.newRequest}
          </button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Search */}
      <div className="search-box">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={R.searchPlaceholder} />
      </div>

      {/* Filters */}
      <div className="filter-bar">
        {FILTERS.map(f => (
          <button key={f.key} className={`filter-btn${filter === f.key ? ' active' : ''}`} onClick={() => setFilter(f.key)}>
            {f.label}
            {f.key && all.filter(r => r.status === f.key).length > 0 &&
              <span className="filter-count">{all.filter(r => r.status === f.key).length}</span>}
          </button>
        ))}
      </div>

      <div className="card" style={{ padding:0, overflow:'hidden' }}>
        {loading
          ? <div style={{padding:'20px 0'}}><Loading /></div>
          : shown.length === 0
            ? <Empty title={search ? R.noMatch : R.empty} sub={search ? R.tryDifferent : undefined} />
            : (
              <div className="table-wrap">
                <table>
                  <thead><tr>
                    <th style={{paddingRight:20}}>{R.cols.request}</th>
                    {user?.role !== 'employee' && <th>{R.cols.requestedBy}</th>}
                    <th>{R.cols.type}</th>
                    <th>{R.cols.priority}</th>
                    <th>{R.cols.status}</th>
                    <th style={{paddingLeft:20}}>{R.cols.created}</th>
                  </tr></thead>
                  <tbody>
                    {shown.map(r => (
                      <tr key={r.id} className="clickable" onClick={() => navigate(`/requests/${r.id}`)}>
                        <td style={{paddingRight:20, maxWidth:280}}>
                          <div style={{fontWeight:700, color:'#0f172a', fontSize:13.5}}>{r.title}</div>
                          <div className="ltr" style={{fontSize:11, color:'#94a3b8', marginTop:2}}>#{r.id}</div>
                        </td>
                        {user?.role !== 'employee' && (
                          <td>
                            <div style={{display:'flex', alignItems:'center', gap:8, flexDirection:'row-reverse'}}>
                              <div style={{width:26, height:26, borderRadius:'50%', background:'#f1f5f9', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, color:'#64748b', flexShrink:0}}>
                                {(r.requester_name || '?').charAt(0)}
                              </div>
                              <span style={{fontSize:13, color:'#334155', fontWeight:600}}>{r.requester_name}</span>
                            </div>
                          </td>
                        )}
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
    </Layout>
  );
}