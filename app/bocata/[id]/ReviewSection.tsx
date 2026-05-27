'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle, XCircle, PlusCircle, Trash2, User, Calendar, MessageCircle } from 'lucide-react'
import type { Review } from '@/lib/supabase/types'
import { formatDate, formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'

interface ReviewSectionProps {
  bocataId: string
  bocataName: string
  reviews: Review[]
}

// Use a single overall score instead of multiple categorized sliders
function SliderInput({ label, emoji, value, onChange }: { label: string; emoji?: string; value: number; onChange: (v: number) => void }) {
  const pct = ((value - 1) / 9 * 100).toFixed(0)
  const color = value >= 8 ? 'var(--green)' : value >= 5.5 ? 'var(--amber)' : 'var(--red)'
  return (
    <div style={{ background: 'var(--cream2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '.85rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.5rem' }}>
        <span style={{ fontSize: '.73rem', fontWeight: 600, color: 'var(--muted)', fontFamily: 'Manrope,sans-serif', display: 'flex', alignItems: 'center', gap: '.35rem' }}>
          {emoji} {label}
        </span>
        <span style={{ fontFamily: '"Bebas Neue",sans-serif', fontSize: '1.35rem', color: color, letterSpacing: '.02em', lineHeight: 1 }}>
          {value.toFixed(1)}
        </span>
      </div>
      <input
        type="range" min="1" max="10" step="0.5" value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{
          WebkitAppearance: 'none', appearance: 'none',
          width: '100%', height: '4px', borderRadius: '4px', outline: 'none', cursor: 'pointer',
          background: `linear-gradient(to right, ${color} ${pct}%, var(--border) ${pct}%)`,
        }}
      />
    </div>
  )
}

function ReviewCard({ review, onDelete, deleting }: { review: Review; onDelete?: (id: string) => void; deleting?: boolean }) {
  const score = Number(review.score_total) || 0
  const bg = score >= 8.5 ? 'var(--green)' : score >= 7 ? 'var(--amber)' : 'var(--red)'
  return (
    <article style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.35rem 1.5rem', marginBottom: '.75rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.7rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--cream3)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.78rem', fontWeight: 700, color: 'var(--muted)', flexShrink: 0, fontFamily: 'Manrope,sans-serif' }}>
            {review.author_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: '.85rem', fontWeight: 600, color: 'var(--ink)', fontFamily: 'Manrope,sans-serif' }}>{review.author_name}</div>
            <div style={{ fontSize: '.7rem', color: 'var(--muted)', fontFamily: 'Manrope,sans-serif', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
              {review.eaten_at && <><Calendar size={10} /> {formatDate(review.eaten_at)}</>}
              {review.price_paid && <span>· Pagó {formatPrice(review.price_paid)}</span>}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '.5rem', flexShrink: 0 }}>
          <div style={{ background: bg, color: '#fff', borderRadius: '10px', fontFamily: '"Bebas Neue",sans-serif', fontSize: '1.4rem', padding: '.2rem .6rem', lineHeight: 1.15, letterSpacing: '.03em' }}>
            {score.toFixed(1)}
          </div>
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(review.id)}
              disabled={deleting}
              style={{
                fontFamily: 'Manrope, sans-serif', fontSize: '.72rem', fontWeight: 700,
                color: deleting ? 'var(--muted)' : 'var(--red)', background: 'transparent', border: 'none', cursor: deleting ? 'not-allowed' : 'pointer', padding: 0,
              }}
            >
              {deleting ? 'Borrando...' : 'Eliminar review'}
            </button>
          )}
        </div>
      </div>

      {/* Title */}
      {review.title && (
        <h4 style={{ fontFamily: 'Lora,serif', fontWeight: 600, fontSize: '1rem', color: 'var(--ink)', marginBottom: '.5rem' }}>
          {review.title}
        </h4>
      )}

      {/* Body */}
      <p style={{ fontFamily: 'Lora,serif', fontStyle: 'italic', fontSize: '.88rem', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '1rem' }}>
        "{review.body}"
      </p>

      {/* Would repeat */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', fontSize: '.78rem', fontFamily: 'Manrope,sans-serif' }}>
        {review.would_repeat
          ? <><CheckCircle size={14} color="var(--green)" /> <span style={{ color: 'var(--green)', fontWeight: 600 }}>Repetiría sin dudarlo</span></>
          : <><XCircle size={14} color="var(--red)" /> <span style={{ color: 'var(--red)', fontWeight: 600 }}>No repetiría</span></>
        }
      </div>
    </article>
  )
}

