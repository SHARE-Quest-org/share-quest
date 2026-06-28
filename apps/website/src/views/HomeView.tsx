import imgRecommend from "../assets/recommend_icon.png";
import { useApp } from "../context/AppContext";
import { LogoIcon } from "../App";
import { ArticleCard } from "../components/ArticleCard";

export const HomeView = () => {
  const { articles, navigate } = useApp();

  const published = articles.filter((a) => a.status === "published");
  return (
    <div className="p-4 md:p-8 space-y-6 animate-in fade-in duration-300">
      <div className="text-center py-5 bg-blue-50 rounded-xl border border-blue-100 relative overflow-hidden">
        <LogoIcon className="absolute -right-4 -bottom-4 w-24 h-24 opacity-10" />
        <p className="text-blue-600 font-bold tracking-wide">ー 学びの『楽しい！』をつなげる ー</p>
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
