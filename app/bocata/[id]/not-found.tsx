import Link from 'next/link'

export default function BocataNotFound() {
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '6rem 2rem', textAlign: 'center' }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🥖</div>
      <h1 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '2.5rem', letterSpacing: '.03em', color: 'var(--ink)', marginBottom: '.75rem' }}>
        Bocata no encontrado
      </h1>
      <p style={{ fontFamily: 'Lora, serif', fontStyle: 'italic', color: 'var(--muted)', fontSize: '.95rem', lineHeight: 1.7, marginBottom: '2rem', maxWidth: '360px', margin: '0 auto 2rem' }}>
        Este bocata no existe en nuestra base de datos. Puede que nunca haya existido,
        o que ya lo hayan devorado.
      </p>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link href="/" className="btn-primary">Volver al inicio</Link>
        <Link href="/anadir" className="btn-secondary">Añadir bocata</Link>
      </div>
    </div>
  )
}
