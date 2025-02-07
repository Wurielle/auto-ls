import styled from '@emotion/styled'
import { GroupPropsWithDefaults } from './group.shared.ts'
import { getRemValue, StyledProps } from '@/utils/css-in-js'
import { spacing as _spacing } from '@/tokens'
import { StBox } from '@/components/layout/box'

const POSITIONS = {
    top: 'flex-start',
    left: 'flex-start',
    center: 'center',
    bottom: 'flex-end',
    right: 'flex-end',
    between: 'space-between',
    around: 'space-around',
    stretch: 'stretch',
    apart: 'space-between',
} as const

export const StGroup = styled(StBox)<StyledProps<GroupPropsWithDefaults>>((context) => {
    const {
        theme: { spacing = _spacing },
        styled: { direction, wrap, justify, align, gap },
    } = context
    return {
        display: 'flex',
        justifyContent: direction.includes('row')
            ? justify in POSITIONS
                ? POSITIONS[justify as keyof typeof POSITIONS]
                : justify
            : align in POSITIONS
              ? POSITIONS[align as keyof typeof POSITIONS]
              : align,
        alignItems: direction.includes('row')
            ? align in POSITIONS
                ? POSITIONS[align as keyof typeof POSITIONS]
                : align
            : justify in POSITIONS
              ? POSITIONS[justify as keyof typeof POSITIONS]
              : justify,
        gap: getRemValue(gap, spacing),
        flexFlow: `${direction} ${wrap ? 'wrap' : 'nowrap'}`,
        '& > *': {
            minWidth: 0,
            minHeight: 0,
        },
    }
})
