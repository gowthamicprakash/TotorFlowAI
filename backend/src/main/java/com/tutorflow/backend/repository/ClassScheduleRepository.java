package com.tutorflow.backend.repository;

import com.tutorflow.backend.entity.ClassSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.DayOfWeek;
import java.util.List;
import java.util.Optional;

@Repository
public interface ClassScheduleRepository extends JpaRepository<ClassSchedule, Long> {
    List<ClassSchedule> findByBranchIdAndTeacherId(Long branchId, Long teacherId);
    List<ClassSchedule> findByBranchIdAndDayOfWeekAndTeacherId(Long branchId, DayOfWeek dayOfWeek, Long teacherId);
    List<ClassSchedule> findByBatchIdAndTeacherId(Long batchId, Long teacherId);
    Optional<ClassSchedule> findByIdAndTeacherId(Long id, Long teacherId);
    long countByBranchIdAndDayOfWeekAndTeacherId(Long branchId, DayOfWeek dayOfWeek, Long teacherId);
}

