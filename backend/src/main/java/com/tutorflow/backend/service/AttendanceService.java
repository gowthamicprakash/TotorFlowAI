package com.tutorflow.backend.service;

import com.tutorflow.backend.dto.AttendanceDTO;
import com.tutorflow.backend.dto.BulkAttendanceRequest;
import com.tutorflow.backend.entity.*;
import com.tutorflow.backend.exception.ResourceNotFoundException;
import com.tutorflow.backend.repository.AttendanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final BranchService branchService;
    private final BatchService batchService;
    private final StudentService studentService;

    public List<AttendanceDTO> getAttendanceByBranchAndDate(Long branchId, LocalDate date, Teacher teacher) {
        return attendanceRepository.findByBranchIdAndAttendanceDateAndTeacherId(branchId, date, teacher.getId())
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<AttendanceDTO> getAttendanceByBatchAndDate(Long batchId, LocalDate date, Teacher teacher) {
        return attendanceRepository.findByBatchIdAndAttendanceDateAndTeacherId(batchId, date, teacher.getId())
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<AttendanceDTO> getAttendanceByStudent(Long studentId, Teacher teacher) {
        return attendanceRepository.findByStudentIdAndTeacherId(studentId, teacher.getId())
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public AttendanceDTO recordOrUpdateAttendance(AttendanceDTO dto, Teacher teacher) {
        Branch branch = branchService.getBranchEntity(dto.getBranchId(), teacher);
        Batch batch = batchService.getBatchEntity(dto.getBatchId(), teacher);
        Student student = studentService.getStudentEntity(dto.getStudentId(), teacher);

        Optional<Attendance> existing = attendanceRepository
                .findByStudentIdAndBatchIdAndAttendanceDateAndTeacherId(student.getId(), batch.getId(), dto.getAttendanceDate(), teacher.getId());

        Attendance attendance;
        if (existing.isPresent()) {
            attendance = existing.get();
            attendance.setStatus(dto.getStatus());
            attendance.setRemarks(dto.getRemarks());
        } else {
            attendance = Attendance.builder()
                    .teacher(teacher)
                    .branch(branch)
                    .batch(batch)
                    .student(student)
                    .attendanceDate(dto.getAttendanceDate())
                    .status(dto.getStatus())
                    .remarks(dto.getRemarks())
                    .build();
        }

        return mapToDTO(attendanceRepository.save(attendance));
    }

    @Transactional
    public List<AttendanceDTO> recordBulkAttendance(BulkAttendanceRequest request, Teacher teacher) {
        Branch branch = branchService.getBranchEntity(request.getBranchId(), teacher);
        Batch batch = batchService.getBatchEntity(request.getBatchId(), teacher);

        List<AttendanceDTO> results = new ArrayList<>();

        for (BulkAttendanceRequest.StudentAttendanceItem item : request.getRecords()) {
            Student student = studentService.getStudentEntity(item.getStudentId(), teacher);

            Optional<Attendance> existing = attendanceRepository
                    .findByStudentIdAndBatchIdAndAttendanceDateAndTeacherId(student.getId(), batch.getId(), request.getAttendanceDate(), teacher.getId());

            Attendance attendance;
            if (existing.isPresent()) {
                attendance = existing.get();
                attendance.setStatus(item.getStatus());
                attendance.setRemarks(item.getRemarks());
            } else {
                attendance = Attendance.builder()
                        .teacher(teacher)
                        .branch(branch)
                        .batch(batch)
                        .student(student)
                        .attendanceDate(request.getAttendanceDate())
                        .status(item.getStatus())
                        .remarks(item.getRemarks())
                        .build();
            }
            results.add(mapToDTO(attendanceRepository.save(attendance)));
        }

        return results;
    }

    private AttendanceDTO mapToDTO(Attendance a) {
        return AttendanceDTO.builder()
                .id(a.getId())
                .branchId(a.getBranch().getId())
                .batchId(a.getBatch().getId())
                .batchName(a.getBatch().getName())
                .studentId(a.getStudent().getId())
                .studentName(a.getStudent().getFullName())
                .attendanceDate(a.getAttendanceDate())
                .status(a.getStatus())
                .remarks(a.getRemarks())
                .build();
    }
}

