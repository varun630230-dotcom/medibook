package com.medibook.model;

import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "appointments")
@EntityListeners(AuditingEntityListener.class)
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String patientId;
    private String patientName;
    private String patientEmail;
    private String patientPhone;

    private String doctorId;
    private String doctorName;
    private String doctorSpecialization;

    private String appointmentDate;
    private String appointmentTime;
    private String symptoms;
    private String notes;

    @Enumerated(EnumType.STRING)
    private Status status = Status.PENDING;

    private String cancelReason;
    private String meetingLink;

    @Enumerated(EnumType.STRING)
    private AppointmentType type = AppointmentType.IN_PERSON;

    private double consultationFee;
    private boolean isPaid;

    @CreatedDate
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public enum Status {
        PENDING, CONFIRMED, CANCELLED, COMPLETED, RESCHEDULED
    }

    public enum AppointmentType {
        IN_PERSON, VIDEO_CALL, PHONE_CALL
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getPatientId() { return patientId; }
    public void setPatientId(String patientId) { this.patientId = patientId; }
    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }
    public String getPatientEmail() { return patientEmail; }
    public void setPatientEmail(String patientEmail) { this.patientEmail = patientEmail; }
    public String getPatientPhone() { return patientPhone; }
    public void setPatientPhone(String patientPhone) { this.patientPhone = patientPhone; }
    public String getDoctorId() { return doctorId; }
    public void setDoctorId(String doctorId) { this.doctorId = doctorId; }
    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }
    public String getDoctorSpecialization() { return doctorSpecialization; }
    public void setDoctorSpecialization(String doctorSpecialization) { this.doctorSpecialization = doctorSpecialization; }
    public String getAppointmentDate() { return appointmentDate; }
    public void setAppointmentDate(String appointmentDate) { this.appointmentDate = appointmentDate; }
    public String getAppointmentTime() { return appointmentTime; }
    public void setAppointmentTime(String appointmentTime) { this.appointmentTime = appointmentTime; }
    public String getSymptoms() { return symptoms; }
    public void setSymptoms(String symptoms) { this.symptoms = symptoms; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    public String getCancelReason() { return cancelReason; }
    public void setCancelReason(String cancelReason) { this.cancelReason = cancelReason; }
    public String getMeetingLink() { return meetingLink; }
    public void setMeetingLink(String meetingLink) { this.meetingLink = meetingLink; }
    public AppointmentType getType() { return type; }
    public void setType(AppointmentType type) { this.type = type; }
    public double getConsultationFee() { return consultationFee; }
    public void setConsultationFee(double consultationFee) { this.consultationFee = consultationFee; }
    public boolean isPaid() { return isPaid; }
    public void setPaid(boolean isPaid) { this.isPaid = isPaid; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // Builder
    public static AppointmentBuilder builder() {
        return new AppointmentBuilder();
    }

    public static class AppointmentBuilder {
        private String id, patientId, patientName, patientEmail, patientPhone;
        private String doctorId, doctorName, doctorSpecialization;
        private String appointmentDate, appointmentTime, symptoms, notes;
        private Status status = Status.PENDING;
        private String cancelReason, meetingLink;
        private AppointmentType type = AppointmentType.IN_PERSON;
        private double consultationFee;
        private boolean isPaid;
        private LocalDateTime createdAt, updatedAt;

        public AppointmentBuilder id(String id) { this.id = id; return this; }
        public AppointmentBuilder patientId(String patientId) { this.patientId = patientId; return this; }
        public AppointmentBuilder patientName(String patientName) { this.patientName = patientName; return this; }
        public AppointmentBuilder patientEmail(String patientEmail) { this.patientEmail = patientEmail; return this; }
        public AppointmentBuilder patientPhone(String patientPhone) { this.patientPhone = patientPhone; return this; }
        public AppointmentBuilder doctorId(String doctorId) { this.doctorId = doctorId; return this; }
        public AppointmentBuilder doctorName(String doctorName) { this.doctorName = doctorName; return this; }
        public AppointmentBuilder doctorSpecialization(String doctorSpecialization) { this.doctorSpecialization = doctorSpecialization; return this; }
        public AppointmentBuilder appointmentDate(String appointmentDate) { this.appointmentDate = appointmentDate; return this; }
        public AppointmentBuilder appointmentTime(String appointmentTime) { this.appointmentTime = appointmentTime; return this; }
        public AppointmentBuilder symptoms(String symptoms) { this.symptoms = symptoms; return this; }
        public AppointmentBuilder notes(String notes) { this.notes = notes; return this; }
        public AppointmentBuilder status(Status status) { this.status = status; return this; }
        public AppointmentBuilder cancelReason(String cancelReason) { this.cancelReason = cancelReason; return this; }
        public AppointmentBuilder meetingLink(String meetingLink) { this.meetingLink = meetingLink; return this; }
        public AppointmentBuilder type(AppointmentType type) { this.type = type; return this; }
        public AppointmentBuilder consultationFee(double consultationFee) { this.consultationFee = consultationFee; return this; }
        public AppointmentBuilder isPaid(boolean isPaid) { this.isPaid = isPaid; return this; }
        public AppointmentBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public AppointmentBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public Appointment build() {
            Appointment app = new Appointment();
            app.id = this.id;
            app.patientId = this.patientId;
            app.patientName = this.patientName;
            app.patientEmail = this.patientEmail;
            app.patientPhone = this.patientPhone;
            app.doctorId = this.doctorId;
            app.doctorName = this.doctorName;
            app.doctorSpecialization = this.doctorSpecialization;
            app.appointmentDate = this.appointmentDate;
            app.appointmentTime = this.appointmentTime;
            app.symptoms = this.symptoms;
            app.notes = this.notes;
            app.status = this.status;
            app.cancelReason = this.cancelReason;
            app.meetingLink = this.meetingLink;
            app.type = this.type;
            app.consultationFee = this.consultationFee;
            app.isPaid = this.isPaid;
            app.createdAt = this.createdAt;
            app.updatedAt = this.updatedAt;
            return app;
        }
    }
}
