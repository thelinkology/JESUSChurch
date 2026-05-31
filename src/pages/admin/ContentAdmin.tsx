import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import { useSearchParams } from 'react-router-dom';
import {
  getChurchSettings,
  updateChurchSettings,
  updateChurchSetting,
  getLeadership,
  addLeader,
  updateLeader,
  deleteLeader,
  ChurchSettings,
  LeadershipMember,
} from '../../lib/settingsStore';
import { createNotification, NotificationType } from '../../lib/notificationsStore';
import { getSermons, Sermon } from '../../lib/sermonsStore';
import { uploadImage } from '../../lib/storageUtils';
import { getLocations, addLocation, updateLocation, deleteLocation, ChurchLocation } from '../../lib/locationsStore';
import {
  FileText, Users, Bell, Save, Plus, Trash2, Edit2, Loader2, Check, Image, MapPin, Upload, X, Target, Video,
} from 'lucide-react';
import {
  Ministry, getMinistries, addMinistry, updateMinistry, deleteMinistry, parseGoals, serializeGoals,
} from '../../lib/ministriesStore';


type Tab = 'church' | 'story' | 'hero' | 'leadership' | 'locations' | 'ministries' | 'live' | 'notifications';

const inputCls = 'w-full px-4 py-2.5 rounded-lg border border-church-earth/20 focus:outline-none focus:ring-2 focus:ring-church-gold/50 bg-church-cream/30 text-church-earth-dark text-sm';
const labelCls = 'block text-sm font-medium text-church-earth-dark mb-1';
const textareaCls = `${inputCls} resize-none`;

