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

  const lbl: React.CSSProperties = { fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.8, marginBottom: '0.5rem' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', fontStyle: 'italic', letterSpacing: '-0.04em' }}>{t('analytics.title')}</h1>
        <select value={period} onChange={e => setPeriod(e.target.value)}
          style={{ padding: '0.5rem 0', borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: '1px solid rgba(26,26,26,0.3)', background: 'transparent', outline: 'none', fontFamily: 'var(--font-serif)', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.8 }}>
          <option value="month">{t('analytics.trail_month')}</option>
          <option value="quarter">{t('analytics.trail_quarter')}</option>
          <option value="year">{t('analytics.trail_year')}</option>
        </select>
      </div>

      {transactions.length === 0 ? (
        <div style={{ border: '1px solid var(--border)', padding: '2rem', textAlign: 'center', background: 'white', fontFamily: 'var(--font-serif)', fontStyle: 'italic', opacity: 0.6 }}>
          {t('analytics.no_records')}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* ── Bar chart ── */}
          <div style={{ border: '1px solid var(--border)', padding: '1.5rem', background: 'white' }}>
            <h3 style={lbl}>{t('analytics.period_dynamics')}</h3>
            <div style={{ height: '18rem', marginTop: '2rem' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#1A1A1A', opacity: 0.6 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#1A1A1A', opacity: 0.6 }} />
                  <Tooltip cursor={{ fill: '#000', opacity: 0.05 }} contentStyle={{ border: '1px solid #1A1A1A', borderRadius: 0, background: '#fff' }} />
                  <Legend iconType="rect" wrapperStyle={{ paddingTop: '1.25rem', fontSize: '0.75rem' }} />
                  <Bar dataKey="income"  name={t('analytics.income')}  fill="#1A1A1A" maxBarSize={30} />
                  <Bar dataKey="expense" name={t('analytics.expense')} fill="#991b1b" maxBarSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ── Expense distribution ── */}
          <div style={{ border: '1px solid var(--border)', padding: '1.5rem', background: 'white' }}>
            <h3 style={lbl}>{t('analytics.exp_distribution')}</h3>
            {pieData.length === 0 ? (
              <div style={{ marginTop: '2rem', fontFamily: 'var(--font-serif)', fontStyle: 'italic', opacity: 0.6 }}>{t('analytics.no_recorded_exp')}</div>
            ) : (
              <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', fontFamily: 'var(--font-serif)' }}>
                {pieData.map(entry => {
                  const pct = totalExpenses > 0 ? (entry.value / totalExpenses) * 100 : 0;
                  return (
                    <div key={entry.name}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.25rem' }}>
                        <span style={{ fontStyle: 'italic', fontSize: '1rem' }}>{entry.name}</span>
                        <span style={{ fontSize: '0.875rem', opacity: 0.8 }}>
                          {pct.toFixed(1)}%
                          <span style={{ fontSize: '0.75rem', marginLeft: '0.5rem', opacity: 0.7 }}>
                            ({entry.value.toLocaleString('uk-UA')} {user?.currency || 'UAH'})
                          </span>
                        </span>
                      </div>
                      <div style={{ width: '100%', height: '2px', background: 'rgba(26,26,26,0.08)' }}>
                        <div style={{ height: '100%', background: 'var(--ink)', width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
