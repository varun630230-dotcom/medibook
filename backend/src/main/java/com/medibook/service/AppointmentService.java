package com.medibook.service;

import com.medibook.dto.AppointmentDTO;
import com.medibook.model.Appointment;
import com.medibook.model.Doctor;
import com.medibook.model.User;
import com.medibook.repository.AppointmentRepository;
import com.medibook.repository.DoctorRepository;
import com.medibook.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Service
public class AppointmentService {

    @Autowired private AppointmentRepository appointmentRepository;
    @Autowired private DoctorRepository doctorRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private NotificationService notificationService;
    @Autowired private EmailService emailService;

    public Appointment bookAppointment(String patientId, AppointmentDTO.CreateRequest request) {
        User patient = userRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        // Check leave dates
        if (doctor.getLeaveDates() != null && doctor.getLeaveDates().contains(request.getAppointmentDate())) {
            throw new RuntimeException("Doctor is on leave on this date");
        }

        // Check slot availability (only non-cancelled appointments)
        List<Appointment> existing = appointmentRepository.findByDoctorIdAndAppointmentDate(
                request.getDoctorId(), request.getAppointmentDate());
        boolean slotTaken = existing.stream()
                .anyMatch(a -> a.getAppointmentTime().equals(request.getAppointmentTime())
                        && !a.getStatus().equals(Appointment.Status.CANCELLED));
        if (slotTaken) {
            throw new RuntimeException("This time slot is already booked. Please choose another time.");
        }

        // Parse appointment type — frontend sends "In-Person", "Video", "Phone"
        // Backend enum is IN_PERSON, VIDEO_CALL, PHONE_CALL
        Appointment.AppointmentType type = parseAppointmentType(request.getType());

        Appointment appointment = Appointment.builder()
                .patientId(patientId)
                .patientName(patient.getFirstName() + " " + patient.getLastName())
                .patientEmail(patient.getEmail())
                .patientPhone(patient.getPhone())
                .doctorId(doctor.getId())
                .doctorName(doctor.getFirstName() + " " + doctor.getLastName())
                .doctorSpecialization(doctor.getSpecialization())
                .appointmentDate(request.getAppointmentDate())
                .appointmentTime(request.getAppointmentTime())
                .symptoms(request.getSymptoms())
                .notes(request.getNotes())
                .type(type)
                .consultationFee(doctor.getConsultationFee())
                .build();

        appointment = appointmentRepository.save(appointment);

        // Notify patient
        notificationService.createAndSend(patientId,
                "Appointment Booked ✅",
                "Your appointment with Dr. " + doctor.getLastName() + " on " +
                        request.getAppointmentDate() + " at " + request.getAppointmentTime() +
                        " is pending confirmation.",
                "APPOINTMENT_BOOKED", appointment.getId());

        // Notify doctor
        if (doctor.getUserId() != null) {
            notificationService.createAndSend(doctor.getUserId(),
                    "New Appointment Request 📅",
                    patient.getFirstName() + " " + patient.getLastName() +
                            " has booked an appointment on " +
                            request.getAppointmentDate() + " at " + request.getAppointmentTime(),
                    "NEW_APPOINTMENT", appointment.getId());
        }

        // Send Email Confirmation
        emailService.sendAppointmentConfirmation(appointment);

        return appointment;
    }

    private Appointment.AppointmentType parseAppointmentType(String raw) {
        if (raw == null) return Appointment.AppointmentType.IN_PERSON;
        return switch (raw.toUpperCase().replace(" ", "_").replace("-", "_")) {
            case "VIDEO", "VIDEO_CALL" -> Appointment.AppointmentType.VIDEO_CALL;
            case "PHONE", "PHONE_CALL" -> Appointment.AppointmentType.PHONE_CALL;
            default -> Appointment.AppointmentType.IN_PERSON;
        };
    }

