import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Map, 
  Building2, 
  ArrowLeftRight, 
  ClipboardCheck, 
  FileText, 
  Users, 
  LogOut,
  Plus,
  Search,
  Barcode,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Menu,
  X,
  ChevronRight,
  User as UserIcon,
  Settings,
  Sparkles,
  Bell,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, InventoryItem, Room, ProcurementRequest, ItemCategory } from './types';
import { BarcodeScanner } from './components/BarcodeScanner';
import { InventoryForm } from './components/InventoryForm';
import { RoomForm } from './components/RoomForm';
import { MutationForm } from './components/MutationForm';
import { OpnameForm } from './components/OpnameForm';
import { ProcurementForm } from './components/ProcurementForm';
import { ReportView } from './components/ReportView';
import { Dashboard } from './components/Dashboard';
import { AIAnalyst } from './components/AIAnalyst';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetch('/api/reports/summary')
        .then(res => res.json())
        .then(summary => {
          const newNotifs = [];
          if (summary.procurement_pending > 0) {
            newNotifs.push({
              id: 1,
              title: 'Pengadaan Pending',
              message: `Ada ${summary.procurement_pending} pengajuan barang menunggu persetujuan.`,
              type: 'warning',
              tab: 'procurement'
            });
          }
          if (summary.total_damaged > 0) {
            newNotifs.push({
              id: 2,
              title: 'Barang Rusak',
              message: `${summary.total_damaged} barang terdeteksi rusak dan butuh perhatian.`,
              type: 'danger',
              tab: 'inventory-umum'
            });
          }
          setNotifications(newNotifs);
        });
    }
  }, [user, activeTab]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setError('');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Connection error');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setActiveTab('dashboard');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
              <Building2 className="text-white w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">SIMSARPRAS</h1>
            <p className="text-slate-500">Sistem Informasi Sarana & Prasarana</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="label">Username</label>
              <input 
                type="text" 
                className="input" 
                placeholder="admin"
                value={loginData.username}
                onChange={e => setLoginData({ ...loginData, username: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input 
                type="password" 
                className="input" 
                placeholder="••••••••"
                value={loginData.password}
                onChange={e => setLoginData({ ...loginData, password: e.target.value })}
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button type="submit" className="btn btn-primary w-full py-3">
              Masuk ke Sistem
            </button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">© 2026 SIMSARPRAS v1.0.0</p>
          </div>
        </motion.div>
      </div>
    );
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'operator', 'user'] },
    { id: 'inventory-umum', label: 'Inventaris Umum', icon: Package, roles: ['admin', 'operator', 'user'] },
    { id: 'inventory-tanah', label: 'Inventaris Tanah', icon: Map, roles: ['admin', 'operator', 'user'] },
    { id: 'inventory-bangunan', label: 'Inventaris Gedung', icon: Building2, roles: ['admin', 'operator', 'user'] },
    { id: 'mutasi', label: 'Mutasi Barang', icon: ArrowLeftRight, roles: ['admin', 'operator'] },
    { id: 'opname', label: 'Stock Opname', icon: ClipboardCheck, roles: ['admin', 'operator'] },
    { id: 'procurement', label: 'Pengajuan Barang', icon: Plus, roles: ['admin', 'operator', 'user'] },
    { id: 'reports', label: 'Laporan', icon: FileText, roles: ['admin', 'operator'] },
    { id: 'rooms', label: 'Data Ruangan', icon: Users, roles: ['admin', 'operator'] },
    { id: 'ai-analyst', label: 'Analis AI', icon: Sparkles, roles: ['admin'] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(user.role));

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="bg-slate-900 text-slate-400 flex flex-col sticky top-0 h-screen z-50 transition-all duration-300"
      >
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Building2 className="text-white w-5 h-5" />
              </div>
              <span className="font-bold text-white tracking-tight">SIMSARPRAS</span>
            </div>
          )}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {filteredMenu.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                activeTab === item.id 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' 
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={20} className={activeTab === item.id ? 'text-white' : 'text-slate-400'} />
              {isSidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className={`flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-800/50 ${!isSidebarOpen && 'justify-center'}`}>
            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white shrink-0">
              <UserIcon size={20} />
            </div>
            {isSidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                <p className="text-xs text-slate-500 uppercase tracking-wider">{user.role}</p>
              </div>
            )}
          </div>
          <button 
            onClick={handleLogout}
            className={`w-full mt-4 flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-all ${!isSidebarOpen && 'justify-center'}`}
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="font-medium">Keluar</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-40">
          <h2 className="text-lg font-semibold text-slate-800">
            {menuItems.find(m => m.id === activeTab)?.label}
          </h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-slate-400 hover:text-indigo-600 transition-colors relative"
              >
                <Bell size={20} />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                )}
              </button>
              
              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden"
                  >
                    <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                      <h4 className="font-bold text-slate-900">Notifikasi</h4>
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                        {notifications.length} Baru
                      </span>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map(n => (
                          <button 
                            key={n.id}
                            onClick={() => { setActiveTab(n.tab); setShowNotifications(false); }}
                            className="w-full p-4 text-left hover:bg-slate-50 border-b border-slate-50 transition-colors flex gap-3"
                          >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                              n.type === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'
                            }`}>
                              <Info size={16} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">{n.title}</p>
                              <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="p-8 text-center">
                          <p className="text-sm text-slate-400 italic">Tidak ada notifikasi baru</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Cari data..." 
                className="pl-10 pr-4 py-1.5 bg-slate-100 border-none rounded-full text-sm w-64 focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
            <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <Settings size={20} />
            </button>
          </div>
        </header>

        <div className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && <Dashboard user={user} onNavigate={setActiveTab} />}
              {activeTab.startsWith('inventory-') && (
                <InventoryView 
                  category={activeTab.split('-')[1] as ItemCategory} 
                  user={user} 
                />
              )}
              {activeTab === 'mutasi' && <MutationView user={user} />}
              {activeTab === 'opname' && <OpnameView user={user} />}
              {activeTab === 'procurement' && <ProcurementView user={user} />}
              {activeTab === 'reports' && <ReportView user={user} />}
              {activeTab === 'rooms' && <RoomView user={user} />}
              {activeTab === 'ai-analyst' && <AIAnalyst />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

// Sub-components (Simplified versions for now, will be detailed later)
function InventoryView({ category, user }: { category: ItemCategory, user: User }) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [showScanner, setShowScanner] = useState(false);

  const fetchItems = async () => {
    const res = await fetch(`/api/inventory?category=${category}`);
    const data = await res.json();
    setItems(data);
  };

  useEffect(() => { fetchItems(); }, [category]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-slate-900">
            Daftar Inventaris {category.charAt(0).toUpperCase() + category.slice(1)}
          </h3>
          <p className="text-slate-500">Kelola data aset {category} sekolah</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowScanner(true)}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Barcode size={18} />
            Scan Barcode
          </button>
          {(user.role === 'admin' || user.role === 'operator') && (
            <button 
              onClick={() => { setSelectedItem(null); setShowForm(true); }}
              className="btn btn-primary flex items-center gap-2"
            >
              <Plus size={18} />
              Tambah Item
            </button>
          )}
        </div>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-bottom border-slate-200">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Barcode</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nama Barang</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ruangan</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Kondisi</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map(item => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm text-slate-600">{item.barcode}</td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900">{item.name}</p>
                    <p className="text-xs text-slate-500">{item.brand}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{item.room_name || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.condition === 'baik' ? 'bg-emerald-100 text-emerald-700' :
                      item.condition === 'rusak_ringan' ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {item.condition.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.status === 'aktif' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => { setSelectedItem(item); setShowForm(true); }}
                      className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
                    >
                      Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <InventoryForm 
          item={selectedItem} 
          category={category}
          onClose={() => setShowForm(false)} 
          onSuccess={() => { setShowForm(false); fetchItems(); }}
        />
      )}

      {showScanner && (
        <BarcodeScanner 
          onScan={(code) => {
            const found = items.find(i => i.barcode === code);
            if (found) {
              setSelectedItem(found);
              setShowForm(true);
            } else {
              alert('Item tidak ditemukan');
            }
            setShowScanner(false);
          }}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}

function MutationView({ user }: { user: User }) {
  const [showForm, setShowForm] = useState(false);
  const [mutations, setMutations] = useState<any[]>([]);

  const fetchMutations = async () => {
    const res = await fetch('/api/mutations');
    const data = await res.json();
    setMutations(data);
  };

  useEffect(() => { fetchMutations(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-slate-900">Mutasi Barang</h3>
          <p className="text-slate-500">Riwayat perpindahan barang antar ruangan</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn btn-primary flex items-center gap-2">
          <ArrowLeftRight size={18} />
          Mutasi Baru
        </button>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-bottom border-slate-200">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tanggal</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Barang</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Dari</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ke</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Alasan</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Operator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mutations.map(m => (
                <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {new Date(m.mutation_date).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900">{m.item_name}</p>
                    <p className="text-xs text-slate-500 font-mono">{m.barcode}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{m.from_room_name}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-bold text-indigo-600">{m.to_room_name}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 italic">"{m.reason}"</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{m.operator_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && <MutationForm user={user} onClose={() => setShowForm(false)} onSuccess={() => { setShowForm(false); fetchMutations(); }} />}
    </div>
  );
}

function OpnameView({ user }: { user: User }) {
  const [showForm, setShowForm] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  const fetchHistory = async () => {
    const res = await fetch('/api/opname');
    const data = await res.json();
    setHistory(data);
  };

  useEffect(() => { fetchHistory(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-slate-900">Stock Opname</h3>
          <p className="text-slate-500">Riwayat pemeriksaan kondisi fisik barang</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn btn-primary flex items-center gap-2">
          <ClipboardCheck size={18} />
          Mulai Opname
        </button>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-bottom border-slate-200">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tanggal</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Barang</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Kondisi (Sebelum)</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Kondisi (Sesudah)</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Catatan</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Operator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.map(h => (
                <tr key={h.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {new Date(h.check_date).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900">{h.item_name}</p>
                    <p className="text-xs text-slate-500 font-mono">{h.barcode}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 uppercase">{h.condition_before.replace('_', ' ')}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                      h.condition_after === 'baik' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {h.condition_after.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 italic">"{h.notes || '-'}"</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{h.operator_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && <OpnameForm user={user} onClose={() => setShowForm(false)} onSuccess={() => { setShowForm(false); fetchHistory(); }} />}
    </div>
  );
}

function ProcurementView({ user }: { user: User }) {
  const [requests, setRequests] = useState<ProcurementRequest[]>([]);
  const [showForm, setShowForm] = useState(false);

  const fetchRequests = async () => {
    const res = await fetch('/api/procurement');
    const data = await res.json();
    setRequests(data);
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleStatusChange = async (id: number, status: string) => {
    await fetch(`/api/procurement/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    fetchRequests();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-slate-900">Pengajuan Barang</h3>
          <p className="text-slate-500">Daftar usulan pengadaan sarana prasarana</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn btn-primary flex items-center gap-2">
          <Plus size={18} />
          Buat Pengajuan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {requests.map(req => (
          <div key={req.id} className="card p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-slate-900">{req.item_name}</h4>
                <p className="text-sm text-slate-500">Qty: {req.quantity} unit</p>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                req.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                req.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                req.status === 'rejected' ? 'bg-red-100 text-red-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {req.status}
              </span>
            </div>
            <p className="text-sm text-slate-600 line-clamp-2">{req.purpose}</p>
            <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
              <p className="text-xs text-slate-400">Oleh: {req.requester_name}</p>
              {user.role === 'admin' && req.status === 'pending' && (
                <div className="flex gap-2">
                  <button onClick={() => handleStatusChange(req.id, 'approved')} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"><CheckCircle2 size={18} /></button>
                  <button onClick={() => handleStatusChange(req.id, 'rejected')} className="p-1 text-red-600 hover:bg-red-50 rounded"><XCircle size={18} /></button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {showForm && <ProcurementForm user={user} onClose={() => setShowForm(false)} onSuccess={() => { setShowForm(false); fetchRequests(); }} />}
    </div>
  );
}

function RoomView({ user }: { user: User }) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showForm, setShowForm] = useState(false);

  const fetchRooms = async () => {
    const res = await fetch('/api/rooms');
    const data = await res.json();
    setRooms(data);
  };

  useEffect(() => { fetchRooms(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-slate-900">Data Ruangan</h3>
          <p className="text-slate-500">Kelola lokasi penempatan barang</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn btn-primary flex items-center gap-2">
          <Plus size={18} />
          Tambah Ruangan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map(room => (
          <div key={room.id} className="card p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
                <Building2 size={24} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">{room.name}</h4>
                <p className="text-xs font-mono text-slate-500">{room.code}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Penanggung Jawab:</span>
                <span className="font-medium text-slate-700">{room.pic_name}</span>
              </div>
              <p className="text-sm text-slate-600 italic">"{room.description}"</p>
            </div>
          </div>
        ))}
      </div>

      {showForm && <RoomForm onClose={() => setShowForm(false)} onSuccess={() => { setShowForm(false); fetchRooms(); }} />}
    </div>
  );
}
