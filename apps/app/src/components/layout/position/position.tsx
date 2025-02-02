import { forwardRef, useMemo } from 'react'
import { StPosition } from './position.styled.tsx'
import { PositionProps, positionPropsDefinition } from './position.shared.ts'
import { Slot } from '@radix-ui/react-slot'
import { FRC, useDefinitionProps } from '@/utils/component'

export const Position: FRC<HTMLDivElement, PositionProps> = forwardRef(function Position(props, forwardedRef) {
    const [positionProps, { children, asChild, ...htmlProps }] = useDefinitionProps(props, positionPropsDefinition)
    const Comp = useMemo(() => (asChild ? StPosition.withComponent(Slot) : StPosition), [asChild])
    return (
        <Comp
            data-position
            ref={forwardedRef}
            {...htmlProps}
            styled={{
                ...positionProps,
            }}
        >
            {children}
        </Comp>
    )
})
