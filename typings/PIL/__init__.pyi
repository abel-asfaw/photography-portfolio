"""
This type stub file was generated by pyright.
"""

from . import _version

"""Pillow (Fork of the Python Imaging Library)

Pillow is the friendly PIL fork by Jeffrey A. Clark (Alex) and contributors.
    https://github.com/python-pillow/Pillow/

Pillow is forked from PIL 1.1.7.

PIL is the Python Imaging Library by Fredrik Lundh and contributors.
Copyright (c) 1999 by Secret Labs AB.

Use PIL.__version__ for this Pillow version.

;-)
"""
__version__ = ...
_plugins = ...
class UnidentifiedImageError(OSError):
    """
    Raised in :py:meth:`PIL.Image.open` if an image cannot be opened and identified.

    If a PNG image raises this error, setting :data:`.ImageFile.LOAD_TRUNCATED_IMAGES`
    to true may allow the image to be opened after all. The setting will ignore missing
    data and checksum failures.
    """
    ...


