import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { supabase } from "../supabase";
import { ChevronLeft } from "lucide-react";
import type { Profile } from "../supabase";
function DisplayNameEdit({
  profile,
  setProfile,
  setWriters,
  showToast,
}: {
  profile: Profile | null;
  setProfile: React.Dispatch<React.SetStateAction<Profile | null>>;
  setWriters: React.Dispatch<React.SetStateAction<Profile[]>>;
  showToast: (msg: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile?.display_name ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: name })
      .eq("id", profile.id);
    if (!error) {
      setProfile((p) => (p ? { ...p, display_name: name } : p));
      setWriters((ws) => ws.map((w) => (w.id === profile.id ? { ...w, display_name: name } : w)));
      setEditing(false);
      showToast("表示名を更新しました");
    }
    setSaving(false);
  };

  return (
    <div className="p-4 border-b border-gray-100">
      <p className="text-xs text-gray-500 mb-1 font-bold">表示名</p>
      {editing ? (
        <div className="flex gap-2">
          <input
            className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button
            onClick={() => void handleSave()}
            disabled={saving}
            className="px-3 py-1.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "…" : "保存"}
          </button>
          <button
            onClick={() => setEditing(false)}
            className="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm font-bold rounded-lg"
          >
            取消
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <p className="font-bold text-gray-800">{profile?.display_name ?? "（未設定）"}</p>
          <button
            onClick={() => {
              setName(profile?.display_name ?? "");
              setEditing(true);
            }}
            className="text-xs text-blue-500 font-bold underline"
          >
            編集
          </button>
        </div>
      )}
    </div>
  );
}

