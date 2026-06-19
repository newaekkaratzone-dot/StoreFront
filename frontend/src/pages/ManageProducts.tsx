import { useEffect, useState } from 'react';
import { api } from '../api';
import { Plus, Edit2, Trash2, X, Image as ImageIcon, PackageOpen, Tag, DollarSign, Hash, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation, Product } from '../store';
import Swal from 'sweetalert2';

const EMPTY_FORM = {
  title: '',
  description: '',
  unit_price: '',
  quantity: '',
  thumbnail_url: '',
  status: 'active'
};

export default function ManageProducts() {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = () => {
    api.get('/products/').then(res => {
      setProducts(res.data.results || res.data);
    }).catch(console.error);
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({ ...EMPTY_FORM });
    setShowModal(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      description: product.description,
      unit_price: String(product.unit_price),
      quantity: String(product.quantity),
      thumbnail_url: product.thumbnail_url || '',
      status: product.status
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData({ ...EMPTY_FORM });
    setImageFile(null);
    setImagePreview('');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({ icon: 'error', title: 'ไฟล์ใหญ่เกินไป (สูงสุด 5MB)', confirmButtonColor: '#7c3aed' });
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadImageToServer = async (): Promise<string | null> => {
    if (!imageFile) return formData.thumbnail_url || null;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', imageFile);
      const res = await api.post('/upload/image/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data.url;
    } catch {
      Swal.fire({ icon: 'error', title: 'อัปโหลดรูปภาพไม่สำเร็จ', confirmButtonColor: '#7c3aed' });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: t.confirmDeleteTitle,
      text: t.confirmDelete,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#7c3aed',
      cancelButtonColor: '#6b7280',
      confirmButtonText: t.deleteProduct,
      cancelButtonText: t.cancel,
      customClass: { popup: 'rounded-3xl' }
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/products/${id}/`);
        fetchProducts();
        Swal.fire({
          icon: 'success',
          title: t.deleteSuccess,
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2500,
          timerProgressBar: true,
          iconColor: '#7c3aed',
        });
      } catch {
        Swal.fire({ icon: 'error', title: t.saveFail, confirmButtonColor: '#7c3aed' });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingProduct) {
      const result = await Swal.fire({
        title: t.confirmEdit || 'Confirm Changes',
        text: t.confirmEditText || 'Are you sure you want to save these changes?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#7c3aed',
        cancelButtonColor: '#6b7280',
        confirmButtonText: t.confirm || 'Confirm',
        cancelButtonText: t.cancel || 'Cancel',
        customClass: { popup: 'rounded-3xl' }
      });
      
      if (!result.isConfirmed) return;
    }

    setSubmitting(true);
    try {
      // Upload image first if a new file was selected
      const imageUrl = await uploadImageToServer();

      const payload = {
        ...formData,
        unit_price: parseFloat(formData.unit_price),
        quantity: parseInt(formData.quantity),
        thumbnail_url: imageUrl || '',
      };

      if (editingProduct) {
        await api.patch(`/products/${editingProduct.id}/`, payload);
      } else {
        await api.post('/products/', payload);
      }

      closeModal();
      fetchProducts();

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
      setSubmitting(false);

    }
  };

  const statusBadge = (status: string) => {
    const active = status === 'active';
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
        {active ? t.active : t.draft}
      </span>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full px-4 md:px-8 xl:px-12 py-8"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-gray-200 dark:border-dark-border pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-secondary dark:text-dark-text">{t.manageProducts}</h1>
          <p className="text-muted dark:text-dark-muted mt-1 text-sm">{t.manageProductsDesc}</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={openCreateModal}
          className="bg-primary hover:bg-purple-700 text-white px-5 py-2.5 rounded-full flex items-center gap-2 transition-colors font-medium shadow-md text-sm"
        >
          <Plus size={18} /> {t.addProduct}
        </motion.button>
      </div>

      {/* Products Table */}
      <div className="bg-surface dark:bg-dark-surface rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-dark-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/80 dark:bg-dark-bg/60 border-b border-gray-100 dark:border-dark-border">
              <tr>
                <th className="px-5 py-4 text-xs font-semibold text-gray-500 dark:text-dark-muted uppercase tracking-wider">{t.thProduct}</th>
                <th className="px-5 py-4 text-xs font-semibold text-gray-500 dark:text-dark-muted uppercase tracking-wider">{t.thPrice}</th>
                <th className="px-5 py-4 text-xs font-semibold text-gray-500 dark:text-dark-muted uppercase tracking-wider">{t.thStock}</th>
                <th className="px-5 py-4 text-xs font-semibold text-gray-500 dark:text-dark-muted uppercase tracking-wider">{t.thStatus}</th>
                <th className="px-5 py-4 text-xs font-semibold text-gray-500 dark:text-dark-muted uppercase tracking-wider text-right">{t.thActions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-gray-50/60 dark:hover:bg-dark-bg/30 transition-colors group">
                  <td className="px-5 py-4 flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                      {p.thumbnail_url
                        ? <img src={p.thumbnail_url} alt="" className="w-full h-full object-cover" />
                        : <PackageOpen className="w-6 h-6 text-gray-300" />
                      }
                    </div>
                    <span className="font-medium text-secondary dark:text-dark-text line-clamp-2 text-sm">{p.title}</span>
                  </td>
                  <td className="px-5 py-4 font-semibold text-secondary dark:text-dark-text text-sm">฿{parseFloat(String(p.unit_price)).toLocaleString()}</td>
                  <td className="px-5 py-4 text-gray-600 dark:text-dark-muted text-sm">{p.quantity}</td>
                  <td className="px-5 py-4">{statusBadge(p.status)}</td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => openEditModal(p)}
                        className="p-2 text-gray-400 hover:text-primary bg-white dark:bg-dark-bg rounded-full shadow-sm border border-gray-100 dark:border-dark-border hover:border-primary/30 transition-all"
                        title={t.editProduct}
                      >
                        <Edit2 size={15} />
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(p.id)}
                        className="p-2 text-gray-400 hover:text-red-500 bg-white dark:bg-dark-bg rounded-full shadow-sm border border-gray-100 dark:border-dark-border hover:border-red-200 transition-all"
                        title={t.deleteProduct}
                      >
                        <Trash2 size={15} />
                      </motion.button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {products.length === 0 && (
          <div className="text-center py-20 text-gray-400 dark:text-dark-muted flex flex-col items-center gap-3">
            <PackageOpen className="w-14 h-14 text-gray-200 dark:text-dark-border" />
            <p>{t.noProductsFound}</p>
          </div>
        )}
      </div>

      {/* Modal Overlay */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0,0,0,0.5)' }}
            onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="bg-white dark:bg-dark-surface rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-dark-border sticky top-0 bg-white dark:bg-dark-surface z-10">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                    <PackageOpen className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold text-secondary dark:text-dark-text">
                    {editingProduct ? t.editProduct : t.addProduct}
                  </h2>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-dark-bg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
                
                {/* Product Name */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-dark-muted mb-2">
                    <Tag size={14} className="text-primary" /> {t.productTitle} *
                  </label>
                  <input
                    required
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none dark:text-dark-text text-sm transition-all"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-dark-muted mb-2">
                    <PackageOpen size={14} className="text-primary" /> {t.productDesc}
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none dark:text-dark-text text-sm resize-none transition-all"
                  />
                </div>

                {/* Price & Quantity */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-dark-muted mb-2">
                      <DollarSign size={14} className="text-primary" /> {t.price} *
                    </label>
                    <input
                      required
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.unit_price}
                      onChange={e => setFormData({ ...formData, unit_price: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none dark:text-dark-text text-sm transition-all"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-dark-muted mb-2">
                      <Hash size={14} className="text-primary" /> {t.quantity} *
                    </label>
                    <input
                      required
                      type="number"
                      min="0"
                      value={formData.quantity}
                      onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none dark:text-dark-text text-sm transition-all"
                    />
                  </div>
                </div>

                {/* Image Upload */}
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-dark-muted mb-2">
                    <ImageIcon size={14} className="text-primary" /> {t.thumbnailUrl}
                  </label>
                  <label
                    htmlFor="img-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 dark:border-dark-border rounded-xl cursor-pointer hover:border-primary transition-colors bg-gray-50 dark:bg-dark-bg group"
                  >
                    {(imagePreview || formData.thumbnail_url) ? (
                      <div className="relative w-full h-full">
                        <img
                          src={imagePreview || formData.thumbnail_url}
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
                      id="img-upload"
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>

                {/* Status */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-dark-muted mb-2">
                    <Tag size={14} className="text-primary" /> {t.statusLabel}
                  </label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none dark:text-dark-text text-sm transition-all"
                  >
                    <option value="active">{t.active}</option>
                    <option value="draft">{t.draft}</option>
                  </select>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 dark:border-dark-border">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border text-gray-600 dark:text-dark-muted hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors text-sm font-medium"
                  >
                    {t.cancel}
                  </button>
                  <motion.button
                    type="submit"
                    disabled={submitting}
                    whileTap={{ scale: 0.97 }}
                    className="bg-primary hover:bg-purple-700 disabled:opacity-60 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 transition-colors font-medium text-sm shadow-sm"
                  >
                    <Save size={16} />
                    {(submitting || uploading) ? '...' : t.save}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
