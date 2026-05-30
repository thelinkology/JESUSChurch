import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Sermons } from './pages/Sermons';
import { Events } from './pages/Events';
import { Ministries } from './pages/Ministries';
import { MinistryDetail } from './pages/MinistryDetail';
import { Give } from './pages/Give';
import { Contact } from './pages/Contact';
import { Prayers } from './pages/Prayers';
import { ThemeBuilder } from './pages/admin/ThemeBuilder';
import { SermonsAdmin } from './pages/admin/SermonsAdmin';
import { EventsAdmin } from './pages/admin/EventsAdmin';
import { PrayersAdmin } from './pages/admin/PrayersAdmin';
import { GivingAdmin } from './pages/admin/GivingAdmin';
import { GroupsAdmin } from './pages/admin/GroupsAdmin';
import { VolunteerAdmin } from './pages/admin/VolunteerAdmin';
import { Live } from './pages/Live';
import { Growth } from './pages/Growth';
import { Groups } from './pages/Groups';
import { Volunteer } from './pages/Volunteer';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { AuthCallback } from './pages/auth/AuthCallback';
import { Profile } from './pages/Profile';
import { Dashboard } from './pages/admin/Dashboard';
import { ContentAdmin } from './pages/admin/ContentAdmin';

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="about" element={<About />} />
              <Route path="sermons" element={<Sermons />} />
              <Route path="events" element={<Events />} />
              <Route path="ministries" element={<Ministries />} />
              <Route path="ministries/:id" element={<MinistryDetail />} />
              <Route path="give" element={<Give />} />
              <Route path="contact" element={<Contact />} />
              <Route path="prayers" element={<Prayers />} />
              <Route path="live" element={<Live />} />
              <Route path="growth" element={<Growth />} />
              <Route path="groups" element={<Groups />} />
              <Route path="volunteer" element={<Volunteer />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="auth/callback" element={<AuthCallback />} />
              <Route path="profile" element={<Profile />} />
              <Route path="admin" element={<Dashboard />} />
              <Route path="admin/themes" element={<ThemeBuilder />} />
              <Route path="admin/sermons" element={<SermonsAdmin />} />
              <Route path="admin/events" element={<EventsAdmin />} />
              <Route path="admin/prayers" element={<PrayersAdmin />} />
              <Route path="admin/giving" element={<GivingAdmin />} />
              <Route path="admin/groups" element={<GroupsAdmin />} />
              <Route path="admin/volunteer" element={<VolunteerAdmin />} />
              <Route path="admin/content" element={<ContentAdmin />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}
