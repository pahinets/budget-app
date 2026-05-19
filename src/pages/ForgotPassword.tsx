import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';

const inp: React.CSSProperties = {
  width: '100%', paddingTop: '0.5rem', paddingBottom: '0.5rem',
  borderTop: 'none', borderLeft: 'none', borderRight: 'none',
  borderBottom: '1px solid rgba(26,26,26,0.3)',
  background: 'transparent', outline: 'none',
  fontFamily: 'var(--font-serif)', fontSize: '1.25rem',
};

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(''); setMessage(''); setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || 'Інструкції надіслано на вашу пошту.');
      } else {
        setError(data.error || 'Помилка виконання запиту');
      }
    } catch {
      setError('Немає підключення до сервера');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--paper)', padding: '3rem 1rem' }}>
      <div style={{ maxWidth: '28rem', width: '100%', background: 'white', border: '1px solid var(--border)', padding: '3rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', opacity: 0.8, color: '#374151', marginBottom: '1rem' }}>{t('auth.ledger')}</div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', fontStyle: 'italic', letterSpacing: '-0.04em' }}>Відновлення доступу</h2>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {error && <div style={{ padding: '1rem', border: '1px solid var(--border)', background: '#fef2f2', color: '#991b1b', fontSize: '0.875rem', fontStyle: 'italic', fontFamily: 'var(--font-serif)', textAlign: 'center' }}>{error}</div>}
          {message && <div style={{ padding: '1rem', border: '1px solid var(--border)', background: '#f0fdf4', color: '#166534', fontSize: '0.875rem', fontStyle: 'italic', fontFamily: 'var(--font-serif)', textAlign: 'center' }}>{message}</div>}

          <div>
            <label style={{ display: 'block', fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.9, color: '#374151', marginBottom: '0.5rem' }}>{t('auth.identity')}</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} style={inp} placeholder={t('auth.identity_placeholder')} />
          </div>

          <button type="submit" disabled={loading} style={{ padding: '1rem', background: 'var(--ink)', color: 'white', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: loading ? 0.5 : 1 }}>
            {loading ? t('auth.processing') : 'Скинути пароль'}
          </button>

          <div style={{ textAlign: 'center', fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '0.875rem' }}>
            <Link to="/login" style={{ fontFamily: 'var(--font-sans)', fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', borderBottom: '1px solid var(--ink)', paddingBottom: '2px' }}>
              Повернутись до входу
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}