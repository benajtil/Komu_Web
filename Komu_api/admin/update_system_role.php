<?php
require_once "../config/cors.php";
require_once "../config/database.php";
require_once "../helpers/response.php";
require_once "../helpers/admin_scope.php";

session_start();

if (!isset($_SESSION["user"])) {
    jsonResponse(false, "Unauthorized", null, 401);
}

$currentUser = $_SESSION["user"];
$scope = getAdminScope($currentUser);

if (!$scope["allowed"]) {
    jsonResponse(false, "Forbidden", null, 403);
}

$input = json_decode(file_get_contents("php://input"), true);

$userId = $input["user_id"] ?? null;
$newRole = trim($input["role"] ?? "");

$allowedRoles = ["resident", "barangay_admin", "municipal_admin", "super_admin"];

if (!$userId || $newRole === "") {
    jsonResponse(false, "user_id and role are required", null, 400);
}

if (!in_array($newRole, $allowedRoles, true)) {
    jsonResponse(false, "Invalid system role", null, 400);
}

try {
    $targetStmt = $pdo->prepare("
        SELECT id, municipality_id, barangay_id
        FROM users
        WHERE id = :user_id
        LIMIT 1
    ");
    $targetStmt->execute(["user_id" => $userId]);
    $targetUser = $targetStmt->fetch(PDO::FETCH_ASSOC);

    if (!$targetUser) {
        jsonResponse(false, "User not found", null, 404);
    }

    if (
        $currentUser["role"] === "municipal_admin" &&
        (int)$currentUser["municipality_id"] !== (int)$targetUser["municipality_id"]
    ) {
        jsonResponse(false, "Forbidden: outside your municipality", null, 403);
    }

    if (
        $currentUser["role"] === "barangay_admin" &&
        (int)$currentUser["barangay_id"] !== (int)$targetUser["barangay_id"]
    ) {
        jsonResponse(false, "Forbidden: outside your barangay", null, 403);
    }

    if ($currentUser["role"] !== "super_admin" && $newRole === "super_admin") {
        jsonResponse(false, "Forbidden: only super admin can assign super_admin", null, 403);
    }

    $stmt = $pdo->prepare("
        UPDATE users
        SET role = :role
        WHERE id = :user_id
    ");
    $stmt->execute([
        "role" => $newRole,
        "user_id" => $userId
    ]);

    jsonResponse(true, "System role updated successfully");

} catch (PDOException $e) {
    jsonResponse(false, "Failed to update system role", $e->getMessage(), 500);
}