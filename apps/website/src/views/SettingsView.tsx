import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { supabase } from "../supabase";
import {
  ChevronLeft,
  ShieldCheck,
  Key,
  Smartphone,
  Trash2,
  Plus,
  Loader2,
  Download,
  Check,
  Copy,
  KeyRound,
  RefreshCw,
  X,
} from "lucide-react";
import type { Profile } from "../supabase";
import { MfaEnrollModal } from "../components/MfaEnrollModal";
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
            半角英数字・アンダースコア3〜20文字。プロフィールURLおよびX（旧Twitter）リンクに使用されます。
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

  const ALLOWED_AVATAR_TYPES: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    const ext = ALLOWED_AVATAR_TYPES[file.type];
    if (!ext) {
      setError("JPEG、PNG、WebP、GIF形式の画像を選択してください");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("2MB以下の画像を選択してください");
      return;
    }

    setUploading(true);
    setError("");

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
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </label>
          <p className="text-xs text-gray-400 mt-1">JPG / PNG / WebP / GIF・2MB以下</p>
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
      </div>
    </div>
  );
}

type FactorItem = {
  id: string;
  friendly_name?: string;
  factor_type: string;
  status: string;
  created_at: string;
};

type PasskeyItem = {
  id: string;
  friendly_name?: string;
  created_at: string;
  last_used_at?: string;
};

