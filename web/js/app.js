const client = {}

client.drawChart = () => {
    let svg = client.prepareSvg("#chart", "chart-book")
    let bbox = svg.node().getBoundingClientRect()
}

client.drawFrame = (svg) => {
}

client.prepareSvg = (containerSelector, name) => {
    return d3.select(containerSelector)
        .append("svg")
        .attr("id", name)
}