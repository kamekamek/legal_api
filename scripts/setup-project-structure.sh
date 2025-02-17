#!/bin/bash

# フロントエンド構造
mkdir -p frontend/src/features/{projects,legal-updates,map,checklists}
mkdir -p frontend/src/{components,services,hooks,utils,tests}
mkdir -p frontend/e2e
mkdir -p frontend/src/tests/{projects,legal-updates,map,checklists}

# バックエンド構造
mkdir -p backend/src/features/{projects,legal-updates,zoning,checklists}
mkdir -p backend/src/{middleware,services,models,tests}
mkdir -p backend/e2e
mkdir -p backend/src/tests/{projects,legal-updates,zoning,checklists}

# ドキュメント構造
mkdir -p docs/{api,development,deployment}

# スクリプトディレクトリ
mkdir -p scripts

# 権限設定
chmod +x scripts/*.sh 