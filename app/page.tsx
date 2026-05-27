import Link from 'next/link'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import BocataCard from '@/components/BocataCard'
import { MapPin, PlusCircle, Trophy, ArrowRight } from 'lucide-react'
import type { Bocata } from '@/lib/supabase/types'

/* Ticker band removed per request */

/* Hero removed per request — homepage will start with Últimas adiciones */

/* ── Top 3 sidebar ────────────────────────────────── */
async function TopRanking() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('bocatas')
    .select('id, slug, name, place_name, avg_score, total_reviews')
    .gt('total_reviews', 0)
    .order('avg_score', { ascending: false })
    .limit(3)

  if (!data?.length) return null
  const medals = ['🥇', '🥈', '🥉']
  const scoreBg = (s: number) => s >= 8.5 ? 'var(--green)' : s >= 7 ? 'var(--amber)' : 'var(--red)'

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r3)', padding: '1.5rem', boxShadow: 'var(--shadow)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '1.1rem' }}>
        <span style={{ fontSize: '1rem' }}>🏆</span>
        <span style={{ fontFamily: '"Bebas Neue",sans-serif', fontSize: '1.25rem', letterSpacing: '.04em', color: 'var(--ink)' }}>Top esta semana</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
        {data.map((b: any, i: number) => (
          <Link key={b.id} href={`/bocata/${b.slug}`} className="rank-item" style={{ padding: '.8rem 1rem' }}>
            <span style={{ fontFamily: '"Bebas Neue",sans-serif', fontSize: '1.5rem', width: '32px', textAlign: 'center', flexShrink: 0 }}>{medals[i]}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'Lora,serif', fontWeight: 600, fontSize: '.88rem', color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.name}</div>
              <div style={{ fontSize: '.7rem', color: 'var(--muted)', fontFamily: 'Manrope,sans-serif' }}>{b.place_name}</div>
            </div>
            <div style={{ background: scoreBg(Number(b.avg_score)), color: '#fff', borderRadius: '8px', fontFamily: '"Bebas Neue",sans-serif', fontSize: '1.25rem', padding: '.2rem .5rem', flexShrink: 0, lineHeight: 1.2, letterSpacing: '.03em' }}>
              {Number(b.avg_score).toFixed(1)}
            </div>
          </Link>
        ))}
      </div>

      <div style={{ marginTop: '1rem', textAlign: 'center' }}>
        <Link href="/ranking" className="btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>
          Ranking completo <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  )
}

/* ── Recent bocatas grid ───────────────────────────── */
async function RecentBocatas() {
  const supabase = await createClient()
  const { data: bocatas } = await supabase
    .from('bocatas')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(7)

  if (!bocatas?.length) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--card)', borderRadius: 'var(--r3)', border: '1px solid var(--border)' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🥖</div>
        <h3 style={{ fontFamily: '"Bebas Neue",sans-serif', fontSize: '1.6rem', letterSpacing: '.03em', marginBottom: '.5rem' }}>Aún no hay bocatas</h3>
        <p style={{ fontFamily: 'Lora,serif', fontStyle: 'italic', color: 'var(--muted)', fontSize: '.9rem', marginBottom: '1.5rem' }}>
          Sé el primero en juzgar un bocata. El ranking espera.
        </p>
        <Link href="/anadir" className="btn-primary">
          <PlusCircle size={15} /> Añadir el primero
        </Link>
      </div>
    )
  }

  const [featured, ...rest] = bocatas

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Featured */}
      <BocataCard bocata={featured as Bocata} featured />

      {/* Grid 3 cols */}
      {rest.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
          {rest.slice(0, 6).map((b: any) => (
            <BocataCard key={b.id} bocata={b as Bocata} />
          ))}
        </div>
      )}
    </div>
  )
}

/* ── PAGE ─────────────────────────────────────────── */
export default function HomePage() {
  return (
    <>
      {/* Home starts directly with Últimas adiciones per request */}

      {/* ── Main content + sidebar ── */}
      <div style={{ borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }}>

            {/* Main */}
            <div>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <div>
                  <div className="section-eyebrow">Últimas adiciones</div>
                  <h2 className="section-heading">Recién juzgados</h2>
                </div>
                <Link href="/explorador" className="btn-ghost">
                  Ver todos <ArrowRight size={13} />
                </Link>
              </div>
              <Suspense fallback={
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.25rem' }}>
                  {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ aspectRatio: '3/4', borderRadius: 'var(--r3)' }} />)}
                </div>
              }>
                <RecentBocatas />
              </Suspense>
            </div>

            {/* Sidebar */}
            <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'sticky', top: '80px' }}>
              <Suspense fallback={<div className="skeleton" style={{ height: '200px', borderRadius: 'var(--r3)' }} />}>
                <TopRanking />
              </Suspense>

              {/* CTA */}
              <div style={{ background: 'var(--red)', borderRadius: 'var(--r3)', padding: '1.75rem', color: '#fff', boxShadow: '0 4px 20px rgba(155,42,26,.25)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '.75rem' }}>🥖</div>
                <h3 style={{ fontFamily: 'Lora,serif', fontWeight: 600, fontSize: '1.05rem', lineHeight: 1.4, marginBottom: '.65rem', fontStyle: 'normal' }}>
                  ¿Has comido un bocata memorable?
                </h3>
                <p style={{ fontSize: '.8rem', opacity: .8, lineHeight: 1.6, marginBottom: '1.1rem', fontFamily: 'Manrope,sans-serif' }}>
                  El mundo merece saberlo. ¿Fue una obra maestra o un crimen culinario?
                </p>
                <Link href="/anadir" style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem', fontFamily: 'Manrope,sans-serif', fontSize: '.8rem', fontWeight: 700, letterSpacing: '.04em', background: '#fff', color: 'var(--red)', border: 'none', cursor: 'pointer', padding: '.55rem 1.1rem', borderRadius: '8px', textDecoration: 'none', transition: 'all .2s' }}>
                  <PlusCircle size={14} /> Añadir bocata
                </Link>
              </div>

              {/* Hall of Fame teaser */}
              <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r3)', padding: '1.4rem', boxShadow: 'var(--shadow)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.75rem' }}>
                  <span>🏆</span>
                  <span style={{ fontFamily: '"Bebas Neue",sans-serif', fontSize: '1.2rem', letterSpacing: '.04em', color: 'var(--ink)' }}>Hall of Fame</span>
                </div>
                <p style={{ fontFamily: 'Lora,serif', fontStyle: 'italic', fontSize: '.85rem', color: 'var(--muted)', lineHeight: 1.6, marginBottom: '1rem' }}>
                  Los bocatas que alcanzaron la inmortalidad gastronómica.
                </p>
                <Link href="/hall-of-fame" className="btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>
                  Descubrir leyendas <ArrowRight size={13} />
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          section > div { grid-template-columns: 1fr !important; }
          section > div > div:last-child { display: none !important; }
          .main-layout { grid-template-columns: 1fr !important; }
          .bocatas-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 600px) {
          .bocatas-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  )
}
