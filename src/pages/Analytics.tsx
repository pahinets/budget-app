import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { format, subMonths } from 'date-fns';
import { uk, enUS } from 'date-fns/locale';

export default function Analytics() {
  const { token, user } = useAuth();
  const { t, language } = useLanguage();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(user?.financial_period || 'month');
  const dateLocale = language === 'uk' ? uk : enUS;

  useEffect(() => {
    const now = new Date();
    const months = period === 'year' ? 12 : period === 'quarter' ? 3 : 1;
    const startDate = format(subMonths(now, months), 'yyyy-MM-dd');
    setLoading(true);
    fetch(`/api/transactions?start_date=${startDate}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : [])
      .then(data => setTransactions(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [period, token]);

  if (loading) return <div style={{ padding: '2rem', fontStyle: 'italic', opacity: 0.6 }}>{t('analytics.loading')}</div>;

  const expenses = transactions.filter(tx => tx.type === 'expense');
  const totalExpenses = expenses.reduce((a, c) => a + Number(c.amount), 0);

  const expByCategory = expenses.reduce((acc: Record<string, number>, curr) => {
    const name = curr.category_name || t('dashboard.unspecified');
    acc[name] = (acc[name] || 0) + Number(curr.amount);
    return acc;
  }, {});
  const pieData = Object.entries(expByCategory)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const chartMap = transactions.reduce((acc: Record<string, any>, curr) => {
    const label = period === 'year'
      ? format(new Date(curr.date), 'MMM yy', { locale: dateLocale })
      : format(new Date(curr.date), 'MMM dd', { locale: dateLocale });
    if (!acc[label]) acc[label] = { name: label, income: 0, expense: 0, _ts: new Date(curr.date).getTime() };
    if (curr.type === 'income')  acc[label].income  += Number(curr.amount);
    if (curr.type === 'expense') acc[label].expense += Number(curr.amount);
    return acc;
  }, {});
  const barData = Object.values(chartMap).sort((a: any, b: any) => a._ts - b._ts);

  const lbl: React.CSSProperties = {
    fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.2em',
    textTransform: 'uppercase', opacity: 0.8, marginBottom: '0.75rem', display: 'block',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(1.5rem, 4vw, 2rem)' }}>

      {/* ── Header ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        borderBottom: '1px solid var(--border)', paddingBottom: '1rem',
        flexWrap: 'wrap', gap: '0.75rem',
      }}>
        <h1 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(1.75rem, 6vw, 2.5rem)',
          fontStyle: 'italic', letterSpacing: '-0.04em',
        }}>{t('analytics.title')}</h1>
        <select value={period} onChange={e => setPeriod(e.target.value)} style={{
          padding: '0.5rem 0',
          borderTop: 'none', borderLeft: 'none', borderRight: 'none',
          borderBottom: '1px solid rgba(26,26,26,0.3)',
          background: 'transparent', outline: 'none',
          fontFamily: 'var(--font-serif)', fontSize: '0.9rem',
          textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.8,
          minHeight: '44px',
        }}>
          <option value="month">{t('analytics.trail_month')}</option>
          <option value="quarter">{t('analytics.trail_quarter')}</option>
          <option value="year">{t('analytics.trail_year')}</option>
        </select>
      </div>

      {transactions.length === 0 ? (
        <div style={{
          border: '1px solid var(--border)', padding: '2rem',
          textAlign: 'center', background: 'white',
          fontFamily: 'var(--font-serif)', fontStyle: 'italic', opacity: 0.6,
        }}>{t('analytics.no_records')}</div>
      ) : (
        /* ── Charts: stacked on mobile, side-by-side on desktop ── */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(1rem, 3vw, 2rem)' }}>

          {/* Grid wrapper — 2 col on wide, 1 col on mobile */}
          <div className="analytics-grid">

            {/* Bar chart */}
            <div style={{ border: '1px solid var(--border)', padding: 'clamp(1rem, 3vw, 1.5rem)', background: 'white' }}>
              <span style={lbl}>{t('analytics.period_dynamics')}</span>
              <div style={{ height: 'clamp(14rem, 45vw, 18rem)', marginTop: '1rem' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false}
                      tick={{ fontSize: 10, fill: '#1A1A1A', opacity: 0.6 }} />
                    <YAxis axisLine={false} tickLine={false}
                      tick={{ fontSize: 10, fill: '#1A1A1A', opacity: 0.6 }} />
                    <Tooltip
                      cursor={{ fill: '#000', opacity: 0.05 }}
                      contentStyle={{ border: '1px solid #1A1A1A', borderRadius: 0, background: '#fff', fontSize: '0.75rem' }}
                    />
                    <Legend iconType="rect" wrapperStyle={{ paddingTop: '1.25rem', fontSize: '0.7rem' }} />
                    <Bar dataKey="income"  name={t('analytics.income')}  fill="#1A1A1A" maxBarSize={30} />
                    <Bar dataKey="expense" name={t('analytics.expense')} fill="#991b1b" maxBarSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Expense distribution */}
            <div style={{ border: '1px solid var(--border)', padding: 'clamp(1rem, 3vw, 1.5rem)', background: 'white' }}>
              <span style={lbl}>{t('analytics.exp_distribution')}</span>
              {pieData.length === 0 ? (
                <div style={{ marginTop: '1.5rem', fontFamily: 'var(--font-serif)', fontStyle: 'italic', opacity: 0.6 }}>
                  {t('analytics.no_recorded_exp')}
                </div>
              ) : (
                <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', fontFamily: 'var(--font-serif)' }}>
                  {pieData.map(entry => {
                    const pct = totalExpenses > 0 ? (entry.value / totalExpenses) * 100 : 0;
                    return (
                      <div key={entry.name}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.25rem', gap: '0.5rem' }}>
                          <span style={{ fontStyle: 'italic', fontSize: 'clamp(0.85rem, 3vw, 1rem)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {entry.name}
                          </span>
                          <span style={{ fontSize: '0.8rem', opacity: 0.8, flexShrink: 0 }}>
                            {pct.toFixed(1)}%
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ flex: 1, height: '2px', background: 'rgba(26,26,26,0.08)' }}>
                            <div style={{ height: '100%', background: 'var(--ink)', width: `${pct}%` }} />
                          </div>
                          <span style={{ fontSize: '0.75rem', opacity: 0.65, flexShrink: 0 }}>
                            {entry.value.toLocaleString('uk-UA')} {user?.currency || 'UAH'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .analytics-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: clamp(1rem, 3vw, 2rem);
        }
        @media (max-width: 640px) {
          .analytics-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
