import { useApp } from "../context/AppContext";
import { LogoIcon, CustomUserIcon } from "../App";
import { ArticleCard } from "../components/ArticleCard";
import { ChevronLeft } from "lucide-react";

export const ProfileView = () => {
  const { writers, articles, navigate, viewParam } = useApp();

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
