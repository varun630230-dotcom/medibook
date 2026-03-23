package com.medibook.model;

import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "notifications")
public class Notification {

    @Id
    private String id;

    private String userId;
    private String title;
    private String message;
    private String type; // APPOINTMENT_CONFIRMED, APPOINTMENT_CANCELLED, REMINDER, etc.
    private String appointmentId;

    private boolean read = false;

    @CreatedDate
    private LocalDateTime createdAt;

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getAppointmentId() { return appointmentId; }
    public void setAppointmentId(String appointmentId) { this.appointmentId = appointmentId; }
    public boolean isRead() { return read; }
    public void setRead(boolean read) { this.read = read; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    // Builder
    public static NotificationBuilder builder() {
        return new NotificationBuilder();
    }

    public static class NotificationBuilder {
        private String id, userId, title, message, type, appointmentId;
        private boolean read = false;
        private LocalDateTime createdAt;

        public NotificationBuilder id(String id) { this.id = id; return this; }
        public NotificationBuilder userId(String userId) { this.userId = userId; return this; }
        public NotificationBuilder title(String title) { this.title = title; return this; }
        public NotificationBuilder message(String message) { this.message = message; return this; }
        public NotificationBuilder type(String type) { this.type = type; return this; }
        public NotificationBuilder appointmentId(String appointmentId) { this.appointmentId = appointmentId; return this; }
        public NotificationBuilder read(boolean read) { this.read = read; return this; }
        public NotificationBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public Notification build() {
            Notification n = new Notification();
            n.id = this.id;
            n.userId = this.userId;
            n.title = this.title;
            n.message = this.message;
            n.type = this.type;
            n.appointmentId = this.appointmentId;
            n.read = this.read;
            n.createdAt = this.createdAt;
            return n;
        }
    }
}
