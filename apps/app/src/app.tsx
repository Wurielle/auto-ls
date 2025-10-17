import { Provider } from '@/components/ui/provider.tsx'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/services/query.ts'
import HomePage from '@/teams/home/views'

export default function App() {
    return (
        <QueryClientProvider client={ queryClient }>
            <Provider>
                <HomePage/>
            </Provider>
        </QueryClientProvider>
    )
}