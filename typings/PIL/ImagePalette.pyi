"""
This type stub file was generated by pyright.
"""

class ImagePalette:
    """
    Color palette for palette mapped images

    :param mode: The mode to use for the palette. See:
        :ref:`concept-modes`. Defaults to "RGB"
    :param palette: An optional palette. If given, it must be a bytearray,
        an array or a list of ints between 0-255. The list must consist of
        all channels for one color followed by the next color (e.g. RGBRGBRGB).
        Defaults to an empty palette.
    """
    def __init__(self, mode=..., palette=...) -> None:
        ...
    
    @property
    def palette(self): # -> bytearray:
        ...
    
    @palette.setter
    def palette(self, palette): # -> None:
        ...
    
    @property
    def colors(self): # -> dict[Any, Any]:
        ...
    
    @colors.setter
    def colors(self, colors): # -> None:
        ...
    
    def copy(self): # -> ImagePalette:
        ...
    
    def getdata(self): # -> tuple[Never, Any | bytearray] | tuple[str, bytes]:
        """
        Get palette contents in format suitable for the low-level
        ``im.putpalette`` primitive.

        .. warning:: This method is experimental.
        """
        ...
    
    def tobytes(self): # -> bytes:
        """Convert palette to bytes.

        .. warning:: This method is experimental.
        """
        ...
    
    tostring = ...
    def getcolor(self, color, image=...): # -> int:
        """Given an rgb tuple, allocate palette entry.

        .. warning:: This method is experimental.
        """
        ...
    
    def save(self, fp): # -> None:
        """Save palette to text file.

        .. warning:: This method is experimental.
        """
        ...
    


def raw(rawmode, data): # -> ImagePalette:
    ...

def make_linear_lut(black, white): # -> list[Any]:
    ...

def make_gamma_lut(exp): # -> list[Any]:
    ...

def negative(mode=...): # -> ImagePalette:
    ...

def random(mode=...): # -> ImagePalette:
    ...

def sepia(white=...): # -> ImagePalette:
    ...

def wedge(mode=...): # -> ImagePalette:
    ...

def load(filename):
    ...

