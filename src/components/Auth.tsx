import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  updateProfile 
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, OperationType, handleFirestoreError } from '../firebase';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, UserPlus, LogOut, Mail, Lock, User, Loader2 } from 'lucide-react';

const authSchema = z.object({
  email: z.string().min(1, 'ID or Email is required'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
  displayName: z.string().min(2, 'Name must be at least 2 characters').optional(),
});

type AuthFormData = z.infer<typeof authSchema>;

export const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
  });

  const onSubmit = async (data: AuthFormData) => {
    setLoading(true);
    try {
      if (isLogin) {
        // Try backend login first for special IDs like ADMIN
        if (data.email === 'ADMIN') {
          const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: data.email, password: data.password }),
          });
          const result = await response.json();
          if (result.success) {
            // For demo purposes, we'll use a special flag or just toast
            // In a real app, we'd use a custom token or manage state differently
            // But since App.tsx uses onAuthStateChanged, we should ideally
            // use Firebase if we want the dashboard to show up.
            // Let's try to sign in anonymously if backend succeeds
            const { signInAnonymously, updateProfile: updateFirebaseProfile } = await import('firebase/auth');
            const userCredential = await signInAnonymously(auth);
            await updateFirebaseProfile(userCredential.user, { 
              displayName: 'Administrator' 
            });
            toast.success('Admin Login Successful!');
            return;
          } else {
            throw new Error(result.message || 'Invalid credentials');
          }
        }

        // Regular Firebase Login
        await signInWithEmailAndPassword(auth, data.email, data.password);
        toast.success('Welcome back!');
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
        const user = userCredential.user;

        if (data.displayName) {
          await updateProfile(user, { displayName: data.displayName });
        }

        // Create user profile in Firestore
        const userRef = doc(db, 'users', user.uid);
        try {
          await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: data.displayName || null,
            photoURL: user.photoURL || null,
            createdAt: serverTimestamp(),
          });
        } catch (error) {
          console.error('Firestore error during signup:', error);
          // Don't fail the whole auth if firestore fails
        }

        toast.success('Account created successfully!');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast.error(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast.success('Signed out successfully');
    } catch (error: any) {
      toast.error('Failed to sign out');
    }
  };

  if (auth.currentUser) {
    return (
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-200">
        <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-white font-bold shadow-sm">
          {auth.currentUser.displayName?.[0] || auth.currentUser.email?.[0]?.toUpperCase() || 'U'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">{auth.currentUser.displayName || 'User'}</p>
          <p className="text-xs text-gray-500 truncate">{auth.currentUser.email || 'Anonymous Session'}</p>
        </div>
        <button
          onClick={handleSignOut}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
          title="Sign Out"
        >
          <LogOut size={20} />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full mx-auto bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="text-gray-500">
          {isLogin ? 'Enter your details to access your account' : 'Join us and start your journey today'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <AnimatePresence mode="wait">
          {!isLogin && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-1"
            >
              <label className="text-sm font-medium text-gray-700 ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  {...register('displayName')}
                  type="text"
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all outline-none"
                />
              </div>
              {errors.displayName && (
                <p className="text-xs text-red-500 ml-1">{errors.displayName.message}</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700 ml-1">Email or ID</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              {...register('email')}
              type="text"
              placeholder="name@example.com or ADMIN"
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all outline-none"
            />
          </div>
          {errors.email && (
            <p className="text-xs text-red-500 ml-1">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700 ml-1">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              {...register('password')}
              type="password"
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all outline-none"
            />
          </div>
          {errors.password && (
            <p className="text-xs text-red-500 ml-1">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : isLogin ? (
            <>
              <LogIn size={20} />
              Sign In
            </>
          ) : (
            <>
              <UserPlus size={20} />
              Create Account
            </>
          )}
        </button>
      </form>

      <div className="mt-8 text-center">
        <button
          onClick={() => {
            setIsLogin(!isLogin);
            reset();
          }}
          className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
};
