import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import {
  User, Mail, Shield, LogOut, History, Heart, CheckCircle2, Clock, XCircle,
  Edit2, Save, X, Camera, Loader2, Phone, Award, BookOpen, Users, Briefcase,
  MapPin, Calendar, AlertCircle,
} from 'lucide-react';
import { getGivingHistory, GivingTransaction } from '../lib/givingStore';
import { updateProfile } from '../lib/authStore';
import { uploadImage } from '../lib/storageUtils';
import { Skeleton } from '../components/ui/Skeleton';
import { getUserJoinedGroupIds, getGroups, SmallGroup } from '../lib/groupsStore';
import { getUserMinistryIds, getMinistries, Ministry } from '../lib/ministriesStore';
import { getUserVolunteerApplications, VolunteerApplicationWithRole } from '../lib/volunteerStore';

interface GrowthData {
  streak: number;
  lastReadDate: string | null;
  completedDays: string[];
}

function getDevotionalBadge(totalDays: number): { label: string; color: string } {
  if (totalDays >= 365) return { label: 'Pilgrim', color: 'bg-purple-100 text-purple-700' };
  if (totalDays >= 90) return { label: 'Devoted', color: 'bg-blue-100 text-blue-700' };
  if (totalDays >= 30) return { label: 'Faithful', color: 'bg-church-gold/10 text-church-earth' };
  if (totalDays >= 7) return { label: 'Seeker', color: 'bg-green-100 text-green-700' };
  return { label: 'Beginner', color: 'bg-gray-100 text-gray-600' };
}

function getGivingBadge(total: number): { label: string; color: string } | null {
  if (total >= 50000) return { label: 'Faithful Steward', color: 'bg-yellow-100 text-yellow-700' };
  if (total >= 10000) return { label: 'Kingdom Builder', color: 'bg-amber-100 text-amber-700' };
  if (total >= 2500) return { label: 'Generous Heart', color: 'bg-orange-100 text-orange-700' };
  if (total >= 500) return { label: 'Cheerful Giver', color: 'bg-red-100 text-red-600' };
  return null;
}

