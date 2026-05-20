// src/pages/Transactions.tsx
import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { format } from 'date-fns';
import { uk, enUS } from 'date-fns/locale';

const lbl: React.CSSProperties = {
  display: 'block', fontSize: '0.625rem', fontWeight: 700,
  letterSpacing: '0.2em', textTransform: 'uppercase',
  opacity: 0.9, color: '#374151', marginBottom: '0.5rem',
};
const inp: React.CSSProperties = {
  width: '100%', paddingTop: '0.5rem', paddingBottom: '0.5rem',
  borderTop: 'none', borderLeft: 'none', borderRight: 'none',
  borderBottom: '1px solid rgba(26,26,26,0.3)',
  background: 'transparent', outline: 'none',
  fontFamily: 'var(--font-serif)', fontSize: '1.125rem',
};
const td: React.CSSProperties = {
  padding: '0.75rem 0.5rem',
  fontFamily: 'var(--font-serif)', fontSize: '0.875rem',
};

// Small compact input for filter panel
const filterInp: React.CSSProperties = {
  width: '100%', padding: '0.4rem 0',
  borderTop: 'none', borderLeft: 'none', borderRight: 'none',
  borderBottom: '1px solid rgba(26,26,26,0.25)',
  background: 'transparent', outline: 'none',
  fontFamily: 'var(--font-serif)', fontSize: '0.875rem',
};

type SortBy = 'date' | 'amount';
type SortOrder = 'DESC' | 'ASC';

interface Filters {
  search: string;
  filterType: string;
  categoryId: string;
  startDate: string;
  endDate: string;
  amountMin: string;
  amountMax: string;
}

