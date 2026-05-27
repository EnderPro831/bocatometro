'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'

interface ImageGalleryProps {
  images: string[]
  altBase: string
}

export default function ImageGallery({ images, altBase }: ImageGalleryProps) {
  const [lightbox, setLightbox] = useState<number | null>(null)

  const prev = () => setLightbox(i => i === null ? null : (i - 1 + images.length) % images.length)
  const next = () => setLightbox(i => i === null ? null : (i + 1) % images.length)

  // ── Sin imágenes ──────────────────────────────────────────
  if (!images || images.length === 0) {
    return (
      <div style={{
        width: '100%', height: '340px', borderRadius: '16px',
        background: 'linear-gradient(135deg, var(--cream2), var(--cream3))',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '.75rem',
        border: '1px solid var(--border)',
      }}>
        <span style={{ fontSize: '3rem', opacity: .25 }}>🥖</span>
        <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: '.8rem', color: 'var(--muted)' }}>
          Sin fotos aún
        </p>
      </div>
    )
  }

  const [main, ...rest] = images

  // ── Una sola imagen ───────────────────────────────────────
  if (images.length === 1) {
    return (
      <>
        <div
          onClick={() => setLightbox(0)}
          style={{
            width: '100%',
            height: '400px',          // ← altura FIJA, nunca crece más
            borderRadius: '16px',
            overflow: 'hidden',
            cursor: 'zoom-in',
            position: 'relative',
            background: 'var(--cream2)',
            flexShrink: 0,
          }}
        >
          <Image
            src={main}
            alt={`${altBase} — foto 1`}
            fill
            style={{ objectFit: 'cover', objectPosition: 'center' }}
            sizes="(max-width: 768px) 100vw, 66vw"
            priority
          />
          {/* Hover overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background .2s',
          }}
            className="gallery-hover-overlay"
          >
            <ZoomIn size={32} color="#fff" style={{ opacity: 0, transition: 'opacity .2s' }} className="gallery-zoom-icon" />
          </div>
        </div>

        {lightbox !== null && <Lightbox images={images} index={lightbox} onClose={() => setLightbox(null)} onPrev={prev} onNext={next} onDot={setLightbox} altBase={altBase} />}

        <style>{`
          .gallery-hover-overlay:hover { background: rgba(0,0,0,0.18) !important; }
          .gallery-hover-overlay:hover .gallery-zoom-icon { opacity: 1 !important; }
        `}</style>
      </>
    )
  }

  // ── Múltiples imágenes: grid ──────────────────────────────
  return (
    <>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gridTemplateRows: '200px 160px',  // ← filas con altura fija
        gap: '8px',
        height: '368px',                  // ← total fijo: 200+8+160
        borderRadius: '16px',
        overflow: 'hidden',
        flexShrink: 0,
      }}>

        {/* Imagen principal — ocupa las 2 filas */}
        <div
          onClick={() => setLightbox(0)}
          style={{
            gridRow: '1 / 3',
            position: 'relative', overflow: 'hidden',
            cursor: 'zoom-in', background: 'var(--cream2)',
          }}
          className="gallery-cell"
        >
          <Image
            src={main}
            alt={`${altBase} — foto 1`}
            fill
            style={{ objectFit: 'cover', objectPosition: 'center', transition: 'transform .35s' }}
            className="gallery-img"
            sizes="(max-width: 768px) 66vw, 40vw"
            priority
          />
          <div className="gallery-overlay">
            <ZoomIn size={28} color="#fff" />
          </div>
        </div>

        {/* Foto 2 */}
        {rest[0] && (
          <div
            onClick={() => setLightbox(1)}
            style={{ position: 'relative', overflow: 'hidden', cursor: 'zoom-in', background: 'var(--cream2)' }}
            className="gallery-cell"
          >
            <Image src={rest[0]} alt={`${altBase} — foto 2`} fill style={{ objectFit: 'cover', objectPosition: 'center', transition: 'transform .35s' }} className="gallery-img" sizes="33vw" />
            <div className="gallery-overlay"><ZoomIn size={22} color="#fff" /></div>
          </div>
        )}

        {/* Foto 3 o placeholder con +N */}
        <div
          onClick={() => setLightbox(rest[1] ? 2 : 1)}
          style={{ position: 'relative', overflow: 'hidden', cursor: 'zoom-in', background: 'var(--cream2)' }}
          className="gallery-cell"
        >
          {rest[1] ? (
            <>
              <Image src={rest[1]} alt={`${altBase} — foto 3`} fill style={{ objectFit: 'cover', objectPosition: 'center', transition: 'transform .35s' }} className="gallery-img" sizes="33vw" />
              {/* Si hay más de 3, mostrar el +N */}
              {images.length > 3 && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(28,18,8,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '2rem', color: '#fff', letterSpacing: '.03em' }}>
                    +{images.length - 3}
                  </span>
                </div>
              )}
            </>
          ) : (
            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,var(--cream2),var(--cream3))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '1.5rem', opacity: .3 }}>🥖</span>
            </div>
          )}
          {rest[1] && images.length <= 3 && <div className="gallery-overlay"><ZoomIn size={22} color="#fff" /></div>}
        </div>
      </div>

      {lightbox !== null && (
        <Lightbox images={images} index={lightbox} onClose={() => setLightbox(null)} onPrev={prev} onNext={next} onDot={setLightbox} altBase={altBase} />
      )}

      <style>{`
        .gallery-cell { border-radius: 0; }
        .gallery-cell:hover .gallery-img { transform: scale(1.04); }
        .gallery-overlay {
          position: absolute; inset: 0;
          background: rgba(0,0,0,0);
          display: flex; align-items: center; justify-content: center;
          transition: background .2s;
          opacity: 0;
        }
        .gallery-cell:hover .gallery-overlay { background: rgba(0,0,0,0.18); opacity: 1; }
      `}</style>
    </>
  )
}

