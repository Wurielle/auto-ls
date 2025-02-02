import styled from '@emotion/styled'
import { ScrollviewPropsWithDefaults } from './scrollview.shared.ts'
import { StBox } from '@/components/layout/box'
import { StyledProps } from '@/utils'

export const StScrollview = styled(StBox)<StyledProps<ScrollviewPropsWithDefaults>>((context) => {
    const {} = context
    return {}
})
