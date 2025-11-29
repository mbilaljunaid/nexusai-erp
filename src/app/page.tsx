import { BaseLayout } from '@/components/BaseLayout';

export default function Home() {
  return (
    <BaseLayout>
      <div className="max-w-4xl">
        <h2 className="text-3xl font-bold mb-6">Welcome to ERP Shell</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { title: 'Dashboard', desc: 'Overview of key metrics', icon: '📊' },
            { title: 'CRM', desc: 'Customer relationship management', icon: '👥' },
            { title: 'ERP', desc: 'Enterprise resource planning', icon: '💼' },
            { title: 'HR', desc: 'Human resources management', icon: '👨‍💼' },
            { title: 'Analytics', desc: 'Advanced reporting & insights', icon: '📈' },
            { title: 'Settings', desc: 'System configuration', icon: '⚙️' },
          ].map((card) => (
            <div
              key={card.title}
              className="p-6 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow"
            >
              <div className="text-3xl mb-2">{card.icon}</div>
              <h3 className="font-semibold text-lg mb-1">{card.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </BaseLayout>
  );
}
