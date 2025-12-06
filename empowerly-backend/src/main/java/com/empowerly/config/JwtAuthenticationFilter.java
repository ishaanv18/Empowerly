package com.empowerly.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private com.empowerly.repository.UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        String token = null;
        String userId = null;
        String role = null;

        // Extract token from Authorization header
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
            try {
                userId = jwtUtil.getUserIdFromToken(token);
                role = jwtUtil.getRoleFromToken(token);
            } catch (Exception e) {
                logger.error("Error extracting user ID from token: " + e.getMessage());
            }
        }

        // Validate token and set authentication
        if (userId != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                if (jwtUtil.validateToken(token)) {
                    // Load the actual user object from database
                    var userOptional = userRepository.findById(userId);

                    if (!userOptional.isPresent()) {
                        // User has been deleted, don't authenticate
                        logger.warn("User " + userId + " has been deleted but token is still valid");
                        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                        response.getWriter().write("{\"error\": \"User account has been deleted\"}");
                        response.getWriter().flush();
                        return;
                    }

                    // Get the actual User object
                    var user = userOptional.get();

                    // Create authentication token with USER ID as principal (not the entire User
                    // object!)
                    SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + role);
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            user.getId(), null, Collections.singletonList(authority)); // ✅ Use user.getId() not user
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    // Set authentication in security context
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            } catch (Exception e) {
                logger.error("Error validating token: " + e.getMessage());
            }
        }

        filterChain.doFilter(request, response);
    }
}
