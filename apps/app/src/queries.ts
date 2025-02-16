import { useQuery } from '@tanstack/react-query'

export const useGetProcessesQuery = () => {
    return useQuery({
        queryKey: ['processes'],
        queryFn() {
            return electronStore.get('processes')
        },
    })
}
export const useGetProcessQuery = (path: string) => {
    return useQuery({
        queryKey: ['processes', path],
        async queryFn() {
            console.log(await electronStore.get('processes'))
            return (await electronStore.get('processes')).find((p) => p.path === path)
        },
    })
}

export const useGetLSExecutablePathQuery = () => {
    return useQuery({
        queryKey: ['ls-executable-path'],
        queryFn() {
            return electronStore.get('lsExecutablePath')
        },
    })
}

export const useGetDefaultTimeoutQuery = () => {
    return useQuery({
        queryKey: ['default-timeout'],
        queryFn() {
            return electronStore.get('defaultTimeout')
        },
    })
}

export const useGetShortcutKeysQuery = () => {
    return useQuery({
        queryKey: ['shortcut-keys'],
        queryFn() {
            return electronUtils.getShortcutKeys()
        },
    })
}

export const useGetShortcutQuery = (id: string) => {
    return useQuery({
        queryKey: ['shortcut', id],
        queryFn() {
            return electronStore.get('lsScaleShortcut')
        },
    })
}