# Mô tả thiết kế cơ sở dữ liệu BookStore

## 1. Tổng quan hệ thống
Hệ thống BookStore là một nền tảng thương mại điện tử chuyên về bán sách, cho phép người dùng duyệt, tìm kiếm, đánh giá và mua sách trực tuyến. Hệ thống được thiết kế để hỗ trợ đầy đủ các chức năng từ quản lý người dùng, quản lý sản phẩm đến xử lý đơn hàng.

## 2. Các Collection chính và mối quan hệ

### 2.1. Users Collection (Người dùng)
- **Mục đích**: Lưu trữ thông tin người dùng hệ thống
- **Các trường quan trọng**:
  - `email`: Định danh duy nhất của người dùng
  - `role`: Phân quyền người dùng (admin/user)
  - `fullName, phone, address`: Thông tin cá nhân
- **Quan hệ**:
  - Một người dùng có thể có nhiều đơn hàng (1-n với Orders)
  - Một người dùng có một giỏ hàng (1-1 với Cart)
  - Một người dùng có thể đánh giá nhiều sách (1-n với Ratings)

### 2.2. Books Collection (Sách)
- **Mục đích**: Quản lý thông tin sách trong hệ thống
- **Các trường quan trọng**:
  - `title, author`: Thông tin cơ bản của sách
  - `price, discount`: Thông tin giá
  - `stock`: Số lượng tồn kho
  - `images`: Mảng các URL hình ảnh
- **Quan hệ**:
  - Mỗi sách thuộc một danh mục (n-1 với Categories)
  - Sách có thể xuất hiện trong nhiều đơn hàng (1-n với OrderItems)
  - Sách có thể được đánh giá bởi nhiều người dùng (1-n với Ratings)

### 2.3. Categories Collection (Danh mục)
- **Mục đích**: Phân loại sách
- **Các trường quan trọng**:
  - `name`: Tên danh mục
  - `slug`: URL-friendly string cho SEO
- **Quan hệ**:
  - Một danh mục có thể chứa nhiều sách (1-n với Books)

### 2.4. Orders và OrderItems Collection (Đơn hàng)
- **Mục đích**: Quản lý đơn hàng và chi tiết đơn hàng
- **Đặc điểm**:
  - Tách thành 2 collection để tối ưu hiệu suất
  - OrderItems lưu chi tiết từng sản phẩm trong đơn hàng
- **Các trường quan trọng Orders**:
  - `totalAmount`: Tổng giá trị đơn hàng
  - `paymentStatus`: Trạng thái thanh toán
  - `orderStatus`: Trạng thái đơn hàng
- **Các trường quan trọng OrderItems**:
  - `quantity`: Số lượng sách
  - `price`: Giá tại thời điểm mua

### 2.5. Cart và CartItems Collection (Giỏ hàng)
- **Mục đích**: Quản lý giỏ hàng của người dùng
- **Đặc điểm**:
  - Tương tự Orders, tách thành 2 collection
  - CartItems lưu chi tiết từng sản phẩm trong giỏ hàng
- **Quan hệ**:
  - Mỗi người dùng có một giỏ hàng
  - Giỏ hàng có thể chứa nhiều sách

### 2.6. Ratings Collection (Đánh giá)
- **Mục đích**: Lưu trữ đánh giá của người dùng về sách
- **Các trường quan trọng**:
  - `rating`: Điểm đánh giá (1-5)
  - `comment`: Nội dung đánh giá
- **Quan hệ**:
  - Kết nối Users và Books (many-to-many)

### 2.7. Settings Collection (Cài đặt)
- **Mục đích**: Lưu trữ cấu hình hệ thống
- **Đặc điểm**:
  - Thông tin cửa hàng
  - Thông tin liên hệ
  - Liên kết mạng xã hội

## 3. Các điểm tối ưu trong thiết kế

### 3.1. Denormalization
- Lưu thông tin shipping address trong Orders để giữ lịch sử
- Lưu price trong OrderItems để đảm bảo tính nhất quán về giá

### 3.2. Indexing
- Index cho email trong Users collection
- Index cho categoryId trong Books collection
- Index cho các trường tìm kiếm thường xuyên

### 3.3. Data Validation
- Kiểm tra giá trị price > 0
- Kiểm tra rating trong khoảng 1-5
- Đảm bảo email là duy nhất

## 4. Khả năng mở rộng
- Thiết kế hỗ trợ sharding theo userId hoặc categoryId
- Có thể dễ dàng thêm các tính năng mới như:
  - Wishlist (Danh sách yêu thích)
  - Coupon system (Hệ thống mã giảm giá)
  - Multiple addresses (Nhiều địa chỉ giao hàng)
  - Book recommendations (Gợi ý sách) 