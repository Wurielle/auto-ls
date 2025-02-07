import { forwardRef, useMemo } from 'react'
import { StCenter } from './center.styled.tsx'
import { CenterProps, centerPropsDefinition } from './center.shared.ts'
import { Slot } from '@radix-ui/react-slot'
import { FRC, useDefinitionProps } from '@/utils/component'

export const Center: FRC<HTMLDivElement, CenterProps> = forwardRef(function Center(props, forwardedRef) {
    const [centerProps, { children, asChild, ...htmlProps }] = useDefinitionProps(props, centerPropsDefinition)
    const Comp = useMemo(() => (asChild ? StCenter.withComponent(Slot) : StCenter), [asChild])
    return (
        <Comp
            data-center
            ref={forwardedRef}
            {...htmlProps}
            styled={{
                ...centerProps,
            }}
        >
            {children}
        </Comp>
    )
})
