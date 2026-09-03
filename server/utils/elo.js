function expected(a, b) { return 1 / (1 + Math.pow(10, (b - a) / 400)); }
function update(a, b, result, k = 32) { return Math.round(a + k * (result - expected(a, b))); }
module.exports = { expected, update };
