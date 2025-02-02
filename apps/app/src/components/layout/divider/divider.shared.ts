import { ElementType, HTMLAttributes } from 'react'
import { boxPropsDefinition } from '@/components/layout/box'
import { createPartial } from '@/utils/object'
import { defineProps, PropsDefinition, PropsDefinitionWithDefaults } from '@/utils/component'

export const dividerWithoutVariantsPropsDefinition = defineProps(({ optional }) => ({
    ...boxPropsDefinition,
    size: optional<number>(1),
}))

export type DividerWithoutVariantsPropsDefinition = typeof dividerWithoutVariantsPropsDefinition

export type DividerWithoutVariantsProps = PropsDefinition<DividerWithoutVariantsPropsDefinition>

const definePartialProps = createPartial<DividerWithoutVariantsProps>()

export const dividerVariants = {
    horizontal: definePartialProps({
        mt: '3',
        mb: '3',
    }),
    vertical: definePartialProps({
        ml: '3',
        mr: '3',
    }),
} as const

export const dividerPropsDefinition = defineProps(({ optional }) => ({
    ...dividerWithoutVariantsPropsDefinition,
    variant: optional<keyof typeof dividerVariants>(),
}))

export type DividerPropsDefinition = typeof dividerPropsDefinition

export interface DividerProps extends HTMLAttributes<HTMLDivElement>, PropsDefinition<DividerPropsDefinition> {
    as?: ElementType
}

export type DividerPropsWithDefaults = PropsDefinitionWithDefaults<DividerPropsDefinition>
