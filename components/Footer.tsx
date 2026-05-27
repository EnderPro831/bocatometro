import Link from 'next/link'

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'El Bocatómetro'

const COLS = [
  {
    title: 'Explorar',
    links: [
      ['/', 'Inicio'],
      ['/ranking', 'Ranking global'],
      ['/explorador', 'Explorador A–Z'],
      ['/hall-of-fame', 'Hall of Fame'],
    ],
  },
  {
    title: 'Contribuir',
    links: [
      ['/anadir', 'Añadir bocata'],
    ],
  },
  {
    title: 'La plataforma',
    links: [
      ['/', 'Sobre el proyecto'],
      ['/', 'Cómo puntuamos'],
    ],
  },
]

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--card)',
      color: 'var(--ink)',
      padding: '4rem 0 2rem',
      marginTop: '5rem',
    }}>
      <div className="container-main">

        {/* Top grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.5fr 1fr 1fr 1fr',
          gap: '2.5rem',
          marginBottom: '3rem',
        }}>

          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', marginBottom: '1rem' }}>
              <div style={{
                width: '32px', height: '32px',
                background: 'var(--red)', borderRadius: '7px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '16px', flexShrink: 0,
              }}>
                🥖
              </div>
              <span style={{
                fontFamily: '"Bebas Neue", sans-serif',
                fontSize: '1.3rem', letterSpacing: '.04em',
                color: 'var(--ink)',
              }}>
                {siteName}
              </span>
            </div>
            <p style={{
              fontFamily: 'Lora, serif',
              fontStyle: 'italic',
              fontSize: '.85rem',
              color: 'var(--muted)',
              lineHeight: 1.7,
            }}>
              Rankings y reviews de bocatas con criterio y humor.
            </p>
          </div>

          {/* Nav columns */}
          {COLS.map(({ title, links }) => (
            <div key={title}>
              <p style={{
                fontSize: '.65rem', fontWeight: 700,
                letterSpacing: '.12em', textTransform: 'uppercase',
                color: 'var(--muted)',
                marginBottom: '.9rem',
                fontFamily: 'Manrope, sans-serif',
              }}>
                {title}
              </p>
              {links.map(([href, label]) => (
                <Link
                  key={label}
                  href={href}
                  className="footer-link"
                  style={{
                    display: 'block',
                    fontSize: '.82rem',
                    color: 'var(--ink2)',
                    textDecoration: 'none',
                    marginBottom: '.5rem',
                    fontFamily: 'Manrope, sans-serif',
                    transition: 'color .2s',
                  }}
                >
                  {label}
                </Link>
              ))}
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: '1px solid var(--border)',
          paddingTop: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '.5rem',
        }}>
          <span style={{
            fontSize: '.75rem',
            color: 'var(--muted)',
            fontFamily: 'Manrope, sans-serif',
          }}>
            © {new Date().getFullYear()} {siteName} · Hecho con 🥖 y obsesión culinaria
          </span>
          <span style={{
            fontSize: '.75rem',
            color: 'var(--muted)',
            fontFamily: 'Lora, serif',
            fontStyle: 'italic',
          }}>
            Ningún bocata fue malherido en el proceso (algunos sí)
          </span>
        </div>
      </div>

      {/* Hover effect para los links del footer — CSS puro, sin JS */}
      <style>{`
        .footer-link:hover { color: var(--ink) !important; }

        @media (max-width: 768px) {
          footer .container-main > div:first-child {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 480px) {
          footer .container-main > div:first-child {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  )
}
