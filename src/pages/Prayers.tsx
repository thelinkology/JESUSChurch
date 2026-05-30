import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Send, Lock, Globe, CheckCircle2, MessageCircle, Trash2 } from 'lucide-react';
import {
  PrayerRequest, getPrayers, addPrayer, incrementPrayerCount,
  PrayerComment, getPrayerComments, addPrayerComment, deletePrayerComment,
} from '../lib/prayersStore';
import { useAuth } from '../contexts/AuthContext';

export function Prayers() {
  const { user, isAdmin, isLeader } = useAuth();
  const navigate = useNavigate();
  const [prayers, setPrayers] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [prayedFor, setPrayedFor] = useState<Set<string>>(new Set());

  // Comments
  const [comments, setComments] = useState<Record<string, PrayerComment[]>>({});
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [loadingComments, setLoadingComments] = useState<Set<string>>(new Set());
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [submittingComment, setSubmittingComment] = useState<Set<string>>(new Set());

  const [formData, setFormData] = useState({
    content: '',
    author_name: user?.full_name || '',
    is_public: true
  });
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    loadPrayers();
    // Load local prayed-for state to prevent spamming
    const localPrayed = localStorage.getItem('prayed_for_ids');
    if (localPrayed) {
      setPrayedFor(new Set(JSON.parse(localPrayed)));
    }
  }, []);

  const loadPrayers = async () => {
    setLoading(true);
    const data = await getPrayers(true, true); // Public and approved only
    setPrayers(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.content.trim() || !formData.author_name.trim()) return;

    await addPrayer({
      content: formData.content,
      author_name: formData.author_name,
      is_public: formData.is_public,
      author_id: user?.id
    });

    setFormData({ ...formData, content: '' });
    setSubmitSuccess(true);
    setTimeout(() => setSubmitSuccess(false), 3000);
  };

  const handlePray = async (id: string) => {
    if (!user) { navigate('/login'); return; }
    if (prayedFor.has(id)) return;

    // Optimistic update
    setPrayers(prayers.map(p => p.id === id ? { ...p, prayer_count: p.prayer_count + 1 } : p));

    const newPrayedFor = new Set(prayedFor).add(id);
    setPrayedFor(newPrayedFor);
    localStorage.setItem('prayed_for_ids', JSON.stringify(Array.from(newPrayedFor)));

    await incrementPrayerCount(id);
  };

  const toggleComments = async (id: string) => {
    const next = new Set(expandedComments);
    if (next.has(id)) {
      next.delete(id);
      setExpandedComments(next);
      return;
    }
    next.add(id);
    setExpandedComments(next);
    // Load only if not already fetched
    if (comments[id]) return;
    setLoadingComments(prev => new Set(prev).add(id));
    const data = await getPrayerComments(id);
    setComments(prev => ({ ...prev, [id]: data }));
    setLoadingComments(prev => { const s = new Set(prev); s.delete(id); return s; });
  };

  const handleAddComment = async (prayerId: string) => {
    if (!user) { navigate('/login'); return; }
    const text = (commentInputs[prayerId] || '').trim();
    if (!text) return;
    setSubmittingComment(prev => new Set(prev).add(prayerId));
    try {
      const newComment = await addPrayerComment({
        prayer_id: prayerId,
        author_id: user.id,
        author_name: user.full_name || user.email,
        content: text,
      });
      setComments(prev => ({ ...prev, [prayerId]: [...(prev[prayerId] ?? []), newComment] }));
      setCommentInputs(prev => ({ ...prev, [prayerId]: '' }));
    } catch (err) {
      console.error('Failed to add comment:', err);
    } finally {
      setSubmittingComment(prev => { const s = new Set(prev); s.delete(prayerId); return s; });
    }
  };

  const handleDeleteComment = async (prayerId: string, commentId: string) => {
    try {
      await deletePrayerComment(commentId);
      setComments(prev => ({ ...prev, [prayerId]: (prev[prayerId] ?? []).filter(c => c.id !== commentId) }));
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  return (
    <main className="pt-32 pb-24 bg-church-cream  min-h-screen">
      <div className="container mx-auto px-4 md">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-12">
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-church-earth-dark  mb-4">Prayer Wall</h1>
            <p className="text-lg text-church-earth-light  max-w-2xl mx-auto">
              "Bear one another's burdens, and so fulfill the law of Christ." - Galatians 6
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Submit Prayer Form */}
            <div className="lg:col-span-1">
              <div className="bg-white  p-6 rounded-2xl shadow-sm border border-church-earth/10  sticky top-32">
                <h2 className="text-xl font-semibold text-church-earth-dark  mb-4">Submit a Request</h2>
                
                {submitSuccess ? (
                  <div className="bg-green-50  text-green-700  p-4 rounded-xl flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-medium">Your prayer request has been submitted. If public, it will appear after review.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-church-earth-light  mb-1">Your Name</label>
                      <input
                        type="text"
                        required
                        value={formData.author_name}
                        onChange={e => setFormData({...formData, author_name: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-church-earth/20  focus:outline-none focus:ring-2 focus:ring-church-gold/50 bg-church-cream/30  text-church-earth-dark "
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-church-earth-light  mb-1">Prayer Request</label>
                      <textarea
                        required
                        rows={4}
                        value={formData.content}
                        onChange={e => setFormData({...formData, content: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-church-earth/20  focus:outline-none focus:ring-2 focus:ring-church-gold/50 bg-church-cream/30  resize-none text-church-earth-dark "
                        placeholder="How can we pray for you?"
                      />
                    </div>
                    
                    <div className="flex gap-4">
                      <label className={`flex-1 flex flex-col items-center justify-center p-3 rounded-xl border cursor-pointer transition-colors ${formData.is_public ? 'border-church-gold bg-church-gold/5 text-church-gold-dark ' : 'border-church-earth/20  text-church-earth-light  hover:bg-church-cream hover:bg-church-earth/20'}`}>
                        <input 
                          type="radio" 
                          name="visibility" 
                          className="sr-only"
                          checked={formData.is_public}
                          onChange={() => setFormData({...formData, is_public: true})}
                        />
                        <Globe className="w-5 h-5 mb-1" />
                        <span className="text-sm font-medium">Public</span>
                      </label>
                      <label className={`flex-1 flex flex-col items-center justify-center p-3 rounded-xl border cursor-pointer transition-colors ${!formData.is_public ? 'border-church-gold bg-church-gold/5 text-church-gold-dark ' : 'border-church-earth/20  text-church-earth-light  hover:bg-church-cream hover:bg-church-earth/20'}`}>
                        <input 
                          type="radio" 
                          name="visibility" 
                          className="sr-only"
                          checked={!formData.is_public}
                          onChange={() => setFormData({...formData, is_public: false})}
                        />
                        <Lock className="w-5 h-5 mb-1" />
                        <span className="text-sm font-medium">Private</span>
                      </label>
                    </div>
                    <p className="text-xs text-church-earth-light  text-center">
                      {formData.is_public ? 'Will be visible to the community after review.' : 'Only visible to the pastoral team.'}
                    </p>

                    <button
                      type="submit"
                      className="w-full bg-church-gold hover:bg-church-gold-dark text-white py-3 rounded-xl font-medium transition-all hover:shadow-md hover:-translate-y-0.5 flex items-center justify-center gap-2 btn-theme"
                    >
                      <Send className="w-4 h-4" />
                      Submit Request
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Prayer Wall */}
            <div className="lg:col-span-2 space-y-4">
              {loading ? (
                <div className="text-center py-12 text-church-earth-light ">Loading prayers...</div>
              ) : prayers.length === 0 ? (
                <div className="text-center py-12 bg-white  rounded-2xl border border-church-earth/10  text-church-earth-light ">
                  No public prayer requests at this time.
                </div>
              ) : (
                prayers.map(prayer => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={prayer.id} 
                    className="bg-white  p-6 rounded-2xl shadow-sm border border-church-earth/10 "
                  >
                    <p className="text-church-earth-dark  text-lg mb-4 whitespace-pre-wrap">{prayer.content}</p>
                    <div className="flex items-center justify-between border-t border-church-earth/10  pt-4">
                      <div className="text-sm text-church-earth-light ">
                        <span className="font-medium text-church-earth ">{prayer.author_name}</span>
                        <span className="mx-2">•</span>
                        {new Date(prayer.created_at || '').toLocaleDateString()}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {/* Comments toggle */}
                        <button
                          onClick={() => toggleComments(prayer.id)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-colors bg-church-cream  text-church-earth  hover:bg-church-gold/10 hover:text-church-gold border border-church-earth/10 "
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>{(comments[prayer.id] ?? []).length}</span>
                        </button>

                        {/* Pray button */}
                        <button
                          onClick={() => handlePray(prayer.id)}
                          disabled={prayedFor.has(prayer.id)}
                          title={!user ? 'Sign in to pray' : undefined}
                          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                            prayedFor.has(prayer.id) 
                              ? 'bg-red-50  text-red-500  border border-red-100 ' 
                              : 'bg-church-cream  text-church-earth  hover:bg-church-gold/10 hover:text-church-gold border border-church-earth/10 '
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${prayedFor.has(prayer.id) ? 'fill-current' : ''}`} />
                          {prayedFor.has(prayer.id) ? 'Prayed' : 'Pray'} 
                          <span className="ml-1 bg-white/50  px-1.5 rounded-md">{prayer.prayer_count}</span>
                        </button>
                      </div>
                    </div>

                    {/* Comments section */}
                    <AnimatePresence>
                      {expandedComments.has(prayer.id) && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 pt-4 border-t border-church-earth/10  space-y-3">
                            {loadingComments.has(prayer.id) ? (
                              <p className="text-sm text-church-earth-light  text-center py-2">Loading comments...</p>
                            ) : (comments[prayer.id] ?? []).length === 0 ? (
                              <p className="text-sm text-church-earth-light  text-center py-2">No comments yet. Be the first to encourage!</p>
                            ) : (
                              (comments[prayer.id] ?? []).map(comment => (
                                <div key={comment.id} className="flex gap-3 group">
                                  <div className="flex-1 bg-church-cream/50  rounded-xl px-4 py-3">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-sm font-medium text-church-earth-dark ">{comment.author_name}</span>
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs text-church-earth-light ">
                                          {new Date(comment.created_at || '').toLocaleDateString()}
                                        </span>
                                        {(user?.id === comment.author_id || isAdmin || isLeader) && (
                                          <button
                                            onClick={() => handleDeleteComment(prayer.id, comment.id)}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                    <p className="text-sm text-church-earth ">{comment.content}</p>
                                  </div>
                                </div>
                              ))
                            )}

                            {/* Add comment */}
                            {user ? (
                              <div className="flex gap-2 mt-2">
                                <input
                                  type="text"
                                  value={commentInputs[prayer.id] ?? ''}
                                  onChange={e => setCommentInputs(prev => ({ ...prev, [prayer.id]: e.target.value }))}
                                  onKeyDown={e => { if (e.key === 'Enter') handleAddComment(prayer.id); }}
                                  placeholder="Add an encouraging word..."
                                  className="flex-1 px-4 py-2 rounded-xl border border-church-earth/20  text-sm bg-church-cream/30  focus:outline-none focus:ring-2 focus:ring-church-gold/50 text-church-earth-dark  placeholder:text-church-earth-light "
                                />
                                <button
                                  onClick={() => handleAddComment(prayer.id)}
                                  disabled={submittingComment.has(prayer.id) || !(commentInputs[prayer.id] ?? '').trim()}
                                  className="px-4 py-2 bg-church-gold hover:bg-church-gold-dark text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50 btn-theme"
                                >
                                  <Send className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <p className="text-sm text-church-earth-light  text-center py-1">
                                <button onClick={() => navigate('/login')} className="text-church-gold hover:underline font-medium">Sign in</button> to leave an encouraging comment.
                              </p>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
