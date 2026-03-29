<?php
require_once "../config/cors.php";
require_once "../helpers/response.php";

session_start();

if (!isset($_SESSION["user"])) {
    jsonResponse(false, "Not authenticated", null, 401);
}

$user = $_SESSION["user"];

jsonResponse(true, "Authenticated user fetched", [
    "id" => $user["id"] ?? null,
    "username" => $user["username"] ?? null,
    "email" => $user["email"] ?? null,
    "role" => $user["role"] ?? null,
    "barangay_id" => $user["barangay_id"] ?? null,
    "municipality_id" => $user["municipality_id"] ?? null,
    "province_id" => $user["province_id"] ?? null
]);