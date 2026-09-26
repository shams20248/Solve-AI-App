import { useEffect, useMemo, useState } from 'react';

type Language = 'ar' | 'en' | 'fr';

type Summary = {
  totalRevenue: string;
  activeAccounts: number;
  aiInsights: number;
  paidInvoices: number;
};

type Plan = {
  name: string;
  price: string;
  description: string;
  features: string[];
  popular?: boolean;
};

const translations = {
  ar: {
    brand: 'Solve AI',
    nav: ['لوحة التحكم', 'الفواتير', 'التقارير', 'العملاء'],
    heading: 'منظومة محاسبة ذكية في خدمة أعمالك',
    subheading: 'حل احترافي لإدارة التعاملات المالية، التحليلات التنبؤية، والذكاء الاصطناعي.',
    cta: 'ابدأ مجانًا',
    pricing: 'الاشتراكات',
    statsTitle: 'مؤشرات الأداء',
    aiTitle: 'رؤية الذكاء الاصطناعي',
    aiBody: 'توقعات بالنمو المالي، تنبيهات السحب، والحلول المقترحة لتحسين التدفق النقدي.',
    monthly: 'شهري',
    semi: 'نصف سنوي',
    annual: 'سنوي'
  },
  en: {
    brand: 'Solve AI',
    nav: ['Dashboard', 'Invoices', 'Reports', 'Clients'],
    heading: 'Smart accounting systems that drive business growth',
    subheading: 'A professional solution for finance management, AI-powered insights, and real-time decisions.',
    cta: 'Start free',
    pricing: 'Subscriptions',
    statsTitle: 'Performance Overview',
    aiTitle: 'AI Insight',
    aiBody: 'Forecasts for cash flow, alerts for unusual activity, and recommendations to improve efficiency.',
    monthly: 'Monthly',
    semi: 'Semi-Annual',
    annual: 'Annual'
  },
  fr: {
    brand: 'Solve AI',
    nav: ['Tableau', 'Factures', 'Rapports', 'Clients'],
    heading: 'Système de comptabilité intelligente pour votre activité',
    subheading: 'Une solution professionnelle pour la gestion financière, les analyses prédictives et l’intelligence artificielle.',
    cta: 'Commencer',
    pricing: 'Abonnements',
    statsTitle: 'Vue d’ensemble',
    aiTitle: 'Analyse IA',
    aiBody: 'Prévisions de trésorerie, alertes sur les anomalies et recommandations pour améliorer les performances.',
    monthly: 'Mensuel',
    semi: 'Semestriel',
    annual: 'Annuel'
  }
} as const;

const languageLabels: Record<Language, string> = {
  ar: 'العربية',
  en: 'English',
  fr: 'Français'
};

export default function App() {
  const [language, setLanguage] = useState<Language>('en');
  const [summary, setSummary] = useState<Summary | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [summaryRes, plansRes] = await Promise.all([
          fetch('http://localhost:4000/api/summary'),
          fetch('http://localhost:4000/api/plans')
        ]);

        const summaryData = await summaryRes.json();
        const plansData = await plansRes.json();

        setSummary(summaryData);
        setPlans(plansData);
      } catch (error) {
        console.error('Bootstrap data failed', error);
      }
    };

    loadData();
  }, []);

  const t = useMemo(() => translations[language], [language]);

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-block">
          <div className="brand-dot">S</div>
          <span>{t.brand}</span>
        </div>

        <nav className="nav">
          {t.nav.map((item) => (
            <a href="#" key={item}>
              {item}
            </a>
          ))}
        </nav>

        <div className="actions">
          <select value={language} onChange={(e) => setLanguage(e.target.value as Language)}>
            {Object.entries(languageLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          <button className="primary-btn">{t.cta}</button>
        </div>
      </header>

      <main className="hero">
        <section className="hero-copy">
          <span className="eyebrow">AI Accounting Platform</span>
          <h1>{t.heading}</h1>
          <p>{t.subheading}</p>
          <div className="cta-row">
            <button className="primary-btn">{t.cta}</button>
            <button className="secondary-btn">Book Demo</button>
          </div>
        </section>

        <section className="hero-panel">
          <div className="mini-card highlight">
            <span>Net Cash Flow</span>
            <strong>{summary?.totalRevenue ?? '$148.5K'}</strong>
          </div>
          <div className="mini-grid">
            <div className="mini-card">
              <span>Accounts</span>
              <strong>{summary?.activeAccounts ?? 486}</strong>
            </div>
            <div className="mini-card">
              <span>AI Insights</span>
              <strong>{summary?.aiInsights ?? 32}</strong>
            </div>
            <div className="mini-card">
              <span>Paid</span>
              <strong>{summary?.paidInvoices ?? 94}%</strong>
            </div>
          </div>
        </section>
      </main>

      <section className="stats-block">
        <h2>{t.statsTitle}</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <span>Gross Revenue</span>
            <strong>{summary?.totalRevenue ?? '$148.5K'}</strong>
          </div>
          <div className="stat-card">
            <span>Customers</span>
            <strong>{summary?.activeAccounts ?? 486}</strong>
          </div>
          <div className="stat-card">
            <span>Insights</span>
            <strong>{summary?.aiInsights ?? 32}</strong>
          </div>
          <div className="stat-card">
            <span>Invoices Paid</span>
            <strong>{summary?.paidInvoices ?? 94}%</strong>
          </div>
        </div>
      </section>

      <section className="insight-panel">
        <div>
          <span className="eyebrow">Dashboard</span>
          <h3>{t.aiTitle}</h3>
        </div>
        <p>{t.aiBody}</p>
        <ul>
          <li>Predictive cash flow analysis</li>
          <li>Automated expense recommendations</li>
          <li>Unusual transaction alerts</li>
        </ul>
      </section>

      <section className="pricing-block">
        <h2>{t.pricing}</h2>
        <div className="pricing-grid">
          {plans.length > 0 ? (
            plans.map((plan) => (
              <article key={plan.name} className={`plan-card ${plan.popular ? 'popular' : ''}`}>
                {plan.popular && <span className="badge">Popular</span>}
                <h3>{plan.name}</h3>
                <div className="price">{plan.price}</div>
                <p>{plan.description}</p>
                <ul>
                  {plan.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
                <button className="primary-btn">Choose plan</button>
              </article>
            ))
          ) : (
            [
              { name: 'Starter', price: '$29/mo', description: 'For small teams', features: ['Accounting dashboard', 'Basic reports', 'AI Q&A'] },
              { name: 'Growth', price: '$79/mo', description: 'For growing businesses', features: ['Everything in Starter', 'Advanced analytics', 'Multi-user access'], popular: true },
              { name: 'Enterprise', price: '$149/mo', description: 'For large organizations', features: ['Custom workflows', 'Priority support', 'Dedicated onboarding'] }
            ].map((plan) => (
              <article key={plan.name} className={`plan-card ${plan.popular ? 'popular' : ''}`}>
                {plan.popular && <span className="badge">Popular</span>}
                <h3>{plan.name}</h3>
                <div className="price">{plan.price}</div>
                <p>{plan.description}</p>
                <ul>
                  {plan.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
                <button className="primary-btn">Choose plan</button>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
