from pydantic import BaseModel, ConfigDict


class Photo(BaseModel):
    """
    Photo schema
    """
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    url: str
