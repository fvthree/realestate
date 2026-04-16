package com.realestate.sellerapi;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.modulith.core.ApplicationModules;
import org.springframework.modulith.docs.Documenter;

@SpringBootTest
class SellerApiApplicationTests {

    @Test
    void contextLoads() {
    }

    @Test
    void verifyModularStructure() {
        // This test verifies that the application's module structure is valid
        ApplicationModules modules = ApplicationModules.of(SellerApiApplication.class);
        modules.verify();
    }

    @Test
    void generateModuleDocumentation() {
        // This generates documentation about your module structure
        ApplicationModules modules = ApplicationModules.of(SellerApiApplication.class);
        new Documenter(modules)
                .writeDocumentation()
                .writeIndividualModulesAsPlantUml();
    }
}

