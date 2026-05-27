import { BocataGridSkeleton } from '@/components/ui/Skeleton'

export default function Loading() {
  return (
    <div className="container-main py-10">
      <div className="mb-8">
        <div className="skeleton h-4 w-24 rounded mb-3" />
        <div className="skeleton h-12 w-64 rounded-xl mb-2" />
        <div className="skeleton h-4 w-48 rounded" />
      </div>
      <BocataGridSkeleton count={6} />
    </div>
  )
}
