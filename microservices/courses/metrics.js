const client = require('prom-client');

const register = new client.Registry();
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ register });

const requestCounter = new client.Counter({
	name: 'all_requests',
	help: 'All requests counter',
	labelNames: ['http', 'route', 'status'],
});
module.exports = { requestCounter };
