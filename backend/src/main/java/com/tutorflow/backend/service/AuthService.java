package com.tutorflow.backend.service;

import com.tutorflow.backend.dto.AuthResponse;
import com.tutorflow.backend.dto.LoginRequest;
import com.tutorflow.backend.dto.RegisterRequest;
import com.tutorflow.backend.entity.Branch;
import com.tutorflow.backend.entity.Teacher;
import com.tutorflow.backend.exception.BusinessRuleException;
import com.tutorflow.backend.repository.BranchRepository;
import com.tutorflow.backend.repository.TeacherRepository;
import com.tutorflow.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final TeacherRepository teacherRepository;
    private final BranchRepository branchRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (teacherRepository.existsByEmail(request.getEmail())) {
            throw new BusinessRuleException("A teacher with this email already exists.");
        }

        Teacher teacher = Teacher.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .businessName(request.getBusinessName())
                .teachingCategory(request.getTeachingCategory())
                .build();

        Teacher savedTeacher = teacherRepository.save(teacher);

        // Auto-provision initial Main Branch according to Section 5.3 & 4.2 of PRD
        Branch defaultBranch = Branch.builder()
                .teacher(savedTeacher)
                .name("Main Branch")
                .address("Headquarters")
                .build();
        branchRepository.save(defaultBranch);

        String jwt = jwtService.generateToken(savedTeacher);

        return AuthResponse.builder()
                .token(jwt)
                .teacherId(savedTeacher.getId())
                .fullName(savedTeacher.getFullName())
                .email(savedTeacher.getEmail())
                .businessName(savedTeacher.getBusinessName())
                .teachingCategory(savedTeacher.getTeachingCategory())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        Teacher teacher = teacherRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BusinessRuleException("Invalid email or password."));

        String jwt = jwtService.generateToken(teacher);

        return AuthResponse.builder()
                .token(jwt)
                .teacherId(teacher.getId())
                .fullName(teacher.getFullName())
                .email(teacher.getEmail())
                .businessName(teacher.getBusinessName())
                .teachingCategory(teacher.getTeachingCategory())
                .build();
    }
}

