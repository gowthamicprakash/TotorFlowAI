package com.tutorflow.backend.repository;

import com.tutorflow.backend.entity.FeeRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface FeeRecordRepository extends JpaRepository<FeeRecord, Long> {
    List<FeeRecord> findByBranchIdAndTeacherId(Long branchId, Long teacherId);
    List<FeeRecord> findByStudentIdAndTeacherId(Long studentId, Long teacherId);
    Optional<FeeRecord> findByIdAndTeacherId(Long id, Long teacherId);

    @Query("SELECT COALESCE(SUM(f.amountDue - f.amountPaid), 0) FROM FeeRecord f WHERE f.branch.id = :branchId AND f.teacher.id = :teacherId AND f.amountDue > f.amountPaid")
    BigDecimal getTotalPendingFeesByBranch(@Param("branchId") Long branchId, @Param("teacherId") Long teacherId);
}

