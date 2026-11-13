package com.openclassrooms.starterjwt.security.services;

import org.junit.jupiter.api.Test;
import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;

import static org.junit.jupiter.api.Assertions.*;

class UserDetailsImplTest {
    @Test
    void userDetails_shouldExposeCredentialsAndEnabledAccount() {
        UserDetailsImpl details = UserDetailsImpl.builder()
                .id(1L)
                .username("person@example.com")
                .password("encoded")
                .build();

        assertEquals("person@example.com", details.getUsername());
        assertEquals("encoded", details.getPassword());
        assertTrue(details.isAccountNonExpired());
        assertTrue(details.isAccountNonLocked());
        assertTrue(details.isCredentialsNonExpired());
        assertTrue(details.isEnabled());
        Collection<? extends GrantedAuthority> authorities = details.getAuthorities();
        assertTrue(authorities.isEmpty());
    }

    @Test
    void equals_shouldUseIdAndRequireSameType() {
        UserDetailsImpl first = UserDetailsImpl.builder().id(1L).build();
        UserDetailsImpl sameId = UserDetailsImpl.builder().id(1L).build();
        UserDetailsImpl otherId = UserDetailsImpl.builder().id(2L).build();

        assertEquals(first, first);
        assertEquals(first, sameId);
        assertNotEquals(first, otherId);
        assertNotEquals(first, null);
        assertNotEquals(first, new Object());
    }
}
