import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { format } from 'date-fns';
import { uk, enUS } from 'date-fns/locale';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return width;
}

export default function Dashboard() {
  const { user, token } = useAuth();
  const { t, language } = useLanguage();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const width = useWindowWidth();
  
  const isMobile = width < 768;
  const dateLocale = language === 'uk' ? uk : enUS;

  useEffect(() => {
    fetch('/api/transactions?sort_by=date&sort_order=DESC', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : [])
      .then(data => setTransactions(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  const totalIncome  = transactions.filter(t => t.type === 'income') .reduce((a, c) => a + Number(c.amount), 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((a, c) => a + Number(c.amount), 0);
  const balance = totalIncome - totalExpense;

  const chartData = transactions.reduce((acc: any[], curr) => {
    const label = format(new Date(curr.date), 'MMM dd', { locale: dateLocale });
    const ex = acc.find(i => i.name === label);
    if (ex) {
      if (curr.type === 'income')  ex.income  += Number(curr.amount);
      if (curr.type === 'expense') ex.expense += Number(curr.amount);
    } else {
      acc.push({ name: label, income: curr.type==='income' ? Number(curr.amount) : 0, expense: curr.type==='expense' ? Number(curr.amount) : 0 });
    }
    return acc;
  }, []).reverse();

  if (loading) return <div style={{ padding: '2rem', fontStyle: 'italic' }}>{t('dashboard.loading')}</div>;

  const lbl: React.CSSProperties = { fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.7, display: 'block', marginBottom: '0.5rem' };
  const td: React.CSSProperties = { padding: '0.75rem 0.5rem', fontFamily: 'var(--font-serif)', fontSize: '0.875rem', borderBottom: '1px solid rgba(26,26,26,0.1)' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '1.5rem' : '3rem' }}>
      
      {/* ── Liquidity bar ── */}
      <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '2rem', display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'flex-end', gap: '1.5rem' }}>
        <div>
          <span style={lbl}>{t('dashboard.net_liquidity')}</span>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: isMobile ? '2.5rem' : '5rem', letterSpacing: '-0.04em', lineHeight: 1, display: 'block' }}>
            {balance.toLocaleString('uk-UA')}
            <span style={{ fontSize: isMobile ? '1.25rem' : '2rem', opacity: 0.7, color: '#6b7280', marginLeft: '0.5rem' }}>{user?.currency || 'UAH'}</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: '2rem', width: isMobile ? '100%' : 'auto', justifyContent: 'space-between' }}>
          {[
            { key: 'dashboard.monthly_inc', val: `+${totalIncome.toLocaleString('uk-UA')}`, color: 'inherit' },
            { key: 'dashboard.monthly_exp', val: `-${totalExpense.toLocaleString('uk-UA')}`, color: 'var(--red)' },
          ].map(({ key, val, color }) => (
            <div key={key}>
              <span style={lbl}>{t(key)}</span>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: isMobile ? '1.25rem' : '1.5rem', color }}>{val}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: isMobile ? '2rem' : '3rem' }}>
        
        {/* ── Recent activity ── */}
        <div>
          <h3 style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.8, marginBottom: '1.5rem' }}>{t('dashboard.recent_activity')}</h3>
          {transactions.length === 0
            ? <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', opacity: 0.6 }}>{t('dashboard.no_activity')}</div>
            : isMobile ? (
              /* ОПТИМІЗОВАНИЙ МОБІЛЬНИЙ КАРТКОВИЙ ВИГЛЯД ЗАМІСТЬ ТАБЛИЦІ */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {transactions.slice(0, 5).map((tx: any) => (
                  <div key={tx.id} style={{ padding: '1rem', border: '1px solid var(--border)', background: 'white', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 600, fontSize: '1rem' }}>{tx.category_name}</span>
                      <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, color: tx.type === 'expense' ? 'var(--red)' : 'inherit' }}>
                        {tx.type === 'expense' ? '-' : '+'}{Number(tx.amount).toLocaleString('uk-UA')}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', opacity: 0.6, fontStyle: 'italic' }}>
                      <span>{tx.description || t('dashboard.unspecified')}</span>
                      <span>{format(new Date(tx.date), 'MMM dd', { locale: dateLocale })}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* КЛАСИЧНА ДЕСКТОПНА ТАБЛИЦЯ */
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', opacity: 0.7, fontStyle: 'italic', fontFamily: 'var(--font-serif)', fontSize: '0.875rem' }}>
                    {[t('dashboard.date'), t('dashboard.category'), t('dashboard.entity'), t('dashboard.amount')].map(h => (
                      <th key={h} style={{ textAlign: h === t('dashboard.amount') ? 'right' : 'left', padding: '0.5rem 0.5rem', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice(0, 5).map((tx: any) => (
                    <tr key={tx.id}>
                      <td style={td}>{format(new Date(tx.date), 'MMM dd', { locale: dateLocale })}</td>
                      <td style={{ ...td, fontStyle: 'italic', fontSize: '0.75rem', opacity: 0.8 }}>{tx.category_name}</td>
                      <td style={td}>{tx.description || <span style={{ opacity: 0.4, fontStyle: 'italic' }}>{t('dashboard.unspecified')}</span>}</td>
                      <td style={{ ...td, textAlign: 'right', color: tx.type === 'expense' ? 'var(--red)' : 'inherit' }}>
                        {tx.type === 'expense' ? '(' : ''}{Number(tx.amount).toLocaleString('uk-UA')}{tx.type === 'expense' ? ')' : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
        </div>

        {/* ── Chart ── */}
        <div style={{ border: '1px solid var(--border)', padding: isMobile ? '1rem' : '1.5rem', background: 'white' }}>
          <h3 style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.8, marginBottom: '2rem' }}>{t('dashboard.cashflow_dynamics')}</h3>
          <div style={{ height: isMobile ? '12rem' : '16rem' }}>
            {chartData.length === 0
              ? <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontStyle: 'italic', opacity: 0.4 }}>{t('dashboard.insufficient_data')}</div>
              : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 0, right: 0, left: isMobile ? -30 : -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#1A1A1A', opacity: 0.6 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#1A1A1A', opacity: 0.6 }} />
                    <Tooltip cursor={{ fill: '#000', opacity: 0.05 }} contentStyle={{ border: '1px solid #1A1A1A', borderRadius: 0, background: '#fff' }} />
                    <Bar dataKey="income"  name={t('dashboard.income_label')}  fill="#1A1A1A" maxBarSize={isMobile ? 12 : 30} />
                    <Bar dataKey="expense" name={t('dashboard.expense_label')} fill="#991b1b" maxBarSize={isMobile ? 12 : 30} />
                  </BarChart>
                </ResponsiveContainer>
              )
            }
          </div>
        </div>

        {/* ── Insight ── */}
        <div style={{ borderLeft: '4px solid var(--ink)', padding: '1.5rem', background: 'rgba(26,26,26,0.05)' }}>
          <h3 style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.8, marginBottom: '0.5rem' }}>{t('dashboard.financial_insight')}</h3>
          <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: isMobile ? '1rem' : '1.125rem', lineHeight: 1.6 }}>
            {balance >= 0 ? t('dashboard.insight_positive') : t('dashboard.insight_negative')}
          </p>
        </div>
      </div>
    </div>
  );
}