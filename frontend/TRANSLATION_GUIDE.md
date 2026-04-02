# Hướng dẫn áp dụng đa ngôn ngữ (i18n) cho toàn bộ website

## ✅ Đã hoàn thành:

### 1. Cài đặt & Cấu hình
- ✅ Đã cài `i18next`, `react-i18next`, `i18next-browser-languagedetector`
- ✅ File cấu hình: `/src/i18n/config.js`
- ✅ File translation: `/src/i18n/locales/vi.json` và `/src/i18n/locales/en.json`
- ✅ Import i18n config trong `main.jsx`

### 2. Components đã được dịch
- ✅ **Header.jsx** - Hoàn toàn đã dịch
- ✅ **HomeSimple.jsx** - Đã dịch phần Features và một số text chính
- ✅ **LanguageSwitcher.jsx** - Component riêng cho nút chuyển đổi ngôn ngữ

## 📝 Cách áp dụng cho các trang còn lại:

### Bước 1: Import useTranslation
```jsx
import { useTranslation } from 'react-i18next';

function YourComponent() {
  const { t } = useTranslation();
  
  // Sử dụng t() để dịch text
  return <h1>{t('product.title')}</h1>;
}
```

### Bước 2: Thay thế text cứng bằng translation keys
**Trước:**
```jsx
<button>Mua hàng</button>
<h1>Giỏ hàng của bạn</h1>
```

**Sau:**
```jsx
<button>{t('product.addToCart')}</button>
<h1>{t('cart.title')}</h1>
```

### Bước 3: Translation với biến động
```jsx
// Tiếng Việt: "Còn {{count}} sản phẩm"
// Tiếng Anh: "{{count}} in stock"
<span>{t('product.inStock', { count: product.stock })}</span>
```

## 🎯 Danh sách trang cần áp dụng:

### Ưu tiên cao (Trang người dùng thấy nhiều nhất):
1. ✅ **Header.jsx** - HOÀN TẤT
2. 🔄 **HomeSimple.jsx** - Đã dịch 60%
3. ⏳ **ProductDetail.jsx** - Chưa áp dụng
4. ⏳ **ProductList.jsx** - Chưa áp dụng
5. ⏳ **Cart.jsx** - Chưa áp dụng
6. ⏳ **Login.jsx / Register.jsx** - Chưa áp dụng

### Ưu tiên trung bình:
- ⏳ **Wishlist.jsx**
- ⏳ **FlashSale.jsx**
- ⏳ **ProductsByCategory.jsx**
- ⏳ **MyOrders.jsx**
- ⏳ **ReturnRequest.jsx**

### Ưu tiên thấp (Admin):
- ⏳ **Admin Dashboard**
- ⏳ **Admin Products**
- ⏳ **Admin Orders**

## 📚 Translation Keys đã có sẵn:

### Header
- `header.home`, `header.products`, `header.categories`
- `header.flashSale`, `header.contact`, `header.cart`
- `header.wishlist`, `header.orderHistory`
- `header.login`, `header.register`, `header.logout`

### Products
- `product.price`, `product.stock`, `product.quantity`
- `product.addToCart`, `product.buyNow`
- `product.description`, `product.reviews`
- `product.outOfStock`, `product.inStock`

### Cart
- `cart.title`, `cart.empty`, `cart.checkout`
- `cart.subtotal`, `cart.total`
- `cart.remove`, `cart.continueShopping`

### Common
- `common.save`, `common.cancel`, `common.delete`
- `common.edit`, `common.update`, `common.close`
- `common.loading`, `common.success`, `common.error`

### Features
- `features.authentic`, `features.fastShipping`
- `features.exclusive`, `features.easyReturn`

## 🚀 Cách nhanh nhất để áp dụng:

### Ví dụ cho ProductDetail.jsx:
```jsx
import { useTranslation } from 'react-i18next';

function ProductDetail() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h2>{product.name}</h2>
      <p><strong>{t('product.price')}:</strong> {product.price}đ</p>
      <p><strong>{t('product.stock')}:</strong> {t('product.inStock', { count: product.stock })}</p>
      <button onClick={addToCart}>{t('product.addToCart')}</button>
      
      <h5>{t('product.description')}</h5>
      <p>{product.description || t('product.noDescription')}</p>
      
      <h5>{t('product.reviews')}</h5>
      {reviews.length === 0 && <p>{t('product.noReviews')}</p>}
    </div>
  );
}
```

## 💡 Tips:

1. **Tìm và thay thế hàng loạt**: 
   - Tìm: `"Mua hàng"` → Thay: `{t('product.buyNow')}`
   - Tìm: `"Giỏ hàng"` → Thay: `{t('header.cart')}`

2. **Thêm translation keys mới**:
   - Mở `/src/i18n/locales/vi.json` và `/en.json`
   - Thêm key mới vào cùng vị trí trong cả 2 file

3. **Test ngay**:
   - Nhấn nút 🌐 ở Header để chuyển đổi ngôn ngữ
   - Kiểm tra xem text có thay đổi không

## 🎨 Language Switcher Component:

Đã tạo sẵn `<LanguageSwitcher />` - có thể dùng ở bất kỳ đâu:
```jsx
import LanguageSwitcher from '../components/LanguageSwitcher';

function YourPage() {
  return (
    <div>
      <LanguageSwitcher className="my-3" />
      {/* Your content */}
    </div>
  );
}
```

## ⚠️ Lưu ý quan trọng:

1. **Không dịch**:
   - Tên sản phẩm (do từ database)
   - Tên thương hiệu
   - Số tiền, số lượng
   - Tên người dùng

2. **Cần dịch**:
   - Labels: "Tên sản phẩm", "Giá", "Số lượng"
   - Buttons: "Mua hàng", "Thêm vào giỏ"
   - Messages: "Thành công", "Lỗi"
   - Placeholders: "Tìm kiếm...", "Nhập email..."

3. **Format số tiền**:
```jsx
// Giữ nguyên format VND cho cả 2 ngôn ngữ
{Number(price).toLocaleString('vi-VN')}{t('common.vnd')}
```

---

Nếu cần áp dụng cho trang cụ thể nào, hãy cho tôi biết trang nào và tôi sẽ làm chi tiết!
