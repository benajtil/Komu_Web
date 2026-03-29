<?php
require_once "../config/cors.php";
require_once "../config/database.php";
require_once "../helpers/response.php";

$provinceId = $_GET["province_id"] ?? null;

if (!$provinceId) {
    jsonResponse(false, "province_id is required", null, 400);
}

try {
    $stmt = $pdo->prepare("
        SELECT id, code, name, type, region_name
        FROM municipalities
        WHERE province_id = :province_id
        ORDER BY name ASC
    ");

    $stmt->execute([
        "province_id" => $provinceId
    ]);

    $municipalities = $stmt->fetchAll(PDO::FETCH_ASSOC);

    jsonResponse(true, "Municipalities fetched successfully", $municipalities);
} catch (PDOException $e) {
    jsonResponse(false, "Failed to fetch municipalities", $e->getMessage(), 500);
}