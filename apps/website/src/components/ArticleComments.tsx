import { useState, useEffect } from "react";
import { MessageSquare, Send, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabase";

export interface CommentItem {
  id: string;
  articleId: string;
  authorName: string;
  authorId?: string;
  content: string;
  createdAt: string;
}

const COMMENTS_STORAGE_KEY_PREFIX = "share_quest_comments_";

export function ArticleComments({ articleId }: { articleId: string }) {
  const { profile } = useAuth();
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [authorName, setAuthorName] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const storageKey = `${COMMENTS_STORAGE_KEY_PREFIX}${articleId}`;

  useEffect(() => {
    // ローカルストレージから読み込み
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setComments(JSON.parse(stored));
      }
    } catch {
      // ignore
    }

    // Supabase から取得（テーブルが存在する場合）
    void supabase
      .from("article_comments")
      .select("id, article_id, author_name, author_id, content, created_at")
      .eq("article_id", articleId)
      .order("created_at", { ascending: true })
      .then(({ data, error: fetchErr }) => {
        if (!fetchErr && data && data.length > 0) {
          const loaded: CommentItem[] = data.map((d: any) => ({
            id: d.id,
            articleId: d.article_id,
            authorName: d.author_name,
            authorId: d.author_id,
            content: d.content,
            createdAt: d.created_at,
          }));
          setComments(loaded);
          try {
            localStorage.setItem(storageKey, JSON.stringify(loaded));
          } catch {
            // ignore
          }
        }
      });
  }, [articleId, storageKey]);

  useEffect(() => {
    if (profile?.display_name) {
      setAuthorName(profile.display_name);
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = authorName.trim() || (profile?.display_name ?? "匿名読者");
    const trimmedContent = content.trim();

    if (!trimmedContent) {
      setError("コメントを入力してください");
      return;
    }
    if (trimmedContent.length > 500) {
      setError("コメントは500文字以内で入力してください");
      return;
    }

    setSubmitting(true);
    setError("");

    const newComment: CommentItem = {
      id: "comment_" + Date.now(),
      articleId,
      authorName: trimmedName,
      authorId: profile?.id,
      content: trimmedContent,
      createdAt: new Date().toISOString(),
    };

    const updated = [...comments, newComment];
    setComments(updated);
    setContent("");

    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {
      // ignore
    }

    // Supabase への保存試行（失敗してもUIは落とさない）
    try {
      await supabase.from("article_comments").insert({
        article_id: articleId,
        author_name: trimmedName,
        author_id: profile?.id,
        content: trimmedContent,
      });
    } catch {
      // ignore
    }

    setSubmitting(false);
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
    } catch {
      return "";
    }
  };

  return (
    <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mt-8">
      <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
        <MessageSquare className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-bold text-gray-800">感想・コメント ({comments.length})</h3>
      </div>

      {/* コメント一覧 */}
      {comments.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm">
          <p>まだコメントはありません。</p>
          <p className="text-xs mt-1">最初の感想や応援メッセージを投稿してみましょう！</p>
        </div>
      ) : (
        <div className="space-y-4 mb-8">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-sm text-gray-800">{comment.authorName}</span>
                </div>
                <span className="text-[11px] text-gray-400">{formatDate(comment.createdAt)}</span>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap pl-9">{comment.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* コメント投稿フォーム */}
      <form onSubmit={handleSubmit} className="border-t border-gray-100 pt-6 space-y-4">
        <h4 className="text-sm font-bold text-gray-700">コメントを投稿する</h4>
        <div>
          <input
            type="text"
            placeholder="お名前（未入力の場合は匿名）"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            maxLength={30}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div>
          <textarea
            placeholder="記事の感想や応援メッセージをご記入ください（最大500文字）"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            maxLength={500}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          />
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting || !content.trim()}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? "送信中..." : "コメントを投稿"}</span>
          </button>
        </div>
      </form>
    </section>
  );
}
