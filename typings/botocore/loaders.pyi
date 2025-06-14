"""
This type stub file was generated by pyright.
"""

from botocore.compat import HAS_GZIP

"""Module for loading various model files.

This module provides the classes that are used to load models used
by botocore.  This can include:

    * Service models (e.g. the model for EC2, S3, DynamoDB, etc.)
    * Service model extras which customize the service models
    * Other models associated with a service (pagination, waiters)
    * Non service-specific config (Endpoint data, retry config)

Loading a module is broken down into several steps:

    * Determining the path to load
    * Search the data_path for files to load
    * The mechanics of loading the file
    * Searching for extras and applying them to the loaded file

The last item is used so that other faster loading mechanism
besides the default JSON loader can be used.

The Search Path
===============

Similar to how the PATH environment variable is to finding executables
and the PYTHONPATH environment variable is to finding python modules
to import, the botocore loaders have the concept of a data path exposed
through AWS_DATA_PATH.

This enables end users to provide additional search paths where we
will attempt to load models outside of the models we ship with
botocore.  When you create a ``Loader``, there are two paths
automatically added to the model search path:

    * <botocore root>/data/
    * ~/.aws/models

The first value is the path where all the model files shipped with
botocore are located.

The second path is so that users can just drop new model files in
``~/.aws/models`` without having to mess around with the AWS_DATA_PATH.

The AWS_DATA_PATH using the platform specific path separator to
separate entries (typically ``:`` on linux and ``;`` on windows).


Directory Layout
================

The Loader expects a particular directory layout.  In order for any
directory specified in AWS_DATA_PATH to be considered, it must have
this structure for service models::

    <root>
      |
      |-- servicename1
      |   |-- 2012-10-25
      |       |-- service-2.json
      |-- ec2
      |   |-- 2014-01-01
      |   |   |-- paginators-1.json
      |   |   |-- service-2.json
      |   |   |-- waiters-2.json
      |   |-- 2015-03-01
      |       |-- paginators-1.json
      |       |-- service-2.json
      |       |-- waiters-2.json
      |       |-- service-2.sdk-extras.json


That is:

    * The root directory contains sub directories that are the name
      of the services.
    * Within each service directory, there's a sub directory for each
      available API version.
    * Within each API version, there are model specific files, including
      (but not limited to): service-2.json, waiters-2.json, paginators-1.json

The ``-1`` and ``-2`` suffix at the end of the model files denote which version
schema is used within the model.  Even though this information is available in
the ``version`` key within the model, this version is also part of the filename
so that code does not need to load the JSON model in order to determine which
version to use.

The ``sdk-extras`` and similar files represent extra data that needs to be
applied to the model after it is loaded. Data in these files might represent
information that doesn't quite fit in the original models, but is still needed
for the sdk. For instance, additional operation parameters might be added here
which don't represent the actual service api.
"""
_JSON_OPEN_METHODS = ...
if HAS_GZIP:
    ...
logger = ...
def instance_cache(func): # -> Callable[..., Any]:
    """Cache the result of a method on a per instance basis.

    This is not a general purpose caching decorator.  In order
    for this to be used, it must be used on methods on an
    instance, and that instance *must* provide a
    ``self._cache`` dictionary.

    """
    ...

class JSONFileLoader:
    """Loader JSON files.

    This class can load the default format of models, which is a JSON file.

    """
    def exists(self, file_path): # -> bool:
        """Checks if the file exists.

        :type file_path: str
        :param file_path: The full path to the file to load without
            the '.json' extension.

        :return: True if file path exists, False otherwise.

        """
        ...
    
    def load_file(self, file_path): # -> Any | None:
        """Attempt to load the file path.

        :type file_path: str
        :param file_path: The full path to the file to load without
            the '.json' extension.

        :return: The loaded data if it exists, otherwise None.

        """
        ...
    


def create_loader(search_path_string=...): # -> Loader:
    """Create a Loader class.

    This factory function creates a loader given a search string path.

    :type search_string_path: str
    :param search_string_path: The AWS_DATA_PATH value.  A string
        of data path values separated by the ``os.path.pathsep`` value,
        which is typically ``:`` on POSIX platforms and ``;`` on
        windows.

    :return: A ``Loader`` instance.

    """
    ...

