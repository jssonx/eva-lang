from ..eva.eva import *
from . import testUtils

eva = Eva()

# Self-evaluating expressions
def test_number():
    testUtils.test(eva,"2", 2)

def test_string():
    testUtils.test(eva, '"HALLO"', 'HALLO')

# Math operators
def test_add():
    testUtils.test(eva,
    """
        (+ 1 (+ 1 2))
    """, 4)

def test_sub():
    testUtils.test(eva,
    """
        (- (+ 1 2) 1)
    """, 2)

def test_mult():
    testUtils.test(eva, "(* 2 3)", 6)

def test_div():
    testUtils.test(eva, "(/ 6 2)", 3)

# Logical operators
def test_logical():
    testUtils.test(eva, "(< 1 5)", True)
    testUtils.test(eva, "(<= 1 5)", True)
    testUtils.test(eva, "(> 1 5)", False)
    testUtils.test(eva, "(>= 1 5)", False)
    testUtils.test(eva, "(= 1 5)", False)

def test_printing():
    testUtils.test(eva, '(print "HAI")', None)