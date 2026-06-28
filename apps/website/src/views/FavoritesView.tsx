import { useApp } from "../context/AppContext";
import { CustomStarIcon } from "../App";
import { ArticleCard } from "../components/ArticleCard";

export const FavoritesView = () => {
  const { articles, favorites, navigate, userRole } = useApp();

  const favArticles = articles.filter((a) => favorites.includes(a.id) && a.status === "published");
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
