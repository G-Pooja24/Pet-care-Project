

package com.petproject.petproject.config;

import com.petproject.petproject.service.JwtService;
import com.petproject.petproject.Repository.UserRepository;
import com.petproject.petproject.entity.User;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserRepository repo;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        final String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);

        String token = null;
        String email = null;

        // 1️⃣ Extract Bearer token
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
            try {
                if (jwtService.validateToken(token)) {
                    email = jwtService.extractEmail(token);
                }
            } catch (Exception e) {
                // Invalid token → continue without authentication
                filterChain.doFilter(request, response);
                return;
            }
        }

        // 2️⃣ Authenticate only if email is found and no authentication exists
        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            User user = repo.findByEmail(email);

            if (user != null) {
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                                user, null, user.getAuthorities()
                        );

                authToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );

                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        filterChain.doFilter(request, response);
    }
}












































// package com.petproject.petproject.config;

// import com.petproject.petproject.service.JwtService;
// import com.petproject.petproject.Repository.UserRepository;
// import com.petproject.petproject.entity.User;

// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.http.HttpHeaders;
// import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
// import org.springframework.security.core.GrantedAuthority;
// import org.springframework.security.core.authority.SimpleGrantedAuthority;
// import org.springframework.security.core.context.SecurityContextHolder;
// import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
// import org.springframework.stereotype.Component;
// import org.springframework.web.filter.OncePerRequestFilter;

// import jakarta.servlet.FilterChain;
// import jakarta.servlet.ServletException;
// import jakarta.servlet.http.HttpServletRequest;
// import jakarta.servlet.http.HttpServletResponse;
// import java.io.IOException;
// import java.util.List;

// @Component
// public class JwtAuthFilter extends OncePerRequestFilter {

//     @Autowired
//     private JwtService jwtService;

//     @Autowired
//     private UserRepository repo;

//     @Override
//     protected void doFilterInternal(HttpServletRequest request,
//                                     HttpServletResponse response,
//                                     FilterChain filterChain) throws ServletException, IOException {

//         final String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
//         String email = null;
//         String token = null;

//         String role = claims.get("role", String.class);
// List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority(role));

// UsernamePasswordAuthenticationToken auth =
//         new UsernamePasswordAuthenticationToken(email, null, authorities);

// SecurityContextHolder.getContext().setAuthentication(auth);


//         if (authHeader != null && authHeader.startsWith("Bearer ")) {
//             token = authHeader.substring(7);
//             if (jwtService.validateToken(token)) {
//                 email = jwtService.extractEmail(token);
//             }
//         }

//         if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
//             User user = repo.findByEmail(email);
//             if (user != null) {
//                 // ✅ Use authorities from UserDetails
//                 UsernamePasswordAuthenticationToken authToken =
//                         new UsernamePasswordAuthenticationToken(
//                                 user, null, user.getAuthorities()
//                         );
//                 authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
//                 SecurityContextHolder.getContext().setAuthentication(authToken);
//             }
//         }

//         filterChain.doFilter(request, response);
//     }
// }
