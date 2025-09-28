import { Grid, Group, Stack } from '@/components'
import { Box, Button, Input, Switch, Text } from '@chakra-ui/react'
import { Avatar } from '@/components/ui/avatar.tsx'
import logo64 from '@/assets/icons/64x64.png'
import pkg from '~/package.json'
import { Field } from '@/components/ui/field.tsx'
import { InputGroup } from '@/components/ui/input-group.tsx'
import { NumberInputField, NumberInputLabel, NumberInputRoot } from '@/components/ui/number-input.tsx'
import LSShortcutFormField from '@/components/forms/ls-shortcut-form-field.tsx'
import { AutoUpdateFormField } from '@/components/forms/auto-update-form-field.tsx'
import {
    useGetDefaultTimeoutQuery,
    useGetEnableRivaTunerQuery,
    useGetLSExecutablePathQuery,
    useGetRivaTunerExecutablePathQuery,
} from '@/queries.ts'
import { HTMLAttributes, useCallback, useEffect, useState } from 'react'

export default function DefaultShell(props: HTMLAttributes<HTMLDivElement>) {
    const { children, ...rootProps } = props
    const { data: lsExecutablePathData } = useGetLSExecutablePathQuery()
    const { data: enableRivaTuner } = useGetEnableRivaTunerQuery()
    const { data: rivaTunerExecutablePathData } = useGetRivaTunerExecutablePathQuery()
    const { data: defaultTimeoutData, isFetched: isDefaultTimeoutFetched } = useGetDefaultTimeoutQuery()
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
    return (
        <Box px={ "6" } divideY={ "1px" }>
            <Stack p={ '6' }>
                <Group justify={ 'between' }>
                    <Group>
                        <Avatar shape={ 'rounded' } src={ logo64 }/>
                        <Text fontWeight={ 'bold' }>{ pkg.productName }</Text>
                    </Group>
                    <Text>{ pkg.version }</Text>
                </Group>
            </Stack>
            <Box px={ "6" } pb={ "6" } divideY={ "1px" }>
                <Grid gap={ '6' }>
                    <Grid.Col span={ 8 }>
                        <Box display={ 'grid' } py={ '6' }>
                            { children }
                        </Box>
                    </Grid.Col>
                    <Grid.Col span={ 4 }>
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
                                            <NumberInputRoot
                                                width={ 'full' }
                                                value={ defaultTimeout?.toString() || '' }
                                                min={ 1000 }
                                                onValueChange={ (details) => setDefaultTimeout(details.valueAsNumber) }
                                            >
                                                <NumberInputLabel/>
                                                <NumberInputField/>
                                            </NumberInputRoot>
                                        </InputGroup>
                                    </Field>
                                )
                            }
                            <Group>
                                <LSShortcutFormField id={ 'lsScaleShortcut' }
                                                     title={ 'Lossless Scaling scale shortcut' }/>
                            </Group>
                            <AutoUpdateFormField/>
                        </Stack>
                    </Grid.Col>
                </Grid>
            </Box>
        </Box>
    )
}