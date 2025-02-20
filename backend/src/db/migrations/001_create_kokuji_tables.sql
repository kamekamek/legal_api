-- 告示文テーブル
CREATE TABLE IF NOT EXISTS kokuji (
    id SERIAL PRIMARY KEY,
    kokuji_id VARCHAR(100) NOT NULL UNIQUE,  -- 告示番号
    kokuji_text TEXT NOT NULL,               -- 告示本文
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- プロジェクトと告示文の関連テーブル
CREATE TABLE IF NOT EXISTS project_kokuji (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id),
    kokuji_id VARCHAR(100) REFERENCES kokuji(kokuji_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, kokuji_id)
); 