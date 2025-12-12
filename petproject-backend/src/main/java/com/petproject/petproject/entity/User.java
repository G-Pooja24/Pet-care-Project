package com.petproject.petproject.entity;

import java.util.Collection;
import java.util.Collections;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

//import io.jsonwebtoken.lang.Collections;
import jakarta.persistence.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

    private String otp;

    private Long otpExpiry;

    private String createdAt;

    public Collection<? extends GrantedAuthority> getAuthorities() {
      return Collections.singletonList(
        new SimpleGrantedAuthority("ROLE_" + role.name())
    );
    }


    

}














// import org.springframework.security.core.GrantedAuthority;
// import org.springframework.security.core.authority.SimpleGrantedAuthority;
// import org.springframework.security.core.userdetails.UserDetails;

// import java.util.Collection;
// import java.util.List;

// @Entity
// @Table(name = "users")
// public class User implements UserDetails {

//     @Id
//     @GeneratedValue(strategy = GenerationType.IDENTITY)
//     private Long id;

//     @Column(nullable = false)
//     private String name;

//     @Column(nullable = false, unique = true)
//     private String email;

//     @Column(nullable = false)
//     private String password;

//     @Enumerated(EnumType.STRING)
//     @Column(nullable = false)
//     private Role role;

//     public User() {}

//     public User(String name, String email, String password, Role role) {
//         this.name = name;
//         this.email = email;
//         this.password = password;
//         this.role = role;
//     }

//     // --- UserDetails implementation ---
//     @Override
//     public Collection<? extends GrantedAuthority> getAuthorities() {
//         // IMPORTANT: prepend "ROLE_" for hasRole() checks
//         return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
//     }

//     @Override
//     public String getPassword() {
//         return password;
//     }

//     @Override
//     public String getUsername() {
//         return email;
//     }

//     @Override
//     public boolean isAccountNonExpired() {
//         return true;
//     }

//     @Override
//     public boolean isAccountNonLocked() {
//         return true;
//     }

//     @Override
//     public boolean isCredentialsNonExpired() {
//         return true;
//     }

//     @Override
//     public boolean isEnabled() {
//         return true;
//     }

//     // --- Getters & Setters for other fields ---
//     public Long getId() { return id; }
//     public void setId(Long id) { this.id = id; }

//     public String getName() { return name; }
//     public void setName(String name) { this.name = name; }

//     public Role getRole() { return role; }
//     public void setRole(Role role) { this.role = role; }
// }
