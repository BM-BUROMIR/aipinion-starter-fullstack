from pydantic import BaseModel


class ExampleCreate(BaseModel):
    title: str
    description: str = ""


class ExampleUpdate(BaseModel):
    title: str | None = None
    description: str | None = None


class ExampleResponse(BaseModel):
    id: str
    title: str
    description: str
    created_at: str
