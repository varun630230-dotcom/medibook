package com.medibook.config;

import com.medibook.model.Doctor;
import com.medibook.model.User;
import com.medibook.repository.DoctorRepository;
import com.medibook.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    @Autowired private UserRepository userRepository;
    @Autowired private DoctorRepository doctorRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedDemoUsers();
        seedDemoDoctors();
    }

    // Time slots use 24-hour format to match BookAppointment.jsx frontend
    private List<Doctor.TimeSlot> defaultSlots() {
        return List.of(
            new Doctor.TimeSlot("09:00", "10:00"),
            new Doctor.TimeSlot("10:30", "11:30"),
            new Doctor.TimeSlot("11:00", "12:00"),
            new Doctor.TimeSlot("12:00", "13:00"),
            new Doctor.TimeSlot("14:00", "15:00"),
            new Doctor.TimeSlot("15:30", "16:30"),
            new Doctor.TimeSlot("17:00", "18:00"),
            new Doctor.TimeSlot("18:30", "19:30")
        );
    }

    private void seedDemoUsers() {
        if (!userRepository.existsByEmail("admin@gmail.com")) {
            userRepository.save(User.builder()
                    .firstName("Admin").lastName("MediBook")
                    .email("admin@gmail.com")
                    .password(passwordEncoder.encode("password123"))
                    .phone("+91 9000000000").gender("Male")
                    .role(User.Role.ADMIN).build());
            log.info("Seeded admin: admin@gmail.com / password123");
        }

        if (!userRepository.existsByEmail("varun630230@gmail.com")) {
            userRepository.save(User.builder()
                    .firstName("Varun").lastName("Kumar")
                    .email("varun630230@gmail.com")
                    .password(passwordEncoder.encode("varun0779"))
                    .phone("+91 9876543210").gender("Male")
                    .dateOfBirth("1992-05-15").bloodGroup("B+")
                    .role(User.Role.PATIENT).build());
            log.info("Seeded patient: varun630230@gmail.com / varun0779");
        }

        if (!userRepository.existsByEmail("rajiv@gmail.com")) {
            User docUser = userRepository.save(User.builder()
                    .firstName("Rajiv").lastName("Sharma")
                    .email("rajiv@gmail.com")
                    .password(passwordEncoder.encode("varun0779"))
                    .phone("+91 9123456789").gender("Male")
                    .role(User.Role.DOCTOR).build());

            if (!doctorRepository.findByUserId(docUser.getId()).isPresent()) {
                doctorRepository.save(Doctor.builder()
                        .userId(docUser.getId())
                        .firstName("Rajiv").lastName("Sharma")
                        .email("rajiv@gmail.com").phone("+91 9123456789")
                        .specialization("Cardiologist").qualification("MBBS, MD (Cardiology)")
                        .experienceYears(12).consultationFee(800)
                        .bio("Dr. Rajiv Sharma is a senior cardiologist with over 12 years of experience.")
                        .hospital("Apollo Heart Centre").location("Hyderabad, Telangana")
                        .rating(4.8).totalReviews(245).available(true)
                        .availableDays(Arrays.asList("Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"))
                        .timeSlots(defaultSlots())
                        .build());
            }
            log.info("Seeded doctor: rajiv@gmail.com / varun0779");
        }
    }

    private void seedDemoDoctors() {
        // [firstName, lastName, email, specialization, qualification, expYears, fee, rating, reviews, hospital, location, gender]
        Object[][] doctorsData = {
            {"Sneha",   "Reddy",    "sneha.reddy@medibook.com",    "Neurologist",      "MBBS, DM (Neurology)",    8,  600.0, 4.7, 180, "Care Hospitals",              "Hyderabad",   "Female"},
            {"Vikram",  "Mehta",    "vikram.mehta@medibook.com",   "Orthopedic",       "MBBS, MS (Ortho)",        15, 700.0, 4.9, 320, "Yashoda Hospital",            "Secunderabad","Male"},
            {"Ananya",  "Krishnan", "ananya.k@medibook.com",       "Pediatrician",     "MBBS, MD (Peds)",         6,  500.0, 4.8, 410, "Rainbow Children's Hospital", "Hyderabad",   "Female"},
            {"Ravi",    "Kumar",    "ravi.kumar@medibook.com",     "Dermatologist",    "MBBS, MD (Derma)",        10, 450.0, 4.6, 290, "KIMS Hospital",               "Hyderabad",   "Male"},
            {"Preethi", "Nair",     "preethi.nair@medibook.com",   "Gynecologist",     "MBBS, MS (OBG)",          12, 650.0, 4.9, 380, "Fernandez Hospital",          "Hyderabad",   "Female"},
            {"Aditya",  "Sharma",   "aditya.sharma@medibook.com",  "General Physician","MBBS, FCGP",              5,  300.0, 4.5, 150, "City Clinic",                 "Uppal",       "Male"},
            {"Kavitha", "Rao",      "kavitha.rao@medibook.com",    "Ophthalmologist",  "MBBS, MS (Ophtha)",       9,  550.0, 4.7, 210, "LV Prasad Eye Institute",     "Hyderabad",   "Female"},
            {"Suresh",  "Babu",     "suresh.babu@medibook.com",    "ENT Specialist",   "MBBS, MS (ENT)",          7,  400.0, 4.6, 175, "Apollo Hospitals",            "Jubilee Hills","Male"},
            {"Fatima",  "Khan",     "fatima.khan@medibook.com",    "Pediatrician",     "MBBS, DCH",               11, 499.0, 4.9, 567, "AIIMS Delhi",                 "Delhi",       "Female"},
            {"Arjun",   "Mehta",    "arjun.mehta@medibook.com",    "Orthopedic",       "MBBS, MS (Ortho), DNB",   18, 799.0, 4.6, 421, "Max Healthcare",              "Delhi",       "Male"},
            {"Priya",   "Sharma",   "priya.sharma@medibook.com",   "Cardiologist",     "MBBS, MD, DM (Cardio)",   14, 699.0, 4.9, 312, "Apollo Hospitals",            "Chennai",     "Female"},
            {"Rohit",   "Verma",    "rohit.verma@medibook.com",    "Psychiatrist",     "MBBS, MD (Psych)",        8,  649.0, 4.7, 176, "NIMHANS",                     "Bangalore",   "Male"},
            {"Divya",   "Menon",    "divya.menon@medibook.com",    "Dermatologist",    "MBBS, MD (DVL)",          6,  450.0, 4.6, 142, "Columbia Asia",               "Bangalore",   "Female"},
            {"Meena",   "Pillai",   "meena.pillai@medibook.com",   "Neurologist",      "MBBS, DM (Neuro)",        12, 850.0, 4.7, 203, "NIMHANS",                     "Bangalore",   "Female"},
            {"Ramesh",  "Iyer",     "ramesh.iyer@medibook.com",    "General Physician","MBBS, MD (Gen Med)",      9,  399.0, 4.7, 198, "Fortis Healthcare",           "Chennai",     "Male"},
            {"Karan",   "Singh",    "karan.singh@medibook.com",    "Cardiologist",     "MBBS, DM (Cardio), FACC", 20, 1200.0, 4.8, 540,"Medanta Hospital",            "Gurugram",    "Male"},
            {"Suresh",  "Patel",    "suresh.patel@medibook.com",   "Ophthalmologist",  "MBBS, MS (Ophtha)",       15, 549.0, 4.5, 298, "Sankara Eye Hospital",        "Coimbatore",  "Male"},
            {"Ananya",  "Bose",     "ananya.bose@medibook.com",    "Psychiatrist",     "MBBS, MD (Psych)",        8,  649.0, 4.7, 176, "NIMHANS",                     "Kolkata",     "Female"},
        };

        for (Object[] d : doctorsData) {
            String email = (String) d[2];
            if (!userRepository.existsByEmail(email)) {
                User u = userRepository.save(User.builder()
                        .firstName((String) d[0]).lastName((String) d[1])
                        .email(email).password(passwordEncoder.encode("demo123"))
                        .gender((String) d[11])
                        .role(User.Role.DOCTOR).build());

                doctorRepository.save(Doctor.builder()
                        .userId(u.getId())
                        .firstName((String) d[0]).lastName((String) d[1])
                        .email(email)
                        .specialization((String) d[3])
                        .qualification((String) d[4])
                        .experienceYears((int) d[5])
                        .consultationFee((double) d[6])
                        .rating((double) d[7])
                        .totalReviews((int) d[8])
                        .hospital((String) d[9])
                        .location((String) d[10])
                        .bio("Experienced " + d[3] + " with " + d[5] + " years of dedicated patient care.")
                        .availableDays(Arrays.asList("Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"))
                        .timeSlots(defaultSlots())
                        .available(true)
                        .build());
            }
        }
        log.info("Seeded {} demo doctors", doctorsData.length);
    }
}
