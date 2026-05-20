import { FormEvent, useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';

const lbl: React.CSSProperties = {
  display: 'block', fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.2em',
  textTransform: 'uppercase', opacity: 0.8, color: '#374151', marginBottom: '0.75rem',
};
const inp: React.CSSProperties = {
  width: '100%', paddingTop: '0.5rem', paddingBottom: '0.5rem',
  borderTop: 'none', borderLeft: 'none', borderRight: 'none',
  borderBottom: '1px solid rgba(26,26,26,0.3)',
  background: 'transparent', outline: 'none',
  fontFamily: 'var(--font-serif)', fontSize: '1.125rem',
};
const sectionTitle: React.CSSProperties = {
  fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.2em',
  textTransform: 'uppercase', opacity: 0.7,
  marginBottom: '1.5rem', paddingBottom: '0.75rem',
  borderBottom: '1px solid rgba(26,26,26,0.1)',
};

export default function Settings() {
  const { user, token, refreshUser } = useAuth();
  const { t } = useLanguage();
  const [currency, setCurrency] = useState(user?.currency || 'UAH');
  const [financialPeriod, setFinancialPeriod] = useState(user?.financial_period || 'month');
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState('expense');
  const [catLoading, setCatLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setCategories(await res.json());
    } finally { setCatLoading(false); }
  };

  useEffect(() => { fetchCategories(); }, [token]);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currency, financial_period: financialPeriod }),
      });
      if (res.ok) await refreshUser();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleCreateCategory = async (e: FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newCatName, type: newCatType }),
      });
      if (res.ok) { setNewCatName(''); fetchCategories(); }
    } catch (e) { console.error(e); }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('Видалити категорію?')) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) fetchCategories();
    } catch (e) { console.error(e); }
  };

  const textBtn: React.CSSProperties = {
    background: 'none', border: 'none',
    borderBottom: '1px solid var(--border)',
    cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700,
    letterSpacing: '0.2em', textTransform: 'uppercase',
    paddingBottom: '2px', minHeight: '44px',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(1.25rem, 4vw, 2rem)', maxWidth: '56rem', margin: '0 auto' }}>

      <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
        <h1 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(1.75rem, 6vw, 2.5rem)',
          fontStyle: 'italic', letterSpacing: '-0.04em',
        }}>{t('settings.title')}</h1>
      </div>

      {/* ── Preferences ── */}
      <div style={{ border: '1px solid var(--border)', padding: 'clamp(1rem, 3vw, 2rem)', background: 'white' }}>
        <h3 style={sectionTitle}>{t('settings.preferences')}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          <div>
            <label style={lbl}>{t('settings.primary_currency')}</label>
            <select value={currency} onChange={e => setCurrency(e.target.value)} style={inp}>
              <option value="UAH">{t('settings.currency_uah')}</option>
              <option value="USD">{t('settings.currency_usd')}</option>
              <option value="EUR">{t('settings.currency_eur')}</option>
            </select>
          </div>
          <div>
            <label style={lbl}>{t('settings.reporting_period')}</label>
            <select value={financialPeriod} onChange={e => setFinancialPeriod(e.target.value)} style={inp}>
              <option value="month">{t('settings.period_month')}</option>
              <option value="quarter">{t('settings.period_quarter')}</option>
              <option value="year">{t('settings.period_year')}</option>
            </select>
          </div>
        </div>
        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={handleSaveSettings} disabled={saving} style={{ ...textBtn, opacity: saving ? 0.5 : 1 }}>
            {saving ? t('settings.committing') : t('settings.commit_changes')}
          </button>
        </div>
      </div>

      {/* ── Categories ── */}
      <div style={{ border: '1px solid var(--border)', padding: 'clamp(1rem, 3vw, 2rem)', background: 'white' }}>
        <h3 style={sectionTitle}>{t('settings.class_registry')}</h3>

        {/* Add form */}
        <form onSubmit={handleCreateCategory} style={{
          display: 'flex', gap: '1rem', alignItems: 'flex-end',
          marginBottom: '2rem', flexWrap: 'wrap',
        }}>
          <div style={{ flex: '2 1 160px', position: 'relative', paddingTop: '1.25rem' }}>
            <label style={{ ...lbl, position: 'absolute', top: 0, left: 0 }}>{t('settings.cat_entity')}</label>
            <input type="text" required placeholder={t('settings.cat_placeholder')}
              value={newCatName} onChange={e => setNewCatName(e.target.value)} style={inp} />
          </div>
          <div style={{ flex: '1 1 120px', position: 'relative', paddingTop: '1.25rem' }}>
            <label style={{ ...lbl, position: 'absolute', top: 0, left: 0 }}>{t('settings.cat_type')}</label>
            <select value={newCatType} onChange={e => setNewCatType(e.target.value)} style={inp}>
              <option value="expense">{t('settings.cat_expense')}</option>
              <option value="income">{t('settings.cat_income')}</option>
            </select>
          </div>
          <button type="submit" style={{
            ...textBtn, flexShrink: 0,
            display: 'flex', alignItems: 'center',
          }}>{t('settings.append')}</button>
        </form>

        {/* Category columns — side by side on tablet+, stacked on mobile */}
        <div className="cat-grid">
          {(['expense', 'income'] as const).map(type => (
            <div key={type}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
                marginBottom: '0.75rem', paddingBottom: '0.5rem',
                borderBottom: '1px solid rgba(26,26,26,0.1)',
                fontFamily: 'var(--font-serif)',
              }}>
                <span style={{ fontStyle: 'italic', fontSize: '1rem' }}>{t(`settings.cat_${type}`)}</span>
                <span style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.4 }}>
                  {t(type === 'expense' ? 'settings.outflow' : 'settings.inflow')}
                </span>
              </div>
              <div>
                {catLoading ? <div style={{ fontStyle: 'italic', opacity: 0.5, fontSize: '0.875rem' }}>…</div>
                  : categories.filter(c => c.type === type).map((cat: any) => (
                    <div key={cat.id} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '0.625rem 0',
                      borderBottom: '1px solid rgba(26,26,26,0.05)',
                      minHeight: '44px',
                    }}>
                      <span style={{ fontFamily: 'var(--font-serif)', fontSize: '0.95rem' }}>{cat.name}</span>
                      <button onClick={() => handleDeleteCategory(cat.id)} style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.15em',
                        textTransform: 'uppercase', color: 'var(--red)', minHeight: 'unset',
                        padding: '4px 8px',
                      }}>{t('settings.remove')}</button>
                    </div>
                  ))
                }
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .cat-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }
        @media (max-width: 500px) {
          .cat-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}
