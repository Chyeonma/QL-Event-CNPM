package com.project.event.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "event_targets")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class EventTarget {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    private String batch; // Khóa (Ví dụ: N22, N23). Null nếu không giới hạn

    private String major; // Ngành (Ví dụ: CN, AT). Null nếu không giới hạn
}
