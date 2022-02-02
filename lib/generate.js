'use strict'

const h = require('virtual-dom/virtual-hyperscript/svg')
const uniq = require('lodash/uniq')
const uniqBy = require('lodash/uniqBy')

const normalize = require('./normalize')
const parallelise = require('./parallelise')

const f = (n) => Math.round(n * 1000) / 1000

const findEdgesAt = (graph, node) => graph.edges.filter(e => [e.source, e.target].includes(node.id))

// line group function (group name if set, line name if not)
const lineGroup = (lines, lineId) => (lines.find(l => l.id === lineId) || {}).group || lineId

const renderEdges = (lines, reportBbox) => (simpleEdge) => {
	const lineId = simpleEdge.line
	const lineColor = (lines.find(l => l.id === lineId) || { color: '#777' }).color

	const top = Math.min(simpleEdge.start[1], simpleEdge.end[1])
	const left = Math.min(simpleEdge.start[0], simpleEdge.end[0])
	const bottom = Math.max(simpleEdge.start[1], simpleEdge.end[1])
	const right = Math.max(simpleEdge.start[0], simpleEdge.end[0])
	reportBbox(top, left, bottom, right)

	return h('path', {
		class: 'line ' + lineId,
		style: { stroke: lineColor },
		d: 'M' + simpleEdge.start.map(f).join(' ') + 'L' + simpleEdge.end.map(f).join(' '),
	})
}

const renderStations = (graph, reportBbox) => (station) => {
	const edgesAt = findEdgesAt(graph, station)

	if (edgesAt.length === 0) throw new Error(`Station ${station.id} must have degree > 0.`)
	const isTransitNode = edgesAt.length > 2 || uniq(edgesAt.flatMap(e => e.metadata.lines)).length > 1

	// get the maximum number of parallel lines in any direction
	const maxDirectionDegree = Math.max(...edgesAt.map(e => e.metadata.lines.length))

	let color = '#333'
	if (!isTransitNode) {
		const lineId = edgesAt[0].metadata.lines[0]
		const lineColor = ((graph.lines || []).find(l => l.id === lineId) || { color: '#777' }).color
		color = lineColor
	}

	let radius
	if (station.dummy) radius = 0
	else if (isTransitNode) radius = 0.13 + (0.055 * (maxDirectionDegree - 1))
	else radius = 0.1

	const c = station.metadata
	reportBbox(c.y - radius, c.x - radius, c.y + radius, c.x + radius)
	return h('circle', {
		class: isTransitNode ? 'station transit' : 'station',
		'data-id': station.id,
		'data-label': station.label,
		cx: f(c.x),
		cy: f(c.y),
		r: radius + '',
		fill: color,
	})
}

const generate = (graph, invertY) => {
	graph = normalize(graph, invertY)

	const lines = graph.lines || []

	let top = Infinity; let left = Infinity; let bottom = -Infinity; let right = -Infinity
	const reportBbox = (t, l, b, r) => {
		if (t < top) top = t
		if (l < left) left = l
		if (b > bottom) bottom = b
		if (r > right) right = r
	}

	// merge line groups
	graph.edges = graph.edges.map(edge => {
		edge.metadata.lines = uniqBy(edge.metadata.lines, l => lineGroup(lines, l))
		return edge
	})

	const items = [].concat(
		parallelise(graph).map(renderEdges(lines, reportBbox)),
		graph.nodes.filter(n => !n.dummy).map(renderStations(graph, reportBbox)),
	)

	left = f(left)
	top = f(top)
	const width = f(right - left)
	const height = f(bottom - top)
	const bbox = Object.assign([left, top, width, height], { left, top, width, height })

	return { items, bbox }
}

module.exports = generate
