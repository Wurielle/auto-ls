import { Field } from '@/components/ui/field.tsx'
import { Switch } from '@chakra-ui/react'
import { useSettingsPropertyMutation, useSettingsPropertyQuery } from '@/queries.ts'

export function AutoUpdateFormField() {
    const key = 'autoUpdate'
    const { data: value, isFetched } = useSettingsPropertyQuery(key)
    const { mutate } = useSettingsPropertyMutation(key)
    return isFetched && (
        <Field label="Enable auto update" orientation="horizontal">
            <Switch.Root
                checked={ value }
                onCheckedChange={ ({ checked }) => mutate(checked) }
            >
                <Switch.HiddenInput/>
                <Switch.Control>
                    <Switch.Thumb/>
                </Switch.Control>
                <Switch.Label/>
            </Switch.Root>
        </Field>
    )
}