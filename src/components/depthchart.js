import React, {PropTypes} from 'react'
import {createClassFromSpec} from 'react-vega'

const spec = {
    "$schema": "https://vega.github.io/schema/vega/v5.json",
    "autosize": "fit",
    "width": 800,
    "height": 350,

    "data": [
        {
            "name": "bids"
            // "values": [{"side": "offer","id": 8798756150,"price": 12438.5,"amount": 974692},{"side": "offer","id": 8798756100,"price": 12439,"amount": 164188},{"side": "offer","id": 8798756050,"price": 12439.5,"amount": 31162},{"side": "offer","id": 8798756000,"price": 12440,"amount": 389270},{"side": "offer","id": 8798755950,"price": 12440.5,"amount": 24671},{"side": "offer","id": 8798755900,"price": 12441,"amount": 8569},{"side": "offer","id": 8798755850,"price": 12441.5,"amount": 61727},{"side": "offer","id": 8798755800,"price": 12442,"amount": 356185},{"side": "offer","id": 8798755750,"price": 12442.5,"amount": 167344},{"side": "offer","id": 8798755700,"price": 12443,"amount": 23852},{"side": "offer","id": 8798755650,"price": 12443.5,"amount": 67870},{"side": "offer","id": 8798755600,"price": 12444,"amount": 269066},{"side": "offer","id": 8798755550,"price": 12444.5,"amount": 169977},{"side": "offer","id": 8798755500,"price": 12445,"amount": 93153},{"side": "offer","id": 8798755450,"price": 12445.5,"amount": 15154},{"side": "offer","id": 8798755400,"price": 12446,"amount": 29573},{"side": "offer","id": 8798755350,"price": 12446.5,"amount": 6158},{"side": "offer","id": 8798755300,"price": 12447,"amount": 30853},{"side": "offer","id": 8798755250,"price": 12447.5,"amount": 103060},{"side": "offer","id": 8798755200,"price": 12448,"amount": 95981}]
        },
        {
            "name": "offers"
        }
    ],

    "scales": [
        {
            "name": "x",
            "type": "linear",
            "range": "width",
            "nice": true,
            "zero": false,
            "domain": {
                "fields": [
                    {"data": "bids", "field": "price"},
                    {"data": "offers", "field": "price"}
                ]
            }
        },
        {
            "name": "y",
            "type": "linear",
            "range": "height",
            "clamp": true,
            "nice": true,
            "zero": true,
            "domain": [0, 1000000]
        }
    ],

    "axes": [
        {"orient": "bottom", "scale": "x"},
        {"orient": "right", "scale": "y", "grid": "true"}
    ],

    "marks": [
        {
            "type": "area",
            "from": {"data": "bids"},
            "key": "price",
            "sort": {"field": "datum.price", "order": "ascending"},
            "encode": {
                "enter": {
                    // "x": {"scale": "x", "field": "price"},
                    // "y": {"scale": "y", "field": "amount"},
                    // "y2": {"scale": "y", "value": 0},
                    "strokeWidth": {"value": 2},
                    "fill": {"value": "#aec7e8"}
                },
                "update": {
                    "x": {"scale": "x", "field": "price"},
                    "y": {"scale": "y", "field": "amount"},
                    "y2": {"scale": "y", "value": 0},
                    "interpolate": {"value": "step-before"},
                    "fillOpacity": {"value": 1}
                }
            }
        },
        {
            "type": "area",
            "from": {"data": "offers"},
            "key": "price",
            "sort": {"field": "datum.price", "order": "ascending"},
            "encode": {
                "enter": {
                    // "x": {"scale": "x", "field": "price"},
                    // "y": {"scale": "y", "field": "amount"},
                    // "y2": {"scale": "y", "value": 0},
                    "strokeWidth": {"value": 2},
                    "fill": {"value": "#ffbb78"}
                },
                "update": {
                    "x": {"scale": "x", "field": "price"},
                    "y": {"scale": "y", "field": "amount"},
                    "y2": {"scale": "y", "value": 0},
                    "interpolate": {"value": "step-after"},
                    "fillOpacity": {"value": 1}
                }
            }
        }
    ]


    // "marks": [
    //     {
    //         "type": "group",
    //     }
    // ]
}
export let DepthChart = createClassFromSpec('DepthChart', spec)