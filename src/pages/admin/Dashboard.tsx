import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import { getAllProfiles, updateUserRole, UserProfile, UserRole } from '../../lib/authStore';
import { Shield, User, Users, Calendar, Video, Palette, Heart, DollarSign, FileText, Loader2, Church } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export function Dashboard() {
  const { user, isAdmin, isLeader, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !isLeader) navigate('/');
  }, [authLoading, isLeader, navigate]);

  useEffect(() => {
    if (isLeader) loadUsers();
  }, [isLeader]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllProfiles();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    if (!isAdmin) return; // Only admins can change roles
    const success = await updateUserRole(userId, newRole);
    if (success) {
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    }
  };

  if (authLoading) return (
    <div className="pt-32 pb-24 min-h-screen bg-church-cream flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-church-gold" />
    </div>
  );
  if (!isLeader) return null;

  return (
    <div className="pt-32 pb-24 bg-church-cream min-h-screen">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          <div className="mb-10">
            <h1 className="font-serif text-4xl font-bold text-church-earth-dark mb-2">Admin Dashboard</h1>
            <p className="text-church-earth-light">Manage users and church content</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Link to="/admin/sermons" className="bg-church-surface p-6 rounded-2xl shadow-sm border border-church-earth/5 hover:shadow-md transition-shadow flex items-center gap-4 group">
              <div className="w-12 h-12 bg-church-gold/10 rounded-xl flex items-center justify-center text-church-gold group-hover:scale-110 transition-transform">
                <Video className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-church-earth-dark">Manage Sermons</h3>
                <p className="text-sm text-church-earth-light">Add or edit messages</p>
              </div>
            </Link>
            
            <Link to="/admin/events" className="bg-church-surface p-6 rounded-2xl shadow-sm border border-church-earth/5 hover:shadow-md transition-shadow flex items-center gap-4 group">
              <div className="w-12 h-12 bg-church-gold/10 rounded-xl flex items-center justify-center text-church-gold group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-church-earth-dark">Manage Events</h3>
                <p className="text-sm text-church-earth-light">Update church calendar</p>
              </div>
            </Link>

            <Link to="/admin/prayers" className="bg-church-surface p-6 rounded-2xl shadow-sm border border-church-earth/5 hover:shadow-md transition-shadow flex items-center gap-4 group">
              <div className="w-12 h-12 bg-church-gold/10 rounded-xl flex items-center justify-center text-church-gold group-hover:scale-110 transition-transform">
                <Heart className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-church-earth-dark">Manage Prayers</h3>
                <p className="text-sm text-church-earth-light">Review prayer requests</p>
              </div>
            </Link>

            <Link to="/admin/giving" className="bg-church-surface p-6 rounded-2xl shadow-sm border border-church-earth/5 hover:shadow-md transition-shadow flex items-center gap-4 group">
              <div className="w-12 h-12 bg-church-gold/10 rounded-xl flex items-center justify-center text-church-gold group-hover:scale-110 transition-transform">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-church-earth-dark">Giving Reports</h3>
                <p className="text-sm text-church-earth-light">View donation history</p>
              </div>
            </Link>

            <Link to="/admin/groups" className="bg-church-surface p-6 rounded-2xl shadow-sm border border-church-earth/5 hover:shadow-md transition-shadow flex items-center gap-4 group">
              <div className="w-12 h-12 bg-church-gold/10 rounded-xl flex items-center justify-center text-church-gold group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-church-earth-dark">Manage Groups</h3>
                <p className="text-sm text-church-earth-light">Small groups & leaders</p>
              </div>
            </Link>

            <Link to="/admin/volunteer" className="bg-church-surface p-6 rounded-2xl shadow-sm border border-church-earth/5 hover:shadow-md transition-shadow flex items-center gap-4 group">
              <div className="w-12 h-12 bg-church-gold/10 rounded-xl flex items-center justify-center text-church-gold group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-church-earth-dark">Volunteer Roles</h3>
                <p className="text-sm text-church-earth-light">Manage serving opportunities</p>
              </div>
            </Link>
            
            <Link to="/admin/themes" className="bg-church-surface p-6 rounded-2xl shadow-sm border border-church-earth/5 hover:shadow-md transition-shadow flex items-center gap-4 group">
              <div className="w-12 h-12 bg-church-gold/10 rounded-xl flex items-center justify-center text-church-gold group-hover:scale-110 transition-transform">
                <Palette className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-church-earth-dark">Theme Builder</h3>
                <p className="text-sm text-church-earth-light">Customize appearance</p>
              </div>
            </Link>
            <Link to="/admin/content?tab=ministries" className="bg-church-surface p-6 rounded-2xl shadow-sm border border-church-earth/5 hover:shadow-md transition-shadow flex items-center gap-4 group">
              <div className="w-12 h-12 bg-church-gold/10 rounded-xl flex items-center justify-center text-church-gold group-hover:scale-110 transition-transform">
                <Church className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-church-earth-dark">Manage Ministries</h3>
                <p className="text-sm text-church-earth-light">Edit ministry pages &amp; goals</p>
              </div>
            </Link>
            <Link to="/admin/content" className="bg-church-surface p-6 rounded-2xl shadow-sm border border-church-earth/5 hover:shadow-md transition-shadow flex items-center gap-4 group">
              <div className="w-12 h-12 bg-church-gold/10 rounded-xl flex items-center justify-center text-church-gold group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-church-earth-dark">Content & Settings</h3>
                <p className="text-sm text-church-earth-light">Vision, mission, leadership</p>
              </div>
            </Link>
          </div>

          {isAdmin && (
            <div className="bg-church-surface rounded-3xl shadow-sm border border-church-earth/5 overflow-hidden">
              <div className="p-6 border-b border-church-earth/10 flex justify-between items-center bg-church-cream/30">
                <h2 className="font-serif text-2xl font-bold text-church-earth-dark flex items-center gap-2">
                  <Users className="w-6 h-6 text-church-gold" />
                  User Management
                </h2>
              </div>
              
              <div className="p-6 overflow-x-auto">
                {loading ? (
                  <div className="text-center py-8 text-church-earth-light">Loading users...</div>
                ) : (
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="border-b border-church-earth/10 text-church-earth-light text-sm uppercase tracking-wider">
                        <th className="pb-4 font-medium">User</th>
                        <th className="pb-4 font-medium">Email</th>
                        <th className="pb-4 font-medium">Role</th>
                        <th className="pb-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u.id} className="border-b border-church-earth/5 last:border-0 hover:bg-church-cream/20 transition-colors">
                          <td className="py-4 flex items-center gap-3">
                            <div className="w-8 h-8 bg-church-earth/10 rounded-full flex items-center justify-center text-church-earth-dark">
                              <User className="w-4 h-4" />
                            </div>
                            <span className="font-medium text-church-earth-dark">{u.full_name}</span>
                          </td>
                          <td className="py-4 text-church-earth-light">{u.email}</td>
                          <td className="py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                              u.role === 'Admin' ? 'bg-red-50 text-red-700 border-red-200' :
                              u.role === 'Leader' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                              u.role === 'Member' ? 'bg-green-50 text-green-700 border-green-200' :
                              'bg-gray-50 text-gray-700 border-gray-200'
                            }`}>
                              <Shield className="w-3 h-3" />
                              {u.role}
                            </span>
                          </td>
                          <td className="py-4">
                            <select 
                              value={u.role}
                              onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                              disabled={u.id === user?.id} // Can't change own role
                              className="text-sm border border-church-earth/20 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-church-gold/50 disabled:opacity-50 bg-church-surface text-church-earth-dark"
                            >
                              <option value="Visitor">Visitor</option>
                              <option value="Member">Member</option>
                              <option value="Leader">Leader</option>
                              <option value="Admin">Admin</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
