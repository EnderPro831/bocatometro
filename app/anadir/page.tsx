'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { generateSlug } from '@/lib/utils'
import type { Database } from '@/lib/supabase/types'
import toast from 'react-hot-toast'
import { Upload, X, MapPin, AlertCircle } from 'lucide-react'

/* Tags removed per user request */

const STEPS = [
  { n: 1, label: 'El bocata' },
  { n: 2, label: 'Las fotos' },
  { n: 3, label: 'Etiquetas' },
]

function parseError(e: { code?: string; message?: string } | null): string {
  if (!e) return 'Error desconocido'
  const m = e.message || ''
  const c = e.code || ''
  if (m.includes('Bucket not found'))      return 'Bucket "bocata-images" no existe. Ejecuta el SQL de fix en Supabase.'
  if (m.includes('row-level security') || m.includes('policy')) return 'Error de permisos RLS. Ejecuta el SQL de fix en Supabase.'
  if (c === '23505')                       return 'Ya existe un bocata con ese nombre. Cambia el nombre o el local.'
  if (m.includes('JWT') || c === 'PGRST301') return 'Error de sesión. Recarga la página.'
  if (m.includes('NetworkError') || m.includes('fetch')) return 'Error de red. Comprueba tu conexión.'
  return `${m} (${c})`
}

