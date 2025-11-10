import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-200 border-t border-gray-200 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col items-center justify-center gap-2 text-sm text-gray-600">
          <p>
            © {currentYear}{" "}
            <Link
              href="https://benext-corp.co.jp/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
            >
              合同会社benext
            </Link>
          </p>
          <p className="text-xs text-gray-500">All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
