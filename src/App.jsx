import { useState, useMemo, useEffect, createContext, useContext, memo, useCallback } from 'react'
import { usePaystackPayment } from 'react-paystack'
import { 
  HashRouter, 
  Routes, 
  Route, 
  Navigate, 
  useNavigate,
  Link
} from 'react-router-dom'
import { 
  ShoppingBag, Trash2, Plus, Minus, Search, User, 
  LayoutDashboard, Package, History, Settings, X, 
  CreditCard, Banknote, ChevronRight, Loader2, LogOut,
  UserPlus, ShieldCheck, Store, ArrowRight, Wallet, 
  CheckCircle2, CreditCard as PaystackIcon, Clock, 
  ChevronDown, Settings2, Info, Bell, Menu as MenuIcon
} from 'lucide-react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  initializeData, getProducts, getCategories, getSales, saveSale, 
  authenticate, signup as mockSignup, getUsers, getActivities,
  createStaff, guestLogin
} from './mockData'

initializeData()

function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// --- AUTH CONTEXT ---
const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('pos_user')
    return saved ? JSON.parse(saved) : null
  })

  const login = (userData) => {
    setUser(userData)
    localStorage.setItem('pos_user', JSON.stringify(userData))
  }

  const logout = () => {
    if (user?.role === 'Guest') {
      localStorage.removeItem('guest_orders')
    }
    setUser(null)
    localStorage.removeItem('pos_user')
    localStorage.removeItem('pos_token')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isGuest: user?.role === 'Guest' }}>
      {children}
    </AuthContext.Provider>
  )
}

// --- SHARED UI ---

function NavItemV2({ icon, label, active = false, onClick }) {
  return (
    <motion.div 
      whileHover={{ x: 5 }}
      onClick={onClick}
      className={cn(
        "flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all",
        active ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
      )}
    >
      <div className={cn(active && "scale-110 transition-transform")}>{icon}</div>
      <span className="font-bold tracking-tight">{label}</span>
    </motion.div>
  )
}

function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-6 lg:mb-10">
      <h2 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">{title}</h2>
      <p className="text-slate-500 font-medium text-base lg:text-lg">{subtitle}</p>
    </div>
  )
}

function TerminalFooter() {
  return (
    <div className="mt-16 lg:absolute lg:bottom-10 lg:left-12 lg:right-12 flex flex-col md:flex-row justify-between items-center gap-8">
      <div className="flex items-center gap-8 text-[11px] font-medium text-slate-400">
        <span className="opacity-50 tracking-tight">© 2026 ZenPOS Terminal</span>
        <nav className="flex items-center gap-6">
          <Link to="/privacy" className="hover:text-indigo-600 transition-colors">Privacy</Link>
          <Link to="/terms" className="hover:text-indigo-600 transition-colors">Terms</Link>
          <Link to="/help" className="hover:text-indigo-600 transition-colors">Help</Link>
        </nav>
      </div>
      
      <motion.a 
        href="https://iyonicorp.com" 
        target="_blank" 
        rel="noopener noreferrer"
        whileHover={{ y: -2 }}
        className="flex items-center gap-3 px-5 py-2.5 bg-slate-900 rounded-2xl shadow-2xl shadow-slate-200 hover:shadow-indigo-500/20 transition-all group"
      >
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Powered by</span>
        <div className="h-4 w-px bg-slate-800" />
        <div className="flex items-center gap-2">
          <span className="text-sm font-black text-white tracking-tighter">IYONICORP</span>
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </div>
        </div>
      </motion.a>
    </div>
  )
}

function LegalLayout({ children, title, icon }) {
  const navigate = useNavigate()
  return (
    <div className="h-screen bg-slate-50 font-sans selection:bg-indigo-500 selection:text-white flex flex-col overflow-hidden">
      <nav className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-6 lg:px-12 sticky top-0 z-50 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
            <ShoppingBag size={24} />
          </div>
          <span className="font-black text-xl tracking-tighter text-indigo-900 uppercase">ZenPOS</span>
        </div>
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all text-sm font-bold text-slate-600"
        >
          <X size={18} /> Close
        </button>
      </nav>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50">
        <div className="max-w-4xl mx-auto py-12 lg:py-24 px-6">
          <div className="mb-16">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
              {icon}
            </div>
            <h1 className="text-4xl lg:text-6xl font-black text-slate-900 tracking-tighter mb-4">{title}</h1>
            <p className="text-slate-500 font-medium text-lg italic">Last Updated: March 16, 2026</p>
          </div>
          
          <div className="prose prose-slate prose-indigo max-w-none">
            {children}
          </div>
          
          <div className="mt-24 pt-12 border-t border-slate-200 text-center">
            <p className="text-slate-400 font-medium mb-8">Need further clarification?</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/help" className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100">Visit Help Center</Link>
              <a href="mailto:legal@zenpos.com" className="px-8 py-4 bg-white border border-slate-200 text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition-all">Contact Legal Team</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" icon={<ShieldCheck size={32} />}>
      <div className="space-y-12">
        <section className="bg-white p-8 lg:p-10 rounded-[32px] border border-slate-100 shadow-sm">
          <h2 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">1. Data Collection</h2>
          <p className="text-slate-600 leading-relaxed font-medium">
            At ZenPOS, we take your security seriously. We collect terminal usage metrics, personnel login timestamps, and transaction metadata to ensure system integrity and performance optimization. We do not sell your personal or business data to third parties.
          </p>
        </section>

        <section className="bg-white p-8 lg:p-10 rounded-[32px] border border-slate-100 shadow-sm">
          <h2 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">2. Secure Storage</h2>
          <p className="text-slate-600 leading-relaxed font-medium">
            All sensitive credentials, including security keys and passcodes, are encrypted using enterprise-grade AES-256 protocols before being stored in our distributed cloud infrastructure. Your local terminal data is protected by biometric-ready security layers.
          </p>
        </section>

        <section className="bg-white p-8 lg:p-10 rounded-[32px] border border-slate-100 shadow-sm">
          <h2 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">3. Cookies & Tracking</h2>
          <p className="text-slate-600 leading-relaxed font-medium">
            Our terminal uses functional session tokens to keep your station authenticated. We utilize lightweight telemetry to detect system latency and prevent unauthorized access attempts from unknown network origins.
          </p>
        </section>
      </div>
    </LegalLayout>
  )
}

function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" icon={<Info size={32} />}>
      <div className="space-y-12">
        <section className="bg-white p-8 lg:p-10 rounded-[32px] border border-slate-100 shadow-sm">
          <h2 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">1. License Grant</h2>
          <p className="text-slate-600 leading-relaxed font-medium">
            Subject to these terms, ZenPOS grants you a non-exclusive, non-transferable license to operate this terminal software for authorized commercial retail purposes within your organization.
          </p>
        </section>

        <section className="bg-white p-8 lg:p-10 rounded-[32px] border border-slate-100 shadow-sm">
          <h2 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">2. Personnel Conduct</h2>
          <p className="text-slate-600 leading-relaxed font-medium">
            You are responsible for maintaining the confidentiality of your terminal credentials. Any actions performed under your security passcodes are your sole responsibility. Unauthorized attempts to bypass system protocols will result in immediate terminal deactivation.
          </p>
        </section>

        <section className="bg-white p-8 lg:p-10 rounded-[32px] border border-slate-100 shadow-sm">
          <h2 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">3. System Availability</h2>
          <p className="text-slate-600 leading-relaxed font-medium">
            While we strive for 99.9% terminal uptime, ZenPOS is not liable for data loss or business interruption during scheduled maintenance or unforeseen infrastructure outages. We recommend regular offline backup of critical inventory records.
          </p>
        </section>
      </div>
    </LegalLayout>
  )
}

