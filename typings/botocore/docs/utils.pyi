"""
This type stub file was generated by pyright.
"""

def py_type_name(type_name): # -> str | None:
    """Get the Python type name for a given model type.

        >>> py_type_name('list')
        'list'
        >>> py_type_name('structure')
        'dict'

    :rtype: string
    """
    ...

def py_default(type_name): # -> str:
    """Get the Python default value for a given model type.

        >>> py_default('string')
        '\'string\''
        >>> py_default('list')
        '[...]'
        >>> py_default('unknown')
        '...'

    :rtype: string
    """
    ...

def get_official_service_name(service_model):
    """Generate the official name of an AWS Service

    :param service_model: The service model representing the service
    """
    ...

_DocumentedShape = ...
class DocumentedShape(_DocumentedShape):
    """Use this class to inject new shapes into a model for documentation"""
    def __new__(cls, name, type_name, documentation, metadata=..., members=..., required_members=...): # -> Self:
        ...
    


class AutoPopulatedParam:
    def __init__(self, name, param_description=...) -> None:
        ...
    
    def document_auto_populated_param(self, event_name, section, **kwargs): # -> None:
        """Documents auto populated parameters

        It will remove any required marks for the parameter, remove the
        parameter from the example, and add a snippet about the parameter
        being autopopulated in the description.
        """
        ...
    


class HideParamFromOperations:
    """Hides a single parameter from multiple operations.

    This method will remove a parameter from documentation and from
    examples. This method is typically used for things that are
    automatically populated because a user would be unable to provide
    a value (e.g., a checksum of a serialized XML request body)."""
    def __init__(self, service_name, parameter_name, operation_names) -> None:
        """
        :type service_name: str
        :param service_name: Name of the service to modify.

        :type parameter_name: str
        :param parameter_name: Name of the parameter to modify.

        :type operation_names: list
        :param operation_names: Operation names to modify.
        """
        ...
    
    def hide_param(self, event_name, section, **kwargs): # -> None:
        ...
    


class AppendParamDocumentation:
    """Appends documentation to a specific parameter"""
    def __init__(self, parameter_name, doc_string) -> None:
        ...
    
    def append_documentation(self, event_name, section, **kwargs): # -> None:
        ...
    


_CONTROLS = ...
_ESCAPE_CONTROLS_RE = ...
_CONTROLS_MATCH_HANDLER = ...
def escape_controls(value): # -> str:
    ...

