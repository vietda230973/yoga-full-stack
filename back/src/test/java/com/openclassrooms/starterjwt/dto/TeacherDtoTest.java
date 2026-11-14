package com.openclassrooms.starterjwt.dto;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDateTime;
import java.util.Set;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;

class TeacherDtoTest {

    private static ValidatorFactory factory;
    private static Validator validator;

    @BeforeAll
    static void setUpValidator() {
        factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @AfterAll
    static void closeValidator() {
        factory.close();
    }

    private TeacherDto buildValidDto() {
        TeacherDto dto = new TeacherDto();
        dto.setId(1L);
        dto.setLastName("Dupont");
        dto.setFirstName("Marie");
        dto.setCreatedAt(LocalDateTime.now());
        dto.setUpdatedAt(LocalDateTime.now());
        return dto;
    }

    private boolean hasViolationOn(Set<ConstraintViolation<TeacherDto>> violations, String property) {
        return violations.stream()
                .anyMatch(v -> v.getPropertyPath().toString().equals(property));
    }

    // ---------- Validation ----------

    @Test
    void validDto_hasNoViolation() {
        assertTrue(validator.validate(buildValidDto()).isEmpty());
    }

    @Test
    void lastName_null_isInvalid() {
        TeacherDto dto = buildValidDto();
        dto.setLastName(null);
        assertTrue(hasViolationOn(validator.validate(dto), "lastName"));
    }

    @Test
    void lastName_blank_isInvalid() {
        TeacherDto dto = buildValidDto();
        dto.setLastName("   ");
        assertTrue(hasViolationOn(validator.validate(dto), "lastName"));
    }

    @Test
    void lastName_tooLong_isInvalid() {
        TeacherDto dto = buildValidDto();
        dto.setLastName("a".repeat(21));
        assertTrue(hasViolationOn(validator.validate(dto), "lastName"));
    }

    @Test
    void lastName_maxLength_isValid() {
        TeacherDto dto = buildValidDto();
        dto.setLastName("a".repeat(20));
        assertFalse(hasViolationOn(validator.validate(dto), "lastName"));
    }

    @Test
    void firstName_null_isInvalid() {
        TeacherDto dto = buildValidDto();
        dto.setFirstName(null);
        assertTrue(hasViolationOn(validator.validate(dto), "firstName"));
    }

    @Test
    void firstName_blank_isInvalid() {
        TeacherDto dto = buildValidDto();
        dto.setFirstName("");
        assertTrue(hasViolationOn(validator.validate(dto), "firstName"));
    }

    @Test
    void firstName_tooLong_isInvalid() {
        TeacherDto dto = buildValidDto();
        dto.setFirstName("a".repeat(21));
        assertTrue(hasViolationOn(validator.validate(dto), "firstName"));
    }

    @Test
    void firstName_maxLength_isValid() {
        TeacherDto dto = buildValidDto();
        dto.setFirstName("a".repeat(20));
        assertFalse(hasViolationOn(validator.validate(dto), "firstName"));
    }

    @Test
    void optionalFields_canBeNull() {
        TeacherDto dto = buildValidDto();
        dto.setId(null);
        dto.setCreatedAt(null);
        dto.setUpdatedAt(null);
        assertTrue(validator.validate(dto).isEmpty());
    }

    @Test
    void bothNamesInvalid_producesTwoViolations() {
        TeacherDto dto = buildValidDto();
        dto.setLastName(null);
        dto.setFirstName(null);

        Set<ConstraintViolation<TeacherDto>> violations = validator.validate(dto);

        assertTrue(hasViolationOn(violations, "lastName"));
        assertTrue(hasViolationOn(violations, "firstName"));
    }

    // ---------- Lombok : getters / setters / constructeurs ----------

    @Test
    void gettersAndSetters_work() {
        LocalDateTime now = LocalDateTime.now();

        TeacherDto dto = new TeacherDto();
        dto.setId(5L);
        dto.setLastName("Martin");
        dto.setFirstName("Paul");
        dto.setCreatedAt(now);
        dto.setUpdatedAt(now);

        assertEquals(5L, dto.getId());
        assertEquals("Martin", dto.getLastName());
        assertEquals("Paul", dto.getFirstName());
        assertEquals(now, dto.getCreatedAt());
        assertEquals(now, dto.getUpdatedAt());
    }

    @Test
    void allArgsConstructor_setsAllFields() {
        LocalDateTime now = LocalDateTime.now();

        TeacherDto dto = new TeacherDto(1L, "Durand", "Claire", now, now);

        assertEquals(1L, dto.getId());
        assertEquals("Durand", dto.getLastName());
        assertEquals("Claire", dto.getFirstName());
        assertEquals(now, dto.getCreatedAt());
        assertEquals(now, dto.getUpdatedAt());
    }

    @Test
    void noArgsConstructor_createsEmptyDto() {
        TeacherDto dto = new TeacherDto();
        assertNull(dto.getId());
        assertNull(dto.getLastName());
        assertNull(dto.getFirstName());
        assertNull(dto.getCreatedAt());
        assertNull(dto.getUpdatedAt());
    }

    @Test
    void equalsAndHashCode_areConsistent() {
        LocalDateTime now = LocalDateTime.now();

        TeacherDto a = new TeacherDto(1L, "Durand", "Claire", now, now);
        TeacherDto b = new TeacherDto(1L, "Durand", "Claire", now, now);
        TeacherDto c = new TeacherDto(2L, "Autre", "Personne", now, now);

        assertEquals(a, b);
        assertEquals(a.hashCode(), b.hashCode());
        assertNotEquals(a, c);
    }

    @Test
    void toString_containsFieldValues() {
        String s = buildValidDto().toString();
        assertTrue(s.contains("Dupont"));
        assertTrue(s.contains("Marie"));
    }
}