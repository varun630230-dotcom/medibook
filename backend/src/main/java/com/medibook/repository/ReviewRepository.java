package com.medibook.repository;

import com.medibook.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, String> {
    List<Review> findByDoctorIdOrderByCreatedAtDesc(String doctorId);
    List<Review> findByPatientId(String patientId);
    boolean existsByPatientIdAndAppointmentId(String patientId, String appointmentId);
}
