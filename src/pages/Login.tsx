// src/pages/Login.tsx
import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';

const inp: React.CSSProperties = {
  width: '100%', paddingTop: '0.5rem', paddingBottom: '0.5rem',
  borderTop: 'none', borderLeft: 'none', borderRight: 'none',
  borderBottom: '1px solid rgba(26,26,26,0.3)',
  background: 'transparent', outline: 'none',
  fontFamily: 'var(--font-serif)', fontSize: '1.25rem',
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) { login(data.token, data.user); navigate('/'); }
      else setError(data.error || 'Помилка входу');
    } catch { setError('Немає підключення до сервера'); }
    finally { setLoading(false); }
  };

  const langBtn = (lang: 'uk' | 'en') => ({
    opacity: language === lang ? 1 : 0.4,
    textDecoration: language === lang ? 'underline' : 'none',
    background: 'none', border: 'none', cursor: 'pointer',
    fontWeight: 700, fontSize: '0.625rem', letterSpacing: '0.2em',
  } as React.CSSProperties);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--paper)', padding: '3rem 1rem', position: 'relative' }}>
      <div style={{ position: 'absolute', top: '1rem', right: '1.5rem', display: 'flex', gap: '0.5rem' }}>
        <button style={langBtn('uk')} onClick={() => setLanguage('uk')}>UK</button>
        <span style={{ opacity: 0.4 }}>|</span>
        <button style={langBtn('en')} onClick={() => setLanguage('en')}>EN</button>
      </div>

      <div style={{ maxWidth: '28rem', width: '100%', background: 'white', border: '1px solid var(--border)', padding: '3rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', opacity: 0.8, color: '#374151', marginBottom: '1rem' }}>{t('auth.ledger')}</div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '3rem', fontStyle: 'italic', letterSpacing: '-0.04em' }}>{t('auth.login_title')}</h2>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {error && <div style={{ padding: '1rem', border: '1px solid var(--border)', background: '#fef2f2', color: '#991b1b', fontSize: '0.875rem', fontStyle: 'italic', fontFamily: 'var(--font-serif)', textAlign: 'center' }}>{error}</div>}

          <div>
            <label style={{ display: 'block', fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.9, color: '#374151', marginBottom: '0.5rem' }}>{t('auth.identity')}</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} style={inp} placeholder={t('auth.identity_placeholder')} />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.9, color: '#374151' }}>{t('auth.passphrase')}</label>
              <Link
                to="/forgot-password"
                style={{ fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', opacity: 0.5, borderBottom: '1px solid rgba(26,26,26,0.3)', paddingBottom: '1px' }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '0.5')}
              >
                {t('auth.forgot_link')}
              </Link>
            </div>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} style={inp} placeholder={t('auth.passphrase_placeholder')} />
          </div>

          <button type="submit" disabled={loading} style={{ padding: '1rem', background: 'var(--ink)', color: 'white', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: loading ? 0.5 : 1 }}>
            {loading ? t('auth.processing') : t('auth.enter_system')}
          </button>

          <div style={{ textAlign: 'center', fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '0.875rem' }}>
            <span style={{ opacity: 0.8, color: '#374151' }}>{t('auth.lacking_clearance')}</span>{' '}
            <Link to="/register" style={{ fontFamily: 'var(--font-sans)', fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', borderBottom: '1px solid var(--ink)', paddingBottom: '2px', marginLeft: '0.5rem' }}>
              {t('auth.initialize')}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
