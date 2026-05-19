import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { format } from 'date-fns';
import { uk, enUS } from 'date-fns/locale';

const lbl: React.CSSProperties = { display: 'block', fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.9, color: '#374151', marginBottom: '0.5rem' };
const inp: React.CSSProperties = { width: '100%', paddingTop: '0.5rem', paddingBottom: '0.5rem', borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: '1px solid rgba(26,26,26,0.3)', background: 'transparent', outline: 'none', fontFamily: 'var(--font-serif)', fontSize: '1.125rem' };
const td: React.CSSProperties = { padding: '0.75rem 0.5rem', fontFamily: 'var(--font-serif)', fontSize: '0.875rem' };

export default function Transactions() {
  const { token } = useAuth();
  const { t, language } = useLanguage();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [categories, setCategories]     = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);
  const [isFormOpen, setIsFormOpen]     = useState(false);
  const [formData, setFormData] = useState({ type: 'expense', amount: '', category_id: '', date: format(new Date(), 'yyyy-MM-dd'), description: '' });
  const [search, setSearch]         = useState('');
  const [filterType, setFilterType] = useState('all');
  const dateLocale = language === 'uk' ? uk : enUS;

  const fetchData = async () => {
    try {
      const [txRes, catRes] = await Promise.all([
        fetch(`/api/transactions?search=${search}&type=${filterType === 'all' ? '' : filterType}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/categories', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (txRes.ok && catRes.ok) {
        setTransactions(await txRes.json());
        setCategories(await catRes.json());
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [search, filterType, token]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(formData) });
      if (res.ok) { setIsFormOpen(false); setFormData({ ...formData, amount: '', description: '' }); fetchData(); }
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Видалити транзакцію?')) return;
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) fetchData();
    } catch (e) { console.error(e); }
  };

  const filteredCats = categories.filter(c => c.type === formData.type);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', fontStyle: 'italic', letterSpacing: '-0.04em' }}>{t('transactions.title')}</h1>
        <button onClick={() => setIsFormOpen(!isFormOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-serif)', fontSize: '1.125rem', textDecoration: 'underline', textUnderlineOffset: '4px' }}>
          {isFormOpen ? t('transactions.close_form') : t('transactions.add_record')}
        </button>
      </div>

      {isFormOpen && (
        <div style={{ border: '1px solid var(--border)', padding: '1.5rem', background: 'white' }}>
          <div style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.8, marginBottom: '1.5rem' }}>{t('transactions.new_record')}</div>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label style={lbl}>{t('transactions.op_type')}</label>
              <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value, category_id: '' })} style={inp}>
                <option value="expense">{t('transactions.expense')}</option>
                <option value="income">{t('transactions.income')}</option>
              </select>
            </div>
            <div>
              <label style={lbl}>{t('transactions.category_label')}</label>
              <select value={formData.category_id} onChange={e => setFormData({ ...formData, category_id: e.target.value })} required style={inp}>
                <option value="">{t('transactions.select_category')}</option>
                {filteredCats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>{t('transactions.amount_label')}</label>
              <input type="number" step="0.01" min="0" required value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} style={inp} placeholder="0.00" />
            </div>
            <div>
              <label style={lbl}>{t('transactions.date_label')}</label>
              <input type="date" required value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} style={inp} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={lbl}>{t('transactions.desc_label')}</label>
              <input type="text" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} style={inp} placeholder={t('transactions.optional')} />
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '1.5rem', marginTop: '1rem' }}>
              <button type="button" onClick={() => setIsFormOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.8 }}>{t('transactions.cancel')}</button>
              <button type="submit" style={{ background: 'none', border: 'none', borderBottom: '1px solid var(--border)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', paddingBottom: '2px' }}>{t('transactions.save_record')}</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <input type="text" placeholder={t('transactions.search_desc')} value={search} onChange={e => setSearch(e.target.value)} style={{ ...inp, maxWidth: '28rem', paddingLeft: '0.25rem' }} />
        <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ ...inp, width: 'auto', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.7 }}>
          <option value="all">{t('transactions.all_records')}</option>
          <option value="income">{t('transactions.inc_only')}</option>
          <option value="expense">{t('transactions.exp_only')}</option>
        </select>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            {[t('transactions.th_date'), t('transactions.th_category'), t('transactions.th_entity'), t('transactions.th_amount'), t('transactions.th_action')].map((h, i) => (
              <th key={h} style={{ ...td, textAlign: i >= 3 ? 'right' : 'left', fontStyle: 'italic', opacity: 0.7, fontWeight: 600 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading
            ? <tr><td colSpan={5} style={{ ...td, textAlign: 'center', fontStyle: 'italic', opacity: 0.6 }}>{t('transactions.loading')}</td></tr>
            : transactions.length === 0
              ? <tr><td colSpan={5} style={{ ...td, textAlign: 'center', fontStyle: 'italic', opacity: 0.6 }}>{t('transactions.no_records')}</td></tr>
              : transactions.map((tx: any) => (
                <tr key={tx.id} style={{ borderBottom: '1px solid rgba(26,26,26,0.1)' }}>
                  <td style={td}>{format(new Date(tx.date), 'MMM dd, yyyy', { locale: dateLocale })}</td>
                  <td style={{ ...td, fontStyle: 'italic', fontSize: '0.75rem', opacity: 0.7 }}>{tx.category_name}</td>
                  <td style={td}>{tx.description || <span style={{ opacity: 0.4, fontStyle: 'italic' }}>{t('transactions.unspecified')}</span>}</td>
                  <td style={{ ...td, textAlign: 'right', color: tx.type === 'expense' ? 'var(--red)' : 'inherit' }}>
                    {tx.type === 'expense' ? '(' : ''}{Number(tx.amount).toLocaleString('uk-UA', { minimumFractionDigits: 2 })}{tx.type === 'expense' ? ')' : ''}
                  </td>
                  <td style={{ ...td, textAlign: 'right' }}>
                    <button onClick={() => handleDelete(tx.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--red)' }}>
                      {t('transactions.del')}
                    </button>
                  </td>
                </tr>
              ))
          }
        </tbody>
      </table>
    </div>
  );
}
