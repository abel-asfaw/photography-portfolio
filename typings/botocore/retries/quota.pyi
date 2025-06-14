"""
This type stub file was generated by pyright.
"""

"""Retry quota implementation.


"""
class RetryQuota:
    INITIAL_CAPACITY = ...
    def __init__(self, initial_capacity=..., lock=...) -> None:
        ...
    
    def acquire(self, capacity_amount): # -> bool:
        """Attempt to aquire a certain amount of capacity.

        If there's not sufficient amount of capacity available, ``False``
        is returned.  Otherwise, ``True`` is returned, which indicates that
        capacity was successfully allocated.

        """
        ...
    
    def release(self, capacity_amount): # -> None:
        """Release capacity back to the retry quota.

        The capacity being released will be truncated if necessary
        to ensure the max capacity is never exceeded.

        """
        ...
    
    @property
    def available_capacity(self): # -> int:
        ...
    


