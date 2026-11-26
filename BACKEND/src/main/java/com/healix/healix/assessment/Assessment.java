
package com.healix.healix.assessment;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Document(collection = "assessments")
public class Assessment {

    @Id
    private String id;

    private String userId;
    private String userEmail;
    private Instant completedAt;
    private List<String> symptoms;
    private Map<String, Object> answers;
    private List<Map<String, Object>> predictions;
    private List<String> supportedSymptomsSentToModel;
    private String disclaimer;

    public Assessment() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public Instant getCompletedAt() { return completedAt; }
    public void setCompletedAt(Instant completedAt) { this.completedAt = completedAt; }

    public List<String> getSymptoms() { return symptoms; }
    public void setSymptoms(List<String> symptoms) { this.symptoms = symptoms; }

    public Map<String, Object> getAnswers() { return answers; }
    public void setAnswers(Map<String, Object> answers) { this.answers = answers; }

    public List<Map<String, Object>> getPredictions() { return predictions; }
    public void setPredictions(List<Map<String, Object>> predictions) {
        this.predictions = predictions;
    }

    public List<String> getSupportedSymptomsSentToModel() {
        return supportedSymptomsSentToModel;
    }
    public void setSupportedSymptomsSentToModel(List<String> values) {
        this.supportedSymptomsSentToModel = values;
    }

    public String getDisclaimer() { return disclaimer; }
    public void setDisclaimer(String disclaimer) { this.disclaimer = disclaimer; }
}
