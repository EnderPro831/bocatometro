import Link from 'next/link'

interface EmptyStateProps {
  emoji?: string
  title: string
  description: string
  action?: {
    label: string
    href: string
  }
}

export default function EmptyState({
  emoji = '🥖',
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="text-6xl mb-4 animate-pulse">{emoji}</div>
      <h3 className="font-display font-bold text-xl mb-2 text-bocata-dark dark:text-cream-100">
        {title}
      </h3>
      <p className="text-sm text-bocata-brown dark:text-cream-400 max-w-xs leading-relaxed mb-6">
        {description}
      </p>
      {action && (
        <Link href={action.href} className="btn-primary">
          {action.label}
        </Link>
      )}
    </div>
  )
}
