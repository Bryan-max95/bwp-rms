'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  DollarSign, 
  ShoppingBag, 
  TrendingUp, 
  Users, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  CalendarDays,
  LayoutDashboard,
  ShieldAlert
} from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { motion } from 'motion/react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

export function DashboardOverview() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const configStr = localStorage.getItem('rms_db_config');
      let config = null;
      try {
        config = configStr ? JSON.parse(configStr) : null;
      } catch (e) {
        console.error("Error parsing config");
      }

      if (!config) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/rms-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            config, 
            queryType: 'DASHBOARD_FULL'
          })
        });

        const result = await res.json();

        if (result.success) {
          setData({
            stats: result.data.stats || {},
            history: result.data.history || [],
            registers: result.data.registers || []
          });
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = useMemo(() => {
    if (!data?.stats) return [
      { label: 'Ventas del Día', value: 0, icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50' },
      { label: 'Transacciones', value: 0, icon: ShoppingBag, color: 'text-emerald-600', bg: 'bg-emerald-50' },
      { label: 'Ticket Promedio', value: 0, icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50' },
      { label: 'Cajeros Hoy', value: 0, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    ];

    return [
      { label: 'Ventas del Día', value: data.stats.DailySales || 0, icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50', isCurrency: true },
      { label: 'Transacciones', value: data.stats.TransactionCount || 0, icon: ShoppingBag, color: 'text-emerald-600', bg: 'bg-emerald-50' },
      { label: 'Ticket Promedio', value: data.stats.AvgTicket || 0, icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50', isCurrency: true },
      { label: 'Cajeros Hoy', value: data.stats.ActiveCashiers || 0, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    ];
  }, [data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const today = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });

  return (
    <div className="space-y-6 md:space-y-10 pb-12">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Panel de Control</h1>
          <p className="text-slate-500 font-medium mt-1 uppercase text-xs tracking-widest">Resumen General de Operaciones</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
            <CalendarDays size={20} className="text-blue-600" />
            <span className="text-sm font-bold text-slate-700">Hoy, {today}</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300"
          >
            <div className={cn("inline-flex p-3 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300", stat.bg, stat.color)}>
              <stat.icon size={24} strokeWidth={2.5} />
            </div>
            <div className="space-y-1">
              <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-2xl font-black text-slate-900 leading-none font-mono">
                {stat.isCurrency ? formatCurrency(stat.value) : stat.value}
              </h3>
            </div>
            {/* Subtle decor */}
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
              <stat.icon size={120} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Sales Chart Card */}
        <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <Clock size={20} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Ventas por Hora</h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Flujo de facturación hoy</p>
              </div>
            </div>
            <div className="flex bg-slate-50 p-1 rounded-xl items-center">
               <button className="px-3 py-1.5 text-xs font-bold rounded-lg bg-white shadow-sm text-blue-600 tracking-tight">Hoy</button>
               <button className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 tracking-tight">Semana</button>
            </div>
          </div>
          
          <div className="h-[300px] md:h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.history || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="hour" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 700 }}
                  tickFormatter={(val) => `${val}h`}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 700 }}
                />
                <Tooltip 
                  labelFormatter={(val) => `Hora: ${val}:00`}
                  contentStyle={{ 
                    borderRadius: '20px', 
                    border: 'none', 
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    padding: '12px 16px',
                    fontWeight: 800,
                    fontFamily: 'var(--font-jetbrains-mono)'
                  }}
                  formatter={(value: any) => [formatCurrency(value), 'Total']}
                />
                <Area 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#3b82f6" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorSales)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Registers Status Card */}
        <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
              <LayoutDashboard size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 leading-none">Estado de Cajas</h3>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Sincronización en vivo</p>
            </div>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto">
            {(data?.registers || []).length > 0 ? (
              data.registers.map((register: any) => (
                <div key={register.id} className="group p-4 bg-slate-50 border border-slate-100 rounded-3xl hover:bg-white hover:border-blue-100 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm",
                        register.total > 0 ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"
                      )}>
                        {register.id}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900">{register.type || 'Caja Fija'}</h4>
                        <div className="flex items-center gap-1.5">
                          <div className={cn("w-1.5 h-1.5 rounded-full", register.total > 0 ? "bg-green-500 animate-pulse" : "bg-slate-400")} />
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                            {register.total > 0 ? 'En Proceso' : 'Sin Actividad'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn("text-sm font-black leading-none font-mono", register.total > 0 ? "text-blue-600" : "text-slate-400")}>
                        {formatCurrency(register.total || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-10 opacity-40">
                <LayoutDashboard size={40} className="mb-2" />
                <p className="text-xs font-bold uppercase tracking-widest text-center">No hay cajas<br/>vinculadas</p>
              </div>
            )}
          </div>

          <button className="mt-6 w-full py-3 text-xs font-black uppercase text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors tracking-widest">
            Ver Todos los Terminales
          </button>
        </div>
      </div>
    </div>
  );
}
