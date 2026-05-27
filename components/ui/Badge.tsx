import { cn, TAG_COLORS } from '@/lib/utils'

interface BadgeProps {
  tag: string
  className?: string
}

export default function Badge({ tag, className }: BadgeProps) {
  const colorClass = TAG_COLORS[tag.toLowerCase()] || 'bg-stone-100 text-stone-800 border-stone-300'

  return (
    <span
      className={cn(
        'tag',
        colorClass,
        className
      )}
    >
      {tag}
    </span>
  )
}

// Para cuando queremos mostrar varios tags
interface BadgeListProps {
  tags: string[]
  max?: number
}

export function BadgeList({ tags, max = 3 }: BadgeListProps) {
  // Tags feature removed — render nothing
  return null
}
