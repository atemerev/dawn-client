import { AxisRight, AxisBottom } from '@vx/axis'
import { withBoundingRects, withBoundingRectsProps } from '@vx/bounds'
import { scaleLinear } from "@vx/scale"

const propTypes = {
    ...withBoundingRectsProps
}

const defaultProps = {
    data: []
}

function DepthChart({rect, parentRect, data}) {
    let prices = data.map((e) => e.price)
    let minPrice = Math.min(prices)
    let maxPrice = Math.max(prices)
    let xScale = scaleLinear({
        range: [rect.left, rect.width],
        domain: [minPrice, maxPrice]
    })
    return (
        <AxisBottom scale={}/>
    )
}