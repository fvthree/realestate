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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class PropertyMediaEndpointsTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private PropertyRepository propertyRepository;

    @Autowired
    private PropertyMediaRepository mediaRepository;

    @Autowired
    private AgentRepository agentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    private UUID agentId;
    private UUID propertyId;
    private String token;

    @BeforeEach
    void setUp() throws Exception {
        propertyRepository.deleteAll();
        mediaRepository.deleteAll();
        agentRepository.deleteAll();

        Agent agent = Agent.builder()
                .email("agent@example.com")
                .passwordHash(passwordEncoder.encode("password123"))
                .name("Agent Name")
                .build();
        Agent saved = agentRepository.save(agent);
        agentId = saved.getId();

        Property property = Property.builder()
                .agentId(agentId)
                .title("Test Property")
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
        Property savedProp = propertyRepository.save(property);
        propertyId = savedProp.getId();

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
    void addMediaReturns201() throws Exception {
        mockMvc.perform(post("/api/me/properties/" + propertyId + "/media")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "media_type": "IMAGE",
                                  "storage_key": "properties/uuid/img1.jpg",
                                  "public_url": "https://example.com/img1.jpg"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.property_id").value(propertyId.toString()))
                .andExpect(jsonPath("$.public_url").value("https://example.com/img1.jpg"))
                .andExpect(jsonPath("$.sort_order").value(0))
                .andExpect(jsonPath("$.is_cover").value(false));
    }

    @Test
    void updateMediaSortOrder() throws Exception {
        var media = mediaRepository.save(com.realestate.sellerapi.property.domain.PropertyMedia.builder()
                .id(propertyId)
                .mediaType(com.realestate.sellerapi.property.domain.MediaType.valueOf("IMAGE"))
                .storageKey("img1.jpg")
                .publicUrl("https://example.com/img1.jpg")
                .sortOrder(0)
                .isCover(false)
                .build());

        mockMvc.perform(patch("/api/me/properties/" + propertyId + "/media/" + media.getId())
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"sort_order\": 5}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sort_order").value(5));
    }

    @Test
    void updateMediaSetCover() throws Exception {
        var media1 = mediaRepository.save(com.realestate.sellerapi.property.domain.PropertyMedia.builder()
                .id(propertyId)
                .mediaType(com.realestate.sellerapi.property.domain.MediaType.valueOf("IMAGE"))
                .storageKey("img1.jpg")
                .publicUrl("https://example.com/img1.jpg")
                .sortOrder(0)
                .isCover(true)
                .build());

        var media2 = mediaRepository.save(com.realestate.sellerapi.property.domain.PropertyMedia.builder()
                .id(propertyId)
                .mediaType(com.realestate.sellerapi.property.domain.MediaType.valueOf("IMAGE"))
                .storageKey("img2.jpg")
                .publicUrl("https://example.com/img2.jpg")
                .sortOrder(1)
                .isCover(false)
                .build());

        mockMvc.perform(patch("/api/me/properties/" + propertyId + "/media/" + media2.getId())
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"is_cover\": true}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.is_cover").value(true));
    }

    @Test
    void deleteMediaReturns204() throws Exception {
        var media = mediaRepository.save(com.realestate.sellerapi.property.domain.PropertyMedia.builder()
                .id(propertyId)
                .mediaType(com.realestate.sellerapi.property.domain.MediaType.valueOf("IMAGE"))
                .storageKey("img1.jpg")
                .publicUrl("https://example.com/img1.jpg")
                .sortOrder(0)
                .isCover(false)
                .build());

        mockMvc.perform(delete("/api/me/properties/" + propertyId + "/media/" + media.getId())
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());

        assert !mediaRepository.existsById(media.getId());
    }
}

