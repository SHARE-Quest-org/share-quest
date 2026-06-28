# SHARE Quest

> 学びの「楽しい！」をつなげる記事サービス

**本番URL**: https://share-quest.vercel.app/

## SHARE Quest とは

「学びの『楽しい！』をつなげる」をモットーに、ライターによって書かれる記事から、「学ぶこと」の楽しさや面白さを届けるコンテンツです。

「勉強」という固い縛りではなく、「気になったことを広げたい」「学ぶこと自体が楽しい」と思えるようなコンテンツを目指しています。

## 主な活動

SHARE Questのライターが、「楽しい」「おもしろい」と感じたことを記事にすることで、その輪を広げています。一人でも多くの方に学びの楽しさを伝えられるよう活動しています。

## 機能

- 記事の閲覧・検索・タグ絞り込み
- ライター一覧・プロフィール
- お気に入り機能
- ライターによる記事作成・投稿申請
- 編集長による記事承認・管理

## 技術スタック

- フロントエンド: React 18 + Vite + TypeScript + Tailwind CSS
- 認証・DB: Supabase
- デプロイ: Vercel

## お問い合わせ

ご質問・ご意見は https://share-quest.vercel.app/contact からどうぞ。

## 開発とディレクトリ構造 (Development & Architecture)

フロントエンドは画面ごとにファイルを分割・モジュール化し、関心の分離を行っています。

### ディレクトリ構造

```text
apps/website/src/
├── App.tsx             # 記事エディター画面、共通レイアウト、メインルーティング定義
├── main.tsx            # エントリーポイント
├── supabase.ts         # Supabase クライアント初期化および型定義
├── assets/             # アセットファイル（画像・アイコン）
├── components/         # 共有コンポーネント（例: ArticleCard.tsx）
├── context/
│   └── AppContext.tsx  # グローバル状態（認証、お気に入り、表示フォントサイズ等）の Context / Provider
├── utils/
│   └── sanitize.ts     # HTMLサニタイズ用のユーティリティ
└── views/              # 閲覧者・一般読者向け画面ビュー
    ├── HomeView.tsx
    ├── ArticleView.tsx
    ├── SearchView.tsx
    ├── WritersView.tsx
    ├── ProfileView.tsx
    ├── FavoritesView.tsx
    ├── SettingsView.tsx
    ├── AboutView.tsx
    ├── PrivacyView.tsx
    ├── TermsView.tsx
    └── dashboard/      # ライター・編集者向け管理画面ビュー
        ├── AccessDeniedView.tsx
        ├── WriterDashboard.tsx
        ├── WriterSeriesPage.tsx
        ├── EditorDashboard.tsx
        ├── EditorArticlesView.tsx
        ├── EditorRecommendView.tsx
        └── EditorWritersView.tsx
```

### 状態管理の仕組み (`AppContext`)

各画面（`views`）は、`useApp()` フックを通じて [AppContext.tsx](file:///home/noimzip/ダウンロード/share-quest-MVP/apps/website/src/context/AppContext.tsx) から必要なグローバル状態（ユーザー情報、お気に入りリスト、記事データなど）や関数を取得する設計に統一されています。これにより、Props Drilling を防ぎ、コードの可読性とメンテナンス性を向上させています。
