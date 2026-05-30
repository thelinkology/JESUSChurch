import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, MapPin, Clock, Search, UserPlus, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { SmallGroup, getGroups, joinGroup, getUserJoinedGroupIds } from '../lib/groupsStore';

export function Groups() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<SmallGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [joinedGroups, setJoinedGroups] = useState<string[]>([]);
  const [joining, setJoining] = useState<string | null>(null);

  useEffect(() => {
    getGroups()
      .then(setGroups)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (user) {
      getUserJoinedGroupIds(user.id).then(setJoinedGroups).catch(() => {});
    } else {
      setJoinedGroups([]);
    }
  }, [user]);

  const handleJoin = async (groupId: string) => {
    if (!user) {
      alert('Please login to join a group.');
      return;
    }
    setJoining(groupId);
    try {
      await joinGroup(groupId, user.id);
      setJoinedGroups(prev => [...prev, groupId]);
    } catch (err) {
      console.error('Failed to join group:', err);
    } finally {
      setJoining(null);
    }
  };

  const filteredGroups = groups.filter(g =>
    g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="pt-32 pb-24 bg-church-cream  min-h-screen">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto text-center mb-16"
        >
          <span className="text-church-gold font-medium tracking-wider uppercase text-sm">Community</span>
          <h1 className="font-serif text-5xl md:text-6xl font-bold text-church-earth-dark  mt-4 mb-6">
            Small Groups
          </h1>
          <p className="text-xl text-church-earth-light  leading-relaxed">
            We believe life is better together. Find a group that fits your schedule and season of life.
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto mb-12">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-church-earth-light  w-5 h-5 transition-colors group-focus-within:text-church-gold" />
            <input 
              type="text" 
              placeholder="Search groups by name or category..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-church-earth/10  focus:outline-none focus:ring-2 focus:ring-church-gold/50 bg-white  shadow-sm text-lg text-church-earth-dark  transition-all"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-3xl p-8 animate-pulse border border-church-earth/5">
                <div className="h-4 bg-church-earth/10 rounded w-1/4 mb-3" />
                <div className="h-6 bg-church-earth/10 rounded w-2/3 mb-4" />
                <div className="h-4 bg-church-earth/10 rounded w-full mb-2" />
                <div className="h-4 bg-church-earth/10 rounded w-4/5 mb-8" />
                <div className="h-24 bg-church-earth/10 rounded mb-8" />
                <div className="h-12 bg-church-earth/10 rounded" />
              </div>
            ))
          ) : filteredGroups.length === 0 ? (
            <div className="col-span-full text-center py-16 text-church-earth-light ">
              {searchTerm ? 'No groups match your search.' : 'No groups available yet. Check back soon!'}
            </div>
          ) : (
            filteredGroups.map((group, i) => (
            <motion.div 
              key={group.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white  p-8 rounded-3xl shadow-sm hover:shadow-md transition-all border border-church-earth/5  flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="inline-block px-3 py-1 bg-church-cream  text-church-earth-dark  text-xs font-medium rounded-full mb-3">
                    {group.category}
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-church-earth-dark ">{group.name}</h3>
                </div>
              </div>
              
              <p className="text-church-earth-light  mb-6 flex-grow">{group.description}</p>
              
              <div className="space-y-3 mb-8 bg-church-cream/30  p-4 rounded-xl border border-church-earth/5 ">
                <div className="flex items-center gap-3 text-sm text-church-earth-dark ">
                  <Users className="w-4 h-4 text-church-gold" />
                  <span className="font-medium">Leader:</span> {group.leader}
                </div>
                <div className="flex items-center gap-3 text-sm text-church-earth-dark ">
                  <Clock className="w-4 h-4 text-church-gold" />
                  <span className="font-medium">When:</span> {group.schedule}
                </div>
                <div className="flex items-center gap-3 text-sm text-church-earth-dark ">
                  <MapPin className="w-4 h-4 text-church-gold" />
                  <span className="font-medium">Where:</span> {group.location}
                </div>
              </div>

              {joinedGroups.includes(group.id) ? (
                <button disabled className="w-full bg-green-50  text-green-700  py-3 rounded-xl font-medium border border-green-200  flex items-center justify-center gap-2 transition-colors">
                  <CheckCircle2 className="w-5 h-5" /> Joined
                </button>
              ) : (
                <button 
                  onClick={() => handleJoin(group.id)}
                  disabled={joining === group.id}
                  className="w-full bg-church-gold hover:bg-church-gold-dark text-white py-3 rounded-xl font-medium transition-all hover:shadow-md hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <UserPlus className="w-5 h-5" /> {joining === group.id ? 'Joining...' : 'Join Group'}
                </button>
              )}
            </motion.div>
          ))
          )}
        </div>
      </div>
    </main>
  );
}
