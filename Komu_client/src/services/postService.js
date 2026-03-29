import API_BASE_URL from "./api";

export async function createPost(postData) {
    const response = await fetch(`${API_BASE_URL}/posts/create.php`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(postData),
    });

    return response.json();
}

export async function getPostsByBarangay(barangayId) {
    const response = await fetch(
        `${API_BASE_URL}/posts/list.php?barangay_id=${barangayId}`,
        {
            method: "GET",
            credentials: "include",
        }
    );

    return response.json();
}

export async function updatePost(postData) {
    const response = await fetch(`${API_BASE_URL}/posts/update.php`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(postData),
    });

    return response.json();
}

export async function deletePost(postId) {
    const response = await fetch(`${API_BASE_URL}/posts/delete.php`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ post_id: postId }),
    });

    return response.json();
}