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
$userId = $_SESSION["user"]["id"];

if (!$postId || !$content) {
    jsonResponse(false, "post_id and content are required", null, 400);
}

$checkStmt = $pdo->prepare("
    SELECT id, user_id
    FROM posts
    WHERE id = :post_id
");
$checkStmt->execute(["post_id" => $postId]);
$post = $checkStmt->fetch();

if (!$post) {
    jsonResponse(false, "Post not found", null, 404);
}

if ((int)$post["user_id"] !== (int)$userId) {
    jsonResponse(false, "Forbidden: You can only edit your own post", null, 403);
}

$updateStmt = $pdo->prepare("
    UPDATE posts
    SET content = :content
    WHERE id = :post_id
");

$updateStmt->execute([
    "content" => $content,
    "post_id" => $postId
]);

jsonResponse(true, "Post updated successfully");