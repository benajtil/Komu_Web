import API_BASE_URL from "./api";

export async function getUserProfile(userId) {

    const response = await fetch(`${API_BASE_URL}/profile/get_user_profile.php?user_id=?${userId}`, {
        method: "GET",
        credentials: "include,"
    });

    return response.json();
}