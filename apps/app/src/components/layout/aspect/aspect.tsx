import { forwardRef, useMemo } from 'react'
import { StAspect } from './aspect.styled.tsx'
import { AspectProps, aspectPropsDefinition } from './aspect.shared.ts'
import { Slot } from '@radix-ui/react-slot'
import { FRC, useDefinitionProps } from '@/utils/component'

export const Aspect: FRC<HTMLDivElement, AspectProps> = forwardRef(function Aspect(props, forwardedRef) {
    const [aspectProps, { children, asChild, ...htmlProps }] = useDefinitionProps(props, aspectPropsDefinition)
    const Comp = useMemo(() => (asChild ? StAspect.withComponent(Slot) : StAspect), [asChild])
    return (
        <Comp
            data-aspect
            ref={forwardedRef}
            {...htmlProps}
            styled={{
                ...aspectProps,
            }}
        >
            {children}
        </Comp>
    )
})
