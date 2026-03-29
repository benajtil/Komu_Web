<?php
require_once "../config/cors.php";
require_once "../config/database.php";
require_once "../helpers/response.php";

session_start();

if (!isset($_SESSION["user"])) {
    jsonResponse(false, "Unauthorized", null, 401);
}

$reviewer = $_SESSION["user"];
$allowedRoles = ["barangay_admin", "municipal_admin", "super_admin"];

if (!in_array($reviewer["role"], $allowedRoles, true)) {
    jsonResponse(false, "Forbidden", null, 403);
}

$userId = $_GET["user_id"] ?? null;

if (!$userId) {
    jsonResponse(false, "user_id is required", null, 400);
}

try {
    $stmt = $pdo->prepare("
        SELECT
            u.id,
            u.first_name,
            u.last_name,
            u.username,
            u.email,
            u.contact_number,
            u.valid_id_path,
            u.verification_status,
            u.rejection_reason,
            u.created_at,
            p.name AS province_name,
            m.name AS municipality_name,
            b.name AS barangay_name
        FROM users u
        LEFT JOIN provinces p ON u.province_id = p.id
        LEFT JOIN municipalities m ON u.municipality_id = m.id
        LEFT JOIN barangays b ON u.barangay_id = b.id
        WHERE u.id = :user_id
        LIMIT 1
    ");

    $stmt->execute([
        "user_id" => $userId
    ]);

    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        jsonResponse(false, "User not found", null, 404);
    }

    if (
        $reviewer["role"] === "barangay_admin" &&
        (int)$reviewer["barangay_id"] !== (int)$pdo->query("SELECT barangay_id FROM users WHERE id = " . (int)$userId)->fetchColumn()
    ) {
        jsonResponse(false, "Forbidden", null, 403);
    }

    $historyStmt = $pdo->prepare("
        SELECT
            uv.id,
            uv.action,
            uv.remarks,
            uv.created_at,
            reviewer.username AS reviewer_username,
            uv.reviewer_role
        FROM user_verifications uv
        INNER JOIN users reviewer ON uv.reviewer_user_id = reviewer.id
        WHERE uv.user_id = :user_id
        ORDER BY uv.created_at DESC
    ");

    $historyStmt->execute([
        "user_id" => $userId
    ]);

    $history = $historyStmt->fetchAll(PDO::FETCH_ASSOC);

    jsonResponse(true, "User details fetched successfully", [
        "user" => $user,
        "history" => $history
    ]);

} catch (PDOException $e) {
    jsonResponse(false, "Failed to fetch user details", $e->getMessage(), 500);
}