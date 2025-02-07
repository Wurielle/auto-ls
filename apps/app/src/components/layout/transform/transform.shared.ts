import { ElementType, HTMLAttributes } from 'react'
import { Properties } from 'csstype'
import { defineProps, PropsDefinition, PropsDefinitionWithDefaults } from '@/utils/component'
import { boxPropsDefinition } from '@/components/layout/box'
import { Spacing } from '@/tokens'

export const transformPropsDefinition = defineProps(({ optional }) => ({
    ...boxPropsDefinition,
    transform: optional<Properties['transform']>(),
    transformOrigin: optional<Properties['transformOrigin'] | number | (Properties['transformOrigin'] | number)[]>(),
    translate: optional<string | number | (Spacing | string | number)[]>(),
    translateX: optional<Spacing | string | number>(),
    translateY: optional<Spacing | string | number>(),
    translateZ: optional<Spacing | string | number>(),
    translate3d: optional<(Spacing | string | number)[]>(),
    scale: optional<string | number | (string | number)[]>(),
    scaleX: optional<string | number>(),
    scaleY: optional<string | number>(),
    scaleZ: optional<string | number>(),
    scale3d: optional<string | number | (string | number)[]>(),
    skew: optional<string | number | (string | number)[]>(),
    skewX: optional<string | number>(),
    skewY: optional<string | number>(),
    rotate: optional<string | string[]>(),
    rotateX: optional<string>(),
    rotateY: optional<string>(),
    rotateZ: optional<string>(),
    rotate3d: optional<string[]>(),
    perspective: optional<Properties['perspective'] | number>(),
}))

export type TransformPropsDefinition = typeof transformPropsDefinition

export interface TransformProps extends Omit<HTMLAttributes<HTMLDivElement>, 'translate'>, PropsDefinition<TransformPropsDefinition> {
    asChild?: boolean
    as?: ElementType
}

export type TransformPropsWithDefaults = PropsDefinitionWithDefaults<TransformPropsDefinition>
