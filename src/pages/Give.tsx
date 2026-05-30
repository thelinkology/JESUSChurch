import React from 'react';
import { useState } from 'react';
import { motion } from 'motion/react';
import { Heart, CreditCard, Building2, CheckCircle2, Smartphone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { addGivingTransaction, GivingCategory, PaymentMethod } from '../lib/givingStore';

export function Give() {
  const { user } = useAuth();
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<GivingCategory>('Tithes');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('GCash');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;
    if ((paymentMethod === 'GCash' || paymentMethod === 'PayPal') && !referenceNumber) return;

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
              <p className="text-church-earth-light  mb-8 flex-grow">Securely give a one-time or recurring gift using GCash or PayPal.</p>
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
                  <div className="grid grid-cols-2 gap-4">
                    <label className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-colors ${paymentMethod === 'GCash' ? 'border-blue-500 bg-blue-50  text-blue-700 ' : 'border-church-earth/20  text-church-earth-light  hover:bg-church-cream hover:bg-church-earth/20'}`}>
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        className="sr-only"
                        checked={paymentMethod === 'GCash'}
                        onChange={() => setPaymentMethod('GCash')}
                      />
                      <span className="font-bold text-lg tracking-wider">GCash</span>
                    </label>
                    <label className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-colors ${paymentMethod === 'PayPal' ? 'border-blue-800 bg-blue-50  text-blue-900 ' : 'border-church-earth/20  text-church-earth-light  hover:bg-church-cream hover:bg-church-earth/20'}`}>
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        className="sr-only"
                        checked={paymentMethod === 'PayPal'}
                        onChange={() => setPaymentMethod('PayPal')}
                      />
                      <span className="font-bold text-lg italic">PayPal</span>
                    </label>
                  </div>
                </div>

                <div className="bg-church-cream/50  p-6 rounded-xl border border-church-earth/10 ">
                  <h4 className="font-medium text-church-earth-dark  mb-4">Payment Instructions</h4>
                  {paymentMethod === 'GCash' ? (
                    <div className="space-y-2 text-sm text-church-earth ">
                      <p>1. Open your GCash app and select "Send Money" or "Transfer".</p>
                      <p>2. Send to: <strong className="text-church-earth-dark ">0917-123-4567</strong> (Jesus Church)</p>
                      <p>3. Enter the Reference Number below to verify your transaction.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 text-sm text-church-earth ">
                      <p>1. Go to PayPal and send money to: <strong className="text-church-earth-dark ">give@jesuschurch.com</strong></p>
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
      </div>
    </main>
  );
}
