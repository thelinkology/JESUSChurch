import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sermon, getSermons, addSermon, updateSermon, deleteSermon } from '../../lib/sermonsStore';
import { uploadImage } from '../../lib/storageUtils';
import { Trash2, Plus, Video, Pencil, X, Loader2, Star } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const EMPTY_FORM = {
  title: '',
  description: '',
  youtubeLink: '',
  speaker: '',
  series: '',
  date: new Date().toISOString().split('T')[0],
  thumbnail_url: '',
};

export function SermonsAdmin() {
  const { isLeader, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Redirect if auth is resolved and user is not a leader
  useEffect(() => {
    if (!authLoading && !isLeader) navigate('/');
  }, [authLoading, isLeader, navigate]);

  // Load data once — only when we know the user is a leader
  useEffect(() => {
    if (isLeader) loadSermons();
  }, [isLeader]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadSermons = async () => {
    setLoading(true);
    try {
      const data = await getSermons();
      setSermons(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (sermon: Sermon) => {
    setEditingId(sermon.id);
    setFormData({
      title: sermon.title,
      description: sermon.description,
      youtubeLink: sermon.youtubeLink,
      speaker: sermon.speaker,
      series: sermon.series,
      date: sermon.date,
      thumbnail_url: sermon.thumbnail_url ?? '',
    });
    setImageFile(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelForm = () => {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setImageFile(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let thumbnail_url = formData.thumbnail_url;
      if (imageFile) {
        thumbnail_url = await uploadImage(imageFile, 'sermons');
      }
      const payload = { ...formData, thumbnail_url };
      if (editingId) {
        const updated = await updateSermon(editingId, payload);
        setSermons(prev => prev.map(s => s.id === editingId ? updated : s));
      } else {
        const added = await addSermon(payload);
        setSermons(prev => [added, ...prev]);
      }
      cancelForm();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this sermon?')) return;
    setSermons(prev => prev.filter(s => s.id !== id));
    await deleteSermon(id).catch(() => loadSermons());
  };

  if (authLoading) return (
    <div className="pt-32 pb-24 min-h-screen bg-church-cream flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-church-gold" />
    </div>
  );
  if (!isLeader) return null;

  return (
    <div className="pt-32 pb-24 min-h-screen bg-church-cream">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Video className="w-8 h-8 text-church-gold" />
            <h1 className="text-3xl font-serif font-bold text-church-earth-dark">Manage Sermons</h1>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-church-gold hover:bg-church-gold-dark text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" /> Add Sermon
            </button>
          )}
        </div>

        {/* Add / Edit Form */}
        {showForm && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-church-earth/10 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-church-earth-dark">
                {editingId ? 'Edit Sermon' : 'Add New Sermon'}
              </h2>
              <button onClick={cancelForm} className="text-church-earth-light hover:text-church-earth-dark">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-church-earth-light mb-1">Title</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-church-earth/20 focus:outline-none focus:ring-2 focus:ring-church-gold/50 bg-church-cream/30 text-church-earth-dark" />
              </div>
              <div>
                <label className="block text-sm font-medium text-church-earth-light mb-1">Speaker</label>
                <input required type="text" value={formData.speaker} onChange={e => setFormData({...formData, speaker: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-church-earth/20 focus:outline-none focus:ring-2 focus:ring-church-gold/50 bg-church-cream/30 text-church-earth-dark" />
              </div>
              <div>
                <label className="block text-sm font-medium text-church-earth-light mb-1">Series</label>
                <input required type="text" value={formData.series} onChange={e => setFormData({...formData, series: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-church-earth/20 focus:outline-none focus:ring-2 focus:ring-church-gold/50 bg-church-cream/30 text-church-earth-dark" />
              </div>
              <div>
                <label className="block text-sm font-medium text-church-earth-light mb-1">Date</label>
                <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-church-earth/20 focus:outline-none focus:ring-2 focus:ring-church-gold/50 bg-church-cream/30 text-church-earth-dark" />
              </div>
              <div>
                <label className="block text-sm font-medium text-church-earth-light mb-1">YouTube Link</label>
                <input required type="url" placeholder="https://youtube.com/watch?v=..." value={formData.youtubeLink} onChange={e => setFormData({...formData, youtubeLink: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-church-earth/20 focus:outline-none focus:ring-2 focus:ring-church-gold/50 bg-church-cream/30 text-church-earth-dark" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-church-earth-light mb-1">Description</label>
                <textarea required rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-church-earth/20 focus:outline-none focus:ring-2 focus:ring-church-gold/50 bg-church-cream/30 text-church-earth-dark" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-church-earth-light mb-1">Thumbnail</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input type="url" placeholder="Image URL (optional)" value={formData.thumbnail_url} onChange={e => setFormData({...formData, thumbnail_url: e.target.value})}
                    className="flex-1 px-4 py-2 rounded-lg border border-church-earth/20 focus:outline-none focus:ring-2 focus:ring-church-gold/50 bg-church-cream/30 text-church-earth-dark" />
                  <span className="text-sm text-church-earth-light self-center">or</span>
                  <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] ?? null)}
                    className="flex-1 text-sm text-church-earth-dark file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-church-gold/10 file:text-church-gold hover:file:bg-church-gold/20 cursor-pointer" />
                </div>
              </div>
              <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                <button type="button" onClick={cancelForm} className="px-4 py-2 text-church-earth-light hover:text-church-earth-dark">Cancel</button>
                <button type="submit" disabled={saving} className="bg-church-gold hover:bg-church-gold-dark text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingId ? 'Update Sermon' : 'Save Sermon'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Sermons List */}
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-church-gold" /></div>
        ) : sermons.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-church-earth/10 text-church-earth-light">
            No sermons found. Add one to get started.
          </div>
        ) : (
          <div className="space-y-4">
            {sermons.map(sermon => (
              <div key={sermon.id} className="bg-white p-4 rounded-xl shadow-sm border border-church-earth/10 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex items-center gap-4">
                  {sermon.thumbnail_url && (
                    <img src={sermon.thumbnail_url} alt={sermon.title} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                  )}
                  <div>
                    <h3 className="font-semibold text-lg text-church-earth-dark">{sermon.title}</h3>
                    <div className="text-sm text-church-earth-light flex flex-wrap gap-x-4 gap-y-1 mt-1">
                      <span>{sermon.date}</span>
                      <span>•</span>
                      <span>{sermon.speaker}</span>
                      <span>•</span>
                      <span>{sermon.series}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => startEdit(sermon)} className="text-church-gold hover:text-church-gold-dark p-2 hover:bg-church-gold/10 rounded-lg transition-colors" title="Edit">
                    <Pencil className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleDelete(sermon.id)} className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
