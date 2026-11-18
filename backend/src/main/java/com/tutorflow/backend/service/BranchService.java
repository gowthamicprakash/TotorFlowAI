package com.tutorflow.backend.service;

import com.tutorflow.backend.dto.BranchDTO;
import com.tutorflow.backend.entity.Branch;
import com.tutorflow.backend.entity.Teacher;
import com.tutorflow.backend.exception.ResourceNotFoundException;
import com.tutorflow.backend.repository.BranchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BranchService {

    private final BranchRepository branchRepository;

    public List<BranchDTO> getBranchesForTeacher(Teacher teacher) {
        return branchRepository.findByTeacherId(teacher.getId())
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public BranchDTO getBranchById(Long branchId, Teacher teacher) {
        Branch branch = branchRepository.findByIdAndTeacherId(branchId, teacher.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Branch not found with id: " + branchId));
        return mapToDTO(branch);
    }

    @Transactional
    public BranchDTO createBranch(BranchDTO dto, Teacher teacher) {
        Branch branch = Branch.builder()
                .teacher(teacher)
                .name(dto.getName())
                .address(dto.getAddress())
                .contactNumber(dto.getContactNumber())
                .email(dto.getEmail())
                .build();
        return mapToDTO(branchRepository.save(branch));
    }

    @Transactional
    public BranchDTO updateBranch(Long branchId, BranchDTO dto, Teacher teacher) {
        Branch branch = branchRepository.findByIdAndTeacherId(branchId, teacher.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Branch not found with id: " + branchId));

        branch.setName(dto.getName());
        branch.setAddress(dto.getAddress());
        branch.setContactNumber(dto.getContactNumber());
        branch.setEmail(dto.getEmail());

        return mapToDTO(branchRepository.save(branch));
    }

    public Branch getBranchEntity(Long branchId, Teacher teacher) {
        return branchRepository.findByIdAndTeacherId(branchId, teacher.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Branch not found with id: " + branchId));
    }

    private BranchDTO mapToDTO(Branch branch) {
        return BranchDTO.builder()
                .id(branch.getId())
                .name(branch.getName())
                .address(branch.getAddress())
                .contactNumber(branch.getContactNumber())
                .email(branch.getEmail())
                .build();
    }
}

