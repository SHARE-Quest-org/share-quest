import type { Article } from "../App";
import { useApp } from "../context/AppContext";
import { getThumbnailColor, LogoIcon, CustomUserIcon, CustomStarIcon } from "../App";

export const ArticleCard = ({
  article,
  layout = "horizontal",
}: {
  article: Article;
  layout?: "horizontal" | "vertical";
}) => {
  const { writers, favorites, navigate } = useApp();
  const writer = writers.find((w) => w.id === article.writerId);
  const isFav = favorites.includes(article.id);

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden cursor-pointer active:scale-[0.98] transition-transform ${
        layout === "horizontal" ? "flex h-28" : "flex flex-col"
      }`}
      onClick={() => navigate("article", article.id)}
    >
      {(() => {
        const color = getThumbnailColor(article.thumbnailColor ?? null);
        return article.thumbnailUrl ? (
          <div
            className={`${
              layout === "horizontal" ? "w-1/3 min-w-[110px] h-full" : "w-full"
            } overflow-hidden bg-gray-50`}
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
            className={`${color.bg} ${
              layout === "horizontal" ? "w-1/3 min-w-[110px]" : "w-full"
            } flex items-center justify-center`}
            style={layout !== "horizontal" ? { aspectRatio: "16/9" } : {}}
          >
            <LogoIcon className="w-10 h-10 opacity-40" />
          </div>
        );
      })()}
      <div
        className={`p-3 flex flex-col justify-between ${
          layout === "horizontal" ? "w-2/3" : "w-full"
        }`}
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
