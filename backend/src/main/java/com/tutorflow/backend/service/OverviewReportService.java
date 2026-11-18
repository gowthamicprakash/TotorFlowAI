package com.tutorflow.backend.service;

import com.tutorflow.backend.dto.ClassScheduleDTO;
import com.tutorflow.backend.dto.OverviewDTO;
import com.tutorflow.backend.dto.ReportSummaryDTO;
import com.tutorflow.backend.entity.AttendanceStatus;
import com.tutorflow.backend.entity.Branch;
import com.tutorflow.backend.entity.Teacher;
import com.tutorflow.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OverviewReportService {

    private final BranchService branchService;
    private final StudentRepository studentRepository;
    private final BatchRepository batchRepository;
    private final AttendanceRepository attendanceRepository;
    private final FeeRecordRepository feeRecordRepository;
    private final PaymentRepository paymentRepository;
    private final ScheduleService scheduleService;

    public OverviewDTO getBranchOverview(Long branchId, Teacher teacher) {
        Branch branch = branchService.getBranchEntity(branchId, teacher);
        LocalDate today = LocalDate.now();

        long totalStudents = studentRepository.countByBranchIdAndTeacherId(branchId, teacher.getId());
        long activeBatches = batchRepository.countByBranchIdAndTeacherId(branchId, teacher.getId());

        List<ClassScheduleDTO> todaySchedules = scheduleService.getTodaySchedulesByBranch(branchId, teacher);
        long todayClasses = todaySchedules.size();

        long todayPresent = attendanceRepository.countByBranchIdAndAttendanceDateAndStatusAndTeacherId(
                branchId, today, AttendanceStatus.PRESENT, teacher.getId()
        );
        long todayTotalAttendance = attendanceRepository.countByBranchIdAndAttendanceDateAndTeacherId(
                branchId, today, teacher.getId()
        );

        BigDecimal pendingFees = feeRecordRepository.getTotalPendingFeesByBranch(branchId, teacher.getId());
        if (pendingFees == null) {
            pendingFees = BigDecimal.ZERO;
        }

        return OverviewDTO.builder()
                .branchId(branch.getId())
                .branchName(branch.getName())
                .totalStudents(totalStudents)
                .activeBatches(activeBatches)
                .todayClasses(todayClasses)
                .todayPresentAttendance(todayPresent)
                .todayTotalAttendanceRecorded(todayTotalAttendance)
                .pendingFees(pendingFees)
                .upcomingClasses(todaySchedules)
                .build();
    }

    public ReportSummaryDTO getBranchReport(Long branchId, Teacher teacher) {
        Branch branch = branchService.getBranchEntity(branchId, teacher);

        long totalStudents = studentRepository.countByBranchIdAndTeacherId(branchId, teacher.getId());
        long totalBatches = batchRepository.countByBranchIdAndTeacherId(branchId, teacher.getId());

        BigDecimal pendingFees = feeRecordRepository.getTotalPendingFeesByBranch(branchId, teacher.getId());
        BigDecimal collectedFees = paymentRepository.getTotalCollectedFeesByBranch(branchId, teacher.getId());

        return ReportSummaryDTO.builder()
                .branchId(branch.getId())
                .branchName(branch.getName())
                .totalStudents(totalStudents)
                .totalBatches(totalBatches)
                .totalFeesPending(pendingFees != null ? pendingFees : BigDecimal.ZERO)
                .totalFeesCollected(collectedFees != null ? collectedFees : BigDecimal.ZERO)
                .build();
    }
}

