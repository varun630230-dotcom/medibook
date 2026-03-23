package com.medibook.controller;

import com.medibook.dto.AuthDTO;
import com.medibook.model.User;
import com.medibook.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthDTO.AuthResponse> register(@Valid @RequestBody AuthDTO.RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthDTO.AuthResponse> login(@Valid @RequestBody AuthDTO.LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        User user = authService.getUserByEmail(userDetails.getUsername());
        user.setPassword(null); // Don't return password
        return ResponseEntity.ok(user);
    }

    @PutMapping("/profile/{userId}")
    public ResponseEntity<User> updateProfile(@PathVariable String userId,
                                               @RequestBody User updatedUser) {
        User user = authService.updateProfile(userId, updatedUser);
        user.setPassword(null);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "service", "MediBook API"));
    }
}
