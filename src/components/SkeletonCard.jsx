// Shimmer skeleton — mirrors PodcastResultCard proportions exactly
// Uses a CSS keyframe animation defined in index.css

/**
 * Single shimmer placeholder card.
 * Render an array of these while status === 'loading'.
 */
export default function SkeletonCard() {
  return (
    <div
      className="card-tonal flex gap-4 items-start"
      aria-hidden="true"
    >
      {/* Artwork placeholder */}
      <div className="h-20 w-20 shrink-0 rounded-[4px] skeleton" />

      {/* Text lines */}
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-4 w-3/4 rounded skeleton" />
        <div className="h-3 w-1/2 rounded skeleton" />
        <div className="h-3 w-full rounded skeleton" />
        <div className="h-3 w-5/6 rounded skeleton" />
      </div>
    </div>
  )
}

/** Renders `count` skeleton cards */
export function SkeletonGrid({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
