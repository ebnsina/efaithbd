import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'

// Links typed in the admin can point inside the store or anywhere else; only internal ones get client navigation
export function DbLink({
  url,
  newTab,
  className,
  children,
  onClick,
}: {
  url: string
  newTab?: boolean
  className?: string
  children: ReactNode
  onClick?: () => void
}) {
  if (url.startsWith('/') && !url.startsWith('//') && !newTab) {
    return (
      <Link to={url} className={className} onClick={onClick}>
        {children}
      </Link>
    )
  }
  return (
    <a
      href={url}
      className={className}
      onClick={onClick}
      {...(newTab || !url.startsWith('/') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {children}
    </a>
  )
}
