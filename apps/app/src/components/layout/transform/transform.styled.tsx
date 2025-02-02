import styled from '@emotion/styled'
import { TransformPropsWithDefaults } from './transform.shared.ts'
import { StBox } from '@/components/layout/box'
import isUndefined from 'lodash/isUndefined'
import { getRemValue, StyledProps } from '@/utils'
import { spacing as _spacing } from '@/tokens'

export const StTransform = styled(StBox)<StyledProps<TransformPropsWithDefaults>>((context) => {
    const {
        theme: { spacing = _spacing },
        styled: {
            transform: transformProp,
            transformOrigin,
            translate,
            translateX,
            translateY,
            translateZ,
            translate3d,
            rotate,
            scale,
            scaleX,
            scaleY,
            scaleZ,
            scale3d,
            skew,
            skewX,
            skewY,
            rotateX,
            rotateY,
            rotateZ,
            rotate3d,
            perspective,
        },
    } = context
    const transform = [
        transformProp,
        !isUndefined(translate) &&
            `translate(${
                typeof translate === 'object'
                    ? translate
                          .map((value) => getRemValue(value, spacing))
                          .filter(Boolean)
                          .join(', ')
                    : translate
            })`,
        !isUndefined(translateX) && `translateX(${getRemValue(translateX, spacing)})`,
        !isUndefined(translateY) && `translateY(${getRemValue(translateY, spacing)})`,
        !isUndefined(translateZ) && `translateZ(${getRemValue(translateZ, spacing)})`,
        !isUndefined(translate3d) && `translate3d(${translate3d.map((value) => getRemValue(value, spacing)).join(', ')})`,
        !isUndefined(scale) && `scale(${typeof scale === 'object' ? scale.join(', ') : scale})`,
        !isUndefined(scaleX) && `scaleX(${scaleX})`,
        !isUndefined(scaleY) && `scaleY(${scaleY})`,
        !isUndefined(scaleZ) && `scaleZ(${scaleZ})`,
        !isUndefined(scale3d) && `scale3d(${typeof scale3d === 'object' ? scale3d.join(', ') : scale3d})`,
        !isUndefined(skew) && `skew(${typeof skew === 'object' ? skew.join(', ') : skew})`,
        !isUndefined(skewX) && `skewX(${skewX})`,
        !isUndefined(skewY) && `skewY(${skewY})`,
        !isUndefined(rotate) && `rotate(${typeof rotate === 'object' ? rotate.join(', ') : rotate})`,
        !isUndefined(rotateX) && `rotateX(${rotateX})`,
        !isUndefined(rotateY) && `rotateY(${rotateY})`,
        !isUndefined(rotateZ) && `rotateZ(${rotateZ})`,
        !isUndefined(rotate3d) && `rotate3d(${typeof rotate3d === 'object' ? rotate3d.join(', ') : rotate3d})`,
    ]
        .filter(Boolean)
        .join(' ')
    return [
        transform && {
            transform,
        },
        transformOrigin && {
            transformOrigin: typeof transformOrigin === 'object' ? transformOrigin.join(' ') : transformOrigin,
        },
        !isUndefined(perspective) && {
            perspective: getRemValue(perspective, spacing),
        },
    ]
})
