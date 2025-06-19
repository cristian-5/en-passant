export default {
	input: './pgn.peggy',
	output: './pgn.js',
	format: 'es',
	dts: true,
	allowedStartRules: ['pgn'],
	returnTypes: {
		pgn: '{ headers: Record<string, string>, root: import("./node").Node, result?: string }',
	}
}