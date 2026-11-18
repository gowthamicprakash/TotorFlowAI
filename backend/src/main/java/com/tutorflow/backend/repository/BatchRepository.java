package com.tutorflow.backend.repository;

import com.tutorflow.backend.entity.Batch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BatchRepository extends JpaRepository<Batch, Long> {
    List<Batch> findByBranchIdAndTeacherId(Long branchId, Long teacherId);
    List<Batch> findByTeacherId(Long teacherId);
    Optional<Batch> findByIdAndTeacherId(Long id, Long teacherId);
    long countByBranchIdAndTeacherId(Long branchId, Long teacherId);
}

