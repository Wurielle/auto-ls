import { Group, Stack } from '@/components'
import { Avatar } from '@/components/ui/avatar.tsx'
import { Button, Card, Icon, Portal, Text } from '@chakra-ui/react'
import { Field } from '@/components/ui/field.tsx'
import { InputGroup } from '@/components/ui/input-group.tsx'
import { NumberInputField, NumberInputLabel, NumberInputRoot } from "@/components/ui/number-input"
import { MdTimer } from "react-icons/md"
import { IoGameController } from "react-icons/io5"
import {
    useGetDefaultTimeoutQuery,
    useGetIconsPathQuery,
    useGetProcessesQuery,
    useGetProcessQuery,
} from '@/queries.ts'
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

type Props = {
    process: any
}
export default function ProcessCard(props: Props) {
    const { process } = props
    const { data: defaultTimeoutData, isFetched: isDefaultTimeoutFetched } = useGetDefaultTimeoutQuery()
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
    )
}