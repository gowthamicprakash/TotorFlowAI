package com.tutorflow.backend.service;

import com.tutorflow.backend.dto.BatchDTO;
import com.tutorflow.backend.entity.Batch;
import com.tutorflow.backend.entity.Branch;
import com.tutorflow.backend.entity.Teacher;
import com.tutorflow.backend.exception.ResourceNotFoundException;
import com.tutorflow.backend.repository.BatchRepository;
import com.tutorflow.backend.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BatchService {

    private final BatchRepository batchRepository;
    private final BranchService branchService;
    private final StudentRepository studentRepository;

    public List<BatchDTO> getBatchesByBranch(Long branchId, Teacher teacher) {
        return batchRepository.findByBranchIdAndTeacherId(branchId, teacher.getId())
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<BatchDTO> getAllBatchesForTeacher(Teacher teacher) {
        return batchRepository.findByTeacherId(teacher.getId())
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public BatchDTO getBatchById(Long batchId, Teacher teacher) {
        Batch batch = batchRepository.findByIdAndTeacherId(batchId, teacher.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found with id: " + batchId));
        return mapToDTO(batch);
    }

    @Transactional
    public BatchDTO createBatch(BatchDTO dto, Teacher teacher) {
        Branch branch = branchService.getBranchEntity(dto.getBranchId(), teacher);

        Batch batch = Batch.builder()
                .teacher(teacher)
                .branch(branch)
                .name(dto.getName())
                .subjectOrProgramme(dto.getSubjectOrProgramme())
                .scheduleDays(dto.getScheduleDays())
                .timings(dto.getTimings())
                .maxCapacity(dto.getMaxCapacity())
                .build();

        return mapToDTO(batchRepository.save(batch));
    }

    @Transactional
    public BatchDTO updateBatch(Long batchId, BatchDTO dto, Teacher teacher) {
        Batch batch = batchRepository.findByIdAndTeacherId(batchId, teacher.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found with id: " + batchId));

        if (dto.getBranchId() != null && !dto.getBranchId().equals(batch.getBranch().getId())) {
            Branch branch = branchService.getBranchEntity(dto.getBranchId(), teacher);
            batch.setBranch(branch);
        }

        batch.setName(dto.getName());
        batch.setSubjectOrProgramme(dto.getSubjectOrProgramme());
        batch.setScheduleDays(dto.getScheduleDays());
        batch.setTimings(dto.getTimings());
        batch.setMaxCapacity(dto.getMaxCapacity());

        return mapToDTO(batchRepository.save(batch));
    }

    public Batch getBatchEntity(Long batchId, Teacher teacher) {
        return batchRepository.findByIdAndTeacherId(batchId, teacher.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found with id: " + batchId));
    }

    private BatchDTO mapToDTO(Batch batch) {
        long studentCount = studentRepository.findByBatchIdAndTeacherId(batch.getId(), batch.getTeacher().getId()).size();
        return BatchDTO.builder()
                .id(batch.getId())
                .branchId(batch.getBranch().getId())
                .branchName(batch.getBranch().getName())
                .name(batch.getName())
                .subjectOrProgramme(batch.getSubjectOrProgramme())
                .scheduleDays(batch.getScheduleDays())
                .timings(batch.getTimings())
                .maxCapacity(batch.getMaxCapacity())
                .studentCount(studentCount)
                .build();
    }
}

