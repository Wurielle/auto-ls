import { forwardRef, useMemo } from 'react'
import { StScrollview } from './scrollview.styled.tsx'
import { ScrollviewProps, scrollviewPropsDefinition } from './scrollview.shared.ts'
import { Slot } from '@radix-ui/react-slot'
import { FRC, useDefinitionProps } from '@/utils/component'

export const Scrollview: FRC<HTMLDivElement, ScrollviewProps> = forwardRef(function Scrollview(props, forwardedRef) {
    const [{ x, y, ...scrollviewProps }, { children, asChild, ...htmlProps }] = useDefinitionProps(props, scrollviewPropsDefinition)
    const Comp = useMemo(() => (asChild ? StScrollview.withComponent(Slot) : StScrollview), [asChild])
    return (
        <Comp
            data-scrollview
            ref={forwardedRef}
            {...htmlProps}
            styled={{
                ...scrollviewProps,
                x,
                y,
                overflow: scrollviewProps.overflow || 'hidden',
                overflowX: scrollviewProps.overflowX || (typeof x === 'boolean' ? x && 'auto' : x) || undefined,
                overflowY: scrollviewProps.overflowY || (typeof y === 'boolean' ? y && 'auto' : y) || undefined,
            }}
        >
            {children}
        </Comp>
    )
})
