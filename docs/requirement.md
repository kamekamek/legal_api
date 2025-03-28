### 6.1 機能要求（Functional Requirements）

1. **法令データベース連携機能**
    - 建築基準法や条例、消防法などの改正情報を定期的にアップデート
        - 更新通知機能：ポータルサイト形式でチェックマーク付きUI
        - 検索履歴からの法令参照機能
    - 用途地域地図との連動
        - 地図上での敷地指定による用途地域・適用法令の自動取得
        - 主な対象法令：
            - 建築基準法
            - 各地方自治体の条例

2. **自動ボリューム計算機能**
    - 基本情報入力による自動計算
        - 入力項目：敷地面積、建蔽率、容積率、高さ制限
        - 出力項目：最大ボリューム、延べ床面積


3. **プロジェクト管理機能**
    - プロジェクト基本情報管理
        - プロジェクト名、所在地、規模、用途等
        - ステータス管理（計画中、申請中、完了等）
        - この画面から用途地域地図との連動や建築基準法や条例、消防法などの改正情報を定期的にアップデートにいく。

    - ドキュメント管理
        - 文書の一元管理（議事録、確認事項、申請書類等）
        - バージョン管理と履歴参照


4. **法令チェックリスト機能**
    - プロジェクト情報に基づく自動生成
        - 必要書類のリストアップ
        - 法的要件のチェックリスト
    - チェック機能
        - 項目ごとのステータス管理
        - 未対応項目のアラート
        - 期限管理



### 6.2 非機能要求（Non-Functional Requirements）

1. **信頼性・可用性**
    - システム稼働率
        - 目標：99.9％以上
        - 計画メンテナンス時間を除く
    - データ保護
        - 自動バックアップ（日次）
        - 障害時の復旧体制
        - データ復旧目標時間：2時間以内

2. **セキュリティ**
    - アクセス制御
        - ユーザー認証（多要素認証対応）
        - 権限管理（ロールベース）
        - セッション管理
    - データ保護
        - 通信の暗号化（SSL/TLS）
        - データの暗号化保存
        - アクセスログの保管
    - コンプライアンス
        - 個人情報保護法対応
        - GDPR対応（将来的）

3. **操作性・UI/UX**
    - ユーザーインターフェース
        - 直感的な操作フロー
        - レスポンシブデザイン
        - ダークモード対応
    - アクセシビリティ
        - WCAG 2.1準拠
        - スクリーンリーダー対応
    - マルチデバイス対応
        - PC（Windows/Mac）
        - タブレット（iOS/Android）
        - スマートフォン

4. **拡張性**
    - システム設計
        - モジュール化されたアーキテクチャ
        - プラグイン形式での機能追加
        - APIファーストアプローチ
    - データ設計
        - スキーマの柔軟な拡張性
        - マルチテナント対応
    - インフラ設計
        - スケーラブルなクラウドアーキテクチャ
        - コンテナ化対応

5. **性能要件**
    - レスポンス時間
        - 画面遷移：2秒以内
        - 検索結果表示：3秒以内
        - 地図表示：5秒以内
    - 同時接続
        - 通常時：100ユーザー
        - ピーク時：200ユーザー
    - データ処理
        - バッチ処理：夜間4時間以内
        - ファイルアップロード：100MB以内