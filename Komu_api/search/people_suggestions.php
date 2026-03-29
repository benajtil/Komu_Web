<?php
require_once "../config/cors.php";
require_once "../config/database.php";
require_once "../helpers/response.php";

session_start();

if (!isset($_SESSION["user"])) {
    jsonResponse(false, "Unauthorized", null, 401);
}

$user = $_SESSION["user"];
$barangayId = $user["barangay_id"] ?? null;

$q = trim($_GET["q"] ?? "");

if (!$barangayId || $q === "") {
    jsonResponse(true, "No results", []);
}

$search = "%" . $q . "%";

try {
    $stmt = $pdo->prepare("
        SELECT
            id,
            first_name,
            last_name,
            username,
            official_role,
            official_role_verified
        FROM users
        WHERE barangay_id = :barangay_id
          AND (
            first_name ILIKE :search OR
            last_name ILIKE :search OR
            username ILIKE :search OR
            CONCAT(first_name, ' ', last_name) ILIKE :search
          )
        ORDER BY first_name ASC
        LIMIT 8
    ");

    $stmt->execute([
        "barangay_id" => $barangayId,
        "search" => $search
    ]);

    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    jsonResponse(true, "Suggestions fetched", $results);

} catch (PDOException $e) {
    jsonResponse(false, "Failed", $e->getMessage(), 500);
}