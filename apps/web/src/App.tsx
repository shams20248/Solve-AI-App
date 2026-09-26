import { useEffect, useMemo, useState } from 'react';

type Language = 'ar' | 'en' | 'fr';

type DashboardData = {
  kpis: {
    revenue: string;
    expenses: string;
    netProfit: string;
    activeClients: number;
    aiInsights: number;
    invoicesPaid: number;
  };
  summary: {
    cashFlow: string;
    burnRate: string;
    overdueInvoices: number;
    forecast: string;
  };
};

type Plan = {
  name: string;
  price: string;
  description: string;
  features: string[];
  popular?: boolean;
};

type Invoice = {
  id: string;
  client: string;
  value: string;
  status: string;
  due: string;
};

type Customer = {
  name: string;
  type: string;
  balance: string;
  status: string;
};

type Report = {
  title: string;
  value: string;
};

const translations = {
  ar: {
    brand: 'Solve AI',
    nav: ['لوحة التحكم', 'الفواتير', 'العملاء', 'التقارير', 'الاشتراكات'],
    tagline: 'منظومة محاسبة ذكية تدعم الشركة في كل قرار مالي.',
    start: 'ابدأ الآن',
    demo: 'عرض تجريبي',
    revenue: 'الإيرادات',
    expenses: 'المصاريف',
    netProfit: 'صافي الربح',
    activeClients: 'العملاء النشطون',
    invoicesPaid: 'الفواتير المسددة',
    aiInsights: 'تحليلات الذكاء الاصطناعي',
    overview: 'نظرة عامة',
    aiTitle: 'أداء الذكاء الاصطناعي',
    aiDesc: 'تتبع التدفقات النقدية، تنبؤات الإيرادات، وتحذيرات الأنشطة غير الاعتيادية.',
    invoices: 'الفواتير',
    customers: 'العملاء',
    reports: 'التقارير',
    plans: 'الاشتراكات',
    login: 'تسجيل الدخول',
    register: 'إنشاء حساب',
    askAi: 'اسأل الذكاء الاصطناعي',
    choosePlan: 'اختر الخطة',
    demoAI: 'تحليل مالي ذكي',
    noData: 'لا توجد بيانات حالياً.'
  },
  en: {
    brand: 'Solve AI',
    nav: ['Dashboard', 'Invoices', 'Customers', 'Reports', 'Plans'],
    tagline: 'Smart accounting software that supports every financial decision.',
    start: 'Get started',
    demo: 'Book demo',
    revenue: 'Revenue',
    expenses: 'Expenses',
    netProfit: 'Net Profit',
    activeClients: 'Active clients',
    invoicesPaid: 'Invoices paid',
    aiInsights: 'AI insights',
    overview: 'Overview',
    aiTitle: 'AI performance',
    aiDesc: 'Cash flow monitoring, revenue predictions, and alerts for unusual activity.',
    invoices: 'Invoices',
    customers: 'Customers',
    reports: 'Reports',
    plans: 'Plans',
    login: 'Login',
    register: 'Register',
    askAi: 'Ask the AI',
    choosePlan: 'Choose plan',
    demoAI: 'Smart financial analysis',
    noData: 'No data available yet.'
  },
  fr: {
    brand: 'Solve AI',
    nav: ['Tableau', 'Factures', 'Clients', 'Rapports', 'Abonnements'],
    tagline: 'Logiciel de comptabilité intelligent pour chaque décision financière.',
    start: 'Commencer',
    demo: 'Démo',
    revenue: 'Revenu',
    expenses: 'Dépenses',
    netProfit: 'Bénéfice net',
    activeClients: 'Clients actifs',
    invoicesPaid: 'Factures payées',
    aiInsights: 'Analyses IA',
    overview: 'Vue d’ensemble',
    aiTitle: 'Performance IA',
    aiDesc: 'Suivi de trésorerie, prévisions de revenus et alertes sur les activités inhabituelles.',
    invoices: 'Factures',
    customers: 'Clients',
    reports: 'Rapports',
    plans: 'Abonnements',
    login: 'Connexion',
    register: 'Créer un compte',
    askAi: 'Demander à l’IA',
    choosePlan: 'Choisir le plan',
    demoAI: 'Analyse financière intelligente',
    noData: 'Aucune donnée disponible pour le moment.'
  }
} as const;

const languageLabels: Record<Language, string> = {
  ar: 'العربية',
  en: 'English',
  fr: 'Français'
};

