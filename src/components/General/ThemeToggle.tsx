import {
    ComputerDesktopIcon,
    MoonIcon,
    SunIcon,
} from '@heroicons/react/16/solid'
import { useTheme } from '../../contexts/ThemeContext'
import IconButton from '../ui/IconButton'

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme()

    const nextTheme =
        theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'

    const cycle = () => setTheme(nextTheme)

    const Icon =
        theme === 'light'
            ? SunIcon
            : theme === 'dark'
              ? MoonIcon
              : ComputerDesktopIcon

    return (
        <IconButton onClick={cycle} aria-label={`Switch to ${nextTheme} mode`}>
            <Icon className="size-6" />
        </IconButton>
    )
}
