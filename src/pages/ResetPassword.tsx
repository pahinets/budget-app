import { useState, FormEvent } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';

const inp: React.CSSProperties = {
  width: '100%', paddingTop: '0.5rem', paddingBottom: '0.5rem',
  borderTop: 'none', borderLeft: 'none', borderRight: 'none',
  borderBottom: '1px solid rgba(26,26,26,0.3)',
  background: 'transparent', outline: 'none',
  fontFamily: 'var(--font-serif)', fontSize: '1.25rem',
};

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError(t('auth.pass_mismatch') || 'Паролі не збігаються'); return; }
    if (!token) { setError('Токен відновлення відсутній'); return; }

    setError(''); setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setError(data.error || 'Не вдалося скинути пароль');
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
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', fontStyle: 'italic', letterSpacing: '-0.04em' }}>Новий пароль</h2>
        </div>

        {success ? (
          <div style={{ textAlign: 'center', fontFamily: 'var(--font-serif)' }}>
            <div style={{ padding: '1rem', border: '1px solid var(--border)', background: '#f0fdf4', color: '#166534', fontSize: '0.875rem', fontStyle: 'italic', marginBottom: '1.5rem' }}>
              Пароль успішно змінено! Перенаправлення до входу...
            </div>
            <Link to="/login" style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', textDecoration: 'underline' }}>Увійти зараз</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {error && <div style={{ padding: '1rem', border: '1px solid var(--border)', background: '#fef2f2', color: '#991b1b', fontSize: '0.875rem', fontStyle: 'italic', fontFamily: 'var(--font-serif)', textAlign: 'center' }}>{error}</div>}

            <div>
              <label style={{ display: 'block', fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.9, color: '#374151', marginBottom: '0.5rem' }}>Новий пароль</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} style={inp} placeholder="••••••••" />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.9, color: '#374151', marginBottom: '0.5rem' }}>{t('auth.verify_passphrase') || 'Підтвердіть пароль'}</label>
              <input type="password" required value={confirm} onChange={e => setConfirm(e.target.value)} style={inp} placeholder="••••••••" />
            </div>

            <button type="submit" disabled={loading || !token} style={{ padding: '1rem', background: 'var(--ink)', color: 'white', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: (loading || !token) ? 0.5 : 1 }}>
              {loading ? t('auth.processing') : 'Зберегти пароль'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}