<?php
require_once "../config/cors.php";
require_once "../config/database.php";
require_once "../helpers/response.php";

session_start();

if (!isset($_SESSION["user"])) {
    jsonResponse(false, "Unauthorized", null, 401);
}

$input = json_decode(file_get_contents("php://input"), true);

$content = trim($input["content"] ?? "");
$user = $_SESSION["user"];

if ($content === "") {
    jsonResponse(false, "Content is required", null, 400);
}

if (empty($user["id"]) || empty($user["barangay_id"])) {
    jsonResponse(false, "Authenticated user is missing required location data", null, 400);
}

try {
    $stmt = $pdo->prepare("
        INSERT INTO posts (user_id, barangay_id, content)
        VALUES (:user_id, :barangay_id, :content)
    ");

    $stmt->execute([
        "user_id" => $user["id"],
        "barangay_id" => $user["barangay_id"],
        "content" => $content
    ]);

    jsonResponse(true, "Post created successfully");
} catch (PDOException $e) {
    jsonResponse(false, "Failed to create post", $e->getMessage(), 500);
}