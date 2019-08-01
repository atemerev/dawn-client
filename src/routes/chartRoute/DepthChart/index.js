import React, { Fragment, useState, memo } from 'react';
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

import cn from './styles.css';

const margin = {
  top: 20,
  bottom: 50,
  left: 20,
  right: 70,
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

const OrderLine = memo(({ top, left, price }) => (
  <Group top={top} left={left}>
    <GlyphTriangle size={10} fill="green" top={-30} />
    <Text fill="green" stroke="" fontSize={12} textAnchor="middle">
      {price}
    </Text>
  </Group>
));

/* eslint-disable */
function PendingOrders(props) {
  const book = props.orderBook;

  const bidLines = book.bids.map(e => {
    return (
      <Fragment>
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
        <GlyphTriangle top={yMax} left={tooltipX} size={25} fill="lightgreen" />
        />
      </Fragment>
    );
  });
}
/* eslint-enable */

function UnboundDepthChart({
  data,
  onOrderAdd,
  parentHeight,
  parentWidth,
  span,
  orders,
}) {
  const [tooltipX, setTooltipX] = useState(-1);
  const [orderAmount] = useState(200);

  const avg = (data.bids[0].price + data.offers[0].price) / 2;

  const minPrice = avg - span;
  const maxPrice = avg + span;

  const xMax = parentWidth - margin.left - margin.right;
  const yMax = parentHeight - margin.top - margin.bottom;

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

  const glyphs = data.orders.map(o => {
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
    tooltipX > margin.left && tooltipX < parentWidth - margin.right;
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

      console.log(JSON.stringify(pendingOrder));

      onOrderAdd(pendingOrder);
    }
  };

  const pricePositions = orders.map(({ id, price }) => ({
    id,
    price,
    left: xScale(price) + margin.left,
    top: margin.top + yMax + 35,
  }));

  return (
    <Fragment>
      <svg
        width={parentWidth}
        height={parentHeight}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
      >
        <GradientOrangeRed id="gradient-asks" />
        <GradientTealBlue id="gradient-bids" />
        <GroupMem top={margin.top} left={margin.left}>
          <AxisBottomMem
            scale={xScale}
            top={yMax}
            axisClassName={cn.bookAxis}
          />
          <AxisRightMem
            scale={yScale}
            left={xMax}
            grid
            axisClassName={cn.bookAxis}
          />

          <GridRowsMem
            scale={yScale}
            width={xMax}
            height={yMax}
            className={cn.bookGrid}
          />

          <AreaClosedMem
            data={data.bids}
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
            data={data.offers}
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
              className={cn.toolTipLine}
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
        {pricePositions.map(({ id, ...rest }, index) => (
          <OrderLine key={`${id} ${index}`} {...rest} />
        ))}
      </svg>
    </Fragment>
  );
}

export default withParentSize(UnboundDepthChart);
