import { cn } from '../libs/cn'

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md'
  ref?: React.ForwardedRef<HTMLButtonElement>
}

export default function Button({
  className,
  size = 'md',
  children,
  ...delegated
}: Props) {
  const sizes = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-3 py-1 text-sm gap-1.5',
  }

  return (
    <button
      {...delegated}
      className={cn(
        'inline-flex items-center justify-center',
        'bg-bg-raised text-fg font-main',
        'shadow-raise',
        'transition-[box-shadow,background-color] duration-75',
        'active:shadow-press active:bg-bg-sunken',
        'disabled:opacity-50 disabled:pointer-events-none',
        'cursor-default select-none',
        sizes[size],
        className
      )}
    >
      {children}
    </button>
  )
}
