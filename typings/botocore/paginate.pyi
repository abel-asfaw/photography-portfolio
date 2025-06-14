"""
This type stub file was generated by pyright.
"""

log = ...
class TokenEncoder:
    """Encodes dictionaries into opaque strings.

    This for the most part json dumps + base64 encoding, but also supports
    having bytes in the dictionary in addition to the types that json can
    handle by default.

    This is intended for use in encoding pagination tokens, which in some
    cases can be complex structures and / or contain bytes.
    """
    def encode(self, token): # -> str:
        """Encodes a dictionary to an opaque string.

        :type token: dict
        :param token: A dictionary containing pagination information,
            particularly the service pagination token(s) but also other boto
            metadata.

        :rtype: str
        :returns: An opaque string
        """
        ...
    


class TokenDecoder:
    """Decodes token strings back into dictionaries.

    This performs the inverse operation to the TokenEncoder, accepting
    opaque strings and decoding them into a useable form.
    """
    def decode(self, token): # -> Any:
        """Decodes an opaque string to a dictionary.

        :type token: str
        :param token: A token string given by the botocore pagination
            interface.

        :rtype: dict
        :returns: A dictionary containing pagination information,
            particularly the service pagination token(s) but also other boto
            metadata.
        """
        ...
    


class PaginatorModel:
    def __init__(self, paginator_config) -> None:
        ...
    
    def get_paginator(self, operation_name):
        ...
    


class PageIterator:
    """An iterable object to paginate API results.
    Please note it is NOT a python iterator.
    Use ``iter`` to wrap this as a generator.
    """
    def __init__(self, method, input_token, output_token, more_results, result_keys, non_aggregate_keys, limit_key, max_items, starting_token, page_size, op_kwargs) -> None:
        ...
    
    @property
    def result_keys(self): # -> Any:
        ...
    
    @property
    def resume_token(self): # -> str | None:
        """Token to specify to resume pagination."""
        ...
    
    @resume_token.setter
    def resume_token(self, value): # -> None:
        ...
    
    @property
    def non_aggregate_part(self): # -> dict[Any, Any]:
        ...
    
    def __iter__(self): # -> Generator[Any, Any, None]:
        ...
    
    def search(self, expression): # -> Generator[Any, Any, None]:
        """Applies a JMESPath expression to a paginator

        Each page of results is searched using the provided JMESPath
        expression. If the result is not a list, it is yielded
        directly. If the result is a list, each element in the result
        is yielded individually (essentially implementing a flatmap in
        which the JMESPath search is the mapping function).

        :type expression: str
        :param expression: JMESPath expression to apply to each page.

        :return: Returns an iterator that yields the individual
            elements of applying a JMESPath expression to each page of
            results.
        """
        ...
    
    def result_key_iters(self): # -> list[ResultKeyIterator]:
        ...
    
    def build_full_result(self): # -> dict[Any, Any]:
        ...
    


class Paginator:
    PAGE_ITERATOR_CLS = PageIterator
    def __init__(self, method, pagination_config, model) -> None:
        ...
    
    @property
    def result_keys(self): # -> list[ParsedResult] | None:
        ...
    
    def paginate(self, **kwargs): # -> PAGE_ITERATOR_CLS:
        """Create paginator object for an operation.

        This returns an iterable object.  Iterating over
        this object will yield a single page of a response
        at a time.

        """
        ...
    


class ResultKeyIterator:
    """Iterates over the results of paginated responses.

    Each iterator is associated with a single result key.
    Iterating over this object will give you each element in
    the result key list.

    :param pages_iterator: An iterator that will give you
        pages of results (a ``PageIterator`` class).
    :param result_key: The JMESPath expression representing
        the result key.

    """
    def __init__(self, pages_iterator, result_key) -> None:
        ...
    
    def __iter__(self): # -> Generator[Any, Any, None]:
        ...
    


