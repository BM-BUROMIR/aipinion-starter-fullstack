import uuid
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException

from app.auth.middleware import require_auth
from app.example.models import ExampleCreate, ExampleResponse, ExampleUpdate

router = APIRouter(prefix="/api/examples", tags=["examples"])

# In-memory store
_store: dict[str, ExampleResponse] = {}


@router.get("", response_model=list[ExampleResponse])
async def list_examples() -> list[ExampleResponse]:
    return list(_store.values())


@router.get("/{example_id}", response_model=ExampleResponse)
async def get_example(example_id: str) -> ExampleResponse:
    item = _store.get(example_id)
    if not item:
        raise HTTPException(status_code=404, detail="Example not found")
    return item


@router.post(
    "", response_model=ExampleResponse, status_code=201, dependencies=[Depends(require_auth)]
)
async def create_example(data: ExampleCreate) -> ExampleResponse:
    item = ExampleResponse(
        id=str(uuid.uuid4()),
        title=data.title,
        description=data.description,
        created_at=datetime.now(UTC).isoformat(),
    )
    _store[item.id] = item
    return item


@router.put("/{example_id}", response_model=ExampleResponse, dependencies=[Depends(require_auth)])
async def update_example(example_id: str, data: ExampleUpdate) -> ExampleResponse:
    item = _store.get(example_id)
    if not item:
        raise HTTPException(status_code=404, detail="Example not found")
    updated = item.model_copy(
        update={k: v for k, v in data.model_dump().items() if v is not None},
    )
    _store[example_id] = updated
    return updated


@router.delete("/{example_id}", status_code=204, dependencies=[Depends(require_auth)])
async def delete_example(example_id: str) -> None:
    if example_id not in _store:
        raise HTTPException(status_code=404, detail="Example not found")
    del _store[example_id]
