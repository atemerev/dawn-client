import * as React from "react"
import { AxisRight, AxisBottom } from '@vx/axis'
import { withParentSize } from '@vx/responsive'
import { Group } from '@vx/group'
import { scaleLinear } from '@vx/scale'
import {AreaClosed, LinePath} from '@vx/shape'
import { curveStepBefore, curveStepAfter } from '@vx/curve'
import { GridRows } from '@vx/grid'
import {GlyphTriangle} from "@vx/glyph";
import {Text} from "@vx/text";

const margin = {
    top: 10,
    bottom: 50,
    left: 50,
    right: 100,
};

function UnboundDepthChart(props) {

    let avg = (props.data.bids[0].price + props.data.offers[0].price) / 2

    let minPrice = avg - props.span
    let maxPrice = avg + props.span

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

    let glyphs = props.data.orders.map((o) => {
        return (
            <Group top={yMax + 5} left={xScale(o.price)} key={'' + o.price}>
                <GlyphTriangle size={10} fill={'green'}/>
                <Text fill={'green'} stroke={''} fontSize={12} y={-10} textAnchor={'middle'}>{o.leavesQty}</Text>
            </Group>
        )
    })

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

                {glyphs}
            </Group>
        </svg>
    )
}

export let DepthChart = withParentSize(UnboundDepthChart)