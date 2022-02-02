#!/usr/bin/env node
'use strict'

const mri = require('mri')
const toString = require('virtual-dom-stringify')
const getStdin = require('get-stdin')

const pkg = require('./package.json')
const generate = require('.')

const argv = mri(process.argv.slice(2), {
	boolean: ['help', 'h', 'version', 'v', 'invert-y', 'y'],
})

if (argv.help || argv.h) {
	process.stdout.write(`
Usage:
    svg-transit-map

Options:
    -y --invert-y Invert the Y axis

Examples:
    cat graph.json | svg-transit-map -y > map.svg
\n`)
	process.exit(0)
}

if (argv.version || argv.v) {
	process.stdout.write(`svg-transit-map v${pkg.version}\n`)
	process.exit(0)
}

const showError = (err) => {
	console.error(err)
	process.exit(1)
}

const main = async () => {
	const stdin = await getStdin()
	const graph = JSON.parse(stdin)

	const invertY = !!(argv['invert-y'] || argv.y)

	const svg = generate(graph, invertY)
	return svg
}

main()
	.then(svg => { process.stdout.write(toString(svg)) })
	.catch(showError)
