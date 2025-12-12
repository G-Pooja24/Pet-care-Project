package com.petproject.petproject.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.petproject.petproject.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {
    User findByEmail(String email);
}