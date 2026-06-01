import VisuallyHidden from '../../ui/VisuallyHidden'
import FABDialogOrAside from './components/FABDialogOrAside'
import MainHeader from './components/MainHeader'

interface Props {
  children: React.ReactNode
  aside?: React.ReactNode
}

export default function MainLayout({ children, aside }: Props) {
  return (
    <div
      className="
        grid min-h-screen gap-y-4 gap-x-4 px-2 lg:px-4 lg:pb-4
        [grid-template-areas:'header_header'_'main_main']
        lg:[grid-template-areas:'header_header'_'aside_main']
        grid-cols-[20rem_1fr]
        grid-rows-[auto_1fr]
        bg-bg-page
        text-fg
        font-main
      "
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50"
      >
        ...
        <VisuallyHidden>Skip to main content</VisuallyHidden>
      </a>
      <MainHeader className="[grid-area:header]" />
      {aside && (
        <FABDialogOrAside className="[grid-area:aside]">
          <div className="px-4 py-2">{aside}</div>
        </FABDialogOrAside>
      )}
      <main id="main-content" className="[grid-area:main]" tabIndex={-1}>
        {children}
      </main>
    </div>
  )
}
