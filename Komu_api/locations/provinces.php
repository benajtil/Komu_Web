<?php
require_once "../config/cors.php";
require_once "../config/database.php";
require_once "../helpers/response.php";

try {
    $stmt = $pdo->query("
        SELECT id, code, name, region_name
        FROM provinces
        ORDER BY name ASC
    ");

    $provinces = $stmt->fetchAll(PDO::FETCH_ASSOC);

    jsonResponse(true, "Provinces fetched successfully", $provinces);
} catch (PDOException $e) {
    jsonResponse(false, "Failed to fetch provinces", $e->getMessage(), 500);
}