import os
import tempfile
from pathlib import Path

_test_dir = Path(tempfile.mkdtemp(prefix="smart-parking-test-"))
os.environ["DATABASE_URL"] = f"sqlite:///{(_test_dir / 'test.db').as_posix()}"

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app.core.db import engine  # noqa: E402
from app.main import app  # noqa: E402
from app.models.base import Base  # noqa: E402


@pytest.fixture(autouse=True)
def clean_tables():
    yield
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


@pytest.fixture()
def client():
    with TestClient(app) as test_client:
        yield test_client
