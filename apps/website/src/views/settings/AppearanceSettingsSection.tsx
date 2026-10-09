export function AppearanceSettingsSection({
  fontSize,
  setFontSize,
  showToast,
}: {
  fontSize: string;
  setFontSize: React.Dispatch<React.SetStateAction<string>>;
  showToast: (msg: string) => void;
}) {
  const options = [
    { value: "small", label: "小", desc: "コンパクト表示" },
    { value: "medium", label: "中（標準）", desc: "通常の文字サイズ" },
    { value: "large", label: "大", desc: "読みやすい大きめサイズ" },
    { value: "xlarge", label: "特大", desc: "見やすさ最重視" },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 bg-gray-50/50 border-b border-gray-100">
        <h2 className="font-bold text-gray-900 text-sm">表示・文字サイズ設定</h2>
        <p className="text-xs text-gray-500 mt-0.5">記事本文のフォントサイズを調整できます</p>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                setFontSize(opt.value);
                showToast(`文字サイズを「${opt.label}」に変更しました`);
              }}
              className={`p-3 rounded-xl border text-center transition-all ${
                fontSize === opt.value
                  ? "border-blue-500 bg-blue-50/50 text-blue-700 font-bold ring-2 ring-blue-400/20"
                  : "border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <p className="text-sm font-bold">{opt.label}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
