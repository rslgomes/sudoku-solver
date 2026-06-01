import { cn } from '../libs/cn'

interface Props
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  size?: 'sm' | 'md'
  children: React.ReactNode
}

export default function ToggleButton({
  className,
  size = 'md',
  children,
  ...delegated
}: Props) {
  const sizes = {
    sm: 'pl-5 pr-2 py-0.5 text-xs gap-1',
    md: 'pl-6 pr-3 py-1 text-sm gap-1.5',
  }

  const dotOffset = {
    sm: 'top-[5px] left-[5px] size-1.5',
    md: 'top-[7px] left-[6px] size-2',
  }

  return (
    <label
      className={cn(
        'group relative inline-flex items-center',
        'bg-bg-raised text-fg font-main shadow-raise',
        'has-[input:checked]:shadow-press has-[input:checked]:bg-bg-sunken',
        'transition-[box-shadow,background-color] duration-75',
        'cursor-default select-none',
        sizes[size],
        className
      )}
    >
      <input type="checkbox" className="sr-only" {...delegated} />

      {/* indicator LED — hollow = off, filled = on */}
      <span
        className={cn(
          'absolute rounded-full transition-[background-color] duration-150',
          'bg-red/50 ring-red/30',
          'group-has-[input:checked]:bg-red group-has-[input:checked]:ring-red/50 group-has-[input:checked]:ring-2',
          dotOffset[size]
        )}
      />

      {children}
    </label>
  )
}
