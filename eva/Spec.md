# Spec

## Self-evaluating: numbers

Expressions
```
^[-+]?\d+(\.\d+)?$
```

Example:
```
100
-5.7
```

Implementation:
```
return Number(exp)
```

## Self-evaluating: strings
Expressions
```
"<char>"
```

Example:
```
"hello"
"world"
```

Implementation:
```
return exp.slice(1, -1)
```

## Binary operations

Example:
```
// Math:
(+ 5 10)
(* x 15)

(- (/ foo 5) 42)

// Comparison:
(< 5 10)
(>= x 15)

(!= foo 42)

// Logical
(or foo default)
(and x y)
(not isValid)

```

## Varaible declaration
Expressions
```
(var <name> <value>)
```

Example:
```
(var foo 42)
(var bar (* foo 10))
```

Implementation:
```
env.define(
    exp[1],
    eval(exp[2], env)
);
```
## Assignment expressions
Expressions
```
(set <name> <value>)
```

Example:
```
(set foo 42)
(set bar (* foo 18))
```

Implementation:
```
env.assign(
    exp[1],
    eval(exp[2], env)
);
```

## Variable access
Expressions
```
<name>
```

Example:
```
foo
(square 2)
```

Implementation:
```
env.lookup(exp);
```

## Block expression
Expressions
```
(begin <sequence>)
```

Example:
```
(begin
    (var foo 42)
    (set bar 
        (* fpp 10)
    )
    (+ foo bar)
)
```

Implementation:
```
const blockEnv = new Environment({}, env);
exp
    .slice(1)
    .forEach(exp => eval(exp, blockEnv));
```

## Branches: if
Expressions
```
(if <condition>
    <consequent>
    <alternate>
)
```

Example:
```
(if (> x 0)
    (set y 10)
    (begin
        (set y 20)
        (print "exit")
    )
)
```

Implementation:
```
if (eval(exp[1], env)) {
    return eval(exp[2], env);
}
return eval(exp[3], env);
```

## Branches: which
Expressions
```
(switch (<cond1> <block1>)
        ...
        (<condN> <blockN>)
        (else <alternate>)
)
```

Example:
```
(switch ((> x 1) 100)
        ((= x 1) 200)
        (else 0)
)
```

Implementation: (syntactic sugar)
```
(if <cond1>
    <block1>
    ...
    (if <condN>
        <blockN>
        <alternate>
    )
)
```

## Loops: while
Expressions
```
(while <condition>
    <block>
)
```

Example:
```
(while (> x 10)
    (begin
        (-- x)
        (print x)
    )
)
```

Implementation:
```
while (eval(exp[1], env)) {
    result = eval(exp[2], env);
}
return result;
```

## Loops: for
Expressions
```
(for <init>
    <condition>
    <modifier>
    <exp>
)
```

Example:
```
(for (var x 10)
    (> x 0)
    (-- x)
    (print x)
)
```

Implementation: (Transformation, syntactic sugar)
```
(begin
    <init>
    (while <condition>
        (begin
            <exp>
            <modifier>
        )
    )
)
```

## Lambda functions
Expressions
```
(lambda <args>
    <body>
)
```

Example:
```
(lambda (x)
    (* x x)
)
```

Implementation:
```
return {
    params: exp[1],
    body: exp[2],
    env: env,
}
```

## Function declaration
Expressions
```
(def <name> <args>
    <body>
)
```

Example:
```
(def square (x)
    (* x x)
)
```

Implementation: (Transformation, syntactic sugar)
```
(var <name>
    (lambda <args>
        <body>
    )
)
```

## Function calls
Expressions
```
(<fn> <args>)
```

Example:
```
(square 2)
(
    (lambda (x) 
        (* x x)
    )
    2
)
```

Implementation:
```
fn = eval(exp[0], env)
args = exp.slice(1).forEach(exp => eval(exp, env))

// 1. Native function calls:
if (typeof fn === "function") {
    return fn(...args);
}

// 2. User-defined function calls:
const activationEnv = new Environment(
    activationRecord,
    fn.env
);

return eval(fn.body, activationEnv);
```

## Classes
Expression: class
```
(class <name> <parent>
    <body>
)
```

Expression: new
```
(new <class> <args>
)
```

Example:
```
(class Point null
    (begin
        (def constructor (self x y)
            ((prop self setX) x)
            ((prop self setY) y)
        )

        (def getX (self)
            (prop self x)
        )

        (def setX (self x)
            (set (prop self x) x)
        )
    )
)
(var p (new Point 10 20))
((prop p getX))
```

## Modules
Expression: module
```
(module <name>
    <body>
)
```

Expression: import
```
(import <name>
)
```

Example:
```
(module Math
    (begin
        (def square (x)
            (* x x)
        )
        (var MAX_VALUE 100)
    )
)
(import Math)
((prop Math square) 2)
```