
package com.healix.healix.medicalreport;

import com.healix.healix.service.MedicalReportStorageService;
import com.healix.healix.user.User;
import com.healix.healix.user.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/medical-reports")
public class MedicalReportController {

    private final MedicalReportRepository reportRepository;
    private final MedicalReportStorageService storageService;
    private final UserRepository userRepository;

    public MedicalReportController(
            MedicalReportRepository reportRepository,
            MedicalReportStorageService storageService,
            UserRepository userRepository) {

        this.reportRepository = reportRepository;
        this.storageService = storageService;
        this.userRepository = userRepository;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadReport(
            @RequestParam("file") MultipartFile file,
            @RequestParam("category") String category,
            @RequestParam("reportDate") String reportDate,
            Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found"));

        String storedFileName = storageService.store(file);

        try {
            MedicalReport report = new MedicalReport();

            report.setUserId(user.getId());
            report.setUserEmail(email);
            report.setOriginalFileName(file.getOriginalFilename());
            report.setStoredFileName(storedFileName);
            report.setContentType(file.getContentType());
            report.setFileSize(file.getSize());
            report.setCategory(category);
            report.setReportDate(LocalDate.parse(reportDate));
            report.setUploadedAt(Instant.now());

            MedicalReport savedReport = reportRepository.save(report);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(savedReport);

        } catch (RuntimeException e) {
            storageService.delete(storedFileName);
            throw e;
        }

    }

    @GetMapping
    public ResponseEntity<?> getMyReports(Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found"));

        return ResponseEntity.ok(
                reportRepository.findByUserIdOrderByUploadedAtDesc(
                        user.getId()
                )
        );
    }

    @GetMapping("/{id}/view")
    public ResponseEntity<org.springframework.core.io.Resource> viewReport(
            @PathVariable String id,
            Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found"));

        MedicalReport report = reportRepository
                .findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Report not found"));

        java.nio.file.Path path =
                storageService.getFilePath(report.getStoredFileName());

        try {
            org.springframework.core.io.Resource resource =
                    new org.springframework.core.io.UrlResource(path.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                throw new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "File not found");
            }

            return ResponseEntity.ok()
                    .contentType(org.springframework.http.MediaType
                            .parseMediaType(report.getContentType()))
                    .header(
                            org.springframework.http.HttpHeaders.CONTENT_DISPOSITION,
                            "inline; filename=\"" + report.getOriginalFileName() + "\""
                    )
                    .body(resource);

        } catch (java.net.MalformedURLException e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR, "Could not read report");
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReport(
            @PathVariable String id,
            Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found"));

        MedicalReport report = reportRepository
                .findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Report not found"));

        storageService.delete(report.getStoredFileName());
        reportRepository.delete(report);

        return ResponseEntity.ok(
                Map.of("message", "Medical report deleted successfully")
        );
    }


}
