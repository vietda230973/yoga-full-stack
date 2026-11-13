package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.repository.TeacherRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TeacherServiceTest {
    @Mock
    private TeacherRepository repository;

    private TeacherService service;

    @BeforeEach
    void setUp() {
        service = new TeacherService(repository);
    }

    @Test
    void findAll_shouldReturnRepositoryResults() {
        List<Teacher> teachers = List.of(new Teacher());
        when(repository.findAll()).thenReturn(teachers);

        assertSame(teachers, service.findAll());
    }

    @Test
    void findById_shouldReturnTeacherOrNull() {
        Teacher teacher = new Teacher();
        when(repository.findById(1L)).thenReturn(Optional.of(teacher));
        when(repository.findById(2L)).thenReturn(Optional.empty());

        assertSame(teacher, service.findById(1L));
        assertNull(service.findById(2L));
    }
}
