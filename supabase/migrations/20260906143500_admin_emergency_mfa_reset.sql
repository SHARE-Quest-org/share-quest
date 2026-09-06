-- Emergency MFA Reset Function for DB Administrators
-- Allows DBA / Support to reset all MFA factors, backup codes, and active sessions
-- for a user when all access methods are lost.

CREATE OR REPLACE FUNCTION public.admin_emergency_mfa_reset(p_target text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
    v_user_id uuid;
    v_user_email text;
    v_deleted_factors int := 0;
    v_deleted_backup_codes int := 0;
    v_deleted_sessions int := 0;
BEGIN
    -- 引数バリデーション
    IF p_target IS NULL OR trim(p_target) = '' THEN
        RAISE EXCEPTION 'Target email or user_id must not be empty';
    END IF;

    -- UUID形式かメールアドレス形式かを判定してユーザーを特定
    IF p_target ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
        SELECT id, email INTO v_user_id, v_user_email
        FROM auth.users
        WHERE id = p_target::uuid;
    ELSE
        SELECT id, email INTO v_user_id, v_user_email
        FROM auth.users
        WHERE lower(email) = lower(trim(p_target));
    END IF;

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User not found for identifier: %', p_target;
    END IF;

    -- 1. バックアップコードの削除
    WITH deleted AS (
        DELETE FROM public.mfa_backup_codes
        WHERE user_id = v_user_id
        RETURNING id
    )
    SELECT count(*) INTO v_deleted_backup_codes FROM deleted;

    -- 2. MFAファクター（TOTP / Passkey等）の削除（auth.mfa_challengesは外部キーCASCADEで連動削除）
    WITH deleted AS (
        DELETE FROM auth.mfa_factors
        WHERE user_id = v_user_id
        RETURNING id
    )
    SELECT count(*) INTO v_deleted_factors FROM deleted;

    -- 3. 残存セッションの破棄（古いAALセッションによる不整合を防ぎ強制ログアウト）
    WITH deleted AS (
        DELETE FROM auth.sessions
        WHERE user_id = v_user_id
        RETURNING id
    )
    SELECT count(*) INTO v_deleted_sessions FROM deleted;

    RETURN jsonb_build_object(
        'success', true,
        'user_id', v_user_id,
        'email', v_user_email,
        'deleted_factors_count', v_deleted_factors,
        'deleted_backup_codes_count', v_deleted_backup_codes,
        'deleted_sessions_count', v_deleted_sessions,
        'message', 'MFA has been completely reset. The user can now log in using password and re-enroll.'
    );
END;
$$;

-- 一般ユーザー（API経由）の実行を禁止し、管理者（DBA/サービスロール）のみ実行可能にする
REVOKE ALL ON FUNCTION public.admin_emergency_mfa_reset(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_emergency_mfa_reset(text) TO postgres, service_role;
