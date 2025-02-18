import pytest
from fastapi.testclient import TestClient
from datetime import datetime, timedelta
from app.main import app

client = TestClient(app)

@pytest.fixture
def test_project():
    return {
        "name": "テストプロジェクト",
        "description": "テストプロジェクトの説明",
        "status": "計画中",
        "start_date": (datetime.now()).strftime("%Y-%m-%d"),
        "end_date": (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d"),
        "location": "東京都渋谷区"
    }

def test_create_project(test_project):
    response = client.post("/api/projects/", json=test_project)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == test_project["name"]
    assert data["description"] == test_project["description"]
    assert data["status"] == test_project["status"]
    assert "id" in data

def test_get_project(test_project):
    # プロジェクトを作成
    create_response = client.post("/api/projects/", json=test_project)
    project_id = create_response.json()["id"]
    
    # 作成したプロジェクトを取得
    response = client.get(f"/api/projects/{project_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == test_project["name"]
    assert data["description"] == test_project["description"]

def test_update_project(test_project):
    # プロジェクトを作成
    create_response = client.post("/api/projects/", json=test_project)
    project_id = create_response.json()["id"]
    
    # プロジェクトを更新
    updated_data = {
        **test_project,
        "name": "更新後のプロジェクト名",
        "status": "進行中"
    }
    response = client.put(f"/api/projects/{project_id}", json=updated_data)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "更新後のプロジェクト名"
    assert data["status"] == "進行中"

def test_delete_project(test_project):
    # プロジェクトを作成
    create_response = client.post("/api/projects/", json=test_project)
    project_id = create_response.json()["id"]
    
    # プロジェクトを削除
    response = client.delete(f"/api/projects/{project_id}")
    assert response.status_code == 204
    
    # 削除されたことを確認
    get_response = client.get(f"/api/projects/{project_id}")
    assert get_response.status_code == 404 