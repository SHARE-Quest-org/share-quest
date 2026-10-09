import { useNavigate } from "react-router-dom";
import { Shield, PenTool } from "lucide-react";
import type { Profile } from "../../supabase";

export function RoleSettingsSection({ profile }: { profile: Profile | null }) {
  const navigate = useNavigate();
  const role = profile?.role || "viewer";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="font-bold text-gray-900 text-sm">アカウント種別・権限</h2>
          <p className="text-xs text-gray-500 mt-0.5">現在の利用権限とアクセス可能な画面です</p>
        </div>
        <RoleBadge role={role} />
      </div>
      <div className="p-4 space-y-3">
        {role === "editor" && (
          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl border border-purple-100">
            <div className="flex items-center gap-2.5">
              <Shield className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-xs font-bold text-purple-900">編集長ダッシュボード</p>
                <p className="text-[11px] text-purple-700">記事管理・推薦設定・ライター管理</p>
              </div>
            </div>
            <button
              onClick={() => navigate("/editor-dash")}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
            >
              管理画面へ
            </button>
          </div>
        )}

        {(role === "writer" || role === "editor") && (
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-100">
            <div className="flex items-center gap-2.5">
              <PenTool className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-xs font-bold text-blue-900">ライターダッシュボード</p>
                <p className="text-[11px] text-blue-700">記事の執筆・編集・シリーズ管理</p>
              </div>
            </div>
            <button
              onClick={() => navigate("/writer-dash")}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
            >
              執筆画面へ
            </button>
          </div>
        )}

        {role === "viewer" && (
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-600 flex items-center justify-between">
            <div>
              <p className="font-bold text-gray-800">一般読者アカウント</p>
              <p className="text-gray-500 mt-0.5">記事の閲覧やお気に入り登録をご利用いただけます</p>
            </div>
            <button
              onClick={() => navigate("/contact")}
              className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-lg transition-colors"
            >
              ライターに応募
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  switch (role) {
    case "editor":
      return (
        <span className="px-2.5 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
          編集長
        </span>
      );
    case "writer":
      return (
        <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
          ライター
        </span>
      );
    default:
      return (
        <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full">
          一般読者
        </span>
      );
  }
}
