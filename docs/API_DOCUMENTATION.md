# 📚 Tài liệu Tổng hợp RESTful API - Hệ thống Quản lý Sự kiện PTIT

Tài liệu này tổng hợp toàn bộ các endpoint RESTful API đang hoạt động trong hệ thống Backend (Spring Boot), phân chia theo từng luồng nghiệp vụ cụ thể.

---

## 🔐 1. Luồng Xác thực & Tài khoản (`AuthController`)
*Base URL: `/api/auth`*

| STT | HTTP Method | Endpoint | Quyền (Role) | Chức năng chính |
|:---:|:---|:---|:---:|:---|
| 1.1 | `POST` | `/api/auth/login` | **Public** | Đăng nhập hệ thống bằng Email/Mã sinh viên + Mật khẩu. Trả về JWT Token. |
| 1.2 | `POST` | `/api/auth/google-login` | **Public** | Đăng nhập nhanh qua tài khoản Google OAuth2. |
| 1.3 | `POST` | `/api/auth/change-password` | **Authenticated** | Đổi mật khẩu người dùng (Bắt buộc gọi nếu `require_password_change = true`). |
| 1.4 | `GET` | `/api/auth/me` | **Authenticated** | Lấy thông tin chi tiết tài khoản hiện tại (Tên, vai trò, mã SV, điểm rèn luyện...). |
| 1.5 | `POST` | `/api/auth/forgot-password` | **Public** | Yêu cầu cấp lại mật khẩu mới qua Email đã đăng ký. |
| 1.6 | `POST` | `/api/auth/refresh` | **Public** | Cấp lại Access Token mới dựa vào Refresh Token hợp lệ. |
| 1.7 | `POST` | `/api/auth/logout` | **Authenticated** | Đăng xuất khỏi hệ thống, hủy hiệu lực phiên làm việc hiện tại. |

---

## 🎓 2. Luồng Sự kiện cho Sinh viên & Công khai (`EventController`)
*Base URL: `/api/events`*

| STT | HTTP Method | Endpoint | Quyền (Role) | Chức năng chính |
|:---:|:---|:---|:---:|:---|
| 2.1 | `GET` | `/api/events` | **Public** | Lấy danh sách sự kiện công khai (hỗ trợ tìm kiếm từ khóa, lọc trạng thái `PUBLISHED` / `CLOSED`). |
| 2.2 | `GET` | `/api/events/{id}` | **Public** | Xem chi tiết thông tin, thời gian và tiêu chí tham gia của một sự kiện. |
| 2.3 | `POST` | `/api/events/{id}/register` | **Student** | Sinh viên đăng ký tham gia sự kiện và nhận vé mã QR. |
| 2.4 | `DELETE` | `/api/events/{id}/register` | **Student** | Sinh viên tự hủy suất vé đã đăng ký trước khi sự kiện diễn ra. |
| 2.5 | `GET` | `/api/events/my-registrations` | **Student** | Lấy danh sách toàn bộ các vé sự kiện mà sinh viên hiện tại đã đăng ký. |
| 2.6 | `POST` | `/api/events/{id}/check-in` | **Student** | Sinh viên quét mã QR tại quầy Check-in để điểm danh tham dự. |

### 🎯 2.1 Luồng Ban Tổ Chức & Cộng Tác Viên Sự Kiện (`EventController` - Manager Operations)
*Base URL: `/api/events`*

| STT | HTTP Method | Endpoint | Quyền (Role) | Chức năng chính |
|:---:|:---|:---|:---:|:---|
| 2.1.1 | `GET` | `/api/events/{id}/managers` | **Public / Authenticated** | Lấy danh sách các tài khoản được phân quyền Quản lý/CTV của sự kiện. |
| 2.1.2 | `POST` | `/api/events/{id}/managers` | **Admin / Manager** | Cấp quyền Quản lý/CTV sự kiện cho tài khoản bằng Email hoặc Mã sinh viên. |
| 2.1.3 | `DELETE` | `/api/events/{id}/managers/{userId}` | **Admin / Manager** | Thu hồi quyền Quản lý/CTV của một tài khoản khỏi sự kiện. |
| 2.1.4 | `GET` | `/api/events/{id}/registrations` | **Manager / Admin** | Ban tổ chức xem danh sách sinh viên đăng ký tại trang sự kiện công khai. |
| 2.1.5 | `POST` | `/api/events/registrations/{regId}/manual-check-in` | **Manager / Admin** | Ban tổ chức thực hiện điểm danh thủ công cho sinh viên. |
| 2.1.6 | `POST` | `/api/events/registrations/{regId}/cancel-check-in` | **Manager / Admin** | Ban tổ chức hủy điểm danh (hoàn tác về trạng thái Chờ check-in). |

