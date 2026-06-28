import { useState } from "react";
import { supabase } from "../../supabase";
import { useApp } from "../../context/AppContext";

export const LoginView = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { navigate } = useApp();

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    const { error: loginErr } = await supabase.auth.signInWithPassword({ email, password });
    if (loginErr) setError("メールアドレスまたはパスワードが間違っています");
    else navigate("home");
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    const { error: googleErr } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (googleErr) setError(googleErr.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-6">ログイン</h1>
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        <div className="space-y-4">
          <input
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="space-y-1">
            <input
              type="password"
              placeholder="パスワード"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="text-right">
              <button
                onClick={() => navigate("forgotPassword")}
                className="text-xs text-blue-600 hover:underline font-bold"
              >
                パスワードをお忘れの方はこちら
              </button>
            </div>
          </div>
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "ログイン中..." : "ログイン"}
          </button>

          <div className="relative my-4 flex py-1 items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-4 text-gray-400 text-xs font-bold">または</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3 border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 flex items-center justify-center gap-2 bg-white transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69c-.29 1.5-.1.84-2.48 2.43v2.01h4.02c2.34-2.15 3.69-5.32 3.69-8.29z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.83-2.97c-1.08.73-2.46 1.16-4.1 1.16-3.15 0-5.81-2.13-6.76-5.01H1.17v3.1A11.988 11.988 0 0 0 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.24 14.27a7.25 7.25 0 0 1 0-4.54V6.63H1.17a11.98 11.98 0 0 0 0 10.74l4.07-3.1z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0A11.988 11.988 0 0 0 1.17 6.63l4.07 3.1c.95-2.88 3.61-5.01 6.76-5.01z"
              />
            </svg>
            Googleでログイン
          </button>
        </div>
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-400 mb-2">アカウントをお持ちでない方</p>
          <button
            onClick={() => navigate("register")}
            className="w-full py-3 border-2 border-blue-500 text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors"
          >
            新規アカウント登録
          </button>
        </div>
      </div>
    </div>
  );
};