function HelpPage() {
  const faqs = [
    { q: "How do I process a refund?", a: "Navigate to 'System Log', find the transaction ID, and select 'Initiate Reversal' (Manager approval required)." },
    { q: "Can I use ZenPOS offline?", a: "Yes, our 'Sync-Sync' technology allows local terminal operation. Data will automatically push to the cloud once a connection is restored." },
    { q: "Adding new personnel?", a: "Managers can access the 'Team Portal' to generate invitation tokens for new staff members." },
    { q: "Payment methods?", a: "We support cash, integrated Paystack digital payments, and simulated credit transactions for testing." }
  ]

  return (
    <LegalLayout title="Help Center" icon={<Bell size={32} />}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {faqs.map((faq, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <h3 className="text-xl font-black text-slate-900 mb-3 flex items-center gap-3">
              <div className="w-2 h-2 bg-indigo-500 rounded-full" />
              {faq.q}
            </h3>
            <p className="text-slate-500 font-medium leading-relaxed">{faq.a}</p>
          </motion.div>
        ))}
      </div>

      <div className="bg-slate-900 rounded-[40px] p-10 lg:p-16 text-center text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20" />
        <div className="relative z-10">
          <h2 className="text-3xl font-black mb-4">Direct Support Required?</h2>
          <p className="text-slate-400 mb-8 max-w-lg mx-auto font-medium">Our technical engineers are on standby 24/7 to assist with terminal critical failures.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="px-10 py-5 bg-indigo-600 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-500/20">Open Support Ticket</button>
            <button className="px-10 py-5 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-white/20 transition-all">Emergency Hotline</button>
          </div>
        </div>
      </div>
    </LegalLayout>
  )
}

// --- PAGES ---

function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleGuestLogin = () => {
    setLoading(true)
    setTimeout(() => {
      const guest = guestLogin()
      login(guest)
      navigate('/')
      setLoading(false)
    }, 400)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setTimeout(() => {
      const user = authenticate(email, password)
      if (user) {
        login(user)
        if (user.role === 'Manager' || user.role === 'Staff') {
          navigate('/dashboard')
        } else {
          navigate('/')
        }
      } else {
        setError('Invalid credentials')
      }
      setLoading(false)
    }, 500)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row font-sans selection:bg-indigo-500 selection:text-white overflow-y-auto">
      {/* Visual Side (Left) */}
      <div className="hidden lg:flex lg:w-7/12 relative bg-slate-900 items-center justify-center p-8 lg:p-12">
        {/* Animated Background Gradients */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/20 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-600/20 blur-[120px] rounded-full animate-pulse [animation-delay:2s]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />
        </div>

        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 w-full max-w-2xl"
        >
          <div className="mb-12">
            <div className="w-20 h-20 bg-indigo-600 rounded-[32px] flex items-center justify-center text-white mb-8 shadow-2xl shadow-indigo-500/30">
              <ShoppingBag size={40} />
            </div>
            <h1 className="text-6xl xl:text-8xl font-black text-white tracking-tighter mb-6 leading-none">
              Modern<br />
              <span className="text-indigo-500 text-stroke-white">Terminal.</span>
            </h1>
            <p className="text-slate-400 text-xl font-medium max-w-lg leading-relaxed">
              Experience the next generation of retail management with ZenPOS. Fast, secure, and beautifully crafted for performance.
            </p>
          </div>

          {/* Feature Badges */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: <ShieldCheck size={20} />, text: "Enterprise Security" },
              { icon: <Clock size={20} />, text: "Real-time Sync" },
              { icon: <LayoutDashboard size={20} />, text: "Advanced Analytics" },
              { icon: <Wallet size={20} />, text: "Instant Payments" }
            ].map((f, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + (i * 0.1) }}
                className="flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl text-white font-bold"
              >
                <span className="text-indigo-400">{f.icon}</span>
                <span className="text-sm tracking-tight">{f.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Form Side (Right) */}
      <div className="min-h-screen lg:flex-1 flex flex-col justify-center p-6 sm:p-12 lg:p-24 bg-white relative overflow-y-auto py-12 lg:py-24">
        {/* Mobile Logo */}
        <div className="lg:hidden absolute top-6 left-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
            <ShoppingBag size={18} />
          </div>
          <span className="font-black text-xl tracking-tighter text-slate-900 uppercase">ZenPOS</span>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md mx-auto"
        >
          <div className="mb-8 lg:mb-12">
            <h2 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tighter mb-3">Welcome Back.</h2>
            <p className="text-slate-500 font-medium text-sm lg:text-base">Please enter your terminal credentials to continue.</p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 text-sm font-bold flex items-center gap-3 border border-red-100"
            >
              <Info size={18} />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
            <div className="space-y-2 group">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Personnel Email</label>
              <div className="relative">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={20} />
                <input 
                  type="email" required placeholder="name@zenpos.com"
                  className="w-full pl-14 pr-6 py-4 lg:py-5 bg-slate-50 border border-slate-100 rounded-[20px] lg:rounded-[24px] focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all outline-none text-slate-900 font-medium placeholder:text-slate-300 text-sm lg:text-base"
                  value={email} onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2 group">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Security Key</label>
                <button type="button" className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Forgot Key?</button>
              </div>
              <div className="relative">
                <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={20} />
                <input 
                  type="password" required placeholder="••••••••"
                  className="w-full pl-14 pr-6 py-4 lg:py-5 bg-slate-50 border border-slate-100 rounded-[20px] lg:rounded-[24px] focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all outline-none text-slate-900 font-medium placeholder:text-slate-300 text-sm lg:text-base"
                  value={password} onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              disabled={loading}
              className="w-full py-5 lg:py-6 bg-indigo-600 text-white rounded-[20px] lg:rounded-[24px] font-black text-lg shadow-xl lg:shadow-[0_20px_40px_-12px_rgba(79,70,229,0.3)] hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 active:scale-[0.98] mt-6 lg:mt-8"
            >
              {loading ? <Loader2 className="animate-spin" /> : (
                <>
                  <span>Unlock Terminal</span>
                  <ArrowRight size={22} strokeWidth={3} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 space-y-3">
             <div className="flex items-center gap-4 text-slate-400 mb-2">
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-[10px] font-black uppercase tracking-widest">Rapid Access</span>
                <div className="flex-1 h-px bg-slate-100" />
             </div>
             <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => { setEmail('manager@zenpos.com'); setPassword('manager'); }}
                  className="py-3 lg:py-4 bg-slate-900 text-white rounded-xl lg:rounded-2xl font-black text-[10px] lg:text-xs uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                >
                  <ShieldCheck size={14}/> Manager
                </button>
                <button 
                  onClick={() => { setEmail('staff@zenpos.com'); setPassword('staff'); }}
                  className="py-3 lg:py-4 bg-indigo-50 text-indigo-600 rounded-xl lg:rounded-2xl font-black text-[10px] lg:text-xs uppercase tracking-widest hover:bg-indigo-100 transition-all flex items-center justify-center gap-2"
                >
                   <User size={14}/> Staff
                </button>
             </div>
             
             <div className="mt-4">
                <button 
                  onClick={handleGuestLogin}
                  className="w-full py-4 lg:py-5 bg-white border-2 border-slate-100 text-slate-600 rounded-xl lg:rounded-2xl font-black text-[10px] lg:text-xs uppercase tracking-widest hover:bg-slate-50 hover:border-indigo-100 hover:text-indigo-600 transition-all flex items-center justify-center gap-3 shadow-sm group"
                >
                   <ShoppingBag size={16} className="group-hover:scale-110 transition-transform" />
                   Continue as Guest
                </button>
             </div>
          </div>

          <div className="mt-8 lg:mt-12 text-center">
            <p className="text-slate-400 font-semibold mb-2 text-sm">New to the platform?</p>
            <Link to="/signup" className="inline-flex items-center gap-2 text-slate-900 font-black hover:text-indigo-600 transition-colors group text-sm lg:text-base">
              Create New Account
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>

        <TerminalFooter />
      </div>
    </div>
  )
}

