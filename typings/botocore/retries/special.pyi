"""
This type stub file was generated by pyright.
"""

from botocore.retries.base import BaseRetryableChecker

"""Special cased retries.

These are additional retry cases we still have to handle from the legacy
retry handler.  They don't make sense as part of the standard mode retry
module.  Ideally we should be able to remove this module.

"""
logger = ...
class RetryIDPCommunicationError(BaseRetryableChecker):
    _SERVICE_NAME = ...
    def is_retryable(self, context): # -> Literal[False]:
        ...
    


class RetryDDBChecksumError(BaseRetryableChecker):
    _CHECKSUM_HEADER = ...
    _SERVICE_NAME = ...
    def is_retryable(self, context): # -> bool | None:
        ...
    


