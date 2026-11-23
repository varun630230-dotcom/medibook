package com.medibook.dto;

import com.medibook.model.Doctor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public record DoctorSummaryDTO(
        String id,
        String firstName,
        String lastName,
        String email,
        String phone,
        String specialization,
        String qualification,
        int experienceYears,
        String bio,
        String hospital,
        String location,
        double consultationFee,
        double rating,
        int totalReviews,
        boolean available,
        boolean approved,
        boolean rejected,
        String rejectionReason,
        List<String> availableTypes,
        LocalDateTime createdAt) {

    public static DoctorSummaryDTO from(Doctor doctor) {
        return new DoctorSummaryDTO(
                doctor.getId(),
                doctor.getFirstName(),
                doctor.getLastName(),
                doctor.getEmail(),
                doctor.getPhone(),
                doctor.getSpecialization(),
                doctor.getQualification(),
                doctor.getExperienceYears(),
                doctor.getBio(),
                doctor.getHospital(),
                doctor.getLocation(),
                doctor.getConsultationFee(),
                doctor.getRating(),
                doctor.getTotalReviews(),
                doctor.isAvailable(),
                doctor.isApproved(),
                doctor.isRejected(),
                doctor.getRejectionReason(),
                doctor.getAvailableTypes() == null
                        ? List.of()
                        : new ArrayList<>(doctor.getAvailableTypes()),
                doctor.getCreatedAt());
    }
}
