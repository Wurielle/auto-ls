import { Grid, Group, Stack } from '@/components'
import { useGetProcessesQuery } from '@/queries.ts'
import { HTMLAttributes, useEffect, useMemo, useRef, useState } from 'react'
import orderBy from 'lodash/orderBy'
import ProcessCard from '@/components/cards/process-card.tsx'
import DefaultShell from '@/components/shells/default-shell.tsx'
import { Box, Button, createListCollection, Input, Portal, Spinner, Tabs, Text } from '@chakra-ui/react'
import { InputGroup } from '@/components/ui/input-group.tsx'
import {
    DialogActionTrigger,
    DialogBackdrop,
    DialogBody,
    DialogCloseTrigger,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogRoot,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog.tsx'
import { LuGamepad2, LuSearch, LuServerCog } from "react-icons/lu"
import { useMutation, useQuery } from '@tanstack/react-query'
import { SelectContent, SelectItem, SelectRoot, SelectTrigger, SelectValueText } from '@/components/ui/select.tsx'
import { Field } from '@/components/ui/field.tsx'
import useFuse from 'use-fuse'
import { CloseButton } from '@/components/ui/close-button.tsx'
import { navigateByDirection, useFocusable, SpatialNavigation  } from '@noriginmedia/norigin-spatial-navigation'
import { mergeRefs } from '@mantine/hooks'

function ProcessesList({ onSelect }: { onSelect: any }) {
    const gamesQuery = useQuery({
        queryKey: ['game-library', 'get-processes'],
        queryFn() {
            return gameLibrary.getProcesses()
        },
    })

    const [search, setSearch] = useState('')

    const filteredData = useMemo(() => orderBy(gamesQuery.data?.filter((p) => !['N/A', 'OLEChannelWnd', 'OleMainThreadWndName'].includes(p.windowTitle)), ['windowTitle']) || [], [gamesQuery.data])

    const filteredList = useFuse(filteredData, search, {
        keys: ['windowTitle'],
        threshold: 0.6,
    })

    const list = (search ? filteredList : filteredData)

    const inputRef = useRef<HTMLInputElement | null>(null)

    const endElement = search ? (
        <CloseButton
            size="xs"
            onClick={ () => {
                setSearch("")
                inputRef.current?.focus()
            } }
            me="-2"
        />
    ) : undefined


    const { mutate, isPending } = useMutation({
        mutationFn(pid) {
            return gameLibrary.getProcessPath(pid)
                .then(async (result) => {
                    await gameLibrary.addProcess(result[0].bin)
                    ALS.scaleByPid(pid, 0)
                    onSelect?.()
                })
        },
    })
    return (
        <Stack gap={ '6' }>
            <InputGroup
                width={ "full" }
                startElement={ <LuSearch/> }
                endElement={ endElement }
            >
                <Input ref={ inputRef } placeholder="Search" value={ search }
                       onChange={ (e) => setSearch(e.target.value) }/>
            </InputGroup>
            <Box divideY={ "1px" }>
                { gamesQuery.isFetching ?
                    <Group
                        justify={ 'center' }><Spinner/></Group> : list.length ? list.map((game, i) => (
                        <Group py={ '3' } justify={ 'between' } key={ `${ i }-${ game.id }` }>
                            <Stack gap={ '0' }>
                                <Text>
                                    { game.windowTitle }
                                </Text>
                                <Text color={ 'grey' } textStyle={ 'xs' }>
                                    { game.path }
                                </Text>
                            </Stack>
                            <Button size={ 'sm' } variant={ 'subtle' } disabled={ isPending } loading={ isPending }
                                    onClick={ () => mutate(game.pid) }>Select</Button>
                        </Group>
                    )) : <Text className={ 'text-center' }>No processes found.</Text> }
            </Box>
        </Stack>
    )
}

function GameExesModal({ children, game, onSubmit }: HTMLAttributes<HTMLDivElement> & { game: any, onSubmit: any }) {
    const [value, setValue] = useState()
    const gameExesQuery = useQuery({
        queryKey: ['game-library', 'get-exes', game.path],
        queryFn() {
            return gameLibrary.getExes(game.path)
        },
    })
    const collection = useMemo(() => createListCollection({
        items: (gameExesQuery.data || []).map(({ path }) => ({
            label: path.replace(game.path.replace(/\\/g, '/'), ''),
            value: path,
        })),
    }), [gameExesQuery.data])

    const [open, setOpen] = useState(false)
    const { mutate, isPending } = useMutation({
        async mutationFn() {
            await gameLibrary.addProcess(value[0])
            setOpen(false)
            onSubmit?.()
        },
    })
    return (
        <DialogRoot open={ open } onOpenChange={ ({ open }) => setOpen(open) } size={ 'lg' }>
            <DialogTrigger asChild>
                { children }
            </DialogTrigger>
            <Portal>
                <DialogBackdrop/>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{ game.name }</DialogTitle>
                    </DialogHeader>
                    <DialogBody className={ 'relative z-10' }>
                        <Field label="Select executable" helperText={ `Relative to "${ game.path }"` }>
                            <InputGroup
                                width={ "full" }
                            >
                                <SelectRoot
                                    value={ value }
                                    onValueChange={ (details) => setValue(details.value) }
                                    collection={ collection }
                                >
                                    <SelectTrigger>
                                        <SelectValueText placeholder={ 'Select executable' }/>
                                    </SelectTrigger>
                                    <SelectContent portalled={ false }>
                                        { collection.items.map((item) => (
                                            <SelectItem item={ item } key={ item.value }>
                                                { item.label }
                                            </SelectItem>
                                        )) }
                                    </SelectContent>
                                </SelectRoot>
                            </InputGroup>
                        </Field>
                    </DialogBody>
                    <DialogFooter>
                        <DialogActionTrigger asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogActionTrigger>
                        <Button loading={ isPending } disabled={ isPending || !value }
                                onClick={ mutate }>Confirm</Button>
                    </DialogFooter>
                    <DialogCloseTrigger/>
                </DialogContent>
            </Portal>
        </DialogRoot>
    )
}

function GamesList({ onSelect }: { onSelect: any }) {
    const gamesQuery = useQuery({
        queryKey: ['game-library', 'get-games'],
        queryFn() {
            return gameLibrary.getGames()
        },
    })

    const [search, setSearch] = useState('')

    const filteredList = useFuse(gamesQuery.data || [], search, {
        keys: ['name'],
        threshold: 0.6,
    })

    const list = (search ? filteredList : gamesQuery.data)

    const inputRef = useRef<HTMLInputElement | null>(null)

    const endElement = search ? (
        <CloseButton
            size="xs"
            onClick={ () => {
                setSearch("")
                inputRef.current?.focus()
            } }
            me="-2"
        />
    ) : undefined

    return (
        <Stack gap={ '6' }>
            <InputGroup
                width={ "full" }
                startElement={ <LuSearch/> }
                endElement={ endElement }
            >
                <Input ref={ inputRef } placeholder="Search" value={ search }
                       onChange={ (e) => setSearch(e.target.value) }/>
            </InputGroup>
            <Box divideY={ "1px" }>
                { gamesQuery.isFetching ?
                    <Group justify={ 'center' }><Spinner/></Group> : list.length ? list.map((game, i) => (
                        <Group py={ '3' } justify={ 'between' } key={ `${ i }-${ game.id }` }>
                            <Stack gap={ '0' }>
                                <Text>
                                    { game.name }
                                </Text>
                                <Text color={ 'grey' } textStyle={ 'xs' }>
                                    { game.path }
                                </Text>
                            </Stack>
                            <GameExesModal game={ game } onSubmit={ onSelect }>
                                <Button size={ 'sm' } variant={ 'subtle' }>Select</Button>
                            </GameExesModal>
                        </Group>
                    )) : <Text className={ 'text-center' }>No games found.</Text> }
            </Box></Stack>
    )
}

function AddProcessModal({ children }: HTMLAttributes<HTMLDivElement>) {
    const [open, setOpen] = useState(false)
    return (
        <DialogRoot open={ open } onOpenChange={ ({ open }) => setOpen(open) } size={ 'xl' }>
            <DialogTrigger asChild>
                { children }
            </DialogTrigger>
            <Portal>
                <DialogBackdrop/>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add</DialogTitle>
                    </DialogHeader>
                    <DialogBody>
                        <Tabs.Root lazyMount unmountOnExit defaultValue="library" variant={ 'subtle' }>
                            <Tabs.List>
                                <Tabs.Trigger value="library">
                                    <LuGamepad2/>
                                    From Game library
                                </Tabs.Trigger>
                                <Tabs.Trigger value="processes">
                                    <LuServerCog/>
                                    From Running Processes
                                </Tabs.Trigger>
                            </Tabs.List>
                            <Tabs.Content value="processes">
                                <ProcessesList onSelect={ () => setOpen(false) }/>
                            </Tabs.Content>
                            <Tabs.Content value="library">
                                <GamesList onSelect={ () => setOpen(false) }/>
                            </Tabs.Content>
                        </Tabs.Root>
                    </DialogBody>
                    <DialogCloseTrigger/>
                </DialogContent>
            </Portal>
        </DialogRoot>
    )
}

export default function HomePage() {
    const { data: processesData = [] } = useGetProcessesQuery()
    const orderedProcesses = useMemo(() => orderBy(processesData, 'lastScaledAt', 'desc'), [processesData])

    const [search, setSearch] = useState('')
    const filteredProcesses = useFuse(orderedProcesses, search, {
        keys: ['path'],
        threshold: 0.6,
    })

    const processList = (search ? filteredProcesses : orderedProcesses)

    const inputRef = useRef<HTMLInputElement | null>(null)

    const endElement = search ? (
        <CloseButton
            size="xs"
            onClick={ () => {
                setSearch("")
                inputRef.current?.focus()
            } }
            me="-2"
        />
    ) : undefined

    const { ref: inputFocusRef } = useFocusable({
        onFocus: () => {
            console.log(inputFocusRef,)
            inputFocusRef.current?.focus()
        }
    });
    const { ref: buttonRef, focusSelf} = useFocusable({

        onFocus: () => {
            buttonRef.current?.focus()
        }
    });

    useEffect(() => {
        focusSelf()
    }, []);
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case "z":
                    navigateByDirection("up", {nativeEvent: e});
                    break;
                case "s":
                    navigateByDirection("down", {nativeEvent: e});
                    break;
                case "q":
                    navigateByDirection("left", {nativeEvent: e});
                    break;
                case "d":
                    navigateByDirection("right", {nativeEvent: e});
                    break;
            }
            console.log(SpatialNavigation)
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    return (
        <DefaultShell>
            <Stack gap={ '6' }>
                <Grid gap={ '6' }>
                    <Grid.Col span={ 9 } lgSpan={ 10 }>
                        <InputGroup
                            width={ "full" }
                            startElement={ <LuSearch/> }
                            endElement={ endElement }
                        >
                            <Input ref={ mergeRefs(inputRef, inputFocusRef) } placeholder="Search" value={ search }
                                   onChange={ (e) => setSearch(e.target.value) }/>
                        </InputGroup>
                    </Grid.Col>
                    <Grid.Col span={ 3 } lgSpan={ 2 }>
                        <AddProcessModal>
                            <Button ref={buttonRef} variant={ 'subtle' } width={ '100%' }>Add</Button>
                        </AddProcessModal>
                    </Grid.Col>
                </Grid>
                <Grid gap={ '6' }>
                    { processList.length
                        ? processList.map((process, i) => (
                            <Grid.Col key={ `${ i }-${ process.path }` } span={ 12 } mdSpan={ 6 } xlSpan={ 4 }>
                                <ProcessCard process={ process }/>
                            </Grid.Col>
                        ))
                        :
                        <Grid.Col span={ 12 }>
                            <Text className={ 'text-center' }>No processes found.</Text>
                        </Grid.Col>
                    }
                </Grid>
            </Stack>
        </DefaultShell>
    )
}
