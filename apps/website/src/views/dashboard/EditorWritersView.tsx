import { useState, useEffect } from "react";
import { supabase } from "../../supabase";
import { ChevronLeft } from "lucide-react";
import type { Profile } from "../../supabase";
import { useNavigate } from "react-router-dom";
export function EditorWritersView() {
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState("");
  const [searchRole, setSearchRole] = useState<"" | "viewer" | "writer" | "editor">("");
  const nav = useNavigate();

  const fetchAll = () => {
    setLoading(true);
    void supabase
      .from("profiles")
      .select("*")
      .order("role", { ascending: true })
      .then(({ data }) => {
        if (data) setAllProfiles(data as Profile[]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const changeRole = async (id: string, role: "viewer" | "writer" | "editor") => {
    const { error } = await supabase.from("profiles").update({ role }).eq("id", id);
    if (error) {
      alert("更新に失敗しました: " + error.message);
    } else {
      setAllProfiles(allProfiles.map((w) => (w.id === id ? { ...w, role } : w)));
    }
  };

  const promoteWriter = async (email: string) => {
    if (!email.trim()) return;
    const { data, error: fetchError } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", email.trim())
      .single();
    if (fetchError || !data) {
      alert("ユーザーが見つかりません。先にアカウント登録が必要です。");
      return;
    }
    const { error } = await supabase.from("profiles").update({ role: "writer" }).eq("id", data.id);
    if (error) {
      alert("エラーが発生しました");
      return;
    }
    const updated = { ...data, role: "writer" as const };
    setAllProfiles((prev) =>
      prev.find((w) => w.id === data.id)
        ? prev.map((w) => (w.id === data.id ? updated : w))
        : [...prev, updated],
    );
    alert(`${data.display_name ?? data.email} をライターに昇格しました`);
  };

  const [newEmail, setNewEmail] = useState("");

  const filtered = allProfiles.filter((w) => {
    const emailMatch =
      searchEmail === "" || w.email.toLowerCase().includes(searchEmail.toLowerCase());
    const roleMatch = searchRole === "" || w.role === searchRole;
    return emailMatch && roleMatch;
  });

  const roleLabel: Record<string, string> = {
    viewer: "閲覧者",
    writer: "ライター",
    editor: "編集長",
  };
  const roleColor: Record<string, string> = {
    viewer: "bg-gray-100 text-gray-600",
    writer: "bg-blue-100 text-blue-700",
    editor: "bg-purple-100 text-purple-700",
  };

  return (
    <div className="p-4 space-y-4 animate-in slide-in-from-right-8 duration-300">
      <div className="-mx-4 -mt-4 px-4 bg-white border-b border-gray-200 py-3 flex items-center gap-3 sticky top-0 z-10 shadow-sm mb-4">
        <button onClick={() => nav(-1)} className="p-2 bg-white rounded-full shadow-sm">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold text-purple-800">ライター管理</h2>
        <span className="ml-auto text-xs text-gray-400">{allProfiles.length} アカウント</span>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-3">
        <p className="font-bold text-gray-800 text-sm">メアドでライターに昇格</p>
        <div className="flex gap-2">
          <input
            type="email"
            placeholder="メールアドレス"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <button
            onClick={() => {
              void promoteWriter(newEmail);
              setNewEmail("");
            }}
            className="px-4 py-2 bg-purple-600 text-white text-sm font-bold rounded-lg hover:bg-purple-700"
          >
            昇格
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-2">
        <p className="font-bold text-gray-800 text-sm">絞り込み</p>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="メアドで検索"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <select
            value={searchRole}
            onChange={(e) => setSearchRole(e.target.value as "" | "viewer" | "writer" | "editor")}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            <option value="">すべて</option>
            <option value="viewer">閲覧者</option>
            <option value="writer">ライター</option>
            <option value="editor">編集長</option>
          </select>
          {(searchEmail || searchRole) && (
            <button
              onClick={() => {
                setSearchEmail("");
                setSearchRole("");
              }}
              className="px-3 py-2 text-xs text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              クリア
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <p className="text-center text-gray-400 py-8">読み込み中...</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((w) => (
            <div
              key={w.id}
              className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center justify-between gap-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-gray-800 text-sm truncate">
                    {w.display_name ?? "（名前未設定）"}
                  </p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColor[w.role] ?? "bg-gray-100 text-gray-600"}`}
                  >
                    {roleLabel[w.role] ?? w.role}
                  </span>
                </div>
                <p className="text-xs text-gray-400 truncate">{w.email}</p>
              </div>
              <select
                value={w.role}
                onChange={(e) =>
                  void changeRole(w.id, e.target.value as "viewer" | "writer" | "editor")
                }
                className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none shrink-0"
              >
                <option value="viewer">閲覧者</option>
                <option value="writer">ライター</option>
                <option value="editor">編集長</option>
              </select>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-gray-400 py-6 text-sm">
              {allProfiles.length === 0
                ? "登録アカウントがありません"
                : "条件に一致するアカウントがありません"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
