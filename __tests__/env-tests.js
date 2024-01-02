const assert = require('assert'); 
const testUtil = require('./test-util');

module.exports = eva => {

    assert.strictEqual(eva.eval(
        ['begin',
            ['var', 'x', 10],
            ['begin',
                ['var', 'y', 20],
                    ['begin',
                        ['var', 'z', 30],
                        'z',
                    ],
                'y',
            ],
            'x',
        ]), 
    10);

}