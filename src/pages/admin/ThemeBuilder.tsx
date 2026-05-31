import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { Theme } from '../../lib/themes';
import { Check, Plus, Save } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function ThemeBuilder() {
  const { isLeader, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { activeTheme, themes, setActiveTheme, saveCustomTheme } = useTheme();
  const [editingTheme, setEditingTheme] = useState<Theme>(activeTheme);

  const handleColorChange = (key: keyof Theme['colors'], value: string) => {
    setEditingTheme(prev => ({
      ...prev,
      colors: { ...prev.colors, [key]: value }
    }));
  };

  const handleStyleChange = (key: keyof Theme['styles'], value: string) => {
    setEditingTheme(prev => ({
      ...prev,
      styles: { ...prev.styles, [key]: value }
    }));
  };

  const handleFontChange = (key: keyof Theme['fonts'], value: string) => {
    setEditingTheme(prev => ({
      ...prev,
      fonts: { ...prev.fonts, [key]: value }
    }));
  };

  const handleSave = async () => {
    const id = editingTheme.id.startsWith('custom-') ? editingTheme.id : `custom-${Date.now()}`;
    const newTheme = { ...editingTheme, id };
    await saveCustomTheme(newTheme);
  };

  useEffect(() => {
    if (!authLoading && !isLeader) {
      navigate('/');
    }
  }, [authLoading, isLeader, navigate]);

  if (authLoading || !isLeader) return null;

  return (
    <div className="pt-32 pb-24 min-h-screen bg-church-cream">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar - Theme List */}
          <div className="lg:w-1/4 bg-church-surface border border-church-earth/10 p-6 rounded-2xl shadow-sm h-fit">
            <h2 className="font-serif text-2xl font-semibold text-church-earth-dark mb-6">Themes</h2>
            <div className="space-y-3">
              {themes.map(theme => (
                <button
                  key={theme.id}
                  onClick={() => {
                    setActiveTheme(theme);
                    setEditingTheme(theme);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center justify-between transition-colors ${
                    activeTheme.id === theme.id 
                      ? 'bg-church-gold/10 text-church-gold font-medium' 
                      : 'hover:bg-church-earth/5 text-church-earth-dark'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full border border-church-earth/10" 
                      style={{ backgroundColor: theme.colors.primary }}
                    />
                    {theme.name}
                  </div>
                  {activeTheme.id === theme.id && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
            <button 
              onClick={() => setEditingTheme({
                ...activeTheme,
                id: `custom-${Date.now()}`,
                name: 'New Custom Theme'
              })}
              className="w-full mt-6 flex items-center justify-center gap-2 border-2 border-dashed border-church-earth/20 text-church-earth-light hover:text-church-gold hover:border-church-gold px-4 py-3 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" /> Create New
            </button>
          </div>

          {/* Main Panel - Builder */}
          <div className="lg:w-3/4 space-y-8">
            <div className="bg-church-surface border border-church-earth/10 p-8 rounded-2xl shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <div className="flex-1 mr-6">
                  <label className="block text-sm text-church-earth-light mb-1">Theme Name</label>
                  <input
                    type="text"
                    value={editingTheme.name}
                    onChange={e => setEditingTheme(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg border border-church-earth/20 bg-church-cream text-church-earth-dark font-serif text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-church-gold/50"
                    placeholder="Theme name"
                  />
                </div>
                <button
                  onClick={handleSave}
                  className="bg-church-gold hover:bg-church-gold-dark text-white px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 shrink-0"
                >
                  <Save className="w-4 h-4" /> Save Theme
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-10">
                {/* Colors */}
                <div className="space-y-6">
                  <h3 className="font-medium text-church-earth-dark border-b border-church-earth/10 pb-2">Colors</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-church-earth-light mb-1">Primary</label>
                      <div className="flex items-center gap-3">
                        <input 
                          type="color" 
                          value={editingTheme.colors.primary} 
                          onChange={(e) => handleColorChange('primary', e.target.value)}
                          className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                        />
                        <span className="text-sm font-mono text-church-earth-dark">{editingTheme.colors.primary}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-church-earth-light mb-1">Background</label>
                      <div className="flex items-center gap-3">
                        <input 
                          type="color" 
                          value={editingTheme.colors.background} 
                          onChange={(e) => handleColorChange('background', e.target.value)}
                          className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                        />
                        <span className="text-sm font-mono text-church-earth-dark">{editingTheme.colors.background}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-church-earth-light mb-1">Text</label>
                      <div className="flex items-center gap-3">
                        <input 
                          type="color" 
                          value={editingTheme.colors.text} 
                          onChange={(e) => handleColorChange('text', e.target.value)}
                          className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                        />
                        <span className="text-sm font-mono text-church-earth-dark">{editingTheme.colors.text}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-church-earth-light mb-1">Surface</label>
                      <div className="flex items-center gap-3">
                        <input 
                          type="color" 
                          value={editingTheme.colors.surface} 
                          onChange={(e) => handleColorChange('surface', e.target.value)}
                          className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                        />
                        <span className="text-sm font-mono text-church-earth-dark">{editingTheme.colors.surface}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Typography & Styles */}
                <div className="space-y-6">
                  <h3 className="font-medium text-church-earth-dark border-b border-church-earth/10 pb-2">Typography & Styles</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-church-earth-light mb-1">Heading Font</label>
                      <select 
                        value={editingTheme.fonts.serif}
                        onChange={(e) => handleFontChange('serif', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-church-earth/20 bg-church-cream text-church-earth-dark focus:outline-none focus:ring-2 focus:ring-church-gold/50"
                      >
                        <option value="Playfair Display">Playfair Display</option>
                        <option value="Cinzel">Cinzel</option>
                        <option value="Inter">Inter</option>
                        <option value="Space Grotesk">Space Grotesk</option>
                      </select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-church-earth-light mb-1">Button Style</label>
                        <select 
                          value={editingTheme.styles.buttonStyle}
                          onChange={(e) => handleStyleChange('buttonStyle', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-church-earth/20 bg-church-cream text-church-earth-dark focus:outline-none focus:ring-2 focus:ring-church-gold/50"
                        >
                          <option value="rounded">Rounded</option>
                          <option value="sharp">Sharp</option>
                          <option value="glow">Glow</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-church-earth-light mb-1">Background</label>
                        <select 
                          value={editingTheme.styles.backgroundStyle}
                          onChange={(e) => handleStyleChange('backgroundStyle', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-church-earth/20 bg-church-cream text-church-earth-dark focus:outline-none focus:ring-2 focus:ring-church-gold/50"
                        >
                          <option value="solid">Solid</option>
                          <option value="gradient">Gradient</option>
                          <option value="image">Image</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end">
                <button 
                  onClick={() => setActiveTheme(editingTheme)}
                  className="text-church-gold hover:text-church-gold-dark font-medium px-4 py-2 transition-colors"
                >
                  Apply to Preview
                </button>
              </div>
            </div>

            {/* Live Preview */}
            <div className="bg-church-surface p-8 rounded-2xl shadow-sm border border-church-earth/5">
              <h3 className="font-medium text-church-earth-dark mb-6">Live Preview</h3>
              
              <div className="space-y-6 max-w-2xl">
                <h1 className="font-serif text-4xl font-bold text-church-earth-dark">
                  Welcome to <span className="text-church-gold">Jesus Church</span>
                </h1>
                <p className="text-church-earth-light text-lg">
                  This is a preview of how your typography and colors will look. The background and buttons will update immediately when you click "Apply to Preview".
                </p>
                <div className="flex gap-4">
                  <button className="bg-church-gold text-white px-6 py-3 btn-theme font-medium">
                    Primary Button
                  </button>
                  <button className="bg-transparent border border-church-earth/20 text-church-earth-dark px-6 py-3 btn-theme font-medium">
                    Secondary Button
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-6">
                  <div className="bg-church-cream border border-church-earth/10 p-6 rounded-xl shadow-sm">
                    <h4 className="font-serif text-xl font-semibold text-church-earth-dark mb-2">Card Title</h4>
                    <p className="text-church-earth-light text-sm">Cards use the surface color and text colors defined in your theme.</p>
                  </div>
                  <div className="bg-church-gold/10 p-6 rounded-xl border border-church-gold/20">
                    <h4 className="font-serif text-xl font-semibold text-church-gold mb-2">Accent Card</h4>
                    <p className="text-church-earth-dark text-sm">This card uses the primary color with low opacity for the background.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
