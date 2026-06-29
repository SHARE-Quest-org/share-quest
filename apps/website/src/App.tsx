import RichTextEditor from "./components/RichTextEditor";
import { useMemo, useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "./supabase";
import type { Profile } from "./supabase";
import { ChevronLeft, X, Home } from "lucide-react";
import { sanitizeHtml } from "./utils/sanitize";
import { ContactView } from "./components/ContactView";

// App Context
import { AppContext, useApp } from "./context/AppContext";
import type { AppContextType } from "./context/AppContext";

// Views & Components
import { LoginView } from "./views/auth/LoginView";
import { RegisterView } from "./views/auth/RegisterView";
import { SetupProfileView } from "./views/auth/SetupProfileView";
import { ForgotPasswordView } from "./views/auth/ForgotPasswordView";
import { ResetPasswordView } from "./views/auth/ResetPasswordView";
import { HomeView } from "./views/HomeView";
import { ArticleView } from "./views/ArticleView";
import { SearchView } from "./views/SearchView";
import { WritersView } from "./views/WritersView";
import { ProfileView } from "./views/ProfileView";
import { FavoritesView } from "./views/FavoritesView";
import { SettingsView } from "./views/SettingsView";
import { AboutView } from "./views/AboutView";
import { PrivacyView } from "./views/PrivacyView";
import { TermsView } from "./views/TermsView";

// Dashboard Views
import { WriterDashboard } from "./views/dashboard/WriterDashboard";
import { WriterSeriesPage } from "./views/dashboard/WriterSeriesPage";
import { EditorDashboard } from "./views/dashboard/EditorDashboard";
import { EditorArticlesView } from "./views/dashboard/EditorArticlesView";
import { EditorRecommendView } from "./views/dashboard/EditorRecommendView";
import { EditorWritersView } from "./views/dashboard/EditorWritersView";
import { AccessDeniedView } from "./views/dashboard/AccessDeniedView";

export type Series = {
  id: string;
  title: string;
  description?: string | null;
  writerId: string;
};

export type Article = {
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

export const LogoIcon = ({ className = "w-8 h-8" }) => (
  <img src={imgLogo} className={`${className} object-cover rounded`} alt="Logo" />
);
export const CustomHomeIcon = ({
  className = "w-6 h-6",
  active = false,
}: {
  className?: string;
  active?: boolean;
}) => <Home className={`${className} ${active ? "text-blue-600" : "text-gray-400"}`} />;
export const CustomSearchIcon = ({
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
export const CustomUserIcon = ({
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
export const CustomStarIcon = ({
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
export const CustomSettingsIcon = ({
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

export const MOCK_TAGS = ["理科", "歴史", "数学", "国語", "英語", "プログラミング", "雑学"];

export const THUMBNAIL_COLORS = [
  { id: "blue", label: "ブルー", bg: "bg-blue-100", text: "text-blue-400" },
  { id: "green", label: "グリーン", bg: "bg-green-100", text: "text-green-400" },
  { id: "purple", label: "パープル", bg: "bg-purple-100", text: "text-purple-400" },
  { id: "orange", label: "オレンジ", bg: "bg-orange-100", text: "text-orange-400" },
  { id: "pink", label: "ピンク", bg: "bg-pink-100", text: "text-pink-400" },
  { id: "teal", label: "ティール", bg: "bg-teal-100", text: "text-teal-400" },
];
export const getThumbnailColor = (colorId: string | null) =>
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
  const [fontSize, setFontSize] = useState(
    () => localStorage.getItem("share_quest_font_size") || "medium",
  );
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    localStorage.setItem("share_quest_font_size", fontSize);
  }, [fontSize]);

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
    ({
      small: "article-size-small",
      medium: "article-size-medium",
      large: "article-size-large",
    })[fontSize as "small" | "medium" | "large"] ?? "article-size-medium";

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
  // --- HomeView ---
  // --- ArticleView ---
  // --- SearchView ---
  // --- WritersView ---
  // --- ProfileView ---
  // --- FavoritesView ---
  // --- SettingsView ---
  // --- WriterDashboard ---
  // --- EditorDashboard ---
  // --- AboutView ---
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

  const contextValue: AppContextType = {
    profile,
    setProfile,
    userRole,
    setUserRole,
    authLoading,
    showToast,
    navigate,
    currentView,
    viewParam,
    writers,
    setWriters,
    articles,
    setArticles,
    seriesList,
    setSeriesList,
    favorites,
    setFavorites,
    toggleFavorite,
    fontSize,
    setFontSize,
    getFontSizeClass,
  };

  return (
    <AppContext.Provider value={contextValue}>
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
              {currentView === "writerSeries" &&
                (userRole === "writer" || userRole === "editor") && <WriterSeriesPage />}
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
    </AppContext.Provider>
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
