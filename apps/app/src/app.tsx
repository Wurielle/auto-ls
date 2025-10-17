import { Provider } from '@/components/ui/provider.tsx'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/services/query.ts'
import HomePage from '@/teams/home/views'
import { init,  } from '@noriginmedia/norigin-spatial-navigation';

init({
    distanceCalculationMethod: 'center',
});
export default function App() {
    return (
        <QueryClientProvider client={ queryClient }>
            <Provider>
                <HomePage/>
            </Provider>
        </QueryClientProvider>
    )
}