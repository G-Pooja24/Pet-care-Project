package com.petproject.petproject.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.petproject.petproject.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {
    java.util.Optional<User> findByEmail(String email);
}