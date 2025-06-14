"""
This type stub file was generated by pyright.
"""

"""This module implements token buckets used for client side throttling."""
class Clock:
    def __init__(self) -> None:
        ...
    
    def sleep(self, amount): # -> None:
        ...
    
    def current_time(self): # -> float:
        ...
    


class TokenBucket:
    _MIN_RATE = ...
    def __init__(self, max_rate, clock, min_rate=...) -> None:
        ...
    
    @property
    def max_rate(self): # -> float | None:
        ...
    
    @max_rate.setter
    def max_rate(self, value): # -> None:
        ...
    
    @property
    def max_capacity(self): # -> int | None:
        ...
    
    @property
    def available_capacity(self): # -> int:
        ...
    
    def acquire(self, amount=..., block=...): # -> Literal[True]:
        """Acquire token or return amount of time until next token available.

        If block is True, then this method will block until there's sufficient
        capacity to acquire the desired amount.

        If block is False, then this method will return True is capacity
        was successfully acquired, False otherwise.

        """
        ...
    


