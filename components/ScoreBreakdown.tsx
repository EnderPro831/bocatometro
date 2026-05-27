import type { Bocata } from '@/lib/supabase/types'

export default function ScoreBreakdown({ bocata }: { bocata: Bocata }) {
  const overall = Number(bocata.avg_score) || 0
  const overallBg = overall >= 8.5 ? 'var(--green)' : overall >= 7 ? 'var(--amber)' : 'var(--red)'
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
      <div style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ fontFamily: '"Bebas Neue",sans-serif', fontSize: '1.2rem', letterSpacing: '.03em', color: 'var(--ink)', marginBottom: '.2rem' }}>Veredicto Final</h3>
          <p style={{ fontSize: '.7rem', color: 'var(--muted)', fontFamily: 'Manrope,sans-serif' }}>
            Media de {bocata.total_reviews} review{bocata.total_reviews !== 1 ? 's' : ''}
          </p>
        </div>
        <div style={{ background: overallBg, color: '#fff', borderRadius: '14px', width: '68px', height: '68px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 12px rgba(0,0,0,.15)' }}>
          <span style={{ fontFamily: '"Bebas Neue",sans-serif', fontSize: '2.2rem', lineHeight: 1, letterSpacing: '.02em' }}>
            {overall > 0 ? overall.toFixed(1) : '?'}
          </span>
          <span style={{ fontSize: '.5rem', fontWeight: 600, opacity: .7, letterSpacing: '.05em', fontFamily: 'Manrope,sans-serif' }}>/ 10</span>
        </div>
      </div>
    </div>
  )
}
