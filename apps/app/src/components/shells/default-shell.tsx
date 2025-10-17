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
import { useSettingsPropertyQuery } from '@/queries.ts'
import { HTMLAttributes, useEffect, useState } from 'react'

export default function DefaultShell(props: HTMLAttributes<HTMLDivElement>) {
    const { children, ...rootProps } = props
    const { data: lsExecutablePathData } = useSettingsPropertyQuery('lsExecutablePath')
    const { data: lsDefaultFramegenMultiplier } = useSettingsPropertyQuery('lsDefaultFramegenMultiplier')
    const { data: enableLosslessScaling } = useSettingsPropertyQuery('enableLosslessScaling')
    const { data: enableRivaTuner } = useSettingsPropertyQuery('enableRivaTuner')
    const { data: rivaTunerDefaultFPSLimit } = useSettingsPropertyQuery('rivaTunerDefaultFPSLimit')
    const { data: rivaTunerExecutablePathData } = useSettingsPropertyQuery('rivaTunerExecutablePath')
    const { data: defaultTimeoutData, isFetched: isDefaultTimeoutFetched } = useSettingsPropertyQuery('defaultTimeout')
    const [defaultTimeout, setDefaultTimeout] = useState<number>()
    useEffect(() => {
        setDefaultTimeout(defaultTimeoutData)
    }, [defaultTimeoutData])
    useEffect(() => {
        if (isDefaultTimeoutFetched) {
            electronStore.set('defaultTimeout', defaultTimeout || defaultTimeoutData)
        }
    }, [defaultTimeout, isDefaultTimeoutFetched, defaultTimeoutData])
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
            <Box p={ "6" } divideY={ "1px" }>
                <Grid gap={ '6' }>
                    <Grid.Col span={ 12 } lgSpan={ 8 } order={ 1 } lgOrder={ 0 }>
                        <Box display={ 'grid' }>
                            { children }
                        </Box>
                    </Grid.Col>
                    <Grid.Col span={ 12 } lgSpan={ 4 } order={ 0 } lgOrder={ 1 }>
                        <Stack gap={ '6' }>
                            <AutoUpdateFormField/>
                            <Field label="Use Lossless Scaling" orientation="horizontal">
                                <Switch.Root
                                    checked={ enableLosslessScaling }
                                    onCheckedChange={ ({ checked }) =>
                                        electronStore.set('enableLosslessScaling', checked)
                                    }
                                >
                                    <Switch.HiddenInput/>
                                    <Switch.Control>
                                        <Switch.Thumb/>
                                    </Switch.Control>
                                    <Switch.Label/>
                                </Switch.Root>
                            </Field>
                            { enableLosslessScaling &&
                                <Stack gap={ '6' } pl={ '6' } className={ 'border-l-2 border-solid border-gray-500' }>
                                    <Field label="Executable path">
                                        <InputGroup
                                            width={ "full" }
                                            endElement={
                                                <Button
                                                    variant="subtle"
                                                    size="2xs"
                                                    onClick={ () => electronDialog.getLSExecutablePath().then((path: string) => {
                                                        if (path) {
                                                            electronStore.set('lsExecutablePath', path)
                                                        }
                                                    }) }
                                                >
                                                    Browse
                                                </Button>
                                            }
                                        >
                                            <Input placeholder="LosslessScaling.exe" value={ lsExecutablePathData }/>
                                        </InputGroup>
                                    </Field>
                                    <Group>
                                        <LSShortcutFormField id={ 'lsScaleShortcut' }
                                                             title={ 'Scale shortcut' }/>
                                    </Group>
                                    <Field label="Framegen multiplier">
                                        <InputGroup
                                            width={ "full" }
                                        >
                                            <NumberInputRoot
                                                width={ 'full' }
                                                value={ lsDefaultFramegenMultiplier }
                                                min={ 0 }
                                                onValueChange={ (details) => electronStore.set('lsDefaultFramegenMultiplier', details.valueAsNumber) }
                                            >
                                                <NumberInputLabel/>
                                                <NumberInputField/>
                                            </NumberInputRoot>
                                        </InputGroup>
                                    </Field>
                                    {
                                        isDefaultTimeoutFetched && (
                                            <Field label="Scale delay (ms)">
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
                                </Stack>
                            }
                            <Field label="Use RivaTuner" orientation="horizontal">
                                <Switch.Root
                                    checked={ enableRivaTuner }
                                    onCheckedChange={ ({ checked }) =>
                                        electronStore.set('enableRivaTuner', checked)
                                    }
                                >
                                    <Switch.HiddenInput/>
                                    <Switch.Control>
                                        <Switch.Thumb/>
                                    </Switch.Control>
                                    <Switch.Label/>
                                </Switch.Root>
                            </Field>
                            { enableRivaTuner && (
                                <Stack gap={ '6' } pl={ '6' } className={ 'border-l-2 border-solid border-gray-500' }>
                                    <Field label="Executable path">
                                        <InputGroup
                                            width={ "full" }
                                            endElement={
                                                <Button
                                                    variant="subtle"
                                                    size="2xs"
                                                    onClick={ () => electronDialog.getRivaTunerExecutablePath().then((path: string) => {
                                                        if (path) {
                                                            electronStore.set('rivaTunerExecutablePath', path)
                                                        }
                                                    }) }
                                                >
                                                    Browse
                                                </Button>
                                            }
                                        >
                                            <Input placeholder="RTSS.exe" value={ rivaTunerExecutablePathData }/>
                                        </InputGroup>
                                    </Field>
                                    <Field label="FPS Limit">
                                        <InputGroup
                                            width={ "full" }
                                        >
                                            <NumberInputRoot
                                                width={ 'full' }
                                                value={ rivaTunerDefaultFPSLimit }
                                                min={ 0 }
                                                onValueChange={ (details) => electronStore.set('rivaTunerDefaultFPSLimit', details.valueAsNumber) }
                                            >
                                                <NumberInputLabel/>
                                                <NumberInputField/>
                                            </NumberInputRoot>
                                        </InputGroup>
                                    </Field>
                                </Stack>
                            ) }
                        </Stack>
                    </Grid.Col>
                </Grid>
            </Box>
        </Box>
    )
}