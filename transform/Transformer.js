/**
 * AST Transformer.
 */
class Transformer {
    /**
     * Translates `def`-expression (function declaration)
     * into a variable declaration with a lambda
     * expression.
     */
    transformDefToVarLambda(defExp) {
        const [_tag, name, params, body] = defExp;
        let lambdaExp = ['var', name, ['lambda', params, body]];
        return lambdaExp;
    }

    transformSwitchToIf(switchExp) {
        const [_tag, ...cases] = switchExp;
        const ifExp = ['if', null, null, null];
        let current = ifExp;
        for (let i = 0; i < cases.length - 1; i++) {
            const [currentCond, currentBlock] = cases[i];
            current[1] = currentCond;
            current[2] = currentBlock;
            const next = cases[i + 1];
            const [nextCond, nextBlock] = next;
            current[3] = nextCond === 'else' ? nextBlock : ['if'];
            current = current[3];
        }
        return ifExp;
    }

    transformForToWhile(forExp) {
        const [_tag, init, condition, modifier, exp] = forExp;
        return ['begin', init, ['while', condition, ['begin', exp, modifier]]];
    }

    transformIncToSet(incExp) {
        const [_tag, variable] = incExp;
        return ['set', variable, ['+', variable, 1]];
    }

    transformDeccToSet(decExp) {
        const [_tag, variable] = decExp;
        return ['set', variable, ['-', variable, 1]];
    }

    transformIncValToSet(incValExp) {
        const [_tag, variable, value] = incValExp;
        return ['set', variable, ['+', variable, value]];
    }

    transformDecValToSet(decValExp) {
        const [_tag, variable, value] = decValExp;
        return ['set', variable, ['-', variable, value]];
    }

}

module.exports = Transformer;


