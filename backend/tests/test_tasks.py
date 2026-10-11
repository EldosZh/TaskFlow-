def test_health(client):
    assert client.get("/api/health").json() == {"status": "ok"}


def test_task_crud_and_missing(client):
    created = client.post("/api/tasks", json={"title": "  Plan week ", "description": "Make a list"})
    assert created.status_code == 201
    task = created.json()
    assert task["title"] == "Plan week"
    task_id = task["id"]
    assert client.get(f"/api/tasks/{task_id}").json()["id"] == task_id
    assert client.patch(f"/api/tasks/{task_id}", json={"title": "New plan"}).json()["title"] == "New plan"
    assert client.patch(f"/api/tasks/{task_id}", json={"completed": True}).json()["completed"] is True
    assert client.delete(f"/api/tasks/{task_id}").status_code == 204
    assert client.get(f"/api/tasks/{task_id}").status_code == 404
    assert client.patch("/api/tasks/999", json={"completed": True}).status_code == 404
    assert client.delete("/api/tasks/999").status_code == 404


def test_validation_search_filter_and_pagination(client):
    assert client.post("/api/tasks", json={"title": "  "}).status_code == 422
    assert client.post("/api/tasks", json={"title": "x" * 121}).status_code == 422
    client.post("/api/tasks", json={"title": "Read book", "description": "fiction"})
    client.post("/api/tasks", json={"title": "Write code", "description": "backend"})
    third = client.post("/api/tasks", json={"title": "Review code", "description": "frontend"}).json()
    client.patch(f"/api/tasks/{third['id']}", json={"completed": True})
    assert len(client.get("/api/tasks", params={"search": "code"}).json()) == 2
    assert len(client.get("/api/tasks", params={"search": "fiction"}).json()) == 1
    filtered = client.get("/api/tasks", params={"completed": True}).json()
    assert len(filtered) == 1 and filtered[0]["completed"] is True
    page = client.get("/api/tasks", params={"limit": 1, "offset": 1}).json()
    assert len(page) == 1
    assert client.get("/api/tasks/stats").json() == {"total": 3, "completed": 1, "remaining": 2}
