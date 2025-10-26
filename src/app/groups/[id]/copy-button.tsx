"use client";

export function CopyButton({ code }: { code: string }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    alert("招待コードをコピーしました");
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 transition-colors whitespace-nowrap"
    >
      コピー
    </button>
  );
}
