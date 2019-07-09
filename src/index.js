import * as d3 from "d3"
import {Bitmex} from "./vendor/bitmex"

function App(conf) {
    this.conf = conf
    this.bitmexClient = new Bitmex()
    this.connected = false
}


App.prototype.drawInitial = function() {
    let svg = this._prepareSvg("#chart", "chart-book")
    this._drawFrame(svg)
    return svg
}

App.prototype._drawFrame = function() {
    let svg = d3.select('svg#chart-book')
    let bbox = svg.node().getBoundingClientRect()
    svg.append('g')
        .attr('class', 'book-frame')
        .append('rect')
        .attr('x', 1)
        .attr('y', 1)
        .attr('width', bbox.width - 2)
        .attr('height', bbox.height - 2)
        .attr('stroke', '#95B771')
}

App.prototype._drawOrderDepth = function(svg, book) {
    let bid = book.bids[0].price
    let offer = book.offers[0].price
    let midPrice = (bid + offer) / 2
    let x = this._priceScale(svg, midPrice, conf.span)
    let y = this._amountScale(svg)
    let askArea = d3.area()
        .curve(d3.curveStepBefore)
        .x((d, i) => x(d.offers[i].price))
        .y((d, i) => y(d.offers[i].amount))

    svg.selectAll('g.depth')
        .append('path')
        .data(book)
        .attr('class', 'ask depth area')
        .attr('d', askArea)
}

App.prototype._mkTimeAxis = function(svg, midPrice, span) {
    let bbox = svg.node().getBoundingClientRect()
    let scale = this._priceScale(svg, midPrice, span)
    let axis = d3.axisBottom(scale)
        .tickSizeOuter(5)
        .tickPadding(9)
        .tickSize(-bbox.height + this.conf.timeAxisHeight, 0, 0)
    return axis;
}

App.prototype._drawPriceAxis = function(midPrice, span) {
    let svg = d3.select('svg#chart-book')
    let bbox = svg.node().getBoundingClientRect()
    let axis = this._mkTimeAxis(svg, midPrice, span)
    let y = bbox.height - this.conf.timeAxisHeight
    svg.append("g")
        .attr("class", "price axis")
        .attr("transform", "translate(" + 0 + ", " + y + ")")
        .call(axis)
}

App.prototype.

App.prototype._updatePriceAxis = function(midPrice, span) {
    let svg = d3.select('svg#chart-book')
    let axis = this._mkTimeAxis(svg, midPrice, span)
    // let t = d3.transition().duration(150).ease(d3.easeLinear)
    svg.select(".price").call(axis)
}

App.prototype._prepareSvg = function(containerSelector, name) {
    return d3.select(containerSelector).append("svg").attr("id", name)
}

App.prototype._priceScale = function(svg, midPrice, span) {
    let bbox = svg.node().getBoundingClientRect()
    let scale = d3.scaleLinear().domain([midPrice - span, midPrice + span]).range([5, bbox.width - 5])
    return scale
}

App.prototype._amountScale = function(svg) {
    let bbox = svg.node().getBoundingClientRect()
    let scale = d3.scaleLog(2).domain(0, 1000000).range(0, bbox.height / 2)
    return scale
}


App.prototype.init = async function() {
    let thisApp = this
    let svg = this.drawInitial()
    let eventListener = function (self, obj) {
        let table = obj.hasOwnProperty('table') ? obj.table : ''
        if (table.startsWith('orderBookL2')) {
            let book = self.market['XBTUSD']
            let bid = book.bids[0].price
            let offer = book.offers[0].price
            let midPrice = (bid + offer) / 2
            if (!thisApp.connected) {
                thisApp._drawPriceAxis(midPrice, conf.span)
                thisApp.connected = true
            } else {
                thisApp._updatePriceAxis(midPrice, conf.span)
                thisApp._drawOrderDepth(svg, book)
                svg.append("g").attr("class", "depth").attr("transform", "translate(" + 0 + "," + 200 + ")")
            }
        }
    }

    this.bitmexClient = new Bitmex(eventListener)
    let ws = await this.bitmexClient.connect('test', 'test')
    this.bitmexClient.subscribe(ws, ['orderBookL2:XBTUSD', 'trade:XBTUSD'])
}

// -------- init --------

const conf = {
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