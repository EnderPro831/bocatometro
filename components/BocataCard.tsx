import Link from 'next/link'
import Image from 'next/image'
import { MapPin } from 'lucide-react'
import type { Bocata } from '@/lib/supabase/types'
import { formatDate } from '@/lib/utils'

interface BocataCardProps {
  bocata: Bocata
  featured?: boolean
}

function ScoreBadge({ score }: { score: number }) {
  const bg = score >= 8.5 ? 'var(--green)' : score >= 7 ? 'var(--amber)' : 'var(--red)'
  return (
    <div style={{
      position: 'absolute', top: '.85rem', right: '.85rem', zIndex: 2,
      background: bg, color: '#fff', borderRadius: '10px',
      fontFamily: '"Bebas Neue", sans-serif', fontSize: '1.35rem', lineHeight: 1.1,
      letterSpacing: '.02em', boxShadow: '0 2px 8px rgba(0,0,0,.25)',
      display: 'flex', alignItems: 'baseline', gap: '.12rem', padding: '.25rem .55rem',
    }}>
      {score.toFixed(1)}
      <span style={{
        fontFamily: 'Manrope, sans-serif', fontSize: '.5rem',
        fontWeight: 600, opacity: .7, alignSelf: 'flex-end', marginBottom: '.1rem',
      }}>/ 10</span>
    </div>
  )
}

