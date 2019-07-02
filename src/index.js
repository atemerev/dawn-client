import * as d3 from "d3"
import {Bitmex} from "./vendor/bitmex";

function App(conf) {
    this.conf = conf
    this.bitmexClient = new Bitmex()
}

App.prototype.drawChart = function() {
    let svg = this._prepareSvg("#chart", "chart-book")
    let conf = this.conf
    this._drawFrame(svg)
    this._drawPriceAxis(svg, conf.midPrice, conf.span)
}

App.prototype._drawFrame = function(svg) {
    let bbox = svg.node().getBoundingClientRect()
    svg.append('rect')
        .attr('x', 1)
        .attr('y', 1)
        .attr('width', bbox.width - 2)
        .attr('height', bbox.height - 2)
        .attr('stroke', '#95B771')
}

App.prototype._drawPriceAxis = function(svg, midPrice, span) {
    let bbox = svg.node().getBoundingClientRect()
    let scale = this._priceScale(svg, midPrice, span)
    let axis = d3.axisBottom(scale)
        .tickSizeOuter(5)
        .tickPadding(9)
        .tickSize(-bbox.height + this.conf.timeAxisHeight, 0, 0)
    let y = bbox.height - this.conf.timeAxisHeight
    svg.append("g")
        .attr("class", "price axis")
        .attr("transform", "translate(" + 0 + ", " + y + ")")
        .call(axis)
}

App.prototype._prepareSvg = function(containerSelector, name) {
    return d3.select(containerSelector).append("svg").attr("id", name)
}

App.prototype._priceScale = function(svg, midPrice, span) {
    let bbox = svg.node().getBoundingClientRect()
    let scale = d3.scaleLinear().domain([midPrice - span, midPrice + span]).range([5, bbox.width - 5])
    return scale
}

App.prototype.init = async function() {
    this.drawChart()
    let ws = await this.bitmexClient.connect('test', 'test')
    this.bitmexClient.subscribe(ws, ['orderBookL2:XBTUSD', 'trade:XBTUSD'])
}

// -------- init --------

const conf = {
    midPrice: 11120,
    span: 95,
    timeAxisHeight: 30,
    symbol: "XBTUSD",
    amountAxisWidth: 55
}

const app = new App(conf)

app.init().then(() => {
    console.log("Client initialized")
}).catch((err) => {
    console.error(err)
})