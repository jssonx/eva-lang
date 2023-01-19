from ..eva.eva import *
from . import testUtils

eva = Eva()


def test_switch():
    testUtils.test(eva, 
    """
        (begin
            (var x 10)

            (switch ((= x 10) 100)
                    ((> x 10) 200)
                    (else 300))
        )
    """, 100)
    
def test_plusplus():
    testUtils.test(eva,
    """
        (begin
            (var x 10)
            (++ x)
        )
    """, 11)

def test_minusminus():
    testUtils.test(eva,
    """
        (begin
            (var x 10)
            (-- x)
        )
    """, 9)

def test_plusequals():
    testUtils.test(eva,
    """
        (begin
            (var x 10)
            (var y 5)
            (+= x y)
        )
    """, 15)

def test_minusequals():
    testUtils.test(eva,
    """
        (begin
            (var x 10)
            (var y 5)
            (-= x y)
        )
    """, 5)

def test_for():
    testUtils.test(eva,
    """
        (for (var x 0)
            (< x 10)
            (++ x)
            x)
    """, 10)