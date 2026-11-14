package com.openclassrooms.starterjwt.dto;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.Set;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;

class SessionDtoTest {

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

    private SessionDto buildValidDto() {
        SessionDto dto = new SessionDto();
        dto.setId(1L);
        dto.setName("Yoga du matin");
        dto.setDate(new Date());
        dto.setTeacher_id(10L);
        dto.setDescription("Séance de yoga pour débutants");
        dto.setUsers(List.of(1L, 2L));
        dto.setCreatedAt(LocalDateTime.now());
        dto.setUpdatedAt(LocalDateTime.now());
        return dto;
    }

    private boolean hasViolationOn(Set<ConstraintViolation<SessionDto>> violations, String property) {
        return violations.stream()
                .anyMatch(v -> v.getPropertyPath().toString().equals(property));
    }

    // ---------- Validation ----------

    @Test
    void validDto_hasNoViolation() {
        assertTrue(validator.validate(buildValidDto()).isEmpty());
    }

    @Test
    void name_null_isInvalid() {
        SessionDto dto = buildValidDto();
        dto.setName(null);
        assertTrue(hasViolationOn(validator.validate(dto), "name"));
    }

    @Test
    void name_blank_isInvalid() {
        SessionDto dto = buildValidDto();
        dto.setName("   ");
        assertTrue(hasViolationOn(validator.validate(dto), "name"));
    }

    @Test
    void name_tooLong_isInvalid() {
        SessionDto dto = buildValidDto();
        dto.setName("a".repeat(51));
        assertTrue(hasViolationOn(validator.validate(dto), "name"));
    }

    @Test
    void name_maxLength_isValid() {
        SessionDto dto = buildValidDto();
        dto.setName("a".repeat(50));
        assertFalse(hasViolationOn(validator.validate(dto), "name"));
    }

    @Test
    void date_null_isInvalid() {
        SessionDto dto = buildValidDto();
        dto.setDate(null);
        assertTrue(hasViolationOn(validator.validate(dto), "date"));
    }

    @Test
    void teacherId_null_isInvalid() {
        SessionDto dto = buildValidDto();
        dto.setTeacher_id(null);
        assertTrue(hasViolationOn(validator.validate(dto), "teacher_id"));
    }

    @Test
    void description_null_isInvalid() {
        SessionDto dto = buildValidDto();
        dto.setDescription(null);
        assertTrue(hasViolationOn(validator.validate(dto), "description"));
    }

    @Test
    void description_tooLong_isInvalid() {
        SessionDto dto = buildValidDto();
        dto.setDescription("a".repeat(2501));
        assertTrue(hasViolationOn(validator.validate(dto), "description"));
    }

    @Test
    void description_maxLength_isValid() {
        SessionDto dto = buildValidDto();
        dto.setDescription("a".repeat(2500));
        assertFalse(hasViolationOn(validator.validate(dto), "description"));
    }

    @Test
    void optionalFields_canBeNull() {
        SessionDto dto = buildValidDto();
        dto.setId(null);
        dto.setUsers(null);
        dto.setCreatedAt(null);
        dto.setUpdatedAt(null);
        assertTrue(validator.validate(dto).isEmpty());
    }

    // ---------- Lombok : getters / setters / constructeurs ----------

    @Test
    void gettersAndSetters_work() {
        Date date = new Date();
        LocalDateTime now = LocalDateTime.now();

        SessionDto dto = new SessionDto();
        dto.setId(5L);
        dto.setName("Session");
        dto.setDate(date);
        dto.setTeacher_id(3L);
        dto.setDescription("Desc");
        dto.setUsers(List.of(7L));
        dto.setCreatedAt(now);
        dto.setUpdatedAt(now);

        assertEquals(5L, dto.getId());
        assertEquals("Session", dto.getName());
        assertEquals(date, dto.getDate());
        assertEquals(3L, dto.getTeacher_id());
        assertEquals("Desc", dto.getDescription());
        assertEquals(List.of(7L), dto.getUsers());
        assertEquals(now, dto.getCreatedAt());
        assertEquals(now, dto.getUpdatedAt());
    }

    @Test
    void allArgsConstructor_setsAllFields() {
        Date date = new Date();
        LocalDateTime now = LocalDateTime.now();

        SessionDto dto = new SessionDto(1L, "Nom", date, 2L, "Desc", List.of(4L), now, now);

        assertEquals(1L, dto.getId());
        assertEquals("Nom", dto.getName());
        assertEquals(date, dto.getDate());
        assertEquals(2L, dto.getTeacher_id());
        assertEquals("Desc", dto.getDescription());
        assertEquals(List.of(4L), dto.getUsers());
        assertEquals(now, dto.getCreatedAt());
        assertEquals(now, dto.getUpdatedAt());
    }

    @Test
    void noArgsConstructor_createsEmptyDto() {
        SessionDto dto = new SessionDto();
        assertNull(dto.getId());
        assertNull(dto.getName());
    }

    @Test
    void equalsAndHashCode_areConsistent() {
        Date date = new Date();
        LocalDateTime now = LocalDateTime.now();

        SessionDto a = new SessionDto(1L, "Nom", date, 2L, "Desc", List.of(4L), now, now);
        SessionDto b = new SessionDto(1L, "Nom", date, 2L, "Desc", List.of(4L), now, now);
        SessionDto c = new SessionDto(2L, "Autre", date, 2L, "Desc", List.of(4L), now, now);

        assertEquals(a, b);
        assertEquals(a.hashCode(), b.hashCode());
        assertNotEquals(a, c);
    }

    @Test
    void toString_containsFieldValues() {
        SessionDto dto = buildValidDto();
        String s = dto.toString();
        assertTrue(s.contains("Yoga du matin"));
    }
}