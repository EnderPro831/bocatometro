'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useDropzone } from 'react-dropzone'
import { createClient } from '@/lib/supabase/client'
import type { Bocata } from '@/lib/supabase/types'
import toast from 'react-hot-toast'
import { ArrowLeft, Upload, X } from 'lucide-react'

interface EditBocataFormProps {
  bocata: Bocata
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

export default function EditBocataForm({ bocata }: EditBocataFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [supabase] = useState(() => createClient())
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(bocata.cover_image_url || null)
  const [images, setImages] = useState<string[]>(bocata.images || [])
  const [form, setForm] = useState({
    name: bocata.name || '',
    place_name: bocata.place_name || '',
    place_city: bocata.place_city || '',
    place_address: bocata.place_address || '',
    description: bocata.description || '',
  })

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!acceptedFiles.length) return
    setUploading(true)

    const uploadedUrls: string[] = []
    for (const file of acceptedFiles) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`"${file.name}" supera los 5MB`)
        continue
      }
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z]/g, '')
      const path = `bocatas/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

      const { data, error } = await supabase.storage
        .from('bocata-images')
        .upload(path, file, { cacheControl: '3600', upsert: false })

      if (error) {
        toast.error('Error subiendo imagen: ' + parseError(error))
        console.error(error)
        continue
      }

      const { data: urlData } = supabase.storage.from('bocata-images').getPublicUrl(data.path)
      uploadedUrls.push(urlData.publicUrl)
    }

    if (uploadedUrls.length) {
      if (!coverImageUrl) {
        setCoverImageUrl(uploadedUrls[0])
        setImages(prev => [...prev, ...uploadedUrls.slice(1)])
      } else {
        setImages(prev => [...prev, ...uploadedUrls])
      }
      toast.success(`${uploadedUrls.length} foto${uploadedUrls.length > 1 ? 's' : ''} subida${uploadedUrls.length > 1 ? 's' : ''}`)
    }
    setUploading(false)
  }, [coverImageUrl, supabase])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/jpg': [], 'image/png': [], 'image/webp': [] },
    maxFiles: 8,
    maxSize: 5 * 1024 * 1024,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.error('El nombre del bocata es obligatorio')
      return
    }

    setLoading(true)
    const { error } = await (supabase as any)
      .from('bocatas')
      .update({
        name: form.name.trim(),
        place_name: form.place_name.trim() || null,
        place_city: form.place_city.trim() || null,
        place_address: form.place_address.trim() || null,
        description: form.description.trim() || null,
        cover_image_url: coverImageUrl || null,
        images,
      })
      .eq('id', bocata.id)

    if (error) {
      toast.error(parseError(error))
      console.error(error)
    } else {
      toast.success('Bocata actualizado')
      router.push(`/bocata/${bocata.slug}`)
    }

    setLoading(false)
  }

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '2rem', boxShadow: 'var(--shadow)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <Link href={`/bocata/${bocata.slug}`} className="btn-secondary" style={{ fontSize: '.85rem', padding: '.55rem 1rem' }}>
          <ArrowLeft size={14} /> Volver al bocata
        </Link>
        <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: '.85rem', color: 'var(--muted)' }}>
          Slug actual: <strong>{bocata.slug}</strong>
        </span>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
        <div>
          <label className="input-label">Nombre del bocata *</label>
          <input className="input-field" type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} autoFocus />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label className="input-label">Local / Bar</label>
            <input className="input-field" type="text" value={form.place_name} onChange={e => setForm({ ...form, place_name: e.target.value })} />
          </div>
          <div>
            <label className="input-label">Ciudad</label>
            <input className="input-field" type="text" value={form.place_city} onChange={e => setForm({ ...form, place_city: e.target.value })} />
          </div>
        </div>

        <div>
          <label className="input-label">Dirección</label>
          <input className="input-field" type="text" value={form.place_address} onChange={e => setForm({ ...form, place_address: e.target.value })} />
        </div>

        <div>
          <label className="input-label">Descripción</label>
          <textarea
            className="input-field"
            style={{ minHeight: '110px', resize: 'none', lineHeight: 1.6 }}
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
          />
        </div>

        <div>
          <label className="input-label" style={{ display: 'block', marginBottom: '.75rem' }}>Fotos</label>
          <div {...getRootProps()} style={{ border: `2px dashed ${isDragActive ? 'var(--red)' : 'var(--border2)'}`, borderRadius: '16px', padding: '1.8rem 1.5rem', textAlign: 'center', cursor: 'pointer', background: isDragActive ? 'var(--red-light)' : 'var(--cream2)', transition: 'all .2s' }}>
            <input {...getInputProps()} />
            <Upload size={26} style={{ color: isDragActive ? 'var(--red)' : 'var(--muted)', marginBottom: '.8rem' }} />
            <p style={{ margin: 0, fontFamily: 'Manrope, sans-serif', fontSize: '.92rem', fontWeight: 700, color: 'var(--ink2)' }}>
              {uploading ? 'Subiendo imágenes…' : 'Arrastra más fotos o haz clic para agregar'}
            </p>
            <p style={{ margin: 0, fontSize: '.8rem', color: 'var(--muted)' }}>JPG, PNG, WEBP · máx 5MB por imagen</p>
          </div>

          {(coverImageUrl || images.length > 0) && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '.75rem', marginTop: '1rem' }}>
              {coverImageUrl && (
                <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                  <Image src={coverImageUrl} alt="Foto principal" width={280} height={280} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', top: '0', left: '0', right: '0', padding: '.45rem .6rem', background: 'rgba(0,0,0,.55)', color: '#fff', fontSize: '.72rem', fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Principal</span>
                    <button type="button" onClick={() => {
                      setCoverImageUrl(images[0] || null)
                      setImages(prev => prev.filter(url => url !== coverImageUrl))
                    }} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
                      <X size={14} />
                    </button>
                  </div>
                </div>
              )}

              {images.map(url => (
                <div key={url} style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                  <Image src={url} alt="Foto adicional" width={280} height={280} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                  <button type="button" onClick={() => setImages(prev => prev.filter(item => item !== url))} style={{ position: 'absolute', top: '10px', right: '10px', width: '30px', height: '30px', borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,.55)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '.9rem' }}>
          {loading ? 'Guardando cambios...' : 'Guardar bocata'}
        </button>
      </form>
    </div>
  )
}
