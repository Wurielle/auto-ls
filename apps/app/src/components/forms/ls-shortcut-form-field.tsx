import { useGetShortcutKeysQuery, useGetShortcutQuery } from '@/queries.ts'
import { useEffect, useMemo, useState } from 'react'
import { createListCollection, Text } from '@chakra-ui/react'
import { Group, Stack } from '@/components'
import { InputGroup } from '@/components/ui/input-group.tsx'
import { SelectContent, SelectItem, SelectRoot, SelectTrigger, SelectValueText } from '@/components/ui/select.tsx'

export default function LSShortcutFormField({ id, title }: { id: string, title: string }) {
    const { data: keys = {} } = useGetShortcutKeysQuery()
    const { data: shortcut } = useGetShortcutQuery(id)
    const collection = useMemo(() => createListCollection({
        items: Object.entries(keys).filter(([, v]) => typeof v === 'string').map(([key, value]) => ({
            label: value,
            value: Number(key),
        })),
    }), [keys])
    const [value1, setValue1] = useState<string[]>([])
    const [value2, setValue2] = useState<string[]>([])
    const [value3, setValue3] = useState<string[]>([])
    useEffect(() => {
        if (!shortcut) return
        setValue1([shortcut[0]])
        setValue2([shortcut[1]])
        setValue3([shortcut[2]])
    }, [shortcut])
    useEffect(() => {
        if ([value1, value2, value3].every((v) => v.length === 1)) {
            const newShortcut = [value1[0], value2[0], value3[0]].filter(Number.isInteger).map((v) => Number(v))
            electronStore.set(id, newShortcut)
        }
    }, [value1, value2, value3, shortcut])
    return (
        <Stack gap={ 6 } grow>
            <Text fontWeight={ 'medium' } textStyle={ 'sm' }>{ title }</Text>
            <Group grow>
                <InputGroup flexGrow={ 1 } flexShrink={ 0 } width={ '1/3' }>
                    <SelectRoot value={ value1 } onValueChange={ (details) => setValue1(details.value) }
                                collection={ collection }>
                        <SelectTrigger>
                            <SelectValueText/>
                        </SelectTrigger>
                        <SelectContent>
                            { collection.items.map((key) => (
                                <SelectItem item={ key } key={ key.value }>
                                    { key.label }
                                </SelectItem>
                            )) }
                        </SelectContent>
                    </SelectRoot>
                </InputGroup>
                <InputGroup flexGrow={ 1 } flexShrink={ 0 } width={ '1/3' }>
                    <SelectRoot value={ value2 } onValueChange={ (details) => setValue2(details.value) }
                                collection={ collection }>
                        <SelectTrigger>
                            <SelectValueText/>
                        </SelectTrigger>
                        <SelectContent>
                            { collection.items.map((key) => (
                                <SelectItem item={ key } key={ key.value }>
                                    { key.label }
                                </SelectItem>
                            )) }
                        </SelectContent>
                    </SelectRoot>
                </InputGroup>
                <InputGroup flexGrow={ 1 } flexShrink={ 0 } width={ '1/3' }>
                    <SelectRoot value={ value3 } onValueChange={ (details) => setValue3(details.value) }
                                collection={ collection }>
                        <SelectTrigger>
                            <SelectValueText/>
                        </SelectTrigger>
                        <SelectContent>
                            { collection.items.map((key) => (
                                <SelectItem item={ key } key={ key.value }>
                                    { key.label }
                                </SelectItem>
                            )) }
                        </SelectContent>
                    </SelectRoot>
                </InputGroup>
            </Group>
        </Stack>
    )
}