function parseError(e: { code?: string; message?: string } | null): string {
  if (!e) return 'Error desconocido'
  const m = e.message || ''
  const c = e.code || ''
  if (m.includes('row-level security') || m.includes('policy')) return 'Error de permisos. Inicia sesión o revisa RLS.'
  if (m.includes('JWT') || c === 'PGRST301') return 'Error de sesión. Recarga la página.'
  if (m.includes('NetworkError') || m.includes('fetch')) return 'Error de red. Comprueba tu conexión.'
  return `${m} (${c})`
}

export default function ReviewSection({ bocataId, bocataName, reviews: init }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>(init)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null)
  const [supabase] = useState(() => createClient())
  const [form, setForm] = useState({
    author_name: '', title: '', body: '', eaten_at: '', price_paid: '', would_repeat: true,
    score_total: 7.5,
  })

  const avgScore = Number(form.score_total || 0)
  const avgBg = avgScore >= 8.5 ? 'var(--green)' : avgScore >= 7 ? 'var(--amber)' : 'var(--red)'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.author_name.trim() || !form.body.trim()) { toast.error('Nombre y review son obligatorios'); return }
    setLoading(true)
    const { data, error } = await (supabase as any).from('reviews').insert({
      bocata_id: bocataId,
      author_name: form.author_name.trim(),
      title: form.title.trim() || null,
      body: form.body.trim(),
      // store a single overall score; mirror it into category fields so DB aggregations still work
      score_pan: form.score_total,
      score_relleno: form.score_total,
      score_calidad_precio: form.score_total,
      score_tamano: form.score_total,
      score_destruccion: form.score_total,
      eaten_at: form.eaten_at || null,
      price_paid: form.price_paid ? parseFloat(form.price_paid) : null,
      would_repeat: form.would_repeat,
    }).select().single()

    if (error) {
      toast.error(parseError(error))
      console.error(error)
    } else if (data) {
      toast.success('¡Review publicada!')
      setReviews([data as Review, ...reviews])
      setShowForm(false)
      setForm({ author_name: '', title: '', body: '', eaten_at: '', price_paid: '', would_repeat: true, score_total: 7.5 })
    }

    setLoading(false)
  }

  const handleDeleteReview = async (reviewId: string) => {
    const confirmed = window.confirm('¿Borrar esta review? Esta acción no se puede deshacer.')
    if (!confirmed) return
    setDeletingReviewId(reviewId)
    const { error } = await (supabase as any).from('reviews').delete().eq('id', reviewId)

    if (error) {
      toast.error(parseError(error))
      console.error(error)
    } else {
      setReviews(prev => prev.filter(review => review.id !== reviewId))
      toast.success('Review eliminada')
    }

    setDeletingReviewId(null)
  }

  return (
    <section>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ fontFamily: '"Bebas Neue",sans-serif', fontSize: '1.8rem', letterSpacing: '.03em', display: 'flex', alignItems: 'center', gap: '.5rem', color: 'var(--ink)' }}>
          <MessageCircle size={22} color="var(--red)" />
          Reviews {reviews.length > 0 && <span style={{ fontFamily: 'Manrope,sans-serif', fontSize: '1rem', fontWeight: 400, color: 'var(--muted)' }}>({reviews.length})</span>}
        </h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary" style={{ fontSize: '.8rem', padding: '.55rem 1.1rem' }}>
          <PlusCircle size={14} /> {showForm ? 'Cancelar' : 'Escribir review'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '2rem', marginBottom: '1.75rem', boxShadow: 'var(--shadow)' }}>
          <h3 style={{ fontFamily: '"Bebas Neue",sans-serif', fontSize: '1.5rem', letterSpacing: '.03em', marginBottom: '1.5rem', color: 'var(--ink)' }}>
            Tu veredicto sobre <span style={{ color: 'var(--red)' }}>{bocataName}</span>
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label className="input-label">Tu nombre *</label>
                <input className="input-field" type="text" placeholder="Pepe el Tragaldabas" value={form.author_name} onChange={e => setForm({ ...form, author_name: e.target.value })} required />
              </div>
              <div>
                <label className="input-label">Título de la review</label>
                <input className="input-field" type="text" placeholder="Una experiencia mística" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <label className="input-label">Fecha</label>
                <input className="input-field" type="date" value={form.eaten_at} onChange={e => setForm({ ...form, eaten_at: e.target.value })} />
              </div>
              <div>
                <label className="input-label">Precio pagado (€)</label>
                <input className="input-field" type="number" step="0.50" min="0" placeholder="3.50" value={form.price_paid} onChange={e => setForm({ ...form, price_paid: e.target.value })} />
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label className="input-label">Tu review *</label>
              <textarea className="input-field" style={{ minHeight: '110px', resize: 'none', lineHeight: 1.6 }}
                placeholder="¿Fue una revelación? ¿Una decepción? ¿Cambiaste de religión al morderlo?"
                value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} required />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label className="input-label" style={{ marginBottom: '.75rem' }}>Nota final (1–10)</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: '.75rem', alignItems: 'center' }}>
                <SliderInput label="Tu nota" value={form.score_total} onChange={v => setForm({ ...form, score_total: v })} />
                <div style={{ background: avgBg, borderRadius: '10px', padding: '.85rem 1rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                  <span style={{ fontSize: '.65rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,.7)', fontFamily: 'Manrope,sans-serif', marginBottom: '.2rem' }}>Tu nota</span>
                  <span style={{ fontFamily: '"Bebas Neue",sans-serif', fontSize: '2.5rem', color: '#fff', lineHeight: 1, letterSpacing: '.03em' }}>{avgScore.toFixed(1)}</span>
                </div>
              </div>
            </div>

            {/* Would repeat */}
            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '.75rem' }}>
              <button type="button" onClick={() => setForm({ ...form, would_repeat: !form.would_repeat })}
                style={{ display: 'flex', alignItems: 'center', gap: '.5rem', padding: '.55rem 1.1rem', borderRadius: '8px', border: `2px solid ${form.would_repeat ? 'rgba(42,106,59,.3)' : 'rgba(155,42,26,.3)'}`, background: form.would_repeat ? 'var(--green-light)' : 'var(--red-light)', color: form.would_repeat ? 'var(--green)' : 'var(--red)', fontFamily: 'Manrope,sans-serif', fontSize: '.82rem', fontWeight: 700, cursor: 'pointer', transition: 'all .2s' }}>
                {form.would_repeat ? <CheckCircle size={14} /> : <XCircle size={14} />}
                {form.would_repeat ? 'Repetiría' : 'No repetiría'}
              </button>
              <span style={{ fontSize: '.75rem', color: 'var(--muted)', fontFamily: 'Manrope,sans-serif' }}>¿Volverías a pedirlo?</span>
            </div>

            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '.9rem', fontSize: '.88rem', opacity: loading ? .6 : 1 }}>
              {loading ? 'Publicando veredicto...' : '🥖 Publicar review'}
            </button>
          </form>
        </div>
      )}

      {/* Reviews list */}
      {reviews.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3.5rem 2rem', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '.75rem' }}>🤔</div>
          <p style={{ fontFamily: '"Bebas Neue",sans-serif', fontSize: '1.3rem', letterSpacing: '.03em', marginBottom: '.35rem' }}>Nadie ha dado su veredicto aún</p>
          <p style={{ fontFamily: 'Lora,serif', fontStyle: 'italic', fontSize: '.85rem', color: 'var(--muted)' }}>Sé el primero en juzgar este bocata.</p>
        </div>
      ) : (
        <div>{reviews.map(r => (
          <ReviewCard
            key={r.id}
            review={r}
            onDelete={handleDeleteReview}
            deleting={deletingReviewId === r.id}
          />
        ))}</div>
      )}

      <style>{`
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px; height: 18px;
          border-radius: 50%;
          background: var(--red);
          box-shadow: 0 2px 6px rgba(155,42,26,.35);
          cursor: pointer;
          border: 2px solid #fff;
        }
      `}</style>
    </section>
  )
}
