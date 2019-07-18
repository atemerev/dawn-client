import * as React from "react"
import { AxisRight, AxisBottom } from '@vx/axis'
import { withParentSize } from '@vx/responsive'
import { Group } from '@vx/group'
import { scaleLinear } from '@vx/scale'
import {AreaClosed} from '@vx/shape'
import { curveStepBefore, curveStepAfter } from '@vx/curve'
import { GridRows } from '@vx/grid'

const margin = {
    top: 10,
    bottom: 50,
    left: 50,
    right: 100,
};

function UnboundDepthChart(props) {

    let bids = props.data.bids.map((e) => e.price)
    let offers = props.data.offers.map((e) => e.price)

    let minPrice = Math.min(...bids)
    let maxPrice = Math.max(...offers)

    const xMax = props.parentWidth - margin.left - margin.right;
    const yMax = props.parentHeight - margin.top - margin.bottom;

    let xScale = scaleLinear({
        range: [0, xMax],
        domain: [minPrice - 1, maxPrice + 1]
    })

    let yScale = scaleLinear({
        range: [yMax, 0],
        domain: [0, 1000000]
    })

    const x = (e) => xScale(e.price)
    const y = (e) => yScale(e.amount)

    return (
        <svg width={props.parentWidth} height={props.parentHeight}>
            <Group top={margin.top} left={margin.left}>

                <AxisBottom scale={xScale} top={yMax}/>
                <AxisRight scale={yScale} left={xMax} grid={true}/>

                <GridRows scale={yScale} width={xMax} height={yMax}/>

                <AreaClosed
                    data={props.data.bids}
                    yScale={yScale}
                    x={x}
                    y={y}
                    y0={0}
                    stroke={''}
                    strokeWidth={0}
                    fill={'#aec7e8'}
                    curve={curveStepBefore}
                />

                <AreaClosed
                    data={props.data.offers}
                    yScale={yScale}
                    x={x}
                    y={y}
                    y0={0}
                    stroke={''}
                    strokeWidth={0}
                    fill={'#ffbb78'}
                    curve={curveStepAfter}
                />

            </Group>
        </svg>
    )
}

export let DepthChart = withParentSize(UnboundDepthChart)