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

try {
    $baseParams = $scope["params"];
    $userWhere = [];
    $provinceWhere = [];
    $municipalityWhere = [];
    $barangayWhere = [];

    if (($currentUser["role"] ?? null) === "municipal_admin") {
        $userWhere[] = "u.municipality_id = :scope_municipality_id";
        $municipalityWhere[] = "m.id = :scope_municipality_id";
        $barangayWhere[] = "b.municipality_id = :scope_municipality_id";
        $provinceWhere[] = "u.municipality_id = :scope_municipality_id";
    } elseif (($currentUser["role"] ?? null) === "barangay_admin") {
        $userWhere[] = "u.barangay_id = :scope_barangay_id";
        $barangayWhere[] = "b.id = :scope_barangay_id";
        $municipalityWhere[] = "u.barangay_id = :scope_barangay_id";
        $provinceWhere[] = "u.barangay_id = :scope_barangay_id";
    }

    $userWhereSql = !empty($userWhere) ? "WHERE " . implode(" AND ", $userWhere) : "";
    $provinceWhereSql = !empty($provinceWhere) ? "WHERE " . implode(" AND ", $provinceWhere) : "";
    $municipalityWhereSql = !empty($municipalityWhere) ? "WHERE " . implode(" AND ", $municipalityWhere) : "";
    $barangayWhereSql = !empty($barangayWhere) ? "WHERE " . implode(" AND ", $barangayWhere) : "";

    // Summary cards
    $summarySql = "
        SELECT
            COUNT(*) AS total_users,
            COUNT(*) FILTER (WHERE verification_status = 'verified') AS verified_users,
            COUNT(*) FILTER (WHERE verification_status = 'pending') AS pending_users,
            COUNT(*) FILTER (WHERE verification_status = 'rejected') AS rejected_users
        FROM users u
        $userWhereSql
    ";

    $summaryStmt = $pdo->prepare($summarySql);
    $summaryStmt->execute($baseParams);
    $summary = $summaryStmt->fetch(PDO::FETCH_ASSOC);

    // Users by province
    if (($currentUser["role"] ?? null) === "super_admin") {
        $provinceSql = "
            SELECT
                p.id,
                p.name AS province_name,
                COUNT(u.id) AS user_count
            FROM provinces p
            LEFT JOIN users u ON u.province_id = p.id
            GROUP BY p.id, p.name
            ORDER BY user_count DESC, p.name ASC
            LIMIT 20
        ";
        $provinceStmt = $pdo->query($provinceSql);
    } else {
        $provinceSql = "
            SELECT
                p.id,
                p.name AS province_name,
                COUNT(u.id) AS user_count
            FROM provinces p
            LEFT JOIN users u ON u.province_id = p.id
            $provinceWhereSql
            GROUP BY p.id, p.name
            ORDER BY user_count DESC, p.name ASC
            LIMIT 20
        ";
        $provinceStmt = $pdo->prepare($provinceSql);
        $provinceStmt->execute($baseParams);
    }
    $usersByProvince = $provinceStmt->fetchAll(PDO::FETCH_ASSOC);

    // Users by municipality
    if (($currentUser["role"] ?? null) === "super_admin") {
        $municipalitySql = "
            SELECT
                m.id,
                m.name AS municipality_name,
                COUNT(u.id) AS user_count
            FROM municipalities m
            LEFT JOIN users u ON u.municipality_id = m.id
            GROUP BY m.id, m.name
            ORDER BY user_count DESC, m.name ASC
            LIMIT 20
        ";
        $municipalityStmt = $pdo->query($municipalitySql);
    } else {
        $municipalitySql = "
            SELECT
                m.id,
                m.name AS municipality_name,
                COUNT(u.id) AS user_count
            FROM municipalities m
            LEFT JOIN users u ON u.municipality_id = m.id
            $municipalityWhereSql
            GROUP BY m.id, m.name
            ORDER BY user_count DESC, m.name ASC
            LIMIT 20
        ";
        $municipalityStmt = $pdo->prepare($municipalitySql);
        $municipalityStmt->execute($baseParams);
    }
    $usersByMunicipality = $municipalityStmt->fetchAll(PDO::FETCH_ASSOC);

    // Users by barangay
    if (($currentUser["role"] ?? null) === "super_admin") {
        $barangaySql = "
            SELECT
                b.id,
                b.name AS barangay_name,
                COUNT(u.id) AS user_count
            FROM barangays b
            LEFT JOIN users u ON u.barangay_id = b.id
            GROUP BY b.id, b.name
            ORDER BY user_count DESC, b.name ASC
            LIMIT 20
        ";
        $barangayStmt = $pdo->query($barangaySql);
    } else {
        $barangaySql = "
            SELECT
                b.id,
                b.name AS barangay_name,
                COUNT(u.id) AS user_count
            FROM barangays b
            LEFT JOIN users u ON u.barangay_id = b.id
            $barangayWhereSql
            GROUP BY b.id, b.name
            ORDER BY user_count DESC, b.name ASC
            LIMIT 20
        ";
        $barangayStmt = $pdo->prepare($barangaySql);
        $barangayStmt->execute($baseParams);
    }
    $usersByBarangay = $barangayStmt->fetchAll(PDO::FETCH_ASSOC);

    jsonResponse(true, "Dashboard stats fetched successfully", [
        "summary" => $summary,
        "users_by_province" => $usersByProvince,
        "users_by_municipality" => $usersByMunicipality,
        "users_by_barangay" => $usersByBarangay
    ]);

} catch (PDOException $e) {
    jsonResponse(false, "Failed to fetch dashboard stats", $e->getMessage(), 500);
}