from pydantic import BaseModel


class Photo(BaseModel):
    id: str
    name: str
    url: str

    class Config:
        from_attributes = True
