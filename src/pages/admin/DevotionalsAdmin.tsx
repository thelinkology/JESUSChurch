import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Loader2, Plus, Edit2, Trash2, Save, X, BookOpen, ChevronDown, ChevronUp, Users,
} from 'lucide-react';
import {
  getAllDevotionals,
  addDevotional,
  updateDevotional,
  deleteDevotional,
  getDevotionalCompletionCount,
  Devotional,
} from '../../lib/devotionalsStore';

const EMPTY_FORM = { title: '', scripture_reference: '', content: '', devotional_date: '' };

export function DevotionalsAdmin() {
  const { isLeader, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [devotionals, setDevotionals] = useState<Devotional[]>([]);
  const [completionCounts, setCompletionCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isLeader) navigate('/');
  }, [authLoading, isLeader, navigate]);

  useEffect(() => {
    if (isLeader) load();
  }, [isLeader]); // eslint-disable-line react-hooks/exhaustive-deps

  const load = async () => {
    setLoading(true);
    try {
      const data = await getAllDevotionals();
      setDevotionals(data);
      const counts: Record<string, number> = {};
      await Promise.all(
        data.map(async (d) => {
          counts[d.id] = await getDevotionalCompletionCount(d.id);
        })
      );
      setCompletionCounts(counts);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, devotional_date: new Date().toISOString().split('T')[0] });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openEdit = (d: Devotional) => {
    setEditingId(d.id);
    setForm({
      title: d.title,
      scripture_reference: d.scripture_reference,
      content: d.content,
      devotional_date: d.devotional_date,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim() || !form.devotional_date) return;
    setSaving(true);
    try {
      if (editingId) {
        const updated = await updateDevotional(editingId, form);
        setDevotionals(prev => prev.map(d => d.id === editingId ? updated : d));
      } else {
        const added = await addDevotional(form);
        setDevotionals(prev => [added, ...prev]);
        setCompletionCounts(prev => ({ ...prev, [added.id]: 0 }));
      }
      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
    } catch (err) {
      console.error('handleSave:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this devotional? This will also remove all completion records.')) return;
    setDeletingId(id);
    try {
      await deleteDevotional(id);
      setDevotionals(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      console.error('handleDelete:', err);
    } finally {
      setDeletingId(null);
    }
  };

  if (authLoading) {
    return (
      <div className="pt-32 min-h-screen flex items-center justify-center bg-church-cream">
        <Loader2 className="w-8 h-8 animate-spin text-church-gold" />
      </div>
    );
  }

  return (
    <main className="pt-32 pb-24 bg-church-cream min-h-screen">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-serif text-3xl font-bold text-church-earth-dark">Daily Devotionals</h1>
              <p className="text-church-earth-light text-sm mt-1">Manage daily devotional content for the Growth page</p>
            </div>
            <button
              onClick={openAdd}
              className="inline-flex items-center gap-2 bg-church-gold hover:bg-church-gold-dark text-white px-4 py-2.5 rounded-xl font-medium transition-all text-sm"
            >
              <Plus className="w-4 h-4" /> Add Devotional
            </button>
          </div>

          {/* Form */}
          {showForm && (
            <div className="bg-white rounded-2xl shadow-sm border border-church-earth/5 p-6 mb-8">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-serif text-xl font-bold text-church-earth-dark">
                  {editingId ? 'Edit Devotional' : 'New Devotional'}
                </h2>
                <button
                  onClick={() => { setShowForm(false); setEditingId(null); }}
                  className="text-church-earth-light hover:text-church-earth transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-church-earth-dark mb-1">
                      Title <span className="text-red-400">*</span>
                    </label>
                    <input
                      value={form.title}
                      onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      placeholder="e.g. Psalm 23"
                      className="w-full border border-church-earth/20 rounded-xl px-4 py-2.5 text-sm text-church-earth-dark focus:outline-none focus:ring-2 focus:ring-church-gold/30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-church-earth-dark mb-1">
                      Date <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="date"
                      value={form.devotional_date}
                      onChange={e => setForm(f => ({ ...f, devotional_date: e.target.value }))}
                      className="w-full border border-church-earth/20 rounded-xl px-4 py-2.5 text-sm text-church-earth-dark focus:outline-none focus:ring-2 focus:ring-church-gold/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-church-earth-dark mb-1">
                    Scripture Reference
                  </label>
                  <input
                    value={form.scripture_reference}
                    onChange={e => setForm(f => ({ ...f, scripture_reference: e.target.value }))}
                    placeholder="e.g. Psalm 23:1-6"
                    className="w-full border border-church-earth/20 rounded-xl px-4 py-2.5 text-sm text-church-earth-dark focus:outline-none focus:ring-2 focus:ring-church-gold/30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-church-earth-dark mb-1">
                    Content <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={form.content}
                    onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                    rows={10}
                    placeholder="Enter the scripture verses or devotional content..."
                    className="w-full border border-church-earth/20 rounded-xl px-4 py-2.5 text-sm text-church-earth-dark focus:outline-none focus:ring-2 focus:ring-church-gold/30 resize-y font-mono"
                  />
                  <p className="text-xs text-church-earth-light mt-1">Each line will be rendered as a paragraph. Use blank lines to add spacing.</p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleSave}
                    disabled={saving || !form.title.trim() || !form.content.trim() || !form.devotional_date}
                    className="inline-flex items-center gap-2 bg-church-gold hover:bg-church-gold-dark text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {editingId ? 'Update' : 'Save'}
                  </button>
                  <button
                    onClick={() => { setShowForm(false); setEditingId(null); }}
                    className="px-5 py-2.5 rounded-xl font-medium text-sm text-church-earth-light hover:text-church-earth transition-colors border border-church-earth/20"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* List */}
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-church-gold" />
            </div>
          ) : devotionals.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-church-earth/5">
              <BookOpen className="w-12 h-12 text-church-earth-light/40 mx-auto mb-4" />
              <p className="text-church-earth-light font-medium">No devotionals yet.</p>
              <p className="text-church-earth-light/70 text-sm mt-1">Add one using the button above to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {devotionals.map(d => (
                <div key={d.id} className="bg-white rounded-2xl shadow-sm border border-church-earth/5 overflow-hidden">
                  <div className="flex items-center gap-4 p-5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-semibold text-church-earth-dark truncate">{d.title}</h3>
                        <span className="text-xs text-church-earth-light bg-church-cream px-2.5 py-0.5 rounded-full shrink-0">
                          {new Date(d.devotional_date + 'T00:00:00').toLocaleDateString('en-US', {
                            year: 'numeric', month: 'short', day: 'numeric',
                          })}
                        </span>
                      </div>
                      {d.scripture_reference && (
                        <p className="text-sm text-church-earth-light italic mt-0.5">{d.scripture_reference}</p>
                      )}
                      <div className="flex items-center gap-1 mt-1.5 text-xs text-church-earth-light">
                        <Users className="w-3.5 h-3.5" />
                        <span>{completionCounts[d.id] ?? 0} {completionCounts[d.id] === 1 ? 'person' : 'people'} completed</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => setExpandedId(expandedId === d.id ? null : d.id)}
                        className="p-2 text-church-earth-light hover:text-church-earth transition-colors rounded-lg hover:bg-church-cream/50"
                        title="Preview content"
                      >
                        {expandedId === d.id
                          ? <ChevronUp className="w-4 h-4" />
                          : <ChevronDown className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => openEdit(d)}
                        className="p-2 text-church-earth-light hover:text-church-gold transition-colors rounded-lg hover:bg-church-cream/50"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(d.id)}
                        disabled={deletingId === d.id}
                        className="p-2 text-church-earth-light hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 disabled:opacity-50"
                        title="Delete"
                      >
                        {deletingId === d.id
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {expandedId === d.id && (
                    <div className="px-5 pb-5 border-t border-church-earth/5 pt-4 bg-church-cream/20">
                      <p className="text-sm text-church-earth whitespace-pre-line leading-relaxed">{d.content}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

        </motion.div>
      </div>
    </main>
  );
}