    public Appointment updateStatus(String appointmentId, AppointmentDTO.UpdateStatusRequest request,
            String currentUserId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        Appointment.Status newStatus = Appointment.Status.valueOf(request.getStatus().toUpperCase());
        appointment.setStatus(newStatus);

        if (request.getCancelReason() != null) appointment.setCancelReason(request.getCancelReason());
        if (request.getMeetingLink() != null) appointment.setMeetingLink(request.getMeetingLink());
        if (request.getAppointmentDate() != null) appointment.setAppointmentDate(request.getAppointmentDate());
        if (request.getAppointmentTime() != null) appointment.setAppointmentTime(request.getAppointmentTime());
        appointment.setUpdatedAt(LocalDateTime.now());
        appointment = appointmentRepository.save(appointment);

        // Notifications based on status
        String title, message;
        switch (newStatus) {
            case CONFIRMED -> {
                title   = "Appointment Confirmed ✅";
                message = "Your appointment with Dr. " + appointment.getDoctorName() +
                          " on " + appointment.getAppointmentDate() + " at " +
                          appointment.getAppointmentTime() + " is confirmed!";
            }
            case CANCELLED -> {
                title   = "Appointment Cancelled ❌";
                message = "Your appointment on " + appointment.getAppointmentDate() + " has been cancelled." +
                          (appointment.getCancelReason() != null ? " Reason: " + appointment.getCancelReason() : "");
            }
            case COMPLETED -> {
                title   = "Appointment Completed 🎉";
                message = "Your appointment with Dr. " + appointment.getDoctorName() +
                          " is complete. Please leave a review!";
            }
            default -> {
                title   = "Appointment Updated";
                message = "Your appointment status has been updated to " + newStatus.name().toLowerCase();
            }
        }
        notificationService.createAndSend(appointment.getPatientId(), title, message,
                "APPOINTMENT_" + newStatus.name(), appointmentId);

        return appointment;
    }

    public Appointment reschedule(String appointmentId, String newDate, String newTime) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        appointment.setAppointmentDate(newDate);
        appointment.setAppointmentTime(newTime);
        appointment.setUpdatedAt(LocalDateTime.now());
        appointment = appointmentRepository.save(appointment);

        notificationService.createAndSend(appointment.getPatientId(),
                "Appointment Rescheduled 🔄",
                "Your appointment with Dr. " + appointment.getDoctorName() +
                        " has been rescheduled to " + newDate + " at " + newTime,
                "APPOINTMENT_RESCHEDULED", appointmentId);
        return appointment;
    }

    public Appointment updateMeetingLink(String appointmentId, String meetingLink) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        appointment.setMeetingLink(meetingLink);
        appointment.setUpdatedAt(LocalDateTime.now());
        appointment = appointmentRepository.save(appointment);

        notificationService.createAndSend(appointment.getPatientId(),
                "Meeting Link Added 💻",
                "Your video consultation link is ready. Join at: " + meetingLink,
                "MEETING_LINK_ADDED", appointmentId);
        return appointment;
    }

    public List<Appointment> getPatientAppointments(String patientId) {
        return appointmentRepository.findByPatientIdOrderByCreatedAtDesc(patientId);
    }

    public List<Appointment> getDoctorAppointments(String doctorId) {
        return appointmentRepository.findByDoctorIdOrderByCreatedAtDesc(doctorId);
    }

    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    public Map<String, Long> getStats() {
        return Map.of(
                "total",     appointmentRepository.count(),
                "pending",   appointmentRepository.countByStatus(Appointment.Status.PENDING),
                "confirmed", appointmentRepository.countByStatus(Appointment.Status.CONFIRMED),
                "completed", appointmentRepository.countByStatus(Appointment.Status.COMPLETED),
                "cancelled", appointmentRepository.countByStatus(Appointment.Status.CANCELLED));
    }

    // Daily reminder at 8 AM
    @Scheduled(cron = "0 0 8 * * *")
    public void sendDailyReminders() {
        String tomorrow = LocalDate.now().plusDays(1)
                .format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        List<Appointment> upcoming = appointmentRepository
                .findByStatusOrderByCreatedAtDesc(Appointment.Status.CONFIRMED)
                .stream()
                .filter(a -> a.getAppointmentDate().equals(tomorrow))
                .toList();

        for (Appointment appt : upcoming) {
            notificationService.createAndSend(appt.getPatientId(),
                    "Appointment Reminder ⏰",
                    "Reminder: You have an appointment with Dr. " + appt.getDoctorName() +
                            " tomorrow at " + appt.getAppointmentTime(),
                    "REMINDER", appt.getId());
        }
    }
}
