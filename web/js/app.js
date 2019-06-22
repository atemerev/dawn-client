function App() {
}

App.prototype.drawChart = function() {
    let svg = this.prepareSvg("#chart", "chart-book")
    let bbox = svg.node().getBoundingClientRect()
    console.log(bbox)
}

App.prototype.drawFrame = function(svg) {
}

App.prototype.prepareSvg = function(containerSelector, name) {
    return d3.select(containerSelector).append("svg").attr("id", name)
}

App.prototype.init = function() {
    this.drawChart()
}

const app = new App()
app.init()