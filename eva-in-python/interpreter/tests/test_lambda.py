from ..eva.eva import *
from . import testUtils

eva = Eva()

def test_lambda():
    testUtils.test(eva, 
    """
        (begin
            (def onClick (callback)
                (begin
                    (var x 10)
                    (var y 20)
                    (callback (+ x y))
                )
            )

            (onClick (lambda (data) (* data 10)))
        )
    """, 300)
    
def test_iile(): # Immediately-invoked Lambda Expression
    testUtils.test(eva,
    """
        ((lambda (x) (* x x)) 2)
    """, 4)
    
def test_save_lambda():
    testUtils.test(eva,
    """
        (begin
            (var square (lambda (x) (* x x)))
            (square 2)
        )
    """, 4)