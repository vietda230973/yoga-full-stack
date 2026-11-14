package com.openclassrooms.starterjwt.mapper;

import com.openclassrooms.starterjwt.dto.TeacherDto;
import com.openclassrooms.starterjwt.models.Teacher;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class TeacherMapperTest {

    private TeacherMapper mapper;

    @BeforeEach
    void setUp() {
        mapper = new TeacherMapperImpl();
    }

    private Teacher buildTeacher(Long id, String firstName, String lastName) {
        Teacher teacher = new Teacher();
        teacher.setId(id);
        teacher.setFirstName(firstName);
        teacher.setLastName(lastName);
        teacher.setCreatedAt(LocalDateTime.now());
        teacher.setUpdatedAt(LocalDateTime.now());
        return teacher;
    }

    private TeacherDto buildDto(Long id, String firstName, String lastName) {
        TeacherDto dto = new TeacherDto();
        dto.setId(id);
        dto.setFirstName(firstName);
        dto.setLastName(lastName);
        dto.setCreatedAt(LocalDateTime.now());
        dto.setUpdatedAt(LocalDateTime.now());
        return dto;
    }

    // ---------- toEntity ----------

    @Test
    void toEntity_mapsAllFields() {
        TeacherDto dto = buildDto(1L, "Marie", "Dupont");

        Teacher teacher = mapper.toEntity(dto);

        assertEquals(dto.getId(), teacher.getId());
        assertEquals(dto.getFirstName(), teacher.getFirstName());
        assertEquals(dto.getLastName(), teacher.getLastName());
        assertEquals(dto.getCreatedAt(), teacher.getCreatedAt());
        assertEquals(dto.getUpdatedAt(), teacher.getUpdatedAt());
    }

    @Test
    void toEntity_nullDto_returnsNull() {
        assertNull(mapper.toEntity((TeacherDto) null));
    }

    @Test
    void toEntity_nullFields_arePreserved() {
        Teacher teacher = mapper.toEntity(new TeacherDto());

        assertNotNull(teacher);
        assertNull(teacher.getId());
        assertNull(teacher.getFirstName());
        assertNull(teacher.getLastName());
    }

    // ---------- toDto ----------

    @Test
    void toDto_mapsAllFields() {
        Teacher teacher = buildTeacher(2L, "Paul", "Martin");

        TeacherDto dto = mapper.toDto(teacher);

        assertEquals(teacher.getId(), dto.getId());
        assertEquals(teacher.getFirstName(), dto.getFirstName());
        assertEquals(teacher.getLastName(), dto.getLastName());
        assertEquals(teacher.getCreatedAt(), dto.getCreatedAt());
        assertEquals(teacher.getUpdatedAt(), dto.getUpdatedAt());
    }

    @Test
    void toDto_nullEntity_returnsNull() {
        assertNull(mapper.toDto((Teacher) null));
    }

    @Test
    void toDto_nullFields_arePreserved() {
        TeacherDto dto = mapper.toDto(new Teacher());

        assertNotNull(dto);
        assertNull(dto.getId());
        assertNull(dto.getFirstName());
        assertNull(dto.getLastName());
    }

    // ---------- Listes ----------

    @Test
    void toEntity_list_mapsEachElement() {
        List<TeacherDto> dtos = List.of(
                buildDto(1L, "Marie", "Dupont"),
                buildDto(2L, "Paul", "Martin"));

        List<Teacher> teachers = mapper.toEntity(dtos);

        assertEquals(2, teachers.size());
        assertEquals("Marie", teachers.get(0).getFirstName());
        assertEquals("Martin", teachers.get(1).getLastName());
    }

    @Test
    void toEntity_emptyList_returnsEmptyList() {
        assertTrue(mapper.toEntity(Collections.<TeacherDto>emptyList()).isEmpty());
    }

    @Test
    void toEntity_nullList_returnsNull() {
        assertNull(mapper.toEntity((List<TeacherDto>) null));
    }

    @Test
    void toDto_list_mapsEachElement() {
        List<Teacher> teachers = Arrays.asList(
                buildTeacher(1L, "Marie", "Dupont"),
                buildTeacher(2L, "Paul", "Martin"));

        List<TeacherDto> dtos = mapper.toDto(teachers);

        assertEquals(2, dtos.size());
        assertEquals(1L, dtos.get(0).getId());
        assertEquals("Paul", dtos.get(1).getFirstName());
    }

    @Test
    void toDto_emptyList_returnsEmptyList() {
        assertTrue(mapper.toDto(Collections.<Teacher>emptyList()).isEmpty());
    }

    @Test
    void toDto_nullList_returnsNull() {
        assertNull(mapper.toDto((List<Teacher>) null));
    }

    // ---------- Aller-retour ----------

    @Test
    void roundTrip_entityToDtoToEntity_keepsData() {
        Teacher original = buildTeacher(3L, "Claire", "Durand");

        Teacher result = mapper.toEntity(mapper.toDto(original));

        assertEquals(original.getId(), result.getId());
        assertEquals(original.getFirstName(), result.getFirstName());
        assertEquals(original.getLastName(), result.getLastName());
        assertEquals(original.getCreatedAt(), result.getCreatedAt());
        assertEquals(original.getUpdatedAt(), result.getUpdatedAt());
    }
}