import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api';
import { useAuthStore, useTranslation } from '../store';
import { jwtDecode } from 'jwt-decode';
import { motion } from 'framer-motion';
import { User, Lock, ArrowRight } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Login() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const navigate = useNavigate();
  const setAuth = useAuthStore(state => state.setAuth);
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/token/', formData);
      const decoded: any = jwtDecode(data.access);
      setAuth(data.access, { id: decoded.user_id, username: decoded.username, role: decoded.role, email: decoded.email || '' });
      await Swal.fire({
        icon: 'success',
        title: t.loginSuccess,
        text: t.loginSuccessDesc,
        confirmButtonColor: '#7c3aed',
        timer: 1800,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      navigate(decoded.role === 'seller' ? '/dashboard' : '/');
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: t.loginFail,
        confirmButtonColor: '#7c3aed',
      });
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full space-y-8 bg-surface dark:bg-dark-surface p-10 rounded-3xl shadow-lg border border-gray-100 dark:border-dark-border">
        <div>
          <div className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center transform rotate-12 mb-6 shadow-md">
            <Lock className="w-8 h-8 text-white -rotate-12" />
          </div>
          <h2 className="text-center text-3xl font-extrabold text-secondary dark:text-dark-text tracking-tight">
            {t.welcome}
          </h2>
          <p className="mt-2 text-center text-sm text-muted dark:text-dark-muted">
            {t.signIn}
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                required
                className="appearance-none block w-full pl-12 pr-3 py-3 border border-gray-200 dark:border-dark-border rounded-xl bg-background dark:bg-dark-bg text-secondary dark:text-dark-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder={t.username}
                onChange={e => setFormData({ ...formData, username: e.target.value })}
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                required
                className="appearance-none block w-full pl-12 pr-3 py-3 border border-gray-200 dark:border-dark-border rounded-xl bg-background dark:bg-dark-bg text-secondary dark:text-dark-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder={t.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-primary hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all shadow-md hover:shadow-lg"
            >
              {t.login}
              <ArrowRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </button>
          </div>
          
          <div className="text-center text-sm">
            <span className="text-muted dark:text-dark-muted">{t.noAccount}</span>{' '}
            <Link to="/register" className="font-semibold text-primary hover:text-indigo-500 transition-colors">
              {t.createYours}
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
