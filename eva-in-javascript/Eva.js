const fs = require('fs');
const Environment = require('./Environment');
const Transformer = require('./transform/Transformer');
const evaParser = require('./parser/evaParser');

// Eva Interpreter
class Eva {

    // Creates an Eva instance with the global environment
    constructor(global = GlobalEnvironment) {
        this.global = global;
        this._transformer = new Transformer();
    }

    // Evaluates global code wrapping into a block.
    evalGlobal(exp) {
        return this._evalBody(exp, this.global);
    }

    // Evaluates an expression in the given environment.
    eval(exp, env = this.global) {
        
        // this._logEnvChain(env);
        
        // Self-evaluating expressions:
        if (this._isNumber(exp)) {
            return exp;
        }
        if (this._isString(exp)) {
            return exp.slice(1, -1);
        }

        // Block: sequence of expressions
        if (exp[0] === 'begin') {
            const blockEnv = new Environment({}, env);
            return this._evalBlock(exp, blockEnv);
        }

        // Variable declaration: (var foo 10)
        if (exp[0] === 'var') {
            const [_, name, value] = exp;
            return env.define(name, this.eval(value, env)); // all the eval() need to be updated with value and env!
        }

        // Variable update: (set foo 100)
        if (exp[0] === 'set') {
            const [_, ref, value] = exp;
            if (ref[0] === 'prop') {
                const [_tag, instanceName, propName] = ref;
                const instanceEnv = this.eval(instanceName, env);
                return instanceEnv.define(propName, this.eval(value, env));
            }
            return env.assign(ref, this.eval(value, env));
        }

        // Variable access: foo
        if (this._isVariableName(exp)) {
            return env.lookup(exp);
        }

        // If-expression:
        if (exp[0] === 'if') {
            const [_tag, condition, consequent, alternate] = exp;
            if (this.eval(condition, env)) {
                return this.eval(consequent, env);
            }
            return this.eval(alternate, env);
        }

        // while-expression:
        if (exp[0] == 'while') {
            const [_tag, condition, body] = exp;
            let result;
            while (this.eval(condition, env)) {
                result = this.eval(body, env);
            }
            return result;
        }

        // Function declaration: (def square (x) (* x x))
        if (exp[0] === 'def') {
            const [_tag, name, params, body] = exp;
            const varExp = this._transformer.transformDefToVarLambda(exp);
            return this.eval(varExp, env);
        }

        // Switch-expression: (switch (cond1, block1) ... )
        if (exp[0] === 'switch') {
            const ifExp = this._transformer.transformSwitchToIf(exp);
            return this.eval(ifExp, env);
        }

        // For-loop: (for init condition modifier body )
        if (exp[0] === 'for') {
            const whileExp = this._transformer.transformForToWhile(exp);
            return this.eval(whileExp, env);
        }

        // Increment: (++ foo)
        if (exp[0] === '++') {
            const setExp = this._transformer.transformIncToSet(exp);
            return this.eval(setExp, env);
        }

        // Decrement: (-- foo)
        if (exp[0] === '--') {
            const setExp = this._transformer.transformDeccToSet(exp);
            return this.eval(setExp, env);
        }

        // Increment: (+= foo inc)
        if (exp[0] === '+=') {
            const setExp = this._transformer.transformIncValToSet(exp);
            return this.eval(setExp, env);
        }

        // Decrement: (-= foo dec)
        if (exp[0] === '-=') {
            const setExp = this._transformer.transformDecValToSet(exp);
            return this.eval(setExp, env);
        }

        // Lambda function: (lambda (x) (* x x))
        if (exp[0] === 'lambda') {
            const [_tag, params, body] = exp;
            return {
                params,
                body,
                env, // Closure!
            };
        }

        // Class declaration: (class <Name> <Parent> <Body>)
        if (exp[0] === 'class') {
            const [_tag, name, parent, body] = exp;
            const parentEnv = this.eval(parent, env) || env;
            const classEnv = new Environment({}, parentEnv);
            this._evalBody(body, classEnv);
            return env.define(name, classEnv);
        }

        // Class instantiation: (new <Class> <Arguments>...)
        if (exp[0] === 'new') {
            const classEnv = this.eval(exp[1], env);
            const instanceEnv = new Environment({}, classEnv);
            const args = exp
                .slice(2)
                .map(arg => this.eval(arg, env));
            
            this._callUserDefinedFunction(
                classEnv.lookup('constructor'),
                [instanceEnv, ...args],
            );
            return instanceEnv;
        }

        // Property access: (prop <instanceName> <propName>)
        if (exp[0] === 'prop') {
            const [_tag, instanceName, propName] = exp;
            const instanceEnv = this.eval(instanceName, env);

            return instanceEnv.lookup(propName);
        }

        // Super expressions: (super <ClassName>)
        if (exp[0] === 'super') {
            const [_tag, className] = exp;
            return this.eval(className, env).parent;
        }

        // Module declaration: (module <name> <body>)
        if (exp[0] === 'module') {
            const [_tag, name, body] = exp;
            const moduleEnv = new Environment({}, env);

            this._evalBody(body, moduleEnv);

            return env.define(name, moduleEnv);
        }

        // Module import: (import <name>)
        if (exp[0] === 'import') {
            const [_tag, name] = exp;
            const moduleSrc = fs.readFileSync(
                `${__dirname}/modules/${name}.eva`,
                'utf-8',
            );
            const body = evaParser.parse(`(begin ${moduleSrc})`);
            const moduleExp = ['module', name, body];
            return this.eval(moduleExp, env);
        }

        // Function calls:
        if (Array.isArray(exp)) {
            const fn = this.eval(exp[0], env);
            const args = exp
                .slice(1)
                .map(arg => this.eval(arg, env));
            // 1. Native function:
            if (typeof fn === 'function') {
                return fn(...args);
            }
            // 2. User-defined function:
            return this._callUserDefinedFunction(fn, args);
        }

        // throw `Unimplemented`;
        throw `Unimplemented: ${JSON.stringify(exp)}`;
    }

