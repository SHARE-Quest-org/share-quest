import { useNavigate } from "react-router-dom";

export function AccessDeniedView() {
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
