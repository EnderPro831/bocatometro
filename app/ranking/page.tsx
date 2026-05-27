import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, ArrowRight } from 'lucide-react'
import type { Bocata } from '@/lib/supabase/types'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ranking Global',
  description: 'El ranking definitivo de bocatas. ¿Quién ocupa el trono?',
}

type SortBy = 'score' | 'fecha' | 'nombre'

const MEDALS = ['🥇', '🥈', '🥉']
const scoreBg = (s: number) => s >= 8.5 ? 'var(--green)' : s >= 7 ? 'var(--amber)' : 'var(--red)'

export default async function RankingPage({ searchParams }: { searchParams: Promise<{ orden?: string }> }) {
  const params = await searchParams
  const sortBy = (params?.orden as SortBy) || 'score'
  const supabase = await createClient()

  let query = supabase.from('bocatas').select('*')
  if (sortBy === 'fecha')  query = query.order('created_at', { ascending: false })
  else if (sortBy === 'nombre') query = query.order('name', { ascending: true })
  else query = query.order('avg_score', { ascending: false }).order('total_reviews', { ascending: false })

  const { data: bocatas } = await query.limit(50)

  const sortOptions = [
    { value: 'score',  label: '🏅 Por nota' },
    { value: 'fecha',  label: '📅 Recientes' },
    { value: 'nombre', label: '🔤 Nombre' },
  ]

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '3.5rem 2rem' }}>

      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div className="section-eyebrow" style={{ marginBottom: '.6rem' }}>El veredicto colectivo</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <h1 style={{ fontFamily: '"Bebas Neue",sans-serif', fontSize: 'clamp(2.5rem,5vw,4rem)', letterSpacing: '.03em', color: 'var(--ink)', lineHeight: 1 }}>
            Ranking Global
          </h1>
          <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
            {sortOptions.map(({ value, label }) => (
              <Link
                key={value}
                href={`/ranking?orden=${value}`}
                style={{
                  fontFamily: 'Manrope,sans-serif',
                  fontSize: '.78rem',
                  fontWeight: 600,
                  padding: '.45rem .9rem',
                  borderRadius: '8px',
                  border: sortBy === value ? 'none' : '1px solid var(--border)',
                  background: sortBy === value ? 'var(--red)' : 'var(--card)',
                  color: sortBy === value ? '#fff' : 'var(--muted)',
                  textDecoration: 'none',
                  transition: 'all .2s',
                  whiteSpace: 'nowrap',
                }}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
        <div style={{ height: '1px', background: 'var(--border)', marginTop: '1.5rem' }} />
      </div>

      {/* List */}
      {!bocatas?.length ? (
        <div style={{ textAlign: 'center', padding: '5rem 2rem', background: 'var(--card)', borderRadius: 'var(--r3)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🏆</div>
          <h3 style={{ fontFamily: '"Bebas Neue",sans-serif', fontSize: '1.6rem', letterSpacing: '.03em', marginBottom: '.5rem' }}>El ranking está vacío</h3>
          <p style={{ fontFamily: 'Lora,serif', fontStyle: 'italic', color: 'var(--muted)', fontSize: '.9rem', marginBottom: '1.5rem' }}>El trono espera a su primer candidato.</p>
          <Link href="/anadir" className="btn-primary">Añadir el primero</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
          {bocatas.map((bocata, i) => {
            const score = Number(bocata.avg_score) || 0
            return (
              <Link key={bocata.id} href={`/bocata/${bocata.slug}`} className="rank-item">
                {/* Posición */}
                <div style={{ fontFamily: '"Bebas Neue",sans-serif', fontSize: i < 3 ? '1.8rem' : '1.4rem', width: '44px', textAlign: 'center', flexShrink: 0, lineHeight: 1, color: i < 3 ? 'var(--ink)' : 'var(--border2)' }}>
                  {i < 3 ? MEDALS[i] : `#${i + 1}`}
                </div>

                {/* Thumbnail */}
                <div style={{ width: '56px', height: '56px', borderRadius: '10px', flexShrink: 0, overflow: 'hidden', background: 'linear-gradient(135deg,#DDD0BA,#EEE4CC)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', border: '1px solid var(--border)', position: 'relative' }}>
                  {bocata.cover_image_url
                    ? <Image src={bocata.cover_image_url} alt={bocata.name} fill style={{ objectFit: 'cover' }} sizes="56px" />
                    : '🥖'
                  }
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', flexWrap: 'wrap', marginBottom: '.15rem' }}>
                    <span style={{ fontFamily: 'Lora,serif', fontWeight: 600, fontSize: '.95rem', color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {bocata.name}
                    </span>
                    {bocata.is_hall_of_fame && (
                      <span style={{ background: '#FBF5E0', color: 'var(--gold)', border: '1px solid rgba(201,148,26,.3)', borderRadius: '100px', fontSize: '.58rem', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', padding: '.15rem .45rem', fontFamily: 'Manrope,sans-serif', flexShrink: 0 }}>
                        Hall of Fame
                      </span>
                    )}
                  </div>
                  {bocata.place_name && (
                    <div style={{ fontSize: '.72rem', color: 'var(--muted)', fontFamily: 'Manrope,sans-serif', display: 'flex', alignItems: 'center', gap: '.25rem', marginBottom: '.35rem' }}>
                      <MapPin size={10} style={{ opacity: .6 }} />
                      {bocata.place_name}{bocata.place_city ? ` · ${bocata.place_city}` : ''}
                    </div>
                  )}
                  {bocata.tags?.length > 0 && (
                    <div style={{ display: 'flex', gap: '.35rem', flexWrap: 'wrap' }}>
                      {bocata.tags.slice(0, 2).map((t: string) => (
                        <span key={t} className="tag tag-red">{t}</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Score */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '.25rem', flexShrink: 0 }}>
                  <div style={{ background: scoreBg(score), color: '#fff', borderRadius: '10px', fontFamily: '"Bebas Neue",sans-serif', fontSize: '1.5rem', padding: '.25rem .65rem', lineHeight: 1.1, letterSpacing: '.03em', boxShadow: '0 2px 8px rgba(0,0,0,.15)' }}>
                    {score > 0 ? score.toFixed(1) : '—'}
                  </div>
                  <div style={{ fontSize: '.67rem', color: 'var(--muted)', fontFamily: 'Manrope,sans-serif' }}>
                    {bocata.total_reviews} review{bocata.total_reviews !== 1 ? 's' : ''}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
