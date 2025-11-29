export function Footer() {
  return (
    <footer className="bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 px-6 py-4 text-xs text-slate-600 dark:text-slate-400">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <p>&copy; 2024 ERP Shell. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-slate-900 dark:hover:text-white">Privacy</a>
          <a href="#" className="hover:text-slate-900 dark:hover:text-white">Terms</a>
          <a href="#" className="hover:text-slate-900 dark:hover:text-white">Support</a>
        </div>
      </div>
    </footer>
  );
}
