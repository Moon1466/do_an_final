# BookStore Database Design (MongoDB)

## Collections Overview

### 1. Users Collection
```json
{
  "_id": ObjectId,
  "email": String,
  "password": String (hashed),
  "fullName": String,
  "phone": String,
  "address": String,
  "role": String (enum: ["admin", "user"]),
  "createdAt": Date,
  "updatedAt": Date
}
```

### 2. Books Collection
```json
{
  "_id": ObjectId,
  "title": String,
  "author": String,
  "category": ObjectId (ref: "Categories"),
  "price": Number,
  "discount": Number,
  "stock": Number,
  "description": String,
  "images": [String],
  "publisher": String,
  "publishedDate": Date,
  "pages": Number,
  "language": String,
  "isbn": String,
  "ratings": [{
    "userId": ObjectId (ref: "Users"),
    "rating": Number,
    "comment": String,
    "createdAt": Date
  }],
  "createdAt": Date,
  "updatedAt": Date
}
```

### 3. Categories Collection
```json
{
  "_id": ObjectId,
  "name": String,
  "description": String,
  "slug": String,
  "createdAt": Date,
  "updatedAt": Date
}
```

### 4. Orders Collection
```json
{
  "_id": ObjectId,
  "userId": ObjectId (ref: "Users"),
  "items": [{
    "bookId": ObjectId (ref: "Books"),
    "quantity": Number,
    "price": Number
  }],
  "totalAmount": Number,
  "shippingAddress": {
    "fullName": String,
    "phone": String,
    "address": String,
    "city": String
  },
  "paymentMethod": String,
  "paymentStatus": String (enum: ["pending", "paid", "failed"]),
  "orderStatus": String (enum: ["pending", "processing", "shipped", "delivered", "cancelled"]),
  "createdAt": Date,
  "updatedAt": Date
}
```

### 5. Cart Collection
```json
{
  "_id": ObjectId,
  "userId": ObjectId (ref: "Users"),
  "items": [{
    "bookId": ObjectId (ref: "Books"),
    "quantity": Number
  }],
  "createdAt": Date,
  "updatedAt": Date
}
```

### 6. Settings Collection
```json
{
  "_id": ObjectId,
  "storeName": String,
  "address": String,
  "phone": String,
  "email": String,
  "socialLinks": {
    "facebook": String,
    "twitter": String,
    "instagram": String
  },
  "updatedAt": Date
}
```

## Relationships

1. **Books - Categories** (One-to-Many):
   - Mỗi sách thuộc về một danh mục
   - Một danh mục có thể chứa nhiều sách

2. **Users - Orders** (One-to-Many):
   - Một người dùng có thể có nhiều đơn hàng
   - Mỗi đơn hàng thuộc về một người dùng

3. **Users - Cart** (One-to-One):
   - Mỗi người dùng có một giỏ hàng
   - Mỗi giỏ hàng thuộc về một người dùng

4. **Books - Orders** (Many-to-Many):
   - Một đơn hàng có thể chứa nhiều sách
   - Một sách có thể xuất hiện trong nhiều đơn hàng

5. **Users - Books (Ratings)** (Many-to-Many):
   - Một người dùng có thể đánh giá nhiều sách
   - Một sách có thể được đánh giá bởi nhiều người dùng

## Indexes

1. **Books Collection:**
   - `title`: text index for search
   - `category`: để tối ưu truy vấn theo danh mục
   - `price`: để tối ưu sorting và filtering

2. **Orders Collection:**
   - `userId`: để tìm kiếm đơn hàng theo user
   - `orderStatus`: để filter theo trạng thái
   - `createdAt`: để sorting theo thời gian

3. **Users Collection:**
   - `email`: unique index
   - `role`: để phân quyền và filter

## Validation Rules

1. **Books:**
   - `price`: > 0
   - `stock`: >= 0
   - `ratings.rating`: 1-5

2. **Orders:**
   - `totalAmount`: > 0
   - `items.quantity`: > 0

3. **Users:**
   - `email`: valid email format
   - `phone`: valid phone format

## Lưu ý về Thiết kế

1. **Denormalization:**
   - Lưu thông tin giá trong `orders.items` để giữ lịch sử giá tại thời điểm mua
   - Lưu thông tin shipping address trong orders để giữ địa chỉ giao hàng lịch sử

2. **Performance:**
   - Sử dụng index cho các trường thường xuyên query
   - Tối ưu structure cho các operation phổ biến

3. **Scalability:**
   - Thiết kế hỗ trợ sharding theo `userId` hoặc `categoryId`
   - Cấu trúc document phù hợp cho việc mở rộng tính năng 