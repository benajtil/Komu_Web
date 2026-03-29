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
$officialRole = trim($input["official_role"] ?? "");
$officialRoleVerified = filter_var(
    $input["official_role_verified"] ?? false,
    FILTER_VALIDATE_BOOLEAN,
    FILTER_NULL_ON_FAILURE
);

$allowedOfficialRoles = [
    "",
    "barangay_captain",
    "barangay_kagawad",
    "barangay_secretary",
    "barangay_treasurer",
    "sk_chairperson",
    "sk_kagawad",
    "mayor",
    "vice_mayor",
    "councilor",
    "governor",
    "vice_governor",
    "provincial_board_member"
];

if (!$userId) {
    jsonResponse(false, "user_id is required", null, 400);
}

if (!in_array($officialRole, $allowedOfficialRoles, true)) {
    jsonResponse(false, "Invalid official role", null, 400);
}

if ($officialRoleVerified === null) {
    $officialRoleVerified = false;
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

    $stmt = $pdo->prepare("
        UPDATE users
        SET official_role = :official_role,
            official_role_verified = :official_role_verified
        WHERE id = :user_id
    ");

    $stmt->execute([
        "official_role" => $officialRole !== "" ? $officialRole : null,
        "official_role_verified" => $officialRoleVerified,
        "user_id" => $userId
    ]);

    jsonResponse(true, "Official role updated successfully");

} catch (PDOException $e) {
    jsonResponse(false, "Failed to update official role", $e->getMessage(), 500);
}