export function Profile() {
  const { user, logout, loading, setUser } = useAuth();
  const navigate = useNavigate();

  const [givingHistory, setGivingHistory] = useState<GivingTransaction[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [joinedGroups, setJoinedGroups] = useState<SmallGroup[]>([]);
  const [joinedMinistries, setJoinedMinistries] = useState<Ministry[]>([]);
  const [volunteerApps, setVolunteerApps] = useState<VolunteerApplicationWithRole[]>([]);
  const [growthData, setGrowthData] = useState<GrowthData>({ streak: 0, lastReadDate: null, completedDays: [] });

  // Edit state
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editBirthdate, setEditBirthdate] = useState('');
  const [editGender, setEditGender] = useState('');
  const [editCivilStatus, setEditCivilStatus] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editEmergencyName, setEditEmergencyName] = useState('');
  const [editEmergencyPhone, setEditEmergencyPhone] = useState('');
  const [editOccupation, setEditOccupation] = useState('');
  const [editWorkplace, setEditWorkplace] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && !user) navigate('/login');
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      loadHistory();
      loadMemberships();
      const local = localStorage.getItem(`growth_${user.id}`);
      if (local) setGrowthData(JSON.parse(local));
      // Initialise edit fields
      const u = user as any;
      setEditName(user.full_name ?? '');
      setEditPhone(user.phone ?? '');
      setEditBirthdate(u.birthdate ?? '');
      setEditGender(u.gender ?? '');
      setEditCivilStatus(u.civil_status ?? '');
      setEditAddress(u.address ?? '');
      setEditEmergencyName(u.emergency_contact_name ?? '');
      setEditEmergencyPhone(u.emergency_contact_phone ?? '');
      setEditOccupation(u.occupation ?? '');
      setEditWorkplace(u.workplace ?? '');
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const history = await getGivingHistory(user?.id);
      setGivingHistory(history);
    } finally {
      setLoadingHistory(false);
    }
  };

  const loadMemberships = async () => {
    if (!user) return;
    try {
      const [groupIds, ministryIds, allGroups, allMinistries, apps] = await Promise.all([
        getUserJoinedGroupIds(user.id),
        getUserMinistryIds(user.id),
        getGroups(),
        getMinistries(),
        getUserVolunteerApplications(user.id),
      ]);
      setJoinedGroups(allGroups.filter(g => groupIds.includes(g.id)));
      setJoinedMinistries(allMinistries.filter(m => ministryIds.includes(m.id)));
      setVolunteerApps(apps);
    } catch (err) {
      console.error('loadMemberships:', err);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);
    try {
      const updated = await updateProfile(user.id, {
        full_name: editName,
        phone: editPhone || undefined,
        birthdate: editBirthdate || undefined,
        gender: editGender || undefined,
        civil_status: editCivilStatus || undefined,
        address: editAddress || undefined,
        emergency_contact_name: editEmergencyName || undefined,
        emergency_contact_phone: editEmergencyPhone || undefined,
        occupation: editOccupation || undefined,
        workplace: editWorkplace || undefined,
      });
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

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Derived values
  const completedGiving = givingHistory.filter(t => t.status === 'completed');
  const totalGiving = completedGiving.reduce((sum, t) => sum + t.amount, 0);
  const devBadge = getDevotionalBadge(growthData.completedDays.length);
  const givingBadge = getGivingBadge(totalGiving);

  if (loading || !user) {
    return (
      <main className="pt-32 pb-24 bg-church-cream min-h-screen">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl space-y-8">
          <Skeleton className="h-72 rounded-3xl" />
          <Skeleton className="h-32 rounded-3xl" />
          <Skeleton className="h-48 rounded-3xl" />
        </div>
      </main>
    );
  }

  const u = user as any; // cast for extended profile fields

  return (
    <main className="pt-32 pb-24 bg-church-cream min-h-screen">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >

          {/* ── Profile card ───────────────────────────────────────────── */}
          <div className="bg-white rounded-3xl shadow-sm border border-church-earth/5 overflow-hidden">
            {/* Banner */}
            <div className="bg-church-earth-dark h-32 relative">
              <div className="absolute -bottom-12 left-8">
                <div className="relative group">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.full_name}
                      className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full border-4 border-white shadow-md bg-church-gold/20 flex items-center justify-center text-church-gold text-3xl font-bold">
                      {user.full_name?.charAt(0) ?? '?'}
                    </div>
                  )}
                  <button
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    title="Change photo"
                  >
                    {uploadingAvatar
                      ? <Loader2 className="w-6 h-6 text-white animate-spin" />
                      : <Camera className="w-6 h-6 text-white" />}
                  </button>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>
              </div>
            </div>

            <div className="pt-16 px-8 pb-8">
              {/* Name / role row */}
              <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
                <div>
                  <h1 className="font-serif text-2xl font-bold text-church-earth-dark">{user.full_name}</h1>
                  <p className="text-church-earth-light text-sm">{user.email}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-church-gold/10 text-church-earth border border-church-gold/20">
                    <Shield className="w-3 h-3" /> {user.role}
                  </span>
                  {!editing && (
                    <button
                      onClick={() => setEditing(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-church-earth/20 text-church-earth-light hover:text-church-gold hover:border-church-gold/30 transition-colors"
                    >
                      <Edit2 className="w-3 h-3" /> Edit Profile
                    </button>
                  )}
                </div>
              </div>

              {/* Edit form */}
              {editing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-church-earth-light mb-1">Full Name</label>
                      <input
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        className="w-full border border-church-earth/20 rounded-xl px-3 py-2.5 text-sm text-church-earth-dark focus:outline-none focus:ring-2 focus:ring-church-gold/30"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-church-earth-light mb-1">Phone</label>
                      <input
                        value={editPhone}
                        onChange={e => setEditPhone(e.target.value)}
                        className="w-full border border-church-earth/20 rounded-xl px-3 py-2.5 text-sm text-church-earth-dark focus:outline-none focus:ring-2 focus:ring-church-gold/30"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-church-earth-light mb-1">Birthdate</label>
                      <input
                        type="date"
                        value={editBirthdate}
                        onChange={e => setEditBirthdate(e.target.value)}
                        className="w-full border border-church-earth/20 rounded-xl px-3 py-2.5 text-sm text-church-earth-dark focus:outline-none focus:ring-2 focus:ring-church-gold/30"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-church-earth-light mb-1">Gender</label>
                      <select
                        value={editGender}
                        onChange={e => setEditGender(e.target.value)}
                        className="w-full border border-church-earth/20 rounded-xl px-3 py-2.5 text-sm text-church-earth-dark focus:outline-none focus:ring-2 focus:ring-church-gold/30 bg-white"
                      >
                        <option value="">Select</option>
                        <option>Male</option>
                        <option>Female</option>
                        <option>Prefer not to say</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-church-earth-light mb-1">Civil Status</label>
                      <select
                        value={editCivilStatus}
                        onChange={e => setEditCivilStatus(e.target.value)}
                        className="w-full border border-church-earth/20 rounded-xl px-3 py-2.5 text-sm text-church-earth-dark focus:outline-none focus:ring-2 focus:ring-church-gold/30 bg-white"
                      >
                        <option value="">Select</option>
                        <option>Single</option>
                        <option>Married</option>
                        <option>Widowed</option>
                        <option>Separated</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-church-earth-light mb-1">Occupation</label>
                      <input
                        value={editOccupation}
                        onChange={e => setEditOccupation(e.target.value)}
                        placeholder="e.g. Teacher, Engineer…"
                        className="w-full border border-church-earth/20 rounded-xl px-3 py-2.5 text-sm text-church-earth-dark focus:outline-none focus:ring-2 focus:ring-church-gold/30"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-church-earth-light mb-1">Workplace / School</label>
                      <input
                        value={editWorkplace}
                        onChange={e => setEditWorkplace(e.target.value)}
                        className="w-full border border-church-earth/20 rounded-xl px-3 py-2.5 text-sm text-church-earth-dark focus:outline-none focus:ring-2 focus:ring-church-gold/30"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-church-earth-light mb-1">Address</label>
                      <textarea
                        value={editAddress}
                        onChange={e => setEditAddress(e.target.value)}
                        rows={2}
                        className="w-full border border-church-earth/20 rounded-xl px-3 py-2.5 text-sm text-church-earth-dark focus:outline-none focus:ring-2 focus:ring-church-gold/30 resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-church-earth-light mb-1">Emergency Contact Name</label>
                      <input
                        value={editEmergencyName}
                        onChange={e => setEditEmergencyName(e.target.value)}
                        className="w-full border border-church-earth/20 rounded-xl px-3 py-2.5 text-sm text-church-earth-dark focus:outline-none focus:ring-2 focus:ring-church-gold/30"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-church-earth-light mb-1">Emergency Contact Phone</label>
                      <input
                        value={editEmergencyPhone}
                        onChange={e => setEditEmergencyPhone(e.target.value)}
                        className="w-full border border-church-earth/20 rounded-xl px-3 py-2.5 text-sm text-church-earth-dark focus:outline-none focus:ring-2 focus:ring-church-gold/30"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleSaveProfile}
                      disabled={savingProfile}
                      className="inline-flex items-center gap-2 bg-church-gold hover:bg-church-gold-dark text-white px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-60 transition-colors"
                    >
                      {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save
                    </button>
                    <button
                      onClick={() => setEditing(false)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-church-earth-light border border-church-earth/20 hover:text-church-earth transition-colors"
                    >
                      <X className="w-4 h-4" /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* View mode */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-3 text-church-earth-light">
                    <Mail className="w-4 h-4 text-church-gold shrink-0" />
                    <span>{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-3 text-church-earth-light">
                      <Phone className="w-4 h-4 text-church-gold shrink-0" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                  {u.birthdate && (
                    <div className="flex items-center gap-3 text-church-earth-light">
                      <Calendar className="w-4 h-4 text-church-gold shrink-0" />
                      <span>{new Date(u.birthdate + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                  )}
                  {(u.gender || u.civil_status) && (
                    <div className="flex items-center gap-3 text-church-earth-light">
                      <User className="w-4 h-4 text-church-gold shrink-0" />
                      <span>{[u.gender, u.civil_status].filter(Boolean).join(' · ')}</span>
                    </div>
                  )}
                  {u.occupation && (
                    <div className="flex items-center gap-3 text-church-earth-light">
                      <Briefcase className="w-4 h-4 text-church-gold shrink-0" />
                      <span>{u.occupation}{u.workplace ? ` at ${u.workplace}` : ''}</span>
                    </div>
                  )}
                  {u.address && (
                    <div className="flex items-start gap-3 text-church-earth-light md:col-span-2">
                      <MapPin className="w-4 h-4 text-church-gold shrink-0 mt-0.5" />
                      <span className="whitespace-pre-line">{u.address}</span>
                    </div>
                  )}
                  {u.emergency_contact_name && (
                    <div className="flex items-center gap-3 text-church-earth-light md:col-span-2">
                      <AlertCircle className="w-4 h-4 text-church-gold shrink-0" />
                      <span>
                        Emergency: {u.emergency_contact_name}
                        {u.emergency_contact_phone ? ` · ${u.emergency_contact_phone}` : ''}
                      </span>
                    </div>
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

          {/* ── Badges ─────────────────────────────────────────────────── */}
          <div className="bg-white rounded-3xl shadow-sm border border-church-earth/5 p-8">
            <div className="flex items-center gap-3 mb-6">
              <Award className="w-6 h-6 text-church-gold" />
              <h2 className="font-serif text-2xl font-bold text-church-earth-dark">Badges</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {/* Devotional badge */}
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${devBadge.color}`}>
                <BookOpen className="w-4 h-4 shrink-0" />
                {devBadge.label}
                <span className="text-xs opacity-60">· {growthData.completedDays.length} day{growthData.completedDays.length !== 1 ? 's' : ''}</span>
              </div>
              {/* Giving badge */}
              {givingBadge ? (
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${givingBadge.color}`}>
                  <Heart className="w-4 h-4 shrink-0" />
                  {givingBadge.label}
                  <span className="text-xs opacity-60">· ₱{totalGiving.toLocaleString()}</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-gray-50 text-gray-400 border border-gray-100">
                  <Heart className="w-4 h-4 shrink-0" />
                  No giving badge yet
                </div>
              )}
            </div>
          </div>

          {/* ── My Communities ─────────────────────────────────────────── */}
          {(joinedGroups.length > 0 || joinedMinistries.length > 0) && (
            <div className="bg-white rounded-3xl shadow-sm border border-church-earth/5 p-8">
              <div className="flex items-center gap-3 mb-6">
                <Users className="w-6 h-6 text-church-gold" />
                <h2 className="font-serif text-2xl font-bold text-church-earth-dark">My Communities</h2>
              </div>

              {joinedGroups.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-church-earth-light uppercase tracking-wider mb-3">Small Groups</h3>
                  <div className="space-y-2">
                    {joinedGroups.map(g => (
                      <div key={g.id} className="flex items-center gap-3 p-3 bg-church-cream/40 rounded-xl">
                        <div className="w-9 h-9 bg-church-gold/10 rounded-lg flex items-center justify-center text-church-gold shrink-0">
                          <Users className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-church-earth-dark truncate">{g.name}</p>
                          <p className="text-xs text-church-earth-light">{g.category}{g.schedule ? ` · ${g.schedule}` : ''}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {joinedMinistries.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-church-earth-light uppercase tracking-wider mb-3">Ministries</h3>
                  <div className="space-y-2">
                    {joinedMinistries.map(m => (
                      <div key={m.id} className="flex items-center gap-3 p-3 bg-church-cream/40 rounded-xl">
                        <div className="w-9 h-9 bg-church-gold/10 rounded-lg flex items-center justify-center text-church-gold shrink-0">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-church-earth-dark truncate">{m.title}</p>
                          <p className="text-xs text-church-earth-light">{m.age_group}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Volunteer ──────────────────────────────────────────────── */}
          {volunteerApps.length > 0 && (
            <div className="bg-white rounded-3xl shadow-sm border border-church-earth/5 p-8">
              <div className="flex items-center gap-3 mb-6">
                <Briefcase className="w-6 h-6 text-church-gold" />
                <h2 className="font-serif text-2xl font-bold text-church-earth-dark">Volunteer</h2>
              </div>
              <div className="space-y-2">
                {volunteerApps.map(app => (
                  <div key={app.id} className="flex items-center justify-between p-3 bg-church-cream/40 rounded-xl gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-church-earth-dark truncate">{app.role_title ?? 'Role'}</p>
                      {app.role_department && (
                        <p className="text-xs text-church-earth-light">{app.role_department}</p>
                      )}
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${
                      app.status === 'approved'
                        ? 'bg-green-100 text-green-700'
                        : app.status === 'declined'
                        ? 'bg-red-100 text-red-600'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Giving History ──────────────────────────────────────────── */}
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
                <button
                  onClick={() => navigate('/give')}
                  className="mt-4 text-church-gold font-medium hover:text-church-earth transition-colors"
                >
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
                    {givingHistory.map(transaction => (
                      <tr key={transaction.id} className="border-b border-church-earth/5 hover:bg-church-cream/20 transition-colors">
                        <td className="py-4 text-church-earth-dark">{new Date(transaction.created_at).toLocaleDateString()}</td>
                        <td className="py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-church-cream text-church-earth-dark border border-church-earth/10">
                            {transaction.category}
                          </span>
                        </td>
                        <td className="py-4 font-medium text-church-earth-dark">
                          ₱{transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-4 text-church-earth-light">{transaction.payment_method}</td>
                        <td className="py-4">
                          {transaction.status === 'completed' && (
                            <span className="inline-flex items-center gap-1 text-green-600"><CheckCircle2 className="w-4 h-4" /> Completed</span>
                          )}
                          {transaction.status === 'pending' && (
                            <span className="inline-flex items-center gap-1 text-yellow-600"><Clock className="w-4 h-4" /> Pending</span>
                          )}
                          {transaction.status === 'failed' && (
                            <span className="inline-flex items-center gap-1 text-red-600"><XCircle className="w-4 h-4" /> Failed</span>
                          )}
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
