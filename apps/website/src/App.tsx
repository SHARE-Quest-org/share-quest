import RichTextEditor from "./components/RichTextEditor";
import { useMemo, useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "./supabase";
import type { Profile } from "./supabase";
import { ChevronLeft, Share2, Eye, X, Plus, Edit3, Check, AlertCircle, Home } from "lucide-react";
import { sanitizeHtml } from "./utils/sanitize";
import { ContactView } from "./components/ContactView";

type Series = {
  id: string;
  title: string;
  description?: string | null;
  writerId: string;
};

type Article = {
  id: string;
  title: string;
  thumbnail: string;
  thumbnailUrl: string | null;
  thumbnailColor: string | null;
  writerId: string;
  views: number;
  likes: number;
  tags: string[];
  isRecommended: boolean;
  isPopular: boolean;
  status: "draft" | "pending" | "published";
  content?: string;
  summary?: string;
  seriesId?: string | null;
  episodeNumber?: number | null;
};
import imgLogo from "./assets/170805.jpg";
import imgTitle from "./assets/117_20260501195729.png";
import imgSearch from "./assets/118_20260501193319.png";
import imgUser from "./assets/119_20260501193952.png";
import imgStar from "./assets/120_20260501194440.png";
import imgSettings from "./assets/121_20260501195446.png";
import imgRecommend from "./assets/recommend_icon.png";

const LogoIcon = ({ className = "w-8 h-8" }) => (
  <img src={imgLogo} className={`${className} object-cover rounded`} alt="Logo" />
);
const CustomHomeIcon = ({
  className = "w-6 h-6",
  active = false,
}: {
  className?: string;
  active?: boolean;
}) => <Home className={`${className} ${active ? "text-blue-600" : "text-gray-400"}`} />;
const CustomSearchIcon = ({
  className = "w-6 h-6",
  active,
}: {
  className?: string;
  active?: boolean;
}) => (
  <img
    src={imgSearch}
    className={`${className} object-cover rounded-full ${active ? "ring-2 ring-blue-500" : ""}`}
    alt="Search"
  />
);
const CustomUserIcon = ({
  className = "w-6 h-6",
  active = false,
}: {
  className?: string;
  active?: boolean;
}) => (
  <img
    src={imgUser}
    className={`${className} object-cover rounded-full ${active ? "ring-2 ring-blue-500" : ""}`}
    alt="User"
  />
);
const CustomStarIcon = ({
  className = "w-6 h-6",
  active = false,
}: {
  className?: string;
  active?: boolean;
}) => (
  <img
    src={imgStar}
    className={`${className} object-cover rounded-full ${active ? "ring-2 ring-yellow-400" : ""}`}
    alt="Star"
  />
);
const CustomSettingsIcon = ({
  className = "w-6 h-6",
  active,
}: {
  className?: string;
  active?: boolean;
}) => (
  <img
    src={imgSettings}
    className={`${className} object-cover rounded-full ${active ? "ring-2 ring-gray-400" : ""}`}
    alt="Settings"
  />
);

const MOCK_TAGS = ["理科", "歴史", "数学", "国語", "英語", "プログラミング", "雑学"];

const THUMBNAIL_COLORS = [
  { id: "blue", label: "ブルー", bg: "bg-blue-100", text: "text-blue-400" },
  { id: "green", label: "グリーン", bg: "bg-green-100", text: "text-green-400" },
  { id: "purple", label: "パープル", bg: "bg-purple-100", text: "text-purple-400" },
  { id: "orange", label: "オレンジ", bg: "bg-orange-100", text: "text-orange-400" },
  { id: "pink", label: "ピンク", bg: "bg-pink-100", text: "text-pink-400" },
  { id: "teal", label: "ティール", bg: "bg-teal-100", text: "text-teal-400" },
];
const getThumbnailColor = (colorId: string | null) =>
  THUMBNAIL_COLORS.find((c) => c.id === colorId) ?? THUMBNAIL_COLORS[0];

const VIEW_TO_PATH: Record<string, string> = {
  home: "/",
  search: "/search",
  settings: "/settings",
  writers: "/writers",
  favorites: "/favorites",
  about: "/about",
  privacy: "/privacy",
  terms: "/terms",
  contact: "/contact",
  writerDash: "/writer-dash",
  writerNew: "/writer-dash/new",
  writerEdit: "/writer-dash/edit",
  writerSeries: "/writer-dash/series",
  editorArticles: "/editor-dash/articles",
  editorRecommend: "/editor-dash/recommend",
  editorWriters: "/editor-dash/writers",
  editorDash: "/editor-dash",
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
};

function parseLocation(pathname: string): { currentView: string; viewParam: string | null } {
  if (pathname === "/" || pathname === "") return { currentView: "home", viewParam: null };
  if (pathname === "/search") return { currentView: "search", viewParam: null };
  if (pathname === "/settings") return { currentView: "settings", viewParam: null };
  if (pathname === "/favorites") return { currentView: "favorites", viewParam: null };
  if (pathname === "/about") return { currentView: "about", viewParam: null };
  if (pathname === "/privacy") return { currentView: "privacy", viewParam: null };
  if (pathname === "/terms") return { currentView: "terms", viewParam: null };
  if (pathname === "/contact") return { currentView: "contact", viewParam: null };
  if (pathname === "/writer-dash") return { currentView: "writerDash", viewParam: null };
  if (pathname === "/writer-dash/new") return { currentView: "writerNew", viewParam: null };
  if (pathname === "/writer-dash/series") return { currentView: "writerSeries", viewParam: null };
  const writerEditMatch = pathname.match(/^\/writer-dash\/edit\/(.+)$/);
  if (writerEditMatch) return { currentView: "writerEdit", viewParam: writerEditMatch[1] };
  if (pathname === "/editor-dash") return { currentView: "editorDash", viewParam: null };
  if (pathname === "/editor-dash/articles")
    return { currentView: "editorArticles", viewParam: null };
  if (pathname === "/editor-dash/recommend")
    return { currentView: "editorRecommend", viewParam: null };
  if (pathname === "/editor-dash/writers") return { currentView: "editorWriters", viewParam: null };
  if (pathname === "/login") return { currentView: "login", viewParam: null };
  if (pathname === "/register") return { currentView: "register", viewParam: null };
  if (pathname === "/forgot-password") return { currentView: "forgotPassword", viewParam: null };
  if (pathname === "/reset-password") return { currentView: "resetPassword", viewParam: null };
  if (pathname === "/writers") return { currentView: "writers", viewParam: null };
  const writersMatch = pathname.match(/^\/writers\/(.+)$/);
  if (writersMatch) return { currentView: "profile", viewParam: writersMatch[1] };
  const articleMatch = pathname.match(/^\/articles\/(.+)$/);
  if (articleMatch) return { currentView: "article", viewParam: articleMatch[1] };
  return { currentView: "notFound", viewParam: null };
}

const ArticleEditorTabs = ({
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
const ArticleEditorPage = ({
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
}: {
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
}) => {
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

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      showToast("10MB以下の画像を選択してください");
      return;
    }
    setThumbnailUploading(true);
    const ext = file.name.split(".").pop();
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
                className="text-sm text-gray-700 leading-loose prose prose-sm max-w-none"
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
                        accept="image/*"
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

export default function App() {
  const location = useLocation();
  const nav = useNavigate();
  const { currentView, viewParam } = useMemo(
    () => parseLocation(location.pathname),
    [location.pathname],
  );

  const [userRole, setUserRole] = useState<"guest" | "viewer" | "writer" | "editor">("guest");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data: { session } }) => {
      // プロフィール取得は onAuthStateChange に一本化
      if (!session?.user) setAuthLoading(false);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single()
          .then(
            ({ data }) => {
              if (data) {
                const meta = session.user.user_metadata ?? {};
                const updates: Record<string, string> = {};
                const displayName = meta.display_name || meta.full_name || meta.name;
                if (!data.display_name && displayName) updates.display_name = displayName;
                if (!data.username && meta.username) updates.username = meta.username;
                if (!data.avatar_url && meta.avatar_url) updates.avatar_url = meta.avatar_url;
                if (Object.keys(updates).length > 0) {
                  void supabase
                    .from("profiles")
                    .update(updates)
                    .eq("id", session.user.id)
                    .then(({ data: updated }) => {
                      if (updated) Object.assign(data, updates);
                    });
                  Object.assign(data, updates);
                }
                setProfile(data);
                setUserRole(data.role);
              } else {
                // プロフィールがDBに存在しない場合の初期データフォールバック
                const meta = session.user.user_metadata ?? {};
                const displayName = meta.display_name || meta.full_name || meta.name || null;
                setProfile({
                  id: session.user.id,
                  email: session.user.email ?? "",
                  role: "viewer",
                  display_name: displayName,
                  username: null,
                  avatar_url: meta.avatar_url ?? null,
                });
                setUserRole("viewer");
              }
              setAuthLoading(false);
            },
            () => {
              // エラー時（DB未作成などの場合）もフォールバック
              const meta = session.user.user_metadata ?? {};
              const displayName = meta.display_name || meta.full_name || meta.name || null;
              setProfile({
                id: session.user.id,
                email: session.user.email ?? "",
                role: "viewer",
                display_name: displayName,
                username: null,
                avatar_url: meta.avatar_url ?? null,
              });
              setUserRole("viewer");
              setAuthLoading(false);
            },
          );
      } else {
        setProfile(null);
        setUserRole("guest");
        setAuthLoading(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const currentUserId = profile?.id ?? "";
  const [writers, setWriters] = useState<Profile[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  useEffect(() => {
    void supabase
      .from("series")
      .select("*")
      .then(({ data }) => {
        if (data) {
          setSeriesList(
            data.map((s) => ({
              id: s.id,
              title: s.title,
              description: s.description ?? null,
              writerId: s.writer_id,
            })),
          );
        }
      });
  }, []);

  useEffect(() => {
    void supabase
      .from("profiles")
      .select("*")
      .then(({ data }) => {
        if (data) setWriters(data as Profile[]);
      });
  }, []);

  useEffect(() => {
    void supabase
      .from("articles")
      .select("*")
      .then(({ data }) => {
        if (data) {
          setArticles(
            data.map((a) => ({
              id: a.id,
              title: a.title,
              thumbnail: a.thumbnail,
              thumbnailUrl: a.thumbnail_url ?? null,
              thumbnailColor: a.thumbnail_color ?? "blue",
              writerId: a.writer_id,
              views: a.views,
              likes: a.likes,
              tags: a.tags,
              isRecommended: a.is_recommended,
              isPopular: a.is_popular,
              status: a.status,
              content: a.content,
              seriesId: a.series_id ?? null,
              episodeNumber: a.episode_number ?? null,
            })),
          );
        }
      });
  }, []);
  const [fontSize, setFontSize] = useState("medium");
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    if (userRole === "guest" || !currentUserId) return;
    void supabase
      .from("favorites")
      .select("article_id")
      .eq("user_id", currentUserId)
      .then(({ data }) => {
        if (data) setFavorites(data.map((f) => f.article_id));
      });
  }, [userRole, currentUserId]);

  // views カウントアップ（セッション内で同じ記事は1回だけ）
  const [draftTitle, setDraftTitle] = useState("");
  const [draftContent, setDraftContent] = useState("");
  const [draftColor, setDraftColor] = useState("blue");
  const [draftTags, setDraftTags] = useState<string[]>([]);
  const [draftSeriesId, setDraftSeriesId] = useState("");
  const [draftEpisodeNumber, setDraftEpisodeNumber] = useState("");
  const [draftThumbnailUrl, setDraftThumbnailUrl] = useState<string | null>(null);
  const [draftSummary, setDraftSummary] = useState("");
  const [draftTagInput, setDraftTagInput] = useState("");
  const [editorSaving, setEditorSaving] = useState(false);
  const [editorShowPreview, setEditorShowPreview] = useState(false);
  const [editorThumbnailUploading, setEditorThumbnailUploading] = useState(false);
  const viewedArticleIds = useMemo(() => new Set<string>(), []);
  useEffect(() => {
    if (currentView !== "article" || !viewParam) return;
    if (viewedArticleIds.has(viewParam)) return;
    const article = articles.find((a) => a.id === viewParam);
    if (!article) return;
    viewedArticleIds.add(viewParam);
    supabase
      .from("articles")
      .update({ views: article.views + 1 })
      .eq("id", article.id)
      .then(({ error }) => {
        if (error) console.error("views update error:", error);
      });
    setArticles((prev) =>
      prev.map((a) => (a.id === article.id ? { ...a, views: a.views + 1 } : a)),
    );
  }, [currentView, viewParam, articles]);

  // ページタイトル更新
  useEffect(() => {
    const titles: Record<string, string> = {
      home: "SHARE Quest | 学びの『楽しい！』をつなげる",
      article: articles.find((a) => a.id === viewParam)?.title
        ? `${articles.find((a) => a.id === viewParam)!.title} | SHARE Quest`
        : "記事 | SHARE Quest",
      search: "検索 | SHARE Quest",
      writers: "ライター一覧 | SHARE Quest",
      profile: "プロフィール | SHARE Quest",
      favorites: "お気に入り | SHARE Quest",
      settings: "設定 | SHARE Quest",
      about: "About Us | SHARE Quest",
      writerDash: "記事を作成 | SHARE Quest",
      writerSeries: "連載管理 | SHARE Quest",
      writerNew: "新規記事作成 | SHARE Quest",
      writerEdit: "記事を編集 | SHARE Quest",
      editorDash: "編集長ダッシュボード | SHARE Quest",
      editorArticles: "全記事管理 | SHARE Quest",
      editorRecommend: "おすすめ設定 | SHARE Quest",
      editorWriters: "ライター管理 | SHARE Quest",
      login: "ログイン | SHARE Quest",
      register: "アカウント登録 | SHARE Quest",
      privacy: "プライバシーポリシー | SHARE Quest",
      terms: "利用規約 | SHARE Quest",
      contact: "お問い合わせ | SHARE Quest",
      notFound: "404 | SHARE Quest",
    };

    const setMeta = (title: string, description: string) => {
      document.title = title;
      const setTag = (sel: string, attr: string, val: string) => {
        const el = document.querySelector(sel);
        if (el) el.setAttribute(attr, val);
      };
      setTag('meta[name="description"]', "content", description);
      setTag('meta[property="og:title"]', "content", title);
      setTag('meta[property="og:description"]', "content", description);
      setTag('meta[name="twitter:title"]', "content", title);
      setTag('meta[name="twitter:description"]', "content", description);
    };

    if (currentView === "article" && viewParam) {
      const article = articles.find((a) => a.id === viewParam);
      if (article) {
        const desc = article.summary
          ? article.summary.slice(0, 120)
          : `${article.title} - SHARE Questの記事`;
        setMeta(`${article.title} | SHARE Quest`, desc);
        return;
      }
    }

    const defaultDesc =
      "SHARE Questは、学びの「楽しい！」をつなげる記事プラットフォームです。ライターと読者をつなぎ、知識と好奇心を共有します。";
    setMeta(titles[currentView] ?? "SHARE Quest", defaultDesc);
  }, [currentView, viewParam, articles]);

  const [toastMessage, setToastMessage] = useState("");
  if (authLoading)
    return (
      <div className="flex items-center justify-center h-screen text-gray-400">読み込み中...</div>
    );

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const navigate = (view: string, param: string | null = null) => {
    if (view === "profile" && param) {
      const w = writers.find((wr) => wr.id === param);
      nav(`/writers/${w?.username ?? param}`);
    } else if (view === "article" && param) nav(`/articles/${param}`);
    else if (view === "writerEdit" && param) nav(`/writer-dash/edit/${param}`);
    else nav(VIEW_TO_PATH[view] ?? "/");
    window.scrollTo(0, 0);
  };

  const getFontSizeClass = () =>
    ({ small: "text-sm", medium: "text-base", large: "text-lg" })[
      fontSize as "small" | "medium" | "large"
    ] ?? "text-base";

  const toggleFavorite = (articleId: string) => {
    if (userRole === "guest") {
      showToast("お気に入り機能はログインが必要です");
      return;
    }
    if (favorites.includes(articleId)) {
      supabase
        .from("favorites")
        .delete()
        .eq("article_id", articleId)
        .then(({ error }) => {
          if (error) console.error("fav delete:", error);
        });
      setFavorites(favorites.filter((id) => id !== articleId));
      supabase.rpc("decrement_likes", { p_article_id: articleId }).then(({ error }) => {
        if (error) console.error("likes dec:", error);
      });
      setArticles((prev) =>
        prev.map((a) => (a.id === articleId ? { ...a, likes: Math.max(0, a.likes - 1) } : a)),
      );
      showToast("お気に入りから削除しました");
    } else {
      supabase
        .from("favorites")
        .insert({ article_id: articleId, user_id: currentUserId })
        .then(({ error }) => {
          if (error) console.error("fav insert:", error);
        });
      setFavorites([...favorites, articleId]);
      supabase.rpc("increment_likes", { p_article_id: articleId }).then(({ error }) => {
        if (error) console.error("likes inc:", error);
      });
      setArticles((prev) =>
        prev.map((a) => (a.id === articleId ? { ...a, likes: a.likes + 1 } : a)),
      );
      showToast("お気に入りに登録しました");
    }
  };

  // --- Header ---
  const Header = () => (
    <header className="sticky top-0 z-50 bg-white border-b shadow-sm w-full">
      <div className="flex items-center justify-center sm:justify-between px-4 md:px-8 py-1.5 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("home")}>
          <LogoIcon className="w-8 h-8" />
          <img src={imgTitle} className="h-10 object-contain inline-block" alt="SHARE Quest" />
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => navigate("home")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors ${currentView === "home" ? "bg-gray-50" : ""}`}
          >
            <CustomHomeIcon active={currentView === "home"} />
            <span
              className={`text-sm font-bold ${currentView === "home" ? "text-blue-600" : "text-gray-600"}`}
            >
              トップ
            </span>
          </button>
          <button
            onClick={() => navigate("search")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors ${currentView === "search" ? "bg-gray-50" : ""}`}
          >
            <CustomSearchIcon active={currentView === "search"} />
            <span
              className={`text-sm font-bold ${currentView === "search" ? "text-blue-600" : "text-gray-600"}`}
            >
              探す
            </span>
          </button>
          <button
            onClick={() => navigate("writers")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors ${currentView === "writers" || currentView === "profile" ? "bg-gray-50" : ""}`}
          >
            <CustomUserIcon active={currentView === "writers" || currentView === "profile"} />
            <span
              className={`text-sm font-bold ${currentView === "writers" || currentView === "profile" ? "text-blue-600" : "text-gray-600"}`}
            >
              ライター
            </span>
          </button>
          <button
            onClick={() => navigate("favorites")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors ${currentView === "favorites" ? "bg-gray-50" : ""}`}
          >
            <CustomStarIcon active={currentView === "favorites"} />
            <span
              className={`text-sm font-bold ${currentView === "favorites" ? "text-blue-600" : "text-gray-600"}`}
            >
              お気に入り
            </span>
          </button>
          <button
            onClick={() => navigate("settings")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors ${["settings", "writerDash", "editorDash"].includes(currentView) ? "bg-gray-50" : ""}`}
          >
            <CustomSettingsIcon
              active={
                currentView === "settings" ||
                currentView === "writerDash" ||
                currentView === "editorDash"
              }
            />
            <span
              className={`text-sm font-bold ${["settings", "writerDash", "editorDash"].includes(currentView) ? "text-blue-600" : "text-gray-600"}`}
            >
              設定
            </span>
          </button>
        </div>
      </div>
    </header>
  );

  // --- MobileNav ---
  const MobileNav = () => (
    <nav className="sm:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 flex items-center justify-around pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 z-50">
      <button
        onClick={() => navigate("home")}
        className="flex flex-col items-center justify-center gap-1 w-16"
      >
        <CustomHomeIcon active={currentView === "home"} />
        <span
          className={`text-[10px] ${currentView === "home" ? "text-blue-600 font-bold" : "text-gray-500"}`}
        >
          トップ
        </span>
      </button>
      <button
        onClick={() => navigate("search")}
        className="flex flex-col items-center justify-center gap-1 w-16"
      >
        <CustomSearchIcon active={currentView === "search"} />
        <span
          className={`text-[10px] ${currentView === "search" ? "text-blue-600 font-bold" : "text-gray-500"}`}
        >
          探す
        </span>
      </button>
      <button
        onClick={() => navigate("writers")}
        className="flex flex-col items-center justify-center gap-1 w-16"
      >
        <CustomUserIcon active={currentView === "writers" || currentView === "profile"} />
        <span
          className={`text-[10px] ${currentView === "writers" || currentView === "profile" ? "text-blue-600 font-bold" : "text-gray-500"}`}
        >
          ライター
        </span>
      </button>
      <button
        onClick={() => navigate("favorites")}
        className="flex flex-col items-center justify-center gap-1 w-16"
      >
        <CustomStarIcon active={currentView === "favorites"} />
        <span
          className={`text-[10px] ${currentView === "favorites" ? "text-blue-600 font-bold" : "text-gray-500"}`}
        >
          お気に入り
        </span>
      </button>
      <button
        onClick={() => navigate("settings")}
        className="flex flex-col items-center justify-center gap-1 w-16"
      >
        <CustomSettingsIcon
          active={
            currentView === "settings" ||
            currentView === "writerDash" ||
            currentView === "editorDash"
          }
        />
        <span
          className={`text-[10px] ${["settings", "writerDash", "editorDash"].includes(currentView) ? "text-blue-600 font-bold" : "text-gray-500"}`}
        >
          設定
        </span>
      </button>
    </nav>
  );

  // --- ArticleCard ---
  const ArticleCard = ({
    article,
    layout = "horizontal",
  }: {
    article: Article;
    layout?: "horizontal" | "vertical";
  }) => {
    const writer = writers.find((w) => w.id === article.writerId);
    const isFav = favorites.includes(article.id);
    return (
      <div
        className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden cursor-pointer active:scale-[0.98] transition-transform ${layout === "horizontal" ? "flex h-28" : "flex flex-col"}`}
        onClick={() => navigate("article", article.id)}
      >
        {(() => {
          const color = getThumbnailColor(article.thumbnailColor ?? null);
          return article.thumbnailUrl ? (
            <div
              className={`${layout === "horizontal" ? "w-1/3 min-w-[110px] h-full" : "w-full"} overflow-hidden bg-gray-50`}
              style={layout !== "horizontal" ? { aspectRatio: "16/9" } : {}}
            >
              <img
                src={article.thumbnailUrl}
                alt={article.title}
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div
              className={`${color.bg} ${layout === "horizontal" ? "w-1/3 min-w-[110px]" : "w-full"} flex items-center justify-center`}
              style={layout !== "horizontal" ? { aspectRatio: "16/9" } : {}}
            >
              <LogoIcon className="w-10 h-10 opacity-40" />
            </div>
          );
        })()}
        <div
          className={`p-3 flex flex-col justify-between ${layout === "horizontal" ? "w-2/3" : "w-full"}`}
        >
          <h3 className="font-bold text-gray-800 line-clamp-2 text-sm md:text-base leading-snug">
            {article.title}
          </h3>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500 flex items-center gap-1 truncate max-w-[70%]">
              <CustomUserIcon className="w-4 h-4" /> {writer?.display_name ?? writer?.email}
            </span>
            <CustomStarIcon className="w-5 h-5" active={isFav} />
          </div>
        </div>
      </div>
    );
  };

  // --- HomeView ---
  const HomeView = () => {
    const published = articles.filter((a) => a.status === "published");
    return (
      <div className="p-4 md:p-8 space-y-6 animate-in fade-in duration-300">
        <div className="text-center py-5 bg-blue-50 rounded-xl border border-blue-100 relative overflow-hidden">
          <LogoIcon className="absolute -right-4 -bottom-4 w-24 h-24 opacity-10" />
          <p className="text-blue-600 font-bold tracking-wide">
            ー 学びの『楽しい！』をつなげる ー
          </p>
          <button
            onClick={() => navigate("about")}
            className="text-xs text-blue-500 underline mt-2 hover:text-blue-700"
          >
            SHARE Questとは？
          </button>
        </div>
        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <img src={imgRecommend} className="w-6 h-6 object-contain" alt="おすすめ" />{" "}
            おすすめの記事
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar md:grid md:grid-cols-3 md:overflow-visible md:pb-0">
            {published.filter((a) => a.isRecommended).length === 0 ? (
              <p className="text-gray-400 text-sm py-4">まだおすすめ記事はありません</p>
            ) : (
              published
                .filter((a) => a.isRecommended)
                .map((article) => (
                  <div key={article.id} className="min-w-[240px] snap-start md:min-w-0">
                    <ArticleCard article={article} layout="vertical" />
                  </div>
                ))
            )}
          </div>
        </section>
        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span className="text-red-500 font-bold text-xl">🔥</span> 人気の記事
          </h2>
          <div className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
            {published.filter((a) => a.isPopular).length === 0 ? (
              <p className="text-gray-400 text-sm py-4">まだ人気記事はありません</p>
            ) : (
              published
                .filter((a) => a.isPopular)
                .map((article) => <ArticleCard key={article.id} article={article} />)
            )}
          </div>
        </section>
        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-3">記事一覧</h2>
          <div className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
            {published.length === 0 ? (
              <p className="text-gray-400 text-sm py-4">まだ公開記事はありません</p>
            ) : (
              published.map((article) => <ArticleCard key={article.id} article={article} />)
            )}
          </div>
        </section>
      </div>
    );
  };

  // --- ArticleView ---
  const ArticleView = () => {
    const article = articles.find((a) => a.id === viewParam);
    if (!article) return <div className="p-10 text-center">記事が見つかりません</div>;
    const writer = writers.find((w) => w.id === article.writerId);
    const isFav = favorites.includes(article.id);
    const articleUrl = `${window.location.origin}/articles/${article.id}`;
    const color = getThumbnailColor(article.thumbnailColor ?? null);
    return (
      <div className="animate-in slide-in-from-right-8 duration-300 bg-white min-h-screen">
        <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b px-2 py-2 flex items-center">
          <button
            onClick={() => navigate("home")}
            className="p-2 rounded-full hover:bg-gray-100 flex items-center"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
            <span className="text-sm font-bold text-gray-600">戻る</span>
          </button>
        </div>
        {article.thumbnailUrl ? (
          <div className="w-full bg-gray-50" style={{ aspectRatio: "16/9" }}>
            <img
              src={article.thumbnailUrl}
              alt={article.title}
              className="w-full h-full object-contain"
            />
          </div>
        ) : (
          <div
            className={`${color.bg} w-full flex items-center justify-center`}
            style={{ aspectRatio: "16/9" }}
          >
            <LogoIcon className="w-20 h-20 opacity-20" />
          </div>
        )}
        <div className="p-4 md:p-8 space-y-5 max-w-3xl mx-auto">
          {article.seriesId &&
            (() => {
              const series = seriesList.find((s) => s.id === article.seriesId);
              if (!series) return null;
              return (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                    連載
                  </span>
                  <span className="text-sm font-bold text-blue-600">{series.title}</span>
                  {article.episodeNumber != null && (
                    <span className="text-xs text-gray-400">第{article.episodeNumber}話</span>
                  )}
                </div>
              );
            })()}
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">{article.title}</h1>
          {article.summary && (
            <div className="bg-blue-50 p-4 rounded-xl text-gray-700 border border-blue-100 font-medium">
              {article.summary}
            </div>
          )}
          <div className="flex flex-wrap items-center justify-between gap-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md">
                <Eye className="w-4 h-4" /> {article.views}
              </span>
              <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md">
                <CustomStarIcon className="w-4 h-4" active={isFav} /> {article.likes}
              </span>
            </div>
            <button
              onClick={() => toggleFavorite(article.id)}
              className={`p-2 rounded-full border shadow-sm transition-all ${isFav ? "bg-yellow-50 border-yellow-300 scale-110" : "bg-white border-gray-200"}`}
            >
              <CustomStarIcon className="w-6 h-6" active={isFav} />
            </button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {(article.tags ?? []).map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full border border-gray-200"
              >
                #{tag}
              </span>
            ))}
          </div>
          {writer && (
            <div
              className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl shadow-sm cursor-pointer hover:bg-gray-50"
              onClick={() => navigate("profile", writer.id)}
            >
              <div className="flex items-center gap-3">
                <div className="bg-gray-100 p-2 rounded-full border border-gray-200">
                  {writer.avatar_url ? (
                    <img
                      src={writer.avatar_url}
                      className="w-8 h-8 rounded-full object-cover"
                      alt=""
                    />
                  ) : (
                    <CustomUserIcon className="w-8 h-8" />
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold mb-0.5">この記事を書いた人</p>
                  <p className="font-bold text-gray-800">{writer.display_name ?? writer.email}</p>
                </div>
              </div>
              <span className="text-xs font-bold text-blue-500 bg-blue-50 px-3 py-1 rounded-full">
                プロフィールへ
              </span>
            </div>
          )}
          <div
            className={`py-4 text-gray-800 whitespace-pre-wrap leading-loose ${getFontSizeClass()}`}
          >
            {article.content ? (
              <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.content) }} />
            ) : (
              <span className="text-gray-400 italic">本文はまだ書かれていません</span>
            )}
          </div>
          <div className="border-t pt-8 pb-4 space-y-4">
            <p className="font-bold text-gray-800 text-center">この記事を共有</p>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              <button
                onClick={() =>
                  window.open(
                    `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${article.title} | ${writer?.display_name ?? "SHARE Quest"} From SHARE Quest`)}&url=${encodeURIComponent(articleUrl)}&via=SHARE_Quest_Off`,
                    "_blank",
                  )
                }
                className="w-14 h-14 bg-black text-white rounded-full flex items-center justify-center hover:opacity-80 shadow-md"
              >
                <span className="font-bold text-2xl">X</span>
              </button>
              <button
                onClick={() =>
                  window.open(
                    `https://line.me/R/msg/text/?${encodeURIComponent(`${article.title} | ${writer?.display_name ?? "SHARE Quest"} From SHARE Quest\n${articleUrl}`)}`,
                    "_blank",
                  )
                }
                className="w-14 h-14 bg-green-500 text-white rounded-full flex items-center justify-center hover:opacity-80 shadow-md"
              >
                <span className="font-bold text-sm">LINE</span>
              </button>
              <button
                onClick={() => {
                  void navigator.clipboard.writeText(articleUrl);
                  showToast("リンクをコピーしました");
                }}
                className="w-14 h-14 bg-white border-2 border-gray-200 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-50 shadow-sm"
              >
                <Share2 className="w-6 h-6" />
              </button>
            </div>
          </div>
          <p className="text-center text-xs text-gray-400">※コメント機能は利用できません</p>
        </div>
      </div>
    );
  };

  // --- SearchView ---
  const SearchView = () => {
    const [keyword, setKeyword] = useState("");
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [selectedWriterIds, setSelectedWriterIds] = useState<string[]>([]);

    const allTags = Array.from(new Set(articles.flatMap((a) => a.tags ?? []))).filter(Boolean);
    const displayTags = allTags.length > 0 ? allTags : MOCK_TAGS;

    const results = articles.filter((a) => {
      if (a.status !== "published") return false;
      if (
        keyword &&
        !a.title.toLowerCase().includes(keyword.toLowerCase()) &&
        !(a.content ?? "").toLowerCase().includes(keyword.toLowerCase())
      )
        return false;
      if (selectedTags.length > 0 && !selectedTags.some((t) => (a.tags ?? []).includes(t)))
        return false;
      if (selectedWriterIds.length > 0 && !selectedWriterIds.includes(a.writerId)) return false;
      return true;
    });

    const toggleTag = (tag: string) =>
      setSelectedTags((prev) =>
        prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
      );
    const toggleWriter = (id: string) =>
      setSelectedWriterIds((prev) =>
        prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id],
      );
    const hasFilter = keyword || selectedTags.length > 0 || selectedWriterIds.length > 0;

    return (
      <div className="p-4 md:p-8 space-y-6 animate-in fade-in duration-300">
        <div className="md:grid md:grid-cols-[280px_1fr] md:gap-6 md:items-start space-y-4 md:space-y-0">
          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                placeholder="キーワードで検索"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 transition-all outline-none font-bold text-gray-700 shadow-sm"
              />
              <div className="absolute left-3 top-3.5">
                <CustomSearchIcon className="w-7 h-7" />
              </div>
              {keyword && (
                <button
                  onClick={() => setKeyword("")}
                  className="absolute right-3 top-4 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            <section className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-sm font-bold text-gray-500 mb-3 border-b pb-2">タグでしぼる</h3>
              <div className="flex flex-wrap gap-2">
                {displayTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 border rounded-lg text-sm font-bold transition-colors ${selectedTags.includes(tag) ? "bg-blue-500 border-blue-500 text-white" : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600"}`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </section>
            <section className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-sm font-bold text-gray-500 mb-3 border-b pb-2">
                ライターでしぼる
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {writers
                  .filter((w) => w.role === "writer" || w.role === "editor")
                  .sort((a, b) => {
                    const rank = (w: typeof a) => {
                      if ((w.display_name ?? "").includes("SHARE Quest編集部")) return 0;
                      if (w.role === "editor") return 1;
                      return 2;
                    };
                    const ra = rank(a),
                      rb = rank(b);
                    if (ra !== rb) return ra - rb;
                    return (a.display_name ?? "").localeCompare(b.display_name ?? "", "ja");
                  })
                  .map((w) => (
                    <button
                      key={w.id}
                      onClick={() => toggleWriter(w.id)}
                      className={`flex items-center gap-2 p-2 border rounded-lg text-left transition-colors ${selectedWriterIds.includes(w.id) ? "bg-blue-50 border-blue-400" : "bg-gray-50 border-gray-200 hover:bg-blue-50 hover:border-blue-200"}`}
                    >
                      {w.avatar_url ? (
                        <img
                          src={w.avatar_url}
                          className="w-6 h-6 rounded-full object-cover"
                          alt=""
                        />
                      ) : (
                        <CustomUserIcon className="w-6 h-6" />
                      )}
                      <span className="text-sm font-bold text-gray-700 truncate">
                        {w.display_name ?? w.email}
                      </span>
                    </button>
                  ))}
              </div>
            </section>
            {hasFilter && (
              <button
                onClick={() => {
                  setKeyword("");
                  setSelectedTags([]);
                  setSelectedWriterIds([]);
                }}
                className="w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-xl border border-gray-200 hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <X className="w-5 h-5" />
                フィルターをリセット
              </button>
            )}
          </div>
          <div>
            {hasFilter && (
              <div>
                <div className="mb-3">
                  <p className="font-bold text-gray-700">検索結果 ({results.length}件)</p>
                </div>
                <div className="space-y-3">
                  {results.length === 0 ? (
                    <p className="text-gray-500 text-center py-8 bg-white rounded-xl border">
                      該当する記事が見つかりませんでした
                    </p>
                  ) : (
                    results.map((a) => <ArticleCard key={a.id} article={a} />)
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // --- WritersView ---
  const WritersView = () => {
    const editors = writers.filter((w) => w.role === "editor");
    const writerList = writers.filter((w) => w.role === "writer");
    const WriterRow = ({ w }: { w: Profile }) => (
      <div
        className="flex items-center justify-between p-4 bg-white border-b last:border-b-0 md:border md:border-gray-200 md:rounded-xl md:last:border-b md:m-2 cursor-pointer hover:bg-blue-50 transition-colors"
        onClick={() => navigate("profile", w.id)}
      >
        <div className="flex items-center gap-4">
          <div className="bg-gray-100 rounded-full border border-gray-200 overflow-hidden w-12 h-12 flex items-center justify-center">
            {w.avatar_url ? (
              <img src={w.avatar_url} className="w-12 h-12 object-cover" alt="" />
            ) : (
              <CustomUserIcon className="w-8 h-8" />
            )}
          </div>
          <div>
            <p className="font-bold text-gray-800 text-lg">{w.display_name ?? w.email}</p>
            <p className="text-xs font-bold text-blue-500">
              {w.role === "editor" ? "編集長" : "ライター"}
            </p>
          </div>
        </div>
        <span className="text-sm font-bold text-gray-500 flex items-center">
          記事一覧 <ChevronLeft className="w-4 h-4 rotate-180 ml-1" />
        </span>
      </div>
    );
    return (
      <div className="p-4 md:p-8 space-y-6 animate-in fade-in duration-300">
        {editors.length > 0 && (
          <section>
            <h3 className="text-sm font-bold text-gray-500 mb-2 pl-2">編集長</h3>
            <div className="rounded-xl md:grid md:grid-cols-2 md:gap-3 md:overflow-visible md:bg-transparent md:border-0 md:shadow-none">
              {editors.map((w) => (
                <WriterRow key={w.id} w={w} />
              ))}
            </div>
          </section>
        )}
        <section>
          <h3 className="text-sm font-bold text-gray-500 mb-2 pl-2">ライター</h3>
          <div className="rounded-xl md:grid md:grid-cols-2 md:gap-3 md:overflow-visible md:bg-transparent md:border-0 md:shadow-none">
            {writerList.length > 0 ? (
              writerList.map((w) => <WriterRow key={w.id} w={w} />)
            ) : (
              <p className="text-sm text-gray-400 text-center py-6">ライターがまだいません</p>
            )}
          </div>
        </section>
      </div>
    );
  };

  // --- ProfileView ---
  const ProfileView = () => {
    const writer = writers.find((w) => w.id === viewParam || w.username === viewParam);
    if (!writer)
      return <div className="p-10 text-center text-gray-500">プロフィールが見つかりません</div>;
    const writerArticles = articles.filter(
      (a) => a.writerId === writer.id && a.status === "published",
    );
    return (
      <div className="animate-in slide-in-from-right-8 duration-300">
        <div className="bg-gradient-to-b from-blue-500 to-blue-700 pt-12 pb-8 px-4 text-center text-white relative">
          <button
            onClick={() => navigate("writers")}
            className="absolute top-4 left-4 p-2 rounded-full bg-black/20 hover:bg-black/30 flex items-center gap-1"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
            <span className="text-xs font-bold">戻る</span>
          </button>
          <div className="w-24 h-24 bg-white rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg border-4 border-white overflow-hidden">
            {writer.avatar_url ? (
              <img src={writer.avatar_url} className="w-24 h-24 object-cover" alt="" />
            ) : (
              <CustomUserIcon className="w-16 h-16" />
            )}
          </div>
          <h2 className="text-2xl font-bold mb-1">{writer.display_name ?? writer.email}</h2>
          <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm font-bold backdrop-blur-sm">
            {writer.role === "editor" ? "編集長" : "ライター"}
          </span>
        </div>
        <div className="p-4 md:p-8 space-y-6 -mt-4 relative z-10">
          {writer.bio && (
            <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100 text-gray-700 text-sm font-medium leading-relaxed">
              {writer.bio}
            </div>
          )}
          <section className={!writer.bio ? "mt-6" : ""}>
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="bg-blue-100 p-1.5 rounded-lg">
                <LogoIcon className="w-5 h-5" />
              </span>
              この人の記事 ({writerArticles.length}件)
            </h3>
            <div className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
              {writerArticles.length > 0 ? (
                writerArticles.map((article) => <ArticleCard key={article.id} article={article} />)
              ) : (
                <p className="text-gray-500 text-sm text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                  まだ記事がありません
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    );
  };

  // --- FavoritesView ---
  const FavoritesView = () => {
    const favArticles = articles.filter(
      (a) => favorites.includes(a.id) && a.status === "published",
    );
    return (
      <div className="p-4 md:p-8 space-y-6 animate-in fade-in duration-300">
        {userRole === "guest" ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm">
            <CustomStarIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-gray-600 font-bold mb-2">ログインが必要です</p>
            <p className="text-sm text-gray-400 mb-6">
              お気に入り機能を利用するには
              <br />
              ログインしてください。
            </p>
            <button
              onClick={() => navigate("login")}
              className="px-6 py-3 bg-blue-600 text-white rounded-full font-bold shadow-md hover:bg-blue-700"
            >
              ログインする
            </button>
          </div>
        ) : favArticles.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm mt-4">
            <p className="text-gray-600 font-bold mb-2">登録されている記事がありません</p>
            <p className="text-sm text-gray-400 mb-6">
              好きな記事を見つけて☆アイコンをタップしましょう
            </p>
            <button
              onClick={() => navigate("home")}
              className="px-6 py-3 border-2 border-blue-500 text-blue-600 rounded-full font-bold hover:bg-blue-50"
            >
              記事を探す
            </button>
          </div>
        ) : (
          <div className="space-y-3 mt-4">
            {favArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    );
  };

  // --- SettingsView ---
  const SettingsView = () => (
    <div className="p-4 md:p-8 space-y-6 animate-in fade-in duration-300">
      {userRole === "guest" && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="font-bold text-blue-800 text-sm">ログインしていません</p>
            <p className="text-xs text-blue-600">ログインするとお気に入り機能が使えます</p>
          </div>
          <button
            onClick={() => navigate("login")}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700"
          >
            ログイン
          </button>
        </div>
      )}
      {userRole !== "guest" && (
        <AvatarUpload
          profile={profile}
          onUpdate={(url) => setProfile((p) => (p ? { ...p, avatar_url: url } : p))}
        />
      )}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {userRole !== "guest" && (
          <>
            <DisplayNameEdit
              profile={profile}
              setProfile={setProfile}
              setWriters={setWriters}
              showToast={showToast}
            />
            <UsernameEdit
              profile={profile}
              setProfile={setProfile}
              setWriters={setWriters}
              showToast={showToast}
            />
            {(userRole === "writer" || userRole === "editor") && (
              <BioEdit
                profile={profile}
                setProfile={setProfile}
                setWriters={setWriters}
                showToast={showToast}
              />
            )}
          </>
        )}
        {userRole !== "guest" && (
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <p className="font-bold text-gray-800 text-sm">
                {profile?.display_name ?? profile?.email}
              </p>
              <p className="text-xs text-gray-500">
                {userRole === "editor" ? "編集長" : userRole === "writer" ? "ライター" : "閲覧者"}
              </p>
            </div>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
              }}
              className="px-4 py-2 bg-red-50 text-red-600 text-sm font-bold rounded-lg border border-red-200 hover:bg-red-100"
            >
              ログアウト
            </button>
          </div>
        )}
        <div className="p-4 flex items-center justify-between">
          <div>
            <p className="font-bold text-gray-800">文字の大きさ</p>
            <p className="text-xs text-gray-500 font-medium">記事本文の表示サイズ</p>
          </div>
          <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-200">
            {["small", "medium", "large"].map((size, i) => {
              const labels = ["小", "中", "大"];
              return (
                <button
                  key={size}
                  onClick={() => setFontSize(size)}
                  className={`px-4 py-1.5 text-sm rounded-md transition-all font-bold ${fontSize === size ? "bg-white shadow text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                >
                  {labels[i]}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      {userRole === "writer" && (
        <button
          onClick={() => nav(-1)}
          className="w-full p-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-bold shadow-md flex items-center justify-between"
        >
          <span>ライター用ダッシュボードを開く</span>
          <ChevronLeft className="w-5 h-5 rotate-180" />
        </button>
      )}
      {userRole === "editor" && (
        <button
          onClick={() => navigate("editorDash")}
          className="w-full p-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-bold shadow-md flex items-center justify-between"
        >
          <span>編集長用ダッシュボードを開く</span>
          <ChevronLeft className="w-5 h-5 rotate-180" />
        </button>
      )}
    </div>
  );

  // --- WriterDashboard ---
  const WriterSeriesPage = () => {
    const [newTitle, setNewTitle] = useState("");
    const [newDesc, setNewDesc] = useState("");
    const [saving, setSaving] = useState(false);
    const [expandedSeriesId, setExpandedSeriesId] = useState<string | null>(null);
    const mySeries = seriesList.filter((s) => s.writerId === currentUserId);

    const handleCreate = async () => {
      if (!newTitle.trim()) {
        showToast("連載名を入力してください");
        return;
      }
      setSaving(true);
      const { data, error } = await supabase
        .from("series")
        .insert({
          title: newTitle.trim(),
          description: newDesc.trim() || null,
          writer_id: currentUserId,
        })
        .select()
        .single();
      if (!error && data) {
        setSeriesList([
          ...seriesList,
          {
            id: data.id,
            title: data.title,
            description: data.description,
            writerId: data.writer_id,
          },
        ]);
        setNewTitle("");
        setNewDesc("");
        showToast("連載を作成しました");
      } else {
        console.error("連載作成エラー:", error);
        showToast("エラーが発生しました。もう一度お試しください。");
      }
      setSaving(false);
    };

    const handleDelete = async (id: string, title: string) => {
      if (
        !window.confirm(`「${title}」を削除しますか？\n連載に紐づく記事の連載設定は解除されます。`)
      )
        return;
      const { error } = await supabase.from("series").delete().eq("id", id);
      if (!error) {
        setSeriesList(seriesList.filter((s) => s.id !== id));
        setArticles(
          articles.map((a) =>
            a.seriesId === id ? { ...a, seriesId: null, episodeNumber: null } : a,
          ),
        );
        showToast("連載を削除しました");
      } else {
        showToast("削除に失敗しました。もう一度お試しください。");
      }
    };

    return (
      <div className="p-4 md:p-8 animate-in slide-in-from-right-8 duration-300">
        <div className="-mx-4 md:-mx-8 -mt-4 md:-mt-8 px-4 md:px-8 bg-white border-b border-gray-200 py-3 flex items-center gap-3 sticky top-0 z-10 shadow-sm mb-6">
          <button
            onClick={() => window.history.back()}
            className="p-2 bg-white rounded-full shadow-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">連載管理</h1>
        </div>

        <div className="md:grid md:grid-cols-2 md:gap-6 md:items-start space-y-6 md:space-y-0">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
            <h2 className="font-bold text-gray-800">新しい連載を作成</h2>
            <input
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="連載名 *"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <textarea
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
              placeholder="連載の説明（任意）"
              rows={3}
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
            />
            <button
              onClick={handleCreate}
              disabled={saving}
              className="w-full bg-blue-500 text-white font-bold py-3 rounded-xl hover:bg-blue-600 disabled:opacity-50"
            >
              {saving ? "作成中..." : "連載を作成"}
            </button>
          </div>
          <div className="space-y-3">
            <h2 className="font-bold text-gray-800">作成済みの連載</h2>
            {mySeries.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">連載はまだありません</p>
            ) : (
              mySeries.map((s) => {
                const seriesArticles = articles
                  .filter((a) => a.seriesId === s.id)
                  .sort((a, b) => (a.episodeNumber ?? 0) - (b.episodeNumber ?? 0));
                const expanded = expandedSeriesId === s.id;
                return (
                  <div
                    key={s.id}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                  >
                    <div className="p-4 flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900">{s.title}</p>
                        {s.description && (
                          <p className="text-sm text-gray-500 mt-0.5">{s.description}</p>
                        )}
                        <button
                          onClick={() => setExpandedSeriesId(expanded ? null : s.id)}
                          className="text-xs text-blue-500 hover:text-blue-700 mt-1 flex items-center gap-1"
                        >
                          {seriesArticles.length}件の記事
                          <span>{expanded ? "▲" : "▼"}</span>
                        </button>
                      </div>
                      <button
                        onClick={() => handleDelete(s.id, s.title)}
                        className="text-red-400 hover:text-red-600 text-sm font-bold shrink-0"
                      >
                        削除
                      </button>
                    </div>
                    {expanded && (
                      <div className="border-t border-gray-100 bg-gray-50 px-4 py-3 space-y-2">
                        {seriesArticles.length === 0 ? (
                          <p className="text-xs text-gray-400 text-center py-2">
                            この連載にはまだ記事がありません
                          </p>
                        ) : (
                          seriesArticles.map((a) => (
                            <div
                              key={a.id}
                              className="flex items-center gap-3 bg-white rounded-xl px-3 py-2 border border-gray-100"
                            >
                              <span className="text-xs text-gray-400 w-8 shrink-0">
                                {a.episodeNumber != null ? `#${a.episodeNumber}` : "—"}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-800 truncate">
                                  {a.title}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {a.status === "published"
                                    ? "公開中"
                                    : a.status === "draft"
                                      ? "下書き"
                                      : "審査中"}
                                </p>
                              </div>
                              <button
                                onClick={() => {
                                  navigate("writerEdit", a.id);
                                }}
                                className="text-xs text-blue-500 hover:text-blue-700 shrink-0"
                              >
                                編集
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    );
  };

  const WriterDashboard = () => {
    const myArticles = articles.filter((a) => a.writerId === currentUserId);

    const openCreate = () => {
      navigate("writerNew");
    };
    const openSeriesManager = () => {
      navigate("writerSeries");
    };

    const openEdit = (article: Article) => {
      navigate("writerEdit", article.id);
    };

    const handleSubmit = async (article: Article) => {
      const { error } = await supabase
        .from("articles")
        .update({ status: "pending" })
        .eq("id", article.id);
      if (!error) {
        setArticles(articles.map((a) => (a.id === article.id ? { ...a, status: "pending" } : a)));
        showToast("投稿申請しました");
      } else {
        showToast("エラーが発生しました。もう一度お試しください。");
      }
    };

    const handleDelete = async (article: Article) => {
      if (!window.confirm(`「${article.title}」を削除しますか？`)) return;
      const { error } = await supabase.from("articles").delete().eq("id", article.id);
      if (!error) {
        setArticles(articles.filter((a) => a.id !== article.id));
        showToast("記事を削除しました");
      } else {
        showToast("エラーが発生しました。もう一度お試しください。");
      }
    };

    const statusLabel = (status: string) => {
      if (status === "published")
        return (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-bold shrink-0">
            公開中
          </span>
        );
      if (status === "pending")
        return (
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold shrink-0">
            申請中
          </span>
        );
      return (
        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-bold shrink-0">
          下書き
        </span>
      );
    };

    return (
      <div className="p-4 space-y-6 animate-in slide-in-from-right-8 duration-300">
        <div className="-mx-4 -mt-4 px-4 bg-white border-b border-gray-200 py-3 flex items-center gap-3 sticky top-0 z-10 shadow-sm mb-6">
          <button
            onClick={() => window.history.back()}
            className="p-2 bg-white rounded-full shadow-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold text-gray-800">記事を作成</h2>
        </div>

        {/* 記事一覧 */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-800">自分の記事 ({myArticles.length}件)</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={openSeriesManager}
                className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm flex items-center gap-1 hover:bg-gray-200"
              >
                連載管理
              </button>
              <button
                onClick={openCreate}
                className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm flex items-center gap-1 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" /> 新規作成
              </button>
            </div>
          </div>
          <div className="space-y-3 md:grid md:grid-cols-2 md:gap-3 md:space-y-0">
            {myArticles.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-8 bg-white rounded-xl border md:col-span-2">
                まだ記事がありません。「新規作成」から始めましょう！
              </p>
            )}
            {myArticles.map((article) => {
              const color = getThumbnailColor(article.thumbnailColor ?? null);
              return (
                <div
                  key={article.id}
                  className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex gap-3"
                >
                  <div
                    className={`${color.bg} w-14 h-14 rounded-lg flex items-center justify-center shrink-0`}
                  >
                    <LogoIcon className="w-8 h-8 opacity-40" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-gray-800 text-sm pr-2 truncate">
                        {article.title}
                      </h4>
                      {statusLabel(article.status)}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => openEdit(article)}
                        className="flex-1 py-1.5 bg-gray-100 text-gray-600 text-xs font-bold rounded hover:bg-gray-200 flex items-center justify-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" /> 編集
                      </button>
                      {article.status === "draft" && (
                        <button
                          onClick={() => void handleSubmit(article)}
                          className="flex-1 py-1.5 bg-blue-50 text-blue-600 text-xs font-bold rounded hover:bg-blue-100 border border-blue-200"
                        >
                          投稿申請
                        </button>
                      )}
                      {article.status !== "published" && (
                        <button
                          onClick={() => void handleDelete(article)}
                          className="py-1.5 px-2 bg-red-50 text-red-500 text-xs font-bold rounded hover:bg-red-100 border border-red-200"
                        >
                          削除
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 記事作成・編集モーダル */}
      </div>
    );
  };

  // --- EditorDashboard ---
  const EditorDashboard = () => {
    const pendingArticles = articles.filter((a) => a.status === "pending");
    return (
      <div className="p-4 space-y-6 animate-in slide-in-from-right-8 duration-300">
        <div className="-mx-4 -mt-4 px-4 bg-white border-b border-gray-200 py-3 flex items-center gap-3 sticky top-0 z-10 shadow-sm mb-6">
          <button
            onClick={() => window.history.back()}
            className="p-2 bg-white rounded-full shadow-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold text-purple-800">編集長ダッシュボード</h2>
        </div>
        {userRole === "editor" && (
          <button
            onClick={() => navigate("writerDash")}
            className="w-full p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-bold shadow-md flex items-center justify-between mb-4"
          >
            <span>記事を書く（ライター機能）</span>
            <ChevronLeft className="w-5 h-5 rotate-180" />
          </button>
        )}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => navigate("editorArticles")}
            className="p-4 bg-white border border-purple-200 rounded-xl shadow-sm text-center font-bold text-purple-700 hover:bg-purple-50"
          >
            全記事の
            <br />
            編集・削除
          </button>
          <button
            onClick={() => navigate("editorRecommend")}
            className="p-4 bg-white border border-purple-200 rounded-xl shadow-sm text-center font-bold text-purple-700 hover:bg-purple-50"
          >
            おすすめ・人気
            <br />
            設定
          </button>
          <button
            onClick={() => navigate("editorWriters")}
            className="p-4 bg-white border border-purple-200 rounded-xl shadow-sm text-center font-bold text-purple-700 hover:bg-purple-50 col-span-2 flex items-center justify-center gap-2"
          >
            <CustomUserIcon className="w-5 h-5" /> 新規ライターの追加
          </button>
        </div>
        <section>
          <h3 className="font-bold text-gray-800 flex items-center gap-2 border-b pb-2 mb-3">
            <AlertCircle className="w-5 h-5 text-orange-500" /> 投稿承認待ち (
            {pendingArticles.length}件)
          </h3>
          <div className="space-y-3">
            {pendingArticles.map((article) => (
              <div
                key={article.id}
                className="bg-orange-50 p-3 rounded-xl border border-orange-200"
              >
                <p className="font-bold text-gray-800 mb-1">{article.title}</p>
                <p className="text-xs text-gray-500 mb-3">
                  申請者: {writers.find((w) => w.id === article.writerId)?.display_name ?? "不明"}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      const { error } = await supabase
                        .from("articles")
                        .update({ status: "published" })
                        .eq("id", article.id);
                      if (!error) {
                        setArticles(
                          articles.map((a) =>
                            a.id === article.id ? { ...a, status: "published" } : a,
                          ),
                        );
                        showToast("記事を公開しました");
                      } else {
                        showToast("エラーが発生しました。もう一度お試しください。");
                      }
                    }}
                    className="flex-1 py-2 bg-green-500 text-white text-sm font-bold rounded-lg hover:bg-green-600 flex items-center justify-center gap-1 shadow-sm"
                  >
                    <Check className="w-4 h-4" /> 許可 (公開)
                  </button>
                  <button
                    onClick={async () => {
                      const { error } = await supabase
                        .from("articles")
                        .update({ status: "draft" })
                        .eq("id", article.id);
                      if (!error) {
                        setArticles(
                          articles.map((a) =>
                            a.id === article.id ? { ...a, status: "draft" } : a,
                          ),
                        );
                        showToast("差し戻しました");
                      } else {
                        showToast("エラーが発生しました。もう一度お試しください。");
                      }
                    }}
                    className="flex-1 py-2 bg-white text-gray-600 border border-gray-300 text-sm font-bold rounded-lg hover:bg-gray-50"
                  >
                    確認・差し戻し
                  </button>
                </div>
              </div>
            ))}
            {pendingArticles.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-6 bg-white rounded-xl border">
                現在、承認待ちの記事はありません。
              </p>
            )}
          </div>
        </section>
      </div>
    );
  };

  // --- AboutView ---
  const AboutView = () => (
    <div className="p-6 space-y-6 animate-in slide-in-from-bottom-4 duration-300 bg-white min-h-screen">
      <div className="text-center py-8">
        <LogoIcon className="w-20 h-20 mx-auto mb-4" />
        <img src={imgTitle} className="h-[72px] object-contain mx-auto mb-2" alt="SHARE Quest" />
        <p className="text-blue-600 font-bold">ー 学びの『楽しい！』をつなげる ー</p>
      </div>
      <div className="space-y-6">
        <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
          <h3 className="font-bold text-gray-800 border-b-2 border-blue-200 pb-2 mb-3 inline-block">
            SHARE Quest とは
          </h3>
          <p className="text-sm text-gray-600 leading-loose">
            　「学びの『楽しい！』をつなげる」をモットーに、ライターによって書かれる記事から、「学ぶこと」の楽しさや面白さを届けるコンテンツです。
          </p>
          <p className="text-sm text-gray-600 leading-loose mt-2">
            　「勉強」という固い縛りではなく、「気になったことを広げたい」、「学ぶこと自体が楽しい」と思えるようなコンテンツを目指しています。
          </p>
        </div>
        <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
          <h3 className="font-bold text-gray-800 border-b-2 border-blue-200 pb-2 mb-3 inline-block">
            主な活動
          </h3>
          <p className="text-sm text-gray-600 leading-loose">
            　SHARE
            Questのライターが、「楽しい」「おもしろい」と感じたことを記事にすることで、その輪を広げています。
          </p>
          <p className="text-sm text-gray-600 leading-loose mt-2">
            　一人でも多くの方に学びの楽しさを伝えられるよう活動しています。
          </p>
        </div>
        <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
          <h3 className="font-bold text-gray-800 border-b-2 border-blue-200 pb-2 mb-3 inline-block">
            ライター
          </h3>
          <div className="mb-3">
            <span className="inline-block text-xs font-bold text-white bg-blue-500 px-2 py-0.5 rounded-full mb-2">
              編集長
            </span>
            <p className="text-sm text-gray-700 font-bold pl-1">三上 類衣　-MIKAMI Rui-</p>
          </div>
          <div>
            <span className="inline-block text-xs font-bold text-white bg-gray-400 px-2 py-0.5 rounded-full mb-2">
              ライター
            </span>
            <ul className="text-sm text-gray-600 space-y-1 pl-1">
              <li>天羽 楽　-TENBA Gaku-</li>
              <li>るーと　-Root-</li>
            </ul>
          </div>
          <button
            onClick={() => navigate("writers")}
            className="mt-3 text-sm text-blue-500 font-bold underline hover:text-blue-700"
          >
            ＞ 編集者一覧へ
          </button>
        </div>
        <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
          <h3 className="font-bold text-gray-800 border-b-2 border-blue-200 pb-2 mb-3 inline-block">
            エンジニア
          </h3>
          <p className="text-sm text-gray-600">・Noimzip</p>
          <p className="text-sm text-gray-600 mt-1">・るーと</p>
        </div>
        <button
          onClick={() => navigate("home")}
          className="w-full py-3 bg-gray-100 font-bold rounded-xl text-gray-600 hover:bg-gray-200"
        >
          ホームへ戻る
        </button>
      </div>
    </div>
  );

  const LoginView = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const nav = useNavigate();

    const handleLogin = async () => {
      setLoading(true);
      setError("");
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError("メールアドレスまたはパスワードが間違っています");
      else nav("/");
      setLoading(false);
    };

    const handleGoogleLogin = async () => {
      setLoading(true);
      setError("");
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) setError(error.message);
      setLoading(false);
    };

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-sm">
          <h1 className="text-2xl font-bold text-center mb-6">ログイン</h1>
          {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
          <div className="space-y-4">
            <input
              type="email"
              placeholder="メールアドレス"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="space-y-1">
              <input
                type="password"
                placeholder="パスワード"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="text-right">
                <button
                  onClick={() => nav("/forgot-password")}
                  className="text-xs text-blue-600 hover:underline font-bold"
                >
                  パスワードをお忘れの方はこちら
                </button>
              </div>
            </div>
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "ログイン中..." : "ログイン"}
            </button>

            <div className="relative my-4 flex py-1 items-center">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink mx-4 text-gray-400 text-xs font-bold">または</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-3 border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 flex items-center justify-center gap-2 bg-white transition-colors disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69c-.29 1.5-.1.84-2.48 2.43v2.01h4.02c2.34-2.15 3.69-5.32 3.69-8.29z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.83-2.97c-1.08.73-2.46 1.16-4.1 1.16-3.15 0-5.81-2.13-6.76-5.01H1.17v3.1A11.988 11.988 0 0 0 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.24 14.27a7.25 7.25 0 0 1 0-4.54V6.63H1.17a11.98 11.98 0 0 0 0 10.74l4.07-3.1z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0A11.988 11.988 0 0 0 1.17 6.63l4.07 3.1c.95-2.88 3.61-5.01 6.76-5.01z"
                />
              </svg>
              Googleでログイン
            </button>
          </div>
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-400 mb-2">アカウントをお持ちでない方</p>
            <button
              onClick={() => nav("/register")}
              className="w-full py-3 border-2 border-blue-500 text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors"
            >
              新規アカウント登録
            </button>
          </div>
        </div>
      </div>
    );
  };

  const RegisterView = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [username, setUsername] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const nav = useNavigate();

    const handleRegister = async () => {
      setLoading(true);
      setError("");
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName, username: username.trim() } },
      });
      if (error) setError(error.message);
      else {
        nav("/login");
        showToast("確認メールを送信しました。メールを確認してください。");
      }
      setLoading(false);
    };

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-sm">
          <h1 className="text-2xl font-bold text-center mb-6">アカウント登録</h1>
          {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
          <div className="space-y-4">
            <input
              type="text"
              placeholder="表示名 *"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="ユーザー名（英数字・アンダースコアのみ）"
              value={username}
              onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="email"
              placeholder="メールアドレス"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              placeholder="パスワード（6文字以上）"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleRegister}
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "登録中..." : "登録する"}
            </button>
          </div>
          <div className="mt-5 p-4 bg-blue-50 border border-blue-200 rounded-xl text-center">
            <p className="text-xs text-gray-600 mb-2 font-medium">
              ライターとして記事を書きたい方は、登録後にXでご連絡ください
            </p>
            <a
              href="https://x.com/SHARE_Quest_Off"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-black text-white text-xs font-bold rounded-full hover:bg-gray-800 transition-colors"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              @SHARE_Quest_Off にDMで応募
            </a>
          </div>
          <p className="text-center text-sm text-gray-500 mt-4">
            すでにアカウントをお持ちの方は
            <button onClick={() => nav("/login")} className="text-blue-600 underline ml-1">
              ログイン
            </button>
          </p>
        </div>
      </div>
    );
  };

  const SetupProfileView = () => {
    const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
    const [username, setUsername] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
      if (!displayName.trim()) {
        setError("表示名を入力してください");
        return;
      }
      if (username.trim().length < 3 || username.trim().length > 20) {
        setError("ユーザー名は3文字以上20文字以内で入力してください");
        return;
      }
      if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
        setError("ユーザー名は半角英数字とアンダースコアのみ使用できます");
        return;
      }

      setLoading(true);
      setError("");

      try {
        const { data: existing, error: checkErr } = await supabase
          .from("profiles")
          .select("id")
          .eq("username", username.trim())
          .maybeSingle();

        if (checkErr) {
          setError("エラーが発生しました。もう一度お試しください。");
          setLoading(false);
          return;
        }

        if (existing && existing.id !== profile?.id) {
          setError("このユーザー名は既に使用されています");
          setLoading(false);
          return;
        }

        const { data: dbProfile, error: dbErr } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", profile?.id)
          .maybeSingle();

        if (dbErr) {
          setError("エラーが発生しました。もう一度お試しください。");
          setLoading(false);
          return;
        }

        let saveError;
        if (dbProfile) {
          const { error } = await supabase
            .from("profiles")
            .update({
              display_name: displayName.trim(),
              username: username.trim(),
            })
            .eq("id", profile?.id);
          saveError = error;
        } else {
          const { error } = await supabase.from("profiles").insert({
            id: profile?.id,
            email: profile?.email,
            display_name: displayName.trim(),
            username: username.trim(),
            avatar_url: profile?.avatar_url,
            role: profile?.role ?? "viewer",
          });
          saveError = error;
        }

        if (saveError) {
          setError(saveError.message);
        } else {
          setProfile((p) =>
            p
              ? {
                  ...p,
                  display_name: displayName.trim(),
                  username: username.trim(),
                }
              : null,
          );
          showToast("プロフィールを設定しました！");
        }
      } catch {
        setError("通信エラーが発生しました");
      } finally {
        setLoading(false);
      }
    };

    const handleLogout = async () => {
      await supabase.auth.signOut();
    };

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-sm">
          <h1 className="text-2xl font-bold text-center mb-2">プロフィールの初期設定</h1>
          <p className="text-xs text-gray-500 text-center mb-6">
            SHARE Questを利用するためにプロフィールを設定してください
          </p>
          {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">表示名 *</label>
              <input
                type="text"
                placeholder="例: 山田太郎"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">ユーザー名 *</label>
              <input
                type="text"
                placeholder="例: tarou_yamada (英数字・_ )"
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-[10px] text-gray-400 mt-1">
                半角英数字・アンダースコア3〜20文字。プロフィールURLに使用されます。
              </p>
            </div>
            <button
              onClick={handleSave}
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 mt-2"
            >
              {loading ? "設定中..." : "設定を完了する"}
            </button>
            <button
              onClick={handleLogout}
              className="w-full py-3 border border-gray-300 text-gray-600 font-bold rounded-xl hover:bg-gray-50 bg-white"
            >
              ログアウト
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ForgotPasswordView = () => {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSendEmail = async () => {
      if (!email.trim()) {
        setError("メールアドレスを入力してください");
        return;
      }
      setLoading(true);
      setError("");
      setSuccess(false);

      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin + "/reset-password",
      });

      if (resetErr) {
        setError(resetErr.message);
      } else {
        setSuccess(true);
        showToast("再設定用メールを送信しました");
      }
      setLoading(false);
    };

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-sm">
          <h1 className="text-2xl font-bold text-center mb-2">パスワード再設定</h1>
          <p className="text-xs text-gray-500 text-center mb-6 font-medium">
            ご登録 of メールアドレスに再設定用リンクをお送りします
          </p>
          {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4 text-center">
              <p className="text-sm font-bold text-green-800">送信完了</p>
              <p className="text-xs text-green-600 mt-1">
                メールをご確認のうえ、リンクから再設定を行ってください。
              </p>
            </div>
          )}
          <div className="space-y-4">
            <input
              type="email"
              placeholder="メールアドレス"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSendEmail}
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "送信中..." : "再設定メールを送信"}
            </button>
            <button
              onClick={() => navigate("login")}
              className="w-full py-3 border border-gray-300 text-gray-600 font-bold rounded-xl hover:bg-gray-50 bg-white"
            >
              ログイン画面に戻る
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ResetPasswordView = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
      void supabase.auth.getSession().then(({ data: { session } }) => {
        setIsAuthorized(session !== null);
      });
    }, []);

    const handleResetPassword = async () => {
      if (password.length < 6) {
        setError("パスワードは6文字以上で入力してください");
        return;
      }
      if (password !== confirmPassword) {
        setError("パスワードが一致しません");
        return;
      }

      setLoading(true);
      setError("");

      const { error: updateErr } = await supabase.auth.updateUser({ password });

      if (updateErr) {
        setError(updateErr.message);
      } else {
        showToast("パスワードを更新しました。新しいパスワードでログインしてください。");
        await supabase.auth.signOut();
        navigate("login");
      }
      setLoading(false);
    };

    if (isAuthorized === null) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <p className="text-sm text-gray-500 font-bold">確認中...</p>
        </div>
      );
    }

    if (isAuthorized === false) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-sm text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">エラー</h1>
            <p className="text-sm text-gray-600 mb-6 font-medium">
              無効なアクセス、またはリンクの有効期限が切れています。パスワード再設定メールのリンクから再度アクセスしてください。
            </p>
            <button
              onClick={() => navigate("login")}
              className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700"
            >
              ログイン画面に戻る
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-sm">
          <h1 className="text-2xl font-bold text-center mb-2">新しいパスワードの設定</h1>
          <p className="text-xs text-gray-500 text-center mb-6 font-medium">
            新しいパスワードを入力してください
          </p>
          {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
          <div className="space-y-4">
            <input
              type="password"
              placeholder="新しいパスワード（6文字以上）"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              placeholder="新しいパスワード（確認）"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleResetPassword}
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "更新中..." : "パスワードを更新"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const needsProfileSetup = profile !== null && (!profile.username || !profile.display_name);

  // --- ヘッダー非表示判定 ---
  const hideHeader = [
    "article",
    "writerDash",
    "writerNew",
    "writerEdit",
    "writerSeries",
    "editorDash",
    "editorArticles",
    "editorRecommend",
    "editorWriters",
    "login",
    "register",
    "forgotPassword",
    "resetPassword",
    "setupProfile",
  ].includes(currentView);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 sm:pb-10 text-gray-800 font-sans selection:bg-blue-200">
      {!hideHeader && !needsProfileSetup && <Header />}
      {!hideHeader && !needsProfileSetup && <MobileNav />}
      <main className="max-w-6xl mx-auto flex-1">
        {needsProfileSetup ? (
          <SetupProfileView />
        ) : (
          <>
            {currentView === "notFound" && <NotFoundView />}
            {currentView === "home" && <HomeView />}
            {currentView === "article" && <ArticleView />}
            {currentView === "search" && <SearchView />}
            {currentView === "writers" && <WritersView />}
            {currentView === "profile" && <ProfileView />}
            {currentView === "favorites" && <FavoritesView />}
            {currentView === "settings" && <SettingsView />}
            {currentView === "about" && <AboutView />}
            {currentView === "writerNew" && (userRole === "writer" || userRole === "editor") && (
              <ArticleEditorPage
                editingId={null}
                articles={articles}
                setArticles={setArticles}
                seriesList={seriesList}
                currentUserId={currentUserId}
                showToast={showToast}
                navigate={navigate}
                draftTitle={draftTitle}
                setDraftTitle={setDraftTitle}
                draftContent={draftContent}
                setDraftContent={setDraftContent}
                draftColor={draftColor}
                setDraftColor={setDraftColor}
                draftTags={draftTags}
                setDraftTags={setDraftTags}
                draftSeriesId={draftSeriesId}
                setDraftSeriesId={setDraftSeriesId}
                draftEpisodeNumber={draftEpisodeNumber}
                setDraftEpisodeNumber={setDraftEpisodeNumber}
                draftSummary={draftSummary}
                setDraftSummary={setDraftSummary}
                draftTagInput={draftTagInput}
                setDraftTagInput={setDraftTagInput}
                editorSaving={editorSaving}
                setEditorSaving={setEditorSaving}
                editorShowPreview={editorShowPreview}
                setEditorShowPreview={setEditorShowPreview}
                draftThumbnailUrl={draftThumbnailUrl}
                setDraftThumbnailUrl={setDraftThumbnailUrl}
                editorThumbnailUploading={editorThumbnailUploading}
                setEditorThumbnailUploading={setEditorThumbnailUploading}
              />
            )}
            {currentView === "writerEdit" && (userRole === "writer" || userRole === "editor") && (
              <ArticleEditorPage
                editingId={viewParam}
                articles={articles}
                setArticles={setArticles}
                seriesList={seriesList}
                currentUserId={currentUserId}
                showToast={showToast}
                navigate={navigate}
                draftTitle={draftTitle}
                setDraftTitle={setDraftTitle}
                draftContent={draftContent}
                setDraftContent={setDraftContent}
                draftColor={draftColor}
                setDraftColor={setDraftColor}
                draftTags={draftTags}
                setDraftTags={setDraftTags}
                draftSeriesId={draftSeriesId}
                setDraftSeriesId={setDraftSeriesId}
                draftEpisodeNumber={draftEpisodeNumber}
                setDraftEpisodeNumber={setDraftEpisodeNumber}
                draftSummary={draftSummary}
                setDraftSummary={setDraftSummary}
                draftTagInput={draftTagInput}
                setDraftTagInput={setDraftTagInput}
                editorSaving={editorSaving}
                setEditorSaving={setEditorSaving}
                editorShowPreview={editorShowPreview}
                setEditorShowPreview={setEditorShowPreview}
                draftThumbnailUrl={draftThumbnailUrl}
                setDraftThumbnailUrl={setDraftThumbnailUrl}
                editorThumbnailUploading={editorThumbnailUploading}
                setEditorThumbnailUploading={setEditorThumbnailUploading}
              />
            )}
            {currentView === "writerDash" && (userRole === "writer" || userRole === "editor") && (
              <WriterDashboard />
            )}
            {currentView === "writerSeries" && (userRole === "writer" || userRole === "editor") && (
              <WriterSeriesPage />
            )}
            {currentView === "editorDash" &&
              (userRole === "editor" ? <EditorDashboard /> : <AccessDeniedView />)}
            {currentView === "editorArticles" &&
              (userRole === "editor" ? <EditorArticlesView /> : <AccessDeniedView />)}
            {currentView === "editorRecommend" &&
              (userRole === "editor" ? <EditorRecommendView /> : <AccessDeniedView />)}
            {currentView === "editorWriters" &&
              (userRole === "editor" ? <EditorWritersView /> : <AccessDeniedView />)}
            {currentView === "login" && <LoginView />}
            {currentView === "register" && <RegisterView />}
            {currentView === "privacy" && <PrivacyView />}
            {currentView === "terms" && <TermsView />}
            {currentView === "contact" && <ContactView />}
            {currentView === "forgotPassword" && <ForgotPasswordView />}
            {currentView === "resetPassword" && <ResetPasswordView />}
          </>
        )}
      </main>
      {!hideHeader && !needsProfileSetup && (
        <footer className="bg-gray-50 border-t border-gray-200 mt-8">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8 mb-6">
              <div className="flex flex-col gap-2">
                <div
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => navigate("home")}
                >
                  <LogoIcon className="w-8 h-8" />
                  <img src={imgTitle} className="h-10 object-contain" alt="SHARE Quest" />
                </div>
                <p className="text-xs text-gray-500 leading-relaxed max-w-[200px]">
                  学びの「楽しい！」をつなげる、
                  <br />
                  ライターと読者をつなぐ記事プラットフォーム
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-xs font-bold text-gray-700 mb-1">メニュー</p>
                {[
                  { label: "About Us", view: "about" },
                  { label: "プライバシーポリシー", view: "privacy" },
                  { label: "利用規約", view: "terms" },
                  { label: "お問い合わせ", view: "contact" },
                ].map(({ label, view }) => (
                  <button
                    key={view}
                    onClick={() => navigate(view)}
                    className="text-xs text-gray-500 hover:text-blue-600 transition-colors text-left"
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-xs font-bold text-gray-700 mb-1">SNS</p>

                <a
                  href="https://x.com/SHARE_Quest_Off"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-black transition-colors"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  @SHARE_Quest_Off
                </a>

                <a
                  href="https://x.com/SHARE_Quest_Off"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-500 hover:text-blue-700 transition-colors"
                >
                  ライター応募はXのDMへ →
                </a>
              </div>
            </div>
            <div className="border-t border-gray-200 pt-4">
              <p className="text-xs text-gray-400">© 2026 SHARE Quest. All rights reserved.</p>
            </div>
          </div>
        </footer>
      )}
      {toastMessage && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900/90 backdrop-blur text-white px-6 py-3 rounded-full shadow-2xl z-50 animate-in slide-in-from-bottom-5 fade-in duration-300 flex items-center gap-3 text-sm font-bold whitespace-nowrap">
          {toastMessage}
          <button
            onClick={() => setToastMessage("")}
            className="p-1 rounded-full hover:bg-gray-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

function EditorArticlesView() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewArticle, setPreviewArticle] = useState<Article | null>(null);
  const nav = useNavigate();

  useEffect(() => {
    void supabase
      .from("articles")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data)
          setArticles(
            data.map((a) => ({
              id: a.id,
              title: a.title,
              thumbnail: a.thumbnail,
              thumbnailUrl: a.thumbnail_url ?? null,
              thumbnailColor: a.thumbnail_color ?? "blue",
              writerId: a.writer_id,
              views: a.views,
              likes: a.likes,
              tags: a.tags,
              isRecommended: a.is_recommended,
              isPopular: a.is_popular,
              status: a.status,
              content: a.content,
            })),
          );
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("この記事を削除しますか？")) return;
    const { error } = await supabase.from("articles").delete().eq("id", id);
    if (!error) setArticles(articles.filter((a) => a.id !== id));
  };

  const statusLabel = (s: string) =>
    s === "published" ? "公開中" : s === "pending" ? "承認待ち" : "下書き";
  const statusColor = (s: string) =>
    s === "published"
      ? "text-green-600 bg-green-50"
      : s === "pending"
        ? "text-orange-600 bg-orange-50"
        : "text-gray-500 bg-gray-100";

  return (
    <div className="p-4 space-y-4 animate-in slide-in-from-right-8 duration-300">
      <div className="-mx-4 -mt-4 px-4 bg-white border-b border-gray-200 py-3 flex items-center gap-3 sticky top-0 z-10 shadow-sm mb-4">
        <button onClick={() => nav(-1)} className="p-2 bg-white rounded-full shadow-sm">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold text-purple-800">全記事の編集・削除</h2>
      </div>
      {loading ? (
        <p className="text-center text-gray-400 py-8">読み込み中...</p>
      ) : (
        <div className="space-y-3">
          {articles.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">記事がありません</p>
          ) : (
            articles.map((a) => (
              <div key={a.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <button className="flex-1 min-w-0 text-left" onClick={() => setPreviewArticle(a)}>
                    <p className="font-bold text-gray-800 text-sm truncate hover:text-blue-600">
                      {a.title}
                    </p>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${statusColor(a.status)}`}
                    >
                      {statusLabel(a.status)}
                    </span>
                  </button>
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="p-2 text-red-400 hover:bg-red-50 rounded-lg flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
      {previewArticle && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setPreviewArticle(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 text-base truncate">{previewArticle.title}</p>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${statusColor(previewArticle.status)}`}
                >
                  {statusLabel(previewArticle.status)}
                </span>
              </div>
              <button
                onClick={() => setPreviewArticle(null)}
                className="ml-3 p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="overflow-y-auto p-5 prose prose-sm max-w-none">
              {previewArticle.content ? (
                <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(previewArticle.content) }} />
              ) : (
                <p className="text-gray-400 text-sm text-center py-8">本文がありません</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EditorRecommendView() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  useEffect(() => {
    void supabase
      .from("articles")
      .select("*")
      .eq("status", "published")
      .then(({ data }) => {
        if (data)
          setArticles(
            data.map((a) => ({
              id: a.id,
              title: a.title,
              thumbnail: a.thumbnail,
              thumbnailUrl: a.thumbnail_url ?? null,
              thumbnailColor: a.thumbnail_color ?? "blue",
              writerId: a.writer_id,
              views: a.views,
              likes: a.likes,
              tags: a.tags,
              isRecommended: a.is_recommended,
              isPopular: a.is_popular,
              status: a.status,
              content: a.content,
            })),
          );
        setLoading(false);
      });
  }, []);

  const toggle = async (id: string, field: "is_recommended" | "is_popular", current: boolean) => {
    const { error } = await supabase
      .from("articles")
      .update({ [field]: !current })
      .eq("id", id);
    if (!error)
      setArticles(
        articles.map((a) =>
          a.id === id
            ? {
                ...a,
                isRecommended: field === "is_recommended" ? !current : a.isRecommended,
                isPopular: field === "is_popular" ? !current : a.isPopular,
              }
            : a,
        ),
      );
  };

  return (
    <div className="p-4 space-y-4 animate-in slide-in-from-right-8 duration-300">
      <div className="-mx-4 -mt-4 px-4 bg-white border-b border-gray-200 py-3 flex items-center gap-3 sticky top-0 z-10 shadow-sm mb-4">
        <button onClick={() => nav(-1)} className="p-2 bg-white rounded-full shadow-sm">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold text-purple-800">おすすめ・人気設定</h2>
      </div>
      {loading ? (
        <p className="text-center text-gray-400 py-8">読み込み中...</p>
      ) : articles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-5xl mb-4">📭</p>
          <p className="text-gray-500 font-bold">公開済みの記事がありません</p>
          <p className="text-gray-400 text-sm mt-1">記事が公開されると、ここで設定できます</p>
        </div>
      ) : (
        <div className="space-y-3">
          {articles.map((a) => (
            <div key={a.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <p className="font-bold text-gray-800 text-sm mb-3">{a.title}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => toggle(a.id, "is_recommended", a.isRecommended)}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg border-2 transition-all ${a.isRecommended ? "bg-blue-500 text-white border-blue-500" : "bg-white text-gray-500 border-gray-200"}`}
                >
                  おすすめ {a.isRecommended ? "✓" : ""}
                </button>
                <button
                  onClick={() => toggle(a.id, "is_popular", a.isPopular)}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg border-2 transition-all ${a.isPopular ? "bg-orange-500 text-white border-orange-500" : "bg-white text-gray-500 border-gray-200"}`}
                >
                  人気 {a.isPopular ? "✓" : ""}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EditorWritersView() {
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState("");
  const [searchRole, setSearchRole] = useState<"" | "viewer" | "writer" | "editor">("");
  const nav = useNavigate();

  const fetchAll = () => {
    setLoading(true);
    void supabase
      .from("profiles")
      .select("*")
      .order("role", { ascending: true })
      .then(({ data }) => {
        if (data) setAllProfiles(data as Profile[]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const changeRole = async (id: string, role: "viewer" | "writer" | "editor") => {
    const { error } = await supabase.from("profiles").update({ role }).eq("id", id);
    if (error) {
      alert("更新に失敗しました: " + error.message);
    } else {
      setAllProfiles(allProfiles.map((w) => (w.id === id ? { ...w, role } : w)));
    }
  };

  const promoteWriter = async (email: string) => {
    if (!email.trim()) return;
    const { data, error: fetchError } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", email.trim())
      .single();
    if (fetchError || !data) {
      alert("ユーザーが見つかりません。先にアカウント登録が必要です。");
      return;
    }
    const { error } = await supabase.from("profiles").update({ role: "writer" }).eq("id", data.id);
    if (error) {
      alert("エラーが発生しました");
      return;
    }
    const updated = { ...data, role: "writer" as const };
    setAllProfiles((prev) =>
      prev.find((w) => w.id === data.id)
        ? prev.map((w) => (w.id === data.id ? updated : w))
        : [...prev, updated],
    );
    alert(`${data.display_name ?? data.email} をライターに昇格しました`);
  };

  const [newEmail, setNewEmail] = useState("");

  const filtered = allProfiles.filter((w) => {
    const emailMatch =
      searchEmail === "" || w.email.toLowerCase().includes(searchEmail.toLowerCase());
    const roleMatch = searchRole === "" || w.role === searchRole;
    return emailMatch && roleMatch;
  });

  const roleLabel: Record<string, string> = {
    viewer: "閲覧者",
    writer: "ライター",
    editor: "編集長",
  };
  const roleColor: Record<string, string> = {
    viewer: "bg-gray-100 text-gray-600",
    writer: "bg-blue-100 text-blue-700",
    editor: "bg-purple-100 text-purple-700",
  };

  return (
    <div className="p-4 space-y-4 animate-in slide-in-from-right-8 duration-300">
      <div className="-mx-4 -mt-4 px-4 bg-white border-b border-gray-200 py-3 flex items-center gap-3 sticky top-0 z-10 shadow-sm mb-4">
        <button onClick={() => nav(-1)} className="p-2 bg-white rounded-full shadow-sm">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold text-purple-800">ライター管理</h2>
        <span className="ml-auto text-xs text-gray-400">{allProfiles.length} アカウント</span>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-3">
        <p className="font-bold text-gray-800 text-sm">メアドでライターに昇格</p>
        <div className="flex gap-2">
          <input
            type="email"
            placeholder="メールアドレス"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <button
            onClick={() => {
              void promoteWriter(newEmail);
              setNewEmail("");
            }}
            className="px-4 py-2 bg-purple-600 text-white text-sm font-bold rounded-lg hover:bg-purple-700"
          >
            昇格
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-2">
        <p className="font-bold text-gray-800 text-sm">絞り込み</p>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="メアドで検索"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <select
            value={searchRole}
            onChange={(e) => setSearchRole(e.target.value as "" | "viewer" | "writer" | "editor")}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            <option value="">すべて</option>
            <option value="viewer">閲覧者</option>
            <option value="writer">ライター</option>
            <option value="editor">編集長</option>
          </select>
          {(searchEmail || searchRole) && (
            <button
              onClick={() => {
                setSearchEmail("");
                setSearchRole("");
              }}
              className="px-3 py-2 text-xs text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              クリア
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <p className="text-center text-gray-400 py-8">読み込み中...</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((w) => (
            <div
              key={w.id}
              className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center justify-between gap-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-gray-800 text-sm truncate">
                    {w.display_name ?? "（名前未設定）"}
                  </p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColor[w.role] ?? "bg-gray-100 text-gray-600"}`}
                  >
                    {roleLabel[w.role] ?? w.role}
                  </span>
                </div>
                <p className="text-xs text-gray-400 truncate">{w.email}</p>
              </div>
              <select
                value={w.role}
                onChange={(e) =>
                  void changeRole(w.id, e.target.value as "viewer" | "writer" | "editor")
                }
                className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none shrink-0"
              >
                <option value="viewer">閲覧者</option>
                <option value="writer">ライター</option>
                <option value="editor">編集長</option>
              </select>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-gray-400 py-6 text-sm">
              {allProfiles.length === 0
                ? "登録アカウントがありません"
                : "条件に一致するアカウントがありません"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function DisplayNameEdit({
  profile,
  setProfile,
  setWriters,
  showToast,
}: {
  profile: Profile | null;
  setProfile: React.Dispatch<React.SetStateAction<Profile | null>>;
  setWriters: React.Dispatch<React.SetStateAction<Profile[]>>;
  showToast: (msg: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile?.display_name ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: name })
      .eq("id", profile.id);
    if (!error) {
      setProfile((p) => (p ? { ...p, display_name: name } : p));
      setWriters((ws) => ws.map((w) => (w.id === profile.id ? { ...w, display_name: name } : w)));
      setEditing(false);
      showToast("表示名を更新しました");
    }
    setSaving(false);
  };

  return (
    <div className="p-4 border-b border-gray-100">
      <p className="text-xs text-gray-500 mb-1 font-bold">表示名</p>
      {editing ? (
        <div className="flex gap-2">
          <input
            className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button
            onClick={() => void handleSave()}
            disabled={saving}
            className="px-3 py-1.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "…" : "保存"}
          </button>
          <button
            onClick={() => setEditing(false)}
            className="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm font-bold rounded-lg"
          >
            取消
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <p className="font-bold text-gray-800">{profile?.display_name ?? "（未設定）"}</p>
          <button
            onClick={() => {
              setName(profile?.display_name ?? "");
              setEditing(true);
            }}
            className="text-xs text-blue-500 font-bold underline"
          >
            編集
          </button>
        </div>
      )}
    </div>
  );
}

function UsernameEdit({
  profile,
  setProfile,
  setWriters,
  showToast,
}: {
  profile: Profile | null;
  setProfile: React.Dispatch<React.SetStateAction<Profile | null>>;
  setWriters: React.Dispatch<React.SetStateAction<Profile[]>>;
  showToast: (msg: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [uname, setUname] = useState(profile?.username ?? "");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const handleSave = async () => {
    if (!profile) return;
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(uname)) {
      setErr("半角英数字・アンダースコアのみ。3〜20文字で入力してください");
      return;
    }
    setSaving(true);
    setErr("");
    const { error } = await supabase
      .from("profiles")
      .update({ username: uname })
      .eq("id", profile.id);
    if (error) {
      setErr("このユーザー名はすでに使われています");
    } else {
      setProfile((p) => (p ? { ...p, username: uname } : p));
      setWriters((ws) => ws.map((w) => (w.id === profile.id ? { ...w, username: uname } : w)));
      setEditing(false);
      showToast("ユーザー名を更新しました");
    }
    setSaving(false);
  };
  return (
    <div className="p-4 border-b border-gray-100">
      <p className="text-xs text-gray-500 mb-1 font-bold">
        ユーザー名 <span className="text-gray-400 font-normal">(@username)</span>
      </p>
      {editing ? (
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="flex-1 flex items-center border border-gray-300 rounded-lg px-3 py-1.5 focus-within:ring-2 focus-within:ring-blue-400">
              <span className="text-gray-400 text-sm mr-1">@</span>
              <input
                className="flex-1 text-sm focus:outline-none"
                value={uname}
                onChange={(e) => {
                  setUname(e.target.value);
                  setErr("");
                }}
                placeholder="例: taro_yamada"
              />
            </div>
            <button
              onClick={() => void handleSave()}
              disabled={saving}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "…" : "保存"}
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setErr("");
              }}
              className="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm font-bold rounded-lg"
            >
              取消
            </button>
          </div>
          {err && <p className="text-xs text-red-500">{err}</p>}
          <p className="text-xs text-gray-400">
            半角英数字・アンダースコア3〜20文字。プロフィーURLに使われます。
          </p>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <p className="font-bold text-gray-800">
            {profile?.username ? `@${profile.username}` : "（未設定）"}
          </p>
          <button
            onClick={() => {
              setUname(profile?.username ?? "");
              setEditing(true);
            }}
            className="text-xs text-blue-500 font-bold underline"
          >
            編集
          </button>
        </div>
      )}
    </div>
  );
}
function BioEdit({
  profile,
  setProfile,
  setWriters,
  showToast,
}: {
  profile: Profile | null;
  setProfile: React.Dispatch<React.SetStateAction<Profile | null>>;
  setWriters: React.Dispatch<React.SetStateAction<Profile[]>>;
  showToast: (msg: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [saving, setSaving] = useState(false);
  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ bio }).eq("id", profile.id);
    if (!error) {
      setProfile((p) => (p ? { ...p, bio } : p));
      setWriters((ws) => ws.map((w) => (w.id === profile.id ? { ...w, bio } : w)));
      setEditing(false);
      showToast("自己紹介を更新しました");
    } else {
      showToast("エラーが発生しました。もう一度お試しください。");
    }
    setSaving(false);
  };
  return (
    <div className="p-4 border-b border-gray-100">
      <p className="text-xs text-gray-500 mb-1 font-bold">自己紹介</p>
      {editing ? (
        <div className="space-y-2">
          <textarea
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="あなたの自己紹介を入力してください"
            maxLength={300}
          />
          <p className="text-xs text-gray-400 text-right">{bio.length}/300文字</p>
          <div className="flex gap-2">
            <button
              onClick={() => void handleSave()}
              disabled={saving}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "…" : "保存"}
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setBio(profile?.bio ?? "");
              }}
              className="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm font-bold rounded-lg"
            >
              取消
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-gray-700 flex-1 whitespace-pre-wrap">
            {profile?.bio ? profile.bio : <span className="text-gray-400">（未設定）</span>}
          </p>
          <button
            onClick={() => {
              setBio(profile?.bio ?? "");
              setEditing(true);
            }}
            className="text-xs text-blue-500 font-bold underline shrink-0"
          >
            編集
          </button>
        </div>
      )}
    </div>
  );
}
function AvatarUpload({
  profile,
  onUpdate,
}: {
  profile: Profile | null;
  onUpdate: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    if (file.size > 2 * 1024 * 1024) {
      setError("2MB以下の画像を選択してください");
      return;
    }

    setUploading(true);
    setError("");

    const ext = file.name.split(".").pop();
    const filePath = `${profile.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });
    if (uploadError) {
      setError(`アップロードに失敗しました: ${uploadError.message}`);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
    const cleanUrl = data.publicUrl;
    const displayUrl = cleanUrl + "?t=" + Date.now();
    await supabase.from("profiles").update({ avatar_url: cleanUrl }).eq("id", profile.id);
    onUpdate(displayUrl);
    setUploading(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <p className="font-bold text-gray-800 mb-3">アイコン画像</p>
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl text-gray-400">👤</span>
          )}
        </div>
        <div className="flex-1">
          <label
            className={`inline-block px-4 py-2 rounded-lg text-sm font-bold cursor-pointer border-2 transition-all ${uploading ? "bg-gray-100 text-gray-400 border-gray-200" : "bg-white text-blue-600 border-blue-500 hover:bg-blue-50"}`}
          >
            {uploading ? "アップロード中..." : "画像を変更"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </label>
          <p className="text-xs text-gray-400 mt-1">JPG / PNG / GIF・2MB以下</p>
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
      </div>
    </div>
  );
}

function NotFoundView() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
      <p className="text-8xl font-black text-gray-200 select-none mb-2">404</p>
      <h1 className="text-2xl font-bold text-gray-800 mb-3">ページが見つかりません</h1>
      <p className="text-gray-500 text-sm mb-8 max-w-xs">
        URLが間違っているか、削除されたページです。
      </p>
      <button
        onClick={() => navigate("/")}
        className="px-6 py-3 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-700 transition-colors"
      >
        トップへ戻る
      </button>
    </div>
  );
}

function AccessDeniedView() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
      <p className="text-8xl font-black text-gray-200 select-none mb-2">403</p>
      <h1 className="text-2xl font-bold text-gray-800 mb-3">アクセスできません</h1>
      <p className="text-gray-500 text-sm mb-8 max-w-xs">
        このページは編集長のみアクセス可能です。
      </p>
      <button
        onClick={() => navigate("/")}
        className="px-6 py-3 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-700 transition-colors"
      >
        トップへ戻る
      </button>
    </div>
  );
}

function PrivacyView() {
  const nav = useNavigate();
  const sections: { title: string; text?: string; items?: string[] }[] = [
    {
      title: "1. 収集する情報",
      items: [
        "会員登録時に提供いただくメールアドレスおよび表示名",
        "任意でアップロードいただくプロフィールアイコン画像",
        "記事の閲覧数などのサービス利用に関するデータ",
      ],
    },
    {
      title: "2. 利用目的",
      items: [
        "サービスのご提供および運営・改善",
        "本人確認およびアカウント管理",
        "サービスに関する重要なお知らせの送信",
      ],
    },
    {
      title: "3. 第三者への提供",
      text: "当サービスは、法令に基づく場合を除き、ユーザーの個人情報を第三者に提供・開示しません。",
    },
    {
      title: "4. 情報の管理",
      text: "収集した情報はSupabaseを通じて安全に管理されます。不正アクセスや漏洩を防ぐため、適切な技術的措置を講じています。",
    },
    {
      title: "5. Cookieについて",
      text: "当サービスは、認証セッションの維持のためCookieを使用することがあります。ブラウザ設定で無効化可能ですが、一部機能をご利用いただけない場合があります。",
    },
    {
      title: "6. ポリシーの変更",
      text: "本プライバシーポリシーは、必要に応じて変更することがあります。重要な変更がある場合はサービス内でお知らせします。",
    },
  ];
  return (
    <div className="animate-in fade-in duration-300 min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-blue-600 rounded-2xl p-6 mb-6 text-white">
          <button
            onClick={() => nav(-1)}
            className="flex items-center gap-1 text-blue-100 hover:text-white text-sm mb-3"
          >
            <ChevronLeft className="w-4 h-4" />
            戻る
          </button>
          <h2 className="text-2xl font-bold">プライバシーポリシー</h2>
          <p className="text-blue-100 text-xs mt-1">最終更新日：2026年5月</p>
        </div>
        <div className="space-y-5 text-sm text-gray-600 leading-relaxed">
          <p>
            SHARE
            Quest（以下「当サービス」）は、ユーザーの個人情報を適切に管理・保護することを最優先に考えています。
          </p>
          {sections.map((s) => (
            <div key={s.title} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-2 text-sm">{s.title}</h3>
              {s.items ? (
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  {s.items.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600">{s.text}</p>
              )}
            </div>
          ))}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <h3 className="font-bold text-gray-800 mb-1">お問い合わせ窓口</h3>
            <p>プライバシーに関するご質問はお問い合わせページからお気軽にどうぞ。</p>
            <button
              onClick={() => nav("/contact")}
              className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700"
            >
              お問い合わせはこちら
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
function TermsView() {
  const nav = useNavigate();
  const sections: { title: string; text?: string; items?: string[] }[] = [
    {
      title: "1. サービスの目的",
      text: "当サービスは、学びの楽しさを共有することを目的とした記事プラットフォームです。ライターが執筆した記事を通じて、多くの方に学びの魅力を届けることを目指しています。",
    },
    {
      title: "2. 禁止事項",
      items: [
        "他のユーザーへの訹謗中傷・嫌がらせ行為",
        "虚偽・不正確な情報の意図的な投稿",
        "第三者の著作権・知的財産権を侵害するコンテンツの投稿",
        "スパムや広告目的のコンテンツの投稿",
        "当サービスの運営を妨害する一切の行為",
        "法令に違反する行為",
      ],
    },
    {
      title: "3. 知的財産権",
      text: "当サービス上のコンテンツ（記事・デザイン・ロゴ等）の著作権は、各ライターまたは当サービスに帰属します。無断転載・複製は禁止します。",
    },
    {
      title: "4. 免責事項",
      text: "当サービスは、掃載されている記事の正確性・完全性を保証しません。記事の内容はライター個人の見解であり、当サービスの公式見解ではありません。",
    },
    {
      title: "5. アカウントの管理",
      text: "ユーザーは自身のアカウント情報を適切に管理する責任を負います。アカウントの不正利用により生じた損害について、当サービスは責任を負いません。",
    },
    {
      title: "6. サービスの変更・終了",
      text: "当サービスは、事前の通知なくサービス内容の変更や終了を行う場合があります。",
    },
    {
      title: "7. 規約の変更",
      text: "当サービスは、必要に応じて本利用規約を変更することがあります。変更後も引き続きご利用いただいた場合、変更後の規約に同意したものとみなします。",
    },
  ];
  return (
    <div className="animate-in fade-in duration-300 min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-purple-600 rounded-2xl p-6 mb-6 text-white">
          <button
            onClick={() => nav(-1)}
            className="flex items-center gap-1 text-purple-100 hover:text-white text-sm mb-3"
          >
            <ChevronLeft className="w-4 h-4" />
            戻る
          </button>
          <h2 className="text-2xl font-bold">利用規約</h2>
          <p className="text-purple-100 text-xs mt-1">最終更新日：2026年5月</p>
        </div>
        <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
          <p>
            SHARE
            Quest（以下「当サービス」）をご利用いただく前に、以下の利用規約をお読みください。サービスをご利用いただくことで、本規約に同意したものとみなします。
          </p>
          {sections.map((s) => (
            <div key={s.title} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-2 text-sm">{s.title}</h3>
              {s.items ? (
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  {s.items.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600">{s.text}</p>
              )}
            </div>
          ))}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <p>規約に関するご質問はお問い合わせページからお気軽にどうぞ。</p>
            <button
              onClick={() => nav("/contact")}
              className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700"
            >
              お問い合わせはこちら
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
