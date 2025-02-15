import { Container, Grid, Group, Stack } from '@/components'
import { Avatar } from '@/components/ui/avatar.tsx'
import { Box, Button, Card, Icon, Input, Text } from '@chakra-ui/react'
import logo64 from '@/assets/icons/64x64.png'
import pkg from '~/package.json'
import { Field } from '@/components/ui/field.tsx'
import { InputGroup } from '@/components/ui/input-group.tsx'
import { NumberInputField, NumberInputLabel, NumberInputRoot } from "@/components/ui/number-input"
import { MdTimer } from "react-icons/md"
import {
    useGetDefaultTimeoutQuery,
    useGetLSExecutablePathQuery,
    useGetProcessesQuery,
    useGetProcessQuery,
} from '@/queries.ts'
import moment from 'moment'
import { HTMLAttributes, useCallback, useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
    DialogBody,
    DialogCloseTrigger,
    DialogContent,
    DialogHeader,
    DialogRoot,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

function ProcessModal({ children, title, timeout, path }: HTMLAttributes<HTMLElement> & {
    title: string,
    path: string,
    timeout: number
}) {
    const { data: process, isSuccess: isProcessFetchSuccess } = useGetProcessQuery(path)
    const { data: processes, isSuccess: isProcessesFetchSuccess } = useGetProcessesQuery()
    const [scaleTimeout, setScaleTimeout] = useState<number>(timeout)
    const queryClient = useQueryClient()
    useEffect(() => {
        if (isProcessFetchSuccess && isProcessesFetchSuccess) {
            electronStore.set('processes', [...processes.filter((p) => p.path !== path), { ...process, scaleTimeout }])
        }
    }, [path, process, scaleTimeout, isProcessFetchSuccess, isProcessesFetchSuccess])
    return (
        <DialogRoot
            placement={ 'center' }
            motionPreset="slide-in-bottom"
            unmountOnExit={ true }
            lazyMount={ true }
            onOpenChange={ ({ open }) => {
                if (!open) queryClient.refetchQueries()
            } }
        >
            <DialogTrigger asChild>
                { children }
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{ title }</DialogTitle>
                </DialogHeader>
                <DialogBody>
                    <Field invalid label="Scaling Timeout">
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
                </DialogBody>
                <DialogCloseTrigger/>
            </DialogContent>
        </DialogRoot>)
}

function App() {
    const { data: processesData } = useGetProcessesQuery()
    const { data: lsExecutablePathData } = useGetLSExecutablePathQuery()
    const { data: defaultTimeoutData, isFetched: isDefaultTimeoutFetched } = useGetDefaultTimeoutQuery()
    const queryClient = useQueryClient()
    const updateLSExecutablePath = useCallback((path: string) => {
        if (path) {
            electronStore.set('lsExecutablePath', path)
            queryClient.refetchQueries()
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
                    <Field invalid label="Lossless Scaling Path">
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
                    {
                        isDefaultTimeoutFetched && (
                            <Field invalid label="Default Scaling Timeout (ms)">
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
                </Stack>
                <Stack py={ '6' }>
                    <Grid gap={ '6' }>
                        {
                            processesData?.map((process, i) => (
                                <Grid.Col key={ i } span={ 12 } mdSpan={ 6 } lgSpan={ 4 } xlSpan={ 3 }>
                                    <Card.Root>
                                        <Card.Body gap="2">
                                            <Group justify={ 'between' }>
                                                <Avatar shape={ 'rounded' } src={ logo64 }/>
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
