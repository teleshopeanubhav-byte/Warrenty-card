import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LogOut, Search, Trash2, Edit2, Download, Filter, 
  TrendingUp, Users, Calendar, Package, ChevronDown, 
  ChevronUp, X, Check, Eye, Smartphone, MapPin
} from 'lucide-react';
import { Warranty } from '../types';
import { cn, formatDate, calculateExpiryDate } from '../lib/utils';

export default function AdminDashboard() {
  const [warranties, setWarranties] = useState<Warranty[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [editingWarranty, setEditingWarranty] = useState<Warranty | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, 'warranties'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Warranty[];
      setWarranties(data);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem('admin_auth');
    navigate('/admin/login');
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'warranties', id));
      setIsDeleting(null);
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Failed to delete entry.');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWarranty?.id) return;

    try {
      const { id, ...data } = editingWarranty;
      await updateDoc(doc(db, 'warranties', id), data);
      setEditingWarranty(null);
    } catch (error) {
      console.error('Error updating document:', error);
      alert('Failed to update entry.');
    }
  };

  const filteredWarranties = warranties.filter(w => 
    w.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.phoneNumber.includes(searchTerm)
  );

  const stats = {
    total: warranties.length,
    today: warranties.filter(w => {
      const today = new Date().toISOString().split('T')[0];
      return w.purchaseDate === today;
    }).length,
    thisMonth: warranties.filter(w => {
      const thisMonth = new Date().getMonth();
      const thisYear = new Date().getFullYear();
      const purchaseDate = new Date(w.purchaseDate);
      return purchaseDate.getMonth() === thisMonth && purchaseDate.getFullYear() === thisYear;
    }).length
  };

  return (
    <div className="min-h-screen bg-dark-bg p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <div>
          <h1 className="text-3xl font-bold gold-text">Admin Dashboard</h1>
          <p className="text-muted">Manage Bunty Electronics Warranty Registrations</p>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 bg-dark-surface border border-dark-border px-6 py-2.5 rounded-xl text-muted hover:text-gold hover:border-gold transition-all"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>

      {/* Stats Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass p-6 rounded-2xl">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-gold/10 rounded-xl text-gold"><Users size={24} /></div>
            <span className="text-xs text-green-500 bg-green-500/10 px-2 py-1 rounded-full">+12%</span>
          </div>
          <p className="text-muted text-sm">Total Registrations</p>
          <h3 className="text-3xl font-bold mt-1">{stats.total}</h3>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass p-6 rounded-2xl">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-gold/10 rounded-xl text-gold"><Calendar size={24} /></div>
            <span className="text-xs text-gold bg-gold/10 px-2 py-1 rounded-full">Today</span>
          </div>
          <p className="text-muted text-sm">Today's Entries</p>
          <h3 className="text-3xl font-bold mt-1">{stats.today}</h3>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass p-6 rounded-2xl">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-gold/10 rounded-xl text-gold"><TrendingUp size={24} /></div>
            <span className="text-xs text-blue-500 bg-blue-500/10 px-2 py-1 rounded-full">Monthly</span>
          </div>
          <p className="text-muted text-sm">This Month</p>
          <h3 className="text-3xl font-bold mt-1">{stats.thisMonth}</h3>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto glass rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-dark-border flex flex-col md:flex-row justify-between items-center gap-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Package size={20} className="text-gold" /> Recent Registrations
          </h2>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-3 text-muted" size={18} />
            <input 
              type="text"
              placeholder="Search by name, product, or S/N..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-dark-bg border border-dark-border rounded-xl py-2.5 pl-10 pr-4 focus:border-gold outline-none transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-dark-surface/50 text-muted text-sm uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Serial Number</th>
                <th className="px-6 py-4 font-medium">Purchase Date</th>
                <th className="px-6 py-4 font-medium">Expiry Date</th>
                <th className="px-6 py-4 font-medium">Warranty</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {isLoading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-muted">Loading data...</td></tr>
              ) : filteredWarranties.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-muted">No registrations found.</td></tr>
              ) : (
                filteredWarranties.map((w) => (
                  <tr key={w.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-medium">{w.customerName}</div>
                      <div className="text-xs text-muted flex items-center gap-1"><Smartphone size={10} /> {w.phoneNumber}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{w.product}</div>
                      <div className="text-xs text-gold">{w.brand}</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm">{w.serialNumber}</td>
                    <td className="px-6 py-4 text-sm">{formatDate(w.purchaseDate)}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gold">
                      {w.expiryDate === 'Lifetime' ? 'Lifetime' : formatDate(w.expiryDate)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs bg-gold/10 text-gold px-2 py-1 rounded-full border border-gold/20">
                        {w.warrantyPeriod}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => navigate(`/warranty/${w.id}`)}
                          className="p-2 text-muted hover:text-gold transition-colors"
                          title="View Card"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => setEditingWarranty(w)}
                          className="p-2 text-muted hover:text-blue-500 transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => setIsDeleting(w.id || null)}
                          className="p-2 text-muted hover:text-red-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingWarranty && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-2xl w-full glass p-8 rounded-2xl shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold gold-text">Edit Registration</h3>
                <button onClick={() => setEditingWarranty(null)} className="text-muted hover:text-white"><X size={24} /></button>
              </div>
              
              <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-muted">Customer Name</label>
                  <input 
                    value={editingWarranty.customerName}
                    onChange={(e) => setEditingWarranty({...editingWarranty, customerName: e.target.value})}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg p-2.5 focus:border-gold outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted">Phone Number</label>
                  <input 
                    value={editingWarranty.phoneNumber}
                    onChange={(e) => setEditingWarranty({...editingWarranty, phoneNumber: e.target.value})}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg p-2.5 focus:border-gold outline-none"
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs text-muted">Address</label>
                  <input 
                    value={editingWarranty.address}
                    onChange={(e) => setEditingWarranty({...editingWarranty, address: e.target.value})}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg p-2.5 focus:border-gold outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted">Product</label>
                  <input 
                    value={editingWarranty.product}
                    onChange={(e) => setEditingWarranty({...editingWarranty, product: e.target.value})}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg p-2.5 focus:border-gold outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted">Brand</label>
                  <input 
                    value={editingWarranty.brand}
                    onChange={(e) => setEditingWarranty({...editingWarranty, brand: e.target.value})}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg p-2.5 focus:border-gold outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted">Serial Number</label>
                  <input 
                    value={editingWarranty.serialNumber}
                    onChange={(e) => setEditingWarranty({...editingWarranty, serialNumber: e.target.value})}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg p-2.5 focus:border-gold outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted">Price</label>
                  <input 
                    type="number"
                    value={editingWarranty.price}
                    onChange={(e) => setEditingWarranty({...editingWarranty, price: Number(e.target.value)})}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg p-2.5 focus:border-gold outline-none"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs text-muted">Purchase Date</label>
                  <input 
                    type="date"
                    value={editingWarranty.purchaseDate}
                    onChange={(e) => {
                      const newDate = e.target.value;
                      const newExpiry = calculateExpiryDate(newDate, editingWarranty.warrantyPeriod);
                      setEditingWarranty({...editingWarranty, purchaseDate: newDate, expiryDate: newExpiry});
                    }}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg p-2.5 focus:border-gold outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted">Warranty Period</label>
                  <select 
                    value={editingWarranty.warrantyPeriod}
                    onChange={(e) => {
                      const newPeriod = e.target.value;
                      const newExpiry = calculateExpiryDate(editingWarranty.purchaseDate, newPeriod);
                      setEditingWarranty({...editingWarranty, warrantyPeriod: newPeriod, expiryDate: newExpiry});
                    }}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg p-2.5 focus:border-gold outline-none"
                  >
                    <option value="6 Months">6 Months</option>
                    <option value="1 Year">1 Year</option>
                    <option value="2 Years">2 Years</option>
                    <option value="3 Years">3 Years</option>
                    <option value="5 Years">5 Years</option>
                    <option value="Lifetime">Lifetime</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted">Expiry Date</label>
                  <input 
                    type="text"
                    readOnly
                    value={editingWarranty.expiryDate}
                    className="w-full bg-dark-bg/50 border border-dark-border rounded-lg p-2.5 text-gold outline-none cursor-not-allowed"
                  />
                </div>
                
                <div className="md:col-span-2 flex justify-end gap-3 mt-6">
                  <button 
                    type="button"
                    onClick={() => setEditingWarranty(null)}
                    className="px-6 py-2 rounded-lg border border-dark-border text-muted hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-6 py-2 rounded-lg gold-gradient text-dark-bg font-bold shadow-lg"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {isDeleting && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-sm w-full glass p-8 rounded-2xl shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Confirm Delete</h3>
              <p className="text-muted mb-8">Are you sure you want to delete this warranty registration? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsDeleting(null)}
                  className="flex-1 py-2 rounded-lg border border-dark-border text-muted hover:bg-white/5"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleDelete(isDeleting)}
                  className="flex-1 py-2 rounded-lg bg-red-500 text-white font-bold shadow-lg hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
