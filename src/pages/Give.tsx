import React, { useMemo } from 'react';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Heart, Building2, CheckCircle2, Smartphone, Clock, TrendingUp, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { addGivingTransaction, getGivingHistory, GivingCategory, PaymentMethod, GivingTransaction } from '../lib/givingStore';
import { getChurchSettings } from '../lib/settingsStore';

export function Give() {
  const { user } = useAuth();
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<GivingCategory>('Tithes');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('GCash');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Payment settings (QR codes, account details set by admin)
  const [giveSettings, setGiveSettings] = useState({
    gcash_number: '', gcash_qr_url: '',
    bpi_account_name: '', bpi_account_number: '', bpi_qr_url: '',
    paypal_email: '',
  });

  // Personal giving history
  const [history, setHistory] = useState<GivingTransaction[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyMonth, setHistoryMonth] = useState<string>('all');

  useEffect(() => {
    getChurchSettings().then(s => {
      setGiveSettings({
        gcash_number: s.gcash_number ?? '',
        gcash_qr_url: s.gcash_qr_url ?? '',
        bpi_account_name: s.bpi_account_name ?? '',
        bpi_account_number: s.bpi_account_number ?? '',
        bpi_qr_url: s.bpi_qr_url ?? '',
        paypal_email: s.paypal_email ?? '',
      });
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    setHistoryLoading(true);
    getGivingHistory(user.id).then(data => {
      setHistory(data);
      setHistoryLoading(false);
    });
  }, [user]);

  const historyMonths = useMemo(() => {
    const seen = new Set<string>();
    const result: { value: string; label: string }[] = [];
    for (const t of history) {
      const d = new Date(t.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!seen.has(key)) {
        seen.add(key);
        result.push({ value: key, label: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) });
      }
    }
    return result;
  }, [history]);

  const filteredHistory = useMemo(() => {
    if (historyMonth === 'all') return history;
    return history.filter(t => {
      const d = new Date(t.created_at);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === historyMonth;
    });
  }, [history, historyMonth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;
    if ((paymentMethod === 'GCash' || paymentMethod === 'BPI' || paymentMethod === 'PayPal') && !referenceNumber) return;

    setIsSubmitting(true);
    
    await addGivingTransaction({
      user_id: user?.id,
      donor_name: user?.full_name || 'Anonymous',
      donor_email: user?.email,
      amount: Number(amount),
      category,
      payment_method: paymentMethod,
      reference_number: referenceNumber
    });

    setIsSubmitting(false);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setShowForm(false);
      setAmount('');
      setReferenceNumber('');
    }, 3000);
  };

  return (
    <main className="pt-32 pb-24 bg-church-cream  min-h-screen">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto text-center mb-16"
        >
          <span className="text-church-gold font-medium tracking-wider uppercase text-sm">Generosity</span>
          <h1 className="font-serif text-5xl md:text-6xl font-bold text-church-earth-dark  mt-4 mb-6">
            Give Online
          </h1>
          <p className="text-xl text-church-earth-light  leading-relaxed">
            Your generosity helps us continue our mission to love God, love people, and make a difference in our community.
          </p>
        </motion.div>

        {!showForm ? (
          <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8 mb-16">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white  p-8 rounded-2xl shadow-sm border border-church-earth/5  text-center flex flex-col h-full transition-all hover:shadow-md"
            >
              <div className="w-16 h-16 bg-church-gold/10  rounded-full flex items-center justify-center mx-auto mb-6 text-church-gold">
                <Smartphone className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-2xl font-semibold text-church-earth-dark  mb-4">Online Giving</h3>
              <p className="text-church-earth-light  mb-8 flex-grow">Securely give a one-time or recurring gift using GCash, BPI, or PayPal.</p>
              <button 
                onClick={() => setShowForm(true)}
                className="w-full bg-church-gold hover:bg-church-gold-dark text-white px-6 py-3 rounded-xl font-medium transition-all hover:shadow-md hover:-translate-y-0.5"
              >
                Give Now
              </button>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white  p-8 rounded-2xl shadow-sm border border-church-earth/5  text-center flex flex-col h-full transition-all hover:shadow-md"
            >
              <div className="w-16 h-16 bg-church-gold/10  rounded-full flex items-center justify-center mx-auto mb-6 text-church-gold">
                <Building2 className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-2xl font-semibold text-church-earth-dark  mb-4">In Person</h3>
              <p className="text-church-earth-light  mb-8 flex-grow">You can give during any of our weekend services by dropping your gift in the offering boxes.</p>
              <p className="text-church-earth-dark  font-medium">Available at all campuses</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white  p-8 rounded-2xl shadow-sm border border-church-earth/5  text-center flex flex-col h-full transition-all hover:shadow-md"
            >
              <div className="w-16 h-16 bg-church-gold/10  rounded-full flex items-center justify-center mx-auto mb-6 text-church-gold">
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-2xl font-semibold text-church-earth-dark  mb-4">Mail a Check</h3>
              <p className="text-church-earth-light  mb-8 flex-grow">Make checks payable to "Jesus Church" and mail to our main office address.</p>
              <p className="text-church-earth-dark  font-medium">123 Faith Avenue<br/>Graceville, ST 12345</p>
            </motion.div>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto bg-white  p-8 rounded-3xl shadow-lg border border-church-earth/10 "
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-serif font-bold text-church-earth-dark ">Online Giving Form</h2>
              <button 
                onClick={() => setShowForm(false)}
                className="text-church-earth-light  hover:text-church-earth-dark :text-church-cream transition-colors"
              >
                Cancel
              </button>
            </div>

            {success ? (
              <div className="bg-green-50  text-green-700  p-8 rounded-2xl flex flex-col items-center justify-center text-center gap-4">
                <CheckCircle2 className="w-16 h-16" />
                <div>
                  <h3 className="text-xl font-bold mb-2">Thank you for your generosity!</h3>
                  <p>Your giving record has been submitted successfully.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-church-earth-light  mb-2">Amount (PHP/USD)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-church-earth/20  focus:outline-none focus:ring-2 focus:ring-church-gold/50 bg-church-cream/30  text-lg text-church-earth-dark "
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-church-earth-light  mb-2">Category</label>
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value as GivingCategory)}
                      className="w-full px-4 py-3 rounded-xl border border-church-earth/20  focus:outline-none focus:ring-2 focus:ring-church-gold/50 bg-church-cream/30  text-lg text-church-earth-dark "
                    >
                      <option value="Tithes">Tithes</option>
                      <option value="Offering">Offering</option>
                      <option value="Missions">Missions</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-church-earth-light  mb-2">Payment Method</label>
                  <div className="grid grid-cols-3 gap-3">
                    <label className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-colors ${paymentMethod === 'GCash' ? 'border-blue-500 bg-blue-50  text-blue-700 ' : 'border-church-earth/20  text-church-earth-light  hover:bg-church-cream hover:bg-church-earth/20'}`}>
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        className="sr-only"
                        checked={paymentMethod === 'GCash'}
                        onChange={() => setPaymentMethod('GCash')}
                      />
                      <span className="font-bold text-base tracking-wider">GCash</span>
                    </label>
                    <label className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-colors ${paymentMethod === 'BPI' ? 'border-red-600 bg-red-50  text-red-700 ' : 'border-church-earth/20  text-church-earth-light  hover:bg-church-cream hover:bg-church-earth/20'}`}>
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        className="sr-only"
                        checked={paymentMethod === 'BPI'}
                        onChange={() => setPaymentMethod('BPI')}
                      />
                      <span className="font-bold text-base">BPI</span>
                    </label>
                    <label className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-colors ${paymentMethod === 'PayPal' ? 'border-blue-800 bg-blue-50  text-blue-900 ' : 'border-church-earth/20  text-church-earth-light  hover:bg-church-cream hover:bg-church-earth/20'}`}>
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        className="sr-only"
                        checked={paymentMethod === 'PayPal'}
                        onChange={() => setPaymentMethod('PayPal')}
                      />
                      <span className="font-bold text-base italic">PayPal</span>
                    </label>
                  </div>
                </div>

                <div className="bg-church-cream/50  p-6 rounded-xl border border-church-earth/10 ">
                  <h4 className="font-medium text-church-earth-dark  mb-4">Payment Instructions</h4>
                  {paymentMethod === 'GCash' && (
                    <div className="space-y-2 text-sm text-church-earth ">
                      {giveSettings.gcash_qr_url && (
                        <div className="flex justify-center mb-4">
                          <img src={giveSettings.gcash_qr_url} alt="GCash QR Code" className="w-40 h-40 object-contain rounded-xl border border-church-earth/10" />
                        </div>
                      )}
                      <p>1. Open your GCash app and select "Send Money" or scan the QR code.</p>
                      {giveSettings.gcash_number && (
                        <p>2. Send to: <strong className="text-church-earth-dark ">{giveSettings.gcash_number}</strong> (Jesus Church)</p>
                      )}
                      <p>{giveSettings.gcash_number ? '3.' : '2.'} Enter the Reference Number below to verify your transaction.</p>
                    </div>
                  )}
                  {paymentMethod === 'BPI' && (
                    <div className="space-y-2 text-sm text-church-earth ">
                      {giveSettings.bpi_qr_url && (
                        <div className="flex justify-center mb-4">
                          <img src={giveSettings.bpi_qr_url} alt="BPI QR Code" className="w-40 h-40 object-contain rounded-xl border border-church-earth/10" />
                        </div>
                      )}
                      <p>1. Open your BPI app, select "Transfer", and scan the QR code or use the details below.</p>
                      {giveSettings.bpi_account_name && (
                        <p>Account Name: <strong className="text-church-earth-dark ">{giveSettings.bpi_account_name}</strong></p>
                      )}
                      {giveSettings.bpi_account_number && (
                        <p>Account Number: <strong className="text-church-earth-dark ">{giveSettings.bpi_account_number}</strong></p>
                      )}
                      <p>2. Enter the Reference Number below to confirm your transfer.</p>
                    </div>
                  )}
                  {paymentMethod === 'PayPal' && (
                    <div className="space-y-2 text-sm text-church-earth ">
                      <p>1. Go to PayPal and send money to: <strong className="text-church-earth-dark ">{giveSettings.paypal_email || 'give@jesuschurch.com'}</strong></p>
                      <p>2. Enter the Transaction ID/Reference Number below.</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-church-earth-light  mb-2">Reference Number</label>
                  <input
                    type="text"
                    required
                    value={referenceNumber}
                    onChange={e => setReferenceNumber(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-church-earth/20  focus:outline-none focus:ring-2 focus:ring-church-gold/50 bg-church-cream/30  text-church-earth-dark "
                    placeholder="e.g. 10023456789"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-church-gold hover:bg-church-gold-dark text-white py-4 rounded-xl font-medium transition-all hover:shadow-md hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 text-lg"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Giving Record'}
                </button>
              </form>
            )}
          </motion.div>
        )}

        {/* Personal giving history — only for logged-in users */}
        {!showForm && user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto mt-16"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-church-gold/10 rounded-full flex items-center justify-center text-church-gold">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h2 className="font-serif text-2xl font-bold text-church-earth-dark ">Your Giving History</h2>
              </div>
              {historyMonths.length > 0 && (
                <div className="relative">
                  <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-church-earth-light pointer-events-none" />
                  <select
                    value={historyMonth}
                    onChange={e => setHistoryMonth(e.target.value)}
                    className="pl-4 pr-9 py-2 rounded-xl border border-church-earth/20  bg-white  text-sm text-church-earth-dark  focus:outline-none focus:ring-2 focus:ring-church-gold/50 appearance-none"
                  >
                    <option value="all">All Time</option>
                    {historyMonths.map(m => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {historyLoading ? (
              <div className="text-center py-12 text-church-earth-light ">Loading your history...</div>
            ) : filteredHistory.length === 0 ? (
              <div className="text-center py-12 bg-white  rounded-2xl border border-church-earth/10  text-church-earth-light ">
                No giving records {historyMonth !== 'all' ? 'for this month' : 'yet'}. Your first gift starts a legacy!
              </div>
            ) : (
              <div className="space-y-3">
                {filteredHistory.map(t => (
                  <div key={t.id} className="bg-white  rounded-2xl border border-church-earth/10  px-6 py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${t.status === 'completed' ? 'bg-green-100 text-green-600' : t.status === 'pending' ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-500'}`}>
                        {t.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="font-medium text-church-earth-dark ">{t.category}</div>
                        <div className="text-xs text-church-earth-light ">
                          {new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          {' · '}{t.payment_method}
                          {t.reference_number && <span className="ml-1 font-mono">#{t.reference_number}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold text-lg text-church-earth-dark ">₱{t.amount.toLocaleString()}</div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${t.status === 'completed' ? 'bg-green-100 text-green-700' : t.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-600'}`}>
                        {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </main>
  );
}
