# 2段階認証 (MFA) 緊急救済措置マニュアル (Runbook)

ユーザーが認証アプリ（TOTP）、パスキー（WebAuthn）、緊急バックアップコードの**すべてのアクセス手段を失った場合**に、システム管理者（DBA）がデータベース側から救済措置（MFA強制解除・リセット）を実施するための手順書です。

---

## 1. 救済措置の概要

この操作を実行すると、指定したユーザーに関して以下が一括でアトミックに処理されます：

1. **MFAファクターの全削除** (`auth.mfa_factors` および連動する `auth.mfa_challenges`)
2. **バックアップコードの全削除** (`public.mfa_backup_codes`)
3. **既存アクティブセッションの破棄** (`auth.sessions`)
   - 古い AAL2 / AAL1 の中間状態トークンを無効化し、クリーンな状態で再ログインできるようにします。

> [!CAUTION]
> **実行前の本人確認**
> 第三者によるアカウント乗っ取りを防止するため、救済措置を実行する前に必ず登録メールアドレスの所有確認や本人確認を十分に行ってください。

---

## 2. 実行手順

### 手順 1: Supabase Dashboard にアクセス

1. Supabase プロジェクトのダッシュボードにログインします。
2. 左メニューから **「SQL Editor」** を開きます。

### 手順 2: 救済関数の実行

ユーザーの**メールアドレス**、または **ユーザーID (UUID)** を指定して実行します。

#### パターン A: メールアドレスで指定する場合

```sql
SELECT admin_emergency_mfa_reset('user@example.com');
```

#### パターン B: ユーザーID (UUID) で指定する場合

```sql
SELECT admin_emergency_mfa_reset('b9165dd0-9ddb-4e68-9dd3-44623b41a973');
```

---

## 3. 実行結果の確認

実行に成功すると、以下のような JSON 結果が返されます：

```json
{
  "success": true,
  "user_id": "b9165dd0-9ddb-4e68-9dd3-44623b41a973",
  "email": "user@example.com",
  "deleted_factors_count": 1,
  "deleted_backup_codes_count": 10,
  "deleted_sessions_count": 2,
  "message": "MFA has been completely reset. The user can now log in using password and re-enroll."
}
```

- もし対象ユーザーが存在しない場合は `ERROR: User not found for identifier: ...` となり、何も削除されません。
- 空文字や NULL の場合も `ERROR: Target email or user_id must not be empty` となり安全にガードされます。

---

## 4. 救済完了後のユーザーへの案内

管理者はユーザーに以下の通り案内してください：

1. **通常ログイン**:
   - 登録メールアドレスとパスワードを入力してログインする。
   - （2段階認証コードの入力モーダルは表示されず、そのままダッシュボードへ遷移します）
2. **2段階認証・パスキーの再設定**:
   - ログイン後、「設定」画面（`/settings`）の「セキュリティ」タブを開く。
   - 新しい端末の認証アプリで再度2段階認証を有効化し、新しいバックアップコードを保存する。
