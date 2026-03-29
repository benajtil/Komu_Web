<?php
require_once "../config/cors.php";
require_once "../config/database.php";
require_once "../helpers/response.php";
require_once "../helpers/admin_scope.php";

session_start();

if (!isset($_SESSION["user"])) {
    jsonResponse(false, "Unauthorized", null, 401);
}

$reviewer = $_SESSION["user"];
$scope = getAdminScope($reviewer);

if (!$scope["allowed"]) {
    jsonResponse(false, "Forbidden", null, 403);
}

$input = json_decode(file_get_contents("php://input"), true);

$userId = $input["user_id"] ?? null;
$remarks = trim($input["remarks"] ?? "");

if (!$userId) {
    jsonResponse(false, "user_id is required", null, 400);
}

if ($remarks === "") {
    jsonResponse(false, "Rejection reason is required", null, 400);
}

try {
    $pdo->beginTransaction();

    $stmt = $pdo->prepare("
        SELECT id, barangay_id, municipality_id, verification_status
        FROM users
        WHERE id = :user_id
        LIMIT 1
    ");
    $stmt->execute(["user_id" => $userId]);
    $targetUser = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$targetUser) {
        $pdo->rollBack();
        jsonResponse(false, "User not found", null, 404);
    }

    if ($targetUser["verification_status"] !== "pending") {
        $pdo->rollBack();
        jsonResponse(false, "Only pending users can be rejected", null, 400);
    }

    if (
        $reviewer["role"] === "municipal_admin" &&
        (int)$reviewer["municipality_id"] !== (int)$targetUser["municipality_id"]
    ) {
        $pdo->rollBack();
        jsonResponse(false, "Forbidden: outside your municipality", null, 403);
    }

    if (
        $reviewer["role"] === "barangay_admin" &&
        (int)$reviewer["barangay_id"] !== (int)$targetUser["barangay_id"]
    ) {
        $pdo->rollBack();
        jsonResponse(false, "Forbidden: outside your barangay", null, 403);
    }

    $updateStmt = $pdo->prepare("
        UPDATE users
        SET verification_status = 'rejected',
            finalized_by_user_id = :finalized_by_user_id,
            finalized_by_role = :finalized_by_role,
            finalized_at = CURRENT_TIMESTAMP,
            rejection_reason = :rejection_reason
        WHERE id = :user_id
    ");
    $updateStmt->execute([
        "finalized_by_user_id" => $reviewer["id"],
        "finalized_by_role" => $reviewer["role"],
        "rejection_reason" => $remarks,
        "user_id" => $userId
    ]);

    $logStmt = $pdo->prepare("
        INSERT INTO user_verifications (
            user_id,
            reviewer_user_id,
            reviewer_role,
            action,
            remarks
        )
        VALUES (
            :user_id,
            :reviewer_user_id,
            :reviewer_role,
            'reject',
            :remarks
        )
    ");
    $logStmt->execute([
        "user_id" => $userId,
        "reviewer_user_id" => $reviewer["id"],
        "reviewer_role" => $reviewer["role"],
        "remarks" => $remarks
    ]);

    $pdo->commit();

    jsonResponse(true, "User rejected successfully");

} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    jsonResponse(false, "Failed to reject user", $e->getMessage(), 500);
}