package com.tutorflow.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tutorflow.backend.dto.*;
import com.tutorflow.backend.entity.AttendanceStatus;
import com.tutorflow.backend.entity.PaymentMethod;
import com.tutorflow.backend.entity.Teacher;
import com.tutorflow.backend.exception.BusinessRuleException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AiActionService {

    private final StudentService studentService;
    private final BatchService batchService;
    private final AttendanceService attendanceService;
    private final FeeService feeService;
    private final ScheduleService scheduleService;
    private final OverviewReportService overviewReportService;
    private final ObjectMapper objectMapper;

    @Transactional
    public AiActionResponse executeAction(AiActionRequest request, Teacher teacher) {
        String intent = request.getIntent();
        Long branchId = request.getBranchId();
        Map<String, Object> params = request.getParameters();

        if (intent == null) {
            throw new BusinessRuleException("Intent must be specified for AI operation.");
        }

        switch (intent.toUpperCase()) {
            case "ADD_STUDENT": {
                StudentDTO studentDTO = StudentDTO.builder()
                        .branchId(branchId)
                        .fullName((String) params.get("fullName"))
                        .contactNumber((String) params.get("contactNumber"))
                        .parentOrGuardianName((String) params.get("parentOrGuardianName"))
                        .build();

                if (params.get("batchId") != null) {
                    studentDTO.setBatchId(Long.valueOf(params.get("batchId").toString()));
                }

                StudentDTO created = studentService.createStudent(studentDTO, teacher);
                return AiActionResponse.builder()
                        .success(true)
                        .message("Student " + created.getFullName() + " added successfully.")
                        .data(created)
                        .build();
            }

            case "RECORD_ATTENDANCE": {
                Long batchId = Long.valueOf(params.get("batchId").toString());
                Long studentId = Long.valueOf(params.get("studentId").toString());
                String statusStr = (String) params.getOrDefault("status", "PRESENT");
                AttendanceStatus status = AttendanceStatus.valueOf(statusStr.toUpperCase());
                String dateStr = (String) params.get("date");
                LocalDate date = dateStr != null ? LocalDate.parse(dateStr) : LocalDate.now();

                AttendanceDTO attendanceDTO = AttendanceDTO.builder()
                        .branchId(branchId)
                        .batchId(batchId)
                        .studentId(studentId)
                        .attendanceDate(date)
                        .status(status)
                        .remarks((String) params.get("remarks"))
                        .build();

                AttendanceDTO recorded = attendanceService.recordOrUpdateAttendance(attendanceDTO, teacher);
                return AiActionResponse.builder()
                        .success(true)
                        .message("Attendance marked as " + status + " for student on " + date + ".")
                        .data(recorded)
                        .build();
            }

            case "RECORD_PAYMENT": {
                Long studentId = Long.valueOf(params.get("studentId").toString());
                BigDecimal amount = new BigDecimal(params.get("amount").toString());
                String methodStr = (String) params.getOrDefault("paymentMethod", "CASH");
                PaymentMethod method = PaymentMethod.valueOf(methodStr.toUpperCase());

                PaymentDTO paymentDTO = PaymentDTO.builder()
                        .branchId(branchId)
                        .studentId(studentId)
                        .amount(amount)
                        .paymentDate(LocalDate.now())
                        .paymentMethod(method)
                        .notes((String) params.get("notes"))
                        .build();

                if (params.get("feeRecordId") != null) {
                    paymentDTO.setFeeRecordId(Long.valueOf(params.get("feeRecordId").toString()));
                }

                PaymentDTO recorded = feeService.recordPayment(paymentDTO, teacher);
                return AiActionResponse.builder()
                        .success(true)
                        .message("Payment of " + amount + " recorded successfully.")
                        .data(recorded)
                        .build();
            }

            case "GET_OVERVIEW": {
                OverviewDTO overview = overviewReportService.getBranchOverview(branchId, teacher);
                return AiActionResponse.builder()
                        .success(true)
                        .message("Overview data retrieved for branch.")
                        .data(overview)
                        .build();
            }

            case "GET_UPCOMING_CLASSES": {
                var classes = scheduleService.getTodaySchedulesByBranch(branchId, teacher);
                return AiActionResponse.builder()
                        .success(true)
                        .message("Found " + classes.size() + " classes for today.")
                        .data(classes)
                        .build();
            }

            default:
                throw new BusinessRuleException("Unsupported AI intent: " + intent);
        }
    }
}

