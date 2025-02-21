#!/bin/bash

# テストデータベースの作成
PGPASSWORD=postgres psql -U postgres -h localhost -c 'DROP DATABASE IF EXISTS legal_api_test;'
PGPASSWORD=postgres psql -U postgres -h localhost -c 'CREATE DATABASE legal_api_test;'

# マイグレーションの実行
NODE_ENV=test npx sequelize-cli db:migrate 