from pydantic import UUID4, BaseModel, ConfigDict, Field


class PhotoResponse(BaseModel):
    """
    A photo as returned by the API.
    """

    model_config = ConfigDict(from_attributes=True)

    id: UUID4
    name: str
    url: str


class PhotoIdsRequest(BaseModel):
    """
    Photos to act on, for reordering or deleting. Capped at S3's batch
    delete limit.
    """

    photo_ids: list[UUID4] = Field(max_length=1000)
