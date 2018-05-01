'use strict'

const V = require('vec2')

const clone = x => JSON.parse(JSON.stringify(x))
const f = (n) => Math.round(n * 1000) / 1000

const parallelise = (graph) => {
	const newEdges = []
	for (let edge of graph.edges) {
		// sort lines by name
		edge.metadata.lines = edge.metadata.lines.sort()

		// move parallel line edges next to each other
		for (let i = 0; i < edge.metadata.lines.length; i++) {
			const line = edge.metadata.lines[i]
			const newEdge = clone(edge)

			// remove grouped lines
			delete newEdge.lines
			// add single line
			newEdge.line = line

			if (edge.metadata.lines.length > 0) { // multiple lines running in parallel
				// get coordinates
				const source = graph.nodes.find(node => node.id === edge.source)
				if (!source) throw new Error(`Source node ${edge.source} not found.`)
				const start = [source.metadata.x, source.metadata.y]
				const target = graph.nodes.find(node => node.id === edge.target)
				if (!target) throw new Error(`Target node ${edge.target} not found.`)
				const end = [target.metadata.x, target.metadata.y]

				// get normalized orthogonal
				const [A, B] = [start, end]
					.sort((a, b) => f(a[0] + a[1]) - f(b[0] + b[1])) // get unified direction
				const offset = new V(B[0] - A[0], B[1] - A[1])

				if (offset.length() === 0) throw new Error(`Edge ${edge.source}-${edge.target} must have length > 0.`)

				offset.rotate(Math.PI / 2).divide(offset.length())

				// shift sideways
				offset.multiply((i - (edge.metadata.lines.length-1) / 2) / 7)

				newEdge.start = [start[0] + offset.x, start[1] + offset.y]
				newEdge.end = [end[0] + offset.x, end[1] + offset.y]
			}

			newEdges.push(newEdge)
		}
	}

	return newEdges
}

module.exports = parallelise
