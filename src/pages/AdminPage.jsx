import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Lock, LogOut, Settings, Image, MessageSquare, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AdminGraffitiList from '@/components/AdminGraffitiList';
import AdminSettings from '@/components/AdminSettings';
import { useToast } from '@/components/ui/use-toast';
import { getAllGraffittis } from '@/lib/api';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const AdminPage = () => {
  const { user, signIn, signOut, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [graffittis, setGraffittis] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadGraffittis = useCallback(async () => {
    if(!user) return;
    setLoading(true);
    const data = await getAllGraffittis();
    setGraffittis(data);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadGraffittis();
  }, [loadGraffittis]);


  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (!error) {
      toast({
        title: "✅ Acceso concedido",
        description: "Bienvenido al panel de administración",
      });
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  const pendingGraffittis = graffittis.filter(g => !g.approved);
  const approvedGraffittis = graffittis.filter(g => g.approved);
  
  if (authLoading) {
     return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="w-12 h-12 animate-spin text-violet-400" />
        </div>
     )
  }

  if (!user) {
    return (
      <>
        <Helmet>
          <title>Admin - Graffittis en Ramallo</title>
          <meta name="description" content="Panel de administración" />
        </Helmet>
        
        <div className="min-h-screen flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900/80 backdrop-blur-lg border border-gray-700 rounded-2xl p-8 w-full max-w-md neon-glow"
          >
            <div className="flex items-center justify-center mb-6">
              <Lock className="w-12 h-12 text-violet-400" />
            </div>
            
            <h1 className="text-3xl font-bold text-center mb-2">Panel Admin</h1>
            <p className="text-gray-400 text-center mb-8">Ingresá tus credenciales</p>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-800 border-gray-700 mt-2"
                  placeholder="admin@example.com"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-gray-800 border-gray-700 mt-2"
                  placeholder="••••••••"
                  required
                />
              </div>
              
              <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Ingresar'}
              </Button>
            </form>
          </motion.div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Panel de Administración - Graffittis en Ramallo</title>
        <meta name="description" content="Gestión de publicaciones y configuración" />
      </Helmet>
      
      <div className="min-h-screen pb-20">
        <div className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-800">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold">Panel de Administración</h1>
            <Button onClick={handleLogout} variant="outline" className="border-gray-700">
              <LogOut className="w-4 h-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="flex gap-4 mb-8 flex-wrap">
            <Button
              onClick={() => setActiveTab('pending')}
              variant={activeTab === 'pending' ? 'default' : 'outline'}
              className={activeTab === 'pending' ? 'bg-violet-600' : 'border-gray-700'}
            >
              <Image className="w-4 h-4 mr-2" />
              Pendientes ({pendingGraffittis.length})
            </Button>
            
            <Button
              onClick={() => setActiveTab('approved')}
              variant={activeTab === 'approved' ? 'default' : 'outline'}
              className={activeTab === 'approved' ? 'bg-violet-600' : 'border-gray-700'}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Aprobados ({approvedGraffittis.length})
            </Button>
            
            <Button
              onClick={() => setActiveTab('settings')}
              variant={activeTab === 'settings' ? 'default' : 'outline'}
              className={activeTab === 'settings' ? 'bg-violet-600' : 'border-gray-700'}
            >
              <Settings className="w-4 h-4 mr-2" />
              Configuración
            </Button>
          </div>
          
           {loading ? (
             <div className="flex justify-center items-center py-12">
               <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
             </div>
           ) : (
            <>
              {activeTab === 'pending' && (
                <AdminGraffitiList 
                  graffittis={pendingGraffittis} 
                  onUpdate={loadGraffittis}
                  title="Publicaciones Pendientes"
                />
              )}
              
              {activeTab === 'approved' && (
                <AdminGraffitiList 
                  graffittis={approvedGraffittis} 
                  onUpdate={loadGraffittis}
                  title="Publicaciones Aprobadas"
                />
              )}
              
              {activeTab === 'settings' && <AdminSettings />}
            </>
           )}
        </div>
      </div>
    </>
  );
};

export default AdminPage;