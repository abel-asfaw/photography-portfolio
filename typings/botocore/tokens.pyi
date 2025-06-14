"""
This type stub file was generated by pyright.
"""

from datetime import datetime
from typing import NamedTuple, Optional
from botocore.utils import JSONFileCache

logger = ...
def create_token_resolver(session): # -> TokenProviderChain:
    ...

class FrozenAuthToken(NamedTuple):
    token: str
    expiration: Optional[datetime] = ...


class DeferredRefreshableToken:
    _advisory_refresh_timeout = ...
    _mandatory_refresh_timeout = ...
    _attempt_timeout = ...
    def __init__(self, method, refresh_using, time_fetcher=...) -> None:
        ...
    
    def get_frozen_token(self): # -> None:
        ...
    


class TokenProviderChain:
    def __init__(self, providers=...) -> None:
        ...
    
    def load_token(self): # -> None:
        ...
    


class SSOTokenProvider:
    METHOD = ...
    _REFRESH_WINDOW = ...
    _SSO_TOKEN_CACHE_DIR = ...
    _SSO_CONFIG_VARS = ...
    _GRANT_TYPE = ...
    DEFAULT_CACHE_CLS = JSONFileCache
    def __init__(self, session, cache=..., time_fetcher=..., profile_name=...) -> None:
        ...
    
    def load_token(self): # -> DeferredRefreshableToken | None:
        ...
    