export default function AnadirPage() {
  const router  = useRouter()
  const [step, setStep]         = useState(1)
  const [loading, setLoading]   = useState(false)
  const [uploading, setUploading] = useState(false)
  const [images, setImages]     = useState<string[]>([])
  // tags removed — no longer used
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '', place_name: '', place_address: '',
    place_city: 'Barcelona', description: '',
  })

  const [supabase] = useState(() => createClient() as ReturnType<typeof createClient>)

  // ── Upload ────────────────────────────────────────────────
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!acceptedFiles.length) return
    setUploading(true)
    setUploadError(null)
    const urls: string[] = []

    for (const file of acceptedFiles) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`"${file.name}" supera los 5MB`)
        continue
      }

      const ext  = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z]/g, '')
      const path = `bocatas/${Date.now()}-${Math.random().toString(36).slice(2,8)}.${ext}`

      const { data, error } = await supabase.storage
        .from('bocata-images')
        .upload(path, file, { cacheControl: '3600', upsert: false })

      if (error) {
        const msg = parseError(error)
        console.error('[Upload]', error)
        setUploadError(msg)
        toast.error('Error subiendo imagen: ' + msg)
        continue
      }

      const { data: urlData } = supabase.storage.from('bocata-images').getPublicUrl(data.path)
      urls.push(urlData.publicUrl)
    }

    if (urls.length) {
      setImages(prev => [...prev, ...urls])
      toast.success(`${urls.length} foto${urls.length > 1 ? 's' : ''} subida${urls.length > 1 ? 's' : ''} ✓`)
    }
    setUploading(false)
  }, [supabase])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/jpg': [], 'image/png': [], 'image/webp': [] },
    maxFiles: 8,
    maxSize: 5 * 1024 * 1024,
  })

  // ── Guardar ───────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.name.trim()) { toast.error('El nombre es obligatorio'); return }
    setLoading(true)

    const slug = `${generateSlug(form.name, form.place_name)}-${Date.now().toString(36)}`

    const bocataPayload: Database['public']['Tables']['bocatas']['Insert'] = {
      slug,
      name:            form.name.trim(),
      place_name:      form.place_name.trim()    || null,
      place_address:   form.place_address.trim() || null,
      place_city:      form.place_city.trim()    || 'Barcelona',
      description:     form.description.trim()   || null,
      cover_image_url: images[0] || null,
      images:          images.slice(1),
      tags:             [],
      is_hall_of_fame:  false,
      created_by:       null,
    }

    const { data, error } = await (supabase as any)
      .from('bocatas')
      .insert(bocataPayload)
      .select('slug')
      .single()

    if (error) {
      console.error('[Insert]', error)
      toast.error(parseError(error))
      setLoading(false)
      return
    }

    toast.success('¡Bocata publicado! 🥖')
    router.push(`/bocata/${data.slug}`)
  }

  // ── Render ────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '3.5rem 2rem 5rem' }}>

      <div style={{ marginBottom: '2.5rem' }}>
        <div className="section-eyebrow" style={{ marginBottom: '.6rem' }}>El tribunal te necesita</div>
        <h1 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 'clamp(2.5rem,5vw,3.5rem)', letterSpacing: '.03em', color: 'var(--ink)', lineHeight: 1, marginBottom: '.4rem' }}>
          Añadir Bocata
        </h1>
        <p style={{ fontFamily: 'Lora, serif', fontStyle: 'italic', fontSize: '.95rem', color: 'var(--muted)' }}>
          Documenta tu experiencia. El mundo merece saberlo.
        </p>
      </div>

      {/* Steps */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2.5rem' }}>
        {STEPS.map(({ n, label }, i) => {
          const done = n < step; const active = n === step
          return (
            <div key={n} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
              <button
                onClick={() => done && setStep(n)}
                style={{ display: 'flex', alignItems: 'center', gap: '.4rem', padding: '.45rem .85rem', borderRadius: '8px', background: active ? 'var(--red)' : done ? 'var(--green-light)' : 'var(--cream2)', border: `1px solid ${active ? 'var(--red)' : done ? 'rgba(42,106,59,.2)' : 'var(--border)'}`, color: active ? '#fff' : done ? 'var(--green)' : 'var(--muted)', fontFamily: 'Manrope, sans-serif', fontSize: '.75rem', fontWeight: 600, cursor: done ? 'pointer' : 'default', whiteSpace: 'nowrap', transition: 'all .2s' }}
              >
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '1.5px solid currentColor', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.62rem', fontWeight: 700, flexShrink: 0 }}>
                  {done ? '✓' : n}
                </div>
                {label}
              </button>
              {i < STEPS.length - 1 && <div style={{ flex: 1, height: '1px', background: done ? 'rgba(42,106,59,.3)' : 'var(--border)', maxWidth: '40px', minWidth: '16px' }} />}
            </div>
          )
        })}
      </div>

      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '2rem', boxShadow: 'var(--shadow)' }}>

        {/* STEP 1 */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label className="input-label">Nombre del bocata *</label>
              <input className="input-field" style={{ fontSize: '1rem' }} type="text" placeholder="ej: Jamón Ibérico de Bellota" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} autoFocus />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '.3rem' }}><MapPin size={11} /> Local / Bar</label>
                <input className="input-field" type="text" placeholder="Bar Central" value={form.place_name} onChange={e => setForm({ ...form, place_name: e.target.value })} />
              </div>
              <div>
                <label className="input-label">Ciudad</label>
                <input className="input-field" type="text" placeholder="Barcelona" value={form.place_city} onChange={e => setForm({ ...form, place_city: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="input-label">Dirección (opcional)</label>
              <input className="input-field" type="text" placeholder="Calle Mayor 15" value={form.place_address} onChange={e => setForm({ ...form, place_address: e.target.value })} />
            </div>
            <div>
              <label className="input-label">Descripción (opcional)</label>
              <textarea className="input-field" style={{ minHeight: '100px', resize: 'none', lineHeight: 1.6 }} placeholder="¿Qué lleva? ¿Cuál es su esencia?" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '.9rem', marginTop: '.5rem' }}
              onClick={() => { if (!form.name.trim()) { toast.error('El nombre es obligatorio'); return } setStep(2) }}>
              Siguiente — Las fotos →
            </button>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div>
            <h3 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '1.4rem', letterSpacing: '.03em', marginBottom: '.35rem', color: 'var(--ink)' }}>Las fotos</h3>
            <p style={{ fontFamily: 'Lora, serif', fontStyle: 'italic', fontSize: '.85rem', color: 'var(--muted)', marginBottom: '1.25rem' }}>
              Máx 8 imágenes · JPG, PNG, WEBP · 5MB por foto
            </p>

            {/* Error de upload */}
            {uploadError && (
              <div style={{ background: 'var(--red-light)', border: '1px solid rgba(155,42,26,.25)', borderRadius: '10px', padding: '.85rem 1rem', marginBottom: '1rem', display: 'flex', gap: '.65rem', alignItems: 'flex-start' }}>
                <AlertCircle size={16} color="var(--red)" style={{ flexShrink: 0, marginTop: '.1rem' }} />
                <div>
                  <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: '.8rem', fontWeight: 700, color: 'var(--red)', marginBottom: '.2rem' }}>Error al subir imagen</p>
                  <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: '.75rem', color: 'var(--red)', lineHeight: 1.5 }}>{uploadError}</p>
                  <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: '.72rem', color: 'var(--muted)', marginTop: '.4rem', lineHeight: 1.5 }}>
                    Solución: ve a <strong>Supabase → SQL Editor</strong> y ejecuta el archivo <strong>fix_storage_y_rls.sql</strong> incluido en el proyecto.
                  </p>
                </div>
              </div>
            )}

            <div {...getRootProps()} style={{ border: `2px dashed ${isDragActive ? 'var(--red)' : 'var(--border2)'}`, borderRadius: '14px', padding: '2.5rem 2rem', textAlign: 'center', cursor: 'pointer', background: isDragActive ? 'var(--red-light)' : 'var(--cream2)', transition: 'all .2s', marginBottom: '1.25rem' }}>
              <input {...getInputProps()} />
              <Upload size={30} style={{ color: isDragActive ? 'var(--red)' : 'var(--muted)', margin: '0 auto .9rem', opacity: .6, display: 'block' }} />
              <p style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 600, color: 'var(--ink2)', marginBottom: '.25rem', fontSize: '.88rem' }}>
                {uploading ? 'Subiendo...' : isDragActive ? 'Suelta aquí' : 'Arrastra fotos o haz clic'}
              </p>
              <p style={{ fontSize: '.72rem', color: 'var(--muted)', fontFamily: 'Manrope, sans-serif' }}>JPG, PNG, WEBP · máx 5MB</p>
            </div>

            {images.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ fontSize: '.7rem', fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--green)', fontFamily: 'Manrope, sans-serif', marginBottom: '.6rem' }}>
                  ✓ {images.length} foto{images.length > 1 ? 's' : ''} subida{images.length > 1 ? 's' : ''}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '.5rem' }}>
                  {images.map((url, i) => (
                    <div key={url} style={{ position: 'relative', aspectRatio: '1', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                      <Image src={url} alt={`Foto ${i + 1}`} fill style={{ objectFit: 'cover' }} sizes="100px" />
                      {i === 0 && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(28,18,8,.65)', color: '#fff', fontSize: '.52rem', fontWeight: 700, textAlign: 'center', padding: '.2rem', letterSpacing: '.05em', textTransform: 'uppercase', fontFamily: 'Manrope, sans-serif' }}>Principal</div>}
                      <button onClick={() => setImages(images.filter(u => u !== url))} style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(28,18,8,.7)', color: '#fff', border: 'none', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <X size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '.75rem', marginTop: '1rem' }}>
              <button onClick={() => setStep(1)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>← Atrás</button>
              <button onClick={() => setStep(3)} className="btn-primary"   style={{ flex: 1, justifyContent: 'center' }}>Siguiente →</button>
            </div>
          </div>
        )}

        {/* STEP 3 — simple confirmation (tags removed) */}
        {step === 3 && (
          <div>
            <h3 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '1.4rem', letterSpacing: '.03em', marginBottom: '.35rem', color: 'var(--ink)' }}>Resumen</h3>
            <p style={{ fontFamily: 'Lora, serif', fontStyle: 'italic', fontSize: '.85rem', color: 'var(--muted)', marginBottom: '1.25rem' }}>Revisa y publica. Las etiquetas han sido eliminadas.</p>

            <div style={{ background: 'var(--cream2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.1rem 1.25rem', marginBottom: '1.5rem' }}>
              {[
                { l: 'Nombre', v: form.name || '—' },
                { l: 'Local',  v: form.place_name || '—' },
                { l: 'Ciudad', v: form.place_city || '—' },
                { l: 'Fotos',  v: `${images.length}` },
              ].map(({ l, v }) => (
                <div key={l} style={{ display: 'flex', gap: '.75rem', fontSize: '.82rem', marginBottom: '.35rem', fontFamily: 'Manrope, sans-serif' }}>
                  <span style={{ color: 'var(--muted)', width: '60px', flexShrink: 0 }}>{l}</span>
                  <span style={{ color: 'var(--ink)', fontWeight: 500 }}>{v}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '.75rem' }}>
              <button onClick={() => setStep(2)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>← Atrás</button>
              <button onClick={handleSubmit} disabled={loading} className="btn-primary" style={{ flex: 2, justifyContent: 'center', opacity: loading ? .6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
                {loading ? 'Guardando...' : '🥖 Publicar bocata'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
