export default function AccessKey({
  char,
  children,
}: {
  char: string
  children: string
}) {
  const index = children.toLowerCase().indexOf(char.toLowerCase())
  if (index < 0) return <span>{children}</span>

  return (
    <span>
      {children.slice(0, index)}
      <span className="accesskey">{children[index]}</span>
      {children.slice(index + 1)}
    </span>
  )
}
