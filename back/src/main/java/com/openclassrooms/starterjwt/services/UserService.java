package com.openclassrooms.starterjwt.services;

import java.util.Optional;

import org.springframework.stereotype.Service;

import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.UserRepository;

@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public void delete(Long id) {
        this.userRepository.deleteById(id);
    }

    public User findById(Long id) {
        return this.userRepository.findById(id).orElse(null);
    }

	public void save(User user) {
		this.userRepository.save(user);
	}

	public Optional<User> findByEmail(String username) {
		return this.userRepository.findByEmail(username);
	}
	
	public Boolean existsByEmail(String email) {
		return this.userRepository.existsByEmail(email);
	}
     
    
    
}
