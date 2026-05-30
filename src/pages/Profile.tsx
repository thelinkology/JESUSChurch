import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Shield, LogOut, History, Heart, CheckCircle2, Clock, XCircle, Edit2, Save, X, Camera, Loader2, Phone } from 'lucide-react';
import { getGivingHistory, GivingTransaction } from '../lib/givingStore';
import { updateProfile } from '../lib/authStore';
import { uploadImage } from '../lib/storageUtils';
import { Skeleton } from '../components/ui/Skeleton';

export function Profile() {
  const { user, logout, loading, setUser } = useAuth();
  const navigate = useNavigate();
  const [givingHistory, setGivingHistory] = useState<GivingTransaction[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Edit mode
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && !user) navigate('/login');
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      loadHistory();
      setEditName(user.full_name);
      setEditPhone(user.phone || '');
    }
  }, [user]);

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const history = await getGivingHistory(user?.id);
      setGivingHistory(history);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);
    try {
      const updated = await updateProfile(user.id, { full_name: editName, phone: editPhone });
      if (updated) setUser(updated);
      setEditing(false);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploadingAvatar(true);
    try {
      const url = await uploadImage(file, 'avatars');
      const updated = await updateProfile(user.id, { avatar_url: url });
      if (updated) setUser(updated);
    } catch (err) {
      console.error('Avatar upload failed:', err);
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loading || !user) {
    return (
      <main className="pt-32 pb-24 bg-church-cream min-h-screen">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <div className="bg-white rounded-3xl shadow-sm border border-church-earth/5 overflow-hidden mb-8">
            <div className="bg-church-earth-dark h-32 relative">
              <div className="absolute -bottom-12 left-8 w-24 h-24 bg-church-cream rounded-full border-4 border-white shadow-md">
                <Skeleton className="w-full h-full rounded-full" />
              </div>
            </div>
            <div className="pt-16 px-8 pb-8">
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-32 mb-6" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <main className="pt-32 pb-24 bg-church-cream min-h-screen">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Profile Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-church-earth/5 overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-church-earth-dark to-church-earth h-36 relative" />

            {/* Avatar */}
            <div className="px-8 pb-8 -mt-12">
              <div className="flex justify-between items-end mb-6">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden bg-church-cream flex items-center justify-center text-church-gold">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <User className="w-10 h-10" />
                    )}
                    {uploadingAvatar && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full">
                        <Loader2 className="w-6 h-6 animate-spin text-white" />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="absolute bottom-0 right-0 w-8 h-8 bg-church-gold text-white rounded-full flex items-center justify-center shadow-md hover:bg-church-earth transition-colors"
                    title="Change photo"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                  <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </div>

                <div className="flex items-center gap-2">
                  <div className="bg-church-gold/10 text-church-gold px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 border border-church-gold/20">
                    <Shield className="w-4 h-4" /> {user.role}
                  </div>
                  {!editing && (
                    <button
                      onClick={() => setEditing(true)}
                      className="flex items-center gap-2 bg-church-cream border border-church-earth/20 text-church-earth-dark px-4 py-1.5 rounded-full text-sm font-medium hover:bg-church-earth/10 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" /> Edit Profile
                    </button>
                  )}
                </div>
              </div>

              {/* Name & Info */}
              {editing ? (
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-church-earth-dark mb-1">Full Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-church-earth/20 focus:outline-none focus:ring-2 focus:ring-church-gold/50 bg-church-cream/30 text-church-earth-dark text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-church-earth-dark mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={e => setEditPhone(e.target.value)}
                      placeholder="+63 9XX XXX XXXX"
                      className="w-full px-4 py-2.5 rounded-lg border border-church-earth/20 focus:outline-none focus:ring-2 focus:ring-church-gold/50 bg-church-cream/30 text-church-earth-dark text-sm"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleSaveProfile}
                      disabled={savingProfile}
                      className="flex items-center gap-2 bg-church-gold hover:bg-church-earth text-white px-6 py-2 rounded-lg font-medium text-sm transition-colors"
                    >
                      {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Changes
                    </button>
                    <button
                      onClick={() => { setEditing(false); setEditName(user.full_name); setEditPhone(user.phone || ''); }}
                      className="flex items-center gap-2 text-church-earth-light hover:text-church-earth-dark text-sm px-4 py-2"
                    >
                      <X className="w-4 h-4" /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h1 className="font-serif text-3xl font-bold text-church-earth-dark mb-1">{user.full_name}</h1>
                  <p className="text-church-earth-light flex items-center gap-2 mb-1">
                    <Mail className="w-4 h-4" /> {user.email}
                  </p>
                  {user.phone && (
                    <p className="text-church-earth-light flex items-center gap-2">
                      <Phone className="w-4 h-4" /> {user.phone}
                    </p>
                  )}
                </div>
              )}

              <div className="mt-8 border-t border-church-earth/10 pt-6">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-red-500 hover:text-red-600 font-medium transition-colors text-sm"
                >
                  <LogOut className="w-5 h-5" /> Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Giving History */}
          <div className="bg-white rounded-3xl shadow-sm border border-church-earth/5 overflow-hidden p-8">
            <div className="flex items-center gap-3 mb-6">
              <History className="w-6 h-6 text-church-gold" />
              <h2 className="font-serif text-2xl font-bold text-church-earth-dark">Giving History</h2>
            </div>

            {loadingHistory ? (
              <div className="text-center py-8 text-church-earth-light">Loading history...</div>
            ) : givingHistory.length === 0 ? (
              <div className="text-center py-12 bg-church-cream/30 rounded-2xl border border-church-earth/10">
                <Heart className="w-12 h-12 text-church-earth-light/50 mx-auto mb-4" />
                <p className="text-church-earth-light">You haven't made any online donations yet.</p>
                <button onClick={() => navigate('/give')} className="mt-4 text-church-gold font-medium hover:text-church-earth transition-colors">
                  Give Now
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-church-earth/10 text-sm text-church-earth-light">
                      <th className="pb-3 font-medium">Date</th>
                      <th className="pb-3 font-medium">Category</th>
                      <th className="pb-3 font-medium">Amount</th>
                      <th className="pb-3 font-medium">Method</th>
                      <th className="pb-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {givingHistory.map((transaction) => (
                      <tr key={transaction.id} className="border-b border-church-earth/5 hover:bg-church-cream/20 transition-colors">
                        <td className="py-4 text-church-earth-dark">{new Date(transaction.created_at).toLocaleDateString()}</td>
                        <td className="py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-church-cream text-church-earth-dark border border-church-earth/10">
                            {transaction.category}
                          </span>
                        </td>
                        <td className="py-4 font-medium text-church-earth-dark">₱{transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="py-4 text-church-earth-light">{transaction.payment_method}</td>
                        <td className="py-4">
                          {transaction.status === 'completed' && <span className="inline-flex items-center gap-1 text-green-600"><CheckCircle2 className="w-4 h-4" /> Completed</span>}
                          {transaction.status === 'pending' && <span className="inline-flex items-center gap-1 text-yellow-600"><Clock className="w-4 h-4" /> Pending</span>}
                          {transaction.status === 'failed' && <span className="inline-flex items-center gap-1 text-red-600"><XCircle className="w-4 h-4" /> Failed</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </main>
  );
}
