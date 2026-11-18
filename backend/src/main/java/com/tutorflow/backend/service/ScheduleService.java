package com.tutorflow.backend.service;

import com.tutorflow.backend.dto.ClassScheduleDTO;
import com.tutorflow.backend.entity.Batch;
import com.tutorflow.backend.entity.Branch;
import com.tutorflow.backend.entity.ClassSchedule;
import com.tutorflow.backend.entity.Teacher;
import com.tutorflow.backend.exception.ResourceNotFoundException;
import com.tutorflow.backend.repository.ClassScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ScheduleService {

    private final ClassScheduleRepository scheduleRepository;
    private final BranchService branchService;
    private final BatchService batchService;

    public List<ClassScheduleDTO> getSchedulesByBranch(Long branchId, Teacher teacher) {
        return scheduleRepository.findByBranchIdAndTeacherId(branchId, teacher.getId())
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<ClassScheduleDTO> getTodaySchedulesByBranch(Long branchId, Teacher teacher) {
        DayOfWeek today = LocalDate.now().getDayOfWeek();
        return scheduleRepository.findByBranchIdAndDayOfWeekAndTeacherId(branchId, today, teacher.getId())
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<ClassScheduleDTO> getSchedulesByBatch(Long batchId, Teacher teacher) {
        return scheduleRepository.findByBatchIdAndTeacherId(batchId, teacher.getId())
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ClassScheduleDTO createSchedule(ClassScheduleDTO dto, Teacher teacher) {
        Branch branch = branchService.getBranchEntity(dto.getBranchId(), teacher);
        Batch batch = batchService.getBatchEntity(dto.getBatchId(), teacher);

        ClassSchedule schedule = ClassSchedule.builder()
                .teacher(teacher)
                .branch(branch)
                .batch(batch)
                .dayOfWeek(dto.getDayOfWeek())
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .roomOrLocation(dto.getRoomOrLocation())
                .build();

        return mapToDTO(scheduleRepository.save(schedule));
    }

    @Transactional
    public ClassScheduleDTO updateSchedule(Long scheduleId, ClassScheduleDTO dto, Teacher teacher) {
        ClassSchedule schedule = scheduleRepository.findByIdAndTeacherId(scheduleId, teacher.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Schedule not found with id: " + scheduleId));

        if (dto.getBatchId() != null && !dto.getBatchId().equals(schedule.getBatch().getId())) {
            Batch batch = batchService.getBatchEntity(dto.getBatchId(), teacher);
            schedule.setBatch(batch);
        }

        schedule.setDayOfWeek(dto.getDayOfWeek());
        schedule.setStartTime(dto.getStartTime());
        schedule.setEndTime(dto.getEndTime());
        schedule.setRoomOrLocation(dto.getRoomOrLocation());

        return mapToDTO(scheduleRepository.save(schedule));
    }

    @Transactional
    public void deleteSchedule(Long scheduleId, Teacher teacher) {
        ClassSchedule schedule = scheduleRepository.findByIdAndTeacherId(scheduleId, teacher.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Schedule not found with id: " + scheduleId));
        scheduleRepository.delete(schedule);
    }

    private ClassScheduleDTO mapToDTO(ClassSchedule s) {
        return ClassScheduleDTO.builder()
                .id(s.getId())
                .branchId(s.getBranch().getId())
                .branchName(s.getBranch().getName())
                .batchId(s.getBatch().getId())
                .batchName(s.getBatch().getName())
                .dayOfWeek(s.getDayOfWeek())
                .startTime(s.getStartTime())
                .endTime(s.getEndTime())
                .roomOrLocation(s.getRoomOrLocation())
                .build();
    }
}

