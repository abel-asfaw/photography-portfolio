"""
This type stub file was generated by pyright.
"""

from . import ImageFile

"""
.. note::
    This format cannot be automatically recognized, so the
    class is not registered for use with :py:func:`PIL.Image.open()`.  To open a
    gd file, use the :py:func:`PIL.GdImageFile.open()` function instead.

.. warning::
    THE GD FORMAT IS NOT DESIGNED FOR DATA INTERCHANGE.  This
    implementation is provided for convenience and demonstrational
    purposes only.
"""
class GdImageFile(ImageFile.ImageFile):
    """
    Image plugin for the GD uncompressed format.  Note that this format
    is not supported by the standard :py:func:`PIL.Image.open()` function.  To use
    this plugin, you have to import the :py:mod:`PIL.GdImageFile` module and
    use the :py:func:`PIL.GdImageFile.open()` function.
    """
    format = ...
    format_description = ...


def open(fp, mode=...): # -> GdImageFile:
    """
    Load texture from a GD image file.

    :param fp: GD file name, or an opened file handle.
    :param mode: Optional mode.  In this version, if the mode argument
        is given, it must be "r".
    :returns: An image instance.
    :raises OSError: If the image could not be read.
    """
    ...