---

## 🛠️ 3. Luồng Quản lý Sự kiện (`AdminEventController`)
*Base URL: `/api/admin/events`*

| STT | HTTP Method | Endpoint | Quyền (Role) | Chức năng chính |
|:---:|:---|:---|:---:|:---|
| 3.1 | `GET` | `/api/admin/events` | **Admin / Manager** | Xem danh sách tất cả sự kiện trên hệ thống (bao gồm cả bản nháp `DRAFT` và đã đóng `CLOSED`). |
| 3.2 | `POST` | `/api/admin/events` | **Admin / Manager** | Tạo mới một sự kiện kèm ảnh phông nền, mốc thời gian và quy định đối tượng tham gia. |
| 3.3 | `GET` | `/api/admin/events/{id}` | **Admin / Manager** | Lấy thông tin chi tiết quản trị của một sự kiện theo ID. |
| 3.4 | `PUT` | `/api/admin/events/{id}` | **Admin / Manager** | Chỉnh sửa thông tin sự kiện hoặc cập nhật trạng thái đóng/mở đăng ký. |
| 3.5 | `DELETE` | `/api/admin/events/{id}` | **Admin / Manager** | Xóa vĩnh viễn sự kiện khỏi hệ thống. |

---

## 👥 4. Luồng Quản lý Người dùng (`AdminUserController`)
*Base URL: `/api/admin/users`*

| STT | HTTP Method | Endpoint | Quyền (Role) | Chức năng chính |
|:---:|:---|:---|:---:|:---|
| 4.1 | `GET` | `/api/admin/users` | **Admin** | Lấy danh sách toàn bộ người dùng trong hệ thống phân theo vai trò. |
| 4.2 | `POST` | `/api/admin/users` | **Admin** | Cấp mới tài khoản cho Sinh viên hoặc Cán bộ quản lý. |
| 4.3 | `GET` | `/api/admin/users/{id}` | **Admin** | Lấy thông tin chi tiết một tài khoản người dùng theo ID. |
| 4.4 | `PUT` | `/api/admin/users/{id}` | **Admin** | Cập nhật thông tin cá nhân và phân quyền cho người dùng. |
| 4.5 | `DELETE` | `/api/admin/users/{id}` | **Admin** | Khóa (Vô hiệu hóa) tài khoản người dùng vi phạm. |
| 4.6 | `POST` | `/api/admin/users/{id}/unlock`| **Admin** | Khôi phục hoạt động / Mở khóa cho tài khoản bị khóa. |

---

## 📋 5. Luồng Điểm danh & Danh sách Đăng ký (`AdminRegistrationController`)
*Base URL: `/api/admin/events`*

| STT | HTTP Method | Endpoint | Quyền (Role) | Chức năng chính |
|:---:|:---|:---|:---:|:---|
| 5.1 | `GET` | `/api/admin/events/{eventId}/registrations` | **Admin / Manager** | Xem danh sách toàn bộ sinh viên đã đăng ký tham gia một sự kiện cụ thể. |
| 5.2 | `GET` | `/api/admin/events/registrations/all` | **Admin / Manager** | Lấy tổng hợp tất cả lượt đăng ký sự kiện trên toàn hệ thống. |
| 5.3 | `POST` | `/api/admin/events/registrations/{regId}/check-in` | **Admin / Manager** | Cán bộ quản lý điểm danh thủ công cho sinh viên tại sự kiện. |
| 5.4 | `POST` | `/api/admin/events/registrations/{regId}/cancel-check-in` | **Admin / Manager** | Cán bộ quản lý hủy điểm danh cho sinh viên (hoàn tác về Chờ check-in). |
| 5.5 | `DELETE` | `/api/admin/events/registrations/{regId}` | **Admin / Manager** | Ban tổ chức hủy suất đăng ký tham gia của sinh viên. |
