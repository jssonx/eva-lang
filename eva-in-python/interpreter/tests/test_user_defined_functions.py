from ..eva.eva import *
from . import testUtils

eva = Eva()

def test_udfs():
    testUtils.test(eva, 
    """
        (begin
            (def square (a)
                (* a a))
            (square 2)
        )
    """,4)

    testUtils.test(eva,
    """
        (begin
            (def calc (x y)
                (begin
                    (var z 30)
                    (+ (* x y) z)
                ))
            (calc 10 20)
        )
    """, 230)

    testUtils.test(eva,
    """
        (begin

            (var value 100)
            (def calc (x y)
                (begin
                    (var z (+ x y))

                    (def inner (foo)
                        (+ (+ foo z) value))

                    inner
                ))
            (var fn (calc 10 20))

            (fn 30)
        )
    """, 160)

def test_recursive():
   testUtils.test(eva,
   """
        (begin
            (def factorial (x)
                (if (= x 1)
                    1
                    (* x (factorial (- x 1)))))
            (factorial 5)
        )
   """, 120) 