-- ==============================================================================
-- SQL Script: Thêm sinh viên B23DCCN001 - B23DCCN005 đăng ký sự kiện
-- Event ID: b3797d22-b1f1-44c0-a489-5a9e448b2b8a
-- ==============================================================================

-- BƯỚC 1: Đảm bảo các sinh viên từ B23DCCN001 đến B23DCCN005 đã tồn tại trong bảng `users`
-- Nếu chưa có, hệ thống sẽ tự động thêm mới vào (với mật khẩu mặc định hoặc hash tùy ý).
INSERT INTO users (student_code, full_name, email, class_code, batch, major, role)
VALUES 
    ('B23DCCN001', 'Nguyễn Văn An', 'b23dccn001@stu.ptit.edu.vn', 'D23CQCN01-B', 'N23', 'CN', 'STUDENT'),
    ('B23DCCN002', 'Trần Thị Bình', 'b23dccn002@stu.ptit.edu.vn', 'D23CQCN01-B', 'N23', 'CN', 'STUDENT'),
    ('B23DCCN003', 'Le Hoàng Cường', 'b23dccn003@stu.ptit.edu.vn', 'D23CQCN02-B', 'N23', 'CN', 'STUDENT'),
    ('B23DCCN004', 'Phạm Thị Dung', 'b23dccn004@stu.ptit.edu.vn', 'D23CQCN02-B', 'N23', 'CN', 'STUDENT'),
    ('B23DCCN005', 'Hoàng Văn Em', 'b23dccn005@stu.ptit.edu.vn', 'D23CQCN03-B', 'N23', 'CN', 'STUDENT')
ON CONFLICT (student_code) DO NOTHING;

-- BƯỚC 2: Thêm các sinh viên này vào danh sách đăng ký (`registrations`) của sự kiện
-- Sử dụng ON CONFLICT để tránh lỗi nếu sinh viên đã đăng ký từ trước.
INSERT INTO registrations (event_id, student_id, status, registered_at)
SELECT 
    'b3797d22-b1f1-44c0-a489-5a9e448b2b8a'::uuid AS event_id,
    id AS student_id,
    'REGISTERED' AS status,
    CURRENT_TIMESTAMP AS registered_at
FROM users
WHERE student_code IN ('B23DCCN001', 'B23DCCN002', 'B23DCCN003', 'B23DCCN004', 'B23DCCN005')
ON CONFLICT (event_id, student_id) 
DO UPDATE SET status = 'REGISTERED';

-- BƯỚC 3 (Tùy chọn): Kiểm tra lại kết quả danh sách sinh viên vừa đăng ký
SELECT 
    r.id AS registration_id,
    u.student_code,
    u.full_name,
    u.class_code,
    r.status,
    r.registered_at
FROM registrations r
JOIN users u ON r.student_id = u.id
WHERE r.event_id = 'b3797d22-b1f1-44c0-a489-5a9e448b2b8a'::uuid
  AND u.student_code IN ('B23DCCN001', 'B23DCCN002', 'B23DCCN003', 'B23DCCN004', 'B23DCCN005')
ORDER BY u.student_code;
