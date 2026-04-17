package com.realestate.sellerapi.config;

import com.realestate.sellerapi.agent.AgentRepository;
import com.realestate.sellerapi.agent.domain.Agent;
import com.realestate.sellerapi.property.PropertyMediaRepository;
import com.realestate.sellerapi.property.PropertyRepository;
import com.realestate.sellerapi.property.domain.MediaType;
import com.realestate.sellerapi.property.domain.Property;
import com.realestate.sellerapi.property.domain.PropertyMedia;
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
import java.util.UUID;

/**
 * Database seeding: default agent + showcase listings for local/dev (homepage browse).
 * Idempotent: safe to run on every startup (skips rows that already exist by agent + title).
 */
@Configuration
@Profile({"dev", "local", "default"})
public class DataSeeder {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private static final String DEFAULT_AGENT_EMAIL = "agent@example.com";

    @Bean
    CommandLineRunner seedDatabase(AgentRepository agentRepository,
                                   PropertyRepository propertyRepository,
                                   PropertyMediaRepository propertyMediaRepository,
                                   PasswordEncoder passwordEncoder) {
        return args -> {
            Agent agent = agentRepository.findByEmail(DEFAULT_AGENT_EMAIL)
                    .orElseGet(() -> createDefaultAgent(agentRepository, passwordEncoder));

            log.info("📌 Listing seed check for agent {} ({})", agent.getName(), agent.getEmail());

            ensureDraftSample(agent.getId(), propertyRepository);
            seedPublishedShowcase(agent.getId(), propertyRepository, propertyMediaRepository);

            log.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            log.info("🎉 Seed pass complete. Login: {} / password123", DEFAULT_AGENT_EMAIL);
            log.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        };
    }

    private Agent createDefaultAgent(AgentRepository agentRepository, PasswordEncoder passwordEncoder) {
        log.info("🌱 Creating default agent account...");
        Agent agent = Agent.builder()
                .email(DEFAULT_AGENT_EMAIL)
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
        Agent saved = agentRepository.save(agent);
        log.info("✅ Created agent: {} ({})", saved.getName(), saved.getEmail());
        return saved;
    }

    private void ensureDraftSample(UUID agentId, PropertyRepository propertyRepository) {
        String title = "2BR Condo in Imus City";
        if (propertyRepository.existsByAgentIdAndTitle(agentId, title)) {
            return;
        }
        Property draft = Property.builder()
                .agentId(agentId)
                .title(title)
                .description("Modern 2-bedroom condominium unit near SM City Imus. Fully furnished with balcony view. Walking distance to schools, malls, and public transport.")
                .pricePhp(new BigDecimal("3500000.00"))
                .propertyType(PropertyType.CONDO)
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
        propertyRepository.save(draft);
        log.info("✅ Seeded DRAFT: {}", title);
    }

