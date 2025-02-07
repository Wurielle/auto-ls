import styled from '@emotion/styled'
import { BoxPropsWithDefaults } from './box.shared.ts'
import {
    borderRadius as _borderRadius,
    borderStyle as _borderStyle,
    borderWidth as _borderWidth,
    colors as _colors,
    elevation,
    spacing as _spacing,
} from '@/tokens'
import get from 'lodash/get'
import { getRawValue, getRemValue, StyledProps } from '@/utils/css-in-js'
import isUndefined from 'lodash/isUndefined'

export const StBox = styled('div')<StyledProps<BoxPropsWithDefaults>>((context) => {
    const {
        theme: { spacing = _spacing, colors = _colors, borderRadius = _borderRadius, borderStyle = _borderStyle, borderWidth = _borderWidth },
        styled: {
            display,
            basis,
            grow,
            shrink,
            opacity,
            elevation: elevationProp,
            bg,
            w,
            h,
            mih,
            miw,
            mah,
            maw,
            p,
            px,
            py,
            pt,
            pl,
            pb,
            pr,
            m,
            mx,
            my,
            mt,
            ml,
            mb,
            mr,
            br,
            btlr,
            btrr,
            bblr,
            bbrr,
            bs,
            bw,
            btw,
            brw,
            blw,
            bbw,
            bc,
            overflow,
            overflowX,
            overflowY,
            cursor,
            pointerEvents,
            userSelect,
        },
    } = context
    return [
        {
            minWidth: 0,
            minHeight: 0,
        },
        !isUndefined(display) && {
            display,
        },
        !isUndefined(basis) && {
            flexBasis: basis === 'full' ? '100%' : getRemValue(basis),
        },
        !isUndefined(grow) && {
            flexGrow: Number(grow),
        },
        !isUndefined(shrink) && {
            flexShrink: Number(shrink),
        },
        !isUndefined(opacity) && {
            opacity,
        },
        elevationProp && {
            boxShadow: getRawValue(elevationProp, elevation),
        },
        !isUndefined(bg) && {
            background: get(colors, bg) || bg,
        },
        !isUndefined(w) && {
            width: w === 'full' ? '100%' : getRemValue(w),
        },
        !isUndefined(h) && {
            height: h === 'full' ? '100%' : getRemValue(h),
        },
        !isUndefined(miw) && {
            minWidth: miw === 'full' ? '100%' : getRemValue(miw),
        },
        !isUndefined(mih) && {
            minHeight: mih === 'full' ? '100%' : getRemValue(mih),
        },
        !isUndefined(maw) && {
            maxWidth: maw === 'full' ? '100%' : getRemValue(maw),
        },
        !isUndefined(mah) && {
            maxHeight: mah === 'full' ? '100%' : getRemValue(mah),
        },
        !isUndefined(p) && {
            paddingTop: getRemValue(p, spacing),
            paddingLeft: getRemValue(p, spacing),
            paddingRight: getRemValue(p, spacing),
            paddingBottom: getRemValue(p, spacing),
        },
        !isUndefined(px) && {
            paddingLeft: getRemValue(px, spacing),
            paddingRight: getRemValue(px, spacing),
        },
        !isUndefined(py) && {
            paddingTop: getRemValue(py, spacing),
            paddingBottom: getRemValue(py, spacing),
        },
        !isUndefined(pt) && {
            paddingTop: getRemValue(pt, spacing),
        },
        !isUndefined(pl) && {
            paddingLeft: getRemValue(pl, spacing),
        },
        !isUndefined(pr) && {
            paddingRight: getRemValue(pr, spacing),
        },
        !isUndefined(pb) && {
            paddingBottom: getRemValue(pb, spacing),
        },
        !isUndefined(m) && {
            marginTop: getRemValue(m, spacing),
            marginLeft: getRemValue(m, spacing),
            marginRight: getRemValue(m, spacing),
            marginBottom: getRemValue(m, spacing),
        },
        !isUndefined(mx) && {
            marginLeft: getRemValue(mx, spacing),
            marginRight: getRemValue(mx, spacing),
        },
        !isUndefined(my) && {
            marginTop: getRemValue(my, spacing),
            marginBottom: getRemValue(my, spacing),
        },
        !isUndefined(mt) && {
            marginTop: getRemValue(mt, spacing),
        },
        !isUndefined(ml) && {
            marginLeft: getRemValue(ml, spacing),
        },
        !isUndefined(mr) && {
            marginRight: getRemValue(mr, spacing),
        },
        !isUndefined(mb) && {
            marginBottom: getRemValue(mb, spacing),
        },
        !isUndefined(br) && {
            borderRadius: getRemValue(br, borderRadius),
        },
        !isUndefined(btlr) && {
            borderTopLeftRadius: getRemValue(btlr, borderRadius),
        },
        !isUndefined(btrr) && {
            borderTopRightRadius: getRemValue(btrr, borderRadius),
        },
        !isUndefined(bblr) && {
            borderBottomLeftRadius: getRemValue(bblr, borderRadius),
        },
        !isUndefined(bbrr) && {
            borderBottomRightRadius: getRemValue(bbrr, borderRadius),
        },
        bs && {
            borderStyle: getRawValue(bs, borderStyle),
        },
        !isUndefined(bw) && {
            borderWidth: getRemValue(bw, borderWidth),
        },
        !isUndefined(btw) && {
            borderBottomWidth: getRemValue(btw, borderWidth),
        },
        !isUndefined(brw) && {
            borderRightWidth: getRemValue(brw, borderWidth),
        },
        !isUndefined(blw) && {
            borderLeftWidth: getRemValue(blw, borderWidth),
        },
        !isUndefined(bbw) && {
            borderBottomWidth: getRemValue(bbw, borderWidth),
        },
        bc && {
            borderColor: get(colors, bc) || bc,
        },
        overflow && {
            overflow,
        },
        overflowX && {
            overflowX,
        },
        overflowY && {
            overflowY,
        },
        cursor && {
            cursor,
        },
        pointerEvents && {
            pointerEvents,
        },
        userSelect && {
            userSelect,
        },
    ]
})
