<?php
require_once "../config/cors.php";
require_once "../config/database.php";
require_once "../helpers/response.php";

$barangayId = $_GET["barangay_id"] ?? null;

if (!$barangayId) {
    jsonResponse(false, "barangay_id is required", null, 400);
}

try {
    $stmt = $pdo->prepare("
        SELECT 
            posts.id,
            posts.user_id,
            posts.content,
            posts.created_at,
            users.username,
            users.first_name,
            users.last_name,
            users.official_role,
            users.official_role_verified
        FROM posts
        INNER JOIN users ON posts.user_id = users.id
        WHERE posts.barangay_id = :barangay_id
        ORDER BY posts.created_at DESC
    ");

    $stmt->execute([
        "barangay_id" => $barangayId
    ]);

    $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);

    jsonResponse(true, "Posts fetched successfully", $posts);
} catch (PDOException $e) {
    jsonResponse(false, "Failed to fetch posts", $e->getMessage(), 500);
}