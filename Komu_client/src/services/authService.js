import API_BASE_URL from "./api";

export async function registerUser(formData) {
    const response = await fetch(`${API_BASE_URL}/auth/register.php`, {
        method: "POST",
        credentials: "include",
        body: formData,
    });

    return response.json();
}

export async function loginUser(credentialsData) {
    const response = await fetch(`${API_BASE_URL}/auth/login.php`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(credentialsData),
    });

    return response.json();
}

export async function getCurrentUser() {
    const response = await fetch(`${API_BASE_URL}/auth/me.php`, {
        method: "GET",
        credentials: "include",
    });

    return response.json();
}

export async function logoutUser() {
    const response = await fetch(`${API_BASE_URL}/auth/logout.php`, {
        method: "POST",
        credentials: "include",
    });

    return response.json();
}