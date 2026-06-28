package com.project.event.repository;

import com.project.event.entity.EventManager;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EventManagerRepository extends JpaRepository<EventManager, UUID> {
    List<EventManager> findByEventId(UUID eventId);
    List<EventManager> findByUserId(UUID userId);
    boolean existsByEventIdAndUserId(UUID eventId, UUID userId);
    Optional<EventManager> findByEventIdAndUserId(UUID eventId, UUID userId);
}
