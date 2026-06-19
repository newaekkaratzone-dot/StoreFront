import { useEffect, useState } from 'react';
import { api } from '../api';
import { motion } from 'framer-motion';
import { Store, Save, Loader2, Image as ImageIcon, CreditCard } from 'lucide-react';
import { useTranslation } from '../store';
import Swal from 'sweetalert2';

export default function Settings() {
  const [profile, setProfile] = useState({
    store_name: '',
    store_description: '',
    contact_email: '',
    contact_phone: '',
    business_address: '',
    store_logo_url: '',
    cover_banner_url: '',
    bank_account_name: '',
    bank_account_number: '',
    bank_name: ''
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    api.get('/seller/profile/')
      .then(res => {
        setProfile({
          store_name: res.data.store_name || '',
          store_description: res.data.store_description || '',
          contact_email: res.data.contact_email || '',
          contact_phone: res.data.contact_phone || '',
          business_address: res.data.business_address || '',
          store_logo_url: res.data.store_logo_url || '',
          cover_banner_url: res.data.cover_banner_url || '',
          bank_account_name: res.data.bank_account_name || '',
          bank_account_number: res.data.bank_account_number || '',
          bank_name: res.data.bank_name || ''
        });
        setFetching(false);
      })
      .catch(err => {
        console.error(err);
        setFetching(false);
      });
  }, []);

  const uploadImageToServer = async (file: File | null): Promise<string | null> => {
    if (!file) return null;
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await api.post('/upload/image/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data.url;
    } catch {
      Swal.fire({ icon: 'error', title: t.saveFail || 'อัปโหลดรูปภาพไม่สำเร็จ', confirmButtonColor: '#7c3aed' });
      return null;
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({ icon: 'error', title: 'ไฟล์ใหญ่เกินไป (สูงสุด 5MB)', confirmButtonColor: '#7c3aed' });
      return;
    }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({ icon: 'error', title: 'ไฟล์ใหญ่เกินไป (สูงสุด 5MB)', confirmButtonColor: '#7c3aed' });
      return;
    }
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setUploading(true);
    try {
      let finalLogoUrl = profile.store_logo_url;
      if (logoFile) {
        const uploadedUrl = await uploadImageToServer(logoFile);
        if (uploadedUrl) finalLogoUrl = uploadedUrl;
      }

      let finalBannerUrl = profile.cover_banner_url;
      if (bannerFile) {
        const uploadedUrl = await uploadImageToServer(bannerFile);
        if (uploadedUrl) finalBannerUrl = uploadedUrl;
      }

      const updatedProfile = {
        ...profile,
        store_logo_url: finalLogoUrl,
        cover_banner_url: finalBannerUrl
      };

      await api.patch('/seller/profile/', updatedProfile);
      setProfile(updatedProfile);
      
      Swal.fire({
        icon: 'success',
        title: t.saveSuccess,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
        iconColor: '#7c3aed',
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: t.saveFail,
        confirmButtonColor: '#7c3aed',
      });
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  if (fetching) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full px-4 md:px-8 xl:px-12 py-8"
    >
      <div className="mb-8 border-b border-gray-200 dark:border-dark-border pb-6">
        <h1 className="text-3xl font-bold text-secondary dark:text-dark-text">{t.settings}</h1>
        <p className="text-muted dark:text-dark-muted mt-1 text-sm">{t.settingsDesc}</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* Store Profile Section */}
        <div className="bg-surface dark:bg-dark-surface p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border">
          <h2 className="text-xl font-bold text-secondary dark:text-dark-text mb-6 flex items-center gap-2">
            <Store className="w-5 h-5 text-primary" />
            {t.storeProfile || 'Store Profile'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-muted mb-2">{t.storeName || 'Store Name'}</label>
              <input 
                required
                value={profile.store_name}
                onChange={e => setProfile({...profile, store_name: e.target.value})}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none dark:text-dark-text"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-muted mb-2">{t.storeDescription || 'Store Description'}</label>
              <textarea 
                value={profile.store_description}
                onChange={e => setProfile({...profile, store_description: e.target.value})}
                rows={3}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none dark:text-dark-text"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-muted mb-2">{t.contactEmail || 'Contact Email'}</label>
              <input 
                type="email"
                value={profile.contact_email}
                onChange={e => setProfile({...profile, contact_email: e.target.value})}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none dark:text-dark-text"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-muted mb-2">{t.contactPhone || 'Contact Phone'}</label>
              <input 
                value={profile.contact_phone}
                onChange={e => setProfile({...profile, contact_phone: e.target.value})}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none dark:text-dark-text"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-muted mb-2">{t.businessAddress || 'Business Address'}</label>
              <textarea 
                value={profile.business_address}
                onChange={e => setProfile({...profile, business_address: e.target.value})}
                rows={2}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none dark:text-dark-text"
              />
            </div>
          </div>
        </div>

        {/* Visuals Section */}
        <div className="bg-surface dark:bg-dark-surface p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border">
          <h2 className="text-xl font-bold text-secondary dark:text-dark-text mb-6 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-primary" />
            {t.storeVisuals || 'Store Visuals'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-muted mb-2">{t.storeLogoUrl || 'Store Logo'}</label>
              <label
                htmlFor="logo-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 dark:border-dark-border rounded-xl cursor-pointer hover:border-primary transition-colors bg-gray-50 dark:bg-dark-bg group"
              >
                {(logoPreview || profile.store_logo_url) ? (
                  <div className="relative w-full h-full">
                    <img
                      src={logoPreview || profile.store_logo_url}
                      alt="preview"
                      className="w-full h-full object-contain rounded-xl p-1"
                      onError={e => (e.currentTarget.src = '')}
                    />
                    <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="text-white text-xs font-medium">{t.changeImage || 'เปลี่ยนรูปภาพ'}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <ImageIcon size={28} className="group-hover:text-primary transition-colors" />
                    <span className="text-xs">{t.clickToUpload || 'คลิกเพื่ออัปโหลดรูปภาพ'}</span>
                    <span className="text-xs text-gray-300">{t.imageFormats || 'JPEG, PNG, WEBP, GIF (สูงสุด 5MB)'}</span>
                  </div>
                )}
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleLogoChange}
                />
              </label>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-muted mb-2">{t.coverBannerUrl || 'Cover Banner'}</label>
              <label
                htmlFor="banner-upload"
                className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-200 dark:border-dark-border rounded-xl cursor-pointer hover:border-primary transition-colors bg-gray-50 dark:bg-dark-bg group"
              >
                {(bannerPreview || profile.cover_banner_url) ? (
                  <div className="relative w-full h-full">
                    <img
                      src={bannerPreview || profile.cover_banner_url}
                      alt="preview"
                      className="w-full h-full object-cover rounded-xl p-1"
                      onError={e => (e.currentTarget.src = '')}
                    />
                    <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="text-white text-xs font-medium">{t.changeImage || 'เปลี่ยนรูปภาพ'}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <ImageIcon size={28} className="group-hover:text-primary transition-colors" />
                    <span className="text-xs">{t.clickToUpload || 'คลิกเพื่ออัปโหลดรูปภาพ'}</span>
                    <span className="text-xs text-gray-300">{t.imageFormats || 'JPEG, PNG, WEBP, GIF (สูงสุด 5MB)'}</span>
                  </div>
                )}
                <input
                  id="banner-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleBannerChange}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Payout Info Section */}
        <div className="bg-surface dark:bg-dark-surface p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border">
          <h2 className="text-xl font-bold text-secondary dark:text-dark-text mb-6 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            {t.payoutInfo || 'Payout Information'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-muted mb-2">{t.bankAccountName || 'Bank Account Name'}</label>
              <input 
                value={profile.bank_account_name}
                onChange={e => setProfile({...profile, bank_account_name: e.target.value})}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none dark:text-dark-text"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-muted mb-2">{t.bankAccountNumber || 'Bank Account Number'}</label>
              <input 
                value={profile.bank_account_number}
                onChange={e => setProfile({...profile, bank_account_number: e.target.value})}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none dark:text-dark-text"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-muted mb-2">{t.bankName || 'Bank Name'}</label>
              <input 
                value={profile.bank_name}
                onChange={e => setProfile({...profile, bank_name: e.target.value})}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none dark:text-dark-text"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <motion.button 
            whileTap={{ scale: 0.95 }}
            disabled={loading || uploading}
            type="submit"
            className="bg-primary hover:bg-purple-700 disabled:opacity-50 text-white px-8 py-3 rounded-full flex items-center gap-2 transition-colors font-medium shadow-md"
          >
            {(loading || uploading) ? <Loader2 className="animate-spin w-5 h-5" /> : <Save size={20} />}
            {t.saveChanges}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}
