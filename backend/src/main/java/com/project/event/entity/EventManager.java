package com.project.event.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "event_managers", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"event_id", "user_id"})
})
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class EventManager {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "assigned_at", updatable = false)
    private LocalDateTime assignedAt;

    @PrePersist
    protected void onCreate() {
        if (assignedAt == null) {
            assignedAt = LocalDateTime.now();
        }
    }
}
