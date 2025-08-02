import { Container, Grid, Group, Stack } from '@/components'
import { Avatar } from '@/components/ui/avatar.tsx'
import { Box, Button, Card, createListCollection, Icon, Input, Portal, Switch, Text } from '@chakra-ui/react'
import logo64 from '@/assets/icons/64x64.png'
import pkg from '~/package.json'
import { Field } from '@/components/ui/field.tsx'
import { InputGroup } from '@/components/ui/input-group.tsx'
import { NumberInputField, NumberInputLabel, NumberInputRoot } from "@/components/ui/number-input"
import { MdTimer } from "react-icons/md"
import { IoGameController } from "react-icons/io5"
import {
    useGetDefaultTimeoutQuery,
    useGetEnableRivaTunerQuery,
    useGetIconsPathQuery,
    useGetLSExecutablePathQuery,
    useGetProcessesQuery,
    useGetProcessQuery,
    useGetRivaTunerExecutablePathQuery,
    useGetShortcutKeysQuery,
    useGetShortcutQuery,
} from '@/queries.ts'
import moment from 'moment'
import { HTMLAttributes, useCallback, useEffect, useMemo, useState } from 'react'
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
} from "@/components/ui/dialog"
import { SelectContent, SelectItem, SelectRoot, SelectTrigger, SelectValueText } from "@/components/ui/select"
import orderBy from 'lodash/orderBy'
import { AutoUpdateFormField } from '@/components/forms/auto-update-form-field.tsx'
import { useMutation } from '@tanstack/react-query'

function ProcessModal({ children, title, timeout, path }: HTMLAttributes<HTMLElement> & {
    title: string,
    path: string,
    timeout: number
}) {
    const { data: process, isSuccess: isProcessFetchSuccess } = useGetProcessQuery(path)
    const { data: processes, isSuccess: isProcessesFetchSuccess } = useGetProcessesQuery()
    const [scaleTimeout, setScaleTimeout] = useState<number>(timeout)
    useEffect(() => {
        if (isProcessFetchSuccess && isProcessesFetchSuccess) {
            electronStore.set('processes', [...processes.filter((p) => p.path !== path), { ...process, scaleTimeout }])
        }
    }, [path, process, scaleTimeout, isProcessFetchSuccess, isProcessesFetchSuccess])

    const { isPending, mutate } = useMutation({
        mutationFn() {
            return ALS.optOutProcess(path)
        },
    })
    return (
        <DialogRoot
            placement={ 'center' }
            motionPreset="slide-in-bottom"
            unmountOnExit={ true }
            lazyMount={ true }
        >
            <DialogTrigger asChild>
                { children }
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{ title }</DialogTitle>
                </DialogHeader>
                <DialogBody>
                    <Stack gap={ '6' }>
                        <Field label="Scaling timeout">
                            <InputGroup
                                width={ "full" }
                            >
                                <NumberInputRoot width={ 'full' } value={ scaleTimeout.toString() } min={ 1000 }
                                                 onValueChange={ (details) => setScaleTimeout(details.valueAsNumber) }>
                                    <NumberInputLabel/>
                                    <NumberInputField/>
                                </NumberInputRoot>
                            </InputGroup>
                        </Field>
                        <DialogRoot>
                            <DialogTrigger asChild>
                                <Button variant={ 'ghost' }>Remove</Button>
                            </DialogTrigger>
                            <Portal>
                                <DialogBackdrop/>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Remove "{ title }" profiles?</DialogTitle>
                                    </DialogHeader>
                                    <DialogBody>
                                        <p>
                                            You're about to remove every profile created for "{ title }", do
                                            you want to continue?
                                        </p>
                                    </DialogBody>
                                    <DialogFooter>
                                        <DialogActionTrigger asChild>
                                            <Button variant="outline">Cancel</Button>
                                        </DialogActionTrigger>
                                        <Button loading={ isPending } disabled={ isPending }
                                                onClick={ mutate }>Confirm</Button>
                                    </DialogFooter>
                                    <DialogCloseTrigger/>
                                </DialogContent>
                            </Portal>
                        </DialogRoot>
                    </Stack>
                </DialogBody>
                <DialogCloseTrigger/>
            </DialogContent>
        </DialogRoot>)
}

