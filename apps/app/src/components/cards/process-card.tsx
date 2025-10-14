import { Box, Group, Stack } from '@/components'
import { Avatar } from '@/components/ui/avatar.tsx'
import { Button, Card, Heading, Icon, Input, Portal, Switch, Text } from '@chakra-ui/react'
import { Field } from '@/components/ui/field.tsx'
import { InputGroup } from '@/components/ui/input-group.tsx'
import { NumberInputField, NumberInputLabel, NumberInputRoot } from "@/components/ui/number-input"
import { MdTimer } from "react-icons/md"
import { IoGameController } from "react-icons/io5"
import { useGetIconsPathQuery, useGetProcessesQuery, useSettingsPropertyQuery } from '@/queries.ts'
import moment from 'moment'
import { HTMLAttributes, useCallback, useEffect, useState } from 'react'
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
import { useMutation, useQuery } from '@tanstack/react-query'
import { useForm, useStore } from '@tanstack/react-form'
import * as changeCase from "change-case"
import { useWindowEvent } from '@mantine/hooks'


function ProcessModal({ children, title, process }: HTMLAttributes<HTMLElement> & {
    title: string,
    process: any,
}) {
    const { data: processes, isSuccess: isProcessesFetchSuccess } = useGetProcessesQuery()

    const { isPending, mutate } = useMutation({
        mutationFn() {
            return ALS.optOutProcess(process.path)
        },
    })

    const installMutation = useMutation({
        mutationFn() {
            return optiScaler.install(process.path)
        },
    })

    const uninstallMutation = useMutation({
        mutationFn() {
            return optiScaler.uninstall(process.path)
        },
    })

    const checkInstallQuery = useQuery({
        queryKey: ['opti-scaler', 'check-install', process.path],
        queryFn() {
            return optiScaler.checkInstall(process.path)
        },
    })

    const form = useForm({
        defaultValues: process,
    })

    const store = useStore(form.store)

    useEffect(() => {
        if (isProcessesFetchSuccess) {
            electronStore.set('processes', [...processes.filter((p) => p.path !== process.path), store.values])
        }
    }, [store, isProcessesFetchSuccess, processes, process.path])

    useWindowEvent('focus', checkInstallQuery.refetch)

    return (
        <DialogRoot
            placement={ 'center' }
            motionPreset="slide-in-bottom"
            unmountOnExit={ true }
            lazyMount={ true }
            size={ 'xl' }
            onOpenChange={ ({ open }) => !open && form.reset() }
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
                        <Group gap={ '3' }>
                            <Input
                                width={ 'full' }
                                value={ process.path }
                                readOnly
                            />
                            <Button onClick={ () => gameLibrary.openFileLocation(process.path) }>Open file
                                location</Button>
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
                        </Group>
                        <Stack gap={ '6' }>
                            <Group justify={ 'between' }>
                                <Heading>Lossless Scaling</Heading>
                                <form.Field
                                    name="options.enableLosslessScaling"
                                    children={ (field) => (
                                        <Switch.Root
                                            checked={ field.state.value }
                                            onBlur={ field.handleBlur }
                                            onCheckedChange={ ({ checked }) =>
                                                field.handleChange(checked)
                                            }
                                        >
                                            <Switch.HiddenInput/>
                                            <Switch.Control>
                                                <Switch.Thumb/>
                                            </Switch.Control>
                                            <Switch.Label/>
                                        </Switch.Root>
                                    ) }
                                />
                            </Group>
                            <form.Subscribe
                                selector={ (state) => [state.values.options.enableLosslessScaling] }
                                children={ ([enabled]) => enabled && (
                                    <Stack gap={ '6' } pl={ '6' }
                                           className={ 'border-l-2 border-solid border-gray-500' }>
                                        <Field label="Framegen Multiplier">
                                            <InputGroup
                                                width={ "full" }
                                            >
                                                <form.Field
                                                    name="options.lsFramegenMultiplier"
                                                    children={ (field) => (
                                                        <NumberInputRoot
                                                            width={ 'full' }
                                                            min={ 0 }
                                                            value={ field.state.value }
                                                            onBlur={ field.handleBlur }
                                                            onValueChange={ (e) => field.handleChange(e.valueAsNumber) }
                                                        >
                                                            <NumberInputLabel/>
                                                            <NumberInputField/>
                                                        </NumberInputRoot>
                                                    ) }
                                                />
                                            </InputGroup>
                                        </Field>
                                        <Field label="Scaling timeout">
                                            <InputGroup
                                                width={ "full" }
                                            >
                                                <form.Field
                                                    name="options.lsScaleDelay"
                                                    children={ (field) => (
                                                        <NumberInputRoot
                                                            width={ 'full' }
                                                            min={ 1000 }
                                                            value={ field.state.value }
                                                            onBlur={ field.handleBlur }
                                                            onValueChange={ (e) => field.handleChange(e.valueAsNumber) }
                                                        >
                                                            <NumberInputLabel/>
                                                            <NumberInputField/>
                                                        </NumberInputRoot>
                                                    ) }
                                                />
                                            </InputGroup>
                                        </Field>
                                    </Stack>
                                ) }
                            />
                        </Stack>
                        <Stack gap={ '6' }>
                            <Group justify={ 'between' }>
                                <Heading>RivaTuner</Heading>
                                <form.Field
                                    name="options.enableRivaTuner"
                                    children={ (field) => (
                                        <Switch.Root
                                            checked={ field.state.value }
                                            onBlur={ field.handleBlur }
                                            onCheckedChange={ ({ checked }) =>
                                                field.handleChange(checked)
                                            }
                                        >
                                            <Switch.HiddenInput/>
                                            <Switch.Control>
                                                <Switch.Thumb/>
                                            </Switch.Control>
                                            <Switch.Label/>
                                        </Switch.Root>
                                    ) }
                                />
                            </Group>

                            <form.Subscribe
                                selector={ (state) => [state.values.options.enableRivaTuner] }
                                children={ ([enabled]) => enabled && (
                                    <Stack gap={ '6' } pl={ '6' }
                                           className={ 'border-l-2 border-solid border-gray-500' }>
                                        <Field label="Framerate Limit">
                                            <InputGroup
                                                width={ "full" }
                                            >
                                                <form.Field
                                                    name="options.rivaTunerFPSLimit"
                                                    children={ (field) => (
                                                        <NumberInputRoot
                                                            width={ 'full' }
                                                            min={ 0 }
                                                            value={ field.state.value }
                                                            onBlur={ field.handleBlur }
                                                            onValueChange={ (e) => field.handleChange(e.valueAsNumber) }
                                                        >
                                                            <NumberInputLabel/>
                                                            <NumberInputField/>
                                                        </NumberInputRoot>
                                                    ) }
                                                />
                                            </InputGroup>
                                        </Field>
                                    </Stack>
                                ) }
                            />
                        </Stack>
                        <Stack gap={ '6' }>
                            <Heading>OptiScaler</Heading>
                            <Box pl={ '6' } className={ 'border-l-2 border-solid border-gray-500' }>
                                <div className={ "w-min" }>
                                    {
                                        checkInstallQuery.data ? (
                                            <Button
                                                loading={ uninstallMutation.isPending || checkInstallQuery.isPending }
                                                width={ '100%' }
                                                onClick={ () => uninstallMutation.mutateAsync() }>Uninstall</Button>
                                        ) : (

                                            <Button
                                                loading={ installMutation.isPending || checkInstallQuery.isPending }
                                                width={ '100%' }
                                                onClick={ () => installMutation.mutateAsync() }>Install</Button>
                                        )
                                    }
                                </div>
                            </Box>
                        </Stack>
                    </Stack>
                </DialogBody>
                <DialogCloseTrigger/>
            </DialogContent>
        </DialogRoot>)
}

type Props = {
    process: any
}
export default function ProcessCard(props: Props) {
    const { process } = props
    const { data: defaultTimeoutData, isFetched: isDefaultTimeoutFetched } = useSettingsPropertyQuery('defaultTimeout')
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
    const name = changeCase.capitalCase(process.path.split('\\').pop().replace('.exe', ''))
    return (
        <ProcessModal
            title={ name }
            process={ process }>
            <button className={ 'cursor-pointer w-full' }>
                <Card.Root>
                    <Card.Body gap="2">
                        <Group justify={ 'between' }>
                            <Avatar
                                icon={ <Icon><IoGameController/></Icon> }
                                shape={ 'rounded' }
                                src={ `file://${ iconsPath }/${ process.path.split('\\').pop().replace('.exe', '') }.png` }/>
                            {/*<Button variant="outline">Edit</Button>*/ }
                        </Group>
                        <Group justify={ 'between' }>
                            <Card.Title>{ name }</Card.Title>
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
                                    <Text>{ process.options?.lsScaleDelay || process.scaleTimeout } ms</Text>
                                </Group>
                            </Card.Description>
                        </Group>
                    </Card.Footer>
                </Card.Root>
            </button>
        </ProcessModal>
    )
}