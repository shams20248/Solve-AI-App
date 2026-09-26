import { useEffect, useMemo, useState } from 'react';

type Language = 'ar' | 'en' | 'fr';

type User = {
  id: number;
  email: string;
  name: string;
  role: string;
  plan: string;
};

type DashboardData = {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  activeClients: number;
  pendingInvoices: number;
  paidInvoices: number;
};

type Invoice = {
  id: number;
  invoice_number: string;
  customer_name: string;
  amount: number;
  status: string;
  due_date: string;
};

type Customer = {
  id: number;
  name: string;
  email: string;
  phone: string;
  type: string;
  balance: number;
  status: string;
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
    nav: ['لوحة التحكم', 'الفواتير', 'العملاء', 'التقارير', 'الاشتراكات'],
    tagline: 'منظومة محاسبة ذكية تدعم كل قرار مالي',
    start: 'ابدأ الآن',
    demo: 'عرض توضيحي',
    revenue: 'الإيرادات',
    expenses: 'المصاريف',
    netProfit: 'صافي الربح',
    activeClients: 'العملاء النشطون',
    invoicesPaid: 'الفواتير المسددة',
    aiInsights: 'تحليلات الذكاء الاصطناعي',
    overview: 'نظرة عامة',
    login: 'تسجيل الدخول',
    register: 'إنشاء حساب',
    logout: 'تسجيل الخروج',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    name: 'الاسم',
    company: 'اسم الشركة',
    invoices: 'الفواتير',
    customers: 'العملاء',
    plans: 'الاشتراكات',
    noData: 'لا توجد بيانات حالياً'
  },
  en: {
    brand: 'Solve AI',
    nav: ['Dashboard', 'Invoices', 'Customers', 'Reports', 'Plans'],
    tagline: 'Smart accounting software that supports every financial decision',
    start: 'Get started',
    demo: 'Book demo',
    revenue: 'Revenue',
    expenses: 'Expenses',
    netProfit: 'Net Profit',
    activeClients: 'Active clients',
    invoicesPaid: 'Invoices paid',
    aiInsights: 'AI insights',
    overview: 'Overview',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    email: 'Email',
    password: 'Password',
    name: 'Name',
    company: 'Company name',
    invoices: 'Invoices',
    customers: 'Customers',
    plans: 'Plans',
    noData: 'No data available'
  },
  fr: {
    brand: 'Solve AI',
    nav: ['Tableau', 'Factures', 'Clients', 'Rapports', 'Abonnements'],
    tagline: 'Logiciel de comptabilité intelligent pour chaque décision financière',
    start: 'Commencer',
    demo: 'Démo',
    revenue: 'Revenu',
    expenses: 'Dépenses',
    netProfit: 'Bénéfice net',
    activeClients: 'Clients actifs',
    invoicesPaid: 'Factures payées',
    aiInsights: 'Analyses IA',
    overview: 'Vue d\'ensemble',
    login: 'Connexion',
    register: 'Créer un compte',
    logout: 'Déconnexion',
    email: 'E-mail',
    password: 'Mot de passe',
    name: 'Nom',
    company: 'Nom de l\'entreprise',
    invoices: 'Factures',
    customers: 'Clients',
    plans: 'Abonnements',
    noData: 'Aucune donnée disponible'
  }
} as const;

const languageLabels: Record<Language, string> = {
  ar: 'العربية',
  en: 'English',
  fr: 'Français'
};

const API_URL = 'http://localhost:4000';

