function App() {
}

App.prototype.drawChart = function() {
    let svg = this.prepareSvg("#chart", "chart-book")
    this.drawFrame(svg)
}

App.prototype.drawFrame = function(svg) {
    let bbox = svg.node().getBoundingClientRect()
    svg.append('rect')
        .attr('x', 1)
        .attr('y', 1)
        .attr('width', bbox.width - 2)
        .attr('height', bbox.height - 2)
        .attr('stroke', '#95B771')

}

App.prototype.prepareSvg = function(containerSelector, name) {
    return d3.select(containerSelector).append("svg").attr("id", name)
}

App.prototype.init = function() {
    this.drawChart()
}

const app = new App()
app.init()