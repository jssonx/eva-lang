// Test driven development
const assert = require('assert');
const Environment = require('./Environment');

/**
 * Eva Interpreter
 */

class Eva {

    /**
     * Creates an Eva instance with the gloval environment
     */
    constructor(global = new Environment()) {
        this.global = global;
    }

    /**
     * Evaluates an expression in the given environment.
     */
    eval(exp, env = this.global) {
        // ----------------------------------------------------------------
        // Self-evaluating expressions:

        if (isNumber(exp)) {
            return exp;
        }
        if (isString(exp)) {
            return exp.slice(1, -1);
        }

        // ----------------------------------------------------------------
        // Math operations:

        // if (exp[0] == '+') {
        //     return exp[1] + exp[2];
        // }
        if (exp[0] === '+') {
            return this.eval(exp[1]) + this.eval(exp[2]);
        }
        if (exp[0] === '*') {
            return this.eval(exp[1]) * this.eval(exp[2]);
        }

        // ----------------------------------------------------------------
        // Variable declaration:
        
        if (exp[0] === 'var') {
            const [_, name, value] = exp;
            return env.define(name, value);
        }
        
        // throw `Unimplemented`;
        throw `Unimplemented: ${JSON.stringify(exp)}`;
    }
}

function isNumber(exp) {
    return typeof exp === 'number';
}

function isString(exp) {
    return typeof exp === 'string' && exp[0] === '"' && exp.slice(-1) === '"';
}

// ----------------------------------------------------------------
// Tests:

const eva = new Eva();
assert.strictEqual(eva.eval(1), 1);
assert.strictEqual(eva.eval('"hello"'), 'hello');

// Math:

assert.strictEqual(eva.eval(['+', 1, 5]), 6);
assert.strictEqual(eva.eval(['+', ['+', 3, 2], 5]), 10);
assert.strictEqual(eva.eval(['+', ['*', 3, 2], 5]), 11);

// Variable:

assert.strictEqual(eva.eval(['var', 'x', 10]), 10);

console.log('All assertions passed');