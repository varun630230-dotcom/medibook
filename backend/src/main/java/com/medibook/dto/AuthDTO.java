package com.medibook.dto;

import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AuthDTO {

    @NoArgsConstructor
    @AllArgsConstructor
    public static class RegisterRequest {
        @NotBlank
        private String firstName;
        @NotBlank
        private String lastName;
        @Email
        @NotBlank
        private String email;
        @NotBlank
        @Size(min = 6)
        private String password;
        private String phone;
        private String dateOfBirth;
        private String gender;
        private String role; // PATIENT, DOCTOR, ADMIN

        public String getFirstName() { return firstName; }
        public void setFirstName(String firstName) { this.firstName = firstName; }
        public String getLastName() { return lastName; }
        public void setLastName(String lastName) { this.lastName = lastName; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getDateOfBirth() { return dateOfBirth; }
        public void setDateOfBirth(String dateOfBirth) { this.dateOfBirth = dateOfBirth; }
        public String getGender() { return gender; }
        public void setGender(String gender) { this.gender = gender; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
    }

    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoginRequest {
        @Email
        @NotBlank
        private String email;
        @NotBlank
        private String password;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    @NoArgsConstructor
    @AllArgsConstructor
    public static class AuthResponse {
        private String token;
        private String id;
        private String email;
        private String firstName;
        private String lastName;
        private String role;
        private String profileImage;
        private String message;

        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getFirstName() { return firstName; }
        public void setFirstName(String firstName) { this.firstName = firstName; }
        public String getLastName() { return lastName; }
        public void setLastName(String lastName) { this.lastName = lastName; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        public String getProfileImage() { return profileImage; }
        public void setProfileImage(String profileImage) { this.profileImage = profileImage; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }

        public static AuthResponseBuilder builder() {
            return new AuthResponseBuilder();
        }

        public static class AuthResponseBuilder {
            private String token, id, email, firstName, lastName, role, profileImage, message;

            public AuthResponseBuilder token(String token) { this.token = token; return this; }
            public AuthResponseBuilder id(String id) { this.id = id; return this; }
            public AuthResponseBuilder email(String email) { this.email = email; return this; }
            public AuthResponseBuilder firstName(String firstName) { this.firstName = firstName; return this; }
            public AuthResponseBuilder lastName(String lastName) { this.lastName = lastName; return this; }
            public AuthResponseBuilder role(String role) { this.role = role; return this; }
            public AuthResponseBuilder profileImage(String profileImage) { this.profileImage = profileImage; return this; }
            public AuthResponseBuilder message(String message) { this.message = message; return this; }

            public AuthResponse build() {
                AuthResponse r = new AuthResponse();
                r.token = this.token;
                r.id = this.id;
                r.email = this.email;
                r.firstName = this.firstName;
                r.lastName = this.lastName;
                r.role = this.role;
                r.profileImage = this.profileImage;
                r.message = this.message;
                return r;
            }
        }
    }
}
