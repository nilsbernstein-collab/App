import { Skeleton } from './Skeleton'

export function PageSkeleton() {
  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <Skeleton className="h-64 w-full" />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Skeleton className="h-56 w-full" />
        <Skeleton className="h-56 w-full" />
      </div>
    </div>
  )
}
