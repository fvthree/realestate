package com.realestate.sellerapi.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.nio.file.Path;

@Configuration
public class SpaWebConfig implements WebMvcConfigurer {

    private final String mediaUploadDir;

    public SpaWebConfig(@Value("${app.media.upload-dir:uploads/properties}") String mediaUploadDir) {
        this.mediaUploadDir = mediaUploadDir;
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String mediaLocation = Path.of(mediaUploadDir).toAbsolutePath().normalize().toUri().toString();
        if (!mediaLocation.endsWith("/")) {
            mediaLocation = mediaLocation + "/";
        }

        registry.addResourceHandler("/uploads/properties/**", "/api/uploads/properties/**")
                .addResourceLocations(mediaLocation);

        registry.addResourceHandler("/**")
                .addResourceLocations(
                        "classpath:/META-INF/resources/",
                        "classpath:/resources/",
                        "classpath:/static/",
                        "classpath:/public/")
                .resourceChain(true)
                .addResolver(new PathResourceResolver())
                .addResolver(new SpaFallbackResourceResolver());
    }
}
