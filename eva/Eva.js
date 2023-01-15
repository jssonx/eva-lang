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
            return this.eval(exp[1], env) + this.eval(exp[2], env);
        }
        if (exp[0] === '*') {
            return this.eval(exp[1], env) * this.eval(exp[2], env);
        }

        // ----------------------------------------------------------------
        // Block: sequence of expressions

        if (exp[0] === 'begin') {
            const blockEnv = new Environment({}, env);
            return this.evalBlock(exp, blockEnv);
        }

        // ----------------------------------------------------------------
        // Variable declaration: (var foo 10)

        if (exp[0] === 'var') {
            const [_, name, value] = exp;
            console.log(name, value, env);
            return env.define(name, this.eval(value, env)); // all the eval() need to be updated with value and env!
        }

        // ----------------------------------------------------------------
        // Variable access: foo

        if (isVariableName(exp)) {
            return env.lookup(exp);
        }
        
        // throw `Unimplemented`;
        throw `Unimplemented: ${JSON.stringify(exp)}`;
    }

    evalBlock(block, env) {
        let result;
        const [_tag, ...expressions] = block;
        expressions.forEach(exp => {
            result = this.eval(exp, env);
        });
        return result;
    }
}

function isNumber(exp) {
    return typeof exp === 'number';
}

function isString(exp) {
    return typeof exp === 'string' && exp[0] === '"' && exp.slice(-1) === '"';
}

function isVariableName(exp) {
    return typeof exp === 'string' && /^[a-zA-Z][a-zA-Z0-9_]*$/.test(exp);
}

// ----------------------------------------------------------------
// Tests:

const eva = new Eva(new Environment({
    null: null,

    true: true,
    false: false,

    VERSION: '0.1',
}));



assert.strictEqual(eva.eval(1), 1);
assert.strictEqual(eva.eval('"hello"'), 'hello');

// Math:

assert.strictEqual(eva.eval(['+', 1, 5]), 6);
assert.strictEqual(eva.eval(['+', ['+', 3, 2], 5]), 10);
assert.strictEqual(eva.eval(['+', ['*', 3, 2], 5]), 11);

// Variable:

assert.strictEqual(eva.eval(['var', 'x', 10]), 10);
assert.strictEqual(eva.eval('x'), 10);
assert.strictEqual(eva.eval(['var', 'y', 100]), 100);
assert.strictEqual(eva.eval('y'), 100);

assert.strictEqual(eva.eval('VERSION'), '0.1');

// var isUser = true:
assert.strictEqual(eva.eval(['var', 'isUser','true']), true);

assert.strictEqual(eva.eval(['var', 'z',['*', 2, 2]]), 4);
assert.strictEqual(eva.eval('z'), 4);

// Blocks:

assert.strictEqual(eva.eval(
    ['begin',
        ['var', 'x', 10],
        ['var', 'y', 20],
        ['+', ['*', 'x', 'y'], 30],
    ]), 
230); 

assert.strictEqual(eva.eval(
    ['begin',
        ['var', 'x', 10],
        ['begin',
            ['var', 'x', 20],
            'x',
        ],
        'x',
    ]), 
10);

assert.strictEqual(eva.eval(
    ['begin',
        ['var', 'value', 10],
        ['var', 'result', 
            ['begin',
                ['var', 'x', ['+', 'value', 10]],
                'x',
            ]],
        'result',
    ]), 
20);


console.log('All assertions passed');