export default function App() {
  const [language, setLanguage] = useState<Language>('en');
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [aiResponse, setAiResponse] = useState<string>('');
  const [query, setQuery] = useState('What should we improve in our cash flow this month?');

  useEffect(() => {
    const load = async () => {
      try {
        const [dashboardRes, plansRes, invoicesRes, customersRes, reportsRes] = await Promise.all([
          fetch('http://localhost:4000/api/dashboard'),
          fetch('http://localhost:4000/api/plans'),
          fetch('http://localhost:4000/api/invoices'),
          fetch('http://localhost:4000/api/customers'),
          fetch('http://localhost:4000/api/reports')
        ]);

        const dashboardData = await dashboardRes.json();
        const plansData = await plansRes.json();
        const invoicesData = await invoicesRes.json();
        const customersData = await customersRes.json();
        const reportsData = await reportsRes.json();

        setDashboard(dashboardData);
        setPlans(plansData);
        setInvoices(invoicesData);
        setCustomers(customersData);
        setReports(reportsData);
      } catch (error) {
        console.error('Data load failed:', error);
      }
    };

    void load();
  }, []);

  const t = useMemo(() => translations[language], [language]);

  const askAi = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: query })
      });

      const data = await res.json();
      setAiResponse(data.summary + ' ' + data.recommendations.join(' '));
    } catch (error) {
      console.error('AI request failed:', error);
      setAiResponse('AI service is not available right now.');
    }
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">S</div>
          <span>{t.brand}</span>
        </div>

        <nav className="nav">
          {t.nav.map((item) => (
            <a href="#" key={item}>{item}</a>
          ))}
        </nav>

        <div className="header-actions">
          <select value={language} onChange={(e) => setLanguage(e.target.value as Language)}>
            {Object.entries(languageLabels).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <button className="primary-btn">{t.login}</button>
          <button className="secondary-btn">{t.register}</button>
        </div>
      </header>

      <main className="hero">
        <div className="hero-copy">
          <span className="eyebrow">AI Accounting Platform</span>
          <h1>Solve AI</h1>
          <p>{t.tagline}</p>
          <div className="cta-row">
            <button className="primary-btn">{t.start}</button>
            <button className="secondary-btn">{t.demo}</button>
          </div>
        </div>

        <div className="hero-card">
          <div className="kpi-grid">
            <div className="stat-box">
              <span>{t.revenue}</span>
              <strong>{dashboard?.kpis.revenue ?? '$148.5K'}</strong>
            </div>
            <div className="stat-box">
              <span>{t.expenses}</span>
              <strong>{dashboard?.kpis.expenses ?? '$67.2K'}</strong>
            </div>
            <div className="stat-box">
              <span>{t.netProfit}</span>
              <strong>{dashboard?.kpis.netProfit ?? '$81.3K'}</strong>
            </div>
            <div className="stat-box accent">
              <span>{t.aiInsights}</span>
              <strong>{dashboard?.kpis.aiInsights ?? 32}</strong>
            </div>
          </div>
        </div>
      </main>

      <section className="section-block">
        <div className="section-heading">
          <h2>{t.overview}</h2>
        </div>
        <div className="summary-grid">
          <div className="summary-card">
            <span>{t.activeClients}</span>
            <strong>{dashboard?.kpis.activeClients ?? 486}</strong>
          </div>
          <div className="summary-card">
            <span>{t.invoicesPaid}</span>
            <strong>{dashboard?.kpis.invoicesPaid ?? 94}%</strong>
          </div>
          <div className="summary-card">
            <span>Cash Flow</span>
            <strong>{dashboard?.summary.cashFlow ?? '+12.4%'}</strong>
          </div>
          <div className="summary-card">
            <span>Forecast</span>
            <strong>{dashboard?.summary.forecast ?? '$210K'}</strong>
          </div>
        </div>
      </section>

      <section className="section-block double">
        <div className="panel-card">
          <div className="mini-header">
            <h3>{t.aiTitle}</h3>
          </div>
          <p>{t.aiDesc}</p>
          <div className="ai-box">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows={4}
            />
            <button className="primary-btn" onClick={askAi}>{t.askAi}</button>
          </div>
          <div className="ai-output">{aiResponse || t.noData}</div>
        </div>

        <div className="panel-card">
          <div className="mini-header">
            <h3>{t.reports}</h3>
          </div>
          <ul className="list">
            {reports.length > 0 ? (
              reports.map((report) => (
                <li key={report.title}>
                  <span>{report.title}</span>
                  <strong>{report.value}</strong>
                </li>
              ))
            ) : (
              <li><span>{t.noData}</span></li>
            )}
          </ul>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <h2>{t.invoices}</h2>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Client</th>
                <th>Value</th>
                <th>Status</th>
                <th>Due</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length > 0 ? (
                invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td>{invoice.id}</td>
                    <td>{invoice.client}</td>
                    <td>{invoice.value}</td>
                    <td>{invoice.status}</td>
                    <td>{invoice.due}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={5}>{t.noData}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <h2>{t.customers}</h2>
        </div>
        <div className="cards-grid">
          {customers.length > 0 ? (
            customers.map((customer) => (
              <div className="info-card" key={customer.name}>
                <h4>{customer.name}</h4>
                <p>{customer.type}</p>
                <strong>{customer.balance}</strong>
                <span>{customer.status}</span>
              </div>
            ))
          ) : (
            <div className="info-card"><h4>{t.noData}</h4></div>
          )}
        </div>
      </section>

      <section className="section-block pricing-block">
        <div className="section-heading">
          <h2>{t.plans}</h2>
        </div>
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
                <button className="primary-btn">{t.choosePlan}</button>
              </article>
            ))
          ) : (
            <div className="info-card"><h4>{t.noData}</h4></div>
          )}
        </div>
      </section>
    </div>
  );
}
