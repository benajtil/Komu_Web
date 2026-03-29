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

try {
    if ($reviewer["role"] === "barangay_admin") {
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
                u.created_at,
                p.name AS province_name,
                m.name AS municipality_name,
                b.name AS barangay_name
            FROM users u
            LEFT JOIN provinces p ON u.province_id = p.id
            LEFT JOIN municipalities m ON u.municipality_id = m.id
            LEFT JOIN barangays b ON u.barangay_id = b.id
            WHERE u.verification_status = 'pending'
              AND u.barangay_id = :barangay_id
            ORDER BY u.created_at ASC
        ");

        $stmt->execute([
            "barangay_id" => $reviewer["barangay_id"]
        ]);
    } else {
        $stmt = $pdo->query("
            SELECT
                u.id,
                u.first_name,
                u.last_name,
                u.username,
                u.email,
                u.contact_number,
                u.valid_id_path,
                u.verification_status,
                u.created_at,
                p.name AS province_name,
                m.name AS municipality_name,
                b.name AS barangay_name
            FROM users u
            LEFT JOIN provinces p ON u.province_id = p.id
            LEFT JOIN municipalities m ON u.municipality_id = m.id
            LEFT JOIN barangays b ON u.barangay_id = b.id
            WHERE u.verification_status = 'pending'
            ORDER BY u.created_at ASC
        ");
    }

    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    jsonResponse(true, "Pending users fetched successfully", $users);

} catch (PDOException $e) {
    jsonResponse(false, "Failed to fetch pending users", $e->getMessage(), 500);
}