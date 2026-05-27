'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, AlertTriangle, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

interface DeleteButtonProps {
  bocataId: string
  bocataName: string
  imageUrls: string[]
}

export default function DeleteButton({ bocataId, bocataName, imageUrls }: DeleteButtonProps) {
  const [open, setOpen]       = useState(false)
  const [loading, setLoading] = useState(false)
  const router                = useRouter()
  const [supabase]            = useState(() => createClient())

  const handleDelete = async () => {
    setLoading(true)

    try {
      // 1. Borrar imágenes del storage
      if (imageUrls.length > 0) {
        const paths = imageUrls.map(url => {
          // Extraer el path relativo desde la URL pública
          // URL: https://xxx.supabase.co/storage/v1/object/public/bocata-images/bocatas/xxx.jpg
          const parts = url.split('/bocata-images/')
          return parts[1] || ''
        }).filter(Boolean)

        if (paths.length > 0) {
          const { error: storageError } = await supabase.storage
            .from('bocata-images')
            .remove(paths)

          if (storageError) {
            // No bloqueamos el borrado si las imágenes fallan
            console.warn('[Delete] Error borrando imágenes:', storageError)
          }
        }
      }

      // 2. Borrar el bocata (cascade borrará reviews y comentarios)
      const { error } = await supabase
        .from('bocatas')
        .delete()
        .eq('id', bocataId)

      if (error) {
        console.error('[Delete] Error:', error)
        toast.error('Error al borrar el bocata: ' + error.message)
        setLoading(false)
        return
      }

      toast.success('Bocata eliminado')
      router.push('/')
      router.refresh()

    } catch (e) {
      console.error('[Delete] Exception:', e)
      toast.error('Error inesperado al borrar')
      setLoading(false)
    }
  }

  return (
    <>
      {/* Botón trigger */}
      <button
        onClick={() => setOpen(true)}
        className="btn-danger"
        style={{ fontSize: '.78rem', padding: '.5rem 1rem' }}
      >
        <Trash2 size={14} />
        Borrar bocata
      </button>

      {/* Modal de confirmación */}
      {open && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(0,0,0,.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1.5rem',
          }}
          onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div style={{
            background: 'var(--card)', borderRadius: '20px',
            border: '1px solid var(--border)',
            boxShadow: '0 20px 60px rgba(0,0,0,.4)',
            padding: '2rem', maxWidth: '420px', width: '100%',
            animation: 'slideUp .25s ease-out',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  background: 'var(--red-light)', border: '1px solid rgba(155,42,26,.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <AlertTriangle size={20} color="var(--red)" />
                </div>
                <h2 style={{
                  fontFamily: '"Bebas Neue", sans-serif',
                  fontSize: '1.5rem', letterSpacing: '.03em', color: 'var(--ink)',
                }}>
                  Borrar bocata
                </h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: '.25rem' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <p style={{
              fontFamily: 'Lora, serif', fontSize: '.95rem',
              color: 'var(--muted)', lineHeight: 1.65, marginBottom: '.75rem',
            }}>
              ¿Seguro que quieres borrar{' '}
              <strong style={{ color: 'var(--ink)', fontWeight: 600 }}>"{bocataName}"</strong>?
            </p>
            <p style={{
              fontFamily: 'Manrope, sans-serif', fontSize: '.78rem',
              color: 'var(--red)', lineHeight: 1.5,
              background: 'var(--red-light)', borderRadius: '8px',
              padding: '.65rem .9rem', marginBottom: '1.5rem',
              border: '1px solid rgba(155,42,26,.15)',
            }}>
              Esta acción es irreversible. Se borrarán también todas las reviews,
              comentarios e imágenes asociadas.
            </p>

            {/* Acciones */}
            <div style={{ display: 'flex', gap: '.75rem' }}>
              <button
                onClick={() => setOpen(false)}
                className="btn-secondary"
                style={{ flex: 1, justifyContent: 'center' }}
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem',
                  fontFamily: 'Manrope, sans-serif', fontSize: '.85rem', fontWeight: 700,
                  color: '#fff', background: loading ? 'var(--muted)' : 'var(--red)',
                  padding: '.75rem 1rem', borderRadius: 'var(--r)', border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'background .2s',
                }}
              >
                <Trash2 size={14} />
                {loading ? 'Borrando...' : 'Sí, borrar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes slideUp { from { transform:translateY(16px);opacity:0 } to { transform:translateY(0);opacity:1 } }`}</style>
    </>
  )
}