// ── Lightbox ──────────────────────────────────────────────
function Lightbox({
  images, index, altBase, onClose, onPrev, onNext, onDot,
}: {
  images: string[]
  index: number
  altBase: string
  onClose: () => void
  onPrev: () => void
  onNext: () => void
  onDot: (i: number) => void
}) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 500,
        background: 'rgba(10,6,2,.92)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1.5rem',
      }}
      onClick={onClose}
    >
      {/* Cerrar */}
      <button
        onClick={onClose}
        style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'rgba(255,255,255,.12)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', transition: 'background .2s' }}
      >
        <X size={20} />
      </button>

      {/* Imagen */}
      <div
        style={{ position: 'relative', maxWidth: '900px', width: '100%', maxHeight: '80vh', aspectRatio: '16/10' }}
        onClick={e => e.stopPropagation()}
      >
        <Image
          src={images[index]}
          alt={`${altBase} — foto ${index + 1}`}
          fill
          style={{ objectFit: 'contain' }}
          sizes="100vw"
        />
      </div>

      {/* Controles prev/next */}
      {images.length > 1 && (
        <>
          <button
            onClick={e => { e.stopPropagation(); onPrev() }}
            style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,.12)', border: 'none', borderRadius: '50%', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', transition: 'background .2s' }}
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={e => { e.stopPropagation(); onNext() }}
            style={{ position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,.12)', border: 'none', borderRadius: '50%', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', transition: 'background .2s' }}
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* Dots */}
      {images.length > 1 && (
        <div style={{ position: 'absolute', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '6px' }}>
          {images.map((_, i) => (
            <button
              key={i}
              onClick={e => { e.stopPropagation(); onDot(i) }}
              style={{ width: i === index ? '20px' : '8px', height: '8px', borderRadius: '4px', border: 'none', background: i === index ? '#fff' : 'rgba(255,255,255,.35)', cursor: 'pointer', transition: 'all .2s', padding: 0 }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
