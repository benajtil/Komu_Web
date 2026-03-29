<?php
require_once "./cors.php";
require_once "./database.php";

try {
    $stmt = $pdo->query("SELECT NOW() AS current_time");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "message" => "Database connection is working",
        "data" => $result
    ]);
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Database query failed",
        "error" => $e->getMessage()
    ]);
}