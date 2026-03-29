<?php
require_once "../config/cors.php";
require_once "../config/database.php";
require_once "../helpers/response.php";

session_start();

if (!isset($_SESSION["user"])) {
    jsonResponse(false, "Unauthorized", null, 401);
}

$currentUser = $_SESSION["user"];
$barangayId = $currentUser["barangay_id"] ?? null;

if (!$barangayId) {
    jsonResponse(false, "Barangay scope not found", null, 400);
}

$q = trim($_GET["q"] ?? "");

if ($q === "") {
    jsonResponse(true, "Empty query", [
        "people" => [],
        "posts" => [],
        "comments" => [],
        "activities" => []
    ]);
}

$searchTerm = "%" . $q . "%";

try {
    // PEOPLE
    $peopleStmt = $pdo->prepare("
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
              first_name ILIKE :search
              OR last_name ILIKE :search
              OR username ILIKE :search
              OR CONCAT(first_name, ' ', last_name) ILIKE :search
          )
        ORDER BY first_name ASC, last_name ASC
        LIMIT 10
    ");
    $peopleStmt->execute([
        "barangay_id" => $barangayId,
        "search" => $searchTerm
    ]);
    $people = $peopleStmt->fetchAll(PDO::FETCH_ASSOC);

    // POSTS
    $postsStmt = $pdo->prepare("
        SELECT
            posts.id,
            posts.content,
            posts.created_at,
            users.id AS user_id,
            users.first_name,
            users.last_name,
            users.username,
            users.official_role,
            users.official_role_verified
        FROM posts
        INNER JOIN users ON posts.user_id = users.id
        WHERE posts.barangay_id = :barangay_id
          AND posts.content ILIKE :search
        ORDER BY posts.created_at DESC
        LIMIT 10
    ");
    $postsStmt->execute([
        "barangay_id" => $barangayId,
        "search" => $searchTerm
    ]);
    $posts = $postsStmt->fetchAll(PDO::FETCH_ASSOC);

    // COMMENTS
    $commentsStmt = $pdo->prepare("
        SELECT
            comments.id,
            comments.post_id,
            comments.content,
            comments.created_at,
            users.id AS user_id,
            users.first_name,
            users.last_name,
            users.username,
            users.official_role,
            users.official_role_verified
        FROM comments
        INNER JOIN users ON comments.user_id = users.id
        INNER JOIN posts ON comments.post_id = posts.id
        WHERE posts.barangay_id = :barangay_id
          AND comments.content ILIKE :search
        ORDER BY comments.created_at DESC
        LIMIT 10
    ");
    $commentsStmt->execute([
        "barangay_id" => $barangayId,
        "search" => $searchTerm
    ]);
    $comments = $commentsStmt->fetchAll(PDO::FETCH_ASSOC);

    // ACTIVITIES (combined lightweight activity feed)
    $activitiesStmt = $pdo->prepare("
        (
            SELECT
                'post' AS activity_type,
                posts.id AS reference_id,
                posts.content AS content,
                posts.created_at AS created_at,
                users.first_name,
                users.last_name,
                users.username
            FROM posts
            INNER JOIN users ON posts.user_id = users.id
            WHERE posts.barangay_id = :barangay_id
              AND (
                  posts.content ILIKE :search
                  OR users.first_name ILIKE :search
                  OR users.last_name ILIKE :search
                  OR users.username ILIKE :search
              )
        )
        UNION ALL
        (
            SELECT
                'comment' AS activity_type,
                comments.id AS reference_id,
                comments.content AS content,
                comments.created_at AS created_at,
                users.first_name,
                users.last_name,
                users.username
            FROM comments
            INNER JOIN users ON comments.user_id = users.id
            INNER JOIN posts ON comments.post_id = posts.id
            WHERE posts.barangay_id = :barangay_id
              AND (
                  comments.content ILIKE :search
                  OR users.first_name ILIKE :search
                  OR users.last_name ILIKE :search
                  OR users.username ILIKE :search
              )
        )
        ORDER BY created_at DESC
        LIMIT 15
    ");
    $activitiesStmt->execute([
        "barangay_id" => $barangayId,
        "search" => $searchTerm
    ]);
    $activities = $activitiesStmt->fetchAll(PDO::FETCH_ASSOC);

    jsonResponse(true, "Search results fetched successfully", [
        "people" => $people,
        "posts" => $posts,
        "comments" => $comments,
        "activities" => $activities
    ]);

} catch (PDOException $e) {
    jsonResponse(false, "Failed to fetch search results", $e->getMessage(), 500);
}