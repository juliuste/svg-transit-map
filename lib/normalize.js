'use strict'

const sum = require('lodash.sum')

const clone = x => JSON.parse(JSON.stringify(x))

// normalize average edge length to 1
const normalize = (_graph, invertY = false) => {
    const graph = clone(_graph)

    const edgeLengths = graph.edges.map(e => {
        const source = graph.nodes.find(n => n.id === e.source).metadata
        const target = graph.nodes.find(n => n.id === e.target).metadata

        return Math.sqrt(Math.pow(source.x - target.x, 2) + Math.pow(source.y - target.y, 2))
    })

    const averageEdgeLength = sum(edgeLengths)/edgeLengths.length
    const scalar = 1 / averageEdgeLength

    for (let node of graph.nodes) {
        node.metadata.x *= scalar
        node.metadata.y *= scalar * (invertY ? (-1) : 1)
    }

    return graph
}

module.exports = normalize
