import React from 'react'
import { Link, useMatch, useResolvedPath } from 'react-router-dom'

export const NavLink: React.FC<React.PropsWithChildren<{ to: string; className?: string }>> = function NavLink({
	to,
	className,
	children,
}) {
	const resolved = useResolvedPath(to)
	const match = useMatch({ path: resolved.pathname, end: true })

	return (
		<li className="nav-item">
			<Link to={to} className={['nav-link', match ? 'active' : undefined, className].filter(Boolean).join(' ')}>
				{children}
			</Link>
		</li>
	)
}
