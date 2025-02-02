import { forwardRef } from 'react'
import { StDivider } from './divider.styled.tsx'
import { DividerProps, dividerPropsDefinition, dividerVariants } from './divider.shared.ts'
import { FRC, useDefinitionProps, useVariantProps } from '@/utils/component'

export const Divider: FRC<HTMLDivElement, DividerProps> = forwardRef(function Divider({ variant = 'horizontal', ...props }, forwardedRef) {
    const variantProps = useVariantProps(dividerVariants, variant)
    const [dividerProps, { children, ...htmlProps }] = useDefinitionProps(props, dividerPropsDefinition, variantProps)
    return (
        <StDivider
            data-divider
            ref={forwardedRef}
            {...htmlProps}
            styled={{
                ...dividerProps,
                variant,
            }}
        >
            {children}
        </StDivider>
    )
})
