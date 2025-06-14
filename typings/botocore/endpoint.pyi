"""
This type stub file was generated by pyright.
"""

logger = ...
history_recorder = ...
DEFAULT_TIMEOUT = ...
MAX_POOL_CONNECTIONS = ...
def convert_to_response_dict(http_response, operation_model): # -> dict[str, Any]:
    """Convert an HTTP response object to a request dict.

    This converts the requests library's HTTP response object to
    a dictionary.

    :type http_response: botocore.vendored.requests.model.Response
    :param http_response: The HTTP response from an AWS service request.

    :rtype: dict
    :return: A response dictionary which will contain the following keys:
        * headers (dict)
        * status_code (int)
        * body (string or file-like object)

    """
    ...

class Endpoint:
    """
    Represents an endpoint for a particular service in a specific
    region.  Only an endpoint can make requests.

    :ivar service: The Service object that describes this endpoints
        service.
    :ivar host: The fully qualified endpoint hostname.
    :ivar session: The session object.
    """
    def __init__(self, host, endpoint_prefix, event_emitter, response_parser_factory=..., http_session=...) -> None:
        ...
    
    def __repr__(self): # -> str:
        ...
    
    def close(self): # -> None:
        ...
    
    def make_request(self, operation_model, request_dict): # -> tuple[Any, Any] | None:
        ...
    
    def create_request(self, params, operation_model=...): # -> AWSPreparedRequest:
        ...
    
    def prepare_request(self, request):
        ...
    


class EndpointCreator:
    def __init__(self, event_emitter) -> None:
        ...
    
    def create_endpoint(self, service_model, region_name, endpoint_url, verify=..., response_parser_factory=..., timeout=..., max_pool_connections=..., http_session_cls=..., proxies=..., socket_options=..., client_cert=..., proxies_config=...): # -> Endpoint:
        ...
    


