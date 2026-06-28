import { useState } from "react";
import { supabase } from "../../supabase";
import { useApp } from "../../context/AppContext";

export const ForgotPasswordView = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { navigate, showToast } = useApp();

  const handleSendEmail = async () => {
    if (!email.trim()) {
      setError("メールアドレスを入力してください");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess(false);

    const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin + "/reset-password",
    });

    if (resetErr) {
      setError(resetErr.message);
    } else {
      setSuccess(true);
      showToast("再設定用メールを送信しました");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-2">パスワード再設定</h1>
        <p className="text-xs text-gray-500 text-center mb-6 font-medium">
          ご登録のメールアドレスに再設定用リンクをお送りします
        </p>
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4 text-center">
            <p className="text-sm font-bold text-green-800">送信完了</p>
            <p className="text-xs text-green-600 mt-1">
              メールをご確認のうえ、リンクから再設定を行ってください。
            </p>
          </div>
        )}
        <div className="space-y-4">
          <input
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSendEmail}
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "送信中..." : "再設定メールを送信"}
          </button>
          <button
            onClick={() => navigate("login")}
            className="w-full py-3 border border-gray-300 text-gray-600 font-bold rounded-xl hover:bg-gray-50 bg-white"
          >
            ログイン画面に戻る
          </button>
        </div>
      </div>
    </div>
  );
};
