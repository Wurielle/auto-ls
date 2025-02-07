import styled from '@emotion/styled'
import { GridColPropsWithDefaults, GridPropsWithDefaults } from './grid.shared.ts'
import { StBox } from '@/components/layout/box'
import { spacing as _spacing } from '@/tokens'
import { defineMixins, getRemValue, StyledProps } from '@/utils/css-in-js'
import isUndefined from 'lodash/isUndefined'

export const StGrid = styled(StBox)<StyledProps<GridPropsWithDefaults>>((context) => {
    const {
        theme: { spacing = _spacing },
    } = context
    const { getResponsive } = defineMixins(context)
    return [
        {
            display: 'grid',
        },
        getResponsive(
            'rows',
            (rows) =>
                !isUndefined(rows) && {
                    gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
                }
        ),
        getResponsive(
            'columns',
            (columns) =>
                !isUndefined(columns) && {
                    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                }
        ),
        getResponsive(
            'gap',
            (gap) =>
                !isUndefined(gap) && {
                    gap: getRemValue(gap, spacing),
                }
        ),
        getResponsive(
            'align',
            (align) =>
                !isUndefined(align) && {
                    alignItems: align,
                }
        ),
    ]
})

export const StGridCol = styled(StBox)<StyledProps<GridColPropsWithDefaults>>((context) => {
    const { getResponsive } = defineMixins(context)
    return [
        {
            minWidth: 0,
            flexShrink: 0,
        },
        getResponsive('span', (value) => {
            return (
                !isUndefined(value) && {
                    gridColumn: `span ${value} / span ${value}`,
                }
            )
        }),
        getResponsive(
            'start',
            (value) =>
                !isUndefined(value) && {
                    gridColumnStart: value,
                }
        ),
        getResponsive(
            'end',
            (value) =>
                !isUndefined(value) && {
                    gridColumnEnd: value,
                }
        ),
        getResponsive(
            'rowSpan',
            (value) =>
                !isUndefined(value) && {
                    gridRow: value ? `span ${value} / span ${value}` : 'auto',
                }
        ),
        getResponsive(
            'rowStart',
            (value) =>
                !isUndefined(value) && {
                    gridRowStart: value,
                }
        ),
        getResponsive(
            'rowEnd',
            (value) =>
                !isUndefined(value) && {
                    gridRowEnd: value,
                }
        ),
        getResponsive(
            'order',
            (value) =>
                !isUndefined(value) && {
                    order: value,
                }
        ),
    ]
})