const ProductCard = memo(({ product, onClick }) => {
  const { user } = useAuth()
  const isPersonnel = user?.role === 'Manager' || user?.role === 'Staff'

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={!isPersonnel ? { y: -5 } : {}}
      onClick={() => !isPersonnel && onClick(product)}
      className={cn(
        "group bg-slate-50 p-4 lg:p-5 rounded-[32px] lg:rounded-[40px] border border-slate-100 transition-all transform-gpu will-change-transform",
        !isPersonnel ? "hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50 cursor-pointer" : "cursor-default"
      )}
    >
      <div className="aspect-square bg-white rounded-[24px] lg:rounded-[32px] overflow-hidden mb-4 lg:mb-6 shadow-sm border border-slate-100">
        <img src={product.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 transform-gpu will-change-transform" alt={product.name} loading="lazy" />
      </div>
      <div className="px-1">
        <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-1 block">{product.category_name}</span>
        <h3 className="text-lg lg:text-xl font-bold text-slate-800 mb-2 lg:mb-4 truncate">{product.name}</h3>
        <div className="flex justify-between items-center">
           <p className="text-xl lg:text-2xl font-black text-slate-900">${Number(product.price).toFixed(2)}</p>
           {!isPersonnel && (
             <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-indigo-200 transition-all"><Plus size={20}/></div>
           )}
        </div>
      </div>
    </motion.div>
  )
})

