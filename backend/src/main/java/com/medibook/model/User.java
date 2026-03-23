package com.medibook.model;

import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;
import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {

    @Id
    private String id;

    private String firstName;
    private String lastName;

    @Indexed(unique = true)
    private String email;

    private String password;
    private String phone;
    private String dateOfBirth;
    private String gender;
    private String bloodGroup;
    private String address;
    private String profileImage;

    private Role role = Role.PATIENT;
    private boolean active = true;

    @CreatedDate
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public enum Role {
        PATIENT, DOCTOR, ADMIN
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(String dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getBloodGroup() {
        return bloodGroup;
    }

    public void setBloodGroup(String bloodGroup) {
        this.bloodGroup = bloodGroup;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getProfileImage() {
        return profileImage;
    }

    public void setProfileImage(String profileImage) {
        this.profileImage = profileImage;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    // Builder pattern implementation
    public static UserBuilder builder() {
        return new UserBuilder();
    }

    public static class UserBuilder {
        private String id;
        private String firstName;
        private String lastName;
        private String email;
        private String password;
        private String phone;
        private String dateOfBirth;
        private String gender;
        private String bloodGroup;
        private String address;
        private String profileImage;
        private Role role = Role.PATIENT;
        private boolean active = true;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public UserBuilder id(String id) {
            this.id = id;
            return this;
        }

        public UserBuilder firstName(String firstName) {
            this.firstName = firstName;
            return this;
        }

        public UserBuilder lastName(String lastName) {
            this.lastName = lastName;
            return this;
        }

        public UserBuilder email(String email) {
            this.email = email;
            return this;
        }

        public UserBuilder password(String password) {
            this.password = password;
            return this;
        }

        public UserBuilder phone(String phone) {
            this.phone = phone;
            return this;
        }

        public UserBuilder dateOfBirth(String dateOfBirth) {
            this.dateOfBirth = dateOfBirth;
            return this;
        }

        public UserBuilder gender(String gender) {
            this.gender = gender;
            return this;
        }

        public UserBuilder bloodGroup(String bloodGroup) {
            this.bloodGroup = bloodGroup;
            return this;
        }

        public UserBuilder address(String address) {
            this.address = address;
            return this;
        }

        public UserBuilder profileImage(String profileImage) {
            this.profileImage = profileImage;
            return this;
        }

        public UserBuilder role(Role role) {
            this.role = role;
            return this;
        }

        public UserBuilder active(boolean active) {
            this.active = active;
            return this;
        }

        public UserBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public UserBuilder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public User build() {
            User user = new User();
            user.id = this.id;
            user.firstName = this.firstName;
            user.lastName = this.lastName;
            user.email = this.email;
            user.password = this.password;
            user.phone = this.phone;
            user.dateOfBirth = this.dateOfBirth;
            user.gender = this.gender;
            user.bloodGroup = this.bloodGroup;
            user.address = this.address;
            user.profileImage = this.profileImage;
            user.role = this.role;
            user.active = this.active;
            user.createdAt = this.createdAt;
            user.updatedAt = this.updatedAt;
            return user;
        }
    }
}
