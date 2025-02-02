import styled from '@emotion/styled'
import { DividerPropsWithDefaults } from './divider.shared.ts'
import { StBox } from '@/components/layout/box'
import { rem } from 'polished'
import { colors as _colors } from '@/tokens'
import get from 'lodash/get'
import { StyledProps } from '@/utils'

export const StDivider = styled(StBox)<StyledProps<DividerPropsWithDefaults>>((context) => {
    const {
        theme: { colors = _colors },
        styled: { variant = 'horizontal', size, bs = 'solid', bc = 'slate.100' },
    } = context
    return {
        [variant === 'horizontal' ? 'borderTop' : 'borderLeft']: `${rem(size)} ${bs} ${get(colors, bc)}`,
    }
})
