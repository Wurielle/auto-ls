import { forwardRef, useMemo } from 'react'
import { StBox } from './box.styled.tsx'
import { BoxProps, boxPropsDefinition } from './box.shared.ts'
import { Slot } from '@radix-ui/react-slot'
import { FRC, useDefinitionProps } from '@/utils/component'

export const Box: FRC<HTMLDivElement, BoxProps> = forwardRef(function Box(props, forwardedRef) {
    const [boxProps, { children, asChild, ...htmlProps }] = useDefinitionProps(props, boxPropsDefinition)
    const Comp = useMemo(() => (asChild ? StBox.withComponent(Slot) : StBox), [asChild])
    return (
        <Comp
            data-box
            ref={forwardedRef}
            {...htmlProps}
            styled={{
                ...boxProps,
            }}
        >
            {children}
        </Comp>
    )
})
