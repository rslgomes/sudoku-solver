import { cn } from '@shared/libs/cn'
import VisuallyHidden from '../../ui/VisuallyHidden'
import HeaderMainLayout from './components/Header'
import FooterMainLayout from './components/Footer'

interface Props {
  children: React.ReactNode
  footer?: React.ReactNode
  header?: React.ReactNode
}

export default function MainLayout({ children, footer, header }: Props) {
  return (
    <div
      className={cn(
        'min-h-screen gap-y-4 gap-x-4',
        'bg-bg-page',
        'text-fg',
        'font-main',
        'p-1 px-2 sm:p-4 sm:px-6'
      )}
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50"
      >
        ...
        <VisuallyHidden>Skip to main content</VisuallyHidden>
      </a>
      <div className="shadow-raise">
        <HeaderMainLayout>{header}</HeaderMainLayout>
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
        {footer && <FooterMainLayout>{footer}</FooterMainLayout>}
      </div>
    </div>
  )
}
