"""
This type stub file was generated by pyright.
"""

from . import ImageFile

class BoxReader:
    """
    A small helper class to read fields stored in JPEG2000 header boxes
    and to easily step into and read sub-boxes.
    """
    def __init__(self, fp, length=...) -> None:
        ...
    
    def read_fields(self, field_format): # -> tuple[Any, ...]:
        ...
    
    def read_boxes(self): # -> BoxReader:
        ...
    
    def has_next_box(self): # -> Literal[True]:
        ...
    
    def next_box_type(self):
        ...
    


class Jpeg2KImageFile(ImageFile.ImageFile):
    format = ...
    format_description = ...
    @property
    def reduce(self): # -> int | Callable[..., Any]:
        ...
    
    @reduce.setter
    def reduce(self, value): # -> None:
        ...
    
    def load(self): # -> None:
        ...
    


