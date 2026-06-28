import { useState } from "react";
import { supabase } from "../../supabase";
import { useApp } from "../../context/AppContext";

export const RegisterView = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { navigate, showToast } = useApp();

  const handleRegister = async () => {
    setLoading(true);
    setError("");
    const { error: signUpErr } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName, username: username.trim() } },
    });
    if (signUpErr) {
      setError(signUpErr.message);
    } else {
      navigate("login");
      showToast("確認メールを送信しました。メールを確認してください。");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-6">アカウント登録</h1>
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        <div className="space-y-4">
          <input
            type="text"
            placeholder="表示名 *"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="ユーザー名（英数字・アンダースコアのみ）"
            value={username}
            onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="パスワード（6文字以上）"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleRegister}
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "登録中..." : "登録する"}
          </button>
        </div>
        <div className="mt-5 p-4 bg-blue-50 border border-blue-200 rounded-xl text-center">
          <p className="text-xs text-gray-600 mb-2 font-medium">
            ライターとして記事を書きたい方は、登録後にXでご連絡ください
          </p>
          <a
            href="https://x.com/SHARE_Quest_Off"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-black text-white text-xs font-bold rounded-full hover:bg-gray-800 transition-colors"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            @SHARE_Quest_Off にDMで応募
          </a>
        </div>
        <p className="text-center text-sm text-gray-500 mt-4">
          すでにアカウントをお持ちの方は
          <button onClick={() => navigate("login")} className="text-blue-600 underline ml-1">
            ログイン
          </button>
        </p>
      </div>
    </div>
  );
};
