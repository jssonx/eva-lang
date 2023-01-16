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
        // Comparison operators:

        if (exp[0] === '>') {
            return this.eval(exp[1], env) > this.eval(exp[2], env);
        }

        if (exp[0] === '>=') {
            return this.eval(exp[1], env) >= this.eval(exp[2], env);
        }

        if (exp[0] === '<') {
            return this.eval(exp[1], env) < this.eval(exp[2], env);
        }

        if (exp[0] === '<=') {
            return this.eval(exp[1], env) <= this.eval(exp[2], env);
        }

        if (exp[0] === '=') {
            return this.eval(exp[1], env) === this.eval(exp[2], env);
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
            return env.define(name, this.eval(value, env)); // all the eval() need to be updated with value and env!
        }

        // ----------------------------------------------------------------
        // Variable update: (set foo 100)

        if (exp[0] === 'set') {
            const [_, name, value] = exp;
            return env.assign(name, this.eval(value, env));
        }

        // ----------------------------------------------------------------
        // Variable access: foo

        if (isVariableName(exp)) {
            return env.lookup(exp);
        }

        // ----------------------------------------------------------------
        // If-expression:

        if (exp[0] === 'if') {
            const [_tag, condition, consequent, alternate] = exp;
            if (this.eval(condition, env)) {
                return this.eval(consequent, env);
            }
            return this.eval(alternate, env);
        }

        // ----------------------------------------------------------------
        // while-expression:

        if (exp[0] == 'while') {
            const [_tag, condition, body] = exp;
            let result;
            while (this.eval(condition, env)) {
                result = this.eval(body, env);
            }
            return result;
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

module.exports = Eva;
