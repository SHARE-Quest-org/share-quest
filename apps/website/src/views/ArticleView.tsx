import { useApp } from "../context/AppContext";
import { LogoIcon, CustomUserIcon, CustomStarIcon, getThumbnailColor } from "../App";
import { ChevronLeft, Share2, Eye } from "lucide-react";
import { sanitizeHtml } from "../utils/sanitize";

export const ArticleView = () => {
  const {
    articles,
    writers,
    favorites,
    toggleFavorite,
    showToast,
    navigate,
    getFontSizeClass,
    viewParam,
    seriesList,
  } = useApp();

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
