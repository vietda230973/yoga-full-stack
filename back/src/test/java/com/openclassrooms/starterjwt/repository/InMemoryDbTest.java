package com.openclassrooms.starterjwt.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import com.openclassrooms.starterjwt.models.Teacher;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
class InMemoryDbTest {

    @Autowired
    private TeacherRepository teacherRepository;

    @Test
    void givenTeacher_whenSaved_thenCanBeRetrievedFromInMemoryDatabase() {
        Teacher teacher = new Teacher();
        teacher.setFirstName("John");
        teacher.setLastName("Doe");

        Teacher savedTeacher = teacherRepository.saveAndFlush(teacher);
        Teacher retrievedTeacher = teacherRepository.findById(savedTeacher.getId()).orElseThrow();

        assertNotNull(savedTeacher.getId());
        assertEquals("John", retrievedTeacher.getFirstName());
        assertEquals("Doe", retrievedTeacher.getLastName());
    }
}
