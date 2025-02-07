import { forwardRef, useMemo } from 'react'
import { StGrid, StGridCol } from './grid.styled.tsx'
import { GridColProps, gridColPropsDefinition, GridProps, gridPropsDefinition } from './grid.shared.ts'
import { Slot } from '@radix-ui/react-slot'
import { FRC, useDefinitionProps } from '@/utils/component'

const GridCol: FRC<HTMLDivElement, GridColProps> = forwardRef(function GridCol(props, forwardedRef) {
    const [gridColProps, { children, asChild, ...htmlProps }] = useDefinitionProps(props, gridColPropsDefinition)
    const Comp = useMemo(() => (asChild ? StGridCol.withComponent(Slot) : StGridCol), [asChild])
    return (
        <Comp
            data-grid-col
            ref={forwardedRef}
            {...htmlProps}
            styled={{
                ...gridColProps,
            }}
        >
            {children}
        </Comp>
    )
})

export const Grid = forwardRef(function Grid({ children, ...props }, forwardedRef) {
    const [gridProps, htmlProps] = useDefinitionProps(props, gridPropsDefinition)
    return (
        <StGrid
            data-grid
            ref={forwardedRef}
            {...htmlProps}
            styled={{
                ...gridProps,
            }}
        >
            {children}
        </StGrid>
    )
}) as FRC<HTMLDivElement, GridProps> & { Col: typeof GridCol }

Grid.Col = GridCol

export default Grid
