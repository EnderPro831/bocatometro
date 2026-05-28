'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Menu, X, Trophy, BookOpen, AlignLeft, PlusCircle, Star, Moon, Sun } from 'lucide-react'

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'El Bocatómetro'

const NAV_LINKS = [
  { href: '/',             label: 'Inicio',       icon: BookOpen },
  { href: '/ranking',      label: 'Ranking',      icon: Trophy },
  { href: '/explorador',   label: 'Explorador',   icon: AlignLeft },
  { href: '/hall-of-fame', label: 'Hall of Fame', icon: Star },
]

export default function Navbar() {
  const [open, setOpen]         = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [dark, setDark]         = useState(false)
  const [session, setSession]   = useState<any>(null)
  const [supabase]              = useState(() => createClient())
  const [userName, setUserName] = useState<string | null>(null)
  const pathname                = usePathname()
  const router                  = useRouter()

  // Leer preferencia inicial
  useEffect(() => {
    const isDark =
      localStorage.getItem('theme') === 'dark' ||
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
    setDark(isDark)
    // Asegurarse de que el HTML tenga la clase correcta
    document.documentElement.classList.toggle('dark', isDark)
  }, [])

  // Scroll listener
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  // Authentication state
  useEffect(() => {
    let isMounted = true
    ;(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!isMounted) return
      setSession(session)
      setUserName(session?.user?.email ?? null)
    })()

    const { data } = supabase.auth.onAuthStateChange((_event: any, authSession: any) => {
      setSession(authSession)
      setUserName(authSession?.user?.email ?? null)
    })

    return () => {
      isMounted = false
      data.subscription?.unsubscribe()
    }
  }, [supabase])

  // Cerrar menú al cambiar de ruta
  useEffect(() => { setOpen(false) }, [pathname])

  const toggleDark = () => {
    const next = !dark
    setDark(next)
    // Aplicar clase al <html>
    document.documentElement.classList.toggle('dark', next)
    // Persistir
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      alert('No se pudo cerrar sesión. Intenta de nuevo.')
      console.error(error)
      return
    }
    setSession(null)
    router.push('/')
  }

  const navBg = scrolled
    ? 'rgba(250,246,238,0.95)'
    : 'rgba(250,246,238,0.85)'
  const navBgDark = scrolled
    ? 'rgba(20,16,8,0.96)'
    : 'rgba(20,16,8,0.85)'

  return (
    <header
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: dark ? navBgDark : navBg,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
        transition: 'background .3s, border-color .3s, box-shadow .3s',
        boxShadow: scrolled ? '0 1px 0 var(--border)' : 'none',
      }}
    >
      <div className="container-main">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr auto',
          alignItems: 'center',
          height: '64px',
          gap: '2rem',
          position: 'relative',
        }}>

          {/* Logo */}
          <Link
            href="/"
            style={{ display: 'flex', alignItems: 'center', gap: '.6rem', textDecoration: 'none', flexShrink: 0 }}
          >
            <div style={{ width: '36px', height: '36px', background: 'var(--red)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
              🥖
            </div>
            <span style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '1.3rem', color: 'var(--ink)', letterSpacing: '.04em', lineHeight: 1 }}>
              El <span style={{ color: 'var(--red)' }}>Bocató</span>metro
            </span>
          </Link>

          {/* Desktop links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '.15rem', justifySelf: 'center' }}>
            {NAV_LINKS.map(({ href, label }) => {
              const active = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  style={{
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '.8rem', fontWeight: 600,
                    color: active ? 'var(--red)' : 'var(--ink2)',
                    textDecoration: 'none', letterSpacing: '.03em',
                    padding: '.45rem .85rem', borderRadius: '8px',
                    background: active ? 'var(--red-light)' : 'transparent',
                    transition: 'background .15s, color .15s',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {label}
                </Link>
              )
            })}
          </nav>

          {/* Right actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', flexShrink: 0 }}>
            {/* Dark mode toggle */}
            <button
              onClick={toggleDark}
              aria-label={dark ? 'Modo claro' : 'Modo oscuro'}
              style={{
                width: '36px', height: '36px', borderRadius: '8px',
                border: '1px solid var(--border)', background: 'var(--cream2)',
                cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: 'var(--muted)',
                transition: 'all .2s', flexShrink: 0,
              }}
            >
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <Link
              href={session ? '/anadir' : '/login?redirect=/anadir'}
              className="btn-primary"
              style={{ padding: '.5rem 1rem', fontSize: '.78rem' }}
            >
              <PlusCircle size={14} />
              <span>{session ? 'Añadir bocata' : 'Iniciar sesión'}</span>
            </Link>

            {session ? (
              <button
                onClick={handleSignOut}
                className="btn-secondary"
                style={{ padding: '.5rem 1rem', fontSize: '.78rem' }}
              >
                Cerrar sesión
              </button>
            ) : (
              <Link href="/login" className="btn-secondary" style={{ padding: '.5rem 1rem', fontSize: '.78rem' }}>
                Iniciar sesión
              </Link>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setOpen(!open)}
              aria-label="Menú"
              style={{
                display: 'none',
                width: '36px', height: '36px', borderRadius: '8px',
                border: '1px solid var(--border)', background: 'transparent',
                cursor: 'pointer', alignItems: 'center',
                justifyContent: 'center', color: 'var(--ink2)',
              }}
              className="mobile-menu-btn"
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      <div
        style={{
          maxHeight: open ? '360px' : '0',
          overflow: 'hidden',
          transition: 'max-height .3s cubic-bezier(.22,1,.36,1)',
          borderTop: open ? '1px solid var(--border)' : 'none',
          background: 'var(--cream)',
        }}
      >
        <div
          className="container-main"
          style={{ paddingTop: '.75rem', paddingBottom: '.75rem', display: 'flex', flexDirection: 'column', gap: '.25rem' }}
        >
          {NAV_LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex', alignItems: 'center', gap: '.75rem',
                padding: '.75rem 1rem', borderRadius: '10px',
                textDecoration: 'none',
                fontFamily: 'Manrope, sans-serif', fontSize: '.88rem', fontWeight: 600,
                color: pathname === href ? 'var(--red)' : 'var(--ink2)',
                background: pathname === href ? 'var(--red-light)' : 'transparent',
                transition: 'background .15s',
              }}
            >
              <Icon size={17} />
              {label}
            </Link>
          ))}
          <Link
            href={session ? '/anadir' : '/login?redirect=/anadir'}
            style={{
              display: 'flex', alignItems: 'center', gap: '.75rem',
              padding: '.75rem 1rem', borderRadius: '10px',
              textDecoration: 'none',
              fontFamily: 'Manrope, sans-serif', fontSize: '.88rem', fontWeight: 700,
              color: '#fff', background: 'var(--red)',
              marginTop: '.25rem',
            }}
          >
            <PlusCircle size={17} />
            {session ? 'Añadir bocata' : 'Iniciar sesión'}
          </Link>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
          header .btn-primary span { display: none; }
        }
      `}</style>
    </header>
  )
}
