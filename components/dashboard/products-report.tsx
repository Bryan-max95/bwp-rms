'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Package, 
  Download, 
  PieChart as PieChartIcon, 
  ChevronRight,
  ShoppingBag
} from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { motion } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';

export function ProductsReport() {
  const [data, setData] = useState<any[]>([]);
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
        const res = await fetch('/api/rms-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            config, 
            queryType: 'TOP_PRODUCTS'
          })
        });
        const result = await res.json();
        
        const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#14b8a6', '#64748b'];
        const formattedData = (result.data || []).map((item: any, idx: number) => ({
          ...item,
          color: colors[idx % colors.length]
        }));
        
        setData(formattedData);
      } catch (err) {
        console.error("Error fetching products:", err);
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

  const totalRevenue = data.reduce((a, b) => a + b.revenue, 0);

  return (
    <div className="space-y-8 md:space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Top Productos</h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">Artículos con mayor rotación hoy</p>
        </div>
        <button className="flex items-center justify-center gap-3 px-8 py-4 bg-white border border-slate-200 text-slate-700 font-black rounded-2xl shadow-sm hover:shadow-lg transition-all active:scale-95">
          <Download size={20} />
          <span>Exportar Listado</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
        {/* Bar Chart Card */}
        <div className="bg-white p-6 md:p-10 rounded-[3rem] shadow-sm border border-slate-100">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
              <BarChart3 size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">Volumen de Venta</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Unidades vendidas por item</p>
            </div>
          </div>

          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ left: -20, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#64748b', fontWeight: 800 }} 
                  width={150} 
                  tickFormatter={(val) => val.length > 18 ? `${val.substring(0, 15)}...` : val}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)', padding: '16px' }}
                />
                <Bar dataKey="sold" radius={[0, 12, 12, 0]} barSize={24}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart Card */}
        <div className="bg-white p-6 md:p-10 rounded-[3rem] shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 bg-pink-50 text-pink-600 rounded-2xl flex items-center justify-center">
              <PieChartIcon size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">Mix de Ingresos</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Participación en facturación total</p>
            </div>
          </div>

          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  innerRadius={110}
                  outerRadius={150}
                  paddingAngle={8}
                  dataKey="revenue"
                  animationBegin={200}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => formatCurrency(value)}
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)', padding: '16px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Label */}
            <div className="absolute top-[50%] left-[50%] -translate-x-[50%] translate-y-[-10%] text-center pointer-events-none">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Ventas Totales</p>
              <h4 className="text-2xl md:text-3xl font-black text-slate-900">{formatCurrency(totalRevenue)}</h4>
            </div>
          </div>
        </div>
      </div>

      {/* Grid List for Mobile/Tablet */}
      <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
          <h3 className="text-xl font-black text-slate-900">Listado de Rendimiento</h3>
          <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-xs font-black uppercase tracking-widest">TOP 10</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-xs font-black uppercase tracking-[0.2em]">
                <th className="px-10 py-6">Producto</th>
                <th className="px-10 py-6 text-center">Cant.</th>
                <th className="px-10 py-6 text-right">Monto</th>
                <th className="px-10 py-6 text-right">% MIX</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.map((item, idx) => (
                <tr key={item.name} className="group hover:bg-slate-50 transition-all">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-8 rounded-full" style={{ backgroundColor: item.color }} />
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-900">{item.name}</span>
                        <span className="text-[10px] font-bold text-slate-400">SKU: PROD-{1000 + idx}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-center">
                    <span className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-black text-slate-600 group-hover:bg-white transition-colors">{item.sold}</span>
                  </td>
                  <td className="px-10 py-6 text-right text-sm font-black text-slate-900">{formatCurrency(item.revenue)}</td>
                  <td className="px-10 py-6 text-right">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-xl text-xs font-black">
                      {item.revenue > 0 ? ((item.revenue / totalRevenue) * 100).toFixed(1) : '0'}%
                      <TrendingUp size={12} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
