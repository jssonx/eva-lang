// Test driven development

const Eva = require('../Eva');
const Environment = require('../Environment');

const tests = [
    require('./self-eval-tests'),
    require('./math-tests'),
    require('./variable-tests'),
    require('./block-tests'),
    require('./if-tests'),
    require('./while-tests'),
    require('./built-in-function-tests'),
    require('./user-defined-function-tests'),
    require('./lambda-function-tests'),
    require('./switch-tests'),
    require('./for-tests'),
    require('./inc-tests'),
    require('./dec-tests'),
    require('./inc-val-tests'),
    require('./dec-val-tests'),
    require('./class-tests'),
];


const eva = new Eva();

// const eva = new Eva(new Environment({
//     null: null,

//     true: true,
//     false: false,

//     VERSION: '0.1',
// }));

tests.forEach(test => test(eva));

// eva.eval(['print', '"Hello"', '"World!"']);

console.log('All assertions passed');