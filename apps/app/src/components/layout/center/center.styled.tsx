import styled from '@emotion/styled'
import { CenterPropsWithDefaults } from './center.shared.ts'
import { StBox } from '@/components/layout/box'
import { StyledProps } from '@/utils'

export const StCenter = styled(StBox)<StyledProps<CenterPropsWithDefaults>>((context) => {
    const {
        styled: { inline },
    } = context
    return {
        display: inline ? 'inline-flex' : 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    }
})
