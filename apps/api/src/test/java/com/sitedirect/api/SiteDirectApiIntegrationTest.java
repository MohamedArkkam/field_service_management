package com.sitedirect.api;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sitedirect.api.support.DockerPostgresSupport;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class SiteDirectApiIntegrationTest {

    private static final ObjectMapper MAPPER = new ObjectMapper().findAndRegisterModules();
    private static final DockerPostgresSupport POSTGRES = DockerPostgresSupport.start();

    @AfterAll
    static void stopPostgres() {
        POSTGRES.close();
    }

    @DynamicPropertySource
    static void datasourceProps(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::jdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::username);
        registry.add("spring.datasource.password", POSTGRES::password);
    }

    @Autowired
    private TestRestTemplate rest;

    private String adminToken;
    private String leadToken;
    private String clientToken;
    private UUID projectId;
    private String progressToken;
    private UUID leadId;

    @BeforeEach
    void setUpProjectWithLeadAndClient() {
        adminToken = login("admin@sitedirect.local", "Admin123!");
        String suffix = UUID.randomUUID().toString().substring(0, 8);

        JsonNode lead = postJson(
                "/api/users",
                adminToken,
                Map.of(
                        "email", "lead-" + suffix + "@sitedirect.local",
                        "password", "Lead1234!",
                        "fullName", "Site Lead",
                        "role", "SITE_LEAD"),
                HttpStatus.OK);
        leadId = UUID.fromString(lead.get("id").asText());

        postJson(
                "/api/users",
                adminToken,
                Map.of(
                        "email", "client-" + suffix + "@example.com",
                        "password", "Client123!",
                        "fullName", "Client",
                        "role", "CLIENT"),
                HttpStatus.OK);

        JsonNode project = postJson(
                "/api/projects",
                adminToken,
                Map.of(
                        "name", "IT Project " + suffix,
                        "location", "Main Road",
                        "priority", "HIGH",
                        "projectValue", 100000,
                        "clientDisplayName", "Client Co"),
                HttpStatus.CREATED);
        projectId = UUID.fromString(project.get("id").asText());
        progressToken = project.get("progressToken").asText();

        postJson(
                "/api/projects/" + projectId + "/assignments",
                adminToken,
                Map.of("userId", leadId.toString(), "assignmentRole", "SITE_LEAD"),
                HttpStatus.CREATED);

        leadToken = login("lead-" + suffix + "@sitedirect.local", "Lead1234!");
        clientToken = login("client-" + suffix + "@example.com", "Client123!");
    }

    @Test
    void healthAndOpenApiAreReachable() {
        ResponseEntity<String> health = rest.getForEntity("/api/health", String.class);
        assertThat(health.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(health.getBody()).contains("\"milestone\":\"M5\"");

        ResponseEntity<String> actuator = rest.getForEntity("/actuator/health", String.class);
        assertThat(actuator.getStatusCode()).isEqualTo(HttpStatus.OK);

        ResponseEntity<String> openApi = rest.getForEntity("/v3/api-docs", String.class);
        assertThat(openApi.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(openApi.getBody()).contains("SiteDirect Core API");
    }

    @Test
    void publishGate_hidesDraftUntilPublished() {
        JsonNode draft = postJson(
                "/api/site/projects/" + projectId + "/progress",
                leadToken,
                Map.of("title", "Footing poured", "note", "East wing"),
                HttpStatus.CREATED);
        assertThat(draft.get("status").asText()).isEqualTo("DRAFT");
        String progressId = draft.get("id").asText();

        JsonNode before = getJson("/api/public/p/" + progressToken, null, HttpStatus.OK);
        assertThat(before.get("updates")).isEmpty();

        JsonNode published = postJson(
                "/api/site/projects/" + projectId + "/progress/" + progressId + "/publish",
                leadToken,
                Map.of("rating", 4),
                HttpStatus.OK);
        assertThat(published.get("status").asText()).isEqualTo("PUBLISHED");
        assertThat(published.get("rating").asInt()).isEqualTo(4);

        JsonNode after = getJson("/api/public/p/" + progressToken, null, HttpStatus.OK);
        assertThat(after.get("updates")).hasSize(1);
        assertThat(after.get("updates").get(0).get("title").asText()).isEqualTo("Footing poured");
        assertThat(after.get("updates").get(0).get("rating").asInt()).isEqualTo(4);
        assertThat(after.toString()).doesNotContain("projectValue", "priority", "strategicNote");
    }

    @Test
    void clientCannotHitAdminOrSiteMoneyRoutes() {
        assertStatus(HttpMethod.GET, "/api/admin/liabilities", clientToken, HttpStatus.FORBIDDEN);
        assertStatus(HttpMethod.GET, "/api/site/projects/" + projectId + "/purchases", clientToken, HttpStatus.FORBIDDEN);
        assertStatus(HttpMethod.GET, "/api/site/projects/" + projectId + "/labour", clientToken, HttpStatus.FORBIDDEN);
        assertStatus(HttpMethod.GET, "/api/site/projects/" + projectId + "/attendance", clientToken, HttpStatus.FORBIDDEN);
        assertStatus(HttpMethod.GET, "/api/projects", clientToken, HttpStatus.FORBIDDEN);

        ResponseEntity<String> guess = rest.getForEntity("/api/public/purchases", String.class);
        assertThat(guess.getStatusCode().is4xxClientError() || guess.getStatusCode().is5xxServerError()).isTrue();
        assertThat(guess.getStatusCode()).isNotEqualTo(HttpStatus.OK);
    }

    @Test
    void paymentStatusAndLiabilitiesSanity() {
        JsonNode purchase = postJson(
                "/api/site/projects/" + projectId + "/purchases",
                leadToken,
                Map.of(
                        "description", "Cement",
                        "vendorName", "Yard",
                        "amount", 10000),
                HttpStatus.CREATED);
        assertThat(purchase.get("paymentStatus").asText()).isEqualTo("UNPAID");
        assertThat(purchase.get("outstanding").decimalValue()).isEqualByComparingTo("10000");

        JsonNode partial = putJson(
                "/api/site/projects/" + projectId + "/purchases/" + purchase.get("id").asText() + "/payment",
                leadToken,
                Map.of("amountPaid", 3000),
                HttpStatus.OK);
        assertThat(partial.get("paymentStatus").asText()).isEqualTo("PARTIAL");
        assertThat(partial.get("outstanding").decimalValue()).isEqualByComparingTo("7000");

        JsonNode worker = postJson(
                "/api/site/projects/" + projectId + "/workers",
                leadToken,
                Map.of("fullName", "Ravi", "payType", "DAILY", "rate", 900),
                HttpStatus.CREATED);

        postJson(
                "/api/site/projects/" + projectId + "/attendance",
                leadToken,
                Map.of("workerId", worker.get("id").asText(), "workDate", "2026-10-20"),
                HttpStatus.CREATED);

        JsonNode liabilities = getJson("/api/admin/liabilities", adminToken, HttpStatus.OK);
        assertThat(liabilities.get("totalPurchaseOutstanding").decimalValue()).isEqualByComparingTo("7000");
        assertThat(liabilities.get("totalLabourOutstanding").decimalValue()).isEqualByComparingTo("900");
        assertThat(liabilities.get("totalOutstanding").decimalValue()).isEqualByComparingTo("7900");
        assertThat(liabilities.get("projects")).isNotEmpty();

        putJson(
                "/api/site/projects/" + projectId + "/purchases/" + purchase.get("id").asText() + "/payment",
                leadToken,
                Map.of("amountPaid", 10000),
                HttpStatus.OK);

        JsonNode afterPaid = getJson("/api/admin/liabilities", adminToken, HttpStatus.OK);
        assertThat(afterPaid.get("totalPurchaseOutstanding").decimalValue()).isEqualByComparingTo("0");
        assertThat(afterPaid.get("totalLabourOutstanding").decimalValue()).isEqualByComparingTo("900");
    }

    private String login(String email, String password) {
        JsonNode body = postJson(
                "/api/auth/login",
                null,
                Map.of("email", email, "password", password),
                HttpStatus.OK);
        return body.get("token").asText();
    }

    private JsonNode postJson(String path, String token, Object body, HttpStatus expected) {
        return exchange(HttpMethod.POST, path, token, body, expected);
    }

    private JsonNode putJson(String path, String token, Object body, HttpStatus expected) {
        return exchange(HttpMethod.PUT, path, token, body, expected);
    }

    private JsonNode getJson(String path, String token, HttpStatus expected) {
        return exchange(HttpMethod.GET, path, token, null, expected);
    }

    private void assertStatus(HttpMethod method, String path, String token, HttpStatus expected) {
        ResponseEntity<String> response = rest.exchange(path, method, entity(token, null), String.class);
        assertThat(response.getStatusCode()).isEqualTo(expected);
    }

    private JsonNode exchange(HttpMethod method, String path, String token, Object body, HttpStatus expected) {
        ResponseEntity<String> response = rest.exchange(path, method, entity(token, body), String.class);
        assertThat(response.getStatusCode())
                .as("%s %s body=%s", method, path, response.getBody())
                .isEqualTo(expected);
        if (response.getBody() == null || response.getBody().isBlank()) {
            return MAPPER.createObjectNode();
        }
        try {
            return MAPPER.readTree(response.getBody());
        } catch (Exception ex) {
            throw new IllegalStateException("Invalid JSON: " + response.getBody(), ex);
        }
    }

    private HttpEntity<?> entity(String token, Object body) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        if (token != null) {
            headers.setBearerAuth(token);
        }
        if (body == null) {
            return new HttpEntity<>(headers);
        }
        return new HttpEntity<>(body, headers);
    }
}
