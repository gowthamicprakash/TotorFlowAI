package com.tutorflow.backend.repository;

import com.tutorflow.backend.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    List<Student> findByBranchIdAndTeacherId(Long branchId, Long teacherId);
    List<Student> findByBatchIdAndTeacherId(Long batchId, Long teacherId);
    List<Student> findByTeacherId(Long teacherId);
    Optional<Student> findByIdAndTeacherId(Long id, Long teacherId);
    long countByBranchIdAndTeacherId(Long branchId, Long teacherId);
    List<Student> findByBranchIdAndTeacherIdAndFullNameContainingIgnoreCase(Long branchId, Long teacherId, String name);
}

