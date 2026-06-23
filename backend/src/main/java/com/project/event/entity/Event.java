package com.project.event.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "events")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String location;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    @Column(nullable = false)
    private Integer capacity;

    @Column(name = "training_points")
    @Builder.Default
    private Integer trainingPoints = 0;

    @Column(nullable = false, length = 20)
    private String status; // DRAFT, PUBLISHED, CLOSED

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // Mapping 1 Event -> Nhiều Target
    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<EventTarget> targets = new ArrayList<>();

    // Mapping 1 Event -> Nhiều Hình ảnh
    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<EventImage> images = new ArrayList<>();
    
    // Thêm phương thức tiện ích để thao tác với relationships
    public void addTarget(EventTarget target) {
        targets.add(target);
        target.setEvent(this);
    }
    
    public void addImage(EventImage image) {
        images.add(image);
        image.setEvent(this);
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
