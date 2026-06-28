import { useApp } from "../../context/AppContext";
import { supabase } from "../../supabase";
import { getThumbnailColor, LogoIcon } from "../../App";
import { ChevronLeft, Plus, Edit3 } from "lucide-react";
import type { Article } from "../../App";

export const WriterDashboard = () => {
  const { profile, articles, setArticles, showToast, navigate } = useApp();

  const myArticles = articles.filter((a) => a.writerId === profile?.id);

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
