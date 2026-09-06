import { useState, useEffect, useRef } from "react";
import { ChevronLeft } from "lucide-react";
import RichTextEditor from "../../components/RichTextEditor";
import { supabase } from "../../supabase";
import { sanitizeHtml } from "../../utils/sanitize";
import { useApp } from "../../context/AppContext";
import { LogoIcon, getThumbnailColor, THUMBNAIL_COLORS } from "../../App";
import type { Article, Series } from "../../App";

export const ArticleEditorTabs = ({
  settingsPanel,
  editorPanel,
}: {
  settingsPanel: React.ReactNode;
  editorPanel: React.ReactNode;
}) => {
  return (
    <div className="space-y-6">
      {settingsPanel}
      {editorPanel}
    </div>
  );
};

export interface ArticleEditorPageProps {
  editingId: string | null;
  articles: Article[];
  setArticles: (articles: Article[]) => void;
  seriesList: Series[];
  currentUserId: string | null;
  showToast: (msg: string) => void;
  navigate: (view: string, param?: string) => void;
  draftTitle: string;
  setDraftTitle: (v: string) => void;
  draftContent: string;
  setDraftContent: (v: string) => void;
  draftColor: string;
  setDraftColor: (v: string) => void;
  draftTags: string[];
  setDraftTags: (v: string[]) => void;
  draftSeriesId: string;
  setDraftSeriesId: (v: string) => void;
  draftEpisodeNumber: string;
  setDraftEpisodeNumber: (v: string) => void;
  draftSummary: string;
  setDraftSummary: (v: string) => void;
  draftTagInput: string;
  setDraftTagInput: (v: string) => void;
  editorSaving: boolean;
  setEditorSaving: (v: boolean) => void;
  editorShowPreview: boolean;
  setEditorShowPreview: (v: boolean) => void;
  draftThumbnailUrl: string | null;
  setDraftThumbnailUrl: (v: string | null) => void;
  editorThumbnailUploading: boolean;
  setEditorThumbnailUploading: (v: boolean) => void;
}

