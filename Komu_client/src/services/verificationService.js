import API_BASE_URL from "./api";

export async function getPendingUsers() {
    const response = await fetch(
        `${API_BASE_URL}/verification/pending_users.php`,
        {
            method: "GET",
            credentials: "include",
        }
    );

    return response.json();
}

export async function getUserDetails(userId) {
    const response = await fetch(
        `${API_BASE_URL}/verification/user_details.php?user_id=${userId}`,
        {
            method: "GET",
            credentials: "include",
        }
    );

    return response.json();
}

export async function approveUser(userId, remarks = "") {
    const response = await fetch(
        `${API_BASE_URL}/verification/approve_user.php`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
                user_id: userId,
                remarks,
            }),
        }
    );

    return response.json();
}

export async function rejectUser(userId, remarks) {
    const response = await fetch(
        `${API_BASE_URL}/verification/reject_user.php`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
                user_id: userId,
                remarks,
            }),
        }
    );

    return response.json();
}