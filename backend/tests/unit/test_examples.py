def test_list_examples_empty(client):
    response = client.get("/api/examples")
    assert response.status_code == 200
    assert response.json() == []


def test_create_example(client):
    response = client.post("/api/examples", json={"title": "Test", "description": "Desc"})
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Test"
    assert data["description"] == "Desc"
    assert "id" in data
    assert "created_at" in data


def test_get_example(client):
    create_resp = client.post("/api/examples", json={"title": "Item"})
    item_id = create_resp.json()["id"]

    response = client.get(f"/api/examples/{item_id}")
    assert response.status_code == 200
    assert response.json()["title"] == "Item"


def test_get_example_not_found(client):
    response = client.get("/api/examples/nonexistent")
    assert response.status_code == 404


def test_update_example(client):
    create_resp = client.post("/api/examples", json={"title": "Old"})
    item_id = create_resp.json()["id"]

    response = client.put(f"/api/examples/{item_id}", json={"title": "New"})
    assert response.status_code == 200
    assert response.json()["title"] == "New"


def test_update_example_not_found(client):
    response = client.put("/api/examples/nonexistent", json={"title": "X"})
    assert response.status_code == 404


def test_delete_example(client):
    create_resp = client.post("/api/examples", json={"title": "Del"})
    item_id = create_resp.json()["id"]

    response = client.delete(f"/api/examples/{item_id}")
    assert response.status_code == 204

    response = client.get(f"/api/examples/{item_id}")
    assert response.status_code == 404


def test_delete_example_not_found(client):
    response = client.delete("/api/examples/nonexistent")
    assert response.status_code == 404


def test_list_examples_after_create(client):
    client.post("/api/examples", json={"title": "A"})
    client.post("/api/examples", json={"title": "B"})
    response = client.get("/api/examples")
    assert response.status_code == 200
    assert len(response.json()) == 2


def test_create_example_default_description(client):
    response = client.post("/api/examples", json={"title": "Minimal"})
    assert response.status_code == 201
    assert response.json()["description"] == ""


def test_update_example_partial(client):
    create_resp = client.post("/api/examples", json={"title": "T", "description": "D"})
    item_id = create_resp.json()["id"]

    response = client.put(f"/api/examples/{item_id}", json={"description": "Updated"})
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "T"
    assert data["description"] == "Updated"
