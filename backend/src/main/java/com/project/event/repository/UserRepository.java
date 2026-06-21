package com.project.event.repository;

import com.project.event.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByStudentCodeAndIsDeletedFalse(String studentCode);
    Optional<User> findByEmailAndIsDeletedFalse(String email);
    boolean existsByStudentCode(String studentCode);
    boolean existsByEmail(String email);

    @Query("SELECT u FROM User u WHERE (u.studentCode = :identifier OR u.email = :identifier) AND u.isDeleted = false")
    Optional<User> findByIdentifier(@Param("identifier") String identifier);
}
