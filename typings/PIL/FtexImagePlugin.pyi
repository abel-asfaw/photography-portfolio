"""
This type stub file was generated by pyright.
"""

from enum import IntEnum
from . import ImageFile

"""
A Pillow loader for .ftc and .ftu files (FTEX)
Jerome Leclanche <jerome@leclan.ch>

The contents of this file are hereby released in the public domain (CC0)
Full text of the CC0 license:
  https://creativecommons.org/publicdomain/zero/1.0/

Independence War 2: Edge Of Chaos - Texture File Format - 16 October 2001

The textures used for 3D objects in Independence War 2: Edge Of Chaos are in a
packed custom format called FTEX. This file format uses file extensions FTC
and FTU.
* FTC files are compressed textures (using standard texture compression).
* FTU files are not compressed.
Texture File Format
The FTC and FTU texture files both use the same format. This
has the following structure:
{header}
{format_directory}
{data}
Where:
{header} = {
    u32:magic,
    u32:version,
    u32:width,
    u32:height,
    u32:mipmap_count,
    u32:format_count
}

* The "magic" number is "FTEX".
* "width" and "height" are the dimensions of the texture.
* "mipmap_count" is the number of mipmaps in the texture.
* "format_count" is the number of texture formats (different versions of the
same texture) in this file.

{format_directory} = format_count * { u32:format, u32:where }

The format value is 0 for DXT1 compressed textures and 1 for 24-bit RGB
uncompressed textures.
The texture data for a format starts at the position "where" in the file.

Each set of texture data in the file has the following structure:
{data} = format_count * { u32:mipmap_size, mipmap_size * { u8 } }
* "mipmap_size" is the number of bytes in that mip level. For compressed
textures this is the size of the texture data compressed with DXT1. For 24 bit
uncompressed textures, this is 3 * width * height. Following this are the image
bytes for that mipmap level.

Note: All data is stored in little-Endian (Intel) byte order.
"""
MAGIC = ...
class Format(IntEnum):
    DXT1 = ...
    UNCOMPRESSED = ...


class FtexImageFile(ImageFile.ImageFile):
    format = ...
    format_description = ...
    def load_seek(self, pos): # -> None:
        ...
    


