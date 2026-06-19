import { create } from 'zustand';

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'seller' | 'buyer';
}

export interface Product {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  unit_price: string | number;
  quantity: number;
  sku: string | null;
  status: string;
  thumbnail_url: string;
  created_at?: string;
  updated_at?: string;
  isFeatured?: boolean;
  oldPrice?: number | string;
}

export interface CartItem {
  id: string;
  product: string;
  product_details: Product;
  quantity: number;
  added_at?: string;
}

export interface Cart {
  id: string;
  items: CartItem[];
  buyer: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  theme: 'light' | 'dark';
  language: 'en' | 'th';
  cartCount: number;
  cartProductIds: string[];
  favorites: string[];
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  toggleTheme: () => void;
  toggleLanguage: () => void;
  setCartCount: (count: number) => void;
  setCartProductIds: (ids: string[]) => void;
  toggleFavorite: (productId: string) => void;
}

const translations = {
  en: {
    search: 'Search',
    orders: 'Orders',
    favourites: 'Favourites',
    cart: 'Cart',
    allCategories: 'All Categories',
    deals: 'Deals',
    crypto: 'Crypto',
    fashion: 'Fashion',
    healthWellness: 'Health & Wellness',
    art: 'Art',
    home: 'Home',
    sport: 'Sport',
    music: 'Music',
    gaming: 'Gaming',
    priceRange: 'Price Range',
    averagePrice: 'Filter by your desired price range',
    starRating: 'Star Rating',
    brand: 'Brand',
    deliveryOptions: 'Delivery Options',
    standard: 'Standard',
    pickUp: 'Pick Up',
    topItem: 'Top item',
    login: 'Log in',
    register: 'Register',
    username: 'Username',
    password: 'Password',
    email: 'Email',
    accountType: 'Account Type',
    buyer: 'Buyer',
    seller: 'Seller',
    noAccount: "Don't have an account?",
    hasAccount: 'Already have an account?',
    createYours: 'Create yours now.',
    signIn: 'Sign in',
    addToCart: 'Add to Cart',
    welcome: 'Welcome',
    dashboard: 'Dashboard',
    logout: 'Logout',
    sellerDashboard: 'Seller Dashboard',
    sellerDashboardDesc: 'Manage your product inventory and track sales.',
    totalRevenue: 'Total Revenue',
    totalOrders: 'Total Orders',
    activeProducts: 'Active Products',
    revenueOverview: 'Revenue Overview (Last 7 Days)',
    manageProducts: 'Manage Products',
    manageProductsDesc: 'Add, edit, or remove products from your store.',
    addProduct: 'Add Product',
    topSelling: 'Top Selling',
    lowStock: 'Low Stock',
    save: 'Save',
    cancel: 'Cancel',
    settings: 'Store Settings',
    settingsDesc: 'Manage your seller profile and store configurations.',
    storeProfile: 'Store Profile',
    storeName: 'Store Name',
    storeDescription: 'Store Description',
    contactEmail: 'Contact Email',
    contactPhone: 'Contact Phone',
    businessAddress: 'Business Address',
    storeVisuals: 'Store Visuals',
    storeLogoUrl: 'Store Logo URL',
    coverBannerUrl: 'Cover Banner URL',
    payoutInfo: 'Payout Information',
    bankAccountName: 'Bank Account Name',
    bankAccountNumber: 'Bank Account Number',
    bankName: 'Bank Name',
    productTitle: 'Product Name',
    productDesc: 'Description',
    price: 'Price (฿)',
    quantity: 'Quantity (Units)',
    thumbnailUrl: 'Thumbnail Image URL',
    statusLabel: 'Status',
    active: 'Active',
    draft: 'Draft',
    editProduct: 'Edit Product',
    deleteProduct: 'Delete Product',
    confirmDelete: 'Are you sure you want to delete this product?',
    confirmDeleteTitle: 'Confirm Delete',
    deleteSuccess: 'Product has been deleted successfully.',
    saveSuccess: 'Saved successfully!',
    saveFail: 'Failed to save. Please check all required fields.',
    loginSuccess: 'Welcome back!',
    loginSuccessDesc: 'You have logged in successfully.',
    loginFail: 'Login failed. Please check your username and password.',
    logoutSuccess: 'You have been logged out.',
    logoutSuccessDesc: 'See you next time!',
    noProductsFound: 'No products found. Start by adding a new product.',
    thProduct: 'Product',
    thPrice: 'Price',
    thStock: 'Stock',
    thStatus: 'Status',
    thActions: 'Actions',
    saveChanges: 'Save Changes',
    changeImage: 'Change Image',
    clickToUpload: 'Click to upload image',
    imageFormats: 'JPEG, PNG, WEBP, GIF (max 5MB)',
    noSalesData: 'No sales data yet.',
    inventoryHealthy: 'Inventory is healthy.',
    sold: 'sold',
    left: 'left',
    ourProducts: 'Our Products',
    ourProductsDesc: 'Find the best tech gadgets here.',
    reset: 'Reset',
    min: 'Min',
    max: 'Max',
    addToCartSuccess: 'Added to cart!',
    reviewBag: 'Review your bag.',
    freeDelivery: 'Free delivery and free returns.',
    items: 'Items',
    qty: 'Qty',
    summary: 'Summary',
    subtotal: 'Subtotal',
    shipping: 'Shipping',
    free: 'FREE',
    total: 'Total',
    shippingAddress: 'Shipping Address',
    enterAddress: 'Enter full address...',
    paymentMethod: 'Payment Method',
    cod: 'Cash on Delivery',
    placeOrder: 'Place Order',
    emptyBag: 'Your bag is empty.',
    continueShopping: 'Continue Shopping',
    confirmLogout: 'Are you sure you want to logout?',
    confirmLogoutText: 'You will need to login again to access your account.',
    confirmEdit: 'Confirm Changes',
    confirmEditText: 'Are you sure you want to save these changes?',
    confirmOrder: 'Place Order',
    confirmOrderText: 'Are you sure you want to place this order?',
    addressRequired: 'Address Required',
    addressRequiredText: 'Please enter your shipping address.',
    confirm: 'Confirm'
  },
  th: {
    search: 'ค้นหา',
    orders: 'คำสั่งซื้อ',
    favourites: 'รายการโปรด',
    cart: 'ตะกร้า',
    allCategories: 'หมวดหมู่ทั้งหมด',
    deals: 'ดีลเด็ด',
    crypto: 'คริปโต',
    fashion: 'แฟชั่น',
    healthWellness: 'สุขภาพ',
    art: 'ศิลปะ',
    home: 'บ้าน',
    sport: 'กีฬา',
    music: 'ดนตรี',
    gaming: 'เกมมิ่ง',
    priceRange: 'ช่วงราคา',
    averagePrice: 'กรองตามช่วงราคาที่คุณต้องการ',
    starRating: 'ระดับดาว',
    brand: 'แบรนด์',
    deliveryOptions: 'ตัวเลือกการจัดส่ง',
    standard: 'มาตรฐาน',
    pickUp: 'รับเอง',
    topItem: 'สินค้ายอดฮิต',
    login: 'เข้าสู่ระบบ',
    register: 'สมัครสมาชิก',
    username: 'ชื่อผู้ใช้งาน',
    password: 'รหัสผ่าน',
    email: 'อีเมล',
    accountType: 'ประเภทบัญชี',
    buyer: 'ผู้ซื้อ',
    seller: 'ผู้ขาย',
    noAccount: 'ยังไม่มีบัญชีใช่หรือไม่?',
    hasAccount: 'มีบัญชีอยู่แล้ว?',
    createYours: 'สมัครเลย',
    signIn: 'เข้าสู่ระบบ',
    addToCart: 'หยิบใส่ตะกร้า',
    welcome: 'ยินดีต้อนรับ',
    dashboard: 'แผงควบคุม',
    logout: 'ออกจากระบบ',
    sellerDashboard: 'แผงควบคุมผู้ขาย',
    sellerDashboardDesc: 'จัดการคลังสินค้าและติดตามยอดขายของคุณ',
    totalRevenue: 'รายได้รวม',
    totalOrders: 'คำสั่งซื้อรวม',
    activeProducts: 'สินค้าที่ลงขาย',
    revenueOverview: 'ภาพรวมรายได้ (7 วันล่าสุด)',
    manageProducts: 'จัดการสินค้า',
    manageProductsDesc: 'เพิ่ม แก้ไข หรือลบสินค้าออกจากร้านของคุณ',
    addProduct: 'เพิ่มสินค้า',
    topSelling: 'สินค้าขายดี',
    lowStock: 'สินค้าใกล้หมด',
    save: 'บันทึก',
    cancel: 'ยกเลิก',
    settings: 'ตั้งค่าร้านค้า',
    settingsDesc: 'จัดการโปรไฟล์ผู้ขายและการตั้งค่าร้านค้าของคุณ',
    storeProfile: 'ข้อมูลร้านค้า',
    storeName: 'ชื่อร้านค้า',
    storeDescription: 'รายละเอียดร้านค้า',
    contactEmail: 'อีเมลติดต่อ',
    contactPhone: 'เบอร์โทรศัพท์ติดต่อ',
    businessAddress: 'ที่อยู่ธุรกิจ',
    storeVisuals: 'การตกแต่งร้านค้า',
    storeLogoUrl: 'ลิงก์รูปภาพโลโก้',
    coverBannerUrl: 'ลิงก์รูปภาพหน้าปก',
    payoutInfo: 'ข้อมูลการรับเงิน',
    bankAccountName: 'ชื่อบัญชีธนาคาร',
    bankAccountNumber: 'เลขที่บัญชีธนาคาร',
    bankName: 'ชื่อธนาคาร',
    productTitle: 'ชื่อสินค้า',
    productDesc: 'รายละเอียดสินค้า',
    price: 'ราคา (฿)',
    quantity: 'จำนวน (ชิ้น)',
    thumbnailUrl: 'ลิงก์รูปภาพสินค้า',
    statusLabel: 'สถานะ',
    active: 'เปิดขาย',
    draft: 'แบบร่าง',
    editProduct: 'แก้ไขสินค้า',
    deleteProduct: 'ลบสินค้า',
    confirmDelete: 'คุณแน่ใจหรือไม่ว่าต้องการลบสินค้านี้?',
    confirmDeleteTitle: 'ยืนยันการลบ',
    deleteSuccess: 'ลบสินค้าเรียบร้อยแล้ว',
    saveSuccess: 'บันทึกสำเร็จแล้ว!',
    saveFail: 'บันทึกไม่สำเร็จ กรุณาตรวจสอบข้อมูลที่กรอก',
    loginSuccess: 'ยินดีต้อนรับกลับ!',
    loginSuccessDesc: 'คุณเข้าสู่ระบบสำเร็จแล้ว',
    loginFail: 'เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบชื่อผู้ใช้และรหัสผ่าน',
    logoutSuccess: 'ออกจากระบบเรียบร้อยแล้ว',
    logoutSuccessDesc: 'แล้วพบกันใหม่นะครับ!',
    noProductsFound: 'ยังไม่มีสินค้า เริ่มต้นโดยการเพิ่มสินค้าใหม่',
    thProduct: 'สินค้า',
    thPrice: 'ราคา',
    thStock: 'คงเหลือ',
    thStatus: 'สถานะ',
    thActions: 'จัดการ',
    saveChanges: 'บันทึกการเปลี่ยนแปลง',
    changeImage: 'เปลี่ยนรูปภาพ',
    clickToUpload: 'คลิกเพื่ออัปโหลดรูปภาพ',
    imageFormats: 'JPEG, PNG, WEBP, GIF (สูงสุด 5MB)',
    noSalesData: 'ยังไม่มีข้อมูลการขาย',
    inventoryHealthy: 'สินค้าคงคลังปกติ',
    sold: 'ชิ้น',
    left: 'ชิ้น',
    ourProducts: 'สินค้าของเรา',
    ourProductsDesc: 'ค้นหาสินค้าไอทีที่ดีที่สุดได้ที่นี่',
    reset: 'รีเซ็ต',
    min: 'ต่ำสุด',
    max: 'สูงสุด',
    addToCartSuccess: 'เพิ่มลงตะกร้าแล้ว!',
    reviewBag: 'ตรวจสอบตะกร้าของคุณ',
    freeDelivery: 'จัดส่งฟรีและคืนสินค้าฟรี',
    items: 'รายการสินค้า',
    qty: 'จำนวน',
    summary: 'สรุปคำสั่งซื้อ',
    subtotal: 'ยอดรวมเบื้องต้น',
    shipping: 'ค่าจัดส่ง',
    free: 'ฟรี',
    total: 'ยอดชำระเงินทั้งหมด',
    shippingAddress: 'ที่อยู่สำหรับจัดส่ง',
    enterAddress: 'ระบุที่อยู่จัดส่งแบบเต็ม...',
    paymentMethod: 'วิธีการชำระเงิน',
    cod: 'ชำระเงินปลายทาง',
    placeOrder: 'ยืนยันคำสั่งซื้อ',
    emptyBag: 'ตะกร้าของคุณว่างเปล่า',
    continueShopping: 'เลือกซื้อสินค้าต่อ',
    confirmLogout: 'คุณต้องการออกจากระบบใช่หรือไม่?',
    confirmLogoutText: 'คุณจะต้องเข้าสู่ระบบใหม่เพื่อเข้าถึงบัญชีของคุณ',
    confirmEdit: 'ยืนยันการแก้ไข',
    confirmEditText: 'คุณแน่ใจหรือไม่ว่าต้องการบันทึกการแก้ไขนี้?',
    confirmOrder: 'ยืนยันคำสั่งซื้อ',
    confirmOrderText: 'คุณแน่ใจหรือไม่ว่าต้องการสั่งซื้อสินค้านี้?',
    addressRequired: 'โปรดระบุที่อยู่',
    addressRequiredText: 'กรุณากรอกที่อยู่สำหรับจัดส่งสินค้าของคุณ',
    confirm: 'ยืนยัน'
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token'),
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') as string) : null,
  theme: (localStorage.getItem('theme') as 'light' | 'dark') || 'light',
  language: (localStorage.getItem('language') as 'en' | 'th') || 'en',
  cartCount: 0,
  cartProductIds: [],
  favorites: localStorage.getItem('favorites') ? JSON.parse(localStorage.getItem('favorites') as string) : [],
  setAuth: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ token, user });
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ token: null, user: null, cartCount: 0 });
  },
  toggleTheme: () => set((state) => {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    return { theme: newTheme };
  }),
  toggleLanguage: () => set((state) => {
    const newLang = state.language === 'en' ? 'th' : 'en';
    localStorage.setItem('language', newLang);
    return { language: newLang };
  }),
  setCartCount: (count) => set({ cartCount: count }),
  setCartProductIds: (ids) => set({ cartProductIds: ids }),
  toggleFavorite: (productId) => set((state) => {
    let newFavs;
    if (state.favorites.includes(productId)) {
      newFavs = state.favorites.filter(id => id !== productId);
    } else {
      newFavs = [...state.favorites, productId];
    }
    localStorage.setItem('favorites', JSON.stringify(newFavs));
    return { favorites: newFavs };
  })
}));

export const useTranslation = () => {
  const language = useAuthStore(state => state.language);
  return { t: translations[language], lang: language };
};
