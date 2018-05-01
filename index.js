'use strict'

const h = require('virtual-dom/virtual-hyperscript/svg')

const generate = require('./lib/generate')

const styles = h('style', {}, `
	.line {
		stroke: #333;
		stroke-width: .09;
		fill: none;
		stroke-linejoin: round;
		stroke-linecap: round;
	}
	.station {
		stroke: none;
	}
	.transit {
		stroke: #555;
		stroke-width: .05;
		fill: #fff;
	}
`)

const generateWrapped = (graph, invertY) => {
	const {items, bbox} = generate(graph, invertY)

	// padding
	const l = bbox.left - .5
	const t = bbox.top - .5
	const w = bbox.width + 1
	const ht = bbox.height + 1

	return h('svg', {
		xmlns: 'http://www.w3.org/2000/svg',
		width: w * 20,
		height: ht * 20,
		viewBox: [l, t, w, ht].join(' ')
	}, [
		styles,
		h('g', items)
	])
}

module.exports = generateWrapped
