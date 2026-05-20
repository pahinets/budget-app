import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { format } from 'date-fns';
import { uk, enUS } from 'date-fns/locale';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function Dashboard() {
  const { user, token } = useAuth();
  const { t, language } = useLanguage();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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

  const lbl: React.CSSProperties = {
    fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.2em',
    textTransform: 'uppercase', opacity: 0.7, display: 'block', marginBottom: '0.5rem',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(1.5rem, 4vw, 3rem)' }}>

      {/* ── Liquidity bar ── */}
      <div style={{
        borderBottom: '1px solid var(--border)',
        paddingBottom: 'clamp(1rem, 3vw, 2rem)',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        gap: '1.5rem',
      }}>
        <div>
          <span style={lbl}>{t('dashboard.net_liquidity')}</span>
          <span style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(2.5rem, 10vw, 5rem)',
            letterSpacing: '-0.04em',
            lineHeight: 1,
          }}>
            {balance.toLocaleString('uk-UA')}
            <span style={{
              fontSize: 'clamp(1rem, 4vw, 2rem)',
              opacity: 0.7, color: '#6b7280', marginLeft: '0.5rem',
            }}>{user?.currency || 'UAH'}</span>
          </span>
        </div>

        {/* Income / Expense stats — full width on mobile */}
        <div style={{ display: 'flex', gap: 'clamp(1rem, 4vw, 2rem)', flexWrap: 'wrap' }}>
          {[
            { key: 'dashboard.monthly_inc', val: `+${totalIncome.toLocaleString('uk-UA')}`, color: 'inherit' },
            { key: 'dashboard.monthly_exp', val: `−${totalExpense.toLocaleString('uk-UA')}`, color: 'var(--red)' },
          ].map(({ key, val, color }) => (
            <div key={key} style={{
              background: 'white',
              border: '1px solid rgba(26,26,26,0.12)',
              padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1rem, 3vw, 1.5rem)',
              minWidth: 'clamp(130px, 30vw, 160px)',
            }}>
              <span style={lbl}>{t(key)}</span>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.1rem, 4vw, 1.5rem)', color }}>{val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Recent activity ── */}
      <div>
        <h3 style={{ ...lbl, marginBottom: '1.5rem' }}>{t('dashboard.recent_activity')}</h3>
        {transactions.length === 0
          ? <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', opacity: 0.6 }}>{t('dashboard.no_activity')}</div>
          : (
            <div>
              {/* Mobile: card list */}
              <div className="tx-card-list">
                {transactions.slice(0, 5).map((tx: any) => (
                  <div key={tx.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.875rem 0',
                    borderBottom: '1px solid rgba(26,26,26,0.09)',
                    gap: '0.75rem',
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontFamily: 'var(--font-serif)', fontSize: '0.95rem',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {tx.description || <span style={{ opacity: 0.4, fontStyle: 'italic' }}>{t('dashboard.unspecified')}</span>}
                      </div>
                      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2px' }}>
                        <span style={{ fontSize: '0.7rem', opacity: 0.55, fontStyle: 'italic' }}>{tx.category_name}</span>
                        <span style={{ fontSize: '0.7rem', opacity: 0.45 }}>
                          {format(new Date(tx.date), 'MMM dd', { locale: dateLocale })}
                        </span>
                      </div>
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: 'clamp(0.875rem, 3vw, 1rem)',
                      color: tx.type === 'expense' ? 'var(--red)' : 'inherit',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}>
                      {tx.type === 'expense' ? '(' : ''}{Number(tx.amount).toLocaleString('uk-UA')}{tx.type === 'expense' ? ')' : ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
      </div>

      {/* ── Chart ── */}
      <div style={{ border: '1px solid var(--border)', padding: 'clamp(1rem, 3vw, 1.5rem)', background: 'white' }}>
        <h3 style={{ ...lbl, marginBottom: '2rem' }}>{t('dashboard.cashflow_dynamics')}</h3>
        <div style={{ height: 'clamp(12rem, 40vw, 16rem)' }}>
          {chartData.length === 0
            ? <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontStyle: 'italic', opacity: 0.4 }}>{t('dashboard.insufficient_data')}</div>
            : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#1A1A1A', opacity: 0.6 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#1A1A1A', opacity: 0.6 }} />
                  <Tooltip cursor={{ fill: '#000', opacity: 0.05 }} contentStyle={{ border: '1px solid #1A1A1A', borderRadius: 0, background: '#fff', fontSize: '0.8rem' }} />
                  <Bar dataKey="income"  name={t('dashboard.income_label')}  fill="#1A1A1A" maxBarSize={30} />
                  <Bar dataKey="expense" name={t('dashboard.expense_label')} fill="#991b1b" maxBarSize={30} />
                </BarChart>
              </ResponsiveContainer>
            )
          }
        </div>
      </div>

      {/* ── Insight ── */}
      <div style={{ borderLeft: '4px solid var(--ink)', padding: 'clamp(1rem, 3vw, 1.5rem)', background: 'rgba(26,26,26,0.05)' }}>
        <h3 style={{ ...lbl, marginBottom: '0.5rem' }}>{t('dashboard.financial_insight')}</h3>
        <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 'clamp(0.95rem, 3vw, 1.125rem)', lineHeight: 1.6 }}>
          {balance >= 0 ? t('dashboard.insight_positive') : t('dashboard.insight_negative')}
        </p>
      </div>
    </div>
  );
}