function SecuritySettings({ showToast }: { showToast: (msg: string) => void }) {
  const [totpFactors, setTotpFactors] = useState<FactorItem[]>([]);
  const [passkeys, setPasskeys] = useState<PasskeyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [isRegisteringPasskey, setIsRegisteringPasskey] = useState(false);
  const [unrollingId, setUnenrollingId] = useState<string | null>(null);
  const [deletingPasskeyId, setDeletingPasskeyId] = useState<string | null>(null);

  // バックアップコード状態
  const [backupCodesStatus, setBackupCodesStatus] = useState<{
    total: number;
    remaining: number;
  } | null>(null);
  const [regeneratingCodes, setRegeneratingCodes] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [newBackupCodes, setNewBackupCodes] = useState<string[]>([]);
  const [copiedNewCodes, setCopiedNewCodes] = useState(false);

  const isPasskeySupported =
    typeof window !== "undefined" &&
    !!window.PublicKeyCredential &&
    typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === "function";

  const fetchSecurityData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch MFA Factors
      const { data: factorsData, error: mfaError } = await supabase.auth.mfa.listFactors();
      if (!mfaError && factorsData) {
        const verifiedTotp = factorsData.all.filter(
          (f) => f.factor_type === "totp" && f.status === "verified",
        );
        setTotpFactors(verifiedTotp);
      }

      // Fetch Passkeys
      if (supabase.auth.passkey) {
        const { data: passkeysData, error: passkeyError } = await supabase.auth.passkey.list();
        if (!passkeyError && passkeysData) {
          setPasskeys(passkeysData);
        }
      }

      // Fetch Backup Codes Status
      const { data: bcStatus } = await supabase.rpc("get_mfa_backup_codes_status");
      if (bcStatus) {
        setBackupCodesStatus(bcStatus as { total: number; remaining: number });
      }
    } catch (e) {
      console.error("Failed to load security settings", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSecurityData();
  }, [fetchSecurityData]);

  const handleRegenerateBackupCodes = async () => {
    if (
      !window.confirm(
        "新しいバックアップコードを生成しますか？\n現在保存している古いコードはすべて無効になります。",
      )
    ) {
      return;
    }
    setRegeneratingCodes(true);
    try {
      const { data, error } = await supabase.rpc("generate_mfa_backup_codes");
      if (error || !data) {
        showToast("バックアップコードの生成に失敗しました: " + (error?.message || ""));
      } else {
        setNewBackupCodes(data as string[]);
        setShowBackupModal(true);
        void fetchSecurityData();
      }
    } catch {
      showToast("バックアップコードの生成中にエラーが発生しました");
    } finally {
      setRegeneratingCodes(false);
    }
  };

  const handleDownloadNewCodes = () => {
    const content = [
      "SHARE Quest - 2段階認証バックアップコード",
      "=========================================",
      "これらのコードは、認証アプリにアクセスできなくなった際に",
      "ログインするために一度だけ使用できます。",
      "安全な場所に保管し、他者と共有しないでください。",
      "",
      ...newBackupCodes.map((code, idx) => `${idx + 1}. ${code}`),
      "",
      `生成日時: ${new Date().toLocaleString("ja-JP")}`,
    ].join("\n");

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sharequest-backup-codes.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyNewCodes = async () => {
    try {
      await navigator.clipboard.writeText(newBackupCodes.join("\n"));
      setCopiedNewCodes(true);
      setTimeout(() => setCopiedNewCodes(false), 2500);
    } catch {
      setCopiedNewCodes(false);
    }
  };

  const handleDisableTotp = async (factorId: string) => {
    if (!window.confirm("2段階認証を解除しますか？アカウントのセキュリティ強度が低下します。")) {
      return;
    }
    setUnenrollingId(factorId);
    const { error } = await supabase.auth.mfa.unenroll({ factorId });
    if (error) {
      showToast("2段階認証の解除に失敗しました: " + error.message);
    } else {
      showToast("2段階認証を解除しました");
      await fetchSecurityData();
    }
    setUnenrollingId(null);
  };

  const handleRegisterPasskey = async () => {
    setIsRegisteringPasskey(true);
    try {
      const { data, error } = await supabase.auth.registerPasskey();
      if (error) {
        showToast("パスキーの登録に失敗しました: " + error.message);
      } else if (data) {
        showToast("パスキーを登録しました");
        await fetchSecurityData();
      }
    } catch (e: any) {
      if (e?.name !== "NotAllowedError") {
        showToast("パスキーの登録中にエラーが発生しました");
      }
    } finally {
      setIsRegisteringPasskey(false);
    }
  };

  const handleDeletePasskey = async (passkeyId: string) => {
    if (!window.confirm("このパスキーを削除しますか？")) {
      return;
    }
    setDeletingPasskeyId(passkeyId);
    try {
      const { error } = await supabase.auth.passkey.delete({ passkeyId });
      if (error) {
        showToast("パスキーの削除に失敗しました: " + error.message);
      } else {
        showToast("パスキーを削除しました");
        await fetchSecurityData();
      }
    } catch {
      showToast("パスキーの削除中にエラーが発生しました");
    } finally {
      setDeletingPasskeyId(null);
    }
  };

  const isTotpEnabled = totpFactors.length > 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex items-center gap-2">
        <ShieldCheck className="w-5 h-5 text-blue-600" />
        <h2 className="font-bold text-gray-800 text-base">セキュリティ設定</h2>
      </div>

      <div className="p-4 space-y-6">
        {/* 2要素認証（TOTP）設定 */}
        <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-gray-600" />
                <span className="font-bold text-sm text-gray-800">
                  2要素認証（TOTP / 認証アプリ）
                </span>
                {isTotpEnabled ? (
                  <span className="px-2 py-0.5 text-xs font-bold bg-green-100 text-green-700 rounded-full">
                    有効
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-xs font-bold bg-gray-100 text-gray-500 rounded-full">
                    未設定
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Google Authenticator や 1Password
                などの認証アプリを使用して、ログイン時に6桁の確認コードを要求します。
              </p>
            </div>
            {isTotpEnabled ? (
              <button
                onClick={() => void handleDisableTotp(totpFactors[0].id)}
                disabled={unrollingId !== null || loading}
                className="px-3 py-1.5 text-xs font-bold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50 flex items-center gap-1"
              >
                {unrollingId ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                解除する
              </button>
            ) : (
              <button
                onClick={() => setEnrollModalOpen(true)}
                disabled={loading}
                className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                有効にする
              </button>
            )}
          </div>
        </div>

        {/* バックアップコード設定 (TOTP有効時のみ) */}
        {isTotpEnabled && (
          <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-gray-600" />
                  <span className="font-bold text-sm text-gray-800">緊急用バックアップコード</span>
                  {backupCodesStatus && (
                    <span className="px-2 py-0.5 text-xs font-bold bg-blue-100 text-blue-700 rounded-full">
                      残り {backupCodesStatus.remaining} / {backupCodesStatus.total || 10} 個
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  認証アプリにアクセスできなくなった場合の非常用コードです。再生成を行うと、以前のコードはすべて無効になります。
                </p>
              </div>
              <button
                onClick={() => void handleRegenerateBackupCodes()}
                disabled={regeneratingCodes || loading}
                className="px-3 py-1.5 text-xs font-bold text-gray-700 border border-gray-300 bg-white rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center gap-1.5 flex-shrink-0"
              >
                {regeneratingCodes ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
                )}
                コードを再生成
              </button>
            </div>
          </div>
        )}

        {/* パスキー設定 */}
        <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
          <div className="flex items-start justify-between mb-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-gray-600" />
                <span className="font-bold text-sm text-gray-800">
                  パスキー（生体認証 / セキュリティキー）
                </span>
                {passkeys.length > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-blue-100 text-blue-700 rounded-full">
                    {passkeys.length}件 登録済み
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Touch ID、Face ID、Windows Hello
                などの端末の生体認証を使って、パスワード不要で安全にログインできます。
              </p>
            </div>
            {isPasskeySupported && (
              <button
                onClick={() => void handleRegisterPasskey()}
                disabled={isRegisteringPasskey || loading}
                className="px-3 py-1.5 text-xs font-bold text-blue-600 border border-blue-200 bg-white rounded-lg hover:bg-blue-50 disabled:opacity-50 flex items-center gap-1 flex-shrink-0"
              >
                {isRegisteringPasskey ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Plus className="w-3.5 h-3.5" />
                )}
                パスキーを登録
              </button>
            )}
          </div>

          {!isPasskeySupported ? (
            <p className="text-xs text-amber-600 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
              ※お使いのブラウザや環境はパスキー（WebAuthn）に対応していません。
            </p>
          ) : passkeys.length === 0 ? (
            <p className="text-xs text-gray-400 py-2">
              登録済みのパスキーはありません。「パスキーを登録」ボタンから現在の端末を登録できます。
            </p>
          ) : (
            <div className="space-y-2 mt-3">
              {passkeys.map((pk) => (
                <div
                  key={pk.id}
                  className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-gray-200 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Key className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <div className="truncate">
                      <p className="font-bold text-gray-700 truncate">
                        {pk.friendly_name || "パスキー"}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        登録日: {new Date(pk.created_at).toLocaleDateString("ja-JP")}
                        {pk.last_used_at && (
                          <span className="ml-2">
                            最終利用: {new Date(pk.last_used_at).toLocaleDateString("ja-JP")}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => void handleDeletePasskey(pk.id)}
                    disabled={deletingPasskeyId === pk.id}
                    title="パスキーを削除"
                    className="p-1.5 text-gray-400 hover:text-red-500 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50 flex-shrink-0"
                  >
                    {deletingPasskeyId === pk.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {enrollModalOpen && (
        <MfaEnrollModal
          onSuccess={() => {
            setEnrollModalOpen(false);
            showToast("2段階認証を有効化しました");
            void fetchSecurityData();
          }}
          onClose={() => setEnrollModalOpen(false)}
        />
      )}

      {showBackupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-md overflow-hidden relative">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                  <KeyRound className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-900 text-base">新しいバックアップコード</h3>
              </div>
              <button
                onClick={() => setShowBackupModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                <p className="text-xs font-bold text-amber-800">新しいコードが発行されました</p>
                <p className="text-xs text-amber-700 leading-relaxed">
                  以前のバックアップコードはすべて無効化されました。以下の10個の新しいコードを安全な場所に保管してください。
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-xl border border-gray-200">
                {newBackupCodes.map((code, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-3 py-1.5 bg-white rounded-lg border border-gray-200 text-xs font-mono font-bold text-gray-700 shadow-sm"
                  >
                    <span className="text-gray-400 text-[10px] select-none">{idx + 1}.</span>
                    <span>{code}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => void handleCopyNewCodes()}
                  className="flex-1 py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 border border-gray-200 transition-colors"
                >
                  {copiedNewCodes ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-600" />
                      <span className="text-green-600">コピー完了</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>すべてコピー</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleDownloadNewCodes}
                  className="flex-1 py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 border border-gray-200 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>テキスト保存</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowBackupModal(false)}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-sm transition-colors mt-2"
              >
                安全な場所に保存しました（閉じる）
              </button>
            </div>
          </div>
        </div>
      )}
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
                {profile?.display_name ??
                  (profile?.username ? `@${profile.username}` : (profile?.email ?? "アカウント"))}
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
      {userRole !== "guest" && <SecuritySettings showToast={showToast} />}
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