function StoreFront() {
  const { user, logout, isGuest } = useAuth()
  const navigate = useNavigate()
  const [view, setView] = useState('menu') // 'menu' | 'history' | 'settings' | 'inventory' | 'staff'
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [users, setUsers] = useState([])
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [orderHistory, setOrderHistory] = useState([])
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [error, setError] = useState(null)

  const subtotal = useMemo(() => cart.reduce((s, i) => s + (i.price * i.quantity), 0), [cart])
  const total = subtotal * 1.08

  const paystackConfig = {
    reference: (new Date()).getTime().toString(),
    email: user.email || "customer@example.com",
    amount: Math.round(total * 100), // Amount is in kobo/cents
    publicKey: 'pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  };

  const initializePayment = usePaystackPayment(paystackConfig);

  const handlePaystackSuccess = (reference) => {
    handleCheckout('Paystack')
    alert("Paystack Payment Successful! Ref: " + reference.reference)
  };

  const handlePaystackClose = () => {
    setLoading(false)
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [productsData, categoriesData, allSales] = await Promise.all([
          getProducts(),
          getCategories(),
          getSales(user.role)
        ])
        
        setProducts(productsData)
        setCategories(categoriesData)
        setUsers(getUsers())
        
        if (isGuest) {
          setOrderHistory(JSON.parse(localStorage.getItem('guest_orders') || '[]'))
        } else {
          setOrderHistory(allSales.filter(s => s.user_id === user.id))
        }
      } catch (err) {
        console.error("Data fetch error", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [isGuest, user.id, user.role, view])

  const addToCart = useCallback((p) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === p.id)
      if (existing) {
        return prev.map(i => i.id === p.id ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...prev, { ...p, quantity: 1 }]
    })
    // Auto open cart on mobile if adding item
    if (window.innerWidth < 1024) setIsCartOpen(true)
  }, [])

  const handleCheckout = async (paymentMethod = 'Simulated Pay') => {
    if (cart.length === 0) return
    setLoading(true)
    
    // Simulate payment processing for non-Paystack methods
    if (paymentMethod !== 'Paystack') {
      await new Promise(resolve => setTimeout(resolve, 1500))
    }

    const orderData = {
      user_id: user.id,
      items: cart.map(i => ({ name: i.name, quantity: i.quantity, unit_price: i.price, product_id: i.id })),
      total_amount: total,
      tax_amount: subtotal * 0.08,
      payment_method: paymentMethod
    }

    const savedOrder = await saveSale(orderData, user.role)

    if (isGuest) {
      const guestOrders = JSON.parse(localStorage.getItem('guest_orders') || '[]')
      const newHistory = [savedOrder, ...guestOrders]
      localStorage.setItem('guest_orders', JSON.stringify(newHistory))
      setOrderHistory(newHistory)
    } else {
      setOrderHistory(prev => [savedOrder, ...prev])
    }

    setLoading(false)
    if (paymentMethod !== 'Paystack') {
      alert("Transaction Successful!")
    }
    setCart([])
    setIsCheckoutOpen(false)
    setIsCartOpen(false)
  }

  const filteredProducts = useMemo(() => {
    return products.filter(p => activeCategory === 'All' || p.category_name === activeCategory)
  }, [products, activeCategory])

  return (
    <div className="flex h-screen bg-white text-slate-900 overflow-hidden font-sans relative">
      
      {/* Mobile Header */}
      <div className="lg:hidden absolute top-0 left-0 right-0 h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 z-40">
         <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-slate-50 rounded-xl"><MenuIcon size={24}/></button>
         <div className="flex items-center gap-2 text-indigo-600 font-black"><ShoppingBag size={24}/> <span>ZENPOS</span></div>
         {(user?.role !== 'Manager' && user?.role !== 'Staff') && (
           <button onClick={() => setIsCartOpen(true)} className="p-2 hover:bg-slate-50 rounded-xl relative">
              <ShoppingBag size={24}/>
              {cart.length > 0 && <span className="absolute top-1 right-1 w-4 h-4 bg-indigo-600 text-white text-[10px] font-black rounded-full flex items-center justify-center">{cart.length}</span>}
           </button>
         )}
      </div>

      {/* Sidebar - Desktop & Mobile Drawer */}
      <AnimatePresence>
        {(isSidebarOpen || window.innerWidth >= 1024) && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
            />
            <motion.aside 
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              className={cn(
                "fixed lg:relative top-0 left-0 bottom-0 w-72 bg-slate-50 border-r border-slate-100 flex flex-col p-6 z-50 lg:z-auto transition-transform duration-300 lg:translate-x-0"
              )}
            >
              <div className="flex items-center justify-between mb-12 px-2">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-100">
                    <ShoppingBag size={28} />
                  </div>
                  <span className="text-2xl font-black tracking-tight text-indigo-900">ZENPOS</span>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2"><X/></button>
              </div>

              <nav className="flex-1 space-y-2">
                {/* Personnel specific sidebar */}
                {(user.role === 'Manager' || user.role === 'Staff') ? (
                  <>
                    <NavItemV2 icon={<LayoutDashboard size={22} />} label={user.role === 'Manager' ? "Control Center" : "Daily Stats"} onClick={() => navigate('/dashboard')} />
                    <NavItemV2 icon={<Package size={22} />} label="Inventory" onClick={() => { setView('inventory'); setIsSidebarOpen(false); }} />
                    {user.role === 'Manager' && (
                      <NavItemV2 icon={<UserPlus size={22} />} label="Team Portal" onClick={() => { setView('staff'); setIsSidebarOpen(false); }} />
                    )}
                    <NavItemV2 icon={<Store size={22} />} label="Store Front" active={view === 'menu'} onClick={() => { setView('menu'); setIsSidebarOpen(false); }} />
                  </>
                ) : (
                  <>
                    <NavItemV2 icon={<Store size={22} />} label="Terminal Menu" active={view === 'menu'} onClick={() => { setView('menu'); setIsSidebarOpen(false); }} />
                    <NavItemV2 icon={<History size={22} />} label="My Orders" active={view === 'history'} onClick={() => { setView('history'); setIsSidebarOpen(false); }} />
                  </>
                )}
                
                <NavItemV2 icon={<Settings size={22} />} label="User Settings" active={view === 'settings'} onClick={() => { setView('settings'); setIsSidebarOpen(false); }} />
              </nav>

              <div className="mt-auto pt-6 border-t border-slate-200">
                <div className="flex items-center gap-4 p-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xl shrink-0">{user.name[0]}</div>
                  <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate text-slate-900">{user.name}</p>
                      <p className="text-[10px] lg:text-xs text-slate-400 font-medium uppercase tracking-widest">{user.role}</p>
                  </div>
                  <button onClick={logout} className="p-2 text-slate-300 hover:text-red-500 shrink-0"><LogOut size={18}/></button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-white relative mt-16 lg:mt-0">
        <header className="hidden lg:flex h-24 px-10 items-center justify-between border-b border-slate-50">
          <div>
             <h2 className="text-2xl font-black text-slate-900">
               {view === 'menu' ? 'Signature Menu' : 
                view === 'history' ? 'Order History' : 
                view === 'inventory' ? 'Inventory Management' :
                view === 'staff' ? 'Personnel Portal' :
                'Settings'}
             </h2>
             <p className="text-slate-400 font-medium text-sm">Station Terminal: TX-1040</p>
          </div>
          {view === 'menu' && (
            <div className="relative w-80 group">
               <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
               <input placeholder="Quick search catalog..." className="w-full pl-12 pr-6 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none text-sm" />
            </div>
          )}
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-10 pb-24 lg:pb-10">
          <AnimatePresence mode="wait">
            {view === 'menu' && (
              <motion.div key="menu" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                 {error && <div className="mb-8 p-4 bg-amber-50 border border-amber-100 text-amber-700 rounded-2xl font-bold text-sm flex items-center gap-3"><Info size={20}/> {error}</div>}
                 
                 <div className="flex gap-3 mb-8 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
                    {['All', ...categories.map(c => c.name)].map(cat => (
                      <button 
                        key={cat} 
                        onClick={() => setActiveCategory(cat)}
                        className={cn(
                          "px-6 py-2.5 rounded-xl font-bold transition-all border whitespace-nowrap text-sm transform-gpu", 
                          activeCategory === cat 
                            ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100 scale-105" 
                            : "bg-white border-slate-200 text-slate-500 hover:border-indigo-200 hover:text-indigo-600"
                        )}
                      >{cat}</button>
                    ))}
                 </div>

                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 lg:gap-8">
                    {loading ? (
                      <div className="col-span-full py-20 text-center text-slate-300 flex flex-col items-center gap-4">
                        <Loader2 className="animate-spin" size={48}/>
                        <p className="font-bold">Syncing Digital Menu...</p>
                      </div>
                    ) : filteredProducts.length === 0 ? (
                      <div className="col-span-full py-20 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                        <p className="font-bold text-slate-400">No products found in this category.</p>
                      </div>
                    ) : filteredProducts.map((p) => (
                      <ProductCard key={p.id} product={p} onClick={addToCart} />
                    ))}
                 </div>
              </motion.div>
            )}

            {view === 'history' && (
              <motion.div key="history" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                 <SectionHeader title="System Log: Recent Sales" subtitle="Chronological record of processed transactions" />
                 
                 <div className="space-y-4 lg:space-y-6">
                    {orderHistory.length === 0 ? (
                      <div className="py-20 text-center bg-slate-50 rounded-[32px] lg:rounded-[40px] border border-dashed border-slate-200 text-slate-400 font-bold">No historical data recorded yet.</div>
                    ) : orderHistory.map(order => (
                      <div key={order.id} className="bg-white p-6 lg:p-8 rounded-[28px] lg:rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all">
                         <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 lg:w-12 lg:h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center"><Clock size={20}/></div>
                               <div>
                                  <p className="font-black text-slate-900 text-sm lg:text-base">Order #{order.id.toString().slice(-6).toUpperCase()}</p>
                                  <p className="text-slate-400 text-xs lg:text-sm font-medium">{new Date(order.date || order.created_at).toLocaleString()}</p>
                               </div>
                            </div>
                            <div className="text-left sm:text-right">
                               <p className="text-xl lg:text-2xl font-black text-indigo-600">${Number(order.total_amount).toFixed(2)}</p>
                               <span className="px-3 py-1 bg-green-50 text-green-600 text-[9px] font-black rounded-full uppercase tracking-widest border border-green-100">Settled</span>
                            </div>
                         </div>
                         <div className="bg-slate-50 rounded-2xl p-3 lg:p-4 flex gap-3 lg:gap-4 overflow-x-auto no-scrollbar">
                            {order.items?.map((item, i) => (
                              <div key={i} className="flex-shrink-0 bg-white px-3 py-1.5 lg:px-4 lg:py-2 rounded-xl border border-slate-100 flex items-center gap-2">
                                 <span className="w-5 h-5 lg:w-6 lg:h-6 bg-slate-100 rounded-full flex items-center justify-center text-[9px] lg:text-[10px] font-black text-slate-500">{item.quantity}</span>
                                 <span className="text-xs lg:text-sm font-bold text-slate-700">{item.name}</span>
                              </div>
                            ))}
                         </div>
                      </div>
                    ))}
                 </div>
              </motion.div>
            )}

            {view === 'settings' && (
              <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                 <SectionHeader title="Account Config" subtitle="Manage your retail profile and security credentials" />
                 
                 <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-10">
                    <div className="bg-white p-6 lg:p-10 rounded-[32px] lg:rounded-[40px] border border-slate-100 shadow-sm">
                       <h3 className="text-lg lg:text-xl font-black text-slate-900 mb-6 lg:mb-8 flex items-center gap-3"><User size={22} className="text-indigo-600"/> Identity Overview</h3>
                       <div className="space-y-4 lg:space-y-6">
                          <div className="space-y-1">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current User</label>
                             <div className="w-full px-5 py-3 lg:px-6 lg:py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-600 font-bold text-sm">{user.name}</div>
                          </div>
                          <div className="space-y-1">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Connectivity ID</label>
                             <div className="w-full px-5 py-3 lg:px-6 lg:py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-600 font-bold text-sm">{user.email || 'Retail Guest Access'}</div>
                          </div>
                          <button className="w-full py-4 bg-slate-50 text-slate-400 font-bold rounded-2xl border border-slate-100 text-xs uppercase tracking-widest cursor-not-allowed">Profile Updates Locked</button>
                       </div>
                    </div>

                    <div className="space-y-4 lg:space-y-6">
                       <div className="bg-white p-6 lg:p-8 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4 lg:gap-6 group hover:bg-slate-50 transition-all cursor-pointer">
                          <div className="w-12 h-12 lg:w-16 lg:h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"><Bell size={24}/></div>
                          <div className="flex-1 min-w-0">
                             <h4 className="font-bold text-base lg:text-lg">Notifications</h4>
                             <p className="text-slate-500 text-xs lg:text-sm truncate">Alerts for stock levels and orders</p>
                          </div>
                          <ChevronRight className="text-slate-300 group-hover:translate-x-1 transition-transform shrink-0" />
                       </div>
                       <div className="bg-white p-6 lg:p-8 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4 lg:gap-6 group hover:bg-slate-50 transition-all cursor-pointer">
                          <div className="w-12 h-12 lg:w-16 lg:h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"><ShieldCheck size={24}/></div>
                          <div className="flex-1 min-w-0">
                             <h4 className="font-bold text-base lg:text-lg">Security</h4>
                             <p className="text-slate-500 text-xs lg:text-sm truncate">Terminal access and data privacy</p>
                          </div>
                          <ChevronRight className="text-slate-300 group-hover:translate-x-1 transition-transform shrink-0" />
                       </div>
                    </div>
                 </div>
              </motion.div>
            )}

            {view === 'inventory' && (
              <motion.div key="inventory" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <SectionHeader title="Inventory Audit" subtitle="Real-time stock levels across all categories" />
                <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product</th>
                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Price</th>
                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Stock Level</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {products.map(p => (
                        <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-6 font-bold text-slate-900">{p.name}</td>
                          <td className="px-8 py-6"><span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-full uppercase tracking-widest">{p.category_name}</span></td>
                          <td className="px-8 py-6 font-black text-slate-700">${Number(p.price).toFixed(2)}</td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden w-24">
                                <div className={cn("h-full rounded-full", p.stock_level < 30 ? "bg-red-500" : "bg-green-500")} style={{ width: `${Math.min(p.stock_level, 100)}%` }} />
                              </div>
                              <span className="font-black text-slate-900 text-sm">{p.stock_level}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {view === 'staff' && (
              <motion.div key="staff" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <SectionHeader title="Terminal Personnel" subtitle="Manage access and roles for your retail team" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {users.map(u => (
                    <div key={u.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4">
                      <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-black text-2xl">{u.name[0]}</div>
                      <div>
                        <p className="font-black text-slate-900">{u.name}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{u.role}</p>
                        <p className="text-xs text-slate-500 font-medium">{u.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Cart side - Desktop & Mobile Drawer */}
      <AnimatePresence>
        {((isCartOpen || (window.innerWidth >= 1024 && cart.length > 0 && view === 'menu')) && (user?.role !== 'Manager' && user?.role !== 'Staff')) && (
          <>
            {/* Backdrop for mobile cart */}
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
            />
            <motion.aside 
              initial={{ x: 450 }} animate={{ x: 0 }} exit={{ x: 450 }}
              className="fixed lg:relative top-0 right-0 bottom-0 w-full sm:w-[400px] lg:w-[450px] bg-slate-50 border-l border-slate-100 flex flex-col shadow-2xl z-50 lg:z-auto"
            >
              <div className="p-6 lg:p-8 border-b border-slate-200 flex justify-between items-center bg-white lg:bg-transparent">
                 <h2 className="text-xl lg:text-2xl font-black text-slate-900">Current Basket</h2>
                 <div className="flex items-center gap-2">
                    <button onClick={() => setCart([])} className="p-2 text-slate-300 hover:text-red-500 transition-all"><Trash2 size={20}/></button>
                    <button onClick={() => setIsCartOpen(false)} className="lg:hidden p-2"><X/></button>
                 </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-4 lg:space-y-6">
                 {cart.length === 0 ? (
                   <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4 opacity-50">
                      <ShoppingBag size={64} />
                      <p className="font-bold">Cart is empty</p>
                   </div>
                 ) : cart.map((item, idx) => (
                   <div key={idx} className="flex gap-4 lg:gap-5 group">
                      <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white rounded-2xl lg:rounded-3xl overflow-hidden shrink-0 shadow-sm border border-slate-100">
                         <img src={item.image_url} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div className="flex-1 min-w-0">
                         <h4 className="font-bold text-base lg:text-lg text-slate-800 truncate">{item.name}</h4>
                         <p className="text-indigo-600 font-black text-sm lg:text-base">${item.price}</p>
                         <div className="flex items-center bg-white rounded-xl border border-slate-200 w-fit mt-2 lg:mt-3 px-1 py-1 shadow-sm">
                            <button onClick={() => setCart(cart.map((it, i) => i === idx ? {...it, quantity: Math.max(1, it.quantity - 1)} : it))} className="p-1 text-slate-300 hover:text-slate-900"><Minus size={14}/></button>
                            <span className="px-3 lg:px-4 font-black text-xs">{item.quantity}</span>
                            <button onClick={() => setCart(cart.map((it, i) => i === idx ? {...it, quantity: it.quantity + 1} : it))} className="p-1 text-slate-300 hover:text-slate-900"><Plus size={14}/></button>
                         </div>
                      </div>
                   </div>
                 ))}
              </div>

              <div className="p-6 lg:p-10 bg-white rounded-t-[40px] lg:rounded-t-[50px] shadow-[0_-20px_50px_rgba(0,0,0,0.02)] border-t border-slate-100">
                 <div className="space-y-2 lg:space-y-4 mb-6 lg:mb-10">
                    <div className="flex justify-between text-slate-400 font-bold text-sm"><span>Estimated Tax</span><span>${(subtotal * 0.08).toFixed(2)}</span></div>
                    <div className="flex justify-between items-end">
                      <span className="text-slate-500 font-black tracking-tight uppercase text-[10px] mb-1">Total Payable</span>
                      <span className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter">${total.toFixed(2)}</span>
                    </div>
                 </div>
                 <motion.button 
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  disabled={cart.length === 0}
                  onClick={() => setIsCheckoutOpen(true)}
                  className="w-full py-4 lg:py-5 bg-indigo-600 text-white rounded-2xl lg:rounded-3xl font-black text-lg lg:text-xl shadow-2xl shadow-indigo-100 flex items-center justify-center gap-3 disabled:opacity-50"
                 >
                   Launch Payment <ArrowRight size={22}/>
                 </motion.button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Checkout Terminal Modal */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCheckoutOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white p-6 sm:p-8 lg:p-12 rounded-[32px] sm:rounded-[40px] lg:rounded-[56px] shadow-3xl w-full max-w-xl border border-slate-100 overflow-y-auto max-h-[90vh] custom-scrollbar"
            >
               <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-1 sm:mb-2 text-slate-900 tracking-tighter text-center sm:text-left">Secure Gateway</h3>
               <p className="text-slate-500 font-medium mb-6 sm:mb-8 lg:mb-12 text-center sm:text-left text-sm sm:text-base">Settlement: <span className="text-indigo-600 font-black">${total.toFixed(2)}</span></p>
               
               <div className="space-y-3 sm:space-y-4 lg:space-y-6 mb-8 lg:mb-12">
                  {/* Paystack Option */}
                  <motion.div 
                    whileHover={{ scale: 1.02 }} 
                    onClick={() => {
                      setLoading(true);
                      initializePayment(handlePaystackSuccess, handlePaystackClose);
                    }} 
                    className="p-4 sm:p-6 lg:p-8 bg-indigo-600 hover:bg-indigo-700 rounded-2xl sm:rounded-3xl lg:rounded-[32px] border-2 border-transparent flex items-center gap-4 lg:gap-6 cursor-pointer group transition-all shadow-xl shadow-indigo-100"
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center text-white shrink-0">
                      <PaystackIcon size={24}/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-base sm:text-lg lg:text-xl text-white">Pay with Paystack</p>
                      <p className="text-[9px] sm:text-[10px] lg:text-sm text-indigo-100 font-medium tracking-tight">Direct bank and card processing</p>
                    </div>
                    <ChevronRight className="text-white group-hover:translate-x-1 transition-transform shrink-0" size={18} />
                  </motion.div>

                  {/* Card Payment (Simulated) */}
                  <motion.div 
                    whileHover={{ scale: 1.02 }} 
                    onClick={() => handleCheckout('Card')} 
                    className="p-4 sm:p-6 lg:p-8 bg-white border-2 border-slate-100 hover:border-indigo-100 hover:bg-slate-50 rounded-2xl sm:rounded-3xl lg:rounded-[32px] flex items-center gap-4 lg:gap-6 cursor-pointer group transition-all"
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-blue-50 text-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0">
                      <CreditCard size={24}/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-base sm:text-lg lg:text-xl text-slate-900">Card Payment</p>
                      <p className="text-[9px] sm:text-[10px] lg:text-sm text-slate-400 font-medium tracking-tight">Visa, Mastercard, Verve</p>
                    </div>
                    <ChevronRight className="text-slate-200 group-hover:translate-x-1 group-hover:text-indigo-600 transition-transform shrink-0" size={18} />
                  </motion.div>

                  {/* Mobile Money (Simulated) */}
                  <motion.div 
                    whileHover={{ scale: 1.02 }} 
                    onClick={() => handleCheckout('Mobile Money')} 
                    className="p-4 sm:p-6 lg:p-8 bg-white border-2 border-slate-100 hover:border-green-100 hover:bg-slate-50 rounded-2xl sm:rounded-3xl lg:rounded-[32px] flex items-center gap-4 lg:gap-6 cursor-pointer group transition-all"
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-green-50 text-green-600 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0">
                      <Wallet size={24}/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-base sm:text-lg lg:text-xl text-slate-900">Mobile Money</p>
                      <p className="text-[9px] sm:text-[10px] lg:text-sm text-slate-400 font-medium tracking-tight">MTN, Airtel, Telecel</p>
                    </div>
                    <ChevronRight className="text-slate-200 group-hover:translate-x-1 group-hover:text-green-600 transition-transform shrink-0" size={18} />
                  </motion.div>

                  {/* Cash (Simulated) */}
                  <motion.div 
                    whileHover={{ scale: 1.02 }} 
                    onClick={() => handleCheckout('Cash')} 
                    className="p-4 sm:p-6 lg:p-8 bg-white border-2 border-slate-100 hover:border-amber-100 hover:bg-slate-50 rounded-2xl sm:rounded-3xl lg:rounded-[32px] flex items-center gap-4 lg:gap-6 cursor-pointer group transition-all"
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-amber-50 text-amber-600 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0">
                      <Banknote size={24}/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-base sm:text-lg lg:text-xl text-slate-900">Cash Settlement</p>
                      <p className="text-[9px] sm:text-[10px] lg:text-sm text-slate-400 font-medium tracking-tight">Physical currency verification</p>
                    </div>
                    <ChevronRight className="text-slate-200 group-hover:translate-x-1 group-hover:text-amber-600 transition-transform shrink-0" size={18} />
                  </motion.div>
               </div>

               <button onClick={() => setIsCheckoutOpen(false)} className="w-full text-center text-slate-400 font-bold hover:text-slate-900 transition-colors text-xs sm:text-sm uppercase tracking-widest">Abort Transaction</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

function SignupPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setTimeout(() => {
      const res = mockSignup(form.name, form.email, form.password)
      if (res.user) {
        login(res.user)
        navigate('/')
      } else {
        setError(res.error || 'Signup failed')
      }
      setLoading(false)
    }, 500)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row font-sans selection:bg-indigo-500 selection:text-white overflow-y-auto">
      {/* Visual Side (Left) */}
      <div className="hidden lg:flex lg:w-5/12 relative bg-indigo-600 items-center justify-center p-8 lg:p-12 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_var(--tw-gradient-stops))] from-indigo-500 via-indigo-600 to-indigo-800" />
          <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center"
        >
          <div className="w-24 h-24 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[40px] flex items-center justify-center text-white mx-auto mb-8 shadow-2xl">
            <UserPlus size={48} />
          </div>
          <h2 className="text-5xl font-black text-white tracking-tighter mb-6">Join the Force.</h2>
          <p className="text-indigo-100 text-lg font-medium max-w-sm mx-auto leading-relaxed">
            Create your personnel account and start managing your terminal with precision and speed.
          </p>
          
          <div className="mt-12 space-y-4">
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-3xl text-white font-bold text-left">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"><ShieldCheck size={20}/></div>
              <div>
                <p className="text-sm">Verified Access</p>
                <p className="text-[10px] opacity-60 uppercase tracking-widest">Enterprise Grade</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Form Side (Right) */}
      <div className="min-h-screen lg:flex-1 flex flex-col justify-center p-6 sm:p-12 lg:p-24 bg-slate-50 relative overflow-y-auto py-12 lg:py-24">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md mx-auto"
        >
          <div className="mb-8 lg:mb-10 text-center lg:text-left">
            <h2 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tighter mb-3 font-display">Personnel Registration</h2>
            <p className="text-slate-500 font-medium text-sm lg:text-base">Complete the form below to activate your account.</p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 text-sm font-bold border border-red-100 flex items-center gap-3"
            >
              <Info size={18} />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-5">
            <div className="space-y-2 group">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 text-display">Full Identity</label>
              <div className="relative">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
                <input 
                  placeholder="Johnathan Doe" required 
                  className="w-full pl-14 pr-6 py-4 lg:py-5 bg-white border border-slate-200 rounded-[20px] lg:rounded-[24px] outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all font-medium text-slate-900 text-sm lg:text-base" 
                  onChange={e => setForm({...form, name: e.target.value})} 
                />
              </div>
            </div>

            <div className="space-y-2 group">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 text-display">Terminal Email</label>
              <div className="relative">
                <Bell className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
                <input 
                  placeholder="name@zenpos.com" type="email" required 
                  className="w-full pl-14 pr-6 py-4 lg:py-5 bg-white border border-slate-200 rounded-[24px] outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all font-medium text-slate-900 text-sm lg:text-base" 
                  onChange={e => setForm({...form, email: e.target.value})} 
                />
              </div>
            </div>

            <div className="space-y-2 group">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 text-display">Security Passcode</label>
              <div className="relative">
                <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
                <input 
                  placeholder="••••••••" type="password" required 
                  className="w-full pl-14 pr-6 py-4 lg:py-5 bg-white border border-slate-200 rounded-[24px] outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all font-medium text-slate-900 text-sm lg:text-base" 
                  onChange={e => setForm({...form, password: e.target.value})} 
                />
              </div>
            </div>

            <button 
              disabled={loading} 
              className="w-full py-5 lg:py-6 bg-slate-900 text-white rounded-[20px] lg:rounded-[24px] font-black text-lg shadow-xl lg:shadow-2xl lg:shadow-slate-200 hover:bg-black transition-all flex items-center justify-center gap-3 mt-6 lg:mt-8 active:scale-[0.98]"
            >
              {loading ? <Loader2 className="animate-spin" /> : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={22} strokeWidth={3} />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 lg:mt-10 text-center text-slate-500 font-bold text-sm">
            Already registered? <Link to="/login" className="text-indigo-600 hover:underline">Sign In</Link>
          </p>
        </motion.div>

        <TerminalFooter />
      </div>
    </div>
  )
}

function JoinPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', token: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setTimeout(() => {
      const res = mockSignup(form.name, form.email, form.password)
      if (res.user) {
        login(res.user)
        navigate('/dashboard')
      } else {
        setError(res.error || 'Join failed')
      }
      setLoading(false)
    }, 500)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row font-sans selection:bg-indigo-500 selection:text-white overflow-y-auto">
      {/* Visual Side (Left) */}
      <div className="hidden lg:flex lg:w-5/12 relative bg-slate-900 items-center justify-center p-8 lg:p-12 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30" />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 text-center"
        >
          <div className="w-24 h-24 bg-indigo-600 rounded-[40px] flex items-center justify-center text-white mx-auto mb-8 shadow-[0_0_50px_rgba(79,70,229,0.3)]">
            <ShieldCheck size={48} />
          </div>
          <h2 className="text-5xl font-black text-white tracking-tighter mb-6">Terminal Activation.</h2>
          <p className="text-slate-400 text-lg font-medium max-w-sm mx-auto leading-relaxed">
            Enter your invitation credentials to link this terminal to your personnel profile.
          </p>
          
          <div className="mt-12 inline-flex items-center gap-3 px-6 py-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl text-indigo-400 font-bold text-sm">
            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
            Secure Authentication Link
          </div>
        </motion.div>
      </div>

      {/* Form Side (Right) */}
      <div className="min-h-screen lg:flex-1 flex flex-col justify-center p-6 sm:p-12 lg:p-24 bg-white relative overflow-y-auto py-12 lg:py-24">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md mx-auto"
        >
          <div className="mb-8 lg:mb-10 text-center lg:text-left">
            <h2 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tighter mb-3">Activate Access</h2>
            <p className="text-slate-500 font-medium text-sm lg:text-base">Link your secure token provided by your manager.</p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 text-sm font-bold border border-red-100 flex items-center gap-3"
            >
              <Info size={18} />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-5">
            <div className="space-y-2 group">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Invitation Token</label>
              <input 
                placeholder="Paste activation code..." required 
                className="w-full px-6 py-4 lg:py-5 bg-slate-50 border border-slate-100 rounded-[20px] lg:rounded-[24px] outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all font-mono text-xs lg:text-sm tracking-widest text-indigo-600" 
                onChange={e => setForm({...form, token: e.target.value})} 
              />
            </div>

            <div className="space-y-2 group">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Staff Full Name</label>
              <div className="relative">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                <input 
                  placeholder="Full Name" required 
                  className="w-full pl-14 pr-6 py-4 lg:py-5 bg-slate-50 border border-slate-100 rounded-[20px] lg:rounded-[24px] outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all font-medium text-sm lg:text-base" 
                  onChange={e => setForm({...form, name: e.target.value})} 
                />
              </div>
            </div>

            <div className="space-y-2 group">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Terminal Email</label>
              <div className="relative">
                <Bell className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                <input 
                  placeholder="Email" type="email" required 
                  className="w-full pl-14 pr-6 py-4 lg:py-5 bg-slate-50 border border-slate-100 rounded-[20px] lg:rounded-[24px] outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all font-medium text-sm lg:text-base" 
                  onChange={e => setForm({...form, email: e.target.value})} 
                />
              </div>
            </div>

            <div className="space-y-2 group">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Secure Password</label>
              <div className="relative">
                <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                <input 
                  placeholder="Password" type="password" required 
                  className="w-full pl-14 pr-6 py-4 lg:py-5 bg-slate-50 border border-slate-100 rounded-[20px] lg:rounded-[24px] outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all font-medium text-sm lg:text-base" 
                  onChange={e => setForm({...form, password: e.target.value})} 
                />
              </div>
            </div>

            <button 
              disabled={loading} 
              className="w-full py-5 lg:py-6 bg-indigo-600 text-white rounded-[20px] lg:rounded-[24px] font-black text-lg shadow-xl lg:shadow-[0_20px_40px_-12px_rgba(79,70,229,0.3)] hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 mt-6 lg:mt-8 active:scale-[0.98]"
            >
              {loading ? <Loader2 className="animate-spin" /> : (
                <>
                  <span>Activate Terminal</span>
                  <ArrowRight size={22} strokeWidth={3} />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 lg:mt-8 text-center text-slate-400 font-bold text-sm">
            Lost your token? <a href="mailto:admin@zenpos.com" className="text-indigo-600 hover:underline">Contact Manager</a>
          </p>
        </motion.div>

        <TerminalFooter />
      </div>
    </div>
  )
}

// --- DASHBOARD SUB-COMPONENTS ---

function ManagerDashboard({ sales, users, products, activities, hiringForm, setHiringForm, handleHiring, hiringLoading, setView }) {
  const totalRevenue = useMemo(() => sales.reduce((sum, s) => sum + Number(s.total_amount), 0), [sales])
  const staffCount = useMemo(() => users.filter(u => u.role === 'Staff' || u.role === 'Manager').length, [users])
  
  // Advanced Analytics: Category Breakdown
  const categorySales = useMemo(() => {
    const breakdown = {}
    sales.forEach(s => {
      s.items?.forEach(item => {
        const prod = products.find(p => p.id === item.product_id)
        const cat = prod?.category_name || 'Other'
        breakdown[cat] = (breakdown[cat] || 0) + (item.unit_price * item.quantity)
      })
    })
    return Object.entries(breakdown).sort((a, b) => b[1] - a[1])
  }, [sales, products])

  return (
    <div className="space-y-8 lg:space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">
         <div className="bg-indigo-600 p-8 lg:p-10 rounded-[32px] lg:rounded-[48px] shadow-2xl shadow-indigo-100 lg:col-span-2 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10"><LayoutDashboard size={120} /></div>
            <h3 className="text-sm lg:text-lg font-bold text-indigo-100 mb-2 uppercase tracking-widest relative z-10">Total Terminal Revenue</h3>
            <p className="text-5xl lg:text-7xl font-black tracking-tighter leading-tight relative z-10">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <div className="mt-6 lg:mt-8 flex gap-3 relative z-10">
               <span className="px-4 py-1.5 bg-white/20 rounded-full text-[9px] font-black uppercase tracking-widest">Global Performance Peak</span>
            </div>
         </div>
         <div className="bg-slate-50 p-8 lg:p-10 rounded-[32px] lg:rounded-[48px] flex flex-col justify-between border border-slate-100 shadow-sm">
            <div>
               <h3 className="text-base lg:text-lg font-bold text-slate-400 mb-1">Active Personnel</h3>
               <p className="text-4xl lg:text-5xl font-black text-slate-900">{staffCount} Team Members</p>
            </div>
            <button onClick={() => setView('staff')} className="w-full py-4 lg:py-5 bg-white border border-slate-200 rounded-2xl lg:rounded-3xl font-black text-slate-900 hover:shadow-lg transition-all mt-6 lg:mt-0">Manage Team</button>
         </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-10">
         {/* Category Performance */}
         <div className="bg-white p-8 lg:p-10 rounded-[32px] border border-slate-100 shadow-sm">
            <h3 className="text-xl font-black mb-8 text-slate-900 flex items-center gap-3"><Package size={24} className="text-indigo-600"/> Revenue by Category</h3>
            <div className="space-y-6">
               {categorySales.map(([cat, val]) => (
                 <div key={cat} className="space-y-2">
                    <div className="flex justify-between items-end">
                       <span className="font-bold text-slate-600">{cat}</span>
                       <span className="font-black text-slate-900">${val.toFixed(2)}</span>
                    </div>
                    <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${(val / totalRevenue) * 100}%` }}
                         className="h-full bg-indigo-500" 
                       />
                    </div>
                 </div>
               ))}
            </div>
         </div>

         {/* Hiring Portal */}
         <div className="bg-white p-8 lg:p-10 rounded-[32px] border border-slate-100 shadow-sm">
            <h3 className="text-xl lg:text-2xl font-black mb-6 lg:mb-8 text-slate-900 flex items-center gap-4"><UserPlus size={28} className="text-indigo-600"/> Hiring Portal</h3>
            <form onSubmit={handleHiring} className="space-y-4">
               <input 
                 placeholder="Full Name" 
                 className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all text-sm" 
                 value={hiringForm.name}
                 onChange={e => setHiringForm({ ...hiringForm, name: e.target.value })}
               />
               <input 
                 placeholder="Email" 
                 className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all text-sm" 
                 value={hiringForm.email}
                 onChange={e => setHiringForm({ ...hiringForm, email: e.target.value })}
               />
               <input 
                 type="password"
                 placeholder="Access Password" 
                 className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all text-sm" 
                 value={hiringForm.password}
                 onChange={e => setHiringForm({ ...hiringForm, password: e.target.value })}
               />
               <button 
                 disabled={hiringLoading}
                 className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
               >
                 {hiringLoading ? 'Processing...' : 'Confirm Hire'}
               </button>
            </form>
         </div>
      </div>
    </div>
  )
}

function StaffDashboard({ sales, user, activities }) {
  const today = new Date().toISOString().split('T')[0]
  const todaySales = useMemo(() => sales.filter(s => s.date.startsWith(today)), [sales, today])
  const todayRevenue = useMemo(() => todaySales.reduce((sum, s) => sum + Number(s.total_amount), 0), [todaySales])
  const personalActivities = useMemo(() => activities.filter(a => a.user === user.name).slice(0, 5), [activities, user.name])

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-6"><Wallet size={24}/></div>
          <h3 className="text-slate-400 font-bold text-sm uppercase tracking-widest mb-1">Today's Volume</h3>
          <p className="text-4xl font-black text-slate-900">${todayRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6"><ShoppingBag size={24}/></div>
          <h3 className="text-slate-400 font-bold text-sm uppercase tracking-widest mb-1">Total Orders</h3>
          <p className="text-4xl font-black text-slate-900">{todaySales.length} Sales</p>
        </div>
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6"><Clock size={24}/></div>
          <h3 className="text-slate-400 font-bold text-sm uppercase tracking-widest mb-1">Current Status</h3>
          <p className="text-4xl font-black text-slate-900">On Duty</p>
        </div>
      </div>

      <div className="bg-slate-50 p-8 lg:p-10 rounded-[40px] border border-slate-100">
        <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3"><History size={24} className="text-indigo-600"/> Your Recent Activity</h3>
        <div className="space-y-4">
          {personalActivities.length === 0 ? (
            <p className="text-slate-400 font-medium italic">No recent activities recorded for your profile.</p>
          ) : personalActivities.map(act => (
            <div key={act.id} className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800">{act.action}</p>
                <p className="text-xs text-slate-400">{new Date(act.time).toLocaleTimeString()}</p>
              </div>
              <div className="w-2 h-2 bg-indigo-400 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [view, setView] = useState('overview') // 'overview' | 'inventory' | 'history' | 'staff'
  const [sales, setSales] = useState([])
  const [users, setUsers] = useState([])
  const [products, setProducts] = useState([])
  const [activities, setActivities] = useState([])
  const [hiringForm, setHiringForm] = useState({ name: '', email: '', password: '' })
  const [hiringLoading, setHiringLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const salesData = await getSales(user.role)
      const productsData = await getProducts()
      setSales(salesData)
      setUsers(getUsers())
      setProducts(productsData)
      setActivities(getActivities())
    }
    fetchData()
  }, [view, user.role])

  const handleHiring = (e) => {
    e.preventDefault()
    if (!hiringForm.name || !hiringForm.email || !hiringForm.password) return
    setHiringLoading(true)
    setTimeout(() => {
      const res = createStaff(hiringForm.name, hiringForm.email, hiringForm.password)
      if (res.user) {
        alert(`Successfully hired ${hiringForm.name}! They can now login.`)
        setHiringForm({ name: '', email: '', password: '' })
        setUsers(getUsers())
        setActivities(getActivities())
      } else {
        alert(res.error)
      }
      setHiringLoading(false)
    }, 800)
  }

  const totalRevenue = useMemo(() => sales.reduce((sum, s) => sum + Number(s.total_amount), 0), [sales])
  const staffCount = useMemo(() => users.filter(u => u.role === 'Staff' || u.role === 'Manager').length, [users])

  return (
    <div className="flex h-screen bg-white text-slate-900 font-sans relative">
       {/* Mobile Dashboard Header */}
       <div className="lg:hidden absolute top-0 left-0 right-0 h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 z-40">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2"><MenuIcon/></button>
          <span className="font-black text-indigo-600">ADMIN PANEL</span>
          <div className="w-10 h-10 rounded-full bg-slate-100" />
       </div>

       <AnimatePresence>
         {(isSidebarOpen || window.innerWidth >= 1024) && (
           <>
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSidebarOpen(false)} className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50" />
             <motion.aside 
               initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
               className="fixed lg:relative top-0 left-0 bottom-0 w-72 bg-slate-50 border-r border-slate-100 p-8 flex flex-col z-50"
             >
                <div className="mb-12 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100"><ShieldCheck size={24}/></div>
                      <h2 className="text-xl font-black text-indigo-900">Admin</h2>
                   </div>
                   <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden"><X/></button>
                </div>
                <nav className="flex-1 space-y-2">
                   <NavItemV2 icon={<LayoutDashboard size={22}/>} label="Overview" active={view === 'overview'} onClick={() => setView('overview')} />
                   <NavItemV2 icon={<Package size={22}/>} label="Inventory" active={view === 'inventory'} onClick={() => setView('inventory')} />
                   <NavItemV2 icon={<History size={22}/>} label="Sales Audit" active={view === 'history'} onClick={() => setView('history')} />
                   {user.role === 'Manager' && (
                     <NavItemV2 icon={<UserPlus size={22}/>} label="Staff" active={view === 'staff'} onClick={() => setView('staff')} />
                   )}
                   <div className="pt-4 mt-4 border-t border-slate-200">
                      <NavItemV2 icon={<Store size={22}/>} label="Store Front" onClick={() => navigate('/')} />
                   </div>
                </nav>
                <button onClick={logout} className="mt-auto flex items-center gap-3 p-4 text-slate-400 font-black hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"><LogOut size={20}/> Logout</button>
             </motion.aside>
           </>
         )}
       </AnimatePresence>

       <main className="flex-1 p-6 lg:p-12 overflow-y-auto mt-16 lg:mt-0">
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 lg:mb-12">
             <div>
                <h1 className="text-3xl lg:text-4xl font-black mb-1 tracking-tight text-slate-900">
                  {view === 'overview' ? 'System Analytics' :
                   view === 'inventory' ? 'Inventory Control' :
                   view === 'history' ? 'Sales Audit' :
                   'Personnel Management'}
                </h1>
                <p className="text-slate-500 font-medium text-sm lg:text-lg">Welcome, {user.name} 👋 Performance looks stable.</p>
             </div>
             <div className="bg-slate-50 border border-slate-100 p-3 lg:p-4 rounded-2xl lg:rounded-3xl flex items-center gap-4">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-500 text-white rounded-xl flex items-center justify-center font-black">S</div>
                <div><p className="text-[10px] text-slate-400 font-black tracking-widest uppercase">Sync Status</p><p className="font-black text-slate-900 text-xs lg:text-base">SECURE</p></div>
             </div>
          </header>

          <AnimatePresence mode="wait">
            {view === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                {user.role === 'Manager' ? (
                  <ManagerDashboard 
                    sales={sales} 
                    users={users} 
                    products={products} 
                    activities={activities} 
                    hiringForm={hiringForm}
                    setHiringForm={setHiringForm}
                    handleHiring={handleHiring}
                    hiringLoading={hiringLoading}
                    setView={setView}
                  />
                ) : (
                  <StaffDashboard 
                    sales={sales} 
                    user={user} 
                    activities={activities} 
                  />
                )}
              </motion.div>
            )}

            {view === 'inventory' && (
              <motion.div key="inventory" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="bg-white rounded-[32px] sm:rounded-[40px] border border-slate-100 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left min-w-[500px]">
                      <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                          <th className="px-6 lg:px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product</th>
                          <th className="px-6 lg:px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Stock</th>
                          <th className="px-6 lg:px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {products.map(p => (
                          <tr key={p.id}>
                            <td className="px-6 lg:px-10 py-6 font-bold text-slate-900">{p.name}</td>
                            <td className="px-6 lg:px-10 py-6 font-black text-slate-700">{p.stock_level} units</td>
                            <td className="px-6 lg:px-10 py-6">
                              <span className={cn(
                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                p.stock_level < 30 ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
                              )}>
                                {p.stock_level < 30 ? 'Low Stock' : 'Optimal'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {view === 'history' && (
              <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="space-y-6">
                  <h3 className="text-xl font-black text-slate-900 mb-4">Recent System Activities</h3>
                  <div className="space-y-4">
                    {activities.map(act => (
                      <div key={act.id} className="bg-white p-5 lg:p-6 rounded-2xl lg:rounded-3xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 lg:w-12 lg:h-12 bg-slate-50 rounded-xl lg:rounded-2xl flex items-center justify-center text-slate-400"><Info size={20}/></div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm lg:text-base">{act.action}</p>
                            <p className="text-[10px] lg:text-xs text-slate-400 font-medium">{act.user} • {new Date(act.time).toLocaleString()}</p>
                          </div>
                        </div>
                        <span className="w-fit px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-full uppercase tracking-widest">System</span>
                      </div>
                    ))}
                  </div>
                  
                  <h3 className="text-xl font-black text-slate-900 mt-12 mb-4">All Terminal Sales</h3>
                  <div className="space-y-4">
                    {sales.map(sale => (
                      <div key={sale.id} className="bg-white p-5 lg:p-6 rounded-2xl lg:rounded-3xl border border-slate-100 flex items-center justify-between">
                         <div className="flex items-center gap-4">
                          <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-50 rounded-xl lg:rounded-2xl flex items-center justify-center text-green-600 font-black">$</div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm lg:text-base">Sale #{sale.id.slice(-6).toUpperCase()}</p>
                            <p className="text-[10px] lg:text-xs text-slate-400 font-medium">{new Date(sale.date).toLocaleString()}</p>
                          </div>
                        </div>
                        <p className="font-black text-indigo-600 text-lg lg:text-xl">${Number(sale.total_amount).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {view === 'staff' && (
              <motion.div key="staff" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {users.map(u => (
                    <div key={u.id} className="bg-white p-6 lg:p-8 rounded-[32px] lg:rounded-[40px] border border-slate-100 flex items-center gap-4 lg:gap-6">
                      <div className="w-16 h-16 lg:w-20 lg:h-20 bg-indigo-50 text-indigo-600 rounded-2xl lg:rounded-3xl flex items-center justify-center text-2xl lg:text-3xl font-black">{u.name[0]}</div>
                      <div className="min-w-0">
                        <h4 className="text-lg lg:text-xl font-black text-slate-900 truncate">{u.name}</h4>
                        <p className="text-[9px] lg:text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1 lg:mb-2">{u.role}</p>
                        <p className="text-xs lg:text-sm text-slate-500 font-medium truncate">{u.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
       </main>
    </div>
  )
}

// --- APP ROUTING ---

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<ProtectedRoute><StoreFront /></ProtectedRoute>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/join" element={<JoinPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/dashboard" element={<ProtectedRoute roles={['Manager', 'Staff']}><Dashboard /></ProtectedRoute>} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  )
}

function ProtectedRoute({ children, roles }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}
