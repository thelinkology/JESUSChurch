import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PrayerRequest, getAllPrayers, updatePrayerStatus } from '../../lib/prayersStore';
import { Heart, CheckCircle, XCircle, Clock, Lock, Globe } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function PrayersAdmin() {
  const { isLeader, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [prayers, setPrayers] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  useEffect(() => {
    if (!authLoading && !isLeader) navigate('/');
  }, [authLoading, isLeader, navigate]);

  useEffect(() => {
    if (isLeader) loadPrayers();
  }, [isLeader]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadPrayers = async () => {
    setLoading(true);
    try {
      const data = await getAllPrayers();
      setPrayers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: 'approved' | 'rejected') => {
    await updatePrayerStatus(id, status);
    setPrayers(prayers.map(p => p.id === id ? { ...p, status } : p));
  };

  if (authLoading) return (
    <div className="pt-32 pb-24 min-h-screen bg-church-cream flex items-center justify-center">
      <div className="w-8 h-8 animate-spin rounded-full border-4 border-church-gold border-t-transparent" />
    </div>
  );
  if (!isLeader) return null;

  const filteredPrayers = prayers.filter(p => filter === 'all' || p.status === filter);

  return (
    <div className="pt-32 pb-24 min-h-screen bg-church-cream">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex items-center gap-3 mb-8">
          <Heart className="w-8 h-8 text-church-gold" />
          <h1 className="text-3xl font-serif font-bold text-church-earth-dark">Manage Prayers</h1>
        </div>

        <div className="bg-church-surface rounded-2xl shadow-sm border border-church-earth/10 overflow-hidden">
          <div className="p-4 border-b border-church-earth/10 bg-church-cream/30 flex gap-2 overflow-x-auto">
            {(['pending', 'approved', 'rejected', 'all'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize whitespace-nowrap transition-colors ${
                  filter === f 
                    ? 'bg-church-gold text-white' 
                    : 'bg-church-surface text-church-earth hover:bg-church-cream border border-church-earth/10'
                }`}
              >
                {f} ({prayers.filter(p => f === 'all' || p.status === f).length})
              </button>
            ))}
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-12 text-church-earth-light">Loading prayers...</div>
            ) : filteredPrayers.length === 0 ? (
              <div className="text-center py-12 text-church-earth-light">
                No prayers found for this filter.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPrayers.map(prayer => (
                  <div key={prayer.id} className="border border-church-earth/10 rounded-xl p-5 flex flex-col md:flex-row gap-4 justify-between items-start bg-church-surface">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold text-church-earth-dark">{prayer.author_name}</span>
                        <span className="text-xs text-church-earth-light">{new Date(prayer.created_at || '').toLocaleString()}</span>
                        {prayer.is_public ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                            <Globe className="w-3 h-3" /> Public
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                            <Lock className="w-3 h-3" /> Private
                          </span>
                        )}
                        
                        {prayer.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">
                            <Clock className="w-3 h-3" /> Pending
                          </span>
                        )}
                        {prayer.status === 'approved' && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                            <CheckCircle className="w-3 h-3" /> Approved
                          </span>
                        )}
                        {prayer.status === 'rejected' && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                            <XCircle className="w-3 h-3" /> Rejected
                          </span>
                        )}
                      </div>
                      <p className="text-church-earth mb-3 whitespace-pre-wrap">{prayer.content}</p>
                      
                      <div className="text-sm text-church-earth-light flex items-center gap-1">
                        <Heart className="w-4 h-4" /> {prayer.prayer_count} people prayed for this
                      </div>
                    </div>
                    
                    <div className="flex md:flex-col gap-2 w-full md:w-auto">
                      {prayer.status !== 'approved' && (
                        <button
                          onClick={() => handleStatusUpdate(prayer.id, 'approved')}
                          className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-sm font-medium transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" /> Approve
                        </button>
                      )}
                      {prayer.status !== 'rejected' && (
                        <button
                          onClick={() => handleStatusUpdate(prayer.id, 'rejected')}
                          className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors"
                        >
                          <XCircle className="w-4 h-4" /> Reject
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
