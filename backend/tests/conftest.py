import os

# Ensure auth is disabled for tests
os.environ["DISABLE_AUTH"] = "true"

import pytest
from fastapi.testclient import TestClient

from app.example.router import _store
from app.main import app


@pytest.fixture
def client():
    """Create test client with clean store."""
    _store.clear()
    with TestClient(app) as c:
        yield c


@pytest.fixture(autouse=True)
def _clean_store():
    """Ensure store is clean between tests."""
    _store.clear()
    yield
    _store.clear()
