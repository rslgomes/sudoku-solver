import { forwardRef } from 'react'
import { cn } from '../../libs/cn'

export interface IconButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
    ({ children, className, ...props }, ref) => {
        return (
            <button
                ref={ref}
                type="button"
                className={cn(
                    'cursor-pointer text-fg1 hover-text-fg2 border-none rounded-full p-2 bg-transparent hover:bg-fg2/20',
                    className
                )}
                {...props}
            >
                {children}
            </button>
        )
    }
)

IconButton.displayName = 'IconButton'

export default IconButton
