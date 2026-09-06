-- 1. profiles テーブルの権限強化およびメールアドレス露出防止
REVOKE TRUNCATE, DELETE ON public.profiles FROM anon, authenticated;
REVOKE UPDATE, INSERT ON public.profiles FROM anon;
REVOKE SELECT ON public.profiles FROM anon, authenticated;
GRANT SELECT (id, role, display_name, username, avatar_url, bio, created_at) ON public.profiles TO anon, authenticated;

-- 編集長のみが全ユーザーのメールアドレスを含むプロフィールを取得できる管理者専用関数
CREATE OR REPLACE FUNCTION public.admin_get_all_profiles()
RETURNS TABLE (
  id uuid,
  email text,
  role text,
  display_name text,
  created_at timestamptz,
  avatar_url text,
  bio text,
  username text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NOT public.check_is_editor() THEN
    RAISE EXCEPTION '権限がありません。編集長のみが実行できます。';
  END IF;

  RETURN QUERY
  SELECT p.id, p.email, p.role, p.display_name, p.created_at, p.avatar_url, p.bio, p.username
  FROM public.profiles p
  ORDER BY p.role ASC, p.created_at DESC;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_get_all_profiles() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_get_all_profiles() TO authenticated;

-- 2. articles の不正更新・ステータス/フラグ改ざん防止トリガー
CREATE OR REPLACE FUNCTION public.enforce_article_update_rules()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_in_likes_sync boolean := coalesce(current_setting('quest.in_likes_sync', true), 'false') = 'true';
  v_in_views_inc boolean := coalesce(current_setting('quest.in_views_increment', true), 'false') = 'true';
BEGIN
  -- 1. システム内部のいいね同期処理の場合（likes 列のみ更新を許可、他は OLD を保持）
  IF v_in_likes_sync THEN
    OLD.likes := NEW.likes;
    RETURN OLD;
  END IF;

  -- 2. システム内部のPV加算処理の場合（views 列のみ +1 を許可、他は OLD を保持）
  IF v_in_views_inc THEN
    OLD.views := OLD.views + 1;
    RETURN OLD;
  END IF;

  -- 3. 通常のユーザー（編集長またはライター）による更新
  IF NOT public.check_is_editor() THEN
    -- 投稿者は自分の記事しか更新できない
    IF (auth.uid())::text IS NULL OR (auth.uid())::text != OLD.writer_id THEN
      RAISE EXCEPTION '他のユーザーの記事を更新することはできません。';
    END IF;

    -- writer_id の変更を禁止
    NEW.writer_id := OLD.writer_id;

    -- status を勝手に 'published' に変更できないように制御（draft または pending のみ可能）
    IF NEW.status = 'published' AND OLD.status != 'published' THEN
      RAISE EXCEPTION 'ライター自身で記事を公開状態に変更することはできません。審査申請を行ってください。';
    END IF;

    -- is_recommended, is_popular, views, likes の不正変更を防止（改ざん防止）
    NEW.is_recommended := OLD.is_recommended;
    NEW.is_popular := OLD.is_popular;
    NEW.views := OLD.views;
    NEW.likes := OLD.likes;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_article_update_rules ON public.articles;
CREATE TRIGGER trg_enforce_article_update_rules
  BEFORE UPDATE ON public.articles
  FOR EACH ROW EXECUTE FUNCTION public.enforce_article_update_rules();

CREATE OR REPLACE FUNCTION public.enforce_article_insert_rules()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NOT public.check_is_editor() THEN
    -- 新規作成時は draft または pending のみ
    IF NEW.status = 'published' THEN
      NEW.status := 'draft';
    END IF;
    NEW.is_recommended := false;
    NEW.is_popular := false;
    NEW.views := 0;
    NEW.likes := 0;
    NEW.writer_id := (auth.uid())::text;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_article_insert_rules ON public.articles;
CREATE TRIGGER trg_enforce_article_insert_rules
  BEFORE INSERT ON public.articles
  FOR EACH ROW EXECUTE FUNCTION public.enforce_article_insert_rules();

-- 3. favorites テーブルのトリガーによる likes の安全な自動同期
CREATE OR REPLACE FUNCTION public.sync_article_likes_on_favorite()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  PERFORM set_config('quest.in_likes_sync', 'true', true);
  IF TG_OP = 'INSERT' THEN
    UPDATE public.articles SET likes = likes + 1 WHERE id = NEW.article_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.articles SET likes = GREATEST(likes - 1, 0) WHERE id = OLD.article_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_article_likes_on_favorite ON public.favorites;
CREATE TRIGGER trg_sync_article_likes_on_favorite
  AFTER INSERT OR DELETE ON public.favorites
  FOR EACH ROW EXECUTE FUNCTION public.sync_article_likes_on_favorite();

-- 4. PVカウント用RPC（公開記事のみ +1、直接カラム改ざん抑止）
CREATE OR REPLACE FUNCTION public.increment_views(p_article_id text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  PERFORM set_config('quest.in_views_increment', 'true', true);
  UPDATE public.articles
  SET views = views + 1
  WHERE id = p_article_id AND status = 'published';
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_views(p_article_id text) TO anon, authenticated;

-- トリガー関数および increment_likes / decrement_likes への直接実行権限を剥奪（直接RPC呼び出し禁止）
REVOKE EXECUTE ON FUNCTION public.enforce_article_update_rules() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_article_insert_rules() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sync_article_likes_on_favorite() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.increment_likes(p_article_id text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.decrement_likes(p_article_id text) FROM PUBLIC, anon, authenticated;

-- 5. 最後の編集長アカウント降格の防止
CREATE OR REPLACE FUNCTION public.admin_change_user_role(target_user_id text, new_role text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NOT public.check_is_editor() THEN
    RAISE EXCEPTION '権限がありません。編集長のみがロールを変更できます。';
  END IF;

  IF new_role NOT IN ('viewer', 'writer', 'editor') THEN
    RAISE EXCEPTION '無効なロールです: %', new_role;
  END IF;

  -- 最後の編集長を降格させないための安全チェック
  IF new_role != 'editor' THEN
    IF EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id::text = target_user_id AND role = 'editor'
    ) THEN
      IF (SELECT count(*) FROM public.profiles WHERE role = 'editor') <= 1 THEN
        RAISE EXCEPTION '最後の編集長アカウントを降格することはできません。';
      END IF;
    END IF;
  END IF;

  UPDATE public.profiles
  SET role = new_role
  WHERE id::text = target_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION '対象のユーザーが見つかりません。';
  END IF;
END;
$$;

-- 6. 連載（series）の認可強化および外部キー制約修正
ALTER TABLE public.articles
  DROP CONSTRAINT IF EXISTS articles_series_id_fkey,
  ADD CONSTRAINT articles_series_id_fkey
    FOREIGN KEY (series_id) REFERENCES public.series(id) ON DELETE SET NULL;

DROP POLICY IF EXISTS "自分の連載を作成できる" ON public.series;
CREATE POLICY "series_insert_writer_or_editor" ON public.series
  FOR INSERT TO authenticated
  WITH CHECK (
    writer_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE (profiles.id)::text = (auth.uid())::text
        AND profiles.role IN ('writer', 'editor')
    )
  );

DROP POLICY IF EXISTS "自分の連載を更新できる" ON public.series;
CREATE POLICY "series_update_own_or_editor" ON public.series
  FOR UPDATE TO authenticated
  USING (writer_id = auth.uid() OR check_is_editor())
  WITH CHECK (writer_id = auth.uid() OR check_is_editor());

DROP POLICY IF EXISTS "自分の連載を削除できる" ON public.series;
CREATE POLICY "series_delete_own_or_editor" ON public.series
  FOR DELETE TO authenticated
  USING (writer_id = auth.uid() OR check_is_editor());
