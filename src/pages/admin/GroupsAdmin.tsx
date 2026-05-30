import React from 'react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, Trash2, MapPin, Clock, Loader2, Pencil, X, Star, ChevronDown, ChevronUp, Mail, Phone, UserMinus } from 'lucide-react';
import { getAllGroups, addGroup, updateGroup, deleteGroup, SmallGroup, GroupMember, getGroupMembers, removeGroupMember } from '../../lib/groupsStore';

const EMPTY_FORM = { name: '', description: '', leader: '', schedule: '', location: '', category: 'General' };

export function GroupsAdmin() {
  const { isLeader, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState<SmallGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);

  // Members panel
  const [expandedMembers, setExpandedMembers] = useState<Set<string>>(new Set());
  const [membersMap, setMembersMap] = useState<Record<string, GroupMember[]>>({});
  const [loadingMembers, setLoadingMembers] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!authLoading && !isLeader) navigate('/');
  }, [authLoading, isLeader, navigate]);

  useEffect(() => {
    if (isLeader) getAllGroups().then(setGroups).catch(() => {}).finally(() => setLoading(false));
  }, [isLeader]); // eslint-disable-line react-hooks/exhaustive-deps

  const startEdit = (group: SmallGroup) => {
    setEditingId(group.id);
    setFormData({ name: group.name, description: group.description, leader: group.leader, schedule: group.schedule, location: group.location, category: group.category });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelForm = () => {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setShowForm(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        const updated = await updateGroup(editingId, formData);
        setGroups(prev => prev.map(g => g.id === editingId ? updated : g));
      } else {
        const newGroup = await addGroup({ ...formData, is_active: true });
        if (newGroup) setGroups(prev => [newGroup, ...prev]);
      }
      cancelForm();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this group?')) return;
    setGroups(prev => prev.filter(g => g.id !== id));
    await deleteGroup(id).catch(() => getAllGroups().then(setGroups));
  };

  const toggleFeatured = async (group: SmallGroup) => {
    const updated = await updateGroup(group.id, { is_featured: !group.is_featured });
    setGroups(prev => prev.map(g => g.id === group.id ? updated : g));
  };

  const toggleMembers = async (groupId: string) => {
    const next = new Set(expandedMembers);
    if (next.has(groupId)) { next.delete(groupId); setExpandedMembers(next); return; }
    next.add(groupId);
    setExpandedMembers(next);
    if (membersMap[groupId]) return;
    setLoadingMembers(prev => new Set(prev).add(groupId));
    const data = await getGroupMembers(groupId);
    setMembersMap(prev => ({ ...prev, [groupId]: data }));
    setLoadingMembers(prev => { const s = new Set(prev); s.delete(groupId); return s; });
  };

  const handleRemoveMember = async (groupId: string, userId: string) => {
    if (!window.confirm('Remove this member from the group?')) return;
    await removeGroupMember(groupId, userId);
    setMembersMap(prev => ({ ...prev, [groupId]: (prev[groupId] ?? []).filter(m => m.user_id !== userId) }));
  };

  if (!isLeader) return null;

  return (
    <div className="pt-32 pb-24 min-h-screen bg-church-cream">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-church-gold" />
            <h1 className="text-3xl font-serif font-bold text-church-earth-dark">Manage Small Groups</h1>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-church-gold hover:bg-church-gold-dark text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" /> Add Group
            </button>
          )}
        </div>

        {showForm && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-church-earth/10 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-church-earth-dark">{editingId ? 'Edit Group' : 'Add New Group'}</h2>
              <button onClick={cancelForm} className="text-church-earth-light hover:text-church-earth-dark"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-church-earth-light mb-1">Group Name</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-church-earth/20 focus:outline-none focus:ring-2 focus:ring-church-gold/50 bg-church-cream/30 text-church-earth-dark" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-church-earth-light mb-1">Category</label>
                  <input required type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-church-earth/20 focus:outline-none focus:ring-2 focus:ring-church-gold/50 bg-church-cream/30 text-church-earth-dark" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-church-earth-light mb-1">Leader Name</label>
                  <input required type="text" value={formData.leader} onChange={e => setFormData({...formData, leader: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-church-earth/20 focus:outline-none focus:ring-2 focus:ring-church-gold/50 bg-church-cream/30 text-church-earth-dark" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-church-earth-light mb-1">Schedule</label>
                  <input required type="text" value={formData.schedule} onChange={e => setFormData({...formData, schedule: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-church-earth/20 focus:outline-none focus:ring-2 focus:ring-church-gold/50 bg-church-cream/30 text-church-earth-dark" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-church-earth-light mb-1">Location</label>
                <input required type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-church-earth/20 focus:outline-none focus:ring-2 focus:ring-church-gold/50 bg-church-cream/30 text-church-earth-dark" />
              </div>
              <div>
                <label className="block text-sm font-medium text-church-earth-light mb-1">Description</label>
                <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-church-earth/20 focus:outline-none focus:ring-2 focus:ring-church-gold/50 bg-church-cream/30 text-church-earth-dark" rows={3}></textarea>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={cancelForm} className="px-4 py-2 text-church-earth-light hover:text-church-earth-dark">Cancel</button>
                <button type="submit" disabled={saving} className="bg-church-gold hover:bg-church-gold-dark text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />} {editingId ? 'Update Group' : 'Save Group'}
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-church-gold" /></div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {groups.map(group => (
              <div key={group.id} className="bg-white rounded-2xl shadow-sm border border-church-earth/10 overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="inline-block px-2 py-1 bg-church-cream text-church-earth-dark text-xs font-medium rounded-md mb-2 border border-church-earth/10">{group.category}</span>
                      <h3 className="font-bold text-xl text-church-earth-dark flex items-center gap-2">
                        {group.name}
                        {group.is_featured && <Star className="w-4 h-4 text-church-gold fill-church-gold" />}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleFeatured(group)}
                        className={`p-2 rounded-lg transition-colors ${group.is_featured ? 'text-church-gold hover:bg-church-gold/10' : 'text-church-earth-light hover:bg-church-cream hover:text-church-gold'}`}
                        title={group.is_featured ? 'Remove from Home' : 'Feature on Home'}
                      >
                        <Star className={`w-5 h-5 ${group.is_featured ? 'fill-church-gold' : ''}`} />
                      </button>
                      <button onClick={() => startEdit(group)} className="text-church-gold hover:text-church-gold-dark p-2 hover:bg-church-gold/10 rounded-lg transition-colors" title="Edit">
                        <Pencil className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleDelete(group.id)} className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-church-earth-light text-sm mb-4">{group.description}</p>
                  <div className="space-y-2 text-sm text-church-earth-dark">
                    <div className="flex items-center gap-2"><Users className="w-4 h-4 text-church-gold" /> Leader: {group.leader}</div>
                    <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-church-gold" /> {group.schedule}</div>
                    <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-church-gold" /> {group.location}</div>
                  </div>
                </div>

                {/* Members toggle button */}
                <button
                  onClick={() => toggleMembers(group.id)}
                  className="w-full flex items-center justify-between px-6 py-3 bg-church-cream/60 hover:bg-church-cream border-t border-church-earth/10 text-sm font-medium text-church-earth-dark transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-church-gold" />
                    Members {membersMap[group.id] ? `(${membersMap[group.id].length})` : ''}
                  </span>
                  {expandedMembers.has(group.id) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {/* Members list */}
                {expandedMembers.has(group.id) && (
                  <div className="border-t border-church-earth/10 px-6 py-4">
                    {loadingMembers.has(group.id) ? (
                      <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-church-gold" /></div>
                    ) : (membersMap[group.id] ?? []).length === 0 ? (
                      <p className="text-sm text-church-earth-light text-center py-3">No members have joined yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {(membersMap[group.id] ?? []).map(member => (
                          <div key={member.id} className="flex items-center justify-between gap-3 group/member">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-8 h-8 rounded-full bg-church-gold/20 flex items-center justify-center text-church-gold font-bold text-sm flex-shrink-0">
                                {member.profiles?.full_name?.[0]?.toUpperCase() ?? '?'}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-church-earth-dark truncate">{member.profiles?.full_name ?? 'Unknown'}</p>
                                <div className="flex items-center gap-3 text-xs text-church-earth-light">
                                  {member.profiles?.email && <span className="flex items-center gap-1 truncate"><Mail className="w-3 h-3" />{member.profiles.email}</span>}
                                  {member.profiles?.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{member.profiles.phone}</span>}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemoveMember(group.id, member.user_id)}
                              className="opacity-0 group-hover/member:opacity-100 transition-opacity text-red-400 hover:text-red-600 p-1 flex-shrink-0"
                              title="Remove from group"
                            >
                              <UserMinus className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            {groups.length === 0 && (
              <div className="col-span-2 text-center py-16 text-church-earth-light">No groups yet. Add the first one!</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

