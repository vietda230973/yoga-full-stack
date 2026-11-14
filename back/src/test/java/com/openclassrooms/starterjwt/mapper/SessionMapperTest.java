package com.openclassrooms.starterjwt.mapper;

import com.openclassrooms.starterjwt.dto.SessionDto;
import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.services.TeacherService;
import com.openclassrooms.starterjwt.services.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.lang.reflect.Field;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Date;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SessionMapperTest {

    @Mock
    private TeacherService teacherService;

    @Mock
    private UserService userService;

    private SessionMapper mapper;

    @BeforeEach
    void setUp() throws Exception {
        mapper = new SessionMapperImpl();
        // Les champs @Autowired existent dans la classe abstraite ET dans l'Impl générée
        // (à cause de "uses = UserService.class") : on injecte partout où le type correspond.
        inject(mapper, teacherService, TeacherService.class);
        inject(mapper, userService, UserService.class);
    }

    private static void inject(Object target, Object mock, Class<?> type) throws Exception {
        for (Class<?> c = target.getClass(); c != null && c != Object.class; c = c.getSuperclass()) {
            for (Field f : c.getDeclaredFields()) {
                if (f.getType().equals(type)) {
                    f.setAccessible(true);
                    f.set(target, mock);
                }
            }
        }
    }

    private Teacher buildTeacher(Long id) {
        Teacher teacher = new Teacher();
        teacher.setId(id);
        teacher.setFirstName("Marie");
        teacher.setLastName("Dupont");
        return teacher;
    }

    private User buildUser(Long id) {
        return User.builder()
                .id(id)
                .email("user" + id + "@test.com")
                .firstName("First" + id)
                .lastName("Last" + id)
                .password("pwd")
                .admin(false)
                .build();
    }

    private SessionDto buildDto() {
        SessionDto dto = new SessionDto();
        dto.setId(1L);
        dto.setName("Yoga du matin");
        dto.setDate(new Date());
        dto.setTeacher_id(10L);
        dto.setDescription("Séance pour débutants");
        dto.setUsers(List.of(1L, 2L));
        dto.setCreatedAt(LocalDateTime.now());
        dto.setUpdatedAt(LocalDateTime.now());
        return dto;
    }

    private Session buildSession() {
        Session session = new Session();
        session.setId(1L);
        session.setName("Yoga du soir");
        session.setDate(new Date());
        session.setDescription("Séance avancée");
        session.setTeacher(buildTeacher(10L));
        session.setUsers(List.of(buildUser(1L), buildUser(2L)));
        session.setCreatedAt(LocalDateTime.now());
        session.setUpdatedAt(LocalDateTime.now());
        return session;
    }

    // ---------- toEntity ----------

    @Test
    void toEntity_mapsAllFields() {
        SessionDto dto = buildDto();
        Teacher teacher = buildTeacher(10L);
        User user1 = buildUser(1L);
        User user2 = buildUser(2L);

        when(teacherService.findById(10L)).thenReturn(teacher);
        when(userService.findById(1L)).thenReturn(user1);
        when(userService.findById(2L)).thenReturn(user2);

        Session session = mapper.toEntity(dto);

        assertEquals(dto.getId(), session.getId());
        assertEquals(dto.getName(), session.getName());
        assertEquals(dto.getDate(), session.getDate());
        assertEquals(dto.getDescription(), session.getDescription());
        assertEquals(dto.getCreatedAt(), session.getCreatedAt());
        assertEquals(dto.getUpdatedAt(), session.getUpdatedAt());
        assertSame(teacher, session.getTeacher());
        assertEquals(List.of(user1, user2), session.getUsers());

        verify(teacherService).findById(10L);
        verify(userService).findById(1L);
        verify(userService).findById(2L);
    }

    @Test
    void toEntity_nullTeacherId_givesNullTeacherAndDoesNotCallService() {
        SessionDto dto = buildDto();
        dto.setTeacher_id(null);

        Session session = mapper.toEntity(dto);

        assertNull(session.getTeacher());
        verifyNoInteractions(teacherService);
    }

    @Test
    void toEntity_unknownTeacher_givesNullTeacher() {
        SessionDto dto = buildDto();
        when(teacherService.findById(10L)).thenReturn(null);

        Session session = mapper.toEntity(dto);

        assertNull(session.getTeacher());
        verify(teacherService).findById(10L);
    }

    @Test
    void toEntity_nullUsers_givesEmptyList() {
        SessionDto dto = buildDto();
        dto.setUsers(null);

        Session session = mapper.toEntity(dto);

        assertNotNull(session.getUsers());
        assertTrue(session.getUsers().isEmpty());
        verifyNoInteractions(userService);
    }

    @Test
    void toEntity_emptyUsers_givesEmptyList() {
        SessionDto dto = buildDto();
        dto.setUsers(Collections.emptyList());

        Session session = mapper.toEntity(dto);

        assertTrue(session.getUsers().isEmpty());
        verifyNoInteractions(userService);
    }

    @Test
    void toEntity_unknownUser_isMappedToNullInList() {
        SessionDto dto = buildDto();
        dto.setUsers(List.of(1L, 99L));
        User user1 = buildUser(1L);

        when(teacherService.findById(10L)).thenReturn(buildTeacher(10L));
        when(userService.findById(1L)).thenReturn(user1);
        when(userService.findById(99L)).thenReturn(null);

        Session session = mapper.toEntity(dto);

        // Comportement actuel du mapper : un utilisateur introuvable devient null dans la liste
        assertEquals(2, session.getUsers().size());
        assertSame(user1, session.getUsers().get(0));
        assertNull(session.getUsers().get(1));
    }

    @Test
    void toEntity_nullDto_returnsNull() {
        assertNull(mapper.toEntity((SessionDto) null));
    }

    // ---------- toDto ----------

    @Test
    void toDto_mapsAllFields() {
        Session session = buildSession();

        SessionDto dto = mapper.toDto(session);

        assertEquals(session.getId(), dto.getId());
        assertEquals(session.getName(), dto.getName());
        assertEquals(session.getDate(), dto.getDate());
        assertEquals(session.getDescription(), dto.getDescription());
        assertEquals(session.getCreatedAt(), dto.getCreatedAt());
        assertEquals(session.getUpdatedAt(), dto.getUpdatedAt());
        assertEquals(10L, dto.getTeacher_id());
        assertEquals(List.of(1L, 2L), dto.getUsers());
    }

    @Test
    void toDto_nullTeacher_givesNullTeacherId() {
        Session session = buildSession();
        session.setTeacher(null);

        SessionDto dto = mapper.toDto(session);

        assertNull(dto.getTeacher_id());
    }

    @Test
    void toDto_nullUsers_givesEmptyList() {
        Session session = buildSession();
        session.setUsers(null);

        SessionDto dto = mapper.toDto(session);

        assertNotNull(dto.getUsers());
        assertTrue(dto.getUsers().isEmpty());
    }

    @Test
    void toDto_emptyUsers_givesEmptyList() {
        Session session = buildSession();
        session.setUsers(Collections.emptyList());

        SessionDto dto = mapper.toDto(session);

        assertTrue(dto.getUsers().isEmpty());
    }

    @Test
    void toDto_nullSession_returnsNull() {
        assertNull(mapper.toDto((Session) null));
    }

    @Test
    void toDto_doesNotUseServices() {
        mapper.toDto(buildSession());

        verifyNoInteractions(teacherService, userService);
    }
}