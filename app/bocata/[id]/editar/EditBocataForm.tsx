'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Bocata } from '@/lib/supabase/types'
import toast from 'react-hot-toast'
import { ArrowLeft } from 'lucide-react'

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
  const [supabase] = useState(() => createClient())
  const [form, setForm] = useState({
    name: bocata.name || '',
    place_name: bocata.place_name || '',
    place_city: bocata.place_city || '',
    place_address: bocata.place_address || '',
    description: bocata.description || '',
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

        <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '.9rem' }}>
          {loading ? 'Guardando cambios...' : 'Guardar bocata'}
        </button>
      </form>
    </div>
  )
}
