import { forwardRef, useMemo } from 'react'
import { StContainer } from './container.styled.tsx'
import { ContainerProps, containerPropsDefinition } from './container.shared.ts'
import { Slot } from '@radix-ui/react-slot'
import { FRC, useDefinitionProps } from '@/utils/component'

export const Container: FRC<HTMLDivElement, ContainerProps> = forwardRef(function Container(props, forwardedRef) {
    const [containerProps, { children, asChild, ...htmlProps }] = useDefinitionProps(props, containerPropsDefinition)
    const Comp = useMemo(() => (asChild ? StContainer.withComponent(Slot) : StContainer), [asChild])
    return (
        <Comp
            data-container
            ref={forwardedRef}
            {...htmlProps}
            styled={{
                ...containerProps,
            }}
        >
            {children}
        </Comp>
    )
})
