from pydantic import BaseModel, ConfigDict, UUID4


class Photo(BaseModel):
    """
    Photo schema
    """

    model_config = ConfigDict(from_attributes=True)

    id: UUID4
    name: str
    url: str
