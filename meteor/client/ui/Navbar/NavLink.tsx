import React from 'react'
import { Link, useMatch, useResolvedPath } from 'react-router-dom'

export const NavLink: React.FC<React.PropsWithChildren<{ to: string; className?: string; exact?: boolean }>> =
	function NavLink({ to, className, children, exact }) {
		const resolved = useResolvedPath(to)
		const match = useMatch({ path: resolved.pathname, end: exact ?? false })

		return (
			<li className="nav-item">
				<Link to={to} className={['nav-link', match ? 'active' : undefined, className].filter(Boolean).join(' ')}>
					{children}
				</Link>
			</li>
		)
	}
