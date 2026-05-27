import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { Bocata } from '@/lib/supabase/types'
import EditBocataForm from './EditBocataForm'

type PageProps = { params: Promise<{ id: string }> }

export const metadata: Metadata = {
  title: 'Editar bocata',
  description: 'Corrige el nombre del local o la dirección del bocata.',
}

export default async function EditBocataPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: bocata, error } = await supabase
    .from('bocatas')
    .select('*')
    .eq('slug', id)
    .single()

  if (error || !bocata) notFound()

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '3.5rem 2rem 5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div className="section-eyebrow" style={{ marginBottom: '.6rem' }}>Correcciones</div>
        <h1 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 'clamp(2.5rem,5vw,3.5rem)', letterSpacing: '.03em', color: 'var(--ink)', lineHeight: 1, marginBottom: '.5rem' }}>
          Editar bocata
        </h1>
        <p style={{ fontFamily: 'Lora, serif', fontStyle: 'italic', color: 'var(--muted)', fontSize: '.95rem' }}>
          Ajusta el nombre del local, la ciudad o la dirección si se ha escrito mal.
        </p>
      </div>
      <EditBocataForm bocata={bocata as Bocata} />
    </div>
  )
}
