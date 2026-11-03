from pydantic import UUID4, BaseModel, ConfigDict


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
