package com.medibook.service;

import com.medibook.dto.AuthDTO;
import com.medibook.model.Doctor;
import com.medibook.model.User;
import com.medibook.repository.DoctorRepository;
import com.medibook.repository.UserRepository;
import com.medibook.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private DoctorRepository doctorRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private AuthenticationManager authenticationManager;

    public AuthDTO.AuthResponse register(AuthDTO.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        User.Role role = User.Role.PATIENT;
        if (request.getRole() != null) {
            try {
                role = User.Role.valueOf(request.getRole().toUpperCase());
            } catch (Exception ignored) {}
        }

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .dateOfBirth(request.getDateOfBirth())
                .gender(request.getGender())
                .role(role)
                .build();

        user = userRepository.save(user);

        // If registering as doctor, create doctor profile
        if (role == User.Role.DOCTOR) {
            Doctor doctor = Doctor.builder()
                    .userId(user.getId())
                    .firstName(request.getFirstName())
                    .lastName(request.getLastName())
                    .email(request.getEmail())
                    .phone(request.getPhone())
                    .availableDays(Arrays.asList("Monday", "Tuesday", "Wednesday", "Thursday", "Friday"))
                    .timeSlots(List.of(
                        new Doctor.TimeSlot("09:00", "10:00"),
                        new Doctor.TimeSlot("10:00", "11:00"),
                        new Doctor.TimeSlot("11:00", "12:00"),
                        new Doctor.TimeSlot("14:00", "15:00"),
                        new Doctor.TimeSlot("15:00", "16:00"),
                        new Doctor.TimeSlot("16:00", "17:00")
                    ))
                    .build();
            doctorRepository.save(doctor);
        }

        String token = jwtUtil.generateToken(user.getEmail(), role.name());

        return AuthDTO.AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(role.name())
                .message("Registration successful")
                .build();
    }

    public AuthDTO.AuthResponse login(AuthDTO.LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

        return AuthDTO.AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole().name())
                .profileImage(user.getProfileImage())
                .message("Login successful")
                .build();
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User updateProfile(String userId, User updatedUser) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setFirstName(updatedUser.getFirstName());
        user.setLastName(updatedUser.getLastName());
        user.setPhone(updatedUser.getPhone());
        user.setDateOfBirth(updatedUser.getDateOfBirth());
        user.setGender(updatedUser.getGender());
        user.setBloodGroup(updatedUser.getBloodGroup());
        user.setAddress(updatedUser.getAddress());
        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }
}
