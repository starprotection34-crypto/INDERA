import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase';
import { Auth } from './components/Auth';
import ErrorBoundary from './components/ErrorBoundary';
import { Toaster } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, User as UserIcon, Settings, Bell, Search, Menu, LogOut } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
          <p className="text-gray-500 font-medium animate-pulse">Initializing Secure Session...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#F8F9FA] text-gray-900 font-sans">
        <Toaster position="top-center" richColors />
        
        {/* Navigation */}
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-white shadow-lg shadow-gray-200">
                <Shield size={24} />
              </div>
              <span className="text-xl font-bold tracking-tight">SecureAuth</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-500">
              <a href="#" className="hover:text-gray-900 transition-colors">Dashboard</a>
              <a href="#" className="hover:text-gray-900 transition-colors">Security</a>
              <a href="#" className="hover:text-gray-900 transition-colors">Activity</a>
              <a href="#" className="hover:text-gray-900 transition-colors">Support</a>
            </div>

            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
                <Search size={20} />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-900 transition-colors relative">
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
              </button>
              {user && (
                <button 
                  onClick={() => auth.signOut()}
                  className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-all"
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              )}
              <button className="md:hidden p-2 text-gray-400 hover:text-gray-900 transition-colors">
                <Menu size={20} />
              </button>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-6 py-12">
          <AnimatePresence mode="wait">
            {!user ? (
              <motion.div
                key="auth"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="flex flex-col items-center justify-center min-h-[60vh]"
              >
                <Auth />
              </motion.div>
            ) : (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="space-y-8"
              >
                {/* Welcome Header */}
                <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="space-y-4 text-center md:text-left flex-1">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                      Account Verified
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
                      Welcome back, <span className="text-gray-500">{user.displayName || user.email?.split('@')[0] || 'Security Expert'}</span>
                    </h1>
                    <p className="text-lg text-gray-500 max-w-xl">
                      Your security dashboard is ready. All systems are operational and your data is protected by industry-standard encryption.
                    </p>
                  </div>
                  <div className="hidden md:block">
                    <div className="w-24 h-24 bg-gray-900 rounded-3xl flex items-center justify-center text-white shadow-2xl rotate-3">
                      <Shield size={48} />
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { label: 'Security Score', value: '98%', icon: Shield, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Active Sessions', value: '3', icon: UserIcon, color: 'text-purple-600', bg: 'bg-purple-50' },
                    { label: 'Last Login', value: '2m ago', icon: Settings, color: 'text-orange-600', bg: 'bg-orange-50' },
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 ${stat.bg} ${stat.color} rounded-2xl group-hover:scale-110 transition-transform`}>
                          <stat.icon size={24} />
                        </div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Live</span>
                      </div>
                      <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
                      <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                      <Settings size={20} className="text-gray-400" />
                      Security Settings
                    </h3>
                    <div className="space-y-4">
                      {[
                        { title: 'Two-Factor Authentication', status: 'Enabled', enabled: true },
                        { title: 'Biometric Login', status: 'Disabled', enabled: false },
                        { title: 'Login Notifications', status: 'Enabled', enabled: true },
                        { title: 'API Access Keys', status: 'Restricted', enabled: true },
                      ].map((item) => (
                        <div key={item.title} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                          <span className="font-medium text-gray-700">{item.title}</span>
                          <span className={`text-xs font-bold px-3 py-1 rounded-full ${item.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                            {item.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-900 rounded-[2rem] p-8 text-white shadow-xl shadow-gray-200 relative overflow-hidden">
                    <div className="relative z-10">
                      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Shield size={20} className="text-gray-400" />
                        System Status
                      </h3>
                      <div className="space-y-6">
                        <div className="p-6 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
                          <p className="text-sm text-gray-400 mb-2">Encryption Protocol</p>
                          <p className="text-2xl font-mono font-bold">AES-256-GCM</p>
                        </div>
                        <div className="p-6 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
                          <p className="text-sm text-gray-400 mb-2">Database Connection</p>
                          <p className="text-2xl font-mono font-bold text-green-400">SECURE_ESTABLISHED</p>
                        </div>
                      </div>
                    </div>
                    {/* Decorative elements */}
                    <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-blue-500/20 rounded-full blur-[80px]" />
                    <div className="absolute bottom-[-20%] left-[-10%] w-64 h-64 bg-purple-500/20 rounded-full blur-[80px]" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-gray-100">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-sm text-gray-400">© 2026 SecureAuth Inc. All rights reserved.</p>
            <div className="flex items-center gap-8 text-sm font-medium text-gray-400">
              <a href="#" className="hover:text-gray-900 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-gray-900 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-gray-900 transition-colors">Cookie Policy</a>
            </div>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
};

export default App;