function UsernameEdit({
  profile,
  setProfile,
  setWriters,
  showToast,
}: {
  profile: Profile | null;
  setProfile: React.Dispatch<React.SetStateAction<Profile | null>>;
  setWriters: React.Dispatch<React.SetStateAction<Profile[]>>;
  showToast: (msg: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [uname, setUname] = useState(profile?.username ?? "");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const handleSave = async () => {
    if (!profile) return;
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(uname)) {
      setErr("半角英数字・アンダースコアのみ。3〜20文字で入力してください");
      return;
    }
    setSaving(true);
    setErr("");
    const { error } = await supabase
      .from("profiles")
      .update({ username: uname })
      .eq("id", profile.id);
    if (error) {
      setErr("このユーザー名はすでに使われています");
    } else {
      setProfile((p) => (p ? { ...p, username: uname } : p));
      setWriters((ws) => ws.map((w) => (w.id === profile.id ? { ...w, username: uname } : w)));
      setEditing(false);
      showToast("ユーザー名を更新しました");
    }
    setSaving(false);
  };
  return (
    <div className="p-4 border-b border-gray-100">
      <p className="text-xs text-gray-500 mb-1 font-bold">
        ユーザー名 <span className="text-gray-400 font-normal">(@username)</span>
      </p>
      {editing ? (
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="flex-1 flex items-center border border-gray-300 rounded-lg px-3 py-1.5 focus-within:ring-2 focus-within:ring-blue-400">
              <span className="text-gray-400 text-sm mr-1">@</span>
              <input
                className="flex-1 text-sm focus:outline-none"
                value={uname}
                onChange={(e) => {
                  setUname(e.target.value);
                  setErr("");
                }}
                placeholder="例: taro_yamada"
              />
            </div>
            <button
              onClick={() => void handleSave()}
              disabled={saving}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "…" : "保存"}
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setErr("");
              }}
              className="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm font-bold rounded-lg"
            >
              取消
            </button>
          </div>
          {err && <p className="text-xs text-red-500">{err}</p>}
          <p className="text-xs text-gray-400">
            半角英数字・アンダースコア3〜20文字。プロフィーURLに使われます。
          </p>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <p className="font-bold text-gray-800">
            {profile?.username ? `@${profile.username}` : "（未設定）"}
          </p>
          <button
            onClick={() => {
              setUname(profile?.username ?? "");
              setEditing(true);
            }}
            className="text-xs text-blue-500 font-bold underline"
          >
            編集
          </button>
        </div>
      )}
    </div>
  );
}
function BioEdit({
  profile,
  setProfile,
  setWriters,
  showToast,
}: {
  profile: Profile | null;
  setProfile: React.Dispatch<React.SetStateAction<Profile | null>>;
  setWriters: React.Dispatch<React.SetStateAction<Profile[]>>;
  showToast: (msg: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [saving, setSaving] = useState(false);
  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ bio }).eq("id", profile.id);
    if (!error) {
      setProfile((p) => (p ? { ...p, bio } : p));
      setWriters((ws) => ws.map((w) => (w.id === profile.id ? { ...w, bio } : w)));
      setEditing(false);
      showToast("自己紹介を更新しました");
    } else {
      showToast("エラーが発生しました。もう一度お試しください。");
    }
    setSaving(false);
  };
  return (
    <div className="p-4 border-b border-gray-100">
      <p className="text-xs text-gray-500 mb-1 font-bold">自己紹介</p>
      {editing ? (
        <div className="space-y-2">
          <textarea
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="あなたの自己紹介を入力してください"
            maxLength={300}
          />
          <p className="text-xs text-gray-400 text-right">{bio.length}/300文字</p>
          <div className="flex gap-2">
            <button
              onClick={() => void handleSave()}
              disabled={saving}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "…" : "保存"}
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setBio(profile?.bio ?? "");
              }}
              className="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm font-bold rounded-lg"
            >
              取消
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-gray-700 flex-1 whitespace-pre-wrap">
            {profile?.bio ? profile.bio : <span className="text-gray-400">（未設定）</span>}
          </p>
          <button
            onClick={() => {
              setBio(profile?.bio ?? "");
              setEditing(true);
            }}
            className="text-xs text-blue-500 font-bold underline shrink-0"
          >
            編集
          </button>
        </div>
      )}
    </div>
  );
}
function AvatarUpload({
  profile,
  onUpdate,
}: {
  profile: Profile | null;
  onUpdate: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    if (file.size > 2 * 1024 * 1024) {
      setError("2MB以下の画像を選択してください");
      return;
    }

    setUploading(true);
    setError("");

    const ext = file.name.split(".").pop();
    const filePath = `${profile.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });
    if (uploadError) {
      setError(`アップロードに失敗しました: ${uploadError.message}`);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
    const cleanUrl = data.publicUrl;
    const displayUrl = cleanUrl + "?t=" + Date.now();
    await supabase.from("profiles").update({ avatar_url: cleanUrl }).eq("id", profile.id);
    onUpdate(displayUrl);
    setUploading(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <p className="font-bold text-gray-800 mb-3">アイコン画像</p>
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl text-gray-400">👤</span>
          )}
        </div>
        <div className="flex-1">
          <label
            className={`inline-block px-4 py-2 rounded-lg text-sm font-bold cursor-pointer border-2 transition-all ${uploading ? "bg-gray-100 text-gray-400 border-gray-200" : "bg-white text-blue-600 border-blue-500 hover:bg-blue-50"}`}
          >
            {uploading ? "アップロード中..." : "画像を変更"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </label>
          <p className="text-xs text-gray-400 mt-1">JPG / PNG / GIF・2MB以下</p>
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
      </div>
    </div>
  );
}

export const SettingsView = () => {
  const navRouter = useNavigate();
  const { profile, setProfile, userRole, setWriters, showToast, navigate, fontSize, setFontSize } =
    useApp();
  return (
    <div className="p-4 md:p-8 space-y-6 animate-in fade-in duration-300">
      {userRole === "guest" && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="font-bold text-blue-800 text-sm">ログインしていません</p>
            <p className="text-xs text-blue-600">ログインするとお気に入り機能が使えます</p>
          </div>
          <button
            onClick={() => navigate("login")}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700"
          >
            ログイン
          </button>
        </div>
      )}
      {userRole !== "guest" && (
        <AvatarUpload
          profile={profile}
          onUpdate={(url) => setProfile((p) => (p ? { ...p, avatar_url: url } : p))}
        />
      )}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {userRole !== "guest" && (
          <>
            <DisplayNameEdit
              profile={profile}
              setProfile={setProfile}
              setWriters={setWriters}
              showToast={showToast}
            />
            <UsernameEdit
              profile={profile}
              setProfile={setProfile}
              setWriters={setWriters}
              showToast={showToast}
            />
            {(userRole === "writer" || userRole === "editor") && (
              <BioEdit
                profile={profile}
                setProfile={setProfile}
                setWriters={setWriters}
                showToast={showToast}
              />
            )}
          </>
        )}
        {userRole !== "guest" && (
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <p className="font-bold text-gray-800 text-sm">
                {profile?.display_name ?? profile?.email}
              </p>
              <p className="text-xs text-gray-500">
                {userRole === "editor" ? "編集長" : userRole === "writer" ? "ライター" : "閲覧者"}
              </p>
            </div>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
              }}
              className="px-4 py-2 bg-red-50 text-red-600 text-sm font-bold rounded-lg border border-red-200 hover:bg-red-100"
            >
              ログアウト
            </button>
          </div>
        )}
        <div className="p-4 flex items-center justify-between">
          <div>
            <p className="font-bold text-gray-800">文字の大きさ</p>
            <p className="text-xs text-gray-500 font-medium">記事本文の表示サイズ</p>
          </div>
          <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-200">
            {["small", "medium", "large"].map((size, i) => {
              const labels = ["小", "中", "大"];
              return (
                <button
                  key={size}
                  onClick={() => setFontSize(size)}
                  className={`px-4 py-1.5 text-sm rounded-md transition-all font-bold ${fontSize === size ? "bg-white shadow text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                >
                  {labels[i]}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      {userRole === "writer" && (
        <button
          onClick={() => navRouter(-1)}
          className="w-full p-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-bold shadow-md flex items-center justify-between"
        >
          <span>ライター用ダッシュボードを開く</span>
          <ChevronLeft className="w-5 h-5 rotate-180" />
        </button>
      )}
      {userRole === "editor" && (
        <button
          onClick={() => navigate("editorDash")}
          className="w-full p-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-bold shadow-md flex items-center justify-between"
        >
          <span>編集長用ダッシュボードを開く</span>
          <ChevronLeft className="w-5 h-5 rotate-180" />
        </button>
      )}
    </div>
  );
};

// --- WriterDashboard ---
