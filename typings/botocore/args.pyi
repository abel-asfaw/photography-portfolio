"""
This type stub file was generated by pyright.
"""

"""Internal module to help with normalizing botocore client args.

This module (and all function/classes within this module) should be
considered internal, and *not* a public API.

"""
logger = ...
VALID_REGIONAL_ENDPOINTS_CONFIG = ...
LEGACY_GLOBAL_STS_REGIONS = ...
USERAGENT_APPID_MAXLEN = ...
class ClientArgsCreator:
    def __init__(self, event_emitter, user_agent, response_parser_factory, loader, exceptions_factory, config_store, user_agent_creator=...) -> None:
        ...
    
    def get_client_args(self, service_model, region_name, is_secure, endpoint_url, verify, credentials, scoped_config, client_config, endpoint_bridge, auth_token=..., endpoints_ruleset_data=..., partition_data=...): # -> dict[str, Any]:
        ...
    
    def compute_client_args(self, service_model, client_config, endpoint_bridge, region_name, endpoint_url, is_secure, scoped_config): # -> dict[str, Any]:
        ...
    
    def compute_s3_config(self, client_config):
        ...
    
    def compute_endpoint_resolver_builtin_defaults(self, region_name, service_name, s3_config, endpoint_bridge, client_endpoint_url, legacy_endpoint_url): # -> dict[EndpointResolverBuiltins, Any]:
        ...
    


