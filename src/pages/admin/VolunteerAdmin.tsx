import React from 'react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Calendar, Plus, Trash2, Clock, Loader2, ChevronDown, ChevronUp, CheckCircle2, XCircle, Mail, Phone } from 'lucide-react';
import {
  getAllVolunteerRoles, addVolunteerRole, deleteVolunteerRole, VolunteerRole,
  getVolunteerApplications, updateApplicationStatus, VolunteerApplication,
} from '../../lib/volunteerStore';

export function VolunteerAdmin() {
  const { isLeader, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [roles, setRoles] = useState<VolunteerRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ title: '', department: '', description: '', schedule: '' });

  // Applications
  const [allApplications, setAllApplications] = useState<VolunteerApplication[]>([]);
  const [expandedApps, setExpandedApps] = useState<Set<string>>(new Set());
  const [updatingApp, setUpdatingApp] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!authLoading && !isLeader) navigate('/');
  }, [authLoading, isLeader, navigate]);

  useEffect(() => {
    if (isLeader) {
      getAllVolunteerRoles().then(setRoles).catch(() => {}).finally(() => setLoading(false));
      getVolunteerApplications().then(setAllApplications).catch(() => {});
    }
  }, [isLeader]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const newRole = await addVolunteerRole({ ...formData, is_active: true });
      if (newRole) setRoles(prev => [newRole, ...prev]);
      setIsAdding(false);
      setFormData({ title: '', department: '', description: '', schedule: '' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this volunteer role?')) return;
    setRoles(prev => prev.filter(r => r.id !== id));
    await deleteVolunteerRole(id).catch(() => getAllVolunteerRoles().then(setRoles));
  };

  const toggleApps = (roleId: string) => {
    setExpandedApps(prev => {
      const next = new Set(prev);
      if (next.has(roleId)) { next.delete(roleId); } else { next.add(roleId); }
      return next;
    });
  };

  const handleUpdateStatus = async (appId: string, status: 'approved' | 'declined') => {
    setUpdatingApp(prev => new Set(prev).add(appId));
    try {
      await updateApplicationStatus(appId, status);
      setAllApplications(prev => prev.map(a => a.id === appId ? { ...a, status } : a));
    } catch (err) {
      console.error('Failed to update application:', err);
    } finally {
      setUpdatingApp(prev => { const s = new Set(prev); s.delete(appId); return s; });
    }
  };

  if (!isLeader) return null;

  return (
    <div className="pt-32 pb-24 min-h-screen bg-church-cream">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-church-gold" />
            <h1 className="text-3xl font-serif font-bold text-church-earth-dark">Manage Volunteer Roles</h1>
          </div>
          <button
            onClick={() => setIsAdding(true)}
            className="bg-church-gold hover:bg-church-gold-dark text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> Add Role
          </button>
        </div>

        {isAdding && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-church-earth/10 mb-8">
            <h2 className="text-xl font-bold text-church-earth-dark mb-4">Add New Role</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-church-earth-light mb-1">Role Title</label>
                  <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-church-earth/20 focus:outline-none focus:ring-2 focus:ring-church-gold/50 bg-church-cream/30 text-church-earth-dark" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-church-earth-light mb-1">Department</label>
                  <input required type="text" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-church-earth/20 focus:outline-none focus:ring-2 focus:ring-church-gold/50 bg-church-cream/30 text-church-earth-dark" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-church-earth-light mb-1">Schedule / Commitment</label>
                <input required type="text" value={formData.schedule} onChange={e => setFormData({...formData, schedule: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-church-earth/20 focus:outline-none focus:ring-2 focus:ring-church-gold/50 bg-church-cream/30 text-church-earth-dark" />
              </div>
              <div>
                <label className="block text-sm font-medium text-church-earth-light mb-1">Description</label>
                <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-church-earth/20 focus:outline-none focus:ring-2 focus:ring-church-gold/50 bg-church-cream/30 text-church-earth-dark" rows={3}></textarea>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-church-earth-light hover:text-church-earth-dark">Cancel</button>
                <button type="submit" disabled={saving} className="bg-church-gold hover:bg-church-gold-dark text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save Role
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-church-gold" /></div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {roles.map(role => {
              const roleApps = allApplications.filter(a => a.role_id === role.id);
              const pendingCount = roleApps.filter(a => a.status === 'pending').length;
              return (
                <div key={role.id} className="bg-white rounded-2xl shadow-sm border border-church-earth/10 overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="inline-block px-2 py-1 bg-church-cream text-church-earth-dark text-xs font-medium rounded-md mb-2 border border-church-earth/10">{role.department}</span>
                        <h3 className="font-bold text-xl text-church-earth-dark">{role.title}</h3>
                      </div>
                      <button onClick={() => handleDelete(role.id)} className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-church-earth-light text-sm mb-4">{role.description}</p>
                    <div className="flex items-center gap-2 text-sm text-church-earth-dark">
                      <Clock className="w-4 h-4 text-church-gold" /> {role.schedule}
                    </div>
                  </div>

                  {/* Applicants toggle */}
                  <button
                    onClick={() => toggleApps(role.id)}
                    className="w-full flex items-center justify-between px-6 py-3 bg-church-cream/60 hover:bg-church-cream border-t border-church-earth/10 text-sm font-medium text-church-earth-dark transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-church-gold" />
                      Applicants ({roleApps.length})
                      {pendingCount > 0 && (
                        <span className="bg-church-gold text-white text-xs px-2 py-0.5 rounded-full">{pendingCount} pending</span>
                      )}
                    </span>
                    {expandedApps.has(role.id) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {/* Applicants list */}
                  {expandedApps.has(role.id) && (
                    <div className="border-t border-church-earth/10 px-6 py-4">
                      {roleApps.length === 0 ? (
                        <p className="text-sm text-church-earth-light text-center py-3">No applications yet.</p>
                      ) : (
                        <div className="space-y-3">
                          {roleApps.map(app => (
                            <div key={app.id} className="p-3 rounded-xl bg-church-cream/50 border border-church-earth/10">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div>
                                  <p className="text-sm font-semibold text-church-earth-dark">{app.name}</p>
                                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                                    {app.email && <span className="flex items-center gap-1 text-xs text-church-earth-light"><Mail className="w-3 h-3" />{app.email}</span>}
                                    {app.phone && <span className="flex items-center gap-1 text-xs text-church-earth-light"><Phone className="w-3 h-3" />{app.phone}</span>}
                                  </div>
                                </div>
                                <span className={`flex-shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${
                                  app.status === 'approved' ? 'bg-green-100 text-green-700' :
                                  app.status === 'declined' ? 'bg-red-100 text-red-600' :
                                  'bg-amber-100 text-amber-700'
                                }`}>
                                  {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                </span>
                              </div>
                              {app.notes && <p className="text-xs text-church-earth-light italic mb-2">"{app.notes}"</p>}
                              {app.status === 'pending' && (
                                <div className="flex gap-2 mt-2">
                                  <button
                                    disabled={updatingApp.has(app.id)}
                                    onClick={() => handleUpdateStatus(app.id, 'approved')}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                                  >
                                    {updatingApp.has(app.id) ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                                    Approve
                                  </button>
                                  <button
                                    disabled={updatingApp.has(app.id)}
                                    onClick={() => handleUpdateStatus(app.id, 'declined')}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                                  >
                                    <XCircle className="w-3.5 h-3.5" /> Decline
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            {roles.length === 0 && (
              <div className="col-span-2 text-center py-16 text-church-earth-light">No roles yet. Add the first one!</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

