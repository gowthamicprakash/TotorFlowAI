package com.tutorflow.backend.repository;

import com.tutorflow.backend.entity.Attendance;
import com.tutorflow.backend.entity.AttendanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByBranchIdAndAttendanceDateAndTeacherId(Long branchId, LocalDate date, Long teacherId);
    List<Attendance> findByBatchIdAndAttendanceDateAndTeacherId(Long batchId, LocalDate date, Long teacherId);
    List<Attendance> findByStudentIdAndTeacherId(Long studentId, Long teacherId);
    Optional<Attendance> findByStudentIdAndBatchIdAndAttendanceDateAndTeacherId(Long studentId, Long batchId, LocalDate date, Long teacherId);
    long countByBranchIdAndAttendanceDateAndStatusAndTeacherId(Long branchId, LocalDate date, AttendanceStatus status, Long teacherId);
    long countByBranchIdAndAttendanceDateAndTeacherId(Long branchId, LocalDate date, Long teacherId);
}

