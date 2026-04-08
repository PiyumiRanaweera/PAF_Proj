package com.smartcampus.api.user.dto;

import com.smartcampus.api.user.model.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotNull;

/**
 * Request DTO for assigning a role to a user (Admin only)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoleAssignRequest {

    @NotNull(message = "Role must not be null")
    private Role role;

    private String action; // "ADD" or "REMOVE"
}