    private void seedPublishedShowcase(UUID agentId,
                                       PropertyRepository propertyRepository,
                                       PropertyMediaRepository propertyMediaRepository) {
        PublishedSeed[] seeds = new PublishedSeed[]{
                new PublishedSeed(
                        "3BR House and Lot in Bacoor",
                        "Brand new 3-bedroom house and lot in gated subdivision. 100sqm floor area, 120sqm lot. Near Aguinaldo Highway.",
                        new BigDecimal("5500000.00"), PropertyType.HOUSE, 3, 2,
                        new BigDecimal("100.0"), new BigDecimal("120.0"),
                        "CALABARZON", "Cavite", "Bacoor", "Molino III", "4102",
                        "Block 5 Lot 12, Vista Verde Subdivision",
                        new BigDecimal("14.4564"), new BigDecimal("120.9644"),
                        "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80"
                ),
                new PublishedSeed(
                        "Modern 1BR condo Dasmariñas CBD",
                        "Compact unit with balcony, fiber-ready, near schools and retail rows.",
                        new BigDecimal("2850000.00"), PropertyType.CONDO, 1, 1,
                        new BigDecimal("28.0"), null,
                        "CALABARZON", "Cavite", "Dasmariñas", "Paliparan I", "4114",
                        "Tower 2 Unit 18F, Paliparan Residences",
                        new BigDecimal("14.3294"), new BigDecimal("120.9371"),
                        "https://images.unsplash.com/photo-1545324418-cc1a3fa10c77?w=800&q=80"
                ),
                new PublishedSeed(
                        "Corner lot Dasmariñas executive village",
                        "300sqm corner lot in a quiet subdivision, ready for build. With perimeter fence posts.",
                        new BigDecimal("4200000.00"), PropertyType.LOT, null, null,
                        null, new BigDecimal("300.0"),
                        "CALABARZON", "Cavite", "Dasmariñas", "Sabang", "4114",
                        "Blk 18 Lot 7, Paliparan III",
                        new BigDecimal("14.3294"), new BigDecimal("120.9371"),
                        "https://images.unsplash.com/photo-1500382017468-25aa40f7b7eb?w=800&q=80"
                ),
                new PublishedSeed(
                        "Townhouse 2-car garage Imus",
                        "Three-level townhouse, carport for two, small garden, near Cavitex exit.",
                        new BigDecimal("4800000.00"), PropertyType.TOWNHOUSE, 3, 2,
                        new BigDecimal("95.0"), new BigDecimal("80.0"),
                        "CALABARZON", "Cavite", "Imus", "Malagasang I", "4103",
                        "Palm Grove Homes, Unit 14",
                        new BigDecimal("14.4189"), new BigDecimal("120.9406"),
                        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80"
                ),
                new PublishedSeed(
                        "Retail space Aguinaldo Highway",
                        "Ground-floor commercial slot with high foot traffic; ideal for cafe or clinic.",
                        new BigDecimal("12500000.00"), PropertyType.COMMERCIAL, null, 2,
                        new BigDecimal("85.0"), null,
                        "CALABARZON", "Cavite", "Bacoor", "Talaba IV", "4102",
                        "Aguinaldo Highway corner Molino Boulevard",
                        new BigDecimal("14.4412"), new BigDecimal("120.9578"),
                        "https://images.unsplash.com/photo-1497366216548-552130e7e5b8?w=800&q=80"
                ),
                new PublishedSeed(
                        "Family home with garden Tagaytay",
                        "Cool-climate 4BR home with landscaped garden, parking for 3, ridge view.",
                        new BigDecimal("8900000.00"), PropertyType.HOUSE, 4, 3,
                        new BigDecimal("165.0"), new BigDecimal("220.0"),
                        "CALABARZON", "Cavite", "Tagaytay", "Silang Junction North", "4120",
                        "Crosswinds Barangay Road",
                        new BigDecimal("14.1153"), new BigDecimal("120.9621"),
                        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80"
                ),
                new PublishedSeed(
                        "Pre-selling 2BR condo Bacoor",
                        "Turnover next year; amenities include pool, gym, and co-working lounge.",
                        new BigDecimal("4100000.00"), PropertyType.CONDO, 2, 1,
                        new BigDecimal("42.0"), null,
                        "CALABARZON", "Cavite", "Bacoor", "Zapote IV", "4102",
                        "Molino Boulevard, The Meridian",
                        new BigDecimal("14.4501"), new BigDecimal("120.9712"),
                        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80"
                ),
                new PublishedSeed(
                        "Farm-lot weekend Silang",
                        "1,200sqm gently sloping lot, fruit-bearing trees, barangay road access.",
                        new BigDecimal("3600000.00"), PropertyType.LOT, null, null,
                        null, new BigDecimal("1200.0"),
                        "CALABARZON", "Cavite", "Silang", "Tubuan II", "4118",
                        "Sitio Malamig, near Tagaytay ridge",
                        new BigDecimal("14.2301"), new BigDecimal("120.9788"),
                        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80"
                ),
                new PublishedSeed(
                        "Affordable townhouse Molino IV",
                        "2BR end-unit, renovated kitchen, flood-free area, near SM Molino.",
                        new BigDecimal("3950000.00"), PropertyType.TOWNHOUSE, 2, 1,
                        new BigDecimal("62.0"), new BigDecimal("48.0"),
                        "CALABARZON", "Cavite", "Bacoor", "Molino IV", "4102",
                        "Camella Springville, Phase 3",
                        new BigDecimal("14.4198"), new BigDecimal("120.9733"),
                        "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80"
                ),
                new PublishedSeed(
                        "Warehouse with office Imus",
                        "High-ceiling warehouse plus mezzanine office, 3-phase power, truck bay.",
                        new BigDecimal("18500000.00"), PropertyType.COMMERCIAL, null, 2,
                        new BigDecimal("420.0"), new BigDecimal("600.0"),
                        "CALABARZON", "Cavite", "Imus", "Anabu II-D", "4103",
                        "Industrial Park access road",
                        new BigDecimal("14.4012"), new BigDecimal("120.9289"),
                        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80"
                ),
                new PublishedSeed(
                        "RFO penthouse Manila Bay breeze",
                        "Top floor 3BR, wraparound deck, smart locks, two parking slots.",
                        new BigDecimal("14200000.00"), PropertyType.CONDO, 3, 3,
                        new BigDecimal("110.0"), null,
                        "CALABARZON", "Cavite", "Bacoor", "Bayanan", "4102",
                        "Coastal Road skyline tower",
                        new BigDecimal("14.4689"), new BigDecimal("120.9821"),
                        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80"
                ),
                new PublishedSeed(
                        "Mediterranean villa General Trias",
                        "Gated community, pool-ready backyard, maid's room, near Eagle Ridge.",
                        new BigDecimal("11200000.00"), PropertyType.HOUSE, 5, 4,
                        new BigDecimal("210.0"), new BigDecimal("280.0"),
                        "CALABARZON", "Cavite", "General Trias", "Navarro", "4107",
                        "Governor's Hills executive village",
                        new BigDecimal("14.3855"), new BigDecimal("120.8871"),
                        "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=80"
                )
        };

        int added = 0;
        for (PublishedSeed seed : seeds) {
            if (propertyRepository.existsByAgentIdAndTitle(agentId, seed.title())) {
                continue;
            }
            Property p = Property.builder()
                    .agentId(agentId)
                    .title(seed.title())
                    .description(seed.description())
                    .pricePhp(seed.pricePhp())
                    .propertyType(seed.propertyType())
                    .bedrooms(seed.bedrooms())
                    .bathrooms(seed.bathrooms())
                    .floorAreaSqm(seed.floorAreaSqm())
                    .lotAreaSqm(seed.lotAreaSqm())
                    .region(seed.region())
                    .province(seed.province())
                    .cityMunicipality(seed.city())
                    .barangay(seed.barangay())
                    .postalCode(seed.postalCode())
                    .streetAddress(seed.streetAddress())
                    .latitude(seed.latitude())
                    .longitude(seed.longitude())
                    .status(PropertyStatus.PUBLISHED)
                    .publishedAt(Instant.now())
                    .build();
            Property saved = propertyRepository.save(p);
            seedCoverMedia(propertyMediaRepository, saved, seed.coverImageUrl());
            log.info("✅ Seeded PUBLISHED: {}", seed.title());
            added++;
        }
        if (added == 0) {
            log.info("Published showcase already complete ({} listings checked).", seeds.length);
        } else {
            log.info("Added {} new published listings (showcase total {}).", added, seeds.length);
        }
    }

    private void seedCoverMedia(PropertyMediaRepository propertyMediaRepository, Property property, String publicUrl) {
        PropertyMedia media = PropertyMedia.builder()
                .property(property)
                .mediaType(MediaType.IMAGE)
                .storageKey("seed/" + property.getId() + "/cover.jpg")
                .publicUrl(publicUrl)
                .sortOrder(0)
                .isCover(true)
                .build();
        propertyMediaRepository.save(media);
    }

    private record PublishedSeed(
            String title,
            String description,
            BigDecimal pricePhp,
            PropertyType propertyType,
            Integer bedrooms,
            Integer bathrooms,
            BigDecimal floorAreaSqm,
            BigDecimal lotAreaSqm,
            String region,
            String province,
            String city,
            String barangay,
            String postalCode,
            String streetAddress,
            BigDecimal latitude,
            BigDecimal longitude,
            String coverImageUrl
    ) {
    }
}