    _logEnvChain(env) {
        let env_output = env;
        let res = [];
        while (env_output.parent != null) {
            res.push(env_output.record);
            res.push('->');
            env_output = env_output.parent;
        }
        if(res.length > 0){
            res.pop();
        }
        console.log(res);
    }

    _callUserDefinedFunction(fn, args) {
        const activationRecord = {};
        fn.params.forEach((param, index) => {
            activationRecord[param] = args[index];
        });
        const activationEnv = new Environment(
            activationRecord,
            fn.env, // static scope!
            // env, // ? - dynamic scope!
        );
        return this._evalBody(fn.body, activationEnv);
    }

    _evalBody(body, env) {
        if (body[0] === 'begin') {
            return this._evalBlock(body, env);
        }
        return this.eval(body, env);
    }

    _evalBlock(block, env) {
        let result;
        const [_tag, ...expressions] = block;
        expressions.forEach(exp => {
            result = this.eval(exp, env);
        });
        return result;
    }

    _isNumber(exp) {
    return typeof exp === 'number';
    }

    _isString(exp) {
        return typeof exp === 'string' && exp[0] === '"' && exp.slice(-1) === '"';
    }

    _isVariableName(exp) {
        return typeof exp === 'string' && /^[+\-*/<>=a-zA-Z0-9_]+$/.test(exp);
    }
}

/**
 * Default Global Environment.
 */
const GlobalEnvironment = new Environment({
    null: null,

    true: true,
    false: false,

    VERSION: '0.1',

    // Operators:

    '+'(op1, op2) {
        return op1 + op2;
    },

    '*'(op1, op2) {
        return op1 * op2;
    },

    '-'(op1, op2 = null) {
        if (op2 == null) {
        return -op1;
        }
        return op1 - op2;
    },

    '/'(op1, op2) {
        return op1 / op2;
    },

    // Comparison:

    '>'(op1, op2) {
        return op1 > op2;
    },

    '<'(op1, op2) {
        return op1 < op2;
    },

    '>='(op1, op2) {
        return op1 >= op2;
    },

    '<='(op1, op2) {
        return op1 <= op2;
    },

    '='(op1, op2) {
        return op1 === op2;
    },

    // Console output:

    print(...args) {
        console.log(...args);
    },
});

module.exports = Eva;