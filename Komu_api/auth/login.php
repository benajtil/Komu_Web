<?php
require_once "../config/cors.php";
require_once "../config/database.php";
require_once "../helpers/response.php";

session_start();

$input = json_decode(file_get_contents("php://input"), true);

$email = trim($input["email"] ?? "");
$password = trim($input["password"] ?? "");

if (!$email || !$password) {
    jsonResponse(false, "Email and password are required", null, 400);
}

$stmt = $pdo->prepare("
    SELECT
        id,
        province_id,
        municipality_id,
        barangay_id,
        first_name,
        last_name,
        username,
        email,
        role,
        official_role,
        official_role_verified,
        password_hash
    FROM users
    WHERE email = :email
");

$stmt->execute(["email" => $email]);
$user = $stmt->fetch();

if (!$user) {
    jsonResponse(false, "Invalid credentials", null, 401);
}

if (!password_verify($password, $user["password_hash"])) {
    jsonResponse(false, "Invalid credentials", null, 401);
}

unset($user["password_hash"]);

$_SESSION["user"] = $user;

jsonResponse(true, "Login successful", $user);