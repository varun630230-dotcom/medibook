package com.medibook.controller;

import com.medibook.model.Notification;
import com.medibook.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping("/{userId}")
    public ResponseEntity<List<Notification>> getNotifications(@PathVariable String userId) {
        return ResponseEntity.ok(notificationService.getNotifications(userId));
    }

    @GetMapping("/{userId}/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@PathVariable String userId) {
        return ResponseEntity.ok(Map.of("count", notificationService.getUnreadCount(userId)));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable String id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/user/{userId}/read-all")
    public ResponseEntity<Void> markAllAsRead(@PathVariable String userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }
}
