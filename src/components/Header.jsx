// Minimalist top header — branding label + page slot
export default function Header({ title, actions }) {
  return (
    <header
      className="
        sticky top-0 z-20 flex h-14 items-center justify-between
        border-b border-surface-border bg-surface-cream/80
        backdrop-blur-sm px-8
      "
    >
      <h1 className="font-editorial text-xl font-medium text-ink">
        {title}
      </h1>
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </header>
  )
}
