import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn('skeleton animate-shimmer', className)}
    />
  )
}

// Skeleton para tarjeta de bocata
export function BocataCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <Skeleton className="w-full h-56" />
      <div className="p-5 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-12 w-12 rounded-xl ml-4" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>
    </div>
  )
}

// Skeleton para fila de ranking
export function RankingRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-bocata-dark border border-cream-200 dark:border-bocata-brown/30">
      <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
      <Skeleton className="w-16 h-16 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
      </div>
      <Skeleton className="w-16 h-10 rounded-xl shrink-0" />
    </div>
  )
}

// Grid de skeletons para la home
export function BocataGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <BocataCardSkeleton key={i} />
      ))}
    </div>
  )
}
