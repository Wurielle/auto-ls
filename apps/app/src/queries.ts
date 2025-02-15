import { useQuery } from '@tanstack/react-query'

export const useGetProcessesQuery = () => {
    return useQuery({
        queryKey: ['processes'],
        queryFn() {
            return electronStore.get('processes');
        }
    })
}

export const useGetLSExecutablePathQuery = () => {
    return useQuery({
        queryKey: ['ls-executable-path'],
        queryFn() {
            return electronStore.get('lsExecutablePath');
        }
    })
}