import API_BASE_URL from "./api";

export async function getDashboardStats() {
    const response = await fetch(`${API_BASE_URL}/admin/dashboard_stats.php`, {
        method: "GET",
        credentials: "include",
    });

    return response.json();
}

export async function getUsersList(filters = {}) {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && String(value).trim() !== "") {
            params.append(key, value);
        }
    });

    const query = params.toString();
    const url = `${API_BASE_URL}/admin/users_list.php${query ? `?${query}` : ""}`;

    const response = await fetch(url, {
        method: "GET",
        credentials: "include",
    });

    return response.json();
}

export async function getAdminUserDetails(userId) {
    const response = await fetch(
        `${API_BASE_URL}/admin/user_details.php?user_id=${userId}`,
        {
            method: "GET",
            credentials: "include",
        }
    );

    return response.json();
}

export async function updateSystemRole(userId, role) {
    const response = await fetch(`${API_BASE_URL}/admin/update_system_role.php`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ user_id: userId, role }),
    });

    return response.json();
}

export async function updateOfficialRole(
    userId,
    officialRole,
    officialRoleVerified
) {
    const response = await fetch(`${API_BASE_URL}/admin/update_official_role.php`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
            user_id: userId,
            official_role: officialRole,
            official_role_verified: officialRoleVerified,
        }),
    });

    return response.json();
}