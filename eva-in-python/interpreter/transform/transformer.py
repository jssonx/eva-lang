
class Transformer:
    def __init__(self):
        self.isValid = True

    def transformDeftoLambda(self, exp):
        [_tag, name, params, body] = exp
        return ['var', name, ['lambda', params, body]]
    
    def transformSwitchToIf(self, exp):
        [_tag, *cases] = exp

        ifExp = ['if', None, None, None]

        current = ifExp

        for i in range(len(cases)):
            [currentCond, currentBlock] = cases[i]

            current[1] = currentCond
            current[2] = currentBlock
            
            next = cases[i+1]
            [nextCond, nextBlock] = next
            if nextCond == 'else':
                current[3] = nextBlock
                break
            else:
                current[3] = ifExp.copy()

            current = current[3]

        return ifExp

    def transformForToWhile(self, exp):
        # For loop (for init condition modifier body)
        # Equivalent to (begin init (while condition (begin body modifier)))
        [_tag, init, cond, mod, body] = exp

        return ['begin', init, ['while', cond, ['begin', body, mod]]]

    def transformIncToSet(self, exp):
        [_tag, name] = exp
        setExp = ['set', name, ['+', name, 1]]
        return setExp

    def transformDecToSet(self, exp):
        [_tag, name] = exp
        setExp = ['set', name, ['-', name, 1]]
        return setExp
    
    def transformIncSetToSet(self, exp):
        [_tag, name, inc] = exp
        setExp = ['set', name, ['+', name, inc]]
        return setExp

    def transformDecSetToSet(self, exp):
        [_tag, name, inc] = exp
        setExp = ['set', name, ['-', name, inc]]
        return setExp