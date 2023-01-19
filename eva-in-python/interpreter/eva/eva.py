import re
import os

dirname = os.path.dirname(__file__) 
moduleDirName = os.path.join(dirname, "../modules")

from .environment import *
from ..transform.transformer import Transformer
from ..parser.evaParser import *

GlobalEnvironment = Environment({
    'null': None,
    'true': True,
    'false': False,
    'VERSION': '0.1',
    '+': lambda op1, op2 : op1+op2,
    '-': lambda op1, op2 = None : op1-op2 if op2 else -op1,
    '*': lambda op1, op2 : op1*op2,
    '/': lambda op1, op2 : op1/op2,
    '>': lambda op1, op2 : op1 > op2,
    '>=': lambda op1, op2 : op1 >= op2,
    '<': lambda op1, op2 : op1 < op2,
    '<=': lambda op1, op2 : op1 <= op2,
    '=': lambda op1, op2 : op1 == op2,
    'print': lambda *args : print(args)
})

class Eva:
    def __init__(self, globalEnv = GlobalEnvironment): 
        self.env = globalEnv
        self.xfrm = Transformer()

    def evalGlobal(self, expressions):
        return self._evalBlock(
            ['block', expressions],
            self.env
        )

    def eval(self, exp, env = None):
        if env != None:
            self.env = env

        #----------------------------
        # Self-evaluating expressions
        if (self._isNumber(exp)):
            return exp

        if self._isString(exp):
            print("We think this is a string")
            return exp[1:-1]

        if (exp[0] == 'printenv'):
            print(f"self.env")
            self.env.print()
            print(f"env")
            env.print()
            return
            
        #----------------------------
        # Blocks  
        if (exp[0] == 'begin'):
            blockEnv = Environment({}, self.env)
            return self._evalBlock(exp, blockEnv)
        
        #---------------------------
        # Variable declaration
        if (exp[0] == 'var'):
            _, name, value = exp
            return self.env.define(name, self.eval(value, env))

        #---------------------------
        # Variable assignment
        if (exp[0] == 'set'):
            _, ref, value = exp
            
            # Assignment to a property
            if (ref[0] == 'prop'):
                _, instance, propName = ref
                instanceEnv = self.eval(instance, env)

                return instanceEnv.define(propName, self.eval(value, env))

            # Simple assignment
            return self.env.assign(ref, self.eval(value, env))

        #---------------------------
        # If expression
        if (exp[0] == 'if'):
            [_tag, condition, consequent, alternative] = exp
            if (self.eval(condition, env)):
                return self.eval(consequent, env)
            else:
                return self.eval(alternative, env)

        #---------------------------
        # While expression
        if (exp[0] == 'while'):
            [_tag, condition, body] = exp
            while (self.eval(condition, env)):
                result = self.eval(body, env)

            return result

        #---------------------------
        # Variable access
        if (self._isVariableName(exp)):
            return self.env.lookup(exp)

        #---------------------------
        # Function declaration: (def square (x) (* x x))
        # Syntactic sugar for: (var square (lambda (x) (* x x)))
        if (exp[0] == 'def'):
            # JIT-transpile to a variable declaration
            newExp = self.xfrm.transformDeftoLambda(exp)
            return self.eval(newExp, self.env)

        #---------------------------
        # Switch expression (switch (cond1, block1) ... )
        # Syntactic sugar for nested if-expressions
        if (exp[0] == 'switch'):
            ifExp = self.xfrm.transformSwitchToIf(exp)
            return self.eval(ifExp, self.env)
            
        #---------------------------
        # For loop (for init condition modifier body)
        # Equivalent to (begin init (while condition (begin body modifier)))
        if (exp[0] == 'for'):
            whileExp = self.xfrm.transformForToWhile(exp)
            return self.eval(whileExp, self.env)
            
        #---------------------------
        # Increment (++ foo)
        # Equivalent to (set foo (+ foo 1))
        if (exp[0] == '++'):
            setExp = self.xfrm.transformIncToSet(exp)
            return self.eval(setExp, self.env)

        #---------------------------
        # Decrement (-- foo)
        # Equivalent to (set foo (- foo 1))
        if (exp[0] == '--'):
            setExp = self.xfrm.transformDecToSet(exp)
            return self.eval(setExp, self.env)

        #---------------------------
        # Increment and set (+= foo)
        # Equivalent to (set foo (+ foo inc))
        if (exp[0] == '+='):
            setExp = self.xfrm.transformIncSetToSet(exp)
            return self.eval(setExp, self.env)

        #---------------------------
        # Decrement and set (-= foo)
        # Equivalent to (set foo (- foo inc))
        if (exp[0] == '-='):
            setExp = self.xfrm.transformDecSetToSet(exp)
            return self.eval(setExp, self.env)

        #---------------------------
        # Lambda function: (lambda (x) (* x x))
        if (exp[0] == 'lambda'):
            [_tag, params, body] = exp

            return [params, body, self.env]

        #---------------------------
        # Class declaration: (class <Name> <Parent> <Body>)
        if (exp[0] == 'class'):
            # Important fact here: a class is just an environment!
            # So, we build that here.
            [_tag, name, parent, body] = exp

            if parent != 'null':
                parentEnv = self.eval(parent, env)
            else:
                parentEnv = env

            classEnv = Environment({}, parentEnv)
            self._evalBody(body, classEnv)

            retVal = env.define(name, classEnv)
            return retVal 

        #---------------------------
        # Super expression: (super <ClassName>)
        if (exp[0] == 'super'):
            env.print()
            [_tag, className] = exp
            return self.eval(className, env).parent

        #---------------------------
        # Class instantiation: (new <Class> <Arguments> ...)
        if (exp[0] == 'new'):
            # An instance of a class is just a particular copy
            # of that class' environment.
            classEnv = self.eval(exp[1], env)
            classEnv.define(exp[1], classEnv)
            instanceEnv = Environment({}, classEnv)
            
            args = [self.eval(arg, env) for arg in exp[2:]]
            self._callUserDefinedFunction(classEnv.lookup('constructor'), [instanceEnv, *args])

            return instanceEnv
        
        #---------------------------
        # Property access: (prop <instance> <name>)
        if (exp[0] == 'prop'):
            [_tag, instance, name] = exp
            instanceEnv = self.eval(instance, env)
            return instanceEnv.lookup(name)

        #---------------------------
        # Module declaration: (module <body>)
        if exp[0] == 'module':
            _tag, name, body = exp

            moduleEnv = Environment({}, env)
            self._evalBody(body, moduleEnv)
            return env.define(name, moduleEnv)

        #---------------------------
        # Module import: (import <name>)
        if exp[0] == 'import':
            _tag, name = exp
            
            with open(f'{moduleDirName}/{name}.eva', 'r') as file:
                moduleSrc = file.read()
                body = parse(f'(begin {moduleSrc})')
                moduleExp = ['module', name, body]

                return self.eval(moduleExp, self.env)
        #---------------------------
        # Function calls:
        if (isinstance(exp, list)):
            fn = self.eval(exp[0], env)
            args = [self.eval(arg, env) for arg in exp[1:]]

            # Native functions
            if (callable(fn)):
                return fn(*args)

            # User-defined function
            return self._callUserDefinedFunction(fn, args)

        raise TypeError(f'This type of expression is not yet implemented: {exp}, type {type(exp)}')

    def _callUserDefinedFunction(self, fn, args):
        activationRecord = {}

        paramList, body, fnEnv = fn
        for i,x in enumerate(paramList):
            activationRecord[x] = args[i]
        
        activationEnv = Environment(activationRecord, fnEnv)

        return self._evalBody(body, activationEnv)

    def _evalBody(self, body, env):
        if (body[0] == 'begin'):
            return self._evalBlock(body, env)
        return self.eval(body, env)

    def _evalBlock(self, block, env):
        # Decompose the block to get a list of its contents
        [_tag, *expressions] = block

        # Evaluate the list of block contents
        # results = [self.eval(exp, env) for exp in expressions]
        results = []
        for exp in expressions:
            res = self.eval(exp, env)
            results.append(res)

        # Return the result of the last expression
        return results[-1]

    def _isNumber(self, exp):
        return (type(exp) == int) or (type(exp) == float)

    def _isString(self, exp):
        return (type(exp) == str) and (exp[0] == '"') and (exp[-1] == '"')

    def _isVariableName(self, exp):
        return (type(exp) == str) and (re.search(r"^[+\-*/<>=a-zA-Z0-9_]+$", exp))