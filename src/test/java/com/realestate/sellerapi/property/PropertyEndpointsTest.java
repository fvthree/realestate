package com.realestate.sellerapi.property;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.realestate.sellerapi.agent.AgentRepository;
import com.realestate.sellerapi.agent.domain.Agent;
import com.realestate.sellerapi.property.domain.Property;
import com.realestate.sellerapi.property.domain.PropertyStatus;
import com.realestate.sellerapi.property.domain.PropertyType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class PropertyEndpointsTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private PropertyRepository propertyRepository;

    @Autowired
    private AgentRepository agentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    private UUID agentId;
    private String token;

    @BeforeEach
    void setUp() throws Exception {
        propertyRepository.deleteAll();
        agentRepository.deleteAll();

        Agent agent = Agent.builder()
                .email("agent@example.com")
                .passwordHash(passwordEncoder.encode("password123"))
                .name("Agent Name")
                .phone("+639171234567")
                .avatarUrl("https://example.com/avatar.jpg")
                .build();
        Agent saved = agentRepository.save(agent);
        agentId = saved.getId();

        // Login to get token
        String loginBody = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"agent@example.com\",\"password\":\"password123\"}"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode node = objectMapper.readTree(loginBody);
        token = node.get("access_token").asText();
    }

    @Test
    void createPropertyReturns201() throws Exception {
        String requestBody = """
                {
                  "title": "2BR Condo",
                  "description": "Nice condo",
                  "price_php": 3500000.00,
                  "property_type": "CONDO",
                  "bedrooms": 2,
                  "bathrooms": 1,
                  "floor_area_sqm": 45.0,
                  "address": {
                    "region": "CALABARZON",
                    "province": "Cavite",
                    "city_municipality": "Imus",
                    "barangay": "Anabu",
                    "postal_code": "4103",
                    "street_address": "123 Main St"
                  },
                  "geo": { "latitude": 14.4, "longitude": 120.9 }
                }
                """;

        mockMvc.perform(post("/api/me/properties")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("2BR Condo"))
                .andExpect(jsonPath("$.status").value("DRAFT"));
    }

    @Test
    void updatePropertyReturnsUpdated() throws Exception {
        // Create property first
        Property property = Property.builder()
                .agentId(agentId)
                .title("Original Title")
                .description("Original description")
                .pricePhp(new BigDecimal("3500000"))
                .propertyType(PropertyType.valueOf("CONDO"))
                .bedrooms(2)
                .bathrooms(1)
                .floorAreaSqm(new BigDecimal("45"))
                .region("CALABARZON")
                .province("Cavite")
                .cityMunicipality("Imus")
                .barangay("Anabu")
                .postalCode("4103")
                .streetAddress("123 Main St")
                .status(PropertyStatus.DRAFT)
                .build();
        Property saved = propertyRepository.save(property);

        String updateBody = """
                {
                  "title": "Updated Title",
                  "bedrooms": 3
                }
                """;

        mockMvc.perform(patch("/api/me/properties/" + saved.getId())
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Updated Title"))
                .andExpect(jsonPath("$.bedrooms").value(3));
    }

    @Test
    void deletePropertyReturns204() throws Exception {
        Property property = Property.builder()
                .agentId(agentId)
                .title("To Delete")
                .description("Description")
                .pricePhp(new BigDecimal("3500000"))
                .propertyType(PropertyType.valueOf("CONDO"))
                .bedrooms(2)
                .bathrooms(1)
                .floorAreaSqm(new BigDecimal("45"))
                .region("CALABARZON")
                .province("Cavite")
                .cityMunicipality("Imus")
                .barangay("Anabu")
                .postalCode("4103")
                .streetAddress("123 Main St")
                .status(PropertyStatus.DRAFT)
                .build();
        Property saved = propertyRepository.save(property);

        mockMvc.perform(delete("/api/me/properties/" + saved.getId())
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());

        assertThat(propertyRepository.existsById(saved.getId())).isFalse();
    }

    @Test
    void publishPropertyTransitionsDraftToPublished() throws Exception {
        Property property = Property.builder()
                .agentId(agentId)
                .title("To Publish")
                .description("Description")
                .pricePhp(new BigDecimal("3500000"))
                .propertyType(PropertyType.valueOf("CONDO"))
                .bedrooms(2)
                .bathrooms(1)
                .floorAreaSqm(new BigDecimal("45"))
                .region("CALABARZON")
                .province("Cavite")
                .cityMunicipality("Imus")
                .barangay("Anabu")
                .postalCode("4103")
                .streetAddress("123 Main St")
                .status(PropertyStatus.DRAFT)
                .build();
        Property saved = propertyRepository.save(property);

        mockMvc.perform(post("/api/me/properties/" + saved.getId() + "/publish")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PUBLISHED"))
                .andExpect(jsonPath("$.published_at").isNotEmpty());
    }

    @Test
    void markSoldTransitionsPublishedToSold() throws Exception {
        Property property = Property.builder()
                .agentId(agentId)
                .title("To Sell")
                .description("Description")
                .pricePhp(new BigDecimal("3500000"))
                .propertyType(PropertyType.valueOf("CONDO"))
                .bedrooms(2)
                .bathrooms(1)
                .floorAreaSqm(new BigDecimal("45"))
                .region("CALABARZON")
                .province("Cavite")
                .cityMunicipality("Imus")
                .barangay("Anabu")
                .postalCode("4103")
                .streetAddress("123 Main St")
                .status(PropertyStatus.PUBLISHED)
                .publishedAt(java.time.Instant.now())
                .build();
        Property saved = propertyRepository.save(property);

        mockMvc.perform(post("/api/me/properties/" + saved.getId() + "/mark-sold")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SOLD"))
                .andExpect(jsonPath("$.sold_at").isNotEmpty());
    }

    @Test
    void listAgentPropertiesFiltersNoStatus() throws Exception {
        Property prop1 = Property.builder()
                .agentId(agentId)
                .title("Draft 1")
                .description("Desc")
                .pricePhp(new BigDecimal("1000000"))
                .propertyType(PropertyType.valueOf("CONDO"))
                .bedrooms(2)
                .bathrooms(1)
                .floorAreaSqm(new BigDecimal("45"))
                .region("CALABARZON")
                .province("Cavite")
                .cityMunicipality("Imus")
                .barangay("Anabu")
                .postalCode("4103")
                .streetAddress("123 Main St")
                .status(PropertyStatus.DRAFT)
                .build();

        Property prop2 = Property.builder()
                .agentId(agentId)
                .title("Published 1")
                .description("Desc")
                .pricePhp(new BigDecimal("2000000"))
                .propertyType(PropertyType.valueOf("HOUSE"))
                .bedrooms(3)
                .bathrooms(2)
                .floorAreaSqm(new BigDecimal("150"))
                .region("CALABARZON")
                .province("Cavite")
                .cityMunicipality("Imus")
                .barangay("Anabu")
                .postalCode("4103")
                .streetAddress("456 Oak St")
                .status(PropertyStatus.PUBLISHED)
                .publishedAt(java.time.Instant.now())
                .build();

        propertyRepository.saveAll(java.util.List.of(prop1, prop2));

        mockMvc.perform(get("/api/me/properties")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(2))
                .andExpect(jsonPath("$.meta.total").value(2));
    }

    @Test
    void publicPropertyBrowsingRequiresNoAuth() throws Exception {
        Property property = Property.builder()
                .agentId(agentId)
                .title("Published Property")
                .description("Description")
                .pricePhp(new BigDecimal("3500000"))
                .propertyType(PropertyType.valueOf("CONDO"))
                .bedrooms(2)
                .bathrooms(1)
                .floorAreaSqm(new BigDecimal("45"))
                .region("CALABARZON")
                .province("Cavite")
                .cityMunicipality("Imus")
                .barangay("Anabu")
                .postalCode("4103")
                .streetAddress("123 Main St")
                .status(PropertyStatus.PUBLISHED)
                .publishedAt(java.time.Instant.now())
                .build();
        Property saved = propertyRepository.save(property);

        mockMvc.perform(get("/api/public/properties"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1));

        mockMvc.perform(get("/api/public/properties/" + saved.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Published Property"));
    }
}

