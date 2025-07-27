/* eslint-disable react-refresh/only-export-components */
import {
    createContext,
    useContext,
    useEffect,
    useLayoutEffect,
    useState,
} from 'react'

type ThemeMode = 'light' | 'dark' | 'system'

interface ThemeContext {
    theme: ThemeMode
    setTheme: (mode: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContext | undefined>(undefined)

const getSystemTheme = (): 'light' | 'dark' => {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark'
    else return 'light'
}

const applyTheme = (mode: ThemeMode) => {
    const theme = mode === 'system' ? getSystemTheme() : mode
    document.documentElement.setAttribute('data-theme', theme)
}

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [mode, setMode] = useState<ThemeMode>(getSystemTheme())
    const THEME_LOCAL_STORAGE_KEY = 'theme-mode'

    useLayoutEffect(() => {
        const stored = localStorage.getItem(
            THEME_LOCAL_STORAGE_KEY
        ) as ThemeMode | null
        const initial = stored || 'system'
        applyTheme(initial)
        setMode(initial)
    }, [])

    useEffect(() => {
        const onSystemChange = (e: MediaQueryListEvent) => {
            if (mode === 'system') applyTheme('system')
        }

        if (mode === 'system') {
            const mq = window.matchMedia('(prefers-color-scheme: dark)')
            mq.addEventListener('change', onSystemChange)
            return () => mq.removeEventListener('change', onSystemChange)
        }
    }, [mode])

    const setTheme = (mode: ThemeMode) => {
        localStorage.setItem(THEME_LOCAL_STORAGE_KEY, mode)
        applyTheme(mode)
        setMode(mode)
    }

    return (
        <ThemeContext.Provider value={{ theme: mode, setTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export const useTheme = () => {
    const themeValue = useContext(ThemeContext)
    if (!themeValue) {
        throw new Error('useTheme must be used within a ThemeProvider')
    }
    return themeValue
}
