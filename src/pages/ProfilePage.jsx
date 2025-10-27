import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { 
  User, 
  Mail, 
  MapPin, 
  Settings, 
  Bell, 
  Moon, 
  Sun,
  Globe,
  Save,
  Edit,
  LogOut,
  Shield,
  BarChart3
} from 'lucide-react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import ImageUpload from '../components/ImageUpload';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    location: '',
    profileImage: '',
    preferences: {
      language: 'pt-BR',
      notifications: true,
      darkMode: false
    }
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.displayName || user.name || '',
        email: user.email || '',
        location: user.location || '',
        profileImage: user.profileImage || '',
        preferences: {
          language: user.preferences?.language || 'pt-BR',
          notifications: user.preferences?.notifications !== false,
          darkMode: user.preferences?.darkMode || false
        }
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('preferences.')) {
      const prefKey = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [prefKey]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Atualizar dados no Firestore
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        name: formData.name,
        location: formData.location,
        preferences: formData.preferences,
        updatedAt: new Date().toISOString()
      });

      toast.success('Perfil atualizado com sucesso!');
      setEditing(false);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast.error('Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Tem certeza que deseja sair?')) {
      logout();
    }
  };

  const getLanguageName = (code) => {
    const languages = {
      'pt-BR': 'Português (Brasil)',
      'en-US': 'English (US)',
      'es-ES': 'Español'
    };
    return languages[code] || code;
  };

  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center">
            <User className="w-8 h-8 mr-3 text-blue-600" />
            Meu Perfil
          </h1>
          <p className="text-muted-foreground">
            Gerencie suas informações pessoais e preferências
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="agro-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground flex items-center">
                  <User className="w-5 h-5 mr-2 text-blue-600" />
                  Informações Pessoais
                </h2>
                <button
                  onClick={() => setEditing(!editing)}
                  className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  {editing ? 'Cancelar' : 'Editar'}
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={!editing}
                    className="agro-input disabled:bg-muted disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="agro-input disabled:bg-muted disabled:cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    O e-mail não pode ser alterado
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Localização
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    disabled={!editing}
                    className="agro-input disabled:bg-muted disabled:cursor-not-allowed"
                    placeholder="Cidade, Estado"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Foto de Perfil
                  </label>
                  <ImageUpload
                    onImageUpload={(url) => setFormData(prev => ({ ...prev, profileImage: url }))}
                    currentImage={formData.profileImage}
                    placeholder="Clique para adicionar uma foto de perfil"
                    className="w-32 h-32 mx-auto"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Tipo de Usuário
                  </label>
                  <div className="flex items-center p-3 bg-muted rounded-md">
                    <Shield className="w-5 h-5 text-purple-600 mr-2" />
                    <span className="font-medium">
                      {user?.type === 'producer' ? 'Produtor' : 'Consumidor'}
                    </span>
                  </div>
                </div>
              </div>

              {editing && (
                <div className="flex justify-end mt-6">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="agro-button-primary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Salvar Alterações
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Preferences */}
            <div className="agro-card p-6">
              <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center">
                <Settings className="w-5 h-5 mr-2 text-green-600" />
                Preferências
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Idioma
                  </label>
                  <select
                    name="preferences.language"
                    value={formData.preferences.language}
                    onChange={handleInputChange}
                    className="agro-input"
                  >
                    <option value="pt-BR">Português (Brasil)</option>
                    <option value="en-US">English (US)</option>
                    <option value="es-ES">Español</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Bell className="w-5 h-5 text-blue-600 mr-3" />
                    <div>
                      <p className="font-medium text-foreground">Notificações</p>
                      <p className="text-sm text-muted-foreground">
                        Receber notificações sobre produtos e atualizações
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="preferences.notifications"
                      checked={formData.preferences.notifications}
                      onChange={handleInputChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Moon className="w-5 h-5 text-purple-600 mr-3" />
                    <div>
                      <p className="font-medium text-foreground">Modo Escuro</p>
                      <p className="text-sm text-muted-foreground">
                        Usar tema escuro na interface
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={darkMode}
                      onChange={toggleDarkMode}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Stats */}
            <div className="agro-card p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
                Estatísticas
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Produtos Rastreados</span>
                  <span className="font-semibold">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avaliações Feitas</span>
                  <span className="font-semibold">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Membro desde</span>
                  <span className="font-semibold">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Account Actions */}
            <div className="agro-card p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Conta
              </h3>
              <div className="space-y-3">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair da Conta
                </button>
              </div>
            </div>

            {/* Quick Links */}
            <div className="agro-card p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Links Rápidos
              </h3>
              <div className="space-y-2">
                <a
                  href="/scan"
                  className="block w-full text-left px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                >
                  Escanear QR Code
                </a>
                <a
                  href="/history"
                  className="block w-full text-left px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                >
                  Ver Histórico
                </a>
                {user?.type === 'producer' && (
                  <>
                    <a
                      href="/add-product"
                      className="block w-full text-left px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    >
                      Adicionar Produto
                    </a>
                    <a
                      href="/stock"
                      className="block w-full text-left px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    >
                      Gerenciar Estoque
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