export function ContentAdmin() {
  const { isAdmin } = useAuth();
  const [searchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as Tab) || 'church';
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [settings, setSettings] = useState<Partial<ChurchSettings>>({});
  const [leaders, setLeaders] = useState<LeadershipMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Leadership form
  const [editingLeader, setEditingLeader] = useState<LeadershipMember | null>(null);
  const [leaderForm, setLeaderForm] = useState({ name: '', role: '', bio: '', image_url: '', sort_order: 0 });
  const [showLeaderForm, setShowLeaderForm] = useState(false);
  const [allSermons, setAllSermons] = useState<Sermon[]>([]);
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [heroUploading, setHeroUploading] = useState(false);
  const [heroUploadError, setHeroUploadError] = useState<string | null>(null);

  // Locations
  const [locations, setLocations] = useState<ChurchLocation[]>([]);
  const [editingLocation, setEditingLocation] = useState<ChurchLocation | null>(null);
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [savingLocation, setSavingLocation] = useState(false);
  const [locationImageFile, setLocationImageFile] = useState<File | null>(null);
  const [locationImageUploading, setLocationImageUploading] = useState(false);
  const EMPTY_LOC = { name: '', address: '', phone: '', pastor: '', service_times: '', image_url: '', map_url: '', sort_order: 0 };
  const [locationForm, setLocationForm] = useState(EMPTY_LOC);

  // Notification form
  const [notifForm, setNotifForm] = useState({ title: '', message: '', type: 'general' as NotificationType, link: '' });
  const [sendingNotif, setSendingNotif] = useState(false);
  const [notifSent, setNotifSent] = useState(false);

  // Ministries
  const EMPTY_MIN = { title: '', description: '', age_group: 'All Ages', image_url: '', goals: '', schedule: '', location: '', leader_name: '', sort_order: 0 };
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [editingMinistry, setEditingMinistry] = useState<Ministry | null>(null);
  const [showMinistryForm, setShowMinistryForm] = useState(false);
  const [ministryForm, setMinistryForm] = useState(EMPTY_MIN);
  const [savingMinistry, setSavingMinistry] = useState(false);
  const [ministryImageFile, setMinistryImageFile] = useState<File | null>(null);
  const [ministryImageUploading, setMinistryImageUploading] = useState(false);

  useEffect(() => {
    Promise.all([getChurchSettings(), getLeadership(), getSermons(), getLocations(), getMinistries()])
      .then(([s, l, sermons, locs, mins]) => { setSettings(s); setLeaders(l); setAllSermons(sermons); setLocations(locs); setMinistries(mins); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSaveLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingLocation(true);
    try {
      let image_url = locationForm.image_url;
      if (locationImageFile) {
        setLocationImageUploading(true);
        image_url = await uploadImage(locationImageFile, 'locations');
        setLocationImageUploading(false);
        setLocationImageFile(null);
      }
      const payload = { ...locationForm, image_url };
      if (editingLocation) {
        const updated = await updateLocation(editingLocation.id, payload);
        setLocations(prev => prev.map(l => l.id === editingLocation.id ? updated : l));
      } else {
        const newLoc = await addLocation({ ...payload, sort_order: locations.length });
        setLocations(prev => [...prev, newLoc]);
      }
      setShowLocationForm(false);
      setEditingLocation(null);
      setLocationForm(EMPTY_LOC);
    } finally {
      setSavingLocation(false);
      setLocationImageUploading(false);
    }
  };

  const handleDeleteLocation = async (id: string) => {
    if (!window.confirm('Remove this location?')) return;
    setLocations(prev => prev.filter(l => l.id !== id));
    await deleteLocation(id).catch(() => getLocations().then(setLocations));
  };

  const handleSaveMinistry = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingMinistry(true);
    try {
      let image_url = ministryForm.image_url;
      if (ministryImageFile) {
        setMinistryImageUploading(true);
        image_url = await uploadImage(ministryImageFile, 'ministries');
        setMinistryImageUploading(false);
        setMinistryImageFile(null);
      }
      const goals = serializeGoals(ministryForm.goals);
      const payload = { ...ministryForm, image_url, goals };
      if (editingMinistry) {
        const updated = await updateMinistry(editingMinistry.id, payload);
        setMinistries(prev => prev.map(m => m.id === editingMinistry.id ? updated : m));
      } else {
        const newMin = await addMinistry({ ...payload, sort_order: ministries.length });
        setMinistries(prev => [...prev, newMin]);
      }
      setShowMinistryForm(false);
      setEditingMinistry(null);
      setMinistryForm(EMPTY_MIN);
    } finally {
      setSavingMinistry(false);
      setMinistryImageUploading(false);
    }
  };

  const handleDeleteMinistry = async (id: string) => {
    if (!window.confirm('Delete this ministry?')) return;
    setMinistries(prev => prev.filter(m => m.id !== id));
    await deleteMinistry(id).catch(() => getMinistries().then(setMinistries));
  };

  const startEditMinistry = (m: Ministry) => {
    setEditingMinistry(m);
    setMinistryForm({
      title: m.title,
      description: m.description,
      age_group: m.age_group,
      image_url: m.image_url || '',
      goals: parseGoals(m.goals).join('\n'),
      schedule: m.schedule || '',
      location: m.location || '',
      leader_name: m.leader_name || '',
      sort_order: m.sort_order,
    });
    setMinistryImageFile(null);
    setShowMinistryForm(true);
  };

  const startEditLocation = (loc: ChurchLocation) => {
    setEditingLocation(loc);
    setLocationForm({ name: loc.name, address: loc.address, phone: loc.phone || '', pastor: loc.pastor || '', service_times: loc.service_times || '', image_url: loc.image_url || '', map_url: loc.map_url || '', sort_order: loc.sort_order });
    setLocationImageFile(null);
    setShowLocationForm(true);
  };

  const handleHeroImageUpload = async (file: File) => {
    setHeroUploading(true);
    setHeroUploadError(null);
    try {
      const url = await uploadImage(file, 'hero');
      // Update local state
      setSettings(prev => ({ ...prev, hero_image_url: url }));
      setHeroImageFile(null);
      // Auto-persist to DB so the image doesn't revert on page reload
      await updateChurchSetting('hero_image_url', url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed. Check the church-media bucket exists.';
      setHeroUploadError(msg);
    } finally {
      setHeroUploading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await updateChurchSettings(settings as ChurchSettings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Save settings error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveLiveSettings = async () => {
    setSaving(true);
    try {
      await Promise.all([
        updateChurchSetting('live_title', settings.live_title ?? ''),
        updateChurchSetting('live_description', settings.live_description ?? ''),
        updateChurchSetting('live_youtube_url', settings.live_youtube_url ?? ''),
        updateChurchSetting('live_facebook_url', settings.live_facebook_url ?? ''),
      ]);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Save live settings error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveLeader = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingLeader) {
        const updated = await updateLeader(editingLeader.id, leaderForm);
        if (updated) setLeaders(prev => prev.map(l => l.id === editingLeader.id ? updated : l));
      } else {
        const newLeader = await addLeader(leaderForm);
        if (newLeader) setLeaders(prev => [...prev, newLeader]);
      }
      setShowLeaderForm(false);
      setEditingLeader(null);
      setLeaderForm({ name: '', role: '', bio: '', image_url: '', sort_order: 0 });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLeader = async (id: string) => {
    if (!window.confirm('Remove this leader?')) return;
    setLeaders(prev => prev.filter(l => l.id !== id));
    await deleteLeader(id).catch(() => getLeadership().then(setLeaders));
  };

  const startEditLeader = (leader: LeadershipMember) => {
    setEditingLeader(leader);
    setLeaderForm({ name: leader.name, role: leader.role, bio: leader.bio || '', image_url: leader.image_url || '', sort_order: leader.sort_order });
    setShowLeaderForm(true);
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingNotif(true);
    try {
      await createNotification({
        title: notifForm.title,
        message: notifForm.message,
        type: notifForm.type,
        link: notifForm.link || undefined,
        is_broadcast: true,
      });
      setNotifSent(true);
      setNotifForm({ title: '', message: '', type: 'general' as NotificationType, link: '' });
      setTimeout(() => setNotifSent(false), 3000);
    } finally {
      setSendingNotif(false);
    }
  };

  if (!isAdmin) return (
    <div className="pt-32 pb-24 min-h-screen bg-church-cream flex items-center justify-center">
      <p className="text-church-earth-light">Admin access required.</p>
    </div>
  );

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'church', label: 'Church Info', icon: <FileText className="w-4 h-4" /> },
    { id: 'hero', label: 'Hero Section', icon: <FileText className="w-4 h-4" /> },
    { id: 'story', label: 'Vision & Story', icon: <FileText className="w-4 h-4" /> },
    { id: 'leadership', label: 'Leadership', icon: <Users className="w-4 h-4" /> },
    { id: 'locations', label: 'Locations', icon: <MapPin className="w-4 h-4" /> },
    { id: 'ministries', label: 'Ministries', icon: <Target className="w-4 h-4" /> },
    { id: 'live', label: 'Live Stream', icon: <Video className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
  ];

  return (
    <div className="pt-32 pb-24 min-h-screen bg-church-cream">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-church-earth-dark">Content & Settings</h1>
          <p className="text-church-earth-light mt-1">Edit your church's public-facing content</p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'bg-church-gold text-white shadow-sm'
                  : 'bg-white text-church-earth-dark hover:bg-church-cream border border-church-earth/10'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-church-gold" /></div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Church Info */}
            {activeTab === 'church' && (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-church-earth/10 space-y-5">
                <h2 className="font-bold text-xl text-church-earth-dark mb-2">Church Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className={labelCls}>Church Name</label>
                    <input type="text" className={inputCls} value={settings.church_name || ''} onChange={e => setSettings({ ...settings, church_name: e.target.value })} />
                  </div>
                  <div>
                    <label className={labelCls}>Tagline</label>
                    <input type="text" className={inputCls} value={settings.church_tagline || ''} onChange={e => setSettings({ ...settings, church_tagline: e.target.value })} />
                  </div>
                  <div>
                    <label className={labelCls}>Address</label>
                    <input type="text" className={inputCls} value={settings.church_address || ''} onChange={e => setSettings({ ...settings, church_address: e.target.value })} />
                  </div>
                  <div>
                    <label className={labelCls}>Phone</label>
                    <input type="tel" className={inputCls} value={settings.church_phone || ''} onChange={e => setSettings({ ...settings, church_phone: e.target.value })} />
                  </div>
                  <div>
                    <label className={labelCls}>Email</label>
                    <input type="email" className={inputCls} value={settings.church_email || ''} onChange={e => setSettings({ ...settings, church_email: e.target.value })} />
                  </div>
                  <div>
                    <label className={labelCls}>Facebook URL</label>
                    <input type="url" className={inputCls} value={settings.facebook_url || ''} onChange={e => setSettings({ ...settings, facebook_url: e.target.value })} />
                  </div>
                  <div>
                    <label className={labelCls}>Instagram URL</label>
                    <input type="url" className={inputCls} value={settings.instagram_url || ''} onChange={e => setSettings({ ...settings, instagram_url: e.target.value })} />
                  </div>
                  <div>
                    <label className={labelCls}>YouTube URL</label>
                    <input type="url" className={inputCls} value={settings.youtube_url || ''} onChange={e => setSettings({ ...settings, youtube_url: e.target.value })} />
                  </div>
                </div>
              </div>
            )}

            {/* Hero Section */}
            {activeTab === 'hero' && (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-church-earth/10 space-y-5">
                <h2 className="font-bold text-xl text-church-earth-dark mb-2">Hero Section (Home Page)</h2>
                <div>
                  <label className={labelCls}>Hero Title</label>
                  <input type="text" className={inputCls} value={settings.hero_title || ''} onChange={e => setSettings({ ...settings, hero_title: e.target.value })} />
                </div>
                <div>
                  <label className={labelCls}>Hero Subtitle</label>
                  <textarea className={textareaCls} rows={3} value={settings.hero_subtitle || ''} onChange={e => setSettings({ ...settings, hero_subtitle: e.target.value })} />
                </div>
                <div>
                  <label className={labelCls}>CTA Button Text</label>
                  <input type="text" className={inputCls} value={settings.hero_cta_text || ''} onChange={e => setSettings({ ...settings, hero_cta_text: e.target.value })} />
                </div>
                <div>
                  <label className={labelCls}>Hero Background Image</label>
                  {settings.hero_image_url && (
                    <div className="mb-2 relative w-full h-32 rounded-lg overflow-hidden border border-church-earth/20">
                      <img src={settings.hero_image_url} alt="Hero preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <button
                        type="button"
                        onClick={() => setSettings(prev => ({ ...prev, hero_image_url: '' }))}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >✕</button>
                    </div>
                  )}
                  <input
                    type="url"
                    className={inputCls}
                    value={settings.hero_image_url || ''}
                    onChange={e => setSettings({ ...settings, hero_image_url: e.target.value })}
                    placeholder="Paste image URL or upload below"
                  />
                  <div className="mt-2 flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer bg-church-cream border border-church-earth/20 hover:bg-church-earth/10 px-4 py-2 rounded-lg text-sm text-church-earth-dark transition-colors">
                      <Image className="w-4 h-4" />
                      {heroUploading ? 'Uploading...' : 'Upload Image'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={heroUploading}
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) { setHeroImageFile(file); handleHeroImageUpload(file); }
                        }}
                      />
                    </label>
                    {heroImageFile && <span className="text-xs text-church-earth-light truncate max-w-xs">{heroImageFile.name}</span>}
                    {heroUploading && <Loader2 className="w-4 h-4 animate-spin text-church-gold" />}
                  </div>
                  {heroUploadError && (
                    <p className="mt-1.5 text-xs text-red-600">{heroUploadError}</p>
                  )}
                </div>
                <div>
                  <label className={labelCls}>Featured Sermon on Home Page</label>
                  <p className="text-xs text-church-earth-light mb-2">Select which sermon appears in the "Latest Message" section. Leave as "Latest" to always show the most recent.</p>
                  <select
                    className={inputCls}
                    value={settings.featured_sermon_id || ''}
                    onChange={e => setSettings({ ...settings, featured_sermon_id: e.target.value })}
                  >
                    <option value="">Latest (automatic)</option>
                    {allSermons.map(s => (
                      <option key={s.id} value={s.id}>{s.title}{s.date ? ` — ${s.date}` : ''}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Vision & Story */}
            {activeTab === 'story' && (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-church-earth/10 space-y-5">
                <h2 className="font-bold text-xl text-church-earth-dark mb-2">Vision, Mission & Story</h2>
                <div>
                  <label className={labelCls}>Vision</label>
                  <textarea className={textareaCls} rows={2} value={settings.vision || ''} onChange={e => setSettings({ ...settings, vision: e.target.value })} />
                </div>
                <div>
                  <label className={labelCls}>Mission</label>
                  <textarea className={textareaCls} rows={2} value={settings.mission || ''} onChange={e => setSettings({ ...settings, mission: e.target.value })} />
                </div>
                <div>
                  <label className={labelCls}>Purpose</label>
                  <textarea className={textareaCls} rows={2} value={settings.purpose || ''} onChange={e => setSettings({ ...settings, purpose: e.target.value })} />
                </div>
                <div>
                  <label className={labelCls}>Cause</label>
                  <textarea className={textareaCls} rows={2} value={settings.cause || ''} onChange={e => setSettings({ ...settings, cause: e.target.value })} />
                </div>
                <div>
                  <label className={labelCls}>Our Story</label>
                  <textarea className={textareaCls} rows={5} value={settings.about_story || ''} onChange={e => setSettings({ ...settings, about_story: e.target.value })} />
                </div>
              </div>
            )}

            {/* Leadership */}
            {activeTab === 'leadership' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-xl text-church-earth-dark">Leadership Team</h2>
                  <button
                    onClick={() => { setShowLeaderForm(true); setEditingLeader(null); setLeaderForm({ name: '', role: '', bio: '', image_url: '', sort_order: leaders.length }); }}
                    className="bg-church-gold hover:bg-church-gold-dark text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Add Leader
                  </button>
                </div>

                {showLeaderForm && (
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-church-earth/10">
                    <h3 className="font-bold text-church-earth-dark mb-4">{editingLeader ? 'Edit Leader' : 'Add New Leader'}</h3>
                    <form onSubmit={handleSaveLeader} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={labelCls}>Name</label>
                          <input required type="text" className={inputCls} value={leaderForm.name} onChange={e => setLeaderForm({...leaderForm, name: e.target.value})} />
                        </div>
                        <div>
                          <label className={labelCls}>Role / Title</label>
                          <input required type="text" className={inputCls} value={leaderForm.role} onChange={e => setLeaderForm({...leaderForm, role: e.target.value})} />
                        </div>
                      </div>
                      <div>
                        <label className={labelCls}>Photo URL</label>
                        <input type="url" className={inputCls} value={leaderForm.image_url} onChange={e => setLeaderForm({...leaderForm, image_url: e.target.value})} placeholder="https://..." />
                      </div>
                      <div>
                        <label className={labelCls}>Bio</label>
                        <textarea className={textareaCls} rows={3} value={leaderForm.bio} onChange={e => setLeaderForm({...leaderForm, bio: e.target.value})} />
                      </div>
                      <div>
                        <label className={labelCls}>Sort Order</label>
                        <input type="number" className={inputCls} value={leaderForm.sort_order} onChange={e => setLeaderForm({...leaderForm, sort_order: parseInt(e.target.value)})} />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => { setShowLeaderForm(false); setEditingLeader(null); }} className="px-4 py-2 text-church-earth-light hover:text-church-earth-dark text-sm">Cancel</button>
                        <button type="submit" disabled={saving} className="bg-church-gold hover:bg-church-gold-dark text-white px-6 py-2 rounded-lg font-medium text-sm flex items-center gap-2">
                          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  {leaders.sort((a, b) => a.sort_order - b.sort_order).map(leader => (
                    <div key={leader.id} className="bg-white rounded-2xl p-5 shadow-sm border border-church-earth/10 flex items-start gap-4">
                      <img
                        src={leader.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(leader.name)}&size=80&background=c9a96e&color=fff`}
                        alt={leader.name}
                        className="w-16 h-16 rounded-full object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-church-earth-dark">{leader.name}</h3>
                        <p className="text-church-gold text-sm font-medium">{leader.role}</p>
                        {leader.bio && <p className="text-church-earth-light text-xs mt-1 line-clamp-2">{leader.bio}</p>}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => startEditLeader(leader)} className="p-2 hover:bg-church-cream rounded-lg transition-colors text-church-earth-light hover:text-church-earth-dark">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteLeader(leader.id)} className="p-2 hover:bg-red-50 rounded-lg transition-colors text-church-earth-light hover:text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Locations */}
            {activeTab === 'locations' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-xl text-church-earth-dark">Church Locations</h2>
                  <button
                    onClick={() => { setShowLocationForm(true); setEditingLocation(null); setLocationForm(EMPTY_LOC); }}
                    className="bg-church-gold hover:bg-church-gold-dark text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Add Location
                  </button>
                </div>

                {showLocationForm && (
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-church-earth/10">
                    <h3 className="font-bold text-church-earth-dark mb-4">{editingLocation ? 'Edit Location' : 'Add New Location'}</h3>
                    <form onSubmit={handleSaveLocation} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={labelCls}>Location Name</label>
                          <input required type="text" className={inputCls} value={locationForm.name} onChange={e => setLocationForm({...locationForm, name: e.target.value})} placeholder="e.g. Main Campus" />
                        </div>
                        <div>
                          <label className={labelCls}>Pastor</label>
                          <input type="text" className={inputCls} value={locationForm.pastor} onChange={e => setLocationForm({...locationForm, pastor: e.target.value})} placeholder="Pastor Name" />
                        </div>
                      </div>
                      <div>
                        <label className={labelCls}>Address</label>
                        <textarea className={textareaCls} rows={2} value={locationForm.address} onChange={e => setLocationForm({...locationForm, address: e.target.value})} placeholder="Full address" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={labelCls}>Phone</label>
                          <input type="tel" className={inputCls} value={locationForm.phone} onChange={e => setLocationForm({...locationForm, phone: e.target.value})} />
                        </div>
                        <div>
                          <label className={labelCls}>Google Maps URL</label>
                          <input type="url" className={inputCls} value={locationForm.map_url} onChange={e => setLocationForm({...locationForm, map_url: e.target.value})} placeholder="https://maps.google.com/..." />
                        </div>
                      </div>
                      <div>
                        <label className={labelCls}>Service Times</label>
                        <textarea className={textareaCls} rows={2} value={locationForm.service_times} onChange={e => setLocationForm({...locationForm, service_times: e.target.value})} placeholder="Sundays at 9 AM & 11 AM" />
                      </div>
                      <div>
                        <label className={labelCls}>Location Image</label>
                        {/* Preview */}
                        {(locationImageFile ? URL.createObjectURL(locationImageFile) : locationForm.image_url) && (
                          <div className="relative w-full h-32 mb-2 rounded-lg overflow-hidden border border-church-earth/10">
                            <img
                              src={locationImageFile ? URL.createObjectURL(locationImageFile) : locationForm.image_url}
                              alt="Location preview"
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => { setLocationImageFile(null); setLocationForm(f => ({ ...f, image_url: '' })); }}
                              className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                        {/* File picker */}
                        <label className="flex items-center gap-2 cursor-pointer bg-church-cream border border-dashed border-church-earth/30 hover:border-church-gold rounded-lg px-4 py-3 text-sm text-church-earth-light transition-colors mb-2">
                          <Upload className="w-4 h-4" />
                          {locationImageFile ? locationImageFile.name : 'Browse from device…'}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) { setLocationImageFile(file); setLocationForm(f => ({ ...f, image_url: '' })); }
                            }}
                          />
                        </label>
                        {/* OR paste a URL */}
                        <p className="text-xs text-church-earth-light mb-1">Or paste an image URL:</p>
                        <input
                          type="url"
                          className={inputCls}
                          value={locationImageFile ? '' : locationForm.image_url}
                          disabled={!!locationImageFile}
                          onChange={e => setLocationForm({...locationForm, image_url: e.target.value})}
                          placeholder="https://..."
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => { setShowLocationForm(false); setEditingLocation(null); }} className="px-4 py-2 text-church-earth-light hover:text-church-earth-dark text-sm">Cancel</button>
                        <button type="submit" disabled={savingLocation} className="bg-church-gold hover:bg-church-gold-dark text-white px-6 py-2 rounded-lg font-medium text-sm flex items-center gap-2">
                          {savingLocation ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  {locations.map(loc => (
                    <div key={loc.id} className="bg-white rounded-2xl p-5 shadow-sm border border-church-earth/10 flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-church-gold/10 flex items-center justify-center shrink-0 text-church-gold">
                        <MapPin className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-church-earth-dark">{loc.name}</h3>
                        {loc.pastor && <p className="text-church-gold text-sm font-medium">Pastor {loc.pastor}</p>}
                        <p className="text-church-earth-light text-xs mt-1 line-clamp-2">{loc.address}</p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => startEditLocation(loc)} className="p-2 hover:bg-church-cream rounded-lg transition-colors text-church-earth-light hover:text-church-earth-dark">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteLocation(loc.id)} className="p-2 hover:bg-red-50 rounded-lg transition-colors text-church-earth-light hover:text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {locations.length === 0 && (
                    <p className="text-church-earth-light text-sm col-span-2 text-center py-8">No locations added yet. Click "Add Location" to get started.</p>
                  )}
                </div>
              </div>
            )}

            {/* Ministries */}
            {activeTab === 'ministries' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-xl text-church-earth-dark">Ministries</h2>
                  <button
                    onClick={() => { setShowMinistryForm(true); setEditingMinistry(null); setMinistryForm(EMPTY_MIN); }}
                    className="bg-church-gold hover:bg-church-gold-dark text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Add Ministry
                  </button>
                </div>

                {showMinistryForm && (
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-church-earth/10">
                    <h3 className="font-bold text-church-earth-dark mb-4">{editingMinistry ? 'Edit Ministry' : 'Add New Ministry'}</h3>
                    <form onSubmit={handleSaveMinistry} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={labelCls}>Title</label>
                          <input required type="text" className={inputCls} value={ministryForm.title} onChange={e => setMinistryForm({...ministryForm, title: e.target.value})} placeholder="e.g. Kids Ministry" />
                        </div>
                        <div>
                          <label className={labelCls}>Age Group</label>
                          <input type="text" className={inputCls} value={ministryForm.age_group} onChange={e => setMinistryForm({...ministryForm, age_group: e.target.value})} placeholder="e.g. All Ages" />
                        </div>
                      </div>
                      <div>
                        <label className={labelCls}>Description</label>
                        <textarea required className={textareaCls} rows={3} value={ministryForm.description} onChange={e => setMinistryForm({...ministryForm, description: e.target.value})} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={labelCls}>Leader Name</label>
                          <input type="text" className={inputCls} value={ministryForm.leader_name} onChange={e => setMinistryForm({...ministryForm, leader_name: e.target.value})} placeholder="e.g. Pastor John" />
                        </div>
                        <div>
                          <label className={labelCls}>Schedule</label>
                          <input type="text" className={inputCls} value={ministryForm.schedule} onChange={e => setMinistryForm({...ministryForm, schedule: e.target.value})} placeholder="e.g. Sundays at 10 AM" />
                        </div>
                      </div>
                      <div>
                        <label className={labelCls}>Location</label>
                        <input type="text" className={inputCls} value={ministryForm.location} onChange={e => setMinistryForm({...ministryForm, location: e.target.value})} placeholder="e.g. Room 101 / Online" />
                      </div>
                      <div>
                        <label className={labelCls}>Goals (one per line)</label>
                        <textarea className={textareaCls} rows={4} value={ministryForm.goals} onChange={e => setMinistryForm({...ministryForm, goals: e.target.value})} placeholder={"Teach biblical foundations\nFoster community\nServe faithfully"} />
                        <p className="text-xs text-church-earth-light mt-1">Each line becomes a separate goal bullet on the ministry page.</p>
                      </div>
                      <div>
                        <label className={labelCls}>Ministry Image</label>
                        {(ministryImageFile ? URL.createObjectURL(ministryImageFile) : ministryForm.image_url) && (
                          <div className="relative w-full h-32 mb-2 rounded-lg overflow-hidden border border-church-earth/10">
                            <img
                              src={ministryImageFile ? URL.createObjectURL(ministryImageFile) : ministryForm.image_url}
                              alt="Preview"
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <button type="button" onClick={() => { setMinistryImageFile(null); setMinistryForm(f => ({ ...f, image_url: '' })); }}
                              className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                        <label className="flex items-center gap-2 cursor-pointer bg-church-cream border border-dashed border-church-earth/30 hover:border-church-gold rounded-lg px-4 py-3 text-sm text-church-earth-light transition-colors mb-2">
                          <Upload className="w-4 h-4" />
                          {ministryImageFile ? ministryImageFile.name : 'Browse from device…'}
                          <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) { setMinistryImageFile(f); setMinistryForm(prev => ({ ...prev, image_url: '' })); } }} />
                        </label>
                        <p className="text-xs text-church-earth-light mb-1">Or paste an image URL:</p>
                        <input type="url" className={inputCls} value={ministryImageFile ? '' : ministryForm.image_url} disabled={!!ministryImageFile} onChange={e => setMinistryForm({...ministryForm, image_url: e.target.value})} placeholder="https://..." />
                        {ministryImageUploading && <p className="text-xs text-church-gold mt-1 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Uploading image…</p>}
                      </div>
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => { setShowMinistryForm(false); setEditingMinistry(null); }} className="px-4 py-2 text-church-earth-light hover:text-church-earth-dark text-sm">Cancel</button>
                        <button type="submit" disabled={savingMinistry} className="bg-church-gold hover:bg-church-gold-dark text-white px-6 py-2 rounded-lg font-medium text-sm flex items-center gap-2">
                          {savingMinistry ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  {ministries.map(m => (
                    <div key={m.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-church-earth/10 flex flex-col">
                      {m.image_url && (
                        <div className="h-32 overflow-hidden">
                          <img src={m.image_url} alt={m.title} className="w-full h-full object-cover" referrerPolicy="no-referrer"
                            onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                        </div>
                      )}
                      <div className="p-5 flex items-start gap-3 flex-1">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-bold text-church-earth-dark">{m.title}</h3>
                            <span className="text-xs bg-church-gold/10 text-church-gold px-2 py-0.5 rounded-full">{m.age_group}</span>
                          </div>
                          <p className="text-church-earth-light text-xs line-clamp-2">{m.description}</p>
                          {m.leader_name && <p className="text-xs text-church-earth/70 mt-1">Leader: {m.leader_name}</p>}
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button onClick={() => startEditMinistry(m)} className="p-2 hover:bg-church-cream rounded-lg transition-colors text-church-earth-light hover:text-church-earth-dark">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteMinistry(m.id)} className="p-2 hover:bg-red-50 rounded-lg transition-colors text-church-earth-light hover:text-red-500">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {ministries.length === 0 && (
                    <p className="text-church-earth-light text-sm col-span-2 text-center py-8">No ministries yet. Click "Add Ministry" to create one.</p>
                  )}
                </div>
              </div>
            )}

            {/* Live Stream */}
            {activeTab === 'live' && (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-church-earth/10 space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                    <Video className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <h2 className="font-bold text-xl text-church-earth-dark">Live Stream Settings</h2>
                    <p className="text-church-earth-light text-sm">Set the YouTube or Facebook link that plays on the Watch Live page.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5">
                  <div>
                    <label className={labelCls}>Live Stream Title</label>
                    <input
                      type="text"
                      className={inputCls}
                      value={settings.live_title || ''}
                      onChange={e => setSettings({ ...settings, live_title: e.target.value })}
                      placeholder="e.g., Sunday Service Live"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Description</label>
                    <input
                      type="text"
                      className={inputCls}
                      value={settings.live_description || ''}
                      onChange={e => setSettings({ ...settings, live_description: e.target.value })}
                      placeholder="e.g., Join us as we worship and hear the Word of God together."
                    />
                  </div>
                  <div>
                    <label className={labelCls}>YouTube URL</label>
                    <input
                      type="url"
                      className={inputCls}
                      value={settings.live_youtube_url || ''}
                      onChange={e => setSettings({ ...settings, live_youtube_url: e.target.value })}
                      placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                    />
                    <p className="text-xs text-church-earth-light mt-1">Supports youtube.com/watch, youtu.be, youtube.com/live, and channel live stream URLs.</p>
                  </div>
                  <div>
                    <label className={labelCls}>Facebook Live URL</label>
                    <input
                      type="url"
                      className={inputCls}
                      value={settings.live_facebook_url || ''}
                      onChange={e => setSettings({ ...settings, live_facebook_url: e.target.value })}
                      placeholder="https://www.facebook.com/yourpage/videos/..."
                    />
                    <p className="text-xs text-church-earth-light mt-1">Paste the full Facebook video/live URL. YouTube takes priority if both are set.</p>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleSaveLiveSettings}
                    disabled={saving}
                    className="bg-church-gold hover:bg-church-gold-dark text-white px-8 py-3 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-sm"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                    {saved ? 'Saved!' : 'Save Live Settings'}
                  </button>
                </div>
              </div>
            )}

            {/* Notifications */}
            {activeTab === 'notifications' && (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-church-earth/10">
                <h2 className="font-bold text-xl text-church-earth-dark mb-2">Broadcast Notification</h2>
                <p className="text-church-earth-light text-sm mb-6">Send a notification to all members of the church app.</p>
                <form onSubmit={handleSendNotification} className="space-y-4">
                  <div>
                    <label className={labelCls}>Title</label>
                    <input required type="text" className={inputCls} value={notifForm.title} onChange={e => setNotifForm({...notifForm, title: e.target.value})} placeholder="e.g., Special Announcement" />
                  </div>
                  <div>
                    <label className={labelCls}>Message</label>
                    <textarea required className={textareaCls} rows={4} value={notifForm.message} onChange={e => setNotifForm({...notifForm, message: e.target.value})} placeholder="Write your message here..." />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Type</label>
                      <select className={inputCls} value={notifForm.type} onChange={e => setNotifForm({...notifForm, type: e.target.value as NotificationType})}>
                      <option value="general">General</option>
                        <option value="event">Event</option>
                        <option value="sermon">Sermon</option>
                        <option value="prayer">Prayer</option>
                        <option value="info">Info</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Link (optional)</label>
                      <input type="text" className={inputCls} value={notifForm.link} onChange={e => setNotifForm({...notifForm, link: e.target.value})} placeholder="/events or /sermons" />
                    </div>
                  </div>
                  <button type="submit" disabled={sendingNotif} className="bg-church-gold hover:bg-church-gold-dark text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors">
                    {sendingNotif ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
                    {notifSent ? 'Notification Sent!' : 'Send Notification'}
                  </button>
                  {notifSent && <p className="text-green-600 text-sm flex items-center gap-2"><Check className="w-4 h-4" /> Notification broadcast successfully!</p>}
                </form>
              </div>
            )}

            {/* Save button for settings tabs */}
            {['church', 'hero', 'story'].includes(activeTab) && (
              <div className="mt-6 flex justify-end">
                <button onClick={handleSaveSettings} disabled={saving} className="bg-church-gold hover:bg-church-gold-dark text-white px-8 py-3 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-sm">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  {saved ? 'Saved!' : 'Save Changes'}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
