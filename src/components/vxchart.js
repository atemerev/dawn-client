import React, {useState} from 'react'
import {AxisRight, AxisBottom} from '@vx/axis'
import {withParentSize} from '@vx/responsive'
import {Group} from '@vx/group'
import {scaleLinear} from '@vx/scale'
import {AreaClosed, Line, Area} from '@vx/shape'
import { GradientOrangeRed, GradientTealBlue } from '@vx/gradient'
import {curveStepBefore, curveStepAfter} from '@vx/curve'
import {GridRows} from '@vx/grid'
import {GlyphTriangle} from "@vx/glyph"
import {Text} from "@vx/text"
import moize from 'moize'
import _ from "lodash"

const margin = {
    top: 20,
    bottom: 50,
    left: 50,
    right: 100,
}

let nowTs = new Date().getTime()

const GroupMem = moize.reactSimple(Group)
const AxisBottomMem = moize.reactSimple(AxisBottom)
const AxisRightMem = moize.reactSimple(AxisRight)
const GridRowsMem = moize.reactSimple(GridRows)
const AreaClosedMem = moize.reactSimple(AreaClosed)

function UnboundDepthChart(props) {

    let [tooltipX, setTooltipX] = useState(-1)
    let [orders, setOrders] = useState({})
    let [orderAmount, setOrderAmount] = useState(200)

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
        domain: [0, 1000000],
        clamp: true
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
    let entryX = tooltipX - margin.left
    let entryPrice = roundUpTo(xScale.invert(entryX), 0.5)
    let entryPriceText = (Math.round(entryPrice) === entryPrice) ? entryPrice + '.0' : entryPrice + ''

    let handleClick = (event) => {
        if (entryX > 0 && entryX < xMax) {
            nowTs++
            let id = 'mx' + nowTs
            let side = entryPrice < avg ? 'buy' : 'sell'
            let pendingOrder = {'id': id, 'side': side, 'price': entryPrice, 'amount': orderAmount, 'time': new Date().getTime()}
            let pendingEntry = {}
            pendingEntry[id] = pendingOrder
            let newPendingOrders = _.assign({}, orders, pendingEntry)
            console.log(JSON.stringify(newPendingOrders))
            setOrders(newPendingOrders)
        }
    }

    return (
        <React.Fragment>
            <svg width={props.parentWidth} height={props.parentHeight} onMouseMove={handleMouseMove} onClick={handleClick}>

                <GradientOrangeRed id="gradient-asks"/>
                <GradientTealBlue id="gradient-bids"/>

                <GroupMem top={margin.top} left={margin.left}>

                    <AxisBottomMem scale={xScale} top={yMax} axisClassName={'book-axis'}/>
                    <AxisRightMem scale={yScale} left={xMax} grid={true} axisClassName={'book-axis'}/>

                    <GridRowsMem scale={yScale} width={xMax} height={yMax} className={'book-grid'}/>

                    <AreaClosedMem
                        data={props.data.bids}
                        yScale={yScale}
                        x={x}
                        y={y}
                        y0={0}
                        stroke={'#8ba1b9'}
                        strokeWidth={0}
                        fill={"url('#gradient-bids')"}
                        curve={curveStepAfter}
                        opacity={0.5}
                    />

                    <AreaClosedMem
                        data={props.data.offers}
                        yScale={yScale}
                        x={x}
                        y={y}
                        y0={0}
                        stroke={'#FDE0CC'}
                        strokeWidth={0}
                        fill={"url('#gradient-asks')"}
                        curve={curveStepAfter}
                        opacity={0.5}
                    />

                    {glyphs}
                </GroupMem>

                {showTooltip &&
                <Group id={'tooltip'} top={margin.top} left={0}>
                    <Line from={{x: tooltipX, y: 0}} to={{x: tooltipX, y: yMax}} className={'toolTipLine'}/>
                    <Text fill={'lightgreen'} stroke={''} fontSize={10} x={tooltipX} y={yMax + 12} textAnchor={'middle'}>{entryPriceText}</Text>
                    <GlyphTriangle top={yMax} left={tooltipX} size={25} fill={'lightgreen'}/>
                </Group>}
            </svg>
        </React.Fragment>
    )
}

let roundUpTo = function(value, step) {
    return Math.round(value / step) * step
}

export let DepthChart = withParentSize(UnboundDepthChart)