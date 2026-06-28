-- ==========================================
-- 1. BẢNG USERS (Lưu sinh viên & cán bộ)
-- ==========================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_code VARCHAR(20) UNIQUE,       -- Khóa unique, cho phép NULL (đối với cán bộ)
    class_code VARCHAR(20),                -- Mã lớp (nhiều SV cùng lớp → không UNIQUE)
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255),            -- Cho phép NULL để phục vụ kích hoạt lần đầu
    full_name VARCHAR(100) NOT NULL,
    batch VARCHAR(10),                     -- Ví dụ: 'N23'
    major VARCHAR(10),                     -- Ví dụ: 'CN'
    role VARCHAR(20) NOT NULL CHECK (role IN ('STUDENT', 'MANAGER', 'ADMIN')),
    google_id VARCHAR(255) UNIQUE,         -- Lưu ID định danh từ Google
    avatar_url VARCHAR(500),               -- Ảnh đại diện (từ Google)
    require_password_change BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,      -- Soft delete thay vì xóa thật
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_student_code ON users(student_code);
CREATE INDEX idx_users_class_code ON users(class_code);

-- ==========================================
-- 2. BẢNG EVENTS (Quản lý vòng đời sự kiện)
-- ==========================================
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),                 -- Địa điểm tổ chức (nhập tay, ví dụ: 'Hội trường A1')
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    capacity INT NOT NULL,
    training_points INT DEFAULT 0,         -- Điểm rèn luyện
    status VARCHAR(20) NOT NULL CHECK (status IN ('DRAFT', 'PUBLISHED', 'CLOSED')),
    created_by UUID REFERENCES users(id),  -- FK trỏ về người tạo (không cascade, user soft delete)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_events_time CHECK (end_time > start_time)
);

-- ==========================================
-- 3. BẢNG EVENT_TARGETS (Đối tượng sự kiện)
--    Cho phép 1 sự kiện nhắm đến nhiều khóa/ngành
--    Nếu không có record nào → sự kiện dành cho toàn trường
-- ==========================================
CREATE TABLE event_targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    batch VARCHAR(10),                     -- Ví dụ: 'N22', 'N23' (NULL = không lọc theo khóa)
    major VARCHAR(10),                     -- Ví dụ: 'CN', 'AT' (NULL = không lọc theo ngành)

    CONSTRAINT unq_event_target UNIQUE (event_id, batch, major)
);

CREATE INDEX idx_event_targets_event ON event_targets(event_id);

-- ==========================================
-- 3.1 BẢNG EVENT_MANAGERS (Phân công người quản lý/CTV sự kiện)
-- ==========================================
CREATE TABLE event_managers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL,
    user_id UUID NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_event_managers_event 
        FOREIGN KEY (event_id) 
        REFERENCES events (id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_event_managers_user 
        FOREIGN KEY (user_id) 
        REFERENCES users (id) 
        ON DELETE CASCADE,
    CONSTRAINT uq_event_user UNIQUE (event_id, user_id)
);

CREATE INDEX idx_event_managers_event ON event_managers(event_id);
CREATE INDEX idx_event_managers_user ON event_managers(user_id);

-- ==========================================
-- 4. BẢNG EVENT_IMAGES (Nhiều ảnh cho 1 sự kiện)
-- ==========================================
CREATE TABLE event_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,       -- URL ảnh (poster, banner, minh họa...)
    display_order INT DEFAULT 0,           -- Thứ tự hiển thị
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_event_images_event ON event_images(event_id);

-- ==========================================
-- 5. BẢNG REGISTRATIONS (Đăng ký & Check-in)
-- ==========================================
CREATE TABLE registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('REGISTERED', 'CANCELLED')),
    checked_in_at TIMESTAMP,              -- NULL = chưa tham gia
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unq_event_student UNIQUE (event_id, student_id)
);

CREATE INDEX idx_registrations_event ON registrations(event_id);
CREATE INDEX idx_registrations_student ON registrations(student_id);

-- ==========================================
-- 6. BẢNG NOTIFICATIONS (Thông báo cho sinh viên)
-- ==========================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,  -- NULL nếu thông báo chung
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read);

-- ==========================================
-- 7. BẢNG REFRESH_TOKENS (Quản lý phiên đăng nhập)
-- ==========================================
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token VARCHAR(255) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expiry_date TIMESTAMP NOT NULL,
    revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_refresh_tokens_value ON refresh_tokens(token);