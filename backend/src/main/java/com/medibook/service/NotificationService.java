package com.medibook.service;

import com.medibook.model.Notification;
import com.medibook.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;
    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public Notification createAndSend(String userId, String title, String message, String type, String appointmentId) {
        Notification notification = Notification.builder()
                .userId(userId)
                .title(title)
                .message(message)
                .type(type)
                .appointmentId(appointmentId)
                .build();

        notification = notificationRepository.save(notification);

        // Send real-time via WebSocket
        messagingTemplate.convertAndSendToUser(userId, "/queue/notifications", notification);

        return notification;
    }

    public List<Notification> getNotifications(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    public void markAsRead(String notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }

    public void markAllAsRead(String userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndReadFalse(userId);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }
}
