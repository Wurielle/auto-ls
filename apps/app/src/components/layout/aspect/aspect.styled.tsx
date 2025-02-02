import styled from '@emotion/styled'
import { AspectPropsWithDefaults } from './aspect.shared.ts'
import { StBox } from '@/components/layout/box'
import { ratio as _ratio } from '@/tokens'
import { getRawValue, StyledProps } from '@/utils/css-in-js'
import isUndefined from 'lodash/isUndefined'

export const StAspect = styled(StBox)<StyledProps<AspectPropsWithDefaults>>((context) => {
    const {
        theme: { ratio = _ratio },
        styled: { ratio: ratioProp },
    } = context
    return [
        !isUndefined(ratioProp) && {
            aspectRatio: getRawValue(ratioProp, ratio),
        },
    ]
})
