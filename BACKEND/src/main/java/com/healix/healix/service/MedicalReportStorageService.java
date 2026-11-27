
package com.healix.healix.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

@Service
public class MedicalReportStorageService {

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;

    private static final Set<String> ALLOWED_EXTENSIONS =
            Set.of(".pdf", ".jpg", ".jpeg", ".png");

    private final Path storageDirectory;

    public MedicalReportStorageService(
            @Value("${healix.upload.directory}") String directory) {

        this.storageDirectory = Paths.get(directory)
                .toAbsolutePath()
                .normalize();

        try {
            Files.createDirectories(storageDirectory);
        } catch (IOException e) {
            throw new IllegalStateException(
                    "Could not initialize medical report storage", e);
        }
    }

    public String store(MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Please select a file");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Maximum file size is 10 MB");
        }

        String originalName = file.getOriginalFilename();

        if (originalName == null || originalName.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Invalid file name");
        }

        String lowerName = originalName.toLowerCase();

        String extension = ALLOWED_EXTENSIONS.stream()
                .filter(lowerName::endsWith)
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Only PDF, JPG and PNG files are allowed"));

        String contentType = file.getContentType();

        Set<String> allowedTypes = Set.of(
                "application/pdf",
                "image/jpeg",
                "image/png"
        );

        if (contentType == null || !allowedTypes.contains(contentType)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Unsupported file type");
        }

        String storedName = UUID.randomUUID() + extension;

        Path destination = storageDirectory
                .resolve(storedName)
                .normalize();

        if (!destination.startsWith(storageDirectory)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
        }

        try (InputStream input = file.getInputStream()) {
            Files.copy(input, destination,
                    StandardCopyOption.REPLACE_EXISTING);

            return storedName;

        } catch (IOException e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Could not save medical report");
        }
    }

    public Path getFilePath(String storedFileName) {

        Path filePath = storageDirectory
                .resolve(storedFileName)
                .normalize();

        if (!filePath.startsWith(storageDirectory)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
        }

        return filePath;
    }

    public void delete(String storedFileName) {

        try {
            Files.deleteIfExists(getFilePath(storedFileName));

        } catch (IOException e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Could not delete medical report");
        }
    }
}
