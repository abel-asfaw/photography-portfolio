from pydantic import BaseModel, ConfigDict, UUID4


class PhotoResponse(BaseModel):
    """
    A photo as returned by the API.
    """

    model_config = ConfigDict(from_attributes=True)

    id: UUID4
    name: str
    url: str


class ReorderRequest(BaseModel):
    photo_ids: list[UUID4]
