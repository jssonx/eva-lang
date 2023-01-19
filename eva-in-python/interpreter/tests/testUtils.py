from ..parser import evaParser
def test(eva, code, expected):
    exp = evaParser.parse(f'(begin {code})')
    res = eva.evalGlobal(exp)
    if res != expected:
        print(f"This test failed. Expression: {exp}, result: {res}")
    assert eva.eval(exp) == expected
