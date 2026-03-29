<?php
require_once "../config/cors.php";
require_once "../config/database.php";
require_once "../helpers/response.php";

$municipalityId = $_GET["municipality_id"] ?? null;

if (!$municipalityId) {
    jsonResponse(false, "municipality_id is required", null, 400);
}

try {
    $stmt = $pdo->prepare("
        SELECT id, code, name
        FROM barangays
        WHERE municipality_id = :municipality_id
        ORDER BY name ASC
    ");

    $stmt->execute([
        "municipality_id" => $municipalityId
    ]);

    $barangays = $stmt->fetchAll(PDO::FETCH_ASSOC);

    jsonResponse(true, "Barangays fetched successfully", $barangays);
} catch (PDOException $e) {
    jsonResponse(false, "Failed to fetch barangays", $e->getMessage(), 500);
}