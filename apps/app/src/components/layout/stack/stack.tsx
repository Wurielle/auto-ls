import { forwardRef, useMemo } from 'react'
import { StStack } from './stack.styled.tsx'
import { StackProps, stackPropsDefinition } from './stack.shared.ts'
import { Slot } from '@radix-ui/react-slot'
import { FRC, useDefinitionProps } from '@/utils/component'

export const Stack: FRC<HTMLDivElement, StackProps> = forwardRef(function Stack(props, forwardedRef) {
    const [stackProps, { children, asChild, ...htmlProps }] = useDefinitionProps(props, stackPropsDefinition)
    const Comp = useMemo(() => (asChild ? StStack.withComponent(Slot) : StStack), [asChild])
    return (
        <Comp
            data-stack
            ref={forwardedRef}
            {...htmlProps}
            styled={{
                ...stackProps,
            }}
        >
            {children}
        </Comp>
    )
})
