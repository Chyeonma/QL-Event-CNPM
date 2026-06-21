package com.project.event.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "student_code", unique = true)
    private String studentCode;

    @Column(name = "class_code")
    private String classCode;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(name = "password_hash")
    private String passwordHash;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    private String batch;

    private String major;

    @Column(nullable = false)
    private String role;

    @Column(name = "google_id", unique = true)
    private String googleId;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    @Column(name = "require_password_change")
    @Builder.Default
    private Boolean requirePasswordChange = true;

    @Column(name = "is_deleted")
    @Builder.Default
    private Boolean isDeleted = false;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
