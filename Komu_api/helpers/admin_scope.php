<?php

function getAdminScope(array $currentUser): array
{
    $role = $currentUser["role"] ?? null;

    if ($role === "super_admin") {
        return [
            "allowed" => true,
            "where_sql" => "",
            "params" => []
        ];
    }

    if ($role === "municipal_admin") {
        return [
            "allowed" => true,
            "where_sql" => "u.municipality_id = :scope_municipality_id",
            "params" => [
                "scope_municipality_id" => $currentUser["municipality_id"] ?? 0
            ]
        ];
    }

    if ($role === "barangay_admin") {
        return [
            "allowed" => true,
            "where_sql" => "u.barangay_id = :scope_barangay_id",
            "params" => [
                "scope_barangay_id" => $currentUser["barangay_id"] ?? 0
            ]
        ];
    }

    return [
        "allowed" => false,
        "where_sql" => "",
        "params" => []
    ];
}