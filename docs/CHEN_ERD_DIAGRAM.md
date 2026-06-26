# 💠 Sơ đồ Quan hệ Thực thể theo chuẩn Chen (Chen Notation ERD)

Sơ đồ dưới đây mô tả cấu trúc cơ sở dữ liệu theo mô hình truyền thống Chen Notation:
- **Thực thể (Entity)**: Thể hiện bằng **Ô vuông (Rectangle)** màu xanh dương.
- **Mối quan hệ (Relationship)**: Thể hiện bằng **Hình thoi (Diamond)** màu vàng cam.
- **Thuộc tính (Attribute)**: Thể hiện bằng **Hình bầu dục / Ô tròn (Oval)** (Thuộc tính gạch chân `id` là Khóa chính).

---

```mermaid
flowchart TD
    %% ===================================
    %% 1. CÁC THỰC THỂ CHÍNH (Ô VUÔNG)
    %% ===================================
    USER["USER<br>(Người dùng)"]
    EVENT["EVENT<br>(Sự kiện)"]
    REG["REGISTRATION<br>(Phiếu đăng ký)"]
    TARGET["EVENT_TARGET<br>(Đối tượng lọc)"]
    NOTIF["NOTIFICATION<br>(Thông báo)"]

    %% ===================================
    %% 2. CÁC MỐI QUAN HỆ (HÌNH THOI)
    %% ===================================
    CREATE{"TẠO"}
    REGISTER{"ĐĂNG KÝ VÉ"}
    HAS_TARGET{"ÁP DỤNG CHO"}
    RECEIVE{"NHẬN"}

    %% ===================================
    %% 3. THUỘC TÍNH CỦA USER (Ô TRÒN)
    %% ===================================
    U_ID(("<u>id</u>"))
    U_CODE(["student_code"])
    U_NAME(["full_name"])
    U_EMAIL(["email"])
    U_ROLE(["role"])

    USER --- U_ID
    USER --- U_CODE
    USER --- U_NAME
    USER --- U_EMAIL
    USER --- U_ROLE

    %% ===================================
    %% 4. THUỘC TÍNH CỦA EVENT (Ô TRÒN)
    %% ===================================
    E_ID(("<u>id</u>"))
    E_TITLE(["title"])
    E_TIME(["start_time"])
    E_CAP(["capacity"])
    E_PTS(["training_points"])
    E_STT(["status"])

    EVENT --- E_ID
    EVENT --- E_TITLE
    EVENT --- E_TIME
    EVENT --- E_CAP
    EVENT --- E_PTS
    EVENT --- E_STT

    %% ===================================
    %% 5. THUỘC TÍNH CỦA REGISTRATION
    %% ===================================
    R_ID(("<u>id</u>"))
    R_STT(["status"])
    R_CHK(["checked_in_at"])

    REG --- R_ID
    REG --- R_STT
    REG --- R_CHK

    %% ===================================
    %% 6. THUỘC TÍNH CỦA TARGET
    %% ===================================
    T_ID(("<u>id</u>"))
    T_BATCH(["batch"])
    T_MAJOR(["major"])

    TARGET --- T_ID
    TARGET --- T_BATCH
    TARGET --- T_MAJOR

    %% ===================================
    %% 7. THUỘC TÍNH CỦA NOTIFICATION
    %% ===================================
    N_ID(("<u>id</u>"))
    N_TITLE(["title"])
    N_READ(["is_read"])

    NOTIF --- N_ID
    NOTIF --- N_TITLE
    NOTIF --- N_READ

    %% ===================================
    %% 8. KẾT NỐI QUAN HỆ (THỰC THỂ - HÌNH THOI - THỰC THỂ)
    %% ===================================
    USER ---|1| CREATE
    CREATE --->|N| EVENT

    USER ---|1| REGISTER
    EVENT ---|1| REGISTER
    REGISTER --->|N| REG

    EVENT ---|1| HAS_TARGET
    HAS_TARGET --->|N| TARGET

    USER ---|1| RECEIVE
    EVENT ---|1| RECEIVE
    RECEIVE --->|N| NOTIF

    %% Style quy chuẩn màu sắc
    style USER fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a8a
    style EVENT fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a8a
    style REG fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a8a
    style TARGET fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a8a
    style NOTIF fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a8a

    style CREATE fill:#fef3c7,stroke:#b45309,stroke-width:2px,color:#92400e
    style REGISTER fill:#fef3c7,stroke:#b45309,stroke-width:2px,color:#92400e
    style HAS_TARGET fill:#fef3c7,stroke:#b45309,stroke-width:2px,color:#92400e
    style RECEIVE fill:#fef3c7,stroke:#b45309,stroke-width:2px,color:#92400e
```
