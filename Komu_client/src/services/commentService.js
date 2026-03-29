import API_BASE_URL from "./api";

export async function createComment(commentData) {
    const response = await fetch(`${API_BASE_URL}/comments/create.php`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(commentData),
    });

    return response.json();
}

export async function getCommentsByPost(postId) {
    const response = await fetch(
        `${API_BASE_URL}/comments/list.php?post_id=${postId}`,
        {
            method: "GET",
            credentials: "include",
        }
    );

    return response.json();
}

export async function updateComment(commentData) {
    const response = await fetch(`${API_BASE_URL}/comments/update.php`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(commentData),
    });

    return response.json();
}

export async function deleteComment(commentId) {
    const response = await fetch(`${API_BASE_URL}/comments/delete.php`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ comment_id: commentId }),
    });

    return response.json();
}