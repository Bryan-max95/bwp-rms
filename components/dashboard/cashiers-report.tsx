'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  Award, 
  ShieldCheck, 
  Download, 
  ChevronRight,
  TrendingUp,
  CreditCard,
  Zap
} from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { motion } from 'motion/react';

export function CashiersReport() {
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

      try {
        const [cashiersRes, registersRes] = await Promise.all([
          fetch('/api/rms-data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              config, 
              queryType: 'CASHIERS_PERFORMANCE'
            })
          }),
          fetch('/api/rms-data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              config, 
              queryType: 'REGISTERS_STATUS'
            })
          })
        ]);

        const cashiers = await cashiersRes.json();
        const registers = await registersRes.json();

        setData({
          cashiers: cashiers.data || [],
          registers: registers.data || []
        });
      } catch (err) {
        console.error("Error fetching cashiers data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-10 md:space-y-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Gestión de Cajeros</h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">Eficiencia y métricas por terminal</p>
        </div>
        <button className="flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl hover:bg-slate-800 transition-all active:scale-95">
          <Download size={20} />
          <span>Reporte de Turnos</span>
        </button>
      </div>

      {/* Cashier Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-10">
        {(data?.cashiers || []).map((cashier: any, idx: number) => (
          <motion.div
            key={cashier.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="group bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-300 relative overflow-hidden"
          >
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-50 group-hover:bg-blue-600 group-hover:opacity-10 transition-all duration-500" />
            
            <div className="flex items-start justify-between relative z-10 mb-8">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 text-slate-500 rounded-3xl flex items-center justify-center font-black text-2xl group-hover:from-blue-600 group-hover:to-indigo-700 group-hover:text-white transition-all duration-500 shadow-inner">
                  {cashier.name.split(' ').map((n: string) => n[0]).join('')}
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 mb-1">{cashier.name}</h3>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-lg text-[10px] font-black w-fit">
                    <ShieldCheck size={12} /> RMS VERIFIED
                  </div>
                </div>
              </div>
              {idx === 0 && cashier.sales > 0 && (
                <div className="bg-amber-100 text-amber-600 p-2 rounded-xl shadow-sm border border-amber-200">
                  <Award size={24} strokeWidth={2.5} />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-5 bg-slate-50/50 rounded-3xl border border-slate-100 group-hover:border-blue-50 transition-colors">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Ventas Hoy</p>
                <div className="flex items-baseline gap-1">
                   <span className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">{formatCurrency(cashier.sales || 0)}</span>
                </div>
              </div>
              <div className="p-5 bg-slate-50/50 rounded-3xl border border-slate-100 group-hover:border-blue-50 transition-colors">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Transacciones</p>
                <span className="text-xl font-black text-slate-900">{cashier.tickets || 0}</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-900 rounded-3xl text-white shadow-lg shadow-slate-100 group-hover:bg-blue-600 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center">
                  <TrendingUp size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-bold opacity-60 uppercase">Ticket Promedio</p>
                  <p className="font-black leading-none">{formatCurrency(cashier.avgTicket || 0)}</p>
                </div>
              </div>
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                 <ChevronRight size={20} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Terminal Summary Section */}
      <div className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-sm border border-slate-100">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div className="flex items-center gap-5">
               <div className="w-14 h-14 bg-purple-600 text-white rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-purple-200">
                  <Zap size={28} />
               </div>
               <div>
                  <h3 className="text-2xl font-black text-slate-900 leading-none">Estado de Terminales</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Registers & Terminal Points</p>
               </div>
            </div>
            <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl">
               <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm text-xs font-bold text-slate-900">
                  <div className="w-2 h-2 bg-green-500 rounded-full" /> {(data?.registers || []).filter((r:any) => r.total > 0).length} Activos
               </div>
               <div className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-500">
                  <div className="w-2 h-2 bg-slate-300 rounded-full" /> {(data?.registers || []).filter((r:any) => r.total === 0).length} Inactivos
               </div>
            </div>
         </div>

         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(data?.registers || []).map((reg: any) => (
              <div key={reg.id} className="relative group">
                <div className="p-8 bg-slate-50 border border-slate-100 rounded-[2.5rem] group-hover:bg-white group-hover:border-purple-200 group-hover:shadow-2xl group-hover:shadow-purple-900/5 transition-all duration-500">
                   <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-black text-slate-300 group-hover:text-purple-600 text-xl transition-colors shadow-sm">
                        #{reg.id}
                      </div>
                      <div className={cn(
                        "w-2.5 h-2.5 rounded-full",
                        reg.total > 0 ? "bg-green-500 shadow-[0_0_10px_#22c55e] animate-pulse" : "bg-slate-300"
                      )} />
                   </div>
                   <h4 className="text-lg font-black text-slate-900 mb-1">Caja {reg.id}</h4>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">{reg.type || 'RETAIL POS'}</p>
                   
                   <div className="pt-6 border-t border-slate-200/60">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Facturado Hoy</p>
                      <p className="text-xl font-black text-purple-600">{formatCurrency(reg.total || 0)}</p>
                   </div>
                </div>
                {/* Visual Connector Line for fun */}
                {reg.total > 0 && (
                  <div className="absolute top-1/2 -right-4 w-4 h-px bg-purple-200 hidden lg:block" />
                )}
              </div>
            ))}
         </div>
      </div>
    </div>
  );
}
