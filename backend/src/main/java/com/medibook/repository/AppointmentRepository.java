package com.medibook.repository;

import com.medibook.model.Appointment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppointmentRepository extends MongoRepository<Appointment, String> {
    List<Appointment> findByPatientIdOrderByCreatedAtDesc(String patientId);
    List<Appointment> findByDoctorIdOrderByCreatedAtDesc(String doctorId);
    List<Appointment> findByDoctorIdAndAppointmentDate(String doctorId, String appointmentDate);
    List<Appointment> findByStatusOrderByCreatedAtDesc(Appointment.Status status);
    long countByStatus(Appointment.Status status);
    long countByPatientId(String patientId);
    long countByDoctorId(String doctorId);
}
