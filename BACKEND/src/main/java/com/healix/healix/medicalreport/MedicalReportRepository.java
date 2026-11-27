
package com.healix.healix.medicalreport;

import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface MedicalReportRepository
        extends MongoRepository<MedicalReport, String> {

    List<MedicalReport> findByUserIdOrderByUploadedAtDesc(String userId);

    Optional<MedicalReport> findByIdAndUserId(String id, String userId);
}
