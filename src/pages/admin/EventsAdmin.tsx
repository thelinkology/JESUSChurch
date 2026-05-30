import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChurchEvent, getEvents, addEvent, updateEvent, deleteEvent, getRegistrationsByEvent, EventRegistration } from '../../lib/eventsStore';
import { uploadImage } from '../../lib/storageUtils';
import { Trash2, Plus, Calendar as CalendarIcon, Pencil, X, Loader2, Users, ChevronDown, ChevronUp, Mail } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const EMPTY_FORM = {
  title: '',
  date: new Date().toISOString().split('T')[0],
  time: '09:00',
  location: '',
  description: '',
  category: '',
  image_url: '',
};

export function EventsAdmin() {
  const { isLeader, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [attendeesMap, setAttendeesMap] = useState<Record<string, EventRegistration[]>>({});
  const [loadingAttendees, setLoadingAttendees] = useState<string | null>(null);

  // Redirect if auth is resolved and user is not a leader
  useEffect(() => {
    if (!authLoading && !isLeader) navigate('/');
  }, [authLoading, isLeader, navigate]);

  // Load data once — only when we know the user is a leader
  useEffect(() => {
    if (isLeader) loadEvents();
  }, [isLeader]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadEvents = async () => {
    setLoading(true);
    try {
      const data = await getEvents();
      setEvents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (event: ChurchEvent) => {
    setEditingId(event.id);
    setFormData({
      title: event.title,
      date: event.date,
      time: event.time,
      location: event.location,
      description: event.description,
      category: event.category ?? '',
      image_url: event.image_url ?? '',
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
      let image_url = formData.image_url;
      if (imageFile) {
        image_url = await uploadImage(imageFile, 'events');
      }
      const payload = { ...formData, image_url };
      if (editingId) {
        const updated = await updateEvent(editingId, payload);
        setEvents(prev => prev.map(ev => ev.id === editingId ? updated : ev));
      } else {
        const added = await addEvent(payload);
        setEvents(prev => [added, ...prev]);
      }
      cancelForm();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this event?')) return;
    setEvents(prev => prev.filter(ev => ev.id !== id));
    await deleteEvent(id).catch(() => loadEvents());
  };

  const toggleAttendees = async (eventId: string) => {
    if (expandedEventId === eventId) {
      setExpandedEventId(null);
      return;
    }
    setExpandedEventId(eventId);
    if (attendeesMap[eventId]) return; // already loaded
    setLoadingAttendees(eventId);
    const data = await getRegistrationsByEvent(eventId);
    setAttendeesMap(prev => ({ ...prev, [eventId]: data }));
    setLoadingAttendees(null);
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
            <CalendarIcon className="w-8 h-8 text-church-gold" />
            <h1 className="text-3xl font-serif font-bold text-church-earth-dark">Manage Events</h1>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-church-gold hover:bg-church-gold-dark text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" /> Add Event
            </button>
          )}
        </div>

        {/* Add / Edit Form */}
        {showForm && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-church-earth/10 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-church-earth-dark">
                {editingId ? 'Edit Event' : 'Add New Event'}
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
                <label className="block text-sm font-medium text-church-earth-light mb-1">Date</label>
                <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-church-earth/20 focus:outline-none focus:ring-2 focus:ring-church-gold/50 bg-church-cream/30 text-church-earth-dark" />
              </div>
              <div>
                <label className="block text-sm font-medium text-church-earth-light mb-1">Time</label>
                <input required type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-church-earth/20 focus:outline-none focus:ring-2 focus:ring-church-gold/50 bg-church-cream/30 text-church-earth-dark" />
              </div>
              <div>
                <label className="block text-sm font-medium text-church-earth-light mb-1">Location</label>
                <input required type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-church-earth/20 focus:outline-none focus:ring-2 focus:ring-church-gold/50 bg-church-cream/30 text-church-earth-dark" />
              </div>
              <div>
                <label className="block text-sm font-medium text-church-earth-light mb-1">Category</label>
                <input type="text" placeholder="e.g. Worship, Youth, Community" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-church-earth/20 focus:outline-none focus:ring-2 focus:ring-church-gold/50 bg-church-cream/30 text-church-earth-dark" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-church-earth-light mb-1">Description</label>
                <textarea required rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-church-earth/20 focus:outline-none focus:ring-2 focus:ring-church-gold/50 bg-church-cream/30 text-church-earth-dark" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-church-earth-light mb-1">Event Image</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input type="url" placeholder="Image URL (optional)" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})}
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
                  {editingId ? 'Update Event' : 'Save Event'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Events List */}
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-church-gold" /></div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-church-earth/10 text-church-earth-light">
            No events found. Add one to get started.
          </div>
        ) : (
          <div className="space-y-4">
            {events.map(event => (
              <div key={event.id} className="bg-white rounded-xl shadow-sm border border-church-earth/10">
                <div className="p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="flex items-center gap-4">
                    {event.image_url && (
                      <img src={event.image_url} alt={event.title} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                    )}
                    <div>
                      {event.category && (
                        <span className="inline-block px-2 py-0.5 bg-church-cream text-church-earth-dark text-xs font-medium rounded-md mb-1 border border-church-earth/10">{event.category}</span>
                      )}
                      <h3 className="font-semibold text-lg text-church-earth-dark">{event.title}</h3>
                      <div className="text-sm text-church-earth-light flex flex-wrap gap-x-4 gap-y-1 mt-1">
                        <span>{event.date}</span>
                        <span>•</span>
                        <span>{event.time}</span>
                        <span>•</span>
                        <span>{event.location}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => toggleAttendees(event.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                        expandedEventId === event.id
                          ? 'bg-church-gold text-white border-church-gold'
                          : 'bg-church-cream text-church-earth-dark border-church-earth/20 hover:border-church-gold/50'
                      }`}
                      title="View participants"
                    >
                      <Users className="w-4 h-4" />
                      {attendeesMap[event.id] ? attendeesMap[event.id].length : ''}
                      {expandedEventId === event.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={() => startEdit(event)} className="text-church-gold hover:text-church-gold-dark p-2 hover:bg-church-gold/10 rounded-lg transition-colors" title="Edit">
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDelete(event.id)} className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                {/* Attendees panel */}
                {expandedEventId === event.id && (
                  <div className="border-t border-church-earth/10 bg-church-cream/40 px-4 py-4">
                    <h4 className="text-sm font-semibold text-church-earth-dark mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4 text-church-gold" /> Registered Participants
                    </h4>
                    {loadingAttendees === event.id ? (
                      <div className="flex items-center gap-2 text-church-earth-light text-sm py-2">
                        <Loader2 className="w-4 h-4 animate-spin" /> Loading...
                      </div>
                    ) : !attendeesMap[event.id] || attendeesMap[event.id].length === 0 ? (
                      <p className="text-church-earth-light text-sm italic">No registrations yet.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-church-earth-light text-xs uppercase tracking-wider border-b border-church-earth/10">
                              <th className="pb-2 text-left font-medium">#</th>
                              <th className="pb-2 text-left font-medium">Name</th>
                              <th className="pb-2 text-left font-medium">Email</th>
                              <th className="pb-2 text-left font-medium">Registered</th>
                            </tr>
                          </thead>
                          <tbody>
                            {attendeesMap[event.id].map((a, i) => (
                              <tr key={a.id} className="border-b border-church-earth/5 last:border-0">
                                <td className="py-2 text-church-earth-light/60">{i + 1}</td>
                                <td className="py-2 font-medium text-church-earth-dark">{a.name}</td>
                                <td className="py-2 text-church-earth-light flex items-center gap-1">
                                  <Mail className="w-3.5 h-3.5 shrink-0" />
                                  <a href={`mailto:${a.email}`} className="hover:text-church-gold transition-colors">{a.email}</a>
                                </td>
                                <td className="py-2 text-church-earth-light/70 text-xs whitespace-nowrap">
                                  {a.created_at ? new Date(a.created_at).toLocaleDateString() : '—'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
