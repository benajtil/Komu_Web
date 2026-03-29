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
$userId = $_SESSION["user"]["id"];

if (!$postId) {
    jsonResponse(false, "post_id is required", null, 400);
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
    jsonResponse(false, "Forbidden: You can only delete your own post", null, 403);
}

$deleteStmt = $pdo->prepare("
    DELETE FROM posts
    WHERE id = :post_id
");

$deleteStmt->execute([
    "post_id" => $postId
]);

jsonResponse(true, "Post deleted successfully");