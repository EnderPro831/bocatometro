import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Explorador A-Z',
  description: 'El catálogo completo de bocatas ordenado alfabéticamente.',
}

export default async function ExploradorPage() {
  const supabase = await createClient()
  const { data: bocatas } = await (supabase as any)
    .from('bocatas')
    .select('id, slug, name, place_name, place_city, avg_score, total_reviews, cover_image_url, tags')
    .order('name', { ascending: true })

  if (!bocatas?.length) {
    return (
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '5rem 2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>📖</div>
        <h1 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '2rem', letterSpacing: '.03em', marginBottom: '.5rem' }}>
          El catálogo está vacío
        </h1>
        <p style={{ fontFamily: 'Lora, serif', fontStyle: 'italic', color: 'var(--muted)', marginBottom: '1.5rem' }}>
          Aún no hay bocatas que explorar.
        </p>
        <Link href="/anadir" className="btn-primary">Añadir bocata</Link>
      </div>
    )
  }

  const grouped = (bocatas as any[]).reduce((acc: Record<string, any[]>, b: any) => {
    const l = String(b.name).charAt(0).toUpperCase()
    if (!acc[l]) acc[l] = []
    acc[l].push(b)
    return acc
  }, {} as Record<string, any[]>)
  const letters = Object.keys(grouped).sort()
  const allLetters = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('')

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '3.5rem 2rem' }}>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div className="section-eyebrow" style={{ marginBottom: '.6rem' }}>Catálogo completo</div>
        <h1 style={{
          fontFamily: '"Bebas Neue", sans-serif',
          fontSize: 'clamp(2.5rem,5vw,4rem)',
          letterSpacing: '.03em', color: 'var(--ink)',
          lineHeight: 1, marginBottom: '.4rem',
        }}>
          Explorador
        </h1>
        <p style={{ fontFamily: 'Lora, serif', fontStyle: 'italic', color: 'var(--muted)', fontSize: '.9rem' }}>
          {bocatas.length} bocatas catalogados.
        </p>
      </div>

      {/* Quick nav sticky */}
      <nav style={{
        position: 'sticky', top: '66px', zIndex: 10,
        background: 'rgba(250,246,238,.94)', backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--border)',
        margin: '0 -2rem', padding: '.75rem 2rem',
        marginBottom: '2.5rem',
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.3rem' }}>
          {allLetters.map(letter => {
            const has = letters.includes(letter)
            return has ? (
              <a
                key={letter}
                href={`#letra-${letter}`}
                className="alpha-link-active"
                style={{
                  width: '32px', height: '32px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: '7px',
                  border: '1px solid rgba(155,42,26,.3)',
                  fontFamily: '"Bebas Neue", sans-serif', fontSize: '1rem',
                  color: 'var(--red)', background: 'var(--red-light)',
                  textDecoration: 'none', transition: 'all .15s',
                }}
              >
                {letter}
              </a>
            ) : (
              <span
                key={letter}
                style={{
                  width: '32px', height: '32px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: '7px', border: '1px solid var(--border)',
                  fontFamily: '"Bebas Neue", sans-serif', fontSize: '1rem',
                  color: 'var(--border2)', background: 'var(--cream)',
                }}
              >
                {letter}
              </span>
            )
          })}
        </div>
      </nav>

      {/* Grouped list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem' }}>
        {letters.map(letter => (
          <section key={letter} id={`letra-${letter}`}>
            {/* Letter divider */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1.25rem', marginBottom: '1.25rem' }}>
              <span style={{
                fontFamily: '"Bebas Neue", sans-serif', fontSize: '5rem',
                lineHeight: 1, color: 'var(--border)', letterSpacing: '.02em',
                userSelect: 'none',
              }}>
                {letter}
              </span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border)', marginBottom: '.75rem' }} />
              <span style={{ fontSize: '.7rem', color: 'var(--muted)', fontFamily: 'Manrope, sans-serif', fontWeight: 500, marginBottom: '.75rem' }}>
                {grouped[letter].length} bocata{grouped[letter].length !== 1 ? 's' : ''}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {grouped[letter].map(b => {
                const score = Number(b.avg_score) || 0
                const scoreBg = score >= 8.5 ? 'var(--green)' : score >= 7 ? 'var(--amber)' : 'var(--red)'

                return (
                  <Link
                    key={b.id}
                    href={`/bocata/${b.slug}`}
                    className="explorador-item"
                    style={{
                      display: 'flex', alignItems: 'center', gap: '.9rem',
                      padding: '.85rem 1rem', borderRadius: '12px',
                      background: 'var(--card)', border: '1px solid var(--border)',
                      textDecoration: 'none', color: 'inherit',
                    }}
                  >
                    {/* Thumb */}
                    <div style={{
                      width: '52px', height: '52px', borderRadius: '10px',
                      flexShrink: 0, overflow: 'hidden',
                      background: 'linear-gradient(135deg,#DDD0BA,#EEE4CC)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.5rem', border: '1px solid var(--border)',
                      position: 'relative',
                    }}>
                      {b.cover_image_url
                        ? <Image src={b.cover_image_url} alt={b.name} fill style={{ objectFit: 'cover' }} sizes="52px" />
                        : '🥖'
                      }
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontFamily: 'Lora, serif', fontWeight: 600,
                        fontSize: '.9rem', color: 'var(--ink)',
                        marginBottom: '.15rem',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {b.name}
                      </div>
                      {b.place_name && (
                        <div style={{
                          fontSize: '.7rem', color: 'var(--muted)',
                          fontFamily: 'Manrope, sans-serif',
                          display: 'flex', alignItems: 'center', gap: '.2rem',
                        }}>
                          <MapPin size={9} style={{ opacity: .6 }} /> {b.place_name}
                        </div>
                      )}
                    </div>

                    {/* Score */}
                    {score > 0 && (
                      <div style={{
                        background: scoreBg, color: '#fff',
                        borderRadius: '7px',
                        fontFamily: '"Bebas Neue", sans-serif',
                        fontSize: '1.1rem', padding: '.15rem .45rem',
                        flexShrink: 0, lineHeight: 1.2, letterSpacing: '.03em',
                      }}>
                        {score.toFixed(1)}
                      </div>
                    )}
                  </Link>
                )
              })}
            </div>
          </section>
        ))}
      </div>

      <style>{`
        .alpha-link-active:hover {
          background: var(--red) !important;
          color: #fff !important;
          border-color: var(--red) !important;
        }
      `}</style>
    </div>
  )
}
