package com.project.event.repository;

import com.project.event.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByStudentCodeAndIsDeletedFalse(String studentCode);
    Optional<User> findByEmailAndIsDeletedFalse(String email);
    boolean existsByStudentCode(String studentCode);
    boolean existsByEmail(String email);
}
