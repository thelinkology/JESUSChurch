import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Clock, CheckCircle2, UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { VolunteerRole, getVolunteerRoles, applyToVolunteer, getUserApplicationRoleIds } from '../lib/volunteerStore';

export function Volunteer() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<VolunteerRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [signedUpRoles, setSignedUpRoles] = useState<string[]>([]);
  const [applying, setApplying] = useState<string | null>(null);

  useEffect(() => {
    getVolunteerRoles()
      .then(setRoles)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (user) {
      getUserApplicationRoleIds(user.id).then(setSignedUpRoles).catch(() => {});
    } else {
      setSignedUpRoles([]);
    }
  }, [user]);

  const handleSignUp = async (roleId: string) => {
    if (!user) {
      alert('Please login to sign up to volunteer.');
      return;
    }
    setApplying(roleId);
    try {
      await applyToVolunteer({
        role_id: roleId,
        user_id: user.id,
        name: user.full_name || user.email,
        email: user.email,
      });
      setSignedUpRoles(prev => [...prev, roleId]);
    } catch (err) {
      console.error('Failed to apply:', err);
    } finally {
      setApplying(null);
    }
  };

  return (
    <main className="pt-32 pb-24 bg-church-cream  min-h-screen">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto text-center mb-16"
        >
          <span className="text-church-gold font-medium tracking-wider uppercase text-sm">Serve</span>
          <h1 className="font-serif text-5xl md:text-6xl font-bold text-church-earth-dark  mt-4 mb-6">
            Join the Dream Team
          </h1>
          <p className="text-xl text-church-earth-light  leading-relaxed">
            God has given each of us unique gifts and abilities. Discover how you can use yours to make a difference.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-3xl p-8 animate-pulse border border-church-earth/5">
                <div className="h-4 bg-church-earth/10 rounded w-1/4 mb-3" />
                <div className="h-6 bg-church-earth/10 rounded w-2/3 mb-4" />
                <div className="h-4 bg-church-earth/10 rounded w-full mb-2" />
                <div className="h-4 bg-church-earth/10 rounded w-4/5 mb-8" />
                <div className="h-16 bg-church-earth/10 rounded mb-8" />
                <div className="h-12 bg-church-earth/10 rounded" />
              </div>
            ))
          ) : roles.length === 0 ? (
            <div className="col-span-full text-center py-16 text-church-earth-light ">
              No volunteer opportunities available yet. Check back soon!
            </div>
          ) : (
            roles.map((role, i) => (
            <motion.div 
              key={role.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white  p-8 rounded-3xl shadow-sm hover:shadow-md transition-all border border-church-earth/5  flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="inline-block px-3 py-1 bg-church-cream  text-church-earth-dark  text-xs font-medium rounded-full mb-3">
                    {role.department}
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-church-earth-dark ">{role.title}</h3>
                </div>
              </div>
              
              <p className="text-church-earth-light  mb-6 flex-grow">{role.description}</p>
              
              <div className="space-y-3 mb-8 bg-church-cream/30  p-4 rounded-xl border border-church-earth/5 ">
                <div className="flex items-center gap-3 text-sm text-church-earth-dark ">
                  <Clock className="w-4 h-4 text-church-gold" />
                  <span className="font-medium">Commitment:</span> {role.schedule}
                </div>
              </div>

              {signedUpRoles.includes(role.id) ? (
                <button disabled className="w-full bg-green-50  text-green-700  py-3 rounded-xl font-medium border border-green-200  flex items-center justify-center gap-2 transition-colors">
                  <CheckCircle2 className="w-5 h-5" /> Signed Up
                </button>
              ) : (
                <button 
                  onClick={() => handleSignUp(role.id)}
                  disabled={applying === role.id}
                  className="w-full bg-church-gold hover:bg-church-gold-dark text-white py-3 rounded-xl font-medium transition-all hover:shadow-md hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <UserPlus className="w-5 h-5" /> {applying === role.id ? 'Signing up...' : 'Sign Up'}
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
