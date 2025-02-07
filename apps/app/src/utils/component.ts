import pick from 'lodash/pick'
import omit from 'lodash/omit'
import { Screen, screens as _screens } from '@/tokens'
import { ForwardRefExoticComponent, PropsWithoutRef, RefAttributes, useMemo } from 'react'
import mapValues from 'lodash/mapValues'
import { useTheme } from '@emotion/react'

export type UndefinedProperties<T> = {
    [P in keyof T]-?: undefined extends T[P] ? P : never
}[keyof T]

export type ToOptional<T> = Partial<Pick<T, UndefinedProperties<T>>> & Pick<T, Exclude<keyof T, UndefinedProperties<T>>>

type NonUndefined<T> = T extends undefined ? never : T

type IsOptional = { _IS_OPTIONAL: true }
type IsRequired = { _IS_REQUIRED: true }
type IsResponsive = { _IS_RESPONSIVE: true }
type HasDefaultValue = { _HAS_DEFAULT_VALUE: boolean }

type OfType<T = unknown> = { value: T }

export type Definitions = {
    [key: string]: OfType
}

type DefineOptional = {
    <T>(): OfType<T | undefined> & IsOptional
    <T>(defaultValue: T): OfType<T | undefined> & IsOptional & HasDefaultValue
}

type DefineRequired = {
    <T>(): OfType<NonUndefined<T>> & IsRequired
    <T>(defaultValue: T): OfType<NonUndefined<T>> & IsRequired & HasDefaultValue
}

type DefineResponsive = {
    <P extends Definitions>(props: P): { [K in keyof P]: P[K] & IsResponsive } & { [K in keyof P as `${Screen}${Capitalize<Extract<keyof P, string>>}`]: P[K] }
}

const optional: DefineOptional = (defaultValue?) => {
    return { value: defaultValue, _IS_OPTIONAL: true, _HAS_DEFAULT_VALUE: defaultValue !== undefined }
}

const required: DefineRequired = (defaultValue?) => {
    return { value: defaultValue, _IS_REQUIRED: true, _HAS_DEFAULT_VALUE: defaultValue !== undefined }
}

const responsive: DefineResponsive = (props) => {
    return mapValues(props, (definition: OfType) => ({ ...definition, _IS_RESPONSIVE: true })) as any
}

type DefinitionsUtils = {
    optional: DefineOptional
    required: DefineRequired
    responsive: DefineResponsive
}

export const defineProps = <P extends Definitions>(definition: (DefinitionsUtils: DefinitionsUtils) => P) =>
    definition({
        optional,
        required,
        responsive,
    })

export const useDefinitionProps = <P extends object, D extends Definitions>(
    props: P,
    propsDefinition: D,
    overrideProps?: { [K in keyof D]?: D[K]['value'] }
): [PropsDefinitionWithDefaults<D>, Omit<P, keyof D>] => {
    const { screens = _screens } = useTheme() || {}
    const responsiveProps = useMemo(
        () =>
            Object.entries(propsDefinition)
                .filter(([_, definition]) => (definition as any)._IS_RESPONSIVE)
                .map(([key]) => {
                    const capitalizedProp = key.charAt(0).toUpperCase() + key.slice(1)
                    return Object.keys(screens).map((screen) => `${screen}${capitalizedProp}`)
                })
                .reduce((acc, val) => ({ ...acc, ...Object.fromEntries(val.map((key) => [key, undefined])) }), {}),
        [propsDefinition, screens]
    )

    const propsDefinitionWithVariants = useMemo(
        () =>
            ({
                ...mapValues(propsDefinition, (definition) => definition.value),
                ...responsiveProps,
                ...overrideProps,
            }) as PropsDefinitionWithDefaults<D>,
        [propsDefinition, responsiveProps, overrideProps]
    )

    const extractedProps = useMemo(
        () => ({ ...propsDefinitionWithVariants, ...pick(props, Object.keys(propsDefinitionWithVariants)) }) as PropsDefinitionWithDefaults<D>,
        [propsDefinitionWithVariants, ...Object.values(props)]
    )
    const rest = useMemo(
        () => omit(props, Object.keys(propsDefinitionWithVariants)) as Omit<P, keyof D>,
        [propsDefinitionWithVariants, ...Object.values(props)]
    )

    return [extractedProps, rest]
}

export const useVariantProps = <V extends object, CV extends keyof V>(variants: V, currentVariant?: CV) => {
    return useMemo(() => (currentVariant ? variants[currentVariant] : {}), [currentVariant, variants])
}

export type PropsDefinition<P extends Definitions> = ToOptional<{
    [K in keyof P]: P[K]['value']
}>

export type PropsDefinitionWithDefaults<P extends Definitions> = ToOptional<{
    [K in keyof P]: P[K] extends HasDefaultValue ? NonUndefined<P[K]['value']> : P[K]['value']
}>

export type FRC<T, P = {}> = ForwardRefExoticComponent<PropsWithoutRef<P> & RefAttributes<T>>
