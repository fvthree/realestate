package com.realestate.sellerapi.property;

import com.realestate.sellerapi.property.domain.PropertyMedia;
import com.realestate.sellerapi.property.domain.Property;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

@Service
public class PropertyMediaService {

    private final PropertyRepository propertyRepository;
    private final PropertyMediaRepository propertyMediaRepository;
    private final Path uploadRootPath;
    private final long maxFileSizeBytes;

    public PropertyMediaService(PropertyRepository propertyRepository,
                               PropertyMediaRepository propertyMediaRepository,
                               @Value("${app.media.upload-dir:uploads/properties}") String uploadDir,
                               @Value("${app.media.max-file-size-bytes:10485760}") long maxFileSizeBytes) {
        this.propertyRepository = propertyRepository;
        this.propertyMediaRepository = propertyMediaRepository;
        this.uploadRootPath = Path.of(uploadDir).toAbsolutePath().normalize();
        this.maxFileSizeBytes = maxFileSizeBytes;
    }

    public PropertyMedia uploadMedia(UUID agentId, UUID propertyId, MultipartFile file, Boolean isCover) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is required");
        }
        if (file.getSize() > maxFileSizeBytes) {
            throw new IllegalArgumentException("File exceeds maximum allowed size");
        }
        if (!isSupportedImageFile(file)) {
            throw new IllegalArgumentException("Only image files are allowed");
        }

        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(PropertyNotFoundException::new);

        if (!property.getAgentId().equals(agentId)) {
            throw new PropertyNotOwnedException();
        }

        Files.createDirectories(uploadRootPath);

        String extension = resolveExtension(file.getOriginalFilename());
        String storedFileName = UUID.randomUUID() + extension;
        Path destination = uploadRootPath.resolve(storedFileName).normalize();

        if (!destination.startsWith(uploadRootPath)) {
            throw new IllegalArgumentException("Invalid file path");
        }

        Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);

        String publicUrl = "/api/uploads/properties/" + storedFileName;
        PropertyMedia media = addMedia(agentId, propertyId, storedFileName, publicUrl);

        if (Boolean.TRUE.equals(isCover)) {
            media = updateMedia(agentId, propertyId, media.getId(), media.getSortOrder(), true);
        }

        return media;
    }

    public PropertyMedia addMedia(UUID agentId, UUID propertyId, String storageKey, String publicUrl) {
        // Verify property exists and belongs to agent
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(PropertyNotFoundException::new);

        if (!property.getAgentId().equals(agentId)) {
            throw new PropertyNotOwnedException();
        }

        // Find max sort order
        var existingMedia = propertyMediaRepository.findByPropertyIdOrderBySortOrderAsc(propertyId);
        int nextSortOrder = existingMedia.isEmpty() ? 0 : existingMedia.get(existingMedia.size() - 1).getSortOrder() + 1;

        // Create media
        PropertyMedia media = PropertyMedia.builder()
                .property(property)
                .storageKey(storageKey)
                .publicUrl(publicUrl)
                .sortOrder(nextSortOrder)
                .isCover(false)
                .build();

        return propertyMediaRepository.save(media);
    }

    public PropertyMedia updateMedia(UUID agentId, UUID propertyId, UUID mediaId, Integer sortOrder, Boolean isCover) {
        // Verify property exists and belongs to agent
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(PropertyNotFoundException::new);

        if (!property.getAgentId().equals(agentId)) {
            throw new PropertyNotOwnedException();
        }

        // Find media
        PropertyMedia media = propertyMediaRepository.findById(mediaId)
                .orElseThrow(PropertyMediaNotFoundException::new);

        if (!media.getProperty().getId().equals(propertyId)) {
            throw new PropertyMediaNotFoundException();
        }

        // Update fields if provided
        if (sortOrder != null) {
            media.setSortOrder(sortOrder);
        }
        if (isCover != null) {
            // If setting this as cover, unset other covers for this property
            if (isCover) {
                var allMedia = propertyMediaRepository.findByPropertyIdOrderBySortOrderAsc(propertyId);
                allMedia.forEach(m -> {
                    if (!m.getId().equals(mediaId) && m.getIsCover()) {
                        m.setIsCover(false);
                        propertyMediaRepository.save(m);
                    }
                });
            }
            media.setIsCover(isCover);
        }

        return propertyMediaRepository.save(media);
    }

    public void deleteMedia(UUID agentId, UUID propertyId, UUID mediaId) {
        // Verify property exists and belongs to agent
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(PropertyNotFoundException::new);

        if (!property.getAgentId().equals(agentId)) {
            throw new PropertyNotOwnedException();
        }

        // Find media
        PropertyMedia media = propertyMediaRepository.findById(mediaId)
                .orElseThrow(PropertyMediaNotFoundException::new);

        if (!media.getProperty().getId().equals(propertyId)) {
            throw new PropertyMediaNotFoundException();
        }

        removeStoredFile(media.getStorageKey());
        propertyMediaRepository.delete(media);
    }

    private void removeStoredFile(String storageKey) {
        if (storageKey == null || storageKey.isBlank()) {
            return;
        }
        try {
            Path targetPath = uploadRootPath.resolve(storageKey).normalize();
            if (targetPath.startsWith(uploadRootPath)) {
                Files.deleteIfExists(targetPath);
            }
        } catch (IOException ignored) {
            // Best-effort cleanup only; DB delete should still proceed.
        }
    }

    private String resolveExtension(String originalFilename) {
        if (originalFilename == null || originalFilename.isBlank()) {
            return "";
        }
        int lastDot = originalFilename.lastIndexOf('.');
        if (lastDot < 0 || lastDot == originalFilename.length() - 1) {
            return "";
        }
        return originalFilename.substring(lastDot).toLowerCase();
    }

    private boolean isSupportedImageFile(MultipartFile file) {
        String contentType = file.getContentType();
        if (contentType != null && contentType.startsWith("image/")) {
            return true;
        }

        String extension = resolveExtension(file.getOriginalFilename());
        Set<String> imageExtensions = Set.of(
                ".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".heic", ".heif", ".jfif"
        );
        return imageExtensions.contains(extension);
    }
}


