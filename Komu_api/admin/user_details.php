<?php
require_once "../config/cors.php";
require_once "../config/database.php";
require_once "../helpers/response.php";
require_once "../helpers/admin_scope.php";

session_start();

if (!isset($_SESSION["user"])) {
    jsonResponse(false, "Unauthorized", null, 401);
}

$currentUser = $_SESSION["user"];
$scope = getAdminScope($currentUser);

if (!$scope["allowed"]) {
    jsonResponse(false, "Forbidden", null, 403);
}

$verificationStatus = trim($_GET["verification_status"] ?? "");
$systemRole = trim($_GET["role"] ?? "");
$officialRole = trim($_GET["official_role"] ?? "");
$provinceId = trim($_GET["province_id"] ?? "");
$municipalityId = trim($_GET["municipality_id"] ?? "");
$barangayId = trim($_GET["barangay_id"] ?? "");
$search = trim($_GET["search"] ?? "");

$where = [];
$params = $scope["params"];

if ($scope["where_sql"] !== "") {
    $where[] = $scope["where_sql"];
}

if ($verificationStatus !== "") {
    $where[] = "u.verification_status = :verification_status";
    $params["verification_status"] = $verificationStatus;
}

if ($systemRole !== "") {
    $where[] = "u.role = :role";
    $params["role"] = $systemRole;
}

if ($officialRole !== "") {
    $where[] = "u.official_role = :official_role";
    $params["official_role"] = $officialRole;
}

if ($provinceId !== "") {
    $where[] = "u.province_id = :province_id";
    $params["province_id"] = $provinceId;
}

if ($municipalityId !== "") {
    $where[] = "u.municipality_id = :municipality_id";
    $params["municipality_id"] = $municipalityId;
}

if ($barangayId !== "") {
    $where[] = "u.barangay_id = :barangay_id";
    $params["barangay_id"] = $barangayId;
}

if ($search !== "") {
    $where[] = "(
        u.first_name ILIKE :search
        OR u.last_name ILIKE :search
        OR u.username ILIKE :search
        OR u.email ILIKE :search
        OR CONCAT(u.first_name, ' ', u.last_name) ILIKE :search
    )";
    $params["search"] = "%" . $search . "%";
}

$whereSql = "";
if (!empty($where)) {
    $whereSql = "WHERE " . implode(" AND ", $where);
}

try {
    $sql = "
        SELECT
            u.id,
            u.first_name,
            u.last_name,
            u.username,
            u.email,
            u.contact_number,
            u.role,
            u.official_role,
            u.official_role_verified,
            u.verification_status,
            u.valid_id_path,
            u.created_at,
            p.name AS province_name,
            m.name AS municipality_name,
            b.name AS barangay_name,
            COUNT(DISTINCT posts.id) AS post_count,
            COUNT(DISTINCT comments.id) AS comment_count
        FROM users u
        LEFT JOIN provinces p ON u.province_id = p.id
        LEFT JOIN municipalities m ON u.municipality_id = m.id
        LEFT JOIN barangays b ON u.barangay_id = b.id
        LEFT JOIN posts ON posts.user_id = u.id
        LEFT JOIN comments ON comments.user_id = u.id
        $whereSql
        GROUP BY
            u.id,
            u.first_name,
            u.last_name,
            u.username,
            u.email,
            u.contact_number,
            u.role,
            u.official_role,
            u.official_role_verified,
            u.verification_status,
            u.valid_id_path,
            u.created_at,
            p.name,
            m.name,
            b.name
        ORDER BY u.created_at DESC
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    jsonResponse(true, "Users fetched successfully", $users);

} catch (PDOException $e) {
    jsonResponse(false, "Failed to fetch users", $e->getMessage(), 500);
}