export default function App() {
  const [language, setLanguage] = useState<Language>('en');
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'));
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [showLoginForm, setShowLoginForm] = useState(!token);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const t = useMemo(() => translations[language], [language]);

  useEffect(() => {
    if (token) {
      loadUserData();
    }
  }, [token]);

  const loadUserData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [userRes, dashboardRes, invoicesRes, customersRes, plansRes] = await Promise.all([
        fetch(`${API_URL}/api/auth/me`, { headers }),
        fetch(`${API_URL}/api/dashboard/summary`, { headers }),
        fetch(`${API_URL}/api/invoices`, { headers }),
        fetch(`${API_URL}/api/customers`, { headers }),
        fetch(`${API_URL}/api/subscriptions/plans`, { headers })
      ]);

      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData);
      }

      if (dashboardRes.ok) {
        const dashboardData = await dashboardRes.json();
        setDashboard(dashboardData);
      }

      if (invoicesRes.ok) {
        const invoicesData = await invoicesRes.json();
        setInvoices(invoicesData);
      }

      if (customersRes.ok) {
        const customersData = await customersRes.json();
        setCustomers(customersData);
      }

      if (plansRes.ok) {
        const plansData = await plansRes.json();
        setPlans(plansData);
      }
    } catch (error) {
      console.error('Data load error:', error);
      setError('Failed to load data');
    }
  };

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await res.json();
      localStorage.setItem('auth_token', data.token);
      setToken(data.token);
      setUser(data.user);
      setShowLoginForm(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (name: string, email: string, password: string, companyName: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, companyName })
      });

      if (!res.ok) {
        throw new Error('Registration failed');
      }

      const data = await res.json();
      localStorage.setItem('auth_token', data.token);
      setToken(data.token);
      setUser(data.user);
      setShowRegisterForm(false);
      setShowLoginForm(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setToken(null);
    setUser(null);
    setShowLoginForm(true);
  };

  if (showLoginForm && !user) {
    return <LoginForm t={t} onLogin={handleLogin} onSwitch={() => { setShowLoginForm(false); setShowRegisterForm(true); }} loading={loading} error={error} lang={language} setLang={setLanguage} languageLabels={languageLabels} />;
  }

  if (showRegisterForm && !user) {
    return <RegisterForm t={t} onRegister={handleRegister} onSwitch={() => { setShowRegisterForm(false); setShowLoginForm(true); }} loading={loading} error={error} lang={language} setLang={setLanguage} languageLabels={languageLabels} />;
  }

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
          {user && <button className="primary-btn" onClick={handleLogout}>{t.logout}</button>}
        </div>
      </header>

      {user && (
        <main className="dashboard">
          <section className="section-block">
            <div className="section-heading">
              <h2>Welcome, {user.name}!</h2>
              <p>Plan: {user.plan}</p>
            </div>
          </section>

          <section className="section-block">
            <div className="section-heading">
              <h2>{t.overview}</h2>
            </div>
            <div className="summary-grid">
              <div className="summary-card">
                <span>{t.revenue}</span>
                <strong>${dashboard?.totalRevenue || 0}</strong>
              </div>
              <div className="summary-card">
                <span>{t.expenses}</span>
                <strong>${dashboard?.totalExpenses || 0}</strong>
              </div>
              <div className="summary-card">
                <span>{t.netProfit}</span>
                <strong>${dashboard?.netProfit || 0}</strong>
              </div>
              <div className="summary-card">
                <span>{t.activeClients}</span>
                <strong>{dashboard?.activeClients || 0}</strong>
              </div>
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
                    <th>Number</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.length > 0 ? (
                    invoices.map((inv) => (
                      <tr key={inv.id}>
                        <td>{inv.invoice_number}</td>
                        <td>{inv.customer_name}</td>
                        <td>${inv.amount}</td>
                        <td>{inv.status}</td>
                        <td>{inv.due_date || '-'}</td>
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
                customers.map((cust) => (
                  <div className="info-card" key={cust.id}>
                    <h4>{cust.name}</h4>
                    <p>{cust.type}</p>
                    <strong>${cust.balance}</strong>
                    <span>{cust.status}</span>
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
                    <button className="primary-btn">Upgrade</button>
                  </article>
                ))
              ) : (
                <div className="info-card"><h4>{t.noData}</h4></div>
              )}
            </div>
          </section>
        </main>
      )}
    </div>
  );
}

function LoginForm({ t, onLogin, onSwitch, loading, error, lang, setLang, languageLabels }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: any) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="brand">
          <div className="brand-mark">S</div>
          <span>{t.brand}</span>
        </div>
        <h2>{t.login}</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder={t.email}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder={t.password}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? 'Loading...' : t.login}
          </button>
        </form>
        <p>
          {t.name}? <button onClick={onSwitch} className="link-btn">{t.register}</button>
        </p>
        <select value={lang} onChange={(e) => setLang(e.target.value)}>
          {Object.entries(languageLabels).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

function RegisterForm({ t, onRegister, onSwitch, loading, error, lang, setLang, languageLabels }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');

  const handleSubmit = (e: any) => {
    e.preventDefault();
    onRegister(name, email, password, companyName);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="brand">
          <div className="brand-mark">S</div>
          <span>{t.brand}</span>
        </div>
        <h2>{t.register}</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder={t.name}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder={t.company}
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
          <input
            type="email"
            placeholder={t.email}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder={t.password}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? 'Loading...' : t.register}
          </button>
        </form>
        <p>
          {t.login}? <button onClick={onSwitch} className="link-btn">{t.login}</button>
        </p>
        <select value={lang} onChange={(e) => setLang(e.target.value)}>
          {Object.entries(languageLabels).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
