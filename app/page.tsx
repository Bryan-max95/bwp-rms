'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  BarChart3, 
  Package, 
  Users, 
  Settings,
  LogOut,
  Bell,
  Search,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DashboardOverview } from '@/components/dashboard/overview';
import { SalesReports } from '@/components/dashboard/sales-reports';
import { ProductsReport } from '@/components/dashboard/products-report';
import { CashiersReport } from '@/components/dashboard/cashiers-report';
import { ConfigPanel } from '@/components/dashboard/config-panel';
import { LoginForm } from '@/components/auth/login-form';
import { motion, AnimatePresence } from 'motion/react';
import { useIsMobile } from '@/hooks/use-mobile';

type Tab = 'overview' | 'sales' | 'products' | 'cashiers' | 'config';

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [dbConnected, setDbConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const auth = localStorage.getItem('rms_auth');
      const dbConfig = localStorage.getItem('rms_db_config');
      
      setTimeout(() => {
        if (auth === 'palao_logged_in') {
          setIsAuthenticated(true);
        }
        if (dbConfig) {
          setDbConnected(true);
        }
        setIsLoading(false);
      }, 0);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('rms_auth');
    setIsAuthenticated(false);
  };

  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'sales', label: 'Ventas', icon: BarChart3 },
    { id: 'products', label: 'Productos', icon: Package },
    { id: 'cashiers', label: 'Cajeros', icon: Users },
    { id: 'config', label: 'Conexión', icon: Settings },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm onLogin={() => setIsAuthenticated(true)} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <DashboardOverview />;
      case 'sales': return <SalesReports />;
      case 'products': return <ProductsReport />;
      case 'cashiers': return <CashiersReport />;
      case 'config': return <ConfigPanel onConnect={() => setDbConnected(true)} />;
      default: return <DashboardOverview />;
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 text-slate-900">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-4 bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <LayoutDashboard className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-lg tracking-tight">RMS<span className="text-blue-600">Cloud</span></span>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 text-slate-500 relative">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-slate-900 bg-slate-100 rounded-lg"
          >
            <Menu size={20} />
          </button>
        </div>
      </header>

      {/* Desktop Sidebar & Mobile Drawer */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-[60] w-72 bg-white border-r border-slate-200 transition-transform duration-300 md:relative md:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                <LayoutDashboard className="text-white w-6 h-6" />
              </div>
              <span className="font-black text-xl tracking-tighter">RMS<span className="text-blue-600">Cloud</span></span>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden p-2 text-slate-400 hover:text-slate-900 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Menú Principal</p>
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as Tab);
                  if (isMobile) setIsSidebarOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 group relative",
                  activeTab === item.id 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-100" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5",
                  activeTab === item.id ? "text-white" : "text-slate-400 group-hover:text-blue-600"
                )} />
                <span className="font-bold text-sm">{item.label}</span>
                {activeTab === item.id && (
                  <motion.div 
                    layoutId="activePill"
                    className="absolute right-3 w-1.5 h-1.5 bg-white rounded-full"
                  />
                )}
              </button>
            ))}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-slate-100">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                P
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">Palao Admin</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Administrador</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-500 hover:bg-red-50 rounded-2xl transition-colors font-bold text-sm"
            >
              <LogOut size={18} />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[55] md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Desktop Header */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100 w-96">
            <Search size={18} className="text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar reporte, producto..." 
              className="bg-transparent border-none outline-none text-sm w-full font-medium"
            />
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-100">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              SQL SERVER: {dbConnected ? 'CONECTADO' : 'PENDIENTE'}
            </div>
            <button className="p-2.5 text-slate-400 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-all relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="w-10 h-10 rounded-xl bg-slate-200 overflow-hidden relative">
              <Image 
                src={`https://ui-avatars.com/api/?name=Palao+Admin&background=random`} 
                alt="Avatar" 
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </header>

        {/* Content Section */}
        <div className="flex-1 overflow-y-auto px-4 md:px-10 py-6 md:py-8 max-w-7xl mx-auto w-full pb-32 md:pb-8">
          {!dbConnected && activeTab !== 'config' && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-4 md:p-6 bg-amber-50 border border-amber-200 rounded-3xl flex flex-col md:flex-row items-center gap-4 text-amber-800 shadow-sm"
            >
              <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center flex-shrink-0 text-amber-600">
                <Settings className="animate-spin-slow" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h4 className="font-bold text-lg">Conexión Pendiente</h4>
                <p className="text-sm opacity-90 font-medium">No se han detectado credenciales de base de datos SQL Server configuradas.</p>
              </div>
              <button 
                onClick={() => setActiveTab('config')}
                className="w-full md:w-auto px-6 py-3 bg-amber-600 text-white rounded-2xl font-bold shadow-lg shadow-amber-200 hover:bg-amber-700 transition-all"
              >
                Configurar Ahora
              </button>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Mobile Nav - Bottom Fixed */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-2 py-2 z-50 flex items-center justify-around pb-safe transform transition-transform shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as Tab)}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all w-16",
                activeTab === item.id ? "text-blue-600" : "text-slate-400"
              )}
            >
              <item.icon size={20} className={cn(
                activeTab === item.id ? "scale-110" : "scale-100"
              )} />
              <span className="text-[10px] font-bold mt-1 tracking-tight">{item.label}</span>
              {activeTab === item.id && (
                <div className="h-1 w-1 bg-blue-600 rounded-full mt-0.5" />
              )}
            </button>
          ))}
        </nav>
      </main>
    </div>
  );
}
