const nodeCache = require('node-cache');

require('dotenv').config();

const cache = new nodeCache({
  stdTTL: parseInt(process.env.CACHE_TTL)
});

module.exports = {
  cache
};
