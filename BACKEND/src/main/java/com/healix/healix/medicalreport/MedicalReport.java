
package com.healix.healix.medicalreport;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.time.LocalDate;

@Document(collection = "medical_reports")
public class MedicalReport {

    @Id
    private String id;

    private String userId;
    private String userEmail;

    private String originalFileName;
    private String storedFileName;
    private String contentType;
    private long fileSize;

    private String category;
    private LocalDate reportDate;
    private Instant uploadedAt;

    public MedicalReport() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public String getOriginalFileName() { return originalFileName; }
    public void setOriginalFileName(String originalFileName) {
        this.originalFileName = originalFileName;
    }

    public String getStoredFileName() { return storedFileName; }
    public void setStoredFileName(String storedFileName) {
        this.storedFileName = storedFileName;
    }

    public String getContentType() { return contentType; }
    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public long getFileSize() { return fileSize; }
    public void setFileSize(long fileSize) { this.fileSize = fileSize; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public LocalDate getReportDate() { return reportDate; }
    public void setReportDate(LocalDate reportDate) {
        this.reportDate = reportDate;
    }

    public Instant getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(Instant uploadedAt) {
        this.uploadedAt = uploadedAt;
    }
}
