import type { JSX } from 'react'
import ThemeToggle from '../components/General/ThemeToggle'

export interface MainLayoutProps {
    children: React.ReactNode
}

const BrandHead = ({ children }: { children: React.ReactNode }) => {
    return <h1 className="text-3xl font-bold text-primary">{children}</h1>
}

export default function MainLayout({ children }: MainLayoutProps): JSX.Element {
    return (
        <div className="min-h-screen w-full bg-bg1 isolate">
            <header className="h-[4.5rem] px-8 py-1 flex items-center justify-between z-50 bg-linear-to-b/oklch from-bg1 from-% via-secondary-bg2 via-80% to-bg1 to-95%">
                <BrandHead>{'Sudoku Solver'}</BrandHead>
                <ThemeToggle />
            </header>
            <div className="min-h-[calc(100vh-4.5rem)] w-full flex">
                {children}
            </div>
        </div>
    )
}