class Loader:
    """Find and load data models.

    This class will handle searching for and loading data models.

    The main method used here is ``load_service_model``, which is a
    convenience method over ``load_data`` and ``determine_latest_version``.

    """
    FILE_LOADER_CLASS = JSONFileLoader
    BUILTIN_DATA_PATH = ...
    CUSTOMER_DATA_PATH = ...
    BUILTIN_EXTRAS_TYPES = ...
    def __init__(self, extra_search_paths=..., file_loader=..., cache=..., include_default_search_paths=..., include_default_extras=...) -> None:
        ...
    
    @property
    def search_paths(self): # -> list[Any]:
        ...
    
    @property
    def extras_types(self): # -> list[Any]:
        ...
    
    @instance_cache
    def list_available_services(self, type_name): # -> list[Any]:
        """List all known services.

        This will traverse the search path and look for all known
        services.

        :type type_name: str
        :param type_name: The type of the service (service-2,
            paginators-1, waiters-2, etc).  This is needed because
            the list of available services depends on the service
            type.  For example, the latest API version available for
            a resource-1.json file may not be the latest API version
            available for a services-2.json file.

        :return: A list of all services.  The list of services will
            be sorted.

        """
        ...
    
    @instance_cache
    def determine_latest_version(self, service_name, type_name):
        """Find the latest API version available for a service.

        :type service_name: str
        :param service_name: The name of the service.

        :type type_name: str
        :param type_name: The type of the service (service-2,
            paginators-1, waiters-2, etc).  This is needed because
            the latest API version available can depend on the service
            type.  For example, the latest API version available for
            a resource-1.json file may not be the latest API version
            available for a services-2.json file.

        :rtype: str
        :return: The latest API version.  If the service does not exist
            or does not have any available API data, then a
            ``DataNotFoundError`` exception will be raised.

        """
        ...
    
    @instance_cache
    def list_api_versions(self, service_name, type_name): # -> list[Any]:
        """List all API versions available for a particular service type

        :type service_name: str
        :param service_name: The name of the service

        :type type_name: str
        :param type_name: The type name for the service (i.e service-2,
            paginators-1, etc.)

        :rtype: list
        :return: A list of API version strings in sorted order.

        """
        ...
    
    @instance_cache
    def load_service_model(self, service_name, type_name, api_version=...): # -> Any:
        """Load a botocore service model

        This is the main method for loading botocore models (e.g. a service
        model, pagination configs, waiter configs, etc.).

        :type service_name: str
        :param service_name: The name of the service (e.g ``ec2``, ``s3``).

        :type type_name: str
        :param type_name: The model type.  Valid types include, but are not
            limited to: ``service-2``, ``paginators-1``, ``waiters-2``.

        :type api_version: str
        :param api_version: The API version to load.  If this is not
            provided, then the latest API version will be used.

        :type load_extras: bool
        :param load_extras: Whether or not to load the tool extras which
            contain additional data to be added to the model.

        :raises: UnknownServiceError if there is no known service with
            the provided service_name.

        :raises: DataNotFoundError if no data could be found for the
            service_name/type_name/api_version.

        :return: The loaded data, as a python type (e.g. dict, list, etc).
        """
        ...
    
    @instance_cache
    def load_data_with_path(self, name): # -> tuple[Any, Any]:
        """Same as ``load_data`` but returns file path as second return value.

        :type name: str
        :param name: The data path, i.e ``ec2/2015-03-01/service-2``.

        :return: Tuple of the loaded data and the path to the data file
            where the data was loaded from. If no data could be found then a
            DataNotFoundError is raised.
        """
        ...
    
    def load_data(self, name): # -> Any:
        """Load data given a data path.

        This is a low level method that will search through the various
        search paths until it's able to load a value.  This is typically
        only needed to load *non* model files (such as _endpoints and
        _retry).  If you need to load model files, you should prefer
        ``load_service_model``.  Use ``load_data_with_path`` to get the
        data path of the data file as second return value.

        :type name: str
        :param name: The data path, i.e ``ec2/2015-03-01/service-2``.

        :return: The loaded data. If no data could be found then
            a DataNotFoundError is raised.
        """
        ...
    
    def is_builtin_path(self, path):
        """Whether a given path is within the package's data directory.

        This method can be used together with load_data_with_path(name)
        to determine if data has been loaded from a file bundled with the
        package, as opposed to a file in a separate location.

        :type path: str
        :param path: The file path to check.

        :return: Whether the given path is within the package's data directory.
        """
        ...
    


class ExtrasProcessor:
    """Processes data from extras files into service models."""
    def process(self, original_model, extra_models): # -> None:
        """Processes data from a list of loaded extras files into a model

        :type original_model: dict
        :param original_model: The service model to load all the extras into.

        :type extra_models: iterable of dict
        :param extra_models: A list of loaded extras models.
        """
        ...
    


