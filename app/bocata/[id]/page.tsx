import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, Calendar } from 'lucide-react'
import ImageGallery from '@/components/ImageGallery'
import ScoreBreakdown from '@/components/ScoreBreakdown'
import ReviewSection from './ReviewSection'
import DeleteButton from './DeleteButton'
import { formatDate } from '@/lib/utils'
import type { Bocata, Review } from '@/lib/supabase/types'
import type { Metadata } from 'next'

// ── Next.js 15: params debe ser awaited ───────────────────
type PageProps = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params          // ← await aquí
  const supabase = await createClient()
  const { data } = await (supabase as any)
    .from('bocatas')
    .select('name, description, place_name')
    .eq('slug', id)
    .single()
  if (!data) return { title: 'Bocata no encontrado' }
  return {
    title: data.name,
    description: data.description || `Review de ${data.name} en ${data.place_name}`,
  }
}

export default async function BocataPage({ params }: PageProps) {
  const { id } = await params          // ← await aquí
  const supabase = await createClient()

  const { data: bocata, error } = await (supabase as any)
    .from('bocatas')
    .select('*')
    .eq('slug', id)
    .single()

  if (error || !bocata) notFound()

  const { data: { session } } = await supabase.auth.getSession()
  const currentUserId = session?.user?.id ?? null
  const currentUserName = session?.user?.email ?? null

  const { data: reviews } = await (supabase as any)
    .from('reviews')
    .select('*, comments(*)')
    .eq('bocata_id', bocata.id)
    .order('created_at', { ascending: false })

  const allImages = [
    ...(bocata.cover_image_url ? [bocata.cover_image_url] : []),
    ...(bocata.images || []),
  ].filter(Boolean)

  const score   = Number(bocata.avg_score) || 0
  const scoreBg = score >= 8.5 ? 'var(--green)' : score >= 7 ? 'var(--amber)' : 'var(--red)'

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2.5rem 2rem 5rem' }}>

      {/* Top bar: volver + borrar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <Link
          href="/"
          className="hover-red"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem', fontSize: '.78rem', fontWeight: 600, color: 'var(--muted)', textDecoration: 'none', fontFamily: 'Manrope, sans-serif' }}
        >
          <ArrowLeft size={14} /> Volver al inicio
        </Link>
        <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {currentUserId === bocata.created_by ? (
            <>
              <Link
                href={`/bocata/${bocata.slug}/editar`}
                className="btn-secondary"
                style={{ fontSize: '.78rem', padding: '.5rem 1rem' }}
              >
                Editar bocata
              </Link>
              <DeleteButton bocataId={bocata.id} bocataName={bocata.name} imageUrls={allImages} />
            </>
          ) : null}
        </div>
      </div>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        {bocata.is_hall_of_fame && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem', background: 'var(--amber-light)', color: 'var(--gold)', border: '1px solid rgba(201,148,26,.3)', fontSize: '.72rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', padding: '.3rem .8rem', borderRadius: '100px', marginBottom: '1rem', fontFamily: 'Manrope, sans-serif' }}>
            🏆 Hall of Fame — Bocata Legendario
          </div>
        )}

        {/* tags removed per request */}

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 'clamp(2.5rem,5vw,4rem)', letterSpacing: '.02em', color: 'var(--ink)', lineHeight: .95, marginBottom: '.75rem' }}>
              {bocata.name}
            </h1>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem', fontSize: '.8rem', color: 'var(--muted)', fontFamily: 'Manrope, sans-serif' }}>
              {bocata.place_name && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '.3rem' }}>
                  <MapPin size={13} style={{ opacity: .6 }} />
                  {bocata.place_name}{bocata.place_city ? ` · ${bocata.place_city}` : ''}
                </span>
              )}
              {bocata.place_address && <span style={{ opacity: .6 }}>{bocata.place_address}</span>}
              <span style={{ display: 'flex', alignItems: 'center', gap: '.3rem' }}>
                <Calendar size={12} style={{ opacity: .6 }} />
                {formatDate(bocata.created_at)}
              </span>
            </div>
          </div>

          {score > 0 && (
            <div style={{ background: scoreBg, color: '#fff', borderRadius: '16px', width: '88px', height: '88px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(0,0,0,.15)', flexShrink: 0 }}>
              <span style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '2.8rem', lineHeight: 1, letterSpacing: '.02em' }}>{score.toFixed(1)}</span>
              <span style={{ fontSize: '.6rem', fontWeight: 600, opacity: .7, letterSpacing: '.05em', fontFamily: 'Manrope, sans-serif' }}>/ 10</span>
            </div>
          )}
        </div>
      </div>

      {/* Main layout: galería izquierda, scores derecha */}
      <div className="stack-on-mobile" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', marginBottom: '3rem', alignItems: 'start' }}>

        {/* Columna izquierda */}
        <div style={{ minWidth: 0 }}>
          {/* Galería con altura controlada */}
          <div style={{ width: '100%', overflow: 'hidden' }}>
            <ImageGallery images={allImages} altBase={bocata.name} />
          </div>

          {bocata.description && (
            <div style={{ marginTop: '1.5rem', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem' }}>
              <h2 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '1.4rem', letterSpacing: '.03em', marginBottom: '.75rem', color: 'var(--ink)' }}>
                Descripción
              </h2>
              <p style={{ fontFamily: 'Lora, serif', fontSize: '.95rem', color: 'var(--muted)', lineHeight: 1.75 }}>
                {bocata.description}
              </p>
            </div>
          )}
        </div>

        {/* Columna derecha: sticky */}
        <div style={{ position: 'sticky', top: '80px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <ScoreBreakdown bocata={bocata as Bocata} />

          {score > 0 && (
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '1.1rem 1.25rem' }}>
              <p style={{ fontSize: '.68rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '.6rem', fontFamily: 'Manrope, sans-serif' }}>
                Puntuación media
              </p>
              <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                {[1,2,3,4,5].map(i => (
                  <span key={i} style={{ fontSize: '1.5rem', color: i <= Math.round(score / 2) ? 'var(--gold)' : 'var(--border2)' }}>★</span>
                ))}
                <span style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '1.5rem', color: 'var(--ink)', marginLeft: '.5rem', letterSpacing: '.02em' }}>
                  {score.toFixed(1)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Divisor */}
      <div style={{ height: '1px', background: 'var(--border)', marginBottom: '2.5rem' }} />

      {/* Reviews */}
      <ReviewSection
        bocataId={bocata.id}
        bocataName={bocata.name}
        reviews={(reviews as Review[]) || []}
        currentUserId={currentUserId}
        currentUserName={currentUserName}
      />

      <style>{`
        @media (max-width: 768px) {
          .bocata-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
