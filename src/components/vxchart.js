import React, { useState } from 'react';
import { AxisRight, AxisBottom } from '@vx/axis';
import { withParentSize } from '@vx/responsive';
import { Group } from '@vx/group';
import { scaleLinear } from '@vx/scale';
import { AreaClosed, Line } from '@vx/shape';
import { GradientOrangeRed, GradientTealBlue } from '@vx/gradient';
import { curveStepAfter } from '@vx/curve';
import { GridRows } from '@vx/grid';
import { GlyphTriangle } from '@vx/glyph';
import { Text } from '@vx/text';
import moize from 'moize';
import _ from 'lodash';

const margin = {
  top: 20,
  bottom: 50,
  left: 50,
  right: 100,
};

let nowTs = new Date().getTime();

const GroupMem = moize.reactSimple(Group);
const AxisBottomMem = moize.reactSimple(AxisBottom);
const AxisRightMem = moize.reactSimple(AxisRight);
const GridRowsMem = moize.reactSimple(GridRows);
const AreaClosedMem = moize.reactSimple(AreaClosed);

const roundUpTo = function(value, step) {
  return Math.round(value / step) * step;
};

function OrderLine(props) {
    <GroupMem top={yMax + 5} left={xScale(o.price)} key={'' + o.price}>
        <GlyphTriangle size={10} fill={'green'}/>
        <Text fill={'green'} stroke={''} fontSize={12} y={-10} textAnchor={'middle'}>{o.leavesQty}</Text>
    </GroupMem>
}

function PendingOrders(props) {
    let book = props.orderBook;
    let bidLines = book.bids.map(e => {
        return (
            <React.Fragment>
                <Line from={{x: tooltipX, y: 0}} to={{x: tooltipX, y: yMax}} className={'toolTipLine'}/>
                <Text fill={'lightgreen'} stroke={''} fontSize={10} x={tooltipX} y={yMax + 12} textAnchor={'middle'}>{entryPriceText}</Text>
                <GlyphTriangle top={yMax} left={tooltipX} size={25} fill={'lightgreen'}/>
            </React.Fragment>
        )
    });
}

function UnboundDepthChart(props) {
  const [tooltipX, setTooltipX] = useState(-1);
  const [orders, setOrders] = useState({});
  const [orderAmount] = useState(200);

  const avg = (props.data.bids[0].price + props.data.offers[0].price) / 2;

  const minPrice = avg - props.span;
  const maxPrice = avg + props.span;

  const xMax = props.parentWidth - margin.left - margin.right;
  const yMax = props.parentHeight - margin.top - margin.bottom;

  const xScale = scaleLinear({
    range: [0, xMax],
    domain: [minPrice - 1, maxPrice + 1],
  });

  const yScale = scaleLinear({
    range: [yMax, 0],
    domain: [0, 1000000],
    clamp: true,
  });

  const x = e => xScale(e.price);
  const y = e => yScale(e.amount);

  const glyphs = props.data.orders.map(o => {
    return (
      <GroupMem top={yMax + 5} left={xScale(o.price)} key={`${o.price}`}>
        <GlyphTriangle size={10} fill="green" />
        <Text fill="green" stroke="" fontSize={12} y={-10} textAnchor="middle">
          {o.leavesQty}
        </Text>
      </GroupMem>
    );
  });

  const handleMouseMove = event => {
    const currentTargetRect = event.currentTarget.getBoundingClientRect();

    let relX = event.pageX - currentTargetRect.left;
    const relPrice = roundUpTo(xScale.invert(relX), 0.5);

    relX = xScale(relPrice); // discrete tooltip locations
    setTooltipX(relX);
  };

  const showTooltip =
    tooltipX > margin.left && tooltipX < props.parentWidth - margin.right;
  const entryX = tooltipX - margin.left;
  const entryPrice = roundUpTo(xScale.invert(entryX), 0.5);
  const entryPriceText =
    Math.round(entryPrice) === entryPrice ? `${entryPrice}.0` : `${entryPrice}`;

  const handleClick = () => {
    if (entryX > 0 && entryX < xMax) {
      nowTs++; // eslint-disable-line

      const id = `mx${nowTs}`;
      const side = entryPrice < avg ? 'buy' : 'sell';
      const pendingOrder = {
        id,
        side,
        price: entryPrice,
        amount: orderAmount,
        time: new Date().getTime(),
      };
      const pendingEntry = {};

      pendingEntry[id] = pendingOrder;
      const newPendingOrders = _.assign({}, orders, pendingEntry);

      console.log(JSON.stringify(newPendingOrders));
      setOrders(newPendingOrders);
    }
  };

  return (
    <React.Fragment>
      <svg
        width={props.parentWidth}
        height={props.parentHeight}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
      >
        <GradientOrangeRed id="gradient-asks" />
        <GradientTealBlue id="gradient-bids" />

        <GroupMem top={margin.top} left={margin.left}>
          <AxisBottomMem scale={xScale} top={yMax} axisClassName="book-axis" />
          <AxisRightMem
            scale={yScale}
            left={xMax}
            grid
            axisClassName="book-axis"
          />

          <GridRowsMem
            scale={yScale}
            width={xMax}
            height={yMax}
            className="book-grid"
          />

          <AreaClosedMem
            data={props.data.bids}
            yScale={yScale}
            x={x}
            y={y}
            y0={0}
            stroke="#8ba1b9"
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
            stroke="#FDE0CC"
            strokeWidth={0}
            fill={"url('#gradient-asks')"}
            curve={curveStepAfter}
            opacity={0.5}
          />

          {glyphs}
        </GroupMem>

        {showTooltip && (
          <Group id="tooltip" top={margin.top} left={0}>
            <Line
              from={{ x: tooltipX, y: 0 }}
              to={{ x: tooltipX, y: yMax }}
              className="toolTipLine"
            />
            <Text
              fill="lightgreen"
              stroke=""
              fontSize={10}
              x={tooltipX}
              y={yMax + 12}
              textAnchor="middle"
            >
              {entryPriceText}
            </Text>
            <GlyphTriangle
              top={yMax}
              left={tooltipX}
              size={25}
              fill="lightgreen"
            />
          </Group>
        )}
      </svg>
    </React.Fragment>
  );
}

export const DepthChart = withParentSize(UnboundDepthChart);
