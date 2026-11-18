package com.tutorflow.backend.service;

import com.tutorflow.backend.dto.FeeRecordDTO;
import com.tutorflow.backend.dto.PaymentDTO;
import com.tutorflow.backend.entity.*;
import com.tutorflow.backend.exception.BusinessRuleException;
import com.tutorflow.backend.exception.ResourceNotFoundException;
import com.tutorflow.backend.repository.FeeRecordRepository;
import com.tutorflow.backend.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FeeService {

    private final FeeRecordRepository feeRecordRepository;
    private final PaymentRepository paymentRepository;
    private final BranchService branchService;
    private final StudentService studentService;

    public List<FeeRecordDTO> getFeeRecordsByBranch(Long branchId, Teacher teacher) {
        return feeRecordRepository.findByBranchIdAndTeacherId(branchId, teacher.getId())
                .stream()
                .map(this::mapToFeeRecordDTO)
                .collect(Collectors.toList());
    }

    public List<FeeRecordDTO> getFeeRecordsByStudent(Long studentId, Teacher teacher) {
        return feeRecordRepository.findByStudentIdAndTeacherId(studentId, teacher.getId())
                .stream()
                .map(this::mapToFeeRecordDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public FeeRecordDTO createFeeRecord(FeeRecordDTO dto, Teacher teacher) {
        Branch branch = branchService.getBranchEntity(dto.getBranchId(), teacher);
        Student student = studentService.getStudentEntity(dto.getStudentId(), teacher);

        FeeRecord feeRecord = FeeRecord.builder()
                .teacher(teacher)
                .branch(branch)
                .student(student)
                .title(dto.getTitle())
                .amountDue(dto.getAmountDue())
                .amountPaid(BigDecimal.ZERO)
                .dueDate(dto.getDueDate())
                .build();

        return mapToFeeRecordDTO(feeRecordRepository.save(feeRecord));
    }

    @Transactional
    public PaymentDTO recordPayment(PaymentDTO dto, Teacher teacher) {
        Branch branch = branchService.getBranchEntity(dto.getBranchId(), teacher);
        Student student = studentService.getStudentEntity(dto.getStudentId(), teacher);

        FeeRecord feeRecord = null;
        if (dto.getFeeRecordId() != null) {
            feeRecord = feeRecordRepository.findByIdAndTeacherId(dto.getFeeRecordId(), teacher.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Fee record not found with id: " + dto.getFeeRecordId()));

            // Update fee record amount paid
            feeRecord.setAmountPaid(feeRecord.getAmountPaid().add(dto.getAmount()));
            feeRecordRepository.save(feeRecord);
        }

        Payment payment = Payment.builder()
                .teacher(teacher)
                .branch(branch)
                .student(student)
                .feeRecord(feeRecord)
                .amount(dto.getAmount())
                .paymentDate(dto.getPaymentDate() != null ? dto.getPaymentDate() : LocalDate.now())
                .paymentMethod(dto.getPaymentMethod() != null ? dto.getPaymentMethod() : PaymentMethod.CASH)
                .notes(dto.getNotes())
                .build();

        Payment savedPayment = paymentRepository.save(payment);
        return mapToPaymentDTO(savedPayment);
    }

    public List<PaymentDTO> getPaymentsByBranch(Long branchId, Teacher teacher) {
        return paymentRepository.findByBranchIdAndTeacherIdOrderByPaymentDateDesc(branchId, teacher.getId())
                .stream()
                .map(this::mapToPaymentDTO)
                .collect(Collectors.toList());
    }

    public List<PaymentDTO> getPaymentsByStudent(Long studentId, Teacher teacher) {
        return paymentRepository.findByStudentIdAndTeacherIdOrderByPaymentDateDesc(studentId, teacher.getId())
                .stream()
                .map(this::mapToPaymentDTO)
                .collect(Collectors.toList());
    }

    public BigDecimal getTotalPendingFees(Long branchId, Teacher teacher) {
        return feeRecordRepository.getTotalPendingFeesByBranch(branchId, teacher.getId());
    }

    public BigDecimal getTotalCollectedFees(Long branchId, Teacher teacher) {
        return paymentRepository.getTotalCollectedFeesByBranch(branchId, teacher.getId());
    }

    private FeeRecordDTO mapToFeeRecordDTO(FeeRecord record) {
        BigDecimal pending = record.getAmountDue().subtract(record.getAmountPaid());
        return FeeRecordDTO.builder()
                .id(record.getId())
                .branchId(record.getBranch().getId())
                .branchName(record.getBranch().getName())
                .studentId(record.getStudent().getId())
                .studentName(record.getStudent().getFullName())
                .title(record.getTitle())
                .amountDue(record.getAmountDue())
                .amountPaid(record.getAmountPaid())
                .pendingAmount(pending.compareTo(BigDecimal.ZERO) > 0 ? pending : BigDecimal.ZERO)
                .dueDate(record.getDueDate())
                .build();
    }

    private PaymentDTO mapToPaymentDTO(Payment p) {
        return PaymentDTO.builder()
                .id(p.getId())
                .branchId(p.getBranch().getId())
                .studentId(p.getStudent().getId())
                .studentName(p.getStudent().getFullName())
                .feeRecordId(p.getFeeRecord() != null ? p.getFeeRecord().getId() : null)
                .amount(p.getAmount())
                .paymentDate(p.getPaymentDate())
                .paymentMethod(p.getPaymentMethod())
                .notes(p.getNotes())
                .build();
    }
}

