import styled from '@emotion/styled'
import { PositionPropsWithDefaults } from './position.shared.ts'
import { getRawValue, getRemValue, StyledProps } from '@/utils/css-in-js'
import { Properties } from 'csstype'
import { level as _level, spacing as _spacing } from '@/tokens'
import isUndefined from 'lodash/isUndefined'
import { StTransform } from '@/components/layout/transform'

export const StPosition = styled(StTransform)<StyledProps<PositionPropsWithDefaults>>((context) => {
    const {
        theme: { level = _level, spacing = _spacing },
        styled: { relative, absolute, fixed, sticky, static: staticProp, position, inset, top, left, right, bottom, z },
    } = context
    return [
        {
            position:
                ([relative && 'relative', absolute && 'absolute', fixed && 'fixed', sticky && 'sticky', staticProp && 'static'].filter(
                    Boolean
                )[0] as Properties['position']) || position,
        },
        !isUndefined(inset) && {
            inset: typeof inset === 'boolean' ? 0 : getRemValue(inset, spacing),
        },
        !isUndefined(top) && {
            top: typeof top === 'boolean' ? 0 : getRemValue(top, spacing),
        },
        !isUndefined(left) && {
            left: typeof left === 'boolean' ? 0 : getRemValue(left, spacing),
        },
        !isUndefined(right) && {
            right: typeof right === 'boolean' ? 0 : getRemValue(right, spacing),
        },
        !isUndefined(bottom) && {
            bottom: typeof bottom === 'boolean' ? 0 : getRemValue(bottom, spacing),
        },
        !isUndefined(z) && {
            zIndex: getRawValue(z, level),
        },
    ]
})
