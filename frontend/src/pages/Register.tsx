import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api';
import { motion } from 'framer-motion';
import { User, Lock, Mail, ArrowRight, Store } from 'lucide-react';
import { useTranslation } from '../store';

export default function Register() {
  const [formData, setFormData] = useState({ username: '', full_name: '', email: '', password: '', role: 'buyer' });
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await api.post('/users/register/', formData);
      navigate('/login');
    } catch (err: any) {
      if (err.response?.data) {
        // Extract first error message from object
        const errors = Object.values(err.response.data);
        if (errors.length > 0 && Array.isArray(errors[0])) {
          setErrorMsg(errors[0][0] as string);
        } else {
          setErrorMsg(JSON.stringify(err.response.data));
        }
      } else {
        setErrorMsg('Registration failed. Please check your inputs.');
      }
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full space-y-8 bg-surface dark:bg-dark-surface p-10 rounded-3xl shadow-lg border border-gray-100 dark:border-dark-border">
        <div>
          <div className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center transform -rotate-12 mb-6 shadow-md">
            <User className="w-8 h-8 text-white rotate-12" />
          </div>
          <h2 className="text-center text-3xl font-extrabold text-secondary dark:text-dark-text tracking-tight">
            {t.register}
          </h2>
          {errorMsg && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl text-sm text-center">
              {errorMsg}
            </div>
          )}
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
                placeholder="Full Name (ชื่อ-นามสกุล)"
                onChange={e => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                required
                className="appearance-none block w-full pl-12 pr-3 py-3 border border-gray-200 dark:border-dark-border rounded-xl bg-background dark:bg-dark-bg text-secondary dark:text-dark-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder={`${t.username} (ห้ามเว้นวรรค)`}
                onChange={e => setFormData({ ...formData, username: e.target.value })}
              />
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                required
                className="appearance-none block w-full pl-12 pr-3 py-3 border border-gray-200 dark:border-dark-border rounded-xl bg-background dark:bg-dark-bg text-secondary dark:text-dark-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder={t.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
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

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Store className="h-5 w-5 text-gray-400" />
              </div>
              <select
                className="appearance-none block w-full pl-12 pr-10 py-3 border border-gray-200 dark:border-dark-border rounded-xl bg-background dark:bg-dark-bg text-secondary dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="buyer">{t.buyer}</option>
                <option value="seller">{t.seller}</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-primary hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all shadow-md hover:shadow-lg"
            >
              {t.register}
              <ArrowRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </button>
          </div>
          
          <div className="text-center text-sm">
            <span className="text-muted dark:text-dark-muted">{t.hasAccount}</span>{' '}
            <Link to="/login" className="font-semibold text-primary hover:text-indigo-500 transition-colors">
              {t.signIn}
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
