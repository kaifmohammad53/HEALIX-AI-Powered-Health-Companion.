
package com.healix.healix.assessment;

import com.healix.healix.user.User;
import com.healix.healix.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/assessments")
public class AssessmentController {

    private final AssessmentRepository assessmentRepository;
    private final UserRepository userRepository;

    public AssessmentController(
            AssessmentRepository assessmentRepository,
            UserRepository userRepository) {
        this.assessmentRepository = assessmentRepository;
        this.userRepository = userRepository;
    }

    @PostMapping
    public Assessment save(
            Authentication authentication,
            @RequestBody Map<String, Object> body) {

        User user = findUser(authentication);

        Assessment assessment = new Assessment();
        assessment.setUserId(user.getId());
        assessment.setUserEmail(user.getEmail());
        assessment.setCompletedAt(Instant.now());

        assessment.setSymptoms(
                asStringList(body.get("symptoms")));
        assessment.setAnswers(
                asMap(body.get("answers")));
        assessment.setPredictions(
                asMapList(body.get("predictions")));
        assessment.setSupportedSymptomsSentToModel(
                asStringList(body.get("supportedSymptomsSentToModel")));

        Object disclaimer = body.get("disclaimer");
        assessment.setDisclaimer(disclaimer instanceof String
                ? (String) disclaimer
                : "Experimental model output only. Not a diagnosis.");

        return assessmentRepository.save(assessment);
    }

    @GetMapping("/latest")
    public Assessment latest(Authentication authentication) {
        User user = findUser(authentication);

        return assessmentRepository
                .findFirstByUserIdOrderByCompletedAtDesc(user.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "No assessment found"));
    }

    @GetMapping
    public List<Assessment> history(Authentication authentication) {
        User user = findUser(authentication);
        return assessmentRepository
                .findByUserIdOrderByCompletedAtDesc(user.getId());
    }

    private User findUser(Authentication authentication) {
        if (authentication == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }

        return userRepository.findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "User not found"));
    }

    private List<String> asStringList(Object value) {
        if (!(value instanceof List<?> list)) return List.of();

        return list.stream()
                .filter(String.class::isInstance)
                .map(String.class::cast)
                .toList();
    }

    private Map<String, Object> asMap(Object value) {
        if (!(value instanceof Map<?, ?> map)) return Map.of();

        Map<String, Object> result = new java.util.LinkedHashMap<>();
        map.forEach((key, val) -> {
            if (key instanceof String) result.put((String) key, val);
        });
        return result;
    }

    private List<Map<String, Object>> asMapList(Object value) {
        if (!(value instanceof List<?> list)) return List.of();

        return list.stream()
                .filter(Map.class::isInstance)
                .map(item -> asMap(item))
                .toList();
    }
}
