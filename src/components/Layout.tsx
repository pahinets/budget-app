import { ReactNode, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';

// SVG icons (inline, no dependency)
const icons = {
  overview: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  transactions: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M3 6h18M3 12h18M3 18h18"/>
    </svg>
  ),
  analytics: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M3 3v18h18"/><path d="M7 16l4-4 4 4 4-6"/>
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
    </svg>
  ),
  menu: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 6h18M3 12h18M3 18h18"/>
    </svg>
  ),
  close: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M18 6L6 18M6 6l12 12"/>
    </svg>
  ),
  logout: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
    </svg>
  ),
};

export default function Layout({ children }: { children: ReactNode }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language, setLanguage } = useLanguage();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const menuItems = [
    { name: t('layout.nav.overview'),     shortName: language === 'uk' ? 'Огляд'   : 'Overview', path: '/',             icon: icons.overview },
    { name: t('layout.nav.transactions'), shortName: language === 'uk' ? 'Записи'  : 'Ledger',   path: '/transactions', icon: icons.transactions },
    { name: t('layout.nav.analytics'),    shortName: language === 'uk' ? 'Аналіз'  : 'Charts',   path: '/analytics',    icon: icons.analytics },
    { name: t('layout.nav.settings'),     shortName: language === 'uk' ? 'Опції'   : 'Settings', path: '/settings',     icon: icons.settings },
  ];

  const handleLogout = () => {
    setDrawerOpen(false);
    logout();
    navigate('/login');
  };

  const initials = user?.email?.substring(0, 2).toUpperCase() || 'ОБ';

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--paper)',
      color: 'var(--ink)',
      fontFamily: 'var(--font-sans)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: 'clamp(1rem, 3vw, 2rem)',
      paddingBottom: 'calc(clamp(1rem, 3vw, 2rem) + 0px)',
    }}>

      {/* ── Main shell ── */}
      <div style={{
        width: '100%',
        maxWidth: '72rem',
        display: 'flex',
        flexDirection: 'column',
        border: '8px solid white',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        background: 'var(--paper)',
        flex: 1,
        minHeight: 0,
      }}>

        {/* ── Header ── */}
        <header style={{
          borderBottom: '1px solid var(--border)',
          padding: 'clamp(0.75rem, 2vw, 1.5rem)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          background: 'white',
          position: 'relative',
        }}>
          {/* Top row on mobile: lang switch + avatar + hamburger */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: '0.75rem',
          }}>
            {/* Lang switch */}
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              fontSize: '0.625rem',
              fontWeight: 700,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              alignItems: 'center',
            }}>
              {(['uk', 'en'] as const).map((lang, i) => (
                <span key={lang} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {i > 0 && <span style={{ opacity: 0.4 }}>|</span>}
                  <button
                    onClick={() => setLanguage(lang)}
                    style={{
                      opacity: language === lang ? 1 : 0.4,
                      textDecoration: language === lang ? 'underline' : 'none',
                      background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700,
                      minHeight: 'unset', padding: '2px 4px',
                    }}
                  >{lang.toUpperCase()}</button>
                </span>
              ))}
            </div>

            {/* Avatar — always visible */}
            <div style={{
              width: '2rem', height: '2rem',
              background: 'var(--ink)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white',
              fontFamily: 'var(--font-serif)',
              fontSize: '0.75rem',
              flexShrink: 0,
            }}>{initials}</div>

            {/* Logout button — mobile only, shown instead of hamburger */}
            <button
              onClick={handleLogout}
              className="mobile-logout-btn"
              aria-label="Вийти"
              title={t('layout.sign_out')}
              style={{
                display: 'none',
                background: 'none', border: '1px solid rgba(153,27,27,0.35)',
                cursor: 'pointer', padding: '5px 8px',
                minHeight: 'unset', borderRadius: '2px',
                alignItems: 'center', gap: '5px',
                color: 'var(--red)',
              }}
            >
              {/* Exit icon */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
              </svg>
            </button>

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setDrawerOpen(true)}
              style={{
                display: 'none',
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '4px', minHeight: 'unset',
              }}
              className="hamburger-btn"
              aria-label="Відкрити меню"
            >
              <div style={{ width: 24, height: 24 }}>{icons.menu}</div>
            </button>
          </div>

          {/* Bottom row: title + user email (desktop) */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            gap: '1rem',
          }}>
            <div>
              <div style={{
                fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.2em',
                textTransform: 'uppercase', opacity: 0.8, marginBottom: '0.25rem', color: '#4b5563',
              }}>{t('layout.subtitle')}</div>
              <h1 style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(1.75rem, 5vw, 3rem)',
                fontStyle: 'italic',
                letterSpacing: '-0.04em',
                lineHeight: 1,
              }}>{t('layout.title')}</h1>
            </div>

            {/* User email — desktop only */}
            <div style={{ textAlign: 'right', flexShrink: 0 }} className="header-user-block">
              <span style={{
                display: 'block', fontSize: '0.625rem',
                fontWeight: 700, opacity: 0.8, color: '#4b5563',
              }}>{t('layout.user_profile')}</span>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem' }}>
                {user?.email}
              </span>
            </div>
          </div>
        </header>

        {/* ── Body ── */}
        <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>

          {/* ── Desktop Sidebar ── */}
          <aside style={{
            width: '16rem',
            borderRight: '1px solid var(--border)',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: 'var(--paper)',
            flexShrink: 0,
          }} className="desktop-sidebar">
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div>
                <div style={{
                  fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.2em',
                  textTransform: 'uppercase', opacity: 0.8, color: '#4b5563', marginBottom: '1rem',
                }}>{t('layout.nav')}</div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontFamily: 'var(--font-serif)', fontSize: '1.25rem' }}>
                  {menuItems.map((item) => {
                    const active = location.pathname === item.path;
                    return (
                      <li key={item.path} style={{ opacity: active ? 1 : 0.7 }}>
                        <Link to={item.path} style={{
                          textDecoration: active ? 'underline' : 'none',
                          textUnderlineOffset: '4px',
                          fontWeight: active ? 600 : 400,
                        }}>{item.name}</Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div>
                <div style={{
                  fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.2em',
                  textTransform: 'uppercase', opacity: 0.8, color: '#4b5563', marginBottom: '0.5rem',
                }}>{t('layout.system')}</div>
                <button
                  onClick={handleLogout}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontFamily: 'var(--font-serif)', fontSize: '1.125rem',
                    color: 'var(--red)', minHeight: 'unset',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
                  onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
                >{t('layout.sign_out')}</button>
              </div>
            </nav>
          </aside>

          {/* ── Mobile Drawer ── */}
          {drawerOpen && (
            <div
              onClick={() => setDrawerOpen(false)}
              style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
                zIndex: 80,
              }}
            />
          )}
          <div style={{
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            width: 'min(280px, 85vw)',
            background: 'white',
            borderLeft: '1px solid var(--border)',
            zIndex: 90,
            padding: '1.5rem',
            paddingBottom: 'calc(1.5rem + 60px + env(safe-area-inset-bottom, 0px))',
            display: 'flex',
            flexDirection: 'column',
            gap: '2rem',
            overflowY: 'auto',
            transform: drawerOpen ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 0.25s ease',
          }} className="mobile-drawer">
            {/* Drawer header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.6, marginBottom: 4 }}>
                  {t('layout.user_profile')}
                </div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '0.9rem', fontStyle: 'italic' }}>{user?.email}</div>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, minHeight: 'unset' }}
              >
                <div style={{ width: 20, height: 20 }}>{icons.close}</div>
              </button>
            </div>

            {/* Lang switcher in drawer */}
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em' }}>
              {(['uk', 'en'] as const).map(lang => (
                <button key={lang}
                  onClick={() => setLanguage(lang)}
                  style={{
                    background: language === lang ? 'var(--ink)' : 'none',
                    color: language === lang ? 'white' : 'var(--ink)',
                    border: '1px solid var(--ink)',
                    cursor: 'pointer',
                    padding: '4px 12px',
                    fontWeight: 700,
                    fontSize: '0.7rem',
                    letterSpacing: '0.15em',
                  }}
                >{lang.toUpperCase()}</button>
              ))}
            </div>

            {/* Nav items */}
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.6, marginBottom: '0.75rem' }}>
                {t('layout.nav')}
              </div>
              {menuItems.map(item => {
                const active = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setDrawerOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 0',
                      borderBottom: '1px solid rgba(26,26,26,0.07)',
                      fontFamily: 'var(--font-serif)',
                      fontSize: '1.25rem',
                      fontWeight: active ? 600 : 400,
                      opacity: active ? 1 : 0.65,
                      textDecoration: active ? 'underline' : 'none',
                      textUnderlineOffset: '4px',
                    }}
                  >
                    <div style={{ width: 18, height: 18, flexShrink: 0 }}>{item.icon}</div>
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Logout */}
            <button
              onClick={handleLogout}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--red)',
                fontFamily: 'var(--font-serif)', fontSize: '1.125rem',
                padding: '0.5rem 0',
                marginTop: 'auto',
              }}
            >
              <div style={{ width: 18, height: 18 }}>{icons.logout}</div>
              {t('layout.sign_out')}
            </button>
          </div>

          {/* ── Main content ── */}
          <main style={{
            flex: 1,
            overflowY: 'auto',
            padding: 'clamp(1rem, 3vw, 2rem)',
            background: 'var(--paper)',
            /* Extra bottom padding so content isn't hidden behind mobile nav */
            paddingBottom: 'max(clamp(1rem, 3vw, 2rem), calc(var(--mobile-nav-height) + 1rem))',
          }}>
            {children}
          </main>
        </div>


      </div>

      {/* ── Mobile bottom tab bar ── */}
      <nav className="mobile-bottom-nav">
        {menuItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={location.pathname === item.path ? 'active' : ''}
          >
            {item.icon}
            {item.shortName}
          </Link>
        ))}
      </nav>

      {/* ── Responsive CSS injected ── */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
          .hamburger-btn { display: flex !important; }
          .header-user-block { display: none !important; }
          .mobile-logout-btn { display: flex !important; }
        }
        @media (min-width: 769px) {
          .mobile-drawer { display: none !important; }
        }
      `}</style>
    </div>
  );
}