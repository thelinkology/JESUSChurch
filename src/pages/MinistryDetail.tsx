import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Users, MapPin, Clock, CheckCircle2, UserPlus, UserMinus, Target, Loader2 } from 'lucide-react';
import { Ministry, MinistryMember, getMinistryById, getMinistryMembers, joinMinistry, leaveMinistry, getUserMinistryIds, parseGoals } from '../lib/ministriesStore';
import { useAuth } from '../contexts/AuthContext';

export function MinistryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [ministry, setMinistry] = useState<Ministry | null>(null);
  const [members, setMembers] = useState<MinistryMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [joined, setJoined] = useState(false);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      getMinistryById(id),
      getMinistryMembers(id),
    ]).then(([m, mems]) => {
      setMinistry(m);
      setMembers(mems);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!user?.id || !id) return;
    getUserMinistryIds(user.id).then(ids => setJoined(ids.includes(id)));
  }, [user?.id, id]);

  const handleJoin = async () => {
    if (!user?.id || !id) return;
    setJoining(true);
    try {
      if (joined) {
        await leaveMinistry(id, user.id);
        setJoined(false);
        setMembers(prev => prev.filter(m => m.user_id !== user.id));
      } else {
        await joinMinistry(id, user.id);
        setJoined(true);
        setMembers(prev => [...prev, {
          id: Date.now().toString(),
          ministry_id: id,
          user_id: user.id,
          full_name: user.full_name || 'Member',
          joined_at: new Date().toISOString(),
        }]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-32 pb-24 min-h-screen bg-church-cream flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-church-gold" />
      </div>
    );
  }

  if (!ministry) {
    return (
      <div className="pt-32 pb-24 min-h-screen bg-church-cream flex flex-col items-center justify-center gap-4">
        <p className="text-church-earth-light text-xl">Ministry not found.</p>
        <button onClick={() => navigate('/ministries')} className="text-church-gold hover:underline flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Ministries
        </button>
      </div>
    );
  }

  const goals = parseGoals(ministry.goals);

  return (
    <div className="pt-28 pb-24 bg-church-cream min-h-screen">
      {/* Hero */}
      <div className="relative h-72 md:h-96 overflow-hidden mb-0">
        {ministry.image_url ? (
          <img
            src={ministry.image_url}
            alt={ministry.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full bg-church-earth-dark" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <button
            onClick={() => navigate('/ministries')}
            className="flex items-center gap-2 text-white/80 hover:text-white text-sm mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Ministries
          </button>
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <span className="text-church-gold text-sm font-medium tracking-wider uppercase">{ministry.age_group}</span>
              <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mt-1">{ministry.title}</h1>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
              <Users className="w-5 h-5 text-church-gold" />
              <span className="text-white font-medium">{members.length}</span>
              <span className="text-white/70 text-sm">member{members.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 max-w-5xl mt-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="md:col-span-2 space-y-8">
            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-8 shadow-sm border border-church-earth/10"
            >
              <h2 className="font-serif text-2xl font-bold text-church-earth-dark mb-4">About This Ministry</h2>
              <p className="text-church-earth-light text-lg leading-relaxed">{ministry.description}</p>
            </motion.div>

            {/* Goals */}
            {goals.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-sm border border-church-earth/10"
              >
                <h2 className="font-serif text-2xl font-bold text-church-earth-dark mb-5 flex items-center gap-2">
                  <Target className="w-6 h-6 text-church-gold" /> Our Goals
                </h2>
                <ul className="space-y-3">
                  {goals.map((goal, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-church-gold shrink-0 mt-0.5" />
                      <span className="text-church-earth-light">{goal}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Members */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-8 shadow-sm border border-church-earth/10"
            >
              <h2 className="font-serif text-2xl font-bold text-church-earth-dark mb-5 flex items-center gap-2">
                <Users className="w-6 h-6 text-church-gold" /> Members
                <span className="ml-auto text-base bg-church-gold/10 text-church-earth-dark px-3 py-1 rounded-full font-normal">{members.length}</span>
              </h2>
              {members.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-church-earth/20 mx-auto mb-3" />
                  <p className="text-church-earth-light">No members yet. Be the first to join!</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {members.map((member, i) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-2 bg-church-cream px-4 py-2 rounded-full border border-church-earth/10"
                    >
                      <div className="w-6 h-6 rounded-full bg-church-gold/20 flex items-center justify-center text-church-gold font-bold text-xs">
                        {(member.full_name || `M${i + 1}`).charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm text-church-earth-dark font-medium">{member.full_name || `Member ${i + 1}`}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Join card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-church-earth/10 sticky top-28"
            >
              {user ? (
                <>
                  <p className="text-church-earth-light text-sm mb-4">
                    {joined ? 'You are a member of this ministry.' : 'Join this ministry to connect and serve.'}
                  </p>
                  <button
                    onClick={handleJoin}
                    disabled={joining}
                    className={`w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors ${
                      joined
                        ? 'bg-church-earth/10 text-church-earth-dark hover:bg-red-50 hover:text-red-600 border border-church-earth/20'
                        : 'bg-church-gold hover:bg-church-gold-dark text-white'
                    }`}
                  >
                    {joining ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : joined ? (
                      <><UserMinus className="w-4 h-4" /> Leave Ministry</>
                    ) : (
                      <><UserPlus className="w-4 h-4" /> Join Ministry</>
                    )}
                  </button>
                  {joined && (
                    <p className="text-xs text-church-earth-light text-center mt-3 flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-green-500" /> You're part of this ministry
                    </p>
                  )}
                </>
              ) : (
                <>
                  <p className="text-church-earth-light text-sm mb-4">Sign in to join this ministry.</p>
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full bg-church-gold hover:bg-church-gold-dark text-white py-3 rounded-xl font-medium transition-colors"
                  >
                    Sign In to Join
                  </button>
                </>
              )}

              {/* Details */}
              {(ministry.leader_name || ministry.schedule || ministry.location) && (
                <div className="mt-5 pt-5 border-t border-church-earth/10 space-y-3">
                  {ministry.leader_name && ministry.leader_name !== 'TBA' && (
                    <div className="flex items-center gap-2 text-sm text-church-earth-dark">
                      <Users className="w-4 h-4 text-church-gold shrink-0" />
                      <div>
                        <span className="font-medium">Leader</span>
                        <p className="text-church-earth-light">{ministry.leader_name}</p>
                      </div>
                    </div>
                  )}
                  {ministry.schedule && (
                    <div className="flex items-center gap-2 text-sm text-church-earth-dark">
                      <Clock className="w-4 h-4 text-church-gold shrink-0" />
                      <div>
                        <span className="font-medium">Schedule</span>
                        <p className="text-church-earth-light">{ministry.schedule}</p>
                      </div>
                    </div>
                  )}
                  {ministry.location && (
                    <div className="flex items-center gap-2 text-sm text-church-earth-dark">
                      <MapPin className="w-4 h-4 text-church-gold shrink-0" />
                      <div>
                        <span className="font-medium">Location</span>
                        <p className="text-church-earth-light">{ministry.location}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
