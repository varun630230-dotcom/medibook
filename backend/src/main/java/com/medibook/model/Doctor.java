package com.medibook.model;

import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "doctors")
@EntityListeners(AuditingEntityListener.class)
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String userId;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String specialization;
    private String qualification;
    private int experienceYears;
    private String bio;
    private String profileImage;
    private String hospital;
    private String location;
    private double consultationFee;
    private double rating;
    private int totalReviews;

    @ElementCollection(fetch = FetchType.LAZY)
    @OrderColumn(name = "list_idx")
    private List<String> availableDays = new ArrayList<>();
    @ElementCollection(fetch = FetchType.LAZY)
    @OrderColumn(name = "list_idx")
    private List<TimeSlot> timeSlots = new ArrayList<>();
    @ElementCollection(fetch = FetchType.LAZY)
    @OrderColumn(name = "list_idx")
    private List<String> leaveDates = new ArrayList<>();
    private boolean available = true;
    private boolean approved = false;
    private boolean rejected = false;
    private String rejectionReason;

    @ElementCollection(fetch = FetchType.LAZY)
    @OrderColumn(name = "list_idx")
    private List<String> availableTypes = new ArrayList<>();
    @ElementCollection(fetch = FetchType.LAZY)
    @OrderColumn(name = "list_idx")
    private List<WorkExperience> workExperience = new ArrayList<>();
    @ElementCollection(fetch = FetchType.LAZY)
    @OrderColumn(name = "list_idx")
    private List<DocumentRecord> documents = new ArrayList<>();

    @Embeddable
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WorkExperience {
        private String role;
        private String hospital;
        @Column(name = "start_date")
        private String from;
        @Column(name = "end_date")
        private String to;
        private String description;
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        public String getHospital() { return hospital; }
        public void setHospital(String hospital) { this.hospital = hospital; }
        public String getFrom() { return from; }
        public void setFrom(String from) { this.from = from; }
        public String getTo() { return to; }
        public void setTo(String to) { this.to = to; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }

    @Embeddable
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DocumentRecord {
        private String name;
        private String type;
        @Column(name = "doc_year")
        private String year;
        
        @Lob
        @Column(columnDefinition="LONGTEXT")
        private String fileData;
        
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public String getYear() { return year; }
        public void setYear(String year) { this.year = year; }
        public String getFileData() { return fileData; }
        public void setFileData(String fileData) { this.fileData = fileData; }
    }

    @CreatedDate
    private LocalDateTime createdAt;

    @Embeddable
    public static class TimeSlot {
        private String startTime;
        private String endTime;

        public TimeSlot() {}

        public TimeSlot(String startTime, String endTime) {
            this.startTime = startTime;
            this.endTime = endTime;
        }

        public String getStartTime() { return startTime; }
        public void setStartTime(String startTime) { this.startTime = startTime; }
        public String getEndTime() { return endTime; }
        public void setEndTime(String endTime) { this.endTime = endTime; }
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }
    public String getQualification() { return qualification; }
    public void setQualification(String qualification) { this.qualification = qualification; }
    public int getExperienceYears() { return experienceYears; }
    public void setExperienceYears(int experienceYears) { this.experienceYears = experienceYears; }
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    public String getProfileImage() { return profileImage; }
    public void setProfileImage(String profileImage) { this.profileImage = profileImage; }
    public String getHospital() { return hospital; }
    public void setHospital(String hospital) { this.hospital = hospital; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public double getConsultationFee() { return consultationFee; }
    public void setConsultationFee(double consultationFee) { this.consultationFee = consultationFee; }
    public double getRating() { return rating; }
    public void setRating(double rating) { this.rating = rating; }
    public int getTotalReviews() { return totalReviews; }
    public void setTotalReviews(int totalReviews) { this.totalReviews = totalReviews; }
    public List<String> getAvailableDays() { return availableDays; }
    public void setAvailableDays(List<String> availableDays) { this.availableDays = availableDays; }
    public List<TimeSlot> getTimeSlots() { return timeSlots; }
    public void setTimeSlots(List<TimeSlot> timeSlots) { this.timeSlots = timeSlots; }
    public List<String> getLeaveDates() { return leaveDates; }
    public void setLeaveDates(List<String> leaveDates) { this.leaveDates = leaveDates; }
    public boolean isAvailable() { return available; }
    public void setAvailable(boolean available) { this.available = available; }
    public boolean isApproved() { return approved; }
    public void setApproved(boolean approved) { this.approved = approved; }
    public boolean isRejected() { return rejected; }
    public void setRejected(boolean rejected) { this.rejected = rejected; }
    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public List<String> getAvailableTypes() { return availableTypes; }
    public void setAvailableTypes(List<String> availableTypes) { this.availableTypes = availableTypes; }
    public List<WorkExperience> getWorkExperience() { return workExperience; }
    public void setWorkExperience(List<WorkExperience> workExperience) { this.workExperience = workExperience; }
    public List<DocumentRecord> getDocuments() { return documents; }
    public void setDocuments(List<DocumentRecord> documents) { this.documents = documents; }

    // Builder
    public static DoctorBuilder builder() {
        return new DoctorBuilder();
    }

    public static class DoctorBuilder {
        private String id, userId, firstName, lastName, email, phone, specialization, qualification;
        private int experienceYears;
        private String bio, profileImage, hospital, location;
        private double consultationFee, rating;
        private int totalReviews;
        private List<String> availableDays = new ArrayList<>();
        private List<TimeSlot> timeSlots = new ArrayList<>();
        private List<String> leaveDates = new ArrayList<>();
        private boolean available = true;
        private boolean approved = false;

    private List<String> availableTypes = new ArrayList<>();
    private List<WorkExperience> workExperience = new ArrayList<>();
    private List<DocumentRecord> documents = new ArrayList<>();
        private LocalDateTime createdAt;

        public DoctorBuilder id(String id) { this.id = id; return this; }
        public DoctorBuilder userId(String userId) { this.userId = userId; return this; }
        public DoctorBuilder firstName(String firstName) { this.firstName = firstName; return this; }
        public DoctorBuilder lastName(String lastName) { this.lastName = lastName; return this; }
        public DoctorBuilder email(String email) { this.email = email; return this; }
        public DoctorBuilder phone(String phone) { this.phone = phone; return this; }
        public DoctorBuilder specialization(String specialization) { this.specialization = specialization; return this; }
        public DoctorBuilder qualification(String qualification) { this.qualification = qualification; return this; }
        public DoctorBuilder experienceYears(int experienceYears) { this.experienceYears = experienceYears; return this; }
        public DoctorBuilder bio(String bio) { this.bio = bio; return this; }
        public DoctorBuilder profileImage(String profileImage) { this.profileImage = profileImage; return this; }
        public DoctorBuilder hospital(String hospital) { this.hospital = hospital; return this; }
        public DoctorBuilder location(String location) { this.location = location; return this; }
        public DoctorBuilder consultationFee(double consultationFee) { this.consultationFee = consultationFee; return this; }
        public DoctorBuilder rating(double rating) { this.rating = rating; return this; }
        public DoctorBuilder totalReviews(int totalReviews) { this.totalReviews = totalReviews; return this; }
        public DoctorBuilder availableDays(List<String> availableDays) { this.availableDays = availableDays; return this; }
        public DoctorBuilder timeSlots(List<TimeSlot> timeSlots) { this.timeSlots = timeSlots; return this; }
        public DoctorBuilder leaveDates(List<String> leaveDates) { this.leaveDates = leaveDates; return this; }
        public DoctorBuilder available(boolean available) { this.available = available; return this; }
        public DoctorBuilder approved(boolean approved) { this.approved = approved; return this; }
        public DoctorBuilder availableTypes(List<String> availableTypes) { this.availableTypes = availableTypes; return this; }
        public DoctorBuilder workExperience(List<WorkExperience> workExperience) { this.workExperience = workExperience; return this; }
        public DoctorBuilder documents(List<DocumentRecord> documents) { this.documents = documents; return this; }
        public DoctorBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public Doctor build() {
            Doctor doctor = new Doctor();
            doctor.id = this.id;
            doctor.userId = this.userId;
            doctor.firstName = this.firstName;
            doctor.lastName = this.lastName;
            doctor.email = this.email;
            doctor.phone = this.phone;
            doctor.specialization = this.specialization;
            doctor.qualification = this.qualification;
            doctor.experienceYears = this.experienceYears;
            doctor.bio = this.bio;
            doctor.profileImage = this.profileImage;
            doctor.hospital = this.hospital;
            doctor.location = this.location;
            doctor.consultationFee = this.consultationFee;
            doctor.rating = this.rating;
            doctor.totalReviews = this.totalReviews;
            doctor.availableDays = this.availableDays;
            doctor.timeSlots = this.timeSlots;
            doctor.leaveDates = this.leaveDates;
            doctor.available = this.available;
            doctor.approved = this.approved;
            doctor.availableTypes = this.availableTypes;
            doctor.workExperience = this.workExperience;
            doctor.documents = this.documents;
            doctor.createdAt = this.createdAt;
            return doctor;
        }
    }
}