export default function Transactions() {
  const { token } = useAuth();
  const { t, language } = useLanguage();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [categories, setCategories]     = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);
  const [isFormOpen, setIsFormOpen]     = useState(false);
  const [filtersOpen, setFiltersOpen]   = useState(false);

  const [formData, setFormData] = useState({
    type: 'expense', amount: '', category_id: '',
    date: format(new Date(), 'yyyy-MM-dd'), description: '',
  });

  const [filters, setFilters] = useState<Filters>({
    search: '',
    filterType: 'all',
    categoryId: '',
    startDate: '',
    endDate: '',
    amountMin: '',
    amountMax: '',
  });

  const [sortBy, setSortBy]       = useState<SortBy>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('DESC');

  const dateLocale = language === 'uk' ? uk : enUS;

  const activeFilterCount = [
    filters.filterType !== 'all',
    filters.categoryId !== '',
    filters.startDate !== '',
    filters.endDate !== '',
    filters.amountMin !== '',
    filters.amountMax !== '',
  ].filter(Boolean).length;

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search)      params.set('search',      filters.search);
      if (filters.filterType !== 'all') params.set('type', filters.filterType);
      if (filters.categoryId)  params.set('category_id', filters.categoryId);
      if (filters.startDate)   params.set('start_date',  filters.startDate);
      if (filters.endDate)     params.set('end_date',    filters.endDate);
      if (filters.amountMin)   params.set('amount_min',  filters.amountMin);
      if (filters.amountMax)   params.set('amount_max',  filters.amountMax);
      params.set('sort_by',    sortBy);
      params.set('sort_order', sortOrder);

      const [txRes, catRes] = await Promise.all([
        fetch(`/api/transactions?${params}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/categories',             { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (txRes.ok && catRes.ok) {
        setTransactions(await txRes.json());
        setCategories(await catRes.json());
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [filters, sortBy, sortOrder, token]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setIsFormOpen(false);
        setFormData({ ...formData, amount: '', description: '' });
        fetchData();
      }
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Видалити транзакцію?')) return;
    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchData();
    } catch (e) { console.error(e); }
  };

  const toggleSort = (field: SortBy) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'DESC' ? 'ASC' : 'DESC');
    } else {
      setSortBy(field);
      setSortOrder('DESC');
    }
  };

  const resetFilters = () => {
    setFilters({ search: '', filterType: 'all', categoryId: '', startDate: '', endDate: '', amountMin: '', amountMax: '' });
  };

  const filteredCats = categories.filter(c => c.type === formData.type);
  const sortArrow = (field: SortBy) => {
    if (sortBy !== field) return <span style={{ opacity: 0.2 }}>↕</span>;
    return <span style={{ opacity: 0.8 }}>{sortOrder === 'DESC' ? '↓' : '↑'}</span>;
  };

  const sectionLbl: React.CSSProperties = {
    fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.2em',
    textTransform: 'uppercase', opacity: 0.5, marginBottom: '0.75rem',
    display: 'block',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', fontStyle: 'italic', letterSpacing: '-0.04em' }}>
          {t('transactions.title')}
        </h1>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-serif)', fontSize: '1.125rem', textDecoration: 'underline', textUnderlineOffset: '4px' }}
        >
          {isFormOpen ? t('transactions.close_form') : t('transactions.add_record')}
        </button>
      </div>

      {/* ── Add form ── */}
      {isFormOpen && (
        <div style={{ border: '1px solid var(--border)', padding: '1.5rem', background: 'white' }}>
          <div style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.8, marginBottom: '1.5rem' }}>
            {t('transactions.new_record')}
          </div>
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
              <button type="button" onClick={() => setIsFormOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.8 }}>
                {t('transactions.cancel')}
              </button>
              <button type="submit" style={{ background: 'none', border: 'none', borderBottom: '1px solid var(--border)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', paddingBottom: '2px' }}>
                {t('transactions.save_record')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Search bar + filter toggle ── */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
        <div style={{ flex: 1 }}>
          <input
            type="text"
            placeholder={t('transactions.search_desc')}
            value={filters.search}
            onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            style={{ ...inp, fontSize: '0.875rem', paddingLeft: '0.25rem' }}
          />
        </div>

        {/* Filter toggle button */}
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          style={{
            background: filtersOpen ? 'var(--ink)' : 'none',
            color: filtersOpen ? 'white' : 'var(--ink)',
            border: '1px solid var(--ink)',
            cursor: 'pointer',
            padding: '0.4rem 1rem',
            fontSize: '0.625rem',
            fontWeight: 700,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            position: 'relative',
          }}
        >
          {t('transactions.filters')}
          {activeFilterCount > 0 && (
            <span style={{
              position: 'absolute', top: '-7px', right: '-7px',
              background: '#991b1b', color: 'white',
              borderRadius: '50%', width: '16px', height: '16px',
              fontSize: '9px', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* ── Filter panel ── */}
      {filtersOpen && (
        <div style={{ border: '1px solid var(--border)', padding: '1.5rem', background: 'white', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>

          {/* Type */}
          <div>
            <span style={sectionLbl}>{t('transactions.op_type')}</span>
            <select
              value={filters.filterType}
              onChange={e => setFilters(f => ({ ...f, filterType: e.target.value, categoryId: '' }))}
              style={filterInp}
            >
              <option value="all">{t('transactions.all_records')}</option>
              <option value="income">{t('transactions.inc_only')}</option>
              <option value="expense">{t('transactions.exp_only')}</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <span style={sectionLbl}>{t('transactions.category_label')}</span>
            <select
              value={filters.categoryId}
              onChange={e => setFilters(f => ({ ...f, categoryId: e.target.value }))}
              style={filterInp}
            >
              <option value="">{t('transactions.all_categories')}</option>
              {categories
                .filter(c => filters.filterType === 'all' || c.type === filters.filterType)
                .map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* Date range */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={sectionLbl}>{t('transactions.date_range')}</span>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                type="date"
                value={filters.startDate}
                onChange={e => setFilters(f => ({ ...f, startDate: e.target.value }))}
                style={{ ...filterInp, width: '50%' }}
              />
              <span style={{ opacity: 0.4, fontSize: '0.75rem' }}>—</span>
              <input
                type="date"
                value={filters.endDate}
                onChange={e => setFilters(f => ({ ...f, endDate: e.target.value }))}
                style={{ ...filterInp, width: '50%' }}
              />
            </div>
          </div>

          {/* Amount range */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={sectionLbl}>{t('transactions.amount_range')}</span>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder={t('transactions.amount_from')}
                value={filters.amountMin}
                onChange={e => setFilters(f => ({ ...f, amountMin: e.target.value }))}
                style={{ ...filterInp, width: '50%' }}
              />
              <span style={{ opacity: 0.4, fontSize: '0.75rem' }}>—</span>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder={t('transactions.amount_to')}
                value={filters.amountMax}
                onChange={e => setFilters(f => ({ ...f, amountMax: e.target.value }))}
                style={{ ...filterInp, width: '50%' }}
              />
            </div>
          </div>

          {/* Reset button */}
          {activeFilterCount > 0 && (
            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={resetFilters}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--red)', borderBottom: '1px solid var(--red)', paddingBottom: '2px' }}
              >
                {t('transactions.reset_filters')}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Table ── */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            {/* Sortable: Date */}
            <th
              onClick={() => toggleSort('date')}
              style={{ ...td, textAlign: 'left', fontStyle: 'italic', opacity: 0.7, fontWeight: 600, cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}
            >
              {t('transactions.th_date')} {sortArrow('date')}
            </th>
            <th style={{ ...td, textAlign: 'left', fontStyle: 'italic', opacity: 0.7, fontWeight: 600 }}>
              {t('transactions.th_category')}
            </th>
            <th style={{ ...td, textAlign: 'left', fontStyle: 'italic', opacity: 0.7, fontWeight: 600 }}>
              {t('transactions.th_entity')}
            </th>
            {/* Sortable: Amount */}
            <th
              onClick={() => toggleSort('amount')}
              style={{ ...td, textAlign: 'right', fontStyle: 'italic', opacity: 0.7, fontWeight: 600, cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}
            >
              {t('transactions.th_amount')} {sortArrow('amount')}
            </th>
            <th style={{ ...td, textAlign: 'right', fontStyle: 'italic', opacity: 0.7, fontWeight: 600 }}>
              {t('transactions.th_action')}
            </th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={5} style={{ ...td, textAlign: 'center', fontStyle: 'italic', opacity: 0.6 }}>{t('transactions.loading')}</td></tr>
          ) : transactions.length === 0 ? (
            <tr><td colSpan={5} style={{ ...td, textAlign: 'center', fontStyle: 'italic', opacity: 0.6 }}>{t('transactions.no_records')}</td></tr>
          ) : (
            transactions.map((tx: any) => (
              <tr key={tx.id} style={{ borderBottom: '1px solid rgba(26,26,26,0.1)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.02)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <td style={td}>{format(new Date(tx.date), 'MMM dd, yyyy', { locale: dateLocale })}</td>
                <td style={{ ...td, fontStyle: 'italic', fontSize: '0.75rem', opacity: 0.7 }}>{tx.category_name}</td>
                <td style={td}>{tx.description || <span style={{ opacity: 0.4, fontStyle: 'italic' }}>{t('transactions.unspecified')}</span>}</td>
                <td style={{ ...td, textAlign: 'right', color: tx.type === 'expense' ? 'var(--red)' : 'var(--green)', fontVariantNumeric: 'tabular-nums' }}>
                  {tx.type === 'expense' ? '(' : '+'}{Number(tx.amount).toLocaleString('uk-UA', { minimumFractionDigits: 2 })}{tx.type === 'expense' ? ')' : ''}
                </td>
                <td style={{ ...td, textAlign: 'right' }}>
                  <button
                    onClick={() => handleDelete(tx.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--red)' }}
                  >
                    {t('transactions.del')}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* ── Results count ── */}
      {!loading && transactions.length > 0 && (
        <div style={{ textAlign: 'right', fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.4 }}>
          {transactions.length} {t('transactions.records_found')}
        </div>
      )}
    </div>
  );
}
