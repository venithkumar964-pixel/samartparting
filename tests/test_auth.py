import pytest
from fastapi.testclient import TestClient

VALID_USER = {
    "fullName": "Jane Doe",
    "email": "jane@example.com",
    "phone": "+1 555 123 4567",
    "password": "supersecret",
    "vehicleNumber": "ABC-1234",
    "vehicleType": "car",
}


def register(client: TestClient, **overrides):
    payload = {**VALID_USER, **overrides}
    return client.post("/api/register", json=payload)


def test_register_success(client: TestClient):
    response = register(client)
    assert response.status_code == 201
    assert response.json() == {"message": "Account created successfully!"}


def test_register_duplicate_email(client: TestClient):
    assert register(client).status_code == 201
    response = register(client)
    assert response.status_code == 409
    assert response.json() == {"error": "An account with this email already exists."}


def test_register_invalid_email(client: TestClient):
    response = register(client, email="not-an-email")
    assert response.status_code == 422
    assert "error" in response.json()


def test_register_short_password(client: TestClient):
    response = register(client, password="short")
    assert response.status_code == 422
    assert "error" in response.json()


def test_register_invalid_phone(client: TestClient):
    response = register(client, phone="123")
    assert response.status_code == 422
    assert response.json()["error"] == "Please enter a valid phone number."


def test_register_invalid_vehicle_number(client: TestClient):
    response = register(client, vehicleNumber="a!")
    assert response.status_code == 422
    assert response.json()["error"] == "Please enter a valid vehicle number."


def test_register_invalid_vehicle_type(client: TestClient):
    response = register(client, vehicleType="truck")
    assert response.status_code == 422
    assert "error" in response.json()


def test_register_missing_field(client: TestClient):
    response = register(client, fullName="")
    assert response.status_code == 422
    assert "error" in response.json()


def test_login_success(client: TestClient):
    register(client)
    response = client.post(
        "/api/login",
        json={"email": VALID_USER["email"], "password": VALID_USER["password"]},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["message"] == "Login successful."
    assert body["user"]["fullName"] == VALID_USER["fullName"]
    assert body["user"]["vehicleNumber"] == VALID_USER["vehicleNumber"]
    assert body["user"]["email"] == VALID_USER["email"]
    assert "password" not in body["user"]


def test_login_wrong_password(client: TestClient):
    register(client)
    response = client.post(
        "/api/login",
        json={"email": VALID_USER["email"], "password": "wrongpassword"},
    )
    assert response.status_code == 401
    assert response.json() == {"error": "Invalid email or password."}


def test_login_unknown_email(client: TestClient):
    response = client.post(
        "/api/login",
        json={"email": "ghost@example.com", "password": "whatever"},
    )
    assert response.status_code == 401


def test_login_missing_email(client: TestClient):
    response = client.post("/api/login", json={"password": "supersecret"})
    assert response.status_code == 422
    assert "error" in response.json()


@pytest.mark.parametrize(
    "field",
    ["fullName", "email", "phone", "password", "vehicleNumber", "vehicleType"],
)
def test_register_missing_required_field(client: TestClient, field: str):
    payload = dict(VALID_USER)
    payload.pop(field)
    response = client.post("/api/register", json=payload)
    assert response.status_code == 422
    assert "error" in response.json()
