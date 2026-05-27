import Link from 'next/link'
import Image from 'next/image'
import { MapPin, TrendingUp } from 'lucide-react'
import type { Bocata } from '@/lib/supabase/types'
import { scoreToLabel } from '@/lib/utils'
import { BadgeList } from '@/components/ui/Badge'

interface RankingRowProps {
  bocata: Bocata
  position: number
}

export default function RankingRow({ bocata, position }: RankingRowProps) {
  const score = Number(bocata.avg_score) || 0
  const scoreColor =
    score >= 8 ? 'text-green-600 dark:text-green-400' :
    score >= 6 ? 'text-bocata-mustard' :
    score >= 4 ? 'text-orange-500' :
    'text-bocata-red'

  const bgColor =
    score >= 8 ? 'bg-green-600' :
    score >= 6 ? 'bg-bocata-mustard' :
    score >= 4 ? 'bg-orange-500' :
    'bg-bocata-red'

  const positionStyle =
    position === 1 ? 'text-bocata-mustard' :
    position === 2 ? 'text-slate-400' :
    position === 3 ? 'text-amber-700' :
    'text-cream-300 dark:text-bocata-brown'

  return (
    <Link href={`/bocata/${bocata.slug}`} className="block group">
      <article className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-bocata-dark border border-cream-200 dark:border-bocata-brown/30 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5">
        {/* Posición */}
        <div className={`shrink-0 w-12 text-center font-display font-black text-3xl leading-none ${positionStyle}`}>
          {position <= 3 ? ['🥇', '🥈', '🥉'][position - 1] : `#${position}`}
        </div>

        {/* Imagen */}
        <div className="shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-cream-200 dark:bg-bocata-brown/30">
          {bocata.cover_image_url ? (
            <Image
              src={bocata.cover_image_url}
              alt={bocata.name}
              width={64}
              height={64}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full image-placeholder">
              <span className="text-2xl opacity-30">🥖</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <h3 className="font-display font-bold text-base text-bocata-dark dark:text-cream-100 group-hover:text-bocata-red transition-colors duration-200 truncate">
              {bocata.name}
            </h3>
            {bocata.is_hall_of_fame && (
              <span className="text-xs bg-bocata-mustard/20 text-bocata-mustard-dark px-1.5 py-0.5 rounded-full shrink-0">
                🏆
              </span>
            )}
          </div>

          {bocata.place_name && (
            <p className="text-xs text-bocata-brown dark:text-cream-500 flex items-center gap-1 mb-1.5 truncate">
              <MapPin size={10} />
              {bocata.place_name}{bocata.place_city ? ` · ${bocata.place_city}` : ''}
            </p>
          )}

          <BadgeList tags={bocata.tags} max={2} />
        </div>

        {/* Score */}
        <div className="shrink-0 text-right">
          <div className={`${bgColor} text-white rounded-xl w-14 h-14 flex flex-col items-center justify-center shadow-md`}>
            <span className="font-display font-black text-xl leading-none">
              {score > 0 ? score.toFixed(1) : '—'}
            </span>
            <span className="text-white/70 text-xs leading-none mt-0.5">/ 10</span>
          </div>
          <p className="text-xs text-bocata-brown dark:text-cream-500 mt-1 text-center">
            {bocata.total_reviews} {bocata.total_reviews === 1 ? 'review' : 'reviews'}
          </p>
        </div>
      </article>
    </Link>
  )
}
