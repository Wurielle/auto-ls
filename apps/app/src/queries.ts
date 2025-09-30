import { useMutation, useQuery } from '@tanstack/react-query'

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
            return (await electronStore.get('processes')).find((p) => p.path === path)
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

export const useGetIconsPathQuery = () => {
    return useQuery({
        queryKey: ['icons-path'],
        queryFn() {
            return electronApi.getIconsPath()
        },
    })
}

export const useSettingsPropertyQuery = <V = any>(path: string) => {
    return useQuery<V>({
        queryKey: ['settings', path],
        queryFn() {
            return electronStore.get(path)
        },
    })
}

export const useSettingsPropertyMutation = <V>(path: string) => {
    return useMutation({
        mutationFn(value: V) {
            return electronStore.set(path, value)
        },
    })
}