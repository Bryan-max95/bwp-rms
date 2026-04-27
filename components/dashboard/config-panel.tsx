'use client';

import { useState, useEffect } from 'react';
import { Database, Server, User, Lock, RefreshCw, Unplug, CheckCircle2, ShieldAlert, XCircle, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface ConfigPanelProps {
  onConnect: () => void;
}

export function ConfigPanel({ onConnect }: ConfigPanelProps) {
  const [ip, setIp] = useState('10.10.107.15');
  const [instanceName, setInstanceName] = useState('SQLEXPRESS');
  const [dbName, setDbName] = useState('palao');
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'testing' | 'connected' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('rms_db_config');
    if (saved) {
      try {
        const config = JSON.parse(saved);
        if (config.ip) setIp(config.ip);
        if (config.instanceName) setInstanceName(config.instanceName);
        if (config.dbName) setDbName(config.dbName);
        if (config.user) setUser(config.user);
        setStatus('connected');
      } catch (e) {
        console.error("Error parsing saved config");
      }
    }
  }, []);

  const handleTestConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setStatus('testing');
    
    try {
      const response = await fetch('/api/rms-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: { ip, instanceName, dbName, user, password },
          queryType: 'TEST_CONNECTION'
        }),
      });

      const result = await response.json();

      if (result.success) {
        const config = { ip, instanceName, dbName, user };
        localStorage.setItem('rms_db_config', JSON.stringify(config));
        setStatus('connected');
        onConnect();
      } else {
        setStatus('error');
        setErrorMessage(result.error || 'No se pudo establecer conexión con el servidor SQL.');
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMessage('Error de red o servidor al intentar conectar.');
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem('rms_db_config');
    setStatus('idle');
    setIp('10.10.107.15');
    setInstanceName('SQLEXPRESS');
    setDbName('palao');
    setUser('');
    setPassword('');
  };

  return (
    <div className="max-w-4xl mx-auto py-4 md:py-8">
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-slate-950 p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[100px] -mr-32 -mt-32"></div>
          <div className="relative z-10">
            <h2 className="text-3xl font-black tracking-tight mb-2">Configuración SQL Server</h2>
            <p className="text-slate-400 font-medium">Link su Microsoft Dynamics RMS a la nube</p>
          </div>
        </div>

        <div className="p-8 md:p-12">
          {status === 'connected' ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={48} strokeWidth={3} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Motor de Base de Datos Listo</h3>
              <p className="text-slate-500 mb-8 font-medium">Sincronización activa con {ip}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto mb-10">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Servidor</p>
                  <p className="font-bold text-slate-700">{ip}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Base de Datos</p>
                  <p className="font-bold text-slate-700">{dbName}</p>
                </div>
              </div>

              <button 
                onClick={handleDisconnect}
                className="px-8 py-4 bg-red-50 text-red-600 hover:bg-red-100 rounded-2xl font-black transition-all flex items-center gap-2 mx-auto"
              >
                <Unplug size={20} />
                Desconectar Servidor
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleTestConnection} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-4 flex items-center gap-2">
                    <Server size={14} className="text-blue-600" /> Dirección IP / Host
                  </label>
                  <input 
                    type="text" 
                    value={ip}
                    onChange={(e) => setIp(e.target.value)}
                    placeholder="192.168.1.100"
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-bold"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-4 flex items-center gap-2">
                    <Database size={14} className="text-blue-600" /> Instancia
                  </label>
                  <input 
                    type="text" 
                    value={instanceName}
                    onChange={(e) => setInstanceName(e.target.value)}
                    placeholder="SQLEXPRESS"
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-bold"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-4 flex items-center gap-2">
                    <Database size={14} className="text-blue-600" /> Nombre de DB
                  </label>
                  <input 
                    type="text" 
                    value={dbName}
                    onChange={(e) => setDbName(e.target.value)}
                    placeholder="RMS_Database"
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-bold"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-4 flex items-center gap-2">
                    <User size={14} className="text-blue-600" /> Usuario SQL
                  </label>
                  <input 
                    type="text" 
                    value={user}
                    onChange={(e) => setUser(e.target.value)}
                    placeholder="sa"
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-bold"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-4 flex items-center gap-2">
                    <Lock size={14} className="text-blue-600" /> Contraseña SQL
                  </label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-bold"
                    required
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="p-5 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-4">
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0 text-red-600">
                    <ShieldAlert />
                  </div>
                  <div>
                    <h4 className="font-bold text-red-900">Error de Conexión</h4>
                    <p className="text-sm text-red-700 font-medium">{errorMessage}</p>
                  </div>
                  <XCircle className="ml-auto text-red-400 cursor-pointer" onClick={() => setErrorMessage('')} />
                </div>
              )}

              <button 
                type="submit"
                disabled={status === 'testing'}
                className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-3xl font-black text-xl shadow-xl shadow-blue-200 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70"
              >
                {status === 'testing' ? (
                  <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <RefreshCw size={24} />
                    Vincular SQL Server
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="mt-8 bg-blue-50/50 p-6 rounded-3xl border border-blue-100">
        <h4 className="font-bold text-blue-900 mb-2">Instrucciones de Seguridad</h4>
        <p className="text-sm text-blue-700 font-medium leading-relaxed">
          Para que RMS Cloud Dashboard pueda ver su información, el puerto de SQL Server (1433 por defecto) debe estar abierto en su firewall y configurado para permitir conexiones TCP/IP de forma remota. Se recomienda utilizar un usuario SQL con permisos de solo lectura para mayor seguridad.
        </p>
      </div>
    </div>
  );
}
