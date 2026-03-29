<?php
require_once "../config/cors.php";
require_once "../config/database.php";
require_once "../helpers/response.php";

// Only allow POST
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    jsonResponse(false, "Method not allowed", null, 405);
}

// Read form fields
$firstName = trim($_POST["first_name"] ?? "");
$lastName = trim($_POST["last_name"] ?? "");
$username = trim($_POST["username"] ?? "");
$email = trim($_POST["email"] ?? "");
$password = trim($_POST["password"] ?? "");
$contactNumber = trim($_POST["contact_number"] ?? "");
$provinceId = $_POST["province_id"] ?? null;
$municipalityId = $_POST["municipality_id"] ?? null;
$barangayId = $_POST["barangay_id"] ?? null;

// Basic required field validation
if (
    $firstName === "" ||
    $lastName === "" ||
    $username === "" ||
    $email === "" ||
    $password === "" ||
    $contactNumber === "" ||
    !$provinceId ||
    !$municipalityId ||
    !$barangayId
) {
    jsonResponse(false, "All fields are required", null, 400);
}

// Email validation
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    jsonResponse(false, "Invalid email address", null, 400);
}

// Password validation
if (strlen($password) < 6) {
    jsonResponse(false, "Password must be at least 6 characters", null, 400);
}

// Contact number validation
$normalizedContact = preg_replace('/\s+/', '', $contactNumber);

if (!preg_match('/^(09\d{9}|\+639\d{9})$/', $normalizedContact)) {
    jsonResponse(false, "Enter a valid PH contact number", null, 400);
}

// File validation
if (!isset($_FILES["valid_id"]) || $_FILES["valid_id"]["error"] !== UPLOAD_ERR_OK) {
    jsonResponse(false, "Valid ID upload is required", null, 400);
}

$validId = $_FILES["valid_id"];
$allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "application/pdf"
];

$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = finfo_file($finfo, $validId["tmp_name"]);
finfo_close($finfo);

if (!in_array($mimeType, $allowedMimeTypes, true)) {
    jsonResponse(false, "Valid ID must be JPG, PNG, or PDF", null, 400);
}

// Optional size check: 5MB max
$maxFileSize = 5 * 1024 * 1024;
if ($validId["size"] > $maxFileSize) {
    jsonResponse(false, "Valid ID must not exceed 5MB", null, 400);
}

try {
    // Check duplicate username/email
    $checkStmt = $pdo->prepare("
        SELECT id
        FROM users
        WHERE email = :email OR username = :username
        LIMIT 1
    ");
    $checkStmt->execute([
        "email" => $email,
        "username" => $username
    ]);

    if ($checkStmt->fetch()) {
        jsonResponse(false, "Email or username already exists", null, 409);
    }

    // Validate province → municipality → barangay relationship
    $locationStmt = $pdo->prepare("
        SELECT 
            b.id AS barangay_id,
            m.id AS municipality_id,
            p.id AS province_id
        FROM barangays b
        INNER JOIN municipalities m ON b.municipality_id = m.id
        INNER JOIN provinces p ON m.province_id = p.id
        WHERE p.id = :province_id
          AND m.id = :municipality_id
          AND b.id = :barangay_id
        LIMIT 1
    ");

    $locationStmt->execute([
        "province_id" => $provinceId,
        "municipality_id" => $municipalityId,
        "barangay_id" => $barangayId
    ]);

    if (!$locationStmt->fetch()) {
        jsonResponse(false, "Invalid location selection", null, 400);
    }

   $uploadDir = __DIR__ . "/../uploads/valid_ids/";

if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}


$extensionMap = [
    "image/jpeg" => "jpg",
    "image/png" => "png",
    "application/pdf" => "pdf"
];
$fileExtension = $extensionMap[$mimeType] ?? "bin";


$safeFileName = uniqid("valid_id_", true) . "." . $fileExtension;


$fullFilePath = $uploadDir . $safeFileName;


$relativeFilePath = "uploads/valid_ids/" . $safeFileName;


if (!move_uploaded_file($validId["tmp_name"], $fullFilePath)) {
    jsonResponse(false, "Failed to upload valid ID", null, 500);
}

    // Hash password
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);

    // Insert user
    $insertStmt = $pdo->prepare("
        INSERT INTO users (
            first_name,
            last_name,
            username,
            email,
            password_hash,
            contact_number,
            province_id,
            municipality_id,
            barangay_id,
            valid_id_path,
            verification_status,
            is_location_locked,
            role
        )
        VALUES (
            :first_name,
            :last_name,
            :username,
            :email,
            :password_hash,
            :contact_number,
            :province_id,
            :municipality_id,
            :barangay_id,
            :valid_id_path,
            'pending',
            TRUE,
            'resident'
        )
        RETURNING id
    ");

    $insertStmt->execute([
        "first_name" => $firstName,
        "last_name" => $lastName,
        "username" => $username,
        "email" => $email,
        "password_hash" => $passwordHash,
        "contact_number" => $normalizedContact,
        "province_id" => $provinceId,
        "municipality_id" => $municipalityId,
        "barangay_id" => $barangayId,
        "valid_id_path" => $relativeFilePath
    ]);

    $newUser = $insertStmt->fetch(PDO::FETCH_ASSOC);

    jsonResponse(true, "Registration submitted successfully. Your account is pending verification.", [
        "user_id" => $newUser["id"] ?? null
    ], 201);

} catch (PDOException $e) {
    jsonResponse(false, "Registration failed", $e->getMessage(), 500);
}