export const ArticleEditorPage = ({
  editingId,
  articles,
  setArticles,
  seriesList,
  currentUserId,
  showToast,
  navigate,
  draftTitle,
  setDraftTitle,
  draftContent,
  setDraftContent,
  draftColor,
  setDraftColor,
  draftTags,
  setDraftTags,
  draftSeriesId,
  setDraftSeriesId,
  draftEpisodeNumber,
  setDraftEpisodeNumber,
  draftSummary,
  setDraftSummary,
  draftTagInput,
  setDraftTagInput,
  editorSaving,
  setEditorSaving,
  editorShowPreview,
  setEditorShowPreview,
  draftThumbnailUrl,
  setDraftThumbnailUrl,
  editorThumbnailUploading,
  setEditorThumbnailUploading,
}: ArticleEditorPageProps) => {
  const { getFontSizeClass } = useApp();
  const editingArticle = editingId ? (articles.find((a) => a.id === editingId) ?? null) : null;
  const [formTitle, setFormTitle] = [draftTitle, setDraftTitle];
  const [formContent, setFormContent] = [draftContent, setDraftContent];
  const [formColor, setFormColor] = [draftColor, setDraftColor];
  const [tags, setTags] = [draftTags, setDraftTags];
  const [formSeriesId, setFormSeriesId] = [draftSeriesId, setDraftSeriesId];
  const [formEpisodeNumber, setFormEpisodeNumber] = [draftEpisodeNumber, setDraftEpisodeNumber];
  const [formSummary, setFormSummary] = [draftSummary, setDraftSummary];
  const [tagInput, setTagInput] = [draftTagInput, setDraftTagInput];
  const [saving, setSaving] = [editorSaving, setEditorSaving];
  const [showPreview, setShowPreview] = [editorShowPreview, setEditorShowPreview];
  const [thumbnailUrl, setThumbnailUrl] = [draftThumbnailUrl, setDraftThumbnailUrl];
  const [thumbnailUploading, setThumbnailUploading] = [
    editorThumbnailUploading,
    setEditorThumbnailUploading,
  ];
  useEffect(() => {
    setDraftTitle(editingArticle?.title ?? "");
    setDraftContent(editingArticle?.content ?? "");
    setDraftColor(editingArticle?.thumbnailColor ?? "blue");
    setDraftTags(editingArticle?.tags ?? []);
    setDraftSeriesId(editingArticle?.seriesId ?? "");
    setDraftEpisodeNumber(editingArticle?.episodeNumber?.toString() ?? "");
    setDraftThumbnailUrl(editingArticle?.thumbnailUrl ?? null);
    setDraftSummary(editingArticle?.summary ?? "");
    setDraftTagInput("");
    setEditorSaving(false);
    setEditorShowPreview(false);
    setEditorThumbnailUploading(false);
  }, [editingId]);

  const ALLOWED_THUMBNAIL_TYPES: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = ALLOWED_THUMBNAIL_TYPES[file.type];
    if (!ext) {
      showToast("JPEG、PNG、WebP、GIF形式の画像を選択してください");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast("10MB以下の画像を選択してください");
      return;
    }
    setThumbnailUploading(true);
    const fileName = `${currentUserId}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("thumbnails")
      .upload(fileName, file, { upsert: true });
    if (!error) {
      const { data } = supabase.storage.from("thumbnails").getPublicUrl(fileName);
      setThumbnailUrl(data.publicUrl);
      showToast("画像をアップロードしました");
    } else {
      showToast("アップロードに失敗しました");
    }
    setThumbnailUploading(false);
  };

  const addTag = (val: string) => {
    const newTags = val
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t && !tags.includes(t));
    if (newTags.length) setTags([...tags, ...newTags]);
    setTagInput("");
  };
  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));

  const handleSave = async () => {
    if (!formTitle.trim()) {
      showToast("タイトルを入力してください");
      return;
    }
    setSaving(true);
    if (editingArticle) {
      const { error } = await supabase
        .from("articles")
        .update({
          title: formTitle,
          content: formContent,
          summary: formSummary || null,
          tags,
          thumbnail_color: formColor,
          thumbnail_url: thumbnailUrl,
          series_id: formSeriesId || null,
          episode_number: formEpisodeNumber ? parseInt(formEpisodeNumber) : null,
        })
        .eq("id", editingArticle.id);
      if (!error) {
        setArticles(
          articles.map((a) =>
            a.id === editingArticle.id
              ? {
                  ...a,
                  title: formTitle,
                  content: formContent,
                  summary: formSummary || undefined,
                  tags,
                  thumbnailColor: formColor,
                  thumbnailUrl: thumbnailUrl,
                  seriesId: formSeriesId || null,
                  episodeNumber: formEpisodeNumber ? parseInt(formEpisodeNumber) : null,
                }
              : a,
          ),
        );
        showToast("記事を更新しました");
        navigate("writerDash");
      } else {
        console.error("記事更新エラー:", error);
        showToast("エラーが発生しました。もう一度お試しください。");
      }
    } else {
      const { data, error } = await supabase
        .from("articles")
        .insert({
          title: formTitle,
          content: formContent,
          summary: formSummary || null,
          tags,
          thumbnail_color: formColor,
          thumbnail_url: thumbnailUrl,
          writer_id: currentUserId,
          status: "draft",
          views: 0,
          likes: 0,
          is_recommended: false,
          is_popular: false,
          series_id: formSeriesId || null,
          episode_number: formEpisodeNumber ? parseInt(formEpisodeNumber) : null,
        })
        .select()
        .single();
      if (!error && data) {
        setArticles([
          ...articles,
          {
            id: data.id,
            title: data.title,
            thumbnail: "",
            thumbnailColor: formColor,
            thumbnailUrl: thumbnailUrl,
            writerId: data.writer_id,
            views: 0,
            likes: 0,
            tags,
            isRecommended: false,
            isPopular: false,
            status: "draft",
            content: formContent,
            summary: formSummary || undefined,
            seriesId: formSeriesId || null,
            episodeNumber: formEpisodeNumber ? parseInt(formEpisodeNumber) : null,
          },
        ]);
        showToast("下書きを保存しました");
      } else {
        console.error("下書き保存エラー:", error);
        showToast("エラーが発生しました。もう一度お試しください。");
      }
    }
    setSaving(false);
  };

  const [isDirty, setIsDirty] = useState(false);
  const autoSaveIdRef = useRef<string | null>(editingId);

  useEffect(() => {
    if (formTitle || formContent) setIsDirty(true);
  }, [formTitle, formContent]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  useEffect(() => {
    const handlePopState = () => {
      if (isDirty) {
        window.history.go(1);
        setTimeout(() => {
          if (window.confirm("保存されていない変更があります。ページを離れますか？")) {
            setIsDirty(false);
            window.history.go(-1);
          }
        }, 0);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isDirty]);

  useEffect(() => {
    if (!isDirty || !formTitle.trim()) return;
    const timer = setTimeout(async () => {
      if (autoSaveIdRef.current) {
        await supabase
          .from("articles")
          .update({
            title: formTitle,
            content: formContent,
            summary: formSummary || null,
            tags,
            thumbnail_color: formColor,
            thumbnail_url: thumbnailUrl,
            series_id: formSeriesId || null,
            episode_number: formEpisodeNumber ? parseInt(formEpisodeNumber) : null,
          })
          .eq("id", autoSaveIdRef.current);
      } else {
        const { data } = await supabase
          .from("articles")
          .insert({
            title: formTitle,
            content: formContent,
            summary: formSummary || null,
            tags,
            thumbnail_color: formColor,
            thumbnail_url: thumbnailUrl,
            writer_id: currentUserId,
            status: "draft",
            views: 0,
            likes: 0,
            is_recommended: false,
            is_popular: false,
            series_id: formSeriesId || null,
            episode_number: formEpisodeNumber ? parseInt(formEpisodeNumber) : null,
          })
          .select()
          .single();
        if (data) {
          autoSaveIdRef.current = data.id;
          setArticles([
            ...articles,
            {
              id: data.id,
              title: formTitle,
              thumbnail: "",
              thumbnailColor: formColor,
              thumbnailUrl: thumbnailUrl,
              writerId: currentUserId ?? "",
              views: 0,
              likes: 0,
              tags,
              isRecommended: false,
              isPopular: false,
              status: "draft",
              content: formContent,
              summary: formSummary || undefined,
              seriesId: formSeriesId || null,
              episodeNumber: formEpisodeNumber ? parseInt(formEpisodeNumber) : null,
            },
          ]);
        }
      }
      setIsDirty(false);
      showToast("自動保存しました");
    }, 5000);
    return () => clearTimeout(timer);
  }, [formTitle, formContent, isDirty]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (
                isDirty &&
                !window.confirm("保存されていない変更があります。ページを離れますか？")
              )
                return;
              setIsDirty(false);
              window.history.back();
            }}
            className="p-2 bg-white rounded-full shadow-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-gray-800">
            {editingArticle ? "記事を編集" : "新規記事作成"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${showPreview ? "bg-blue-600 text-white border-blue-600" : "bg-white text-blue-600 border-blue-300 hover:bg-blue-50"}`}
          >
            {showPreview ? "編集" : "プレビュー"}
          </button>
          <button
            onClick={() => void handleSave()}
            disabled={saving}
            className="px-4 py-1.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "保存中..." : editingArticle ? "更新" : "下書き保存"}
          </button>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 py-6">
        {showPreview ? (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div
              className={`w-full h-40 rounded-xl mb-4 flex items-center justify-center ${getThumbnailColor(formColor).bg}`}
            >
              <LogoIcon className="w-16 h-16 opacity-20" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              {formTitle || <span className="text-gray-400">（タイトル未入力）</span>}
            </h2>
            <div className="flex flex-wrap gap-1 mb-4">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
            {formContent ? (
              <div
                className={`text-gray-800 leading-loose article-content ${getFontSizeClass()}`}
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(formContent) }}
              />
            ) : (
              <p className="text-sm text-gray-400">（本文未入力）</p>
            )}
          </div>
        ) : (
          <ArticleEditorTabs
            settingsPanel={
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">連載</label>
                  <select
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={formSeriesId}
                    onChange={(e) => setFormSeriesId(e.target.value)}
                  >
                    <option value="">連載なし（単発記事）</option>
                    {seriesList
                      .filter((s) => s.writerId === currentUserId)
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.title}
                        </option>
                      ))}
                  </select>
                </div>
                {formSeriesId && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">話数</label>
                    <input
                      type="number"
                      min={1}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder="例: 1"
                      value={formEpisodeNumber}
                      onChange={(e) => setFormEpisodeNumber(e.target.value)}
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    タイトル <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="記事のタイトルを入力"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    要約{" "}
                    <span className="text-gray-400 font-normal text-xs">
                      （記事の冒頭に表示されます）
                    </span>
                  </label>
                  <textarea
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                    rows={3}
                    placeholder="記事の要約を入力（省略可）"
                    value={formSummary}
                    onChange={(e) => setFormSummary(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    サムネイルカラー
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {THUMBNAIL_COLORS.map((color) => (
                      <button
                        key={color.id}
                        onClick={() => setFormColor(color.id)}
                        className={`w-10 h-10 rounded-full ${color.bg} border-4 transition-all ${formColor === color.id ? "border-gray-700 scale-110" : "border-transparent"}`}
                        title={color.label}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    選択中: {getThumbnailColor(formColor).label}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    サムネイル画像{" "}
                    <span className="text-gray-400 font-normal text-xs">(推奨: 1920×1080px)</span>
                  </label>
                  {thumbnailUrl && (
                    <div
                      className="mb-2 rounded-xl overflow-hidden border border-gray-200 bg-gray-50"
                      style={{ aspectRatio: "16/9", maxHeight: "240px" }}
                    >
                      <img
                        src={thumbnailUrl}
                        alt="thumbnail"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <label className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-200 cursor-pointer border border-gray-200">
                      {thumbnailUploading
                        ? "アップロード中..."
                        : thumbnailUrl
                          ? "画像を変更"
                          : "画像をアップロード"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        onChange={(e) => void handleThumbnailUpload(e)}
                        disabled={thumbnailUploading}
                      />
                    </label>
                    {thumbnailUrl && (
                      <button
                        onClick={() => setThumbnailUrl(null)}
                        className="text-sm text-red-500 hover:text-red-700"
                      >
                        削除
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">JPG / PNG · 10MB以下</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">タグ</label>
                  <div className="flex flex-wrap gap-1 mb-2 max-w-xs">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full"
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="hover:text-red-500 font-bold leading-none"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder="タグを入力（Enterまたはカンマで追加）"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === ",") {
                          e.preventDefault();
                          addTag(tagInput);
                        }
                      }}
                    />
                    <button
                      onClick={() => addTag(tagInput)}
                      className="px-3 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700"
                    >
                      追加
                    </button>
                  </div>
                </div>
              </div>
            }
            editorPanel={
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <label className="block text-sm font-bold text-gray-700 mb-2">本文</label>
                <RichTextEditor
                  content={formContent}
                  onChange={setFormContent}
                  placeholder="記事の本文を入力してください"
                />
              </div>
            }
          />
        )}
      </div>
    </div>
  );
};
