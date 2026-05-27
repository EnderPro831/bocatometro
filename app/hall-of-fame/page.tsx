import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Hall of Fame',
  description: 'Los bocatas que alcanzaron la inmortalidad gastronómica.',
}

export default async function HallOfFamePage() {
  const supabase = await createClient()
  const { data: bocatas } = await supabase
    .from('bocatas')
    .select('*')
    .eq('is_hall_of_fame', true)
    .order('avg_score', { ascending: false })

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '3.5rem 2rem' }}>

      {/* Hero header */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '4rem', paddingBottom: '3rem', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏆</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ height: '1px', width: '60px', background: 'var(--gold)' }} />
          <span style={{
            fontSize: '.7rem', fontWeight: 700, letterSpacing: '.12em',
            color: 'var(--gold)', textTransform: 'uppercase', fontFamily: 'Manrope, sans-serif',
          }}>
            La inmortalidad gastronómica
          </span>
          <div style={{ height: '1px', width: '60px', background: 'var(--gold)' }} />
        </div>
        <h1 style={{
          fontFamily: '"Bebas Neue", sans-serif',
          fontSize: 'clamp(3rem,6vw,5rem)',
          letterSpacing: '.03em', color: 'var(--ink)',
          lineHeight: 1, marginBottom: '.75rem',
        }}>
          Hall of Fame
        </h1>
        <p style={{
          fontFamily: 'Lora, serif', fontStyle: 'italic',
          color: 'var(--muted)', fontSize: '1rem',
          maxWidth: '480px', margin: '0 auto', lineHeight: 1.7,
        }}>
          Bocatas que trascendieron lo mortal. Experiencias que cambiaron vidas
          y destruyeron estómagos. Los que entraron aquí, no se olvidan.
        </p>
      </div>

      {/* Grid */}
      {!bocatas?.length ? (
        <div style={{
          textAlign: 'center', padding: '5rem 2rem',
          background: 'var(--card)', borderRadius: 'var(--r3)',
          border: '1px solid var(--border)',
        }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🏆</div>
          <h3 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '1.6rem', letterSpacing: '.03em', marginBottom: '.5rem' }}>
            El Hall of Fame está vacío
          </h3>
          <p style={{ fontFamily: 'Lora, serif', fontStyle: 'italic', color: 'var(--muted)', fontSize: '.9rem', marginBottom: '1.5rem' }}>
            Ningún bocata ha alcanzado aún el estatus de leyenda.
          </p>
          <Link href="/ranking" className="btn-secondary">Ver el ranking</Link>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1.5rem',
        }}>
{bocatas.map((bocata: any, i: number) => {
            const score = Number(bocata.avg_score) || 0
            const medals = ['🥇', '🥈', '🥉']

            return (
              <Link
                key={bocata.id}
                href={`/bocata/${bocata.slug}`}
                className="hof-card-hover"
                style={{
                  textDecoration: 'none', color: 'inherit', display: 'block',
                  background: 'var(--card)', borderRadius: 'var(--r3)',
                  border: '1px solid var(--border)', overflow: 'hidden',
                  boxShadow: 'var(--shadow)', position: 'relative',
                }}
              >
                {/* Gold top bar */}
                <div style={{ height: '4px', background: 'linear-gradient(90deg, var(--gold), #E8B020)' }} />

                {/* Image */}
                <div style={{
                  aspectRatio: '16/9',
                  background: 'linear-gradient(135deg,#C4B09A,#DDD0BA)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '3.5rem', position: 'relative', overflow: 'hidden',
                }}>
                  {bocata.cover_image_url
                    ? <Image src={bocata.cover_image_url} alt={bocata.name} fill className="img-zoom" style={{ objectFit: 'cover' }} sizes="400px" />
                    : '🥖'
                  }

                  {/* Medal position */}
                  {i < 3 && (
                    <div style={{
                      position: 'absolute', top: '.75rem', left: '.75rem',
                      fontSize: '1.5rem', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,.2))',
                      zIndex: 2,
                    }}>
                      {medals[i]}
                    </div>
                  )}

                  {/* Score */}
                  <div style={{
                    position: 'absolute', bottom: '.75rem', right: '.75rem', zIndex: 2,
                    background: 'var(--gold)', color: '#fff', borderRadius: '8px',
                    fontFamily: '"Bebas Neue", sans-serif', fontSize: '1.3rem',
                    padding: '.2rem .55rem', lineHeight: 1.2,
                    boxShadow: '0 2px 8px rgba(201,148,26,.4)',
                    letterSpacing: '.03em',
                  }}>
                    {score > 0 ? score.toFixed(1) : '—'}
                  </div>
                </div>

                {/* Body */}
                <div style={{ padding: '1.1rem 1.25rem 1.3rem', borderTop: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', gap: '.4rem', marginBottom: '.6rem', flexWrap: 'wrap' }}>
                    <span style={{
                      background: '#FBF5E0', color: 'var(--gold)',
                      border: '1px solid rgba(201,148,26,.3)',
                      borderRadius: '100px', fontSize: '.58rem', fontWeight: 700,
                      letterSpacing: '.07em', textTransform: 'uppercase',
                      padding: '.2rem .5rem', fontFamily: 'Manrope, sans-serif',
                    }}>
                      👑 Hall of Fame
                    </span>
                    {bocata.tags?.slice(0, 1).map((t: string) => (
                      <span key={t} className="tag tag-red">{t}</span>
                    ))}
                  </div>

                  <h3 style={{
                    fontFamily: 'Lora, serif', fontWeight: 600,
                    fontSize: '1.05rem', color: 'var(--ink)',
                    lineHeight: 1.3, marginBottom: '.3rem',
                  }}>
                    {bocata.name}
                  </h3>

                  {bocata.place_name && (
                    <p style={{
                      fontSize: '.74rem', color: 'var(--muted)',
                      fontFamily: 'Manrope, sans-serif',
                      display: 'flex', alignItems: 'center', gap: '.25rem',
                    }}>
                      <MapPin size={10} style={{ opacity: .6 }} />
                      {bocata.place_name}{bocata.place_city ? ` · ${bocata.place_city}` : ''}
                    </p>
                  )}

                  {bocata.description && (
                    <p style={{
                      fontFamily: 'Lora, serif', fontStyle: 'italic',
                      fontSize: '.82rem', color: 'var(--muted)',
                      lineHeight: 1.6, marginTop: '.6rem',
                      display: '-webkit-box', WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>
                      {bocata.description}
                    </p>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
