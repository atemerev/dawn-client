import React, {PropTypes} from 'react'
import {createClassFromSpec} from 'react-vega'

const spec = {
    "$schema": "https://vega.github.io/schema/vega/v5.json",
    "autosize": "fit",

    "data": [
        {
            "name": "book"
        }
    ],

    "scales": [
        {
            "name": "x",
            "type": "point",
            "range": "width",
            "domain": {"data": "book", "field": "price", "sort": true}
        },
        {
            "name": "y",
            "type": "log",
            "range": "height",
            "nice": true,
            "zero": true,
            "domain": {"data": "book", "field": "amount", "sort": true}
        },
        {
            "name": "color",
            "type": "ordinal",
            "range": "category",
            "domain": {"data": "book", "field": "side"}
        }
    ],

    "axes": [
        {"orient": "bottom", "scale": "x"},
        {"orient": "right", "scale": "y"}
    ],

    "marks": [
        {
            "type": "group",
            "from": {
                "facet": {
                    "name": "series",
                    "data": "book",
                    "groupby": "side"
                }
            },
            "marks": [
                {
                    "type": "line",
                    "from": {"data": "series"},
                    "encode": {
                        "enter": {
                            "x": {"scale": "x", "field": "price"},
                            "y": {"scale": "y", "field": "amount"},
                            "stroke": {"scale": "color", "field": "side"},
                            "strokeWidth": {"value": 2}
                        },
                        "update": {
                            "interpolate": "stepBefore",
                            "fillOpacity": {"value": 1}
                        }
                    }
                }
            ]
        }
    ]
}


export default createClassFromSpec('DepthChart', spec)