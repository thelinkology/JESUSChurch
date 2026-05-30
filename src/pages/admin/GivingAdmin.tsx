import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getAllGivingTransactions, updateGivingStatus, GivingTransaction } from '../../lib/givingStore';
import { DollarSign, CheckCircle2, Clock, XCircle, TrendingUp, Filter } from 'lucide-react';

export function GivingAdmin() {
  const { isLeader, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<GivingTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'failed'>('all');

  useEffect(() => {
    if (!authLoading && !isLeader) navigate('/');
  }, [authLoading, isLeader, navigate]);

  useEffect(() => {
    if (isLeader) loadTransactions();
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

  const handleStatusUpdate = async (id: string, status: 'completed' | 'failed') => {
    await updateGivingStatus(id, status);
    setTransactions(transactions.map(t => t.id === id ? { ...t, status } : t));
  };

  if (authLoading) return (
    <div className="pt-32 pb-24 min-h-screen bg-church-cream flex items-center justify-center">
      <div className="w-8 h-8 animate-spin rounded-full border-4 border-church-gold border-t-transparent" />
    </div>
  );
  if (!isLeader) return null;

  const filteredTransactions = transactions.filter(t => filter === 'all' || t.status === filter);

  // Calculate totals
  const totalAmount = transactions.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.amount, 0);
  const totalPending = transactions.filter(t => t.status === 'pending').reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="pt-32 pb-24 min-h-screen bg-church-cream">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center gap-3 mb-8">
          <DollarSign className="w-8 h-8 text-church-gold" />
          <h1 className="text-3xl font-serif font-bold text-church-earth-dark">Giving Reports</h1>
        </div>

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
              <p className="text-sm text-church-earth-light font-medium">Total Transactions</p>
              <h3 className="text-2xl font-bold text-church-earth-dark">{transactions.length}</h3>
            </div>
          </div>
        </div>

        <div className="bg-church-surface rounded-2xl shadow-sm border border-church-earth/10 overflow-hidden">
          <div className="p-4 border-b border-church-earth/10 bg-church-cream/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-church-earth-light" />
              <span className="font-medium text-church-earth-dark">Filter:</span>
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {(['all', 'pending', 'completed', 'failed'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize whitespace-nowrap transition-colors ${
                    filter === f 
                      ? 'bg-church-gold text-white' 
                      : 'bg-church-surface text-church-earth hover:bg-church-cream border border-church-earth/10'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
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
      </div>
    </div>
  );
}
