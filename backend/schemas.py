from pydantic import BaseModel


class ItemBase(BaseModel):
    name: str
    description: str | None = None


class ItemCreate(ItemBase):
    pass


class ItemUpdate(ItemBase):
    pass


class ItemResponse(ItemBase):
    id: int

    # Tells Pydantic to read data from ORM attributes, not just dicts
    model_config = {"from_attributes": True}
