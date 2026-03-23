package com.medibook.repository;

import com.medibook.model.Doctor;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends MongoRepository<Doctor, String> {
    List<Doctor> findBySpecializationContainingIgnoreCase(String specialization);
    List<Doctor> findByAvailable(boolean available);
    Optional<Doctor> findByUserId(String userId);
    List<Doctor> findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(String firstName, String lastName);
}
