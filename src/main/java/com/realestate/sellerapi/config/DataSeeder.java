package com.realestate.sellerapi.config;

import com.realestate.sellerapi.agent.AgentRepository;
import com.realestate.sellerapi.agent.domain.Agent;
import com.realestate.sellerapi.property.PropertyRepository;
import com.realestate.sellerapi.property.domain.Property;
import com.realestate.sellerapi.property.domain.PropertyStatus;
import com.realestate.sellerapi.property.domain.PropertyType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Database seeding configuration.
 * Creates a default agent account if none exists.
 *
 * Only runs in dev/local profiles to avoid seeding production.
 */
@Configuration
@Profile({"dev", "local", "default"})
public class DataSeeder {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    @Bean
    CommandLineRunner seedDatabase(AgentRepository agentRepository,
                                   PropertyRepository propertyRepository,
                                   PasswordEncoder passwordEncoder) {
        return args -> {
            // Check if agent already exists
            if (agentRepository.findByEmail("agent@example.com").isPresent()) {
                log.info("✅ Agent account already exists (agent@example.com)");
                return;
            }

            log.info("🌱 Seeding database with default agent account...");

            // Create default agent
            Agent agent = Agent.builder()
                    .email("agent@example.com")
                    .passwordHash(passwordEncoder.encode("password123"))
                    .name("Juan Dela Cruz")
                    .phone("+639171234567")
                    .bio("Licensed real estate broker specializing in Cavite properties. 10+ years experience in residential sales.")
                    .prcLicenseNo("PRC-12345")
                    .serviceAreas("Cavite (Imus, Bacoor, Dasmariñas), Metro Manila South")
                    .avatarUrl("https://ui-avatars.com/api/?name=Juan+Dela+Cruz&size=256")
                    .facebookUrl("https://facebook.com/juanagent")
                    .instagramUrl("https://instagram.com/juanagent")
                    .websiteUrl("https://juandelacruz-realestate.com")
                    .isActive(true)
                    .build();

            Agent savedAgent = agentRepository.save(agent);
            log.info("✅ Created agent: {} ({})", savedAgent.getName(), savedAgent.getEmail());

            // Create sample DRAFT property
            Property draftProperty = Property.builder()
                    .agentId(savedAgent.getId())
                    .title("2BR Condo in Imus City")
                    .description("Modern 2-bedroom condominium unit near SM City Imus. Fully furnished with balcony view. Walking distance to schools, malls, and public transport.")
                    .pricePhp(new BigDecimal("3500000.00"))
                    .propertyType(PropertyType.valueOf("CONDO"))
                    .bedrooms(2)
                    .bathrooms(1)
                    .floorAreaSqm(new BigDecimal("45.0"))
                    .region("CALABARZON")
                    .province("Cavite")
                    .cityMunicipality("Imus")
                    .barangay("Anabu I-B")
                    .postalCode("4103")
                    .streetAddress("Tower A, Unit 1205, Bria Homes")
                    .latitude(new BigDecimal("14.4297"))
                    .longitude(new BigDecimal("120.9367"))
                    .status(PropertyStatus.DRAFT)
                    .build();

            propertyRepository.save(draftProperty);
            log.info("✅ Created sample DRAFT property: {}", draftProperty.getTitle());

            // Create sample PUBLISHED property
            Property publishedProperty = Property.builder()
                    .agentId(savedAgent.getId())
                    .title("3BR House and Lot in Bacoor")
                    .description("Brand new 3-bedroom house and lot in gated subdivision. 100sqm floor area, 120sqm lot. Near Aguinaldo Highway.")
                    .pricePhp(new BigDecimal("5500000.00"))
                    .propertyType(PropertyType.valueOf("HOUSE"))
                    .bedrooms(3)
                    .bathrooms(2)
                    .floorAreaSqm(new BigDecimal("100.0"))
                    .lotAreaSqm(new BigDecimal("120.0"))
                    .region("CALABARZON")
                    .province("Cavite")
                    .cityMunicipality("Bacoor")
                    .barangay("Molino III")
                    .postalCode("4102")
                    .streetAddress("Block 5 Lot 12, Vista Verde Subdivision")
                    .latitude(new BigDecimal("14.4564"))
                    .longitude(new BigDecimal("120.9644"))
                    .status(PropertyStatus.PUBLISHED)
                    .publishedAt(Instant.now())
                    .build();

            propertyRepository.save(publishedProperty);
            log.info("✅ Created sample PUBLISHED property: {}", publishedProperty.getTitle());

            log.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            log.info("🎉 Database seeding complete!");
            log.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            log.info("📧 Agent Email:    agent@example.com");
            log.info("🔑 Agent Password: password123");
            log.info("🚀 Login URL:      POST http://localhost:8080/api/auth/login");
            log.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        };
    }
}

