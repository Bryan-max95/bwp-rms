'use client';

import { useState, useEffect } from 'react';
import { 
  Download, 
  Calendar, 
  Search, 
  FileText, 
  Check, 
  ChevronRight,
  Filter,
  BarChart2,
  Clock
} from 'lucide-react';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function SalesReports() {
  const [dateFrom, setDateFrom] = useState(new Date().toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const fetchSales = async () => {
    setLoading(true);
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
          queryType: 'SALES_BY_RANGE', 
          filters: { dateFrom, dateTo }
        })
      });
      const result = await res.json();
      setData(result.data || []);
      setShowFilters(false);
    } catch (err) {
      console.error("Error fetching sales range:", err);
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = () => {
    if (data.length === 0) return;
    setIsExporting(true);
    const doc = new jsPDF();
    
    doc.setFontSize(22);
    doc.setTextColor(59, 130, 246);
    doc.text('RMS Cloud Report - Ventas Detalladas', 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Rango: ${formatDate(dateFrom)} hasta ${formatDate(dateTo)}`, 14, 30);
    doc.text(`Generado: ${new Date().toLocaleString()}`, 14, 35);
    
    autoTable(doc, {
      startY: 45,
      head: [['Ticket #', 'Fecha/Hora', 'Cajero', 'Total']],
      body: data.map(row => [
        row.TransactionNumber,
        new Date(row.Time).toLocaleString(),
        row.CashierName,
        `$${row.Total.toFixed(2)}`
      ]),
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 9 }
    });
    
    const totalSales = data.reduce((sum, item) => sum + item.Total, 0);
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text(`VENTA TOTAL EN RANGO: $${totalSales.toFixed(2)}`, 14, finalY);
    
    doc.save(`RMS_Ventas_${dateFrom}_${dateTo}.pdf`);
    setTimeout(() => setIsExporting(false), 2000);
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Reporte de Ventas</h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">Historial detallado de transacciones</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden flex items-center justify-center p-3 bg-white border border-slate-200 rounded-2xl text-slate-700 font-bold"
          >
            <Filter size={20} />
          </button>
          <button 
            onClick={exportToPDF} 
            disabled={isExporting || data.length === 0} 
            className="flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-[1.5rem] shadow-xl shadow-blue-200 transition-all active:scale-95 disabled:opacity-50"
          >
            {isExporting ? <Check size={20} /> : <Download size={20} />}
            <span>Exportar PDF</span>
          </button>
        </div>
      </div>

      {/* Filters Area */}
      <AnimatePresence>
        {(showFilters || true) && (
          <motion.div 
            initial={showFilters ? { height: 0, opacity: 0 } : false}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={cn(
              "overflow-hidden bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100",
              showFilters ? "block" : "hidden md:block"
            )}
          >
            <div className="flex flex-col md:flex-row md:items-end gap-6 md:gap-8">
              <div className="flex-1 space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4 flex items-center gap-2">
                  <Calendar size={14} className="text-blue-600" /> Fecha Inicio
                </label>
                <input 
                  type="date" 
                  value={dateFrom} 
                  onChange={(e) => setDateFrom(e.target.value)} 
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 font-bold" 
                />
              </div>
              <div className="flex-1 space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4 flex items-center gap-2">
                  <Calendar size={14} className="text-blue-600" /> Fecha Fin
                </label>
                <input 
                  type="date" 
                  value={dateTo} 
                  onChange={(e) => setDateTo(e.target.value)} 
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 font-bold" 
                />
              </div>
              <button 
                onClick={fetchSales} 
                className="w-full md:w-auto px-10 py-4 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl transition-all shadow-lg flex items-center justify-center gap-3"
              >
                {loading ? <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" /> : <Search size={22} />}
                <span>Consultar</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden min-h-[450px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[450px]">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-slate-400 font-bold text-xs uppercase tracking-widest">Sincronizando con Servidor RMS...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[450px] text-center p-12">
            <div className="w-24 h-24 bg-slate-50 text-slate-200 rounded-[2.5rem] flex items-center justify-center mb-8 rotate-6">
              <FileText size={48} className="-rotate-6" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 bg-gradient-to-r from-slate-900 to-slate-500 bg-clip-text text-transparent">Sin Historial de Ventas</h3>
            <p className="text-slate-500 font-medium max-w-sm mt-3">Seleccione un rango de fechas en la parte superior para visualizar las transacciones procesadas.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* Mobile Cards for table */}
            <div className="md:hidden divide-y divide-slate-100">
              {data.map((row) => (
                <div key={row.TransactionNumber} className="p-5 active:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="text-blue-600 font-black text-sm">#{row.TransactionNumber}</span>
                      <h4 className="font-bold text-slate-900 mt-0.5">{row.CashierName}</h4>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-slate-900">{formatCurrency(row.Total)}</p>
                      <div className="flex items-center gap-1 justify-end mt-1 text-[10px] font-bold text-slate-400">
                        <Check size={10} className="text-green-500" /> PAGADO
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                    <Clock size={12} /> {formatDate(row.Time)}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table */}
            <table className="hidden md:table w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-xs font-black uppercase tracking-[0.2em]">
                  <th className="px-10 py-6">Nro Ticket</th>
                  <th className="px-10 py-6">Fecha / Hora</th>
                  <th className="px-10 py-6">Cajero RMS</th>
                  <th className="px-10 py-6 text-right">Monto Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.map((row) => (
                  <tr key={row.TransactionNumber} className="hover:bg-slate-50 group transition-all">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-black text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                          #{row.TransactionNumber.toString().slice(-2)}
                        </div>
                        <span className="text-blue-600 font-black tracking-tight cursor-default">#{row.TransactionNumber}</span>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <span className="text-sm font-bold text-slate-600">{formatDate(row.Time)}</span>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black group-hover:bg-white group-hover:shadow-sm transition-all border border-transparent group-hover:border-slate-100">
                          {row.CashierName.split(' ').map((n: string) => n[0]).join('')}
                        </div>
                        <span className="text-sm font-bold text-slate-700">{row.CashierName}</span>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <span className="px-5 py-2 bg-slate-900 text-white rounded-xl text-sm font-black shadow-lg shadow-slate-100">
                        {formatCurrency(row.Total)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {data.length > 0 && (
        <div className="bg-slate-950 p-8 rounded-[2.5rem] flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-900/50">
              <BarChart2 className="text-white w-8 h-8" />
            </div>
            <div>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest leading-none mb-2">Total Recaudado en Periodo</p>
              <h4 className="text-4xl font-black text-white leading-none">
                {formatCurrency(data.reduce((a, b) => a + b.Total, 0))}
              </h4>
            </div>
          </div>
          <div className="h-px md:h-12 w-full md:w-px bg-slate-800" />
          <div className="flex items-center gap-8 px-4">
             <div>
               <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mb-1">Tickets</p>
               <p className="text-xl font-black text-white">{data.length}</p>
             </div>
             <div>
               <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mb-1">Cajeros</p>
               <p className="text-xl font-black text-white">{new Set(data.map(d => d.CashierName)).size}</p>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
