package com.medibook.service;

import com.medibook.model.Appointment;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendAppointmentConfirmation(Appointment appointment) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(appointment.getPatientEmail());
            message.setSubject("MediBook: Appointment Confirmation");

            String body = String.format(
                "Hello %s,\n\n" +
                "Your appointment has been successfully requested. Here are the details:\n\n" +
                "Date: %s\n" +
                "Time: %s\n" +
                "Status: %s\n\n" +
                "Please check your dashboard for updates on your appointment status as the doctor needs to approve it.\n\n" +
                "Thank you for choosing MediBook.\n\n" +
                "Best Regards,\n" +
                "MediBook Team",
                appointment.getPatientName(),
                appointment.getAppointmentDate().toString(),
                appointment.getAppointmentTime().toString(),
                appointment.getStatus().toString()
            );

            message.setText(body);
            mailSender.send(message);
        } catch (Exception e) {
            // Log error but don't fail the appointment creation
            System.err.println("Failed to send appointment confirmation email: " + e.getMessage());
        }
    }
}
