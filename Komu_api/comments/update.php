<?php
require_once "../config/cors.php";
require_once "../config/database.php";
require_once "../helpers/response.php";

session_start();

if (!isset($_SESSION["user"])) {
    jsonResponse(false, "Unauthorized", null, 401);
}

$input = json_decode(file_get_contents("php://input"), true);

$commentId = $input["comment_id"] ?? null;
$content = trim($input["content"] ?? "");
$userId = $_SESSION["user"]["id"];

if (!$commentId || !$content) {
    jsonResponse(false, "comment_id and content are required", null, 400);
}

$checkStmt = $pdo->prepare("
    SELECT id, user_id
    FROM comments
    WHERE id = :comment_id
");
$checkStmt->execute(["comment_id" => $commentId]);
$comment = $checkStmt->fetch();

if (!$comment) {
    jsonResponse(false, "Comment not found", null, 404);
}

if ((int)$comment["user_id"] !== (int)$userId) {
    jsonResponse(false, "Forbidden: You can only edit your own comment", null, 403);
}

$updateStmt = $pdo->prepare("
    UPDATE comments
    SET content = :content
    WHERE id = :comment_id
");

$updateStmt->execute([
    "content" => $content,
    "comment_id" => $commentId
]);

jsonResponse(true, "Comment updated successfully");