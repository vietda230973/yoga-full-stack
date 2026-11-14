package com.openclassrooms.starterjwt.mapper;

import com.openclassrooms.starterjwt.dto.UserDto;
import com.openclassrooms.starterjwt.models.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class UserMapperTest {

    private UserMapper mapper;

    @BeforeEach
    void setUp() {
        mapper = new UserMapperImpl();
    }

    private User buildUser(Long id, String email, String firstName, String lastName, boolean admin) {
        return User.builder()
                .id(id)
                .email(email)
                .firstName(firstName)
                .lastName(lastName)
                .password("secret123")
                .admin(admin)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    private UserDto buildDto(Long id, String email, String firstName, String lastName, boolean admin) {
        UserDto dto = new UserDto();
        dto.setId(id);
        dto.setEmail(email);
        dto.setFirstName(firstName);
        dto.setLastName(lastName);
        dto.setAdmin(admin);
        dto.setPassword("secret123");
        dto.setCreatedAt(LocalDateTime.now());
        dto.setUpdatedAt(LocalDateTime.now());
        return dto;
    }

    // ---------- toEntity ----------

    @Test
    void toEntity_mapsAllFields() {
        UserDto dto = buildDto(1L, "marie@test.com", "Marie", "Dupont", true);

        User user = mapper.toEntity(dto);

        assertEquals(dto.getId(), user.getId());
        assertEquals(dto.getEmail(), user.getEmail());
        assertEquals(dto.getFirstName(), user.getFirstName());
        assertEquals(dto.getLastName(), user.getLastName());
        assertEquals(dto.isAdmin(), user.isAdmin());
        assertEquals(dto.getPassword(), user.getPassword());
        assertEquals(dto.getCreatedAt(), user.getCreatedAt());
        assertEquals(dto.getUpdatedAt(), user.getUpdatedAt());
    }

    @Test
    void toEntity_adminFalse_isPreserved() {
        User user = mapper.toEntity(buildDto(1L, "a@test.com", "A", "B", false));

        assertFalse(user.isAdmin());
    }

    @Test
    void toEntity_nullDto_returnsNull() {
        assertNull(mapper.toEntity((UserDto) null));
    }

    @Test
    void toEntity_emptyDto_throwsNpe() {
        // User impose email, firstName, lastName et password non null (Lombok @NonNull)
        assertThrows(NullPointerException.class, () -> mapper.toEntity(new UserDto()));
    }

    @Test
    void toEntity_nullPassword_throwsNpe() {
        UserDto dto = buildDto(1L, "a@test.com", "A", "B", false);
        dto.setPassword(null);

        assertThrows(NullPointerException.class, () -> mapper.toEntity(dto));
    }

    // ---------- toDto ----------

    @Test
    void toDto_mapsAllFields() {
        User user = buildUser(2L, "paul@test.com", "Paul", "Martin", false);

        UserDto dto = mapper.toDto(user);

        assertEquals(user.getId(), dto.getId());
        assertEquals(user.getEmail(), dto.getEmail());
        assertEquals(user.getFirstName(), dto.getFirstName());
        assertEquals(user.getLastName(), dto.getLastName());
        assertEquals(user.isAdmin(), dto.isAdmin());
        assertEquals(user.getCreatedAt(), dto.getCreatedAt());
        assertEquals(user.getUpdatedAt(), dto.getUpdatedAt());
    }

    @Test
    void toDto_copiesPassword() {
        // Le mapper copie le mot de passe ; c'est @JsonIgnore qui l'exclut du JSON.
        User user = buildUser(2L, "paul@test.com", "Paul", "Martin", false);

        UserDto dto = mapper.toDto(user);

        assertEquals("secret123", dto.getPassword());
    }

    @Test
    void toDto_adminTrue_isPreserved() {
        UserDto dto = mapper.toDto(buildUser(1L, "a@test.com", "A", "B", true));

        assertTrue(dto.isAdmin());
    }

    @Test
    void toDto_nullEntity_returnsNull() {
        assertNull(mapper.toDto((User) null));
    }

    // ---------- Listes ----------

    @Test
    void toEntity_list_mapsEachElement() {
        List<UserDto> dtos = List.of(
                buildDto(1L, "marie@test.com", "Marie", "Dupont", false),
                buildDto(2L, "paul@test.com", "Paul", "Martin", true));

        List<User> users = mapper.toEntity(dtos);

        assertEquals(2, users.size());
        assertEquals("marie@test.com", users.get(0).getEmail());
        assertTrue(users.get(1).isAdmin());
    }

    @Test
    void toEntity_emptyList_returnsEmptyList() {
        assertTrue(mapper.toEntity(Collections.<UserDto>emptyList()).isEmpty());
    }

    @Test
    void toEntity_nullList_returnsNull() {
        assertNull(mapper.toEntity((List<UserDto>) null));
    }

    @Test
    void toDto_list_mapsEachElement() {
        List<User> users = Arrays.asList(
                buildUser(1L, "marie@test.com", "Marie", "Dupont", false),
                buildUser(2L, "paul@test.com", "Paul", "Martin", true));

        List<UserDto> dtos = mapper.toDto(users);

        assertEquals(2, dtos.size());
        assertEquals(1L, dtos.get(0).getId());
        assertEquals("Martin", dtos.get(1).getLastName());
    }

    @Test
    void toDto_emptyList_returnsEmptyList() {
        assertTrue(mapper.toDto(Collections.<User>emptyList()).isEmpty());
    }

    @Test
    void toDto_nullList_returnsNull() {
        assertNull(mapper.toDto((List<User>) null));
    }

    // ---------- Aller-retour ----------

    @Test
    void roundTrip_entityToDtoToEntity_keepsData() {
        User original = buildUser(3L, "claire@test.com", "Claire", "Durand", true);

        User result = mapper.toEntity(mapper.toDto(original));

        assertEquals(original.getId(), result.getId());
        assertEquals(original.getEmail(), result.getEmail());
        assertEquals(original.getFirstName(), result.getFirstName());
        assertEquals(original.getLastName(), result.getLastName());
        assertEquals(original.getPassword(), result.getPassword());
        assertEquals(original.isAdmin(), result.isAdmin());
        assertEquals(original.getCreatedAt(), result.getCreatedAt());
        assertEquals(original.getUpdatedAt(), result.getUpdatedAt());
    }
}