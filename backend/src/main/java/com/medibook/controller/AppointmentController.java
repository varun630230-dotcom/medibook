package com.medibook.controller;

import com.medibook.dto.AppointmentDTO;
import com.medibook.model.Appointment;
import com.medibook.service.AppointmentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    @PostMapping
    public ResponseEntity<Appointment> bookAppointment(
            @RequestParam String patientId,
            @Valid @RequestBody AppointmentDTO.CreateRequest request) {
        return ResponseEntity.ok(appointmentService.bookAppointment(patientId, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Appointment> updateStatus(
            @PathVariable String id,
            @RequestBody AppointmentDTO.UpdateStatusRequest request) {
        return ResponseEntity.ok(appointmentService.updateStatus(id, request, null));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Appointment>> getPatientAppointments(@PathVariable String patientId) {
        return ResponseEntity.ok(appointmentService.getPatientAppointments(patientId));
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<Appointment>> getDoctorAppointments(@PathVariable String doctorId) {
        return ResponseEntity.ok(appointmentService.getDoctorAppointments(doctorId));
    }

    @GetMapping("/admin/all")
    public ResponseEntity<List<Appointment>> getAllAppointments() {
        return ResponseEntity.ok(appointmentService.getAllAppointments());
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getStats() {
        return ResponseEntity.ok(appointmentService.getStats());
    }

    // Reschedule - keep current status, just update date/time
    @PatchMapping("/{id}/reschedule")
    public ResponseEntity<Appointment> reschedule(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(appointmentService.reschedule(id, body.get("appointmentDate"), body.get("appointmentTime")));
    }

    // Add meeting link endpoint
    @PatchMapping("/{id}/meeting-link")
    public ResponseEntity<Appointment> addMeetingLink(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        AppointmentDTO.UpdateStatusRequest req = new AppointmentDTO.UpdateStatusRequest();
        req.setStatus(null); // don't change status
        req.setMeetingLink(body.get("meetingLink"));
        return ResponseEntity.ok(appointmentService.updateMeetingLink(id, body.get("meetingLink")));
    }
}
