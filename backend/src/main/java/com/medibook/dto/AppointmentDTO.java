package com.medibook.dto;

import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.validation.constraints.NotBlank;

public class AppointmentDTO {

    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        @NotBlank
        private String doctorId;
        @NotBlank
        private String appointmentDate;
        @NotBlank
        private String appointmentTime;
        private String symptoms;
        private String notes;
        private String type; // IN_PERSON, VIDEO_CALL, PHONE_CALL

        public String getDoctorId() { return doctorId; }
        public void setDoctorId(String doctorId) { this.doctorId = doctorId; }
        public String getAppointmentDate() { return appointmentDate; }
        public void setAppointmentDate(String appointmentDate) { this.appointmentDate = appointmentDate; }
        public String getAppointmentTime() { return appointmentTime; }
        public void setAppointmentTime(String appointmentTime) { this.appointmentTime = appointmentTime; }
        public String getSymptoms() { return symptoms; }
        public void setSymptoms(String symptoms) { this.symptoms = symptoms; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
    }

    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateStatusRequest {
        private String status;
        private String cancelReason;
        private String meetingLink;
        private String appointmentDate;
        private String appointmentTime;

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getCancelReason() { return cancelReason; }
        public void setCancelReason(String cancelReason) { this.cancelReason = cancelReason; }
        public String getMeetingLink() { return meetingLink; }
        public void setMeetingLink(String meetingLink) { this.meetingLink = meetingLink; }
        public String getAppointmentDate() { return appointmentDate; }
        public void setAppointmentDate(String appointmentDate) { this.appointmentDate = appointmentDate; }
        public String getAppointmentTime() { return appointmentTime; }
        public void setAppointmentTime(String appointmentTime) { this.appointmentTime = appointmentTime; }
    }

    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private String id;
        private String patientId;
        private String patientName;
        private String patientEmail;
        private String doctorId;
        private String doctorName;
        private String doctorSpecialization;
        private String appointmentDate;
        private String appointmentTime;
        private String symptoms;
        private String notes;
        private String status;
        private String type;
        private String meetingLink;
        private double consultationFee;
        private boolean isPaid;
        private String createdAt;

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getPatientId() { return patientId; }
        public void setPatientId(String patientId) { this.patientId = patientId; }
        public String getPatientName() { return patientName; }
        public void setPatientName(String patientName) { this.patientName = patientName; }
        public String getPatientEmail() { return patientEmail; }
        public void setPatientEmail(String patientEmail) { this.patientEmail = patientEmail; }
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
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public String getMeetingLink() { return meetingLink; }
        public void setMeetingLink(String meetingLink) { this.meetingLink = meetingLink; }
        public double getConsultationFee() { return consultationFee; }
        public void setConsultationFee(double consultationFee) { this.consultationFee = consultationFee; }
        public boolean isPaid() { return isPaid; }
        public void setPaid(boolean isPaid) { this.isPaid = isPaid; }
        public String getCreatedAt() { return createdAt; }
        public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

        public static ResponseBuilder builder() {
            return new ResponseBuilder();
        }

        public static class ResponseBuilder {
            // Builder fields and methods would be similar...
            public Response build() {
                return new Response();
            }
        }
    }
}
