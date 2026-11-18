package com.tutorflow.backend.repository;

import com.tutorflow.backend.entity.Branch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BranchRepository extends JpaRepository<Branch, Long> {
    List<Branch> findByTeacherId(Long teacherId);
    Optional<Branch> findByIdAndTeacherId(Long id, Long teacherId);
    long countByTeacherId(Long teacherId);
}

