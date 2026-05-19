import { ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    minHeight: '100vh',
    background: 'var(--paper)',
    color: 'var(--ink)',
    fontFamily: 'var(--font-sans)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '2rem',
  },
  inner: {
    width: '100%',
    maxWidth: '72rem',
    display: 'flex',
    flexDirection: 'column',
    border: '8px solid white',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
    background: 'var(--paper)',
    flex: 1,
  },
  header: {
    borderBottom: '1px solid var(--border)',
    padding: '1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: '1rem',
    background: 'white',
    position: 'relative',
  },
  langSwitch: {
    position: 'absolute',
    top: '1rem',
    right: '1.5rem',
    display: 'flex',
    gap: '0.5rem',
    fontSize: '0.625rem',
    fontWeight: 700,
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: '0.625rem',
    fontWeight: 700,
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    opacity: 0.8,
    marginBottom: '0.25rem',
    color: '#4b5563',
  },
  title: {
    fontFamily: 'var(--font-serif)',
    fontSize: '3rem',
    fontStyle: 'italic',
    letterSpacing: '-0.04em',
    lineHeight: 1,
  },
  body: {
    flex: 1,
    display: 'flex',
    minHeight: 0,
  },
  aside: {
    width: '16rem',
    borderRight: '1px solid var(--border)',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    background: 'var(--paper)',
    flexShrink: 0,
  },
  navLabel: {
    fontSize: '0.625rem',
    fontWeight: 700,
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    opacity: 0.8,
    color: '#4b5563',
    marginBottom: '1rem',
  },
  main: {
    flex: 1,
    overflowY: 'auto',
    padding: '2rem',
    background: 'var(--paper)',
  },
  footer: {
    borderTop: '1px solid var(--border)',
    padding: '1rem 1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.5625rem',
    fontWeight: 700,
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    opacity: 0.7,
    color: '#4b5563',
    background: 'var(--paper)',
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language, setLanguage } = useLanguage();

  const menuItems = [
    { name: t('layout.nav.overview'),      path: '/'             },
    { name: t('layout.nav.transactions'),  path: '/transactions' },
    { name: t('layout.nav.analytics'),     path: '/analytics'    },
    { name: t('layout.nav.settings'),      path: '/settings'     },
  ];

  return (
    <div style={styles.wrap}>
      <div style={styles.inner}>
        {/* ── Header ── */}
        <header style={styles.header}>
          <div style={styles.langSwitch}>
            <button
              onClick={() => setLanguage('uk')}
              style={{ opacity: language === 'uk' ? 1 : 0.4, textDecoration: language === 'uk' ? 'underline' : 'none', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}
            >UK</button>
            <span style={{ opacity: 0.4 }}>|</span>
            <button
              onClick={() => setLanguage('en')}
              style={{ opacity: language === 'en' ? 1 : 0.4, textDecoration: language === 'en' ? 'underline' : 'none', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}
            >EN</button>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <div style={styles.subtitle}>{t('layout.subtitle')}</div>
            <h1 style={styles.title}>{t('layout.title')}</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <div style={{ textAlign: 'right' }}>
              <span style={{ display: 'block', fontSize: '0.625rem', fontWeight: 700, opacity: 0.8, color: '#4b5563' }}>
                {t('layout.user_profile')}
              </span>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.125rem' }}>
                {user?.email}
              </span>
            </div>
            <div style={{
              width: '3rem', height: '3rem',
              background: 'var(--ink)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white',
              fontFamily: 'var(--font-serif)',
              fontSize: '1.25rem',
              textTransform: 'uppercase',
              flexShrink: 0,
            }}>
              {user?.email?.substring(0, 2) || 'OM'}
            </div>
          </div>
        </header>

        {/* ── Body ── */}
        <div style={styles.body}>
          {/* ── Sidebar ── */}
          <aside style={styles.aside}>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div>
                <div style={styles.navLabel}>{t('layout.nav')}</div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontFamily: 'var(--font-serif)', fontSize: '1.25rem' }}>
                  {menuItems.map((item) => {
                    const active = location.pathname === item.path;
                    return (
                      <li key={item.path} style={{ opacity: active ? 1 : 0.7 }}>
                        <Link to={item.path} style={{ textDecoration: active ? 'underline' : 'none', textUnderlineOffset: '4px', fontWeight: active ? 600 : 400 }}>
                          {item.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div>
                <div style={styles.navLabel}>{t('layout.system')}</div>
                <button
                  onClick={() => { logout(); navigate('/login'); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-serif)', fontSize: '1.125rem', color: 'var(--red)', textDecoration: 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
                  onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
                >
                  {t('layout.sign_out')}
                </button>
              </div>
            </nav>
            <div style={{ paddingTop: '1.5rem', borderTop: '1px solid var(--border)', marginTop: '2rem' }}>
              <span style={{ fontSize: '0.625rem', fontWeight: 700, opacity: 0.8, color: '#4b5563', display: 'block' }}>
                {t('layout.db_status')}
              </span>
              <span style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                <span style={{ width: '0.5rem', height: '0.5rem', background: '#166534', borderRadius: '50%', display: 'inline-block' }} />
                {t('layout.db_stable')}
              </span>
            </div>
          </aside>

          {/* ── Main ── */}
          <main style={styles.main}>{children}</main>
        </div>

        {/* ── Footer ── */}
        <footer style={styles.footer}>
          <div>{t('layout.footer_stack')}</div>
          <div>{t('layout.footer_copy')}</div>
        </footer>
      </div>
    </div>
  );
}
