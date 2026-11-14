package com.openclassrooms.starterjwt.dto;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class UserDtoTest {

    private static ValidatorFactory factory;
    private static Validator validator;
    private final ObjectMapper mapper = new ObjectMapper();

    @BeforeAll
    static void setUpValidator() {
        factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @AfterAll
    static void closeValidator() {
        factory.close();
    }

    private UserDto buildValidDto() {
        UserDto dto = new UserDto();
        dto.setId(1L);
        dto.setEmail("marie.dupont@test.com");
        dto.setLastName("Dupont");
        dto.setFirstName("Marie");
        dto.setAdmin(false);
        dto.setPassword("secret123");
        dto.setCreatedAt(LocalDateTime.now());
        dto.setUpdatedAt(LocalDateTime.now());
        return dto;
    }

    private boolean hasViolationOn(Set<ConstraintViolation<UserDto>> violations, String property) {
        return violations.stream()
                .anyMatch(v -> v.getPropertyPath().toString().equals(property));
    }

    // ---------- Bean Validation (@Email, @Size) ----------

    @Test
    void validDto_hasNoViolation() {
        assertTrue(validator.validate(buildValidDto()).isEmpty());
    }

    @Test
    void email_invalidFormat_isInvalid() {
        UserDto dto = buildValidDto();
        dto.setEmail("pas-un-email");
        assertTrue(hasViolationOn(validator.validate(dto), "email"));
    }

    @Test
    void email_tooLong_isInvalid() {
        UserDto dto = buildValidDto();
        dto.setEmail("a".repeat(42) + "@test.com"); // 51 caractères
        assertTrue(hasViolationOn(validator.validate(dto), "email"));
    }

    @Test
    void email_maxLength_isValid() {
        UserDto dto = buildValidDto();
        dto.setEmail("a".repeat(41) + "@test.com"); // 50 caractères
        assertFalse(hasViolationOn(validator.validate(dto), "email"));
    }

    @Test
    void lastName_tooLong_isInvalid() {
        UserDto dto = buildValidDto();
        dto.setLastName("a".repeat(21));
        assertTrue(hasViolationOn(validator.validate(dto), "lastName"));
    }

    @Test
    void lastName_maxLength_isValid() {
        UserDto dto = buildValidDto();
        dto.setLastName("a".repeat(20));
        assertFalse(hasViolationOn(validator.validate(dto), "lastName"));
    }

    @Test
    void firstName_tooLong_isInvalid() {
        UserDto dto = buildValidDto();
        dto.setFirstName("a".repeat(21));
        assertTrue(hasViolationOn(validator.validate(dto), "firstName"));
    }

    @Test
    void firstName_maxLength_isValid() {
        UserDto dto = buildValidDto();
        dto.setFirstName("a".repeat(20));
        assertFalse(hasViolationOn(validator.validate(dto), "firstName"));
    }

    @Test
    void password_tooLong_isInvalid() {
        UserDto dto = buildValidDto();
        dto.setPassword("a".repeat(121));
        assertTrue(hasViolationOn(validator.validate(dto), "password"));
    }

    @Test
    void password_maxLength_isValid() {
        UserDto dto = buildValidDto();
        dto.setPassword("a".repeat(120));
        assertFalse(hasViolationOn(validator.validate(dto), "password"));
    }

    @Test
    void password_null_isValid() {
        UserDto dto = buildValidDto();
        dto.setPassword(null);
        assertTrue(validator.validate(dto).isEmpty());
    }

    @Test
    void emptyDtoFromNoArgsConstructor_passesBeanValidation() {
        // Lombok @NonNull n'est pas vérifié par Bean Validation :
        // les champs null ne produisent aucune violation.
        assertTrue(validator.validate(new UserDto()).isEmpty());
    }

    // ---------- Lombok @NonNull : contrôles à l'exécution ----------

    @Test
    void setEmail_null_throwsNpe() {
        UserDto dto = new UserDto();
        assertThrows(NullPointerException.class, () -> dto.setEmail(null));
    }

    @Test
    void setLastName_null_throwsNpe() {
        UserDto dto = new UserDto();
        assertThrows(NullPointerException.class, () -> dto.setLastName(null));
    }

    @Test
    void setFirstName_null_throwsNpe() {
        UserDto dto = new UserDto();
        assertThrows(NullPointerException.class, () -> dto.setFirstName(null));
    }

    @Test
    void allArgsConstructor_nullEmail_throwsNpe() {
        assertThrows(NullPointerException.class, () ->
                new UserDto(1L, null, "Dupont", "Marie", false, "pwd", null, null));
    }

    @Test
    void allArgsConstructor_nullLastName_throwsNpe() {
        assertThrows(NullPointerException.class, () ->
                new UserDto(1L, "a@test.com", null, "Marie", false, "pwd", null, null));
    }

    @Test
    void allArgsConstructor_nullFirstName_throwsNpe() {
        assertThrows(NullPointerException.class, () ->
                new UserDto(1L, "a@test.com", "Dupont", null, false, "pwd", null, null));
    }

    // ---------- Lombok : getters / setters / constructeurs ----------

    @Test
    void gettersAndSetters_work() {
        LocalDateTime now = LocalDateTime.now();

        UserDto dto = new UserDto();
        dto.setId(5L);
        dto.setEmail("paul@test.com");
        dto.setLastName("Martin");
        dto.setFirstName("Paul");
        dto.setAdmin(true);
        dto.setPassword("pwd");
        dto.setCreatedAt(now);
        dto.setUpdatedAt(now);

        assertEquals(5L, dto.getId());
        assertEquals("paul@test.com", dto.getEmail());
        assertEquals("Martin", dto.getLastName());
        assertEquals("Paul", dto.getFirstName());
        assertTrue(dto.isAdmin());
        assertEquals("pwd", dto.getPassword());
        assertEquals(now, dto.getCreatedAt());
        assertEquals(now, dto.getUpdatedAt());
    }

    @Test
    void allArgsConstructor_setsAllFields() {
        LocalDateTime now = LocalDateTime.now();

        UserDto dto = new UserDto(1L, "a@test.com", "Durand", "Claire", true, "pwd", now, now);

        assertEquals(1L, dto.getId());
        assertEquals("a@test.com", dto.getEmail());
        assertEquals("Durand", dto.getLastName());
        assertEquals("Claire", dto.getFirstName());
        assertTrue(dto.isAdmin());
        assertEquals("pwd", dto.getPassword());
        assertEquals(now, dto.getCreatedAt());
        assertEquals(now, dto.getUpdatedAt());
    }

    @Test
    void noArgsConstructor_createsEmptyDto() {
        UserDto dto = new UserDto();
        assertNull(dto.getId());
        assertNull(dto.getEmail());
        assertNull(dto.getLastName());
        assertNull(dto.getFirstName());
        assertFalse(dto.isAdmin());
        assertNull(dto.getPassword());
    }

    @Test
    void equalsAndHashCode_areConsistent() {
        LocalDateTime now = LocalDateTime.now();

        UserDto a = new UserDto(1L, "a@test.com", "Durand", "Claire", false, "pwd", now, now);
        UserDto b = new UserDto(1L, "a@test.com", "Durand", "Claire", false, "pwd", now, now);
        UserDto c = new UserDto(2L, "b@test.com", "Autre", "Personne", true, "pwd", now, now);

        assertEquals(a, b);
        assertEquals(a.hashCode(), b.hashCode());
        assertNotEquals(a, c);
    }

    @Test
    void toString_containsFieldValues() {
        String s = buildValidDto().toString();
        assertTrue(s.contains("Dupont"));
        assertTrue(s.contains("marie.dupont@test.com"));
    }

    // ---------- Jackson : @JsonIgnore sur password ----------

    @Test
    void serialization_excludesPassword() throws Exception {
        UserDto dto = buildValidDto();
        dto.setCreatedAt(null); // évite d'avoir besoin du module JavaTime
        dto.setUpdatedAt(null);

        String json = mapper.writeValueAsString(dto);

        assertFalse(json.contains("password"));
        assertFalse(json.contains("secret123"));
        assertTrue(json.contains("\"email\":\"marie.dupont@test.com\""));
        assertTrue(json.contains("\"admin\":false"));
    }

    @Test
    void deserialization_ignoresPassword() throws Exception {
        String json = "{\"id\":1,\"email\":\"a@test.com\",\"lastName\":\"Durand\","
                + "\"firstName\":\"Claire\",\"admin\":true,\"password\":\"hack\"}";

        UserDto dto = mapper.readValue(json, UserDto.class);

        assertEquals("a@test.com", dto.getEmail());
        assertTrue(dto.isAdmin());
        assertNull(dto.getPassword());
    }
}
