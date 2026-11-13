package com.openclassrooms.starterjwt.controllers;

import com.openclassrooms.starterjwt.dto.TeacherDto;
import com.openclassrooms.starterjwt.mapper.TeacherMapper;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.services.TeacherService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TeacherControllerTest {
    @Mock
    private TeacherService service;
    @Mock
    private TeacherMapper mapper;

    private TeacherController controller;

    @BeforeEach
    void setUp() {
        controller = new TeacherController(service, mapper);
    }

    @Test
    void findById_shouldReturnDtoOrNotFound() {
        Teacher teacher = new Teacher();
        TeacherDto dto = new TeacherDto();
        when(service.findById(1L)).thenReturn(teacher);
        when(mapper.toDto(teacher)).thenReturn(dto);

        assertSame(dto, controller.findById("1").getBody());
        when(service.findById(2L)).thenReturn(null);
        assertEquals(HttpStatus.NOT_FOUND, controller.findById("2").getStatusCode());
    }

    @Test
    void findAll_shouldReturnMappedTeachers() {
        List<Teacher> teachers = List.of(new Teacher());
        List<TeacherDto> dtos = List.of(new TeacherDto());
        when(service.findAll()).thenReturn(teachers);
        when(mapper.toDto(teachers)).thenReturn(dtos);

        assertSame(dtos, controller.findAll().getBody());
    }
}
