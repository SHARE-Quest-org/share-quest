import { useApp } from "../context/AppContext";
import { CustomUserIcon } from "../App";
import { ChevronLeft } from "lucide-react";
import type { Profile } from "../supabase";

export const WritersView = () => {
  const { writers, navigate } = useApp();

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
