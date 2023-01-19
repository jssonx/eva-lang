from ..eva.eva import *
from . import testUtils

eva = Eva()

def test_modules():
    testUtils.test(eva,
    """
        (module Math
            (begin
                (def abs (value)
                    (if (< value 0)
                        (- value)
                        value)
                )

                (def square (x)
                    (* x x))

                (var MAX_VALUE 1000)
                (var PI 3.1415926)
            )
        )

        (var abs (prop Math abs))
        (abs (- 10))
    """, 10)
    
    testUtils.test(eva,
    """
        (prop Math MAX_VALUE)
    """, 1000)