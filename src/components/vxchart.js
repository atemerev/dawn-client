import React, {useState} from 'react'
import {AxisRight, AxisBottom} from '@vx/axis'
import {withParentSize} from '@vx/responsive'
import {Group} from '@vx/group'
import {scaleLinear} from '@vx/scale'
import {AreaClosed, Line} from '@vx/shape'
import {curveStepBefore, curveStepAfter} from '@vx/curve'
import {GridRows} from '@vx/grid'
import {GlyphTriangle} from "@vx/glyph"
import {Text} from "@vx/text"
import moize from 'moize'

const margin = {
    top: 10,
    bottom: 50,
    left: 50,
    right: 100,
}

const GroupMem = moize.reactSimple(Group)
const AxisBottomMem = moize.reactSimple(AxisBottom)
const AxisRightMem = moize.reactSimple(AxisRight)
const GridRowsMem = moize.reactSimple(GridRows)
const AreaClosedMem = moize.reactSimple(AreaClosed)

function UnboundDepthChart(props) {

    let [tooltipX, setTooltipX] = useState(-1)

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
            <GroupMem top={yMax + 5} left={xScale(o.price)} key={'' + o.price}>
                <GlyphTriangle size={10} fill={'green'}/>
                <Text fill={'green'} stroke={''} fontSize={12} y={-10} textAnchor={'middle'}>{o.leavesQty}</Text>
            </GroupMem>
        )
    })

    let handleMouseMove = (event) => {
        let currentTargetRect = event.currentTarget.getBoundingClientRect()
        let relX = event.pageX - currentTargetRect.left
        setTooltipX(relX)
    }

    let showTooltip = tooltipX > margin.left && tooltipX < props.parentWidth - margin.right

    return (
        <React.Fragment>
            <svg width={props.parentWidth} height={props.parentHeight} onMouseMove={handleMouseMove}>
                <GroupMem top={margin.top} left={margin.left}>

                    <AxisBottomMem scale={xScale} top={yMax}/>
                    <AxisRightMem scale={yScale} left={xMax} grid={true}/>

                    <GridRowsMem scale={yScale} width={xMax} height={yMax}/>

                    <AreaClosedMem
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

                    <AreaClosedMem
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
                </GroupMem>

                {showTooltip &&
                <Group id={'tooltip'} top={margin.top} left={0}>
                    <Line from={{x: tooltipX, y: 0}} to={{x: tooltipX, y: yMax}} className={'toolTipLine'}/>
                </Group>}
            </svg>
        </React.Fragment>
    )
}

export let DepthChart = withParentSize(UnboundDepthChart)