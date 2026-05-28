'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [supabase] = useState(() => createClient())
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams?.get('redirect') ?? '/'

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!mounted) return
      if (session) router.push(redirectTo)
    })()
    return () => { mounted = false }
  }, [redirectTo, router, supabase])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)
    if (error) {
      setError('No se pudo iniciar sesión. Verifica tus credenciales.')
      return
    }

    router.push(redirectTo)
  }

  return (
    <main className="container-main" style={{ padding: '5rem 1rem' }}>
      <div className="page-shell" style={{ maxWidth: '520px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '1rem' }}>Iniciar sesión</h1>
        <p style={{ marginBottom: '1.5rem', color: 'var(--muted)' }}>
          Esta plataforma solo admite usuarios autorizados. Si no tienes acceso, solicita las credenciales al administrador.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
          <label style={{ display: 'grid', gap: '.5rem' }}>
            <span>Correo electrónico</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
              className="input-field"
            />
          </label>

          <label style={{ display: 'grid', gap: '.5rem' }}>
            <span>Contraseña</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              autoComplete="current-password"
              className="input-field"
            />
          </label>

          {error ? <p style={{ color: 'var(--red)', marginTop: 0 }}>{error}</p> : null}

          <button type="submit" className="btn-primary" style={{ minHeight: '3rem' }} disabled={loading}>
            {loading ? 'Validando...' : 'Entrar'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', fontSize: '.95rem', color: 'var(--muted)' }}>
          <p>
            ¿No puedes iniciar sesión? Contacta con el administrador para activar tu cuenta.
          </p>
          <p style={{ marginTop: '.5rem' }}>
            <Link href="/" style={{ color: 'var(--red)' }}>
              Volver al inicio
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
