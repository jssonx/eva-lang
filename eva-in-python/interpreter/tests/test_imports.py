from ..eva.eva import *
from . import testUtils

eva = Eva()

def test_import():
    testUtils.test(eva,
    """
        (import Math)
        ((prop Math abs) (- 10))
    """,10)