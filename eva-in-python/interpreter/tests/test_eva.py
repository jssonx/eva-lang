from ..eva.eva import *
from . import testUtils

eva = Eva()

def test_var():
    testUtils.test(eva, "(var 'hi' 1)", 1)

def test_varAccess():
    testUtils.test(eva,
    """
        (begin (var x 10)
        x)
    """, 10)

def test_block():
    testUtils.test(eva,
    """
        (begin
            (var x 10)
            (var y 20)
            (+ (* x y) 30)
        )
    """, 230)

def test_varAssignment():
    testUtils.test(eva,
    """
        (begin
            (var data 10)
            (begin
                (set data 100)
            )
            data
        )
    """, 100)

def test_if():
    testUtils.test(eva,
    """
        (begin
            (var x 10)
            (var y 0)
            (if (> x 10)
            (set y 20)
            (set y 30))
            y
        )
    """, 30)

def test_while():
    testUtils.test(eva,
    """
        (begin
            (var counter 0)
            (var result 0)
            (while (< counter 10)
            (begin
                (set result (+ result 1))
                (set counter (+ counter 1))))
            result)
    """, 10)