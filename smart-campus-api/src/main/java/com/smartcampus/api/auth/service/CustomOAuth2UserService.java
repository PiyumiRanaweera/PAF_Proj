package com.smartcampus.api.auth.service;

import com.smartcampus.api.user.model.Role;
import com.smartcampus.api.user.model.User;
import com.smartcampus.api.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Map;
import java.util.Set;

/**
 * Custom OAuth2 user service that syncs Google users with the database
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        try {
            return processOAuthUser(userRequest, oAuth2User);
        } catch (Exception ex) {
            log.error("Error processing OAuth2 user: {}", ex.getMessage());
            throw new OAuth2AuthenticationException(ex.getMessage());
        }
    }

    private OAuth2User processOAuthUser(OAuth2UserRequest userRequest, OAuth2User oAuth2User) {
        Map<String, Object> attributes = oAuth2User.getAttributes();

        String email = (String) attributes.get("email");
        String name = (String) attributes.get("name");
        String avatarUrl = (String) attributes.get("picture");
        String oauthId = (String) attributes.get("sub");
        String provider = userRequest.getClientRegistration().getRegistrationId();

        User user = userRepository.findByEmail(email)
                .map(existingUser -> updateExistingUser(existingUser, name, avatarUrl))
                .orElseGet(() -> createNewUser(email, name, avatarUrl, oauthId, provider));

        return oAuth2User;
    }

    private User createNewUser(String email, String name, String avatarUrl, String oauthId, String provider) {
        log.info("Creating new user from OAuth2 login: {}", email);
        Set<Role> roles = new HashSet<>();
        roles.add(Role.USER);

        User user = User.builder()
                .email(email)
                .name(name)
                .avatarUrl(avatarUrl)
                .oauthId(oauthId)
                .oauthProvider(provider)
                .roles(roles)
                .isActive(true)
                .build();

        return userRepository.save(user);
    }

    private User updateExistingUser(User user, String name, String avatarUrl) {
        log.info("Updating existing user from OAuth2 login: {}", user.getEmail());
        user.setName(name);
        user.setAvatarUrl(avatarUrl);
        return userRepository.save(user);
    }
}
