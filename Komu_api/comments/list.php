<?php
require_once "../config/cors.php";
require_once "../config/database.php";
require_once "../helpers/response.php";

$postId = $_GET["post_id"] ?? null;

if (!$postId) {
    jsonResponse(false, "post_id is required", null, 400);
}

$stmt = $pdo->prepare("
    SELECT
        comments.id,
        comments.post_id,
        comments.user_id,
        comments.content,
        comments.created_at,
        users.username,
        users.first_name,
        users.last_name
    FROM comments
    INNER JOIN users ON comments.user_id = users.id
    WHERE comments.post_id = :post_id
    ORDER BY comments.created_at ASC
");

$stmt->execute([
    "post_id" => $postId
]);

$comments = $stmt->fetchAll();

jsonResponse(true, "Comments fetched successfully", $comments);