export default function FooterMainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <footer className="bg-bg-base p-1">
      <div className="shadow-press w-fit">{children}</div>
    </footer>
  )
}
