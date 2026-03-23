package com.medibook.controller;

import com.medibook.model.Doctor;
import com.medibook.model.Review;
import com.medibook.service.DoctorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/doctors")
public class DoctorController {

    @Autowired
    private DoctorService doctorService;

    // ── Public endpoints (no auth required) ──────────────────────────────

    @GetMapping("/public/all")
    public ResponseEntity<List<Doctor>> getAllDoctors(
            @RequestParam(required = false) String specialty,
            @RequestParam(required = false) String q,
            @RequestParam(required = false, defaultValue = "false") boolean availableOnly) {
        return ResponseEntity.ok(doctorService.searchDoctors(q, specialty, availableOnly));
    }

    @GetMapping("/public/search")
    public ResponseEntity<List<Doctor>> searchDoctors(@RequestParam(required = false) String q) {
        return ResponseEntity.ok(doctorService.searchDoctors(q, null, false));
    }

    @GetMapping("/public/specialties")
    public ResponseEntity<List<String>> getSpecialties() {
        return ResponseEntity.ok(doctorService.getAllSpecialties());
    }

    @GetMapping("/public/{id}")
    public ResponseEntity<Doctor> getDoctorById(@PathVariable String id) {
        return ResponseEntity.ok(doctorService.getDoctorById(id));
    }

    @GetMapping("/public/{id}/reviews")
    public ResponseEntity<List<Review>> getDoctorReviews(@PathVariable String id) {
        return ResponseEntity.ok(doctorService.getDoctorReviews(id));
    }

    @GetMapping("/public/{id}/booked-slots")
    public ResponseEntity<List<String>> getBookedSlots(
            @PathVariable String id,
            @RequestParam String date) {
        return ResponseEntity.ok(doctorService.getBookedSlots(id, date));
    }

    // ── Protected endpoints (auth required) ──────────────────────────────

    @GetMapping("/my-profile")
    public ResponseEntity<Doctor> getMyProfile(@RequestParam String userId) {
        return ResponseEntity.ok(doctorService.getDoctorByUserId(userId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Doctor> updateProfile(
            @PathVariable String id,
            @RequestBody Doctor doctor) {
        return ResponseEntity.ok(doctorService.updateDoctorProfile(id, doctor));
    }

    @PostMapping("/{id}/reviews")
    public ResponseEntity<Review> addReview(
            @PathVariable String id,
            @RequestBody Map<String, Object> payload) {
        Integer ratingObj = payload.get("rating") instanceof Integer
                ? (Integer) payload.get("rating")
                : ((Number) payload.get("rating")).intValue();
        Review review = doctorService.addReview(
                id,
                (String) payload.get("patientId"),
                (String) payload.get("patientName"),
                (String) payload.get("appointmentId"),
                ratingObj,
                (String) payload.get("comment"));
        return ResponseEntity.ok(review);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDoctor(@PathVariable String id) {
        doctorService.deleteDoctor(id);
        return ResponseEntity.ok(Map.of("message", "Doctor removed successfully"));
    }

    // Admin: get ALL doctors (including unavailable)
    @GetMapping("/admin/all")
    public ResponseEntity<List<Doctor>> getAllDoctorsAdmin() {
        return ResponseEntity.ok(doctorService.getAllDoctors());
    }
}
