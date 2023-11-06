from pydantic import BaseModel


class Photo(BaseModel):
    """Pydantic model representing a photo"""

    id: str
    name: str
    url: str

    class Config:
        from_attributes = True
