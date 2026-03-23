package com.medibook.model;

import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "reviews")
public class Review {

    @Id
    private String id;

    private String patientId;
    private String patientName;
    private String doctorId;
    private String appointmentId;
    private int rating;
    private String comment;

    @CreatedDate
    private LocalDateTime createdAt;

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getPatientId() { return patientId; }
    public void setPatientId(String patientId) { this.patientId = patientId; }
    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }
    public String getDoctorId() { return doctorId; }
    public void setDoctorId(String doctorId) { this.doctorId = doctorId; }
    public String getAppointmentId() { return appointmentId; }
    public void setAppointmentId(String appointmentId) { this.appointmentId = appointmentId; }
    public int getRating() { return rating; }
    public void setRating(int rating) { this.rating = rating; }
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    // Builder
    public static ReviewBuilder builder() {
        return new ReviewBuilder();
    }

    public static class ReviewBuilder {
        private String id, patientId, patientName, doctorId, appointmentId;
        private int rating;
        private String comment;
        private LocalDateTime createdAt;

        public ReviewBuilder id(String id) { this.id = id; return this; }
        public ReviewBuilder patientId(String patientId) { this.patientId = patientId; return this; }
        public ReviewBuilder patientName(String patientName) { this.patientName = patientName; return this; }
        public ReviewBuilder doctorId(String doctorId) { this.doctorId = doctorId; return this; }
        public ReviewBuilder appointmentId(String appointmentId) { this.appointmentId = appointmentId; return this; }
        public ReviewBuilder rating(int rating) { this.rating = rating; return this; }
        public ReviewBuilder comment(String comment) { this.comment = comment; return this; }
        public ReviewBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public Review build() {
            Review r = new Review();
            r.id = this.id;
            r.patientId = this.patientId;
            r.patientName = this.patientName;
            r.doctorId = this.doctorId;
            r.appointmentId = this.appointmentId;
            r.rating = this.rating;
            r.comment = this.comment;
            r.createdAt = this.createdAt;
            return r;
        }
    }
}