export default function BocataCard({ bocata, featured = false }: BocataCardProps) {
  const score = Number(bocata.avg_score) || 0

  /* ── Featured (hero card grande) ── */
  if (featured) {
    return (
      <Link href={`/bocata/${bocata.slug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
        <article
          className="featured-card-hover"
          style={{
            background: 'var(--card)', borderRadius: 'var(--r3)',
            border: '1px solid var(--border)', boxShadow: 'var(--shadow2)',
            overflow: 'hidden', display: 'grid',
            gridTemplateColumns: '1fr 1fr',
          }}
        >
          {/* Imagen */}
          <div style={{
            position: 'relative', minHeight: '280px',
            background: 'linear-gradient(135deg,#C4B09A,#DDD0BA)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '5rem', overflow: 'hidden',
          }}>
            {bocata.cover_image_url
              ? <Image src={bocata.cover_image_url} alt={bocata.name} fill className="img-zoom" style={{ objectFit: 'cover' }} sizes="50vw" />
              : <span style={{ zIndex: 1 }}>🥖</span>
            }
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, transparent 60%, rgba(255,252,246,.5))' }} />
            {bocata.is_hall_of_fame && (
              <div style={{
                position: 'absolute', top: '.85rem', left: '.85rem', zIndex: 2,
                background: 'var(--gold)', color: '#fff', borderRadius: '6px',
                fontSize: '.6rem', fontWeight: 700, letterSpacing: '.06em',
                textTransform: 'uppercase', padding: '.2rem .5rem',
                fontFamily: 'Manrope, sans-serif',
              }}>
                Hall of Fame
              </div>
            )}
            {score > 0 && <ScoreBadge score={score} />}
          </div>

          {/* Cuerpo */}
          <div style={{ padding: '2rem 2.25rem 2rem 1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '.85rem' }}>
            <div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '.5rem',
                fontSize: '.65rem', fontWeight: 700, letterSpacing: '.12em',
                color: 'var(--red)', textTransform: 'uppercase',
                fontFamily: 'Manrope, sans-serif', marginBottom: '.5rem',
              }}>
                <div style={{ width: '14px', height: '2px', background: 'var(--red)', borderRadius: '2px' }} />
                Review destacada
              </div>
              {/* tags removed per request */}
            </div>

            <h2 style={{ fontFamily: 'Lora, serif', fontWeight: 600, fontSize: '1.5rem', color: 'var(--ink)', lineHeight: 1.2 }}>
              {bocata.name}
            </h2>

            {score > 0 && (
              <div style={{
                display: 'inline-flex', alignItems: 'baseline', gap: '.3rem',
                background: 'var(--red)', color: '#fff',
                borderRadius: '10px', padding: '.4rem .9rem', width: 'fit-content',
              }}>
                <span style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '2rem', lineHeight: 1, letterSpacing: '.03em' }}>{score.toFixed(1)}</span>
                <span style={{ fontSize: '.7rem', fontWeight: 600, opacity: .7 }}>/ 10</span>
              </div>
            )}

            {bocata.description && (
              <p style={{ fontFamily: 'Lora, serif', fontSize: '.95rem', color: 'var(--muted)', lineHeight: 1.7, fontStyle: 'italic' }}>
                {bocata.description.substring(0, 140)}{bocata.description.length > 140 ? '…' : ''}
              </p>
            )}

            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '.4rem',
              fontSize: '.78rem', fontWeight: 700, letterSpacing: '.05em',
              color: 'var(--red)', fontFamily: 'Manrope, sans-serif',
            }}>
              Leer review completa →
            </span>
          </div>
        </article>
      </Link>
    )
  }

  /* ── Normal card ── */
  return (
    <Link href={`/bocata/${bocata.slug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex' }}>
      <article className="card hover-lift" style={{ width: '100%' }}>
        {/* Imagen */}
        <div style={{
          position: 'relative', aspectRatio: '4/3',
          background: 'linear-gradient(135deg,#DDD0BA,#EEE4CC)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '3.5rem', overflow: 'hidden',
        }}>
          {bocata.cover_image_url
            ? <Image src={bocata.cover_image_url} alt={bocata.name} fill className="img-zoom" style={{ objectFit: 'cover' }} sizes="(max-width:640px) 100vw, 33vw" />
            : <span style={{ zIndex: 1 }}>🥖</span>
          }
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 45%, rgba(28,18,8,.4))' }} />
          {bocata.is_hall_of_fame && (
            <div style={{
              position: 'absolute', top: '.85rem', left: '.85rem', zIndex: 2,
              background: 'var(--gold)', color: '#fff', borderRadius: '6px',
              fontSize: '.58rem', fontWeight: 700, letterSpacing: '.06em',
              textTransform: 'uppercase', padding: '.2rem .5rem',
              fontFamily: 'Manrope, sans-serif',
            }}>
              Hall of Fame
            </div>
          )}
          {score > 0 && <ScoreBadge score={score} />}
        </div>

        {/* Cuerpo */}
        <div style={{ padding: '1.1rem 1.2rem 1.2rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
          {/* tags removed per request */}

          <h2 style={{ fontFamily: 'Lora, serif', fontWeight: 600, fontSize: '1.05rem', color: 'var(--ink)', lineHeight: 1.3, marginBottom: '.3rem' }}>
            {bocata.name}
          </h2>

          {bocata.place_name && (
            <p style={{ fontSize: '.75rem', fontWeight: 500, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '.3rem', marginBottom: '.65rem', fontFamily: 'Manrope, sans-serif' }}>
              <MapPin size={11} style={{ opacity: .6, flexShrink: 0 }} />
              {bocata.place_name}{bocata.place_city ? ` · ${bocata.place_city}` : ''}
            </p>
          )}

          {bocata.description && (
            <p style={{ fontFamily: 'Lora, serif', fontSize: '.85rem', color: 'var(--muted)', lineHeight: 1.6, flex: 1, marginBottom: '.9rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {bocata.description}
            </p>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '.8rem', borderTop: '1px solid var(--border)', marginTop: 'auto' }}>
            <div style={{ display: 'flex', gap: '2px' }}>
              {[1,2,3,4,5].map(i => (
                <span key={i} style={{ fontSize: '.85rem', color: i <= Math.round(score / 2) ? 'var(--gold)' : 'var(--border2)' }}>★</span>
              ))}
            </div>
            <span style={{ fontSize: '.7rem', color: 'var(--muted)', fontWeight: 500, fontFamily: 'Manrope, sans-serif' }}>
              {bocata.total_reviews} review{bocata.total_reviews !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}
