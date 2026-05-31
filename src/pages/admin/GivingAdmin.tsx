import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getAllGivingTransactions, updateGivingStatus, GivingTransaction } from '../../lib/givingStore';
import { getChurchSettings, updateChurchSettings } from '../../lib/settingsStore';
import { uploadImage } from '../../lib/storageUtils';
import { DollarSign, CheckCircle2, Clock, XCircle, TrendingUp, Filter, Settings, Upload, Save } from 'lucide-react';

export function GivingAdmin() {
  const { isLeader, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<GivingTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'failed'>('all');
  const [monthFilter, setMonthFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'transactions' | 'settings'>('transactions');

  // Give settings state
  const [giveSettings, setGiveSettings] = useState({
    gcash_number: '', gcash_qr_url: '',
    bpi_account_name: '', bpi_account_number: '', bpi_qr_url: '',
    paypal_email: '',
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const gcashQrRef = useRef<HTMLInputElement>(null);
  const bpiQrRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading && !isLeader) navigate('/');
  }, [authLoading, isLeader, navigate]);

  useEffect(() => {
    if (isLeader) {
      loadTransactions();
      loadSettings();
    }
  }, [isLeader]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const data = await getAllGivingTransactions();
      setTransactions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      const s = await getChurchSettings();
      setGiveSettings({
        gcash_number: s.gcash_number ?? '',
        gcash_qr_url: s.gcash_qr_url ?? '',
        bpi_account_name: s.bpi_account_name ?? '',
        bpi_account_number: s.bpi_account_number ?? '',
        bpi_qr_url: s.bpi_qr_url ?? '',
        paypal_email: s.paypal_email ?? '',
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleQrUpload = async (file: File, field: 'gcash_qr_url' | 'bpi_qr_url') => {
    try {
      const url = await uploadImage(file, 'give-qr');
      setGiveSettings(prev => ({ ...prev, [field]: url }));
    } catch (err) {
      console.error('QR upload failed:', err);
    }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      await updateChurchSettings({
        gcash_number: giveSettings.gcash_number,
        gcash_qr_url: giveSettings.gcash_qr_url,
        bpi_account_name: giveSettings.bpi_account_name,
        bpi_account_number: giveSettings.bpi_account_number,
        bpi_qr_url: giveSettings.bpi_qr_url,
        paypal_email: giveSettings.paypal_email,
      } as Parameters<typeof updateChurchSettings>[0]);
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: 'completed' | 'failed') => {
    await updateGivingStatus(id, status);
    setTransactions(transactions.map(t => t.id === id ? { ...t, status } : t));
  };

  const months = useMemo(() => {
    const seen = new Set<string>();
    const result: { value: string; label: string }[] = [];
    for (const t of transactions) {
      const d = new Date(t.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!seen.has(key)) {
        seen.add(key);
        result.push({ value: key, label: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) });
      }
    }
    return result;
  }, [transactions]);

  // Transactions filtered by both status and month
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const statusOk = filter === 'all' || t.status === filter;
      if (!statusOk) return false;
      if (monthFilter === 'all') return true;
      const d = new Date(t.created_at);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === monthFilter;
    });
  }, [transactions, filter, monthFilter]);

  // Summary totals respect month filter but ignore status filter
  const monthlyTransactions = useMemo(() => {
    if (monthFilter === 'all') return transactions;
    return transactions.filter(t => {
      const d = new Date(t.created_at);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === monthFilter;
    });
  }, [transactions, monthFilter]);

  if (authLoading) return (
    <div className="pt-32 pb-24 min-h-screen bg-church-cream flex items-center justify-center">
      <div className="w-8 h-8 animate-spin rounded-full border-4 border-church-gold border-t-transparent" />
    </div>
  );
  if (!isLeader) return null;

  const totalAmount = monthlyTransactions.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.amount, 0);
  const totalPending = monthlyTransactions.filter(t => t.status === 'pending').reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="pt-32 pb-24 min-h-screen bg-church-cream">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between gap-3 mb-8 flex-wrap">
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-church-gold" />
            <h1 className="text-3xl font-serif font-bold text-church-earth-dark">Giving Admin</h1>
          </div>
          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('transactions')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === 'transactions' ? 'bg-church-gold text-white' : 'bg-church-surface text-church-earth border border-church-earth/10 hover:bg-church-cream'}`}
            >
              <TrendingUp className="w-4 h-4" /> Reports
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === 'settings' ? 'bg-church-gold text-white' : 'bg-church-surface text-church-earth border border-church-earth/10 hover:bg-church-cream'}`}
            >
              <Settings className="w-4 h-4" /> Give Settings
            </button>
          </div>
        </div>

        {activeTab === 'settings' ? (
          /* ─── Give Settings Tab ─── */
          <div className="bg-church-surface rounded-2xl shadow-sm border border-church-earth/10 p-8 space-y-10">
            <div>
              <h2 className="text-xl font-semibold text-church-earth-dark mb-6">GCash Settings</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-church-earth-light mb-1">GCash Number</label>
                  <input
                    type="text"
                    value={giveSettings.gcash_number}
                    onChange={e => setGiveSettings(prev => ({ ...prev, gcash_number: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-church-earth/20 focus:outline-none focus:ring-2 focus:ring-church-gold/50 bg-church-cream/30 text-church-earth-dark"
                    placeholder="e.g. 09171234567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-church-earth-light mb-1">GCash QR Code</label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => gcashQrRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-3 rounded-xl border border-church-earth/20 bg-church-cream/30 text-church-earth hover:bg-church-cream text-sm font-medium transition-colors"
                    >
                      <Upload className="w-4 h-4" /> Upload QR
                    </button>
                    <input ref={gcashQrRef} type="file" accept="image/*" className="sr-only"
                      onChange={e => { const f = e.target.files?.[0]; if (f) handleQrUpload(f, 'gcash_qr_url'); }} />
                    {giveSettings.gcash_qr_url && (
                      <img src={giveSettings.gcash_qr_url} alt="GCash QR" className="w-16 h-16 object-contain rounded-lg border border-church-earth/10" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-church-earth/10 pt-8">
              <h2 className="text-xl font-semibold text-church-earth-dark mb-6">BPI Settings</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-church-earth-light mb-1">Account Name</label>
                  <input
                    type="text"
                    value={giveSettings.bpi_account_name}
                    onChange={e => setGiveSettings(prev => ({ ...prev, bpi_account_name: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-church-earth/20 focus:outline-none focus:ring-2 focus:ring-church-gold/50 bg-church-cream/30 text-church-earth-dark"
                    placeholder="e.g. Jesus Church Inc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-church-earth-light mb-1">Account Number</label>
                  <input
                    type="text"
                    value={giveSettings.bpi_account_number}
                    onChange={e => setGiveSettings(prev => ({ ...prev, bpi_account_number: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-church-earth/20 focus:outline-none focus:ring-2 focus:ring-church-gold/50 bg-church-cream/30 text-church-earth-dark"
                    placeholder="e.g. 1234-5678-90"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-church-earth-light mb-1">BPI QR Code</label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => bpiQrRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-3 rounded-xl border border-church-earth/20 bg-church-cream/30 text-church-earth hover:bg-church-cream text-sm font-medium transition-colors"
                    >
                      <Upload className="w-4 h-4" /> Upload QR
                    </button>
                    <input ref={bpiQrRef} type="file" accept="image/*" className="sr-only"
                      onChange={e => { const f = e.target.files?.[0]; if (f) handleQrUpload(f, 'bpi_qr_url'); }} />
                    {giveSettings.bpi_qr_url && (
                      <img src={giveSettings.bpi_qr_url} alt="BPI QR" className="w-16 h-16 object-contain rounded-lg border border-church-earth/10" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-church-earth/10 pt-8">
              <h2 className="text-xl font-semibold text-church-earth-dark mb-6">PayPal Settings</h2>
              <div className="max-w-sm">
                <label className="block text-sm font-medium text-church-earth-light mb-1">PayPal Email</label>
                <input
                  type="email"
                  value={giveSettings.paypal_email}
                  onChange={e => setGiveSettings(prev => ({ ...prev, paypal_email: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-church-earth/20 focus:outline-none focus:ring-2 focus:ring-church-gold/50 bg-church-cream/30 text-church-earth-dark"
                  placeholder="give@jesuschurch.com"
                />
              </div>
            </div>

            <div className="border-t border-church-earth/10 pt-6 flex items-center gap-4">
              <button
                onClick={handleSaveSettings}
                disabled={savingSettings}
                className="flex items-center gap-2 px-6 py-3 bg-church-gold hover:bg-church-gold-dark text-white rounded-xl font-medium transition-colors disabled:opacity-60"
              >
                <Save className="w-4 h-4" />
                {savingSettings ? 'Saving...' : 'Save Settings'}
              </button>
              {settingsSaved && (
                <span className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4" /> Saved!
                </span>
              )}
            </div>
          </div>
        ) : (
          /* ─── Transactions Tab ─── */
          <>
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-church-surface p-6 rounded-2xl shadow-sm border border-church-earth/10 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-church-earth-light font-medium">Total Received</p>
              <h3 className="text-2xl font-bold text-church-earth-dark">₱{totalAmount.toLocaleString()}</h3>
            </div>
          </div>
          <div className="bg-church-surface p-6 rounded-2xl shadow-sm border border-church-earth/10 flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-church-earth-light font-medium">Pending Verification</p>
              <h3 className="text-2xl font-bold text-church-earth-dark">₱{totalPending.toLocaleString()}</h3>
            </div>
          </div>
          <div className="bg-church-surface p-6 rounded-2xl shadow-sm border border-church-earth/10 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-church-earth-light font-medium">Total Transactions{monthFilter !== 'all' ? ' (month)' : ''}</p>
              <h3 className="text-2xl font-bold text-church-earth-dark">{monthlyTransactions.length}</h3>
            </div>
          </div>
        </div>

        <div className="bg-church-surface rounded-2xl shadow-sm border border-church-earth/10 overflow-hidden">
          <div className="p-4 border-b border-church-earth/10 bg-church-cream/30 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-5 h-5 text-church-earth-light" />
              <span className="font-medium text-church-earth-dark">Status:</span>
              {(['all', 'pending', 'completed', 'failed'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize whitespace-nowrap transition-colors ${
                    filter === f 
                      ? 'bg-church-gold text-white' 
                      : 'bg-church-surface text-church-earth hover:bg-church-cream border border-church-earth/10'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            {/* Month filter */}
            {months.length > 0 && (
              <select
                value={monthFilter}
                onChange={e => setMonthFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-church-earth/20 bg-white text-sm text-church-earth-dark focus:outline-none focus:ring-2 focus:ring-church-gold/50"
              >
                <option value="all">All Months</option>
                {months.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            )}
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-12 text-church-earth-light">Loading transactions...</div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-12 text-church-earth-light">
                No transactions found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-church-earth/10 text-sm text-church-earth-light">
                      <th className="pb-3 font-medium">Date</th>
                      <th className="pb-3 font-medium">Donor</th>
                      <th className="pb-3 font-medium">Category</th>
                      <th className="pb-3 font-medium">Method</th>
                      <th className="pb-3 font-medium">Ref Number</th>
                      <th className="pb-3 font-medium">Amount</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {filteredTransactions.map((transaction) => (
                      <tr key={transaction.id} className="border-b border-church-earth/5 hover:bg-church-cream/20 transition-colors">
                        <td className="py-4 text-church-earth-dark whitespace-nowrap">
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-4">
                          <div className="font-medium text-church-earth-dark">{transaction.donor_name}</div>
                          {transaction.donor_email && <div className="text-xs text-church-earth-light">{transaction.donor_email}</div>}
                        </td>
                        <td className="py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-church-cream text-church-earth-dark border border-church-earth/10">
                            {transaction.category}
                          </span>
                        </td>
                        <td className="py-4 text-church-earth-light">
                          {transaction.payment_method}
                        </td>
                        <td className="py-4 text-church-earth-light font-mono text-xs">
                          {transaction.reference_number || '-'}
                        </td>
                        <td className="py-4 font-bold text-church-earth-dark">
                          ₱{transaction.amount.toLocaleString()}
                        </td>
                        <td className="py-4">
                          {transaction.status === 'completed' && (
                            <span className="inline-flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-md text-xs font-medium">
                              <CheckCircle2 className="w-3 h-3" /> Completed
                            </span>
                          )}
                          {transaction.status === 'pending' && (
                            <span className="inline-flex items-center gap-1 text-yellow-600 bg-yellow-50 px-2 py-1 rounded-md text-xs font-medium">
                              <Clock className="w-3 h-3" /> Pending
                            </span>
                          )}
                          {transaction.status === 'failed' && (
                            <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-md text-xs font-medium">
                              <XCircle className="w-3 h-3" /> Failed
                            </span>
                          )}
                        </td>
                        <td className="py-4 text-right">
                          {transaction.status === 'pending' && (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleStatusUpdate(transaction.id, 'completed')}
                                className="p-1.5 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                                title="Mark as Completed"
                              >
                                <CheckCircle2 className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(transaction.id, 'failed')}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                title="Mark as Failed"
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  );
}
