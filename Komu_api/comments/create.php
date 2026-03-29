<?php
require_once "../config/cors.php";
require_once "../config/database.php";
require_once "../helpers/response.php";

session_start();

if (!isset($_SESSION["user"])) {
    jsonResponse(false, "Unauthorized", null, 401);
}

$input = json_decode(file_get_contents("php://input"), true);

$postId = $input["post_id"] ?? null;
$content = trim($input["content"] ?? "");
$user = $_SESSION["user"];

if (!$postId || !$content) {
    jsonResponse(false, "post_id and content are required", null, 400);
}

$stmt = $pdo->prepare("
    INSERT INTO comments (post_id, user_id, content)
    VALUES (:post_id, :user_id, :content)
");

$stmt->execute([
    "post_id" => $postId,
    "user_id" => $user["id"],
    "content" => $content
]);

jsonResponse(true, "Comment created successfully");