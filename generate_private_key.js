const { table } = require('console')
const crypto = require('crypto')

const key1 = crypto.randomBytes(32).toString()
const key2 = crypto.randomBytes(32).toString();
const key3 = crypto.randomBytes(32).toString();

table({key1, key2, key3})