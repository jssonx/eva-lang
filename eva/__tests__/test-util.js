const assert = require('assert');
const evaParser = require('../parser/evaParser');

function test(eva, code, expected) {
    // parser: translate string from s-expression to eva expression
    // (+ (* 2 3) 5) => [ 'begin', [ '+', [ '*', 2, 3 ], 5 ] ]
    const exp = evaParser.parse(`(begin ${code})`);
    // console.log(code, exp);
    // console.log("--------------------------------");
    assert.strictEqual(eva.eval(exp), expected);
}

module.exports = {
    test,
};