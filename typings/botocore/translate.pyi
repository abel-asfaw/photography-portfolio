"""
This type stub file was generated by pyright.
"""

def build_retry_config(endpoint_prefix, retry_model, definitions, client_retry_config=...): # -> dict[str, Any]:
    ...

def resolve_references(config, definitions): # -> None:
    """Recursively replace $ref keys.

    To cut down on duplication, common definitions can be declared
    (and passed in via the ``definitions`` attribute) and then
    references as {"$ref": "name"}, when this happens the reference
    dict is placed with the value from the ``definition`` dict.

    This is recursively done.

    """
    ...

