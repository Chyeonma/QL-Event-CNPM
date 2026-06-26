# 🗄️ Sơ đồ Thực thể Liên kết (Entity Relationship Diagram - ERD)

Tài liệu này mô tả chi tiết kiến trúc cơ sở dữ liệu quan hệ (PostgreSQL) của hệ thống Quản lý Sự kiện PTIT, bao gồm sơ đồ ERD trực quan và giải thích các mối quan hệ.

---

## 🎨 1. Sơ đồ ERD (Mermaid)

```mermaid
erDiagram
    users ||--o{ events : "creates (Ban tổ chức tạo)"
    users ||--o{ registrations : "registers (Sinh viên đăng ký)"
    users ||--o{ notifications : "receives (Nhận thông báo)"
    users ||--o{ refresh_tokens : "owns (Sở hữu token)"

    events ||--o{ event_targets : "has_target (Giới hạn đối tượng)"
    events ||--o{ event_images : "has_image (Có các ảnh minh họa)"
    events ||--o{ registrations : "has_ticket (Có các vé đăng ký)"
    events ||--o{ notifications : "generates (Tạo thông báo)"

    users {
        UUID id PK "Khóa chính"
        VARCHAR student_code UK "Mã sinh viên (Unique)"
        VARCHAR class_code "Mã lớp"
        VARCHAR email UK "Email duy nhất"
        VARCHAR password_hash "Mật khẩu mã hóa"
        VARCHAR full_name "Họ và tên"
        VARCHAR batch "Khóa (ví dụ: N23)"
        VARCHAR major "Ngành học"
        VARCHAR role "STUDENT, MANAGER, ADMIN"
        VARCHAR google_id UK "Google OAuth ID"
        VARCHAR avatar_url "Link ảnh đại diện"
        BOOLEAN require_password_change "Yêu cầu đổi pass"
        BOOLEAN is_deleted "Soft delete"
        TIMESTAMP created_at "Ngày tạo"
    }

    events {
        UUID id PK "Khóa chính"
        VARCHAR title "Tên sự kiện"
        TEXT description "Mô tả chi tiết"
        VARCHAR location "Địa điểm tổ chức"
        TIMESTAMP start_time "Thời gian bắt đầu"
        TIMESTAMP end_time "Thời gian kết thúc"
        INT capacity "Giới hạn số lượng vé"
        INT training_points "Điểm rèn luyện nhận được"
        VARCHAR status "DRAFT, PUBLISHED, CLOSED"
        UUID created_by FK "Trỏ về users.id"
        TIMESTAMP created_at "Ngày tạo"
    }

    event_targets {
        UUID id PK "Khóa chính"
        UUID event_id FK "Trỏ về events.id (Cascade)"
        VARCHAR batch "Khóa áp dụng (NULL=Tất cả)"
        VARCHAR major "Ngành áp dụng (NULL=Tất cả)"
    }

    event_images {
        UUID id PK "Khóa chính"
        UUID event_id FK "Trỏ về events.id (Cascade)"
        VARCHAR image_url "Link ảnh sự kiện"
        INT display_order "Thứ tự sắp xếp"
        TIMESTAMP created_at "Ngày thêm"
    }

    registrations {
        UUID id PK "Khóa chính vé"
        UUID event_id FK "Trỏ về events.id"
        UUID student_id FK "Trỏ về users.id"
        VARCHAR status "REGISTERED, CANCELLED"
        TIMESTAMP checked_in_at "Thời gian điểm danh thực tế"
        TIMESTAMP registered_at "Thời gian bấm đăng ký"
    }

    notifications {
        UUID id PK "Khóa chính"
        UUID user_id FK "Trỏ về users.id (Người nhận)"
        UUID event_id FK "Trỏ về events.id (Sự kiện liên quan)"
        VARCHAR title "Tiêu đề"
        TEXT message "Nội dung"
        BOOLEAN is_read "Trạng thái đã đọc"
        TIMESTAMP created_at "Thời gian gửi"
    }

    refresh_tokens {
        UUID id PK "Khóa chính"
        VARCHAR token UK "Chuỗi Refresh Token"
        UUID user_id FK "Trỏ về users.id"
        TIMESTAMP expiry_date "Hạn sử dụng"
        BOOLEAN revoked "Đã thu hồi hay chưa"
        TIMESTAMP created_at "Ngày tạo"
    }
```

---

## 🔗 2. Bảng tổng hợp Mối quan hệ & Khóa ngoại (Cardinality)

| Bảng Nguồn (Parent) | Quan hệ | Bảng Đích (Child) | Khóa Ngoại (FK) | Mô tả nghiệp vụ | Ràng buộc xóa (On Delete) |
|:---|:---:|:---|:---|:---|:---|
| `users` | **1 : N** | `events` | `events.created_by` | Một cán bộ quản lý có thể tạo nhiều sự kiện. | `NO ACTION` (Soft delete user) |
| `users` | **1 : N** | `registrations` | `registrations.student_id`| Một sinh viên có thể đăng ký nhiều sự kiện khác nhau. | `CASCADE` |
| `events` | **1 : N** | `registrations` | `registrations.event_id` | Một sự kiện có tối đa `capacity` lượt đăng ký. | `CASCADE` |
| `events` | **1 : N** | `event_targets` | `event_targets.event_id` | Một sự kiện có thể nhắm tới nhiều mốc Khóa/Ngành cụ thể. | `CASCADE` |
| `events` | **1 : N** | `event_images` | `event_images.event_id` | Một sự kiện có thể có nhiều ảnh trình diễn Carousel. | `CASCADE` |
| `users` | **1 : N** | `notifications` | `notifications.user_id` | Một người dùng nhận nhiều thông báo cá nhân. | `CASCADE` |
| `events` | **1 : N** | `notifications` | `notifications.event_id`| Một sự kiện có thể sinh ra nhiều thông báo nhắc nhở. | `CASCADE` |
| `users` | **1 : N** | `refresh_tokens`| `refresh_tokens.user_id`| Quản lý phiên đăng nhập hợp lệ trên các thiết bị. | `CASCADE` |

---

## 🛡️ 3. Các ràng buộc duy nhất cốt lõi (Unique Constraints)
1. **`users(email)` & `users(student_code)` & `users(google_id)`**: Đảm bảo mỗi tài khoản là duy nhất trên toàn hệ thống.
2. **`registrations(event_id, student_id)`**: Ràng buộc composite ngăn chặn sinh viên bấm đăng ký nhận 2 vé cho cùng 1 sự kiện.
3. **`event_targets(event_id, batch, major)`**: Tránh bị trùng lặp bộ quy tắc lọc đối tượng cho cùng 1 sự kiện.
