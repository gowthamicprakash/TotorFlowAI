package com.tutorflow.backend.service;

import com.tutorflow.backend.dto.StudentDTO;
import com.tutorflow.backend.entity.Batch;
import com.tutorflow.backend.entity.Branch;
import com.tutorflow.backend.entity.Student;
import com.tutorflow.backend.entity.Teacher;
import com.tutorflow.backend.exception.ResourceNotFoundException;
import com.tutorflow.backend.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;
    private final BranchService branchService;
    private final BatchService batchService;

    public List<StudentDTO> getStudentsByBranch(Long branchId, Teacher teacher) {
        return studentRepository.findByBranchIdAndTeacherId(branchId, teacher.getId())
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<StudentDTO> getStudentsByBatch(Long batchId, Teacher teacher) {
        return studentRepository.findByBatchIdAndTeacherId(batchId, teacher.getId())
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public StudentDTO getStudentById(Long studentId, Teacher teacher) {
        Student student = studentRepository.findByIdAndTeacherId(studentId, teacher.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId));
        return mapToDTO(student);
    }

    public List<StudentDTO> searchStudentsByName(Long branchId, String query, Teacher teacher) {
        return studentRepository.findByBranchIdAndTeacherIdAndFullNameContainingIgnoreCase(branchId, teacher.getId(), query)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public StudentDTO createStudent(StudentDTO dto, Teacher teacher) {
        Branch branch = branchService.getBranchEntity(dto.getBranchId(), teacher);

        Batch batch = null;
        if (dto.getBatchId() != null) {
            batch = batchService.getBatchEntity(dto.getBatchId(), teacher);
        }

        Student student = Student.builder()
                .teacher(teacher)
                .branch(branch)
                .batch(batch)
                .fullName(dto.getFullName())
                .contactNumber(dto.getContactNumber())
                .parentOrGuardianName(dto.getParentOrGuardianName())
                .age(dto.getAge())
                .dateOfBirth(dto.getDateOfBirth())
                .joiningDate(dto.getJoiningDate() != null ? dto.getJoiningDate() : LocalDate.now())
                .active(dto.getActive() != null ? dto.getActive() : true)
                .build();

        return mapToDTO(studentRepository.save(student));
    }

    @Transactional
    public StudentDTO updateStudent(Long studentId, StudentDTO dto, Teacher teacher) {
        Student student = studentRepository.findByIdAndTeacherId(studentId, teacher.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId));

        if (dto.getBranchId() != null && !dto.getBranchId().equals(student.getBranch().getId())) {
            Branch branch = branchService.getBranchEntity(dto.getBranchId(), teacher);
            student.setBranch(branch);
        }

        if (dto.getBatchId() != null) {
            Batch batch = batchService.getBatchEntity(dto.getBatchId(), teacher);
            student.setBatch(batch);
        } else if (dto.getBatchId() == null && dto.getBatchName() == null) {
            student.setBatch(null);
        }

        student.setFullName(dto.getFullName());
        student.setContactNumber(dto.getContactNumber());
        student.setParentOrGuardianName(dto.getParentOrGuardianName());
        student.setAge(dto.getAge());
        student.setDateOfBirth(dto.getDateOfBirth());
        if (dto.getJoiningDate() != null) {
            student.setJoiningDate(dto.getJoiningDate());
        }
        if (dto.getActive() != null) {
            student.setActive(dto.getActive());
        }

        return mapToDTO(studentRepository.save(student));
    }

    @Transactional
    public StudentDTO assignBatch(Long studentId, Long batchId, Teacher teacher) {
        Student student = studentRepository.findByIdAndTeacherId(studentId, teacher.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId));

        Batch batch = batchService.getBatchEntity(batchId, teacher);
        student.setBatch(batch);

        return mapToDTO(studentRepository.save(student));
    }

    public Student getStudentEntity(Long studentId, Teacher teacher) {
        return studentRepository.findByIdAndTeacherId(studentId, teacher.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId));
    }

    private StudentDTO mapToDTO(Student student) {
        return StudentDTO.builder()
                .id(student.getId())
                .branchId(student.getBranch().getId())
                .branchName(student.getBranch().getName())
                .batchId(student.getBatch() != null ? student.getBatch().getId() : null)
                .batchName(student.getBatch() != null ? student.getBatch().getName() : null)
                .fullName(student.getFullName())
                .contactNumber(student.getContactNumber())
                .parentOrGuardianName(student.getParentOrGuardianName())
                .age(student.getAge())
                .dateOfBirth(student.getDateOfBirth())
                .joiningDate(student.getJoiningDate())
                .active(student.getActive())
                .build();
    }
}

