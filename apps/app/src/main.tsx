import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './app.tsx'
import { queryClient } from '@/services/query.ts'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App/>
    </StrictMode>,
)


window.electronApi.onEvent('store-update', () => {
    queryClient.refetchQueries()
})