function ShortcutFormGroup({ id, title }: { id: string, title: string }) {
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

function App() {
    const { data: processesData = [] } = useGetProcessesQuery()
    const { data: lsExecutablePathData } = useGetLSExecutablePathQuery()
    const { data: enableRivaTuner } = useGetEnableRivaTunerQuery()
    const { data: rivaTunerExecutablePathData } = useGetRivaTunerExecutablePathQuery()
    const { data: defaultTimeoutData, isFetched: isDefaultTimeoutFetched } = useGetDefaultTimeoutQuery()
    const orderedProcesses = useMemo(() => orderBy(processesData, 'lastScaledAt', 'desc'), [processesData])
    const updateLSExecutablePath = useCallback((path: string) => {
        if (path) {
            electronStore.set('lsExecutablePath', path)
        }
    }, [])
    const updateEnableRivaTuner = useCallback((value: boolean) => {
        electronStore.set('enableRivaTuner', value)
    }, [])
    const updateRivaTunerExecutablePath = useCallback((path: string) => {
        if (path) {
            electronStore.set('rivaTunerExecutablePath', path)
        }
    }, [])
    const updateDefaultTimeout = useCallback((value: number) => {
        electronStore.set('defaultTimeout', value)
    }, [])
    const [defaultTimeout, setDefaultTimeout] = useState<number>()
    useEffect(() => {
        setDefaultTimeout(defaultTimeoutData)
    }, [defaultTimeoutData])
    useEffect(() => {
        if (isDefaultTimeoutFetched) updateDefaultTimeout(defaultTimeout || defaultTimeoutData)
    }, [updateDefaultTimeout, defaultTimeout, isDefaultTimeoutFetched, defaultTimeoutData])
    const { data: iconsPath } = useGetIconsPathQuery()
    return (
        <Container>
            <Box py={ "48px" } divideY={ "1px" }>
                <Stack py={ '6' }>
                    <Group justify={ 'between' }>
                        <Group>
                            <Avatar shape={ 'rounded' } src={ logo64 }/>
                            <Text fontWeight={ 'bold' }>{ pkg.productName }</Text>
                        </Group>
                        <Text>{ pkg.version }</Text>
                    </Group>
                </Stack>
                <Stack py={ '6' } gap={ '6' }>
                    <Field label="Lossless Scaling executable path">
                        <InputGroup
                            width={ "full" }
                            endElement={
                                <Button variant="subtle" size="2xs"
                                        onClick={ () => electronDialog.getLSExecutablePath().then(updateLSExecutablePath) }>
                                    Browse
                                </Button>
                            }
                        >
                            <Input placeholder="LosslessScaling.exe" value={ lsExecutablePathData }/>
                        </InputGroup>
                    </Field>
                    <Field label="Enable RivaTuner integration (Optional)" orientation="horizontal">
                        <Switch.Root checked={ enableRivaTuner }
                                     onCheckedChange={ ({ checked }) => updateEnableRivaTuner(checked) }>
                            <Switch.HiddenInput/>
                            <Switch.Control>
                                <Switch.Thumb/>
                            </Switch.Control>
                            <Switch.Label/>
                        </Switch.Root>
                    </Field>
                    { enableRivaTuner && (
                        <Field label="RivaTuner executable path">
                            <InputGroup
                                width={ "full" }
                                endElement={
                                    <Button variant="subtle" size="2xs"
                                            onClick={ () => electronDialog.getRivaTunerExecutablePath().then(updateRivaTunerExecutablePath) }>
                                        Browse
                                    </Button>
                                }
                            >
                                <Input placeholder="RTSS.exe" value={ rivaTunerExecutablePathData }/>
                            </InputGroup>
                        </Field>
                    ) }
                    {
                        isDefaultTimeoutFetched && (
                            <Field label="Default scaling timeout (ms)">
                                <InputGroup
                                    width={ "full" }
                                >
                                    <NumberInputRoot width={ 'full' } value={ defaultTimeout?.toString() || '' }
                                                     min={ 1000 }
                                                     onValueChange={ (details) => setDefaultTimeout(details.valueAsNumber) }>
                                        <NumberInputLabel/>
                                        <NumberInputField/>
                                    </NumberInputRoot>
                                </InputGroup>
                            </Field>
                        )
                    }
                    <Group>
                        <ShortcutFormGroup id={ 'lsScaleShortcut' } title={ 'Lossless Scaling scale shortcut' }/>
                    </Group>
                    <AutoUpdateFormField/>
                </Stack>
                <Stack py={ '6' }>
                    <Grid gap={ '6' }>
                        {
                            orderedProcesses.map((process, i) => (
                                <Grid.Col key={ i } span={ 12 } mdSpan={ 6 } lgSpan={ 4 } xlSpan={ 3 }>
                                    <Card.Root>
                                        <Card.Body gap="2">
                                            <Group justify={ 'between' }>
                                                <Avatar
                                                    icon={ <Icon><IoGameController/></Icon> }
                                                    shape={ 'rounded' }
                                                    src={ `file://${ iconsPath }/${ process.path.split('\\').pop().replace('.exe', '') }.png` }/>
                                                <ProcessModal
                                                    title={ process.path.split('\\').pop().replace('.exe', '') }
                                                    path={ process.path } timeout={ process.scaleTimeout }>
                                                    <Button variant="outline">Edit</Button>
                                                </ProcessModal>
                                            </Group>
                                            <Group justify={ 'between' }>
                                                <Card.Title>{ process.path.split('\\').pop().replace('.exe', '') }</Card.Title>
                                            </Group>
                                        </Card.Body>
                                        <Card.Footer>
                                            <Group justify={ 'between' } grow>
                                                <Card.Description>
                                                    { moment(process.lastScaledAt).fromNow() }
                                                </Card.Description>
                                                <Card.Description>
                                                    <Group>
                                                        <Icon>
                                                            <MdTimer/>
                                                        </Icon>
                                                        <Text>{ process.scaleTimeout } ms</Text>
                                                    </Group>
                                                </Card.Description>
                                            </Group>
                                        </Card.Footer>
                                    </Card.Root>
                                </Grid.Col>
                            ))
                        }
                    </Grid>
                </Stack>
            </Box>
        </Container>
    )
}

export default App
