<?php
require_once "../config/cors.php";
require_once "../config/database.php";
require_once "../helpers/response.php";

session_start();

if (!isset($_SESSION["user"])) {
    jsonResponse(false, "Unauthorized", null, 401);
}

$currentUser = $_SESSION["user"];
$currentRole = $currentUser["role"] ?? "resident";
$currentBarangayId = $currentUser["barangay_id"] ?? null;
$currentMunicipalityId = $currentUser["municipality_id"] ?? null;

$userId = $_GET["user_id"] ?? null;

if (!$userId) {
    jsonResponse(false, "user_id is required", null, 400);
}

try {
    $whereParts = ["u.id = :user_id"];
    $params = ["user_id" => $userId];

    if ($currentRole === "super_admin") {
        // no extra scope
    } elseif ($currentRole === "municipal_admin") {
        $whereParts[] = "u.municipality_id = :municipality_id";
        $params["municipality_id"] = $currentMunicipalityId;
    } else {
        // barangay_admin and regular users
        $whereParts[] = "u.barangay_id = :barangay_id";
        $params["barangay_id"] = $currentBarangayId;
    }

    $whereSql = "WHERE " . implode(" AND ", $whereParts);

    $userStmt = $pdo->prepare("
        SELECT
            u.id,
            u.first_name,
            u.last_name,
            u.username,
            u.email,
            u.role,
            u.official_role,
            u.official_role_verified,
            u.verification_status,
            u.created_at,
            p.name AS province_name,
            m.name AS municipality_name,
            b.name AS barangay_name,
            (
                SELECT COUNT(*)
                FROM comments c
                WHERE c.user_id = u.id
            ) AS comment_count
        FROM users u
        LEFT JOIN provinces p ON u.province_id = p.id
        LEFT JOIN municipalities m ON u.municipality_id = m.id
        LEFT JOIN barangays b ON u.barangay_id = b.id
        $whereSql
        LIMIT 1
    ");

    $userStmt->execute($params);
    $user = $userStmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        jsonResponse(false, "User not found in your allowed scope", null, 404);
    }

    $postsStmt = $pdo->prepare("
        SELECT
            id,
            content,
            created_at
        FROM posts
        WHERE user_id = :user_id
        ORDER BY created_at DESC
    ");
    $postsStmt->execute([
        "user_id" => $userId
    ]);
    $posts = $postsStmt->fetchAll(PDO::FETCH_ASSOC);

    jsonResponse(true, "Profile fetched successfully", [
        "user" => $user,
        "posts" => $posts
    ]);

} catch (PDOException $e) {
    jsonResponse(false, "Failed to fetch profile", $e->getMessage(), 500);
}