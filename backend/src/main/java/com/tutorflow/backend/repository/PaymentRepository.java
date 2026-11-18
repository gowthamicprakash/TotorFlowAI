package com.tutorflow.backend.repository;

import com.tutorflow.backend.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByBranchIdAndTeacherIdOrderByPaymentDateDesc(Long branchId, Long teacherId);
    List<Payment> findByStudentIdAndTeacherIdOrderByPaymentDateDesc(Long studentId, Long teacherId);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.branch.id = :branchId AND p.teacher.id = :teacherId")
    BigDecimal getTotalCollectedFeesByBranch(@Param("branchId") Long branchId, @Param("teacherId") Long teacherId);
}

