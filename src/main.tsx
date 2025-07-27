import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import MainPage from './pages'
import './styles/index.css'
import { ThemeProvider } from './contexts/ThemeContext'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ThemeProvider>
            <MainPage />
        </ThemeProvider>
    </StrictMode>
)
