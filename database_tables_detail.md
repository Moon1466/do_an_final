# Chi tiết các Collection trong MongoDB

## 1. Users Collection
| STT | Name | Type | Key | Mô tả |
|-----|------|------|-----|--------|
| 1 | _id | ObjectId | PK | ID người dùng |
| 2 | email | String | Unique | Email đăng nhập |
| 3 | password | String | | Mật khẩu đã mã hóa |
| 4 | fullName | String | | Họ tên người dùng |
| 5 | phone | String | | Số điện thoại |
| 6 | address | String | | Địa chỉ |
| 7 | role | String | | Vai trò (admin/user) |
| 8 | createdAt | DateTime | | Ngày tạo tài khoản |
| 9 | updatedAt | DateTime | | Ngày cập nhật |

## 2. Books Collection
| STT | Name | Type | Key | Mô tả |
|-----|------|------|-----|--------|
| 1 | _id | ObjectId | PK | ID sách |
| 2 | title | String | | Tên sách |
| 3 | author | String | | Tác giả |
| 4 | categoryId | ObjectId | FK | ID danh mục |
| 5 | price | Decimal | | Giá sách |
| 6 | discount | Decimal | | Mức giảm giá |
| 7 | stock | Int | | Số lượng tồn kho |
| 8 | description | String | | Mô tả chi tiết |
| 9 | images | Array[String] | | Mảng URL hình ảnh |
| 10 | publisher | String | | Nhà xuất bản |
| 11 | publishedDate | DateTime | | Ngày xuất bản |
| 12 | pages | Int | | Số trang |
| 13 | language | String | | Ngôn ngữ |
| 14 | isbn | String | | Mã ISBN |
| 15 | createdAt | DateTime | | Ngày tạo |
| 16 | updatedAt | DateTime | | Ngày cập nhật |

## 3. Categories Collection
| STT | Name | Type | Key | Mô tả |
|-----|------|------|-----|--------|
| 1 | _id | ObjectId | PK | ID danh mục |
| 2 | name | String | | Tên danh mục |
| 3 | description | String | | Mô tả danh mục |
| 4 | slug | String | | Đường dẫn thân thiện SEO |
| 5 | createdAt | DateTime | | Ngày tạo |
| 6 | updatedAt | DateTime | | Ngày cập nhật |

## 4. Orders Collection
| STT | Name | Type | Key | Mô tả |
|-----|------|------|-----|--------|
| 1 | _id | ObjectId | PK | ID đơn hàng |
| 2 | userId | ObjectId | FK | ID người dùng |
| 3 | totalAmount | Decimal | | Tổng giá trị đơn hàng |
| 4 | shippingFullName | String | | Tên người nhận |
| 5 | shippingPhone | String | | SĐT người nhận |
| 6 | shippingAddress | String | | Địa chỉ giao hàng |
| 7 | shippingCity | String | | Thành phố |
| 8 | paymentMethod | String | | Phương thức thanh toán |
| 9 | paymentStatus | String | | Trạng thái thanh toán |
| 10 | orderStatus | String | | Trạng thái đơn hàng |
| 11 | createdAt | DateTime | | Ngày tạo |
| 12 | updatedAt | DateTime | | Ngày cập nhật |

## 5. OrderItems Collection
| STT | Name | Type | Key | Mô tả |
|-----|------|------|-----|--------|
| 1 | _id | ObjectId | PK | ID chi tiết đơn hàng |
| 2 | orderId | ObjectId | FK | ID đơn hàng |
| 3 | bookId | ObjectId | FK | ID sách |
| 4 | quantity | Int | | Số lượng |
| 5 | price | Decimal | | Giá tại thời điểm mua |
| 6 | createdAt | DateTime | | Ngày tạo |

## 6. Cart Collection
| STT | Name | Type | Key | Mô tả |
|-----|------|------|-----|--------|
| 1 | _id | ObjectId | PK | ID giỏ hàng |
| 2 | userId | ObjectId | FK | ID người dùng |
| 3 | createdAt | DateTime | | Ngày tạo |
| 4 | updatedAt | DateTime | | Ngày cập nhật |

## 7. CartItems Collection
| STT | Name | Type | Key | Mô tả |
|-----|------|------|-----|--------|
| 1 | _id | ObjectId | PK | ID chi tiết giỏ hàng |
| 2 | cartId | ObjectId | FK | ID giỏ hàng |
| 3 | bookId | ObjectId | FK | ID sách |
| 4 | quantity | Int | | Số lượng |
| 5 | createdAt | DateTime | | Ngày tạo |

## 8. Ratings Collection
| STT | Name | Type | Key | Mô tả |
|-----|------|------|-----|--------|
| 1 | _id | ObjectId | PK | ID đánh giá |
| 2 | userId | ObjectId | FK | ID người dùng |
| 3 | bookId | ObjectId | FK | ID sách |
| 4 | rating | Int | | Điểm đánh giá (1-5) |
| 5 | comment | String | | Nội dung đánh giá |
| 6 | createdAt | DateTime | | Ngày tạo |

## 9. Settings Collection
| STT | Name | Type | Key | Mô tả |
|-----|------|------|-----|--------|
| 1 | _id | ObjectId | PK | ID cài đặt |
| 2 | storeName | String | | Tên cửa hàng |
| 3 | address | String | | Địa chỉ |
| 4 | phone | String | | Số điện thoại |
| 5 | email | String | | Email |
| 6 | facebook | String | | Link Facebook |
| 7 | twitter | String | | Link Twitter |
| 8 | instagram | String | | Link Instagram |
| 9 | updatedAt | DateTime | | Ngày cập nhật |

## Chú thích:
- PK (Primary Key): Khóa chính
- FK (Foreign Key): Khóa ngoại
- DateTime: Kiểu dữ liệu ngày giờ (ISO Date)
- ObjectId: Định danh duy nhất trong MongoDB
- Array[String]: Mảng các chuỗi 