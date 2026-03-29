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
$userId = $_SESSION["user"]["id"];

if (!$commentId) {
    jsonResponse(false, "comment_id is required", null, 400);
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
    jsonResponse(false, "Forbidden: You can only delete your own comment", null, 403);
}

$deleteStmt = $pdo->prepare("
    DELETE FROM comments
    WHERE id = :comment_id
");

$deleteStmt->execute([
    "comment_id" => $commentId
]);

jsonResponse(true, "Comment deleted successfully");