
package com.healix.healix.assessment;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface AssessmentRepository
        extends MongoRepository<Assessment, String> {

    List<Assessment> findByUserIdOrderByCompletedAtDesc(String userId);

    Optional<Assessment> findFirstByUserIdOrderByCompletedAtDesc(
            String userId
    );
}
