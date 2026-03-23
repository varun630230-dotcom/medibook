package com.medibook.service;

import com.medibook.model.Doctor;
import com.medibook.model.Review;
import com.medibook.repository.AppointmentRepository;
import com.medibook.repository.DoctorRepository;
import com.medibook.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.OptionalDouble;
import java.util.stream.Collectors;

@Service
public class DoctorService {

    @Autowired private DoctorRepository doctorRepository;
    @Autowired private ReviewRepository reviewRepository;
    @Autowired private AppointmentRepository appointmentRepository;

    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    public List<Doctor> getAvailableDoctors() {
        return doctorRepository.findByAvailable(true);
    }

    public List<String> getAllSpecialties() {
        return doctorRepository.findAll().stream()
                .filter(d -> d.getSpecialization() != null && !d.getSpecialization().isBlank())
                .map(Doctor::getSpecialization)
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }

    public List<Doctor> searchDoctors(String query, String specialty, boolean availableOnly) {
        List<Doctor> all = availableOnly
                ? doctorRepository.findByAvailable(true)
                : doctorRepository.findAll();

        // Filter by specialty
        if (specialty != null && !specialty.isBlank() && !specialty.equalsIgnoreCase("All")) {
            all = all.stream()
                    .filter(d -> specialty.equalsIgnoreCase(d.getSpecialization()))
                    .collect(Collectors.toList());
        }

        // Filter by text query
        if (query != null && !query.isBlank()) {
            String q = query.toLowerCase();
            all = all.stream()
                    .filter(d ->
                        (d.getFirstName() != null && d.getFirstName().toLowerCase().contains(q)) ||
                        (d.getLastName()  != null && d.getLastName().toLowerCase().contains(q))  ||
                        (d.getSpecialization() != null && d.getSpecialization().toLowerCase().contains(q)) ||
                        (d.getHospital() != null && d.getHospital().toLowerCase().contains(q)) ||
                        (d.getLocation() != null && d.getLocation().toLowerCase().contains(q)))
                    .collect(Collectors.toList());
        }

        return all;
    }

    public Doctor getDoctorById(String id) {
        return doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
    }

    public Doctor getDoctorByUserId(String userId) {
        return doctorRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Doctor profile not found"));
    }

    public Doctor updateDoctorProfile(String doctorId, Doctor updatedDoctor) {
        Doctor doctor = getDoctorById(doctorId);
        if (updatedDoctor.getSpecialization() != null) doctor.setSpecialization(updatedDoctor.getSpecialization());
        if (updatedDoctor.getQualification() != null) doctor.setQualification(updatedDoctor.getQualification());
        doctor.setExperienceYears(updatedDoctor.getExperienceYears());
        if (updatedDoctor.getBio() != null) doctor.setBio(updatedDoctor.getBio());
        if (updatedDoctor.getHospital() != null) doctor.setHospital(updatedDoctor.getHospital());
        if (updatedDoctor.getLocation() != null) doctor.setLocation(updatedDoctor.getLocation());
        doctor.setConsultationFee(updatedDoctor.getConsultationFee());
        if (updatedDoctor.getAvailableDays() != null) doctor.setAvailableDays(updatedDoctor.getAvailableDays());
        if (updatedDoctor.getTimeSlots() != null) doctor.setTimeSlots(updatedDoctor.getTimeSlots());
        if (updatedDoctor.getLeaveDates() != null) doctor.setLeaveDates(updatedDoctor.getLeaveDates());
        doctor.setAvailable(updatedDoctor.isAvailable());
        // New fields
        if (updatedDoctor.getAvailableTypes() != null) doctor.setAvailableTypes(updatedDoctor.getAvailableTypes());
        if (updatedDoctor.getWorkExperience() != null) doctor.setWorkExperience(updatedDoctor.getWorkExperience());
        if (updatedDoctor.getDocuments() != null) doctor.setDocuments(updatedDoctor.getDocuments());
        if (updatedDoctor.getProfileImage() != null) doctor.setProfileImage(updatedDoctor.getProfileImage());
        return doctorRepository.save(doctor);
    }

    public Review addReview(String doctorId, String patientId, String patientName,
            String appointmentId, int rating, String comment) {
        Review review = Review.builder()
                .doctorId(doctorId).patientId(patientId).patientName(patientName)
                .appointmentId(appointmentId).rating(rating).comment(comment)
                .build();
        reviewRepository.save(review);

        List<Review> reviews = reviewRepository.findByDoctorIdOrderByCreatedAtDesc(doctorId);
        OptionalDouble avg = reviews.stream().mapToInt(Review::getRating).average();
        Doctor doctor = getDoctorById(doctorId);
        doctor.setRating(Math.round(avg.orElse(0.0) * 10.0) / 10.0);
        doctor.setTotalReviews(reviews.size());
        doctorRepository.save(doctor);
        return review;
    }

    public List<Review> getDoctorReviews(String doctorId) {
        return reviewRepository.findByDoctorIdOrderByCreatedAtDesc(doctorId);
    }

    public List<String> getBookedSlots(String doctorId, String date) {
        Doctor doctor = getDoctorById(doctorId);
        if (doctor.getLeaveDates() != null && doctor.getLeaveDates().contains(date)) {
            return doctor.getTimeSlots().stream().map(Doctor.TimeSlot::getStartTime).collect(Collectors.toList());
        }
        return appointmentRepository.findByDoctorIdAndAppointmentDate(doctorId, date).stream()
                .filter(a -> !a.getStatus().equals(com.medibook.model.Appointment.Status.CANCELLED))
                .map(com.medibook.model.Appointment::getAppointmentTime)
                .collect(Collectors.toList());
    }

    public void deleteDoctor(String doctorId) {
        doctorRepository.deleteById(doctorId);
    }
}
