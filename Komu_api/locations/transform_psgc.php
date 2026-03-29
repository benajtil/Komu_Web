<?php

$inputFile = __DIR__ . "/../raw/psgc_full.csv";
$outputDir = __DIR__ . "/../transformed";

if (!file_exists($inputFile)) {
    exit("Input file not found: $inputFile\n");
}

if (!is_dir($outputDir)) {
    mkdir($outputDir, 0777, true);
}

$handle = fopen($inputFile, "r");
if (!$handle) {
    exit("Failed to open input CSV.\n");
}

$headers = fgetcsv($handle);
if (!$headers) {
    fclose($handle);
    exit("CSV is empty.\n");
}

function normalizeHeader(string $header): string
{
    $header = preg_replace('/^\xEF\xBB\xBF/', '', $header); // remove BOM
    $header = trim($header);
    $header = preg_replace('/\s+/', ' ', $header); // collapse spaces/newlines
    return strtolower($header);
}

$normalizedHeaders = array_map('normalizeHeader', $headers);
$headerMap = array_flip($normalizedHeaders);

$codeKey = "10-digit psgc";
$nameKey = "name";
$geoLevelKey = "geographic level";
$correspondenceKey = "correspondence code";

foreach ([$codeKey, $nameKey, $geoLevelKey, $correspondenceKey] as $required) {
    if (!isset($headerMap[$required])) {
        fclose($handle);
        exit(
            "Missing required column: $required\nFound headers:\n" .
            implode("\n", $headers) . "\n"
        );
    }
}

$provinces = [];
$municipalities = [];
$barangays = [];

$currentRegion = null;
$currentProvince = null;
$currentMunicipality = null;

while (($row = fgetcsv($handle)) !== false) {
    $code = trim($row[$headerMap[$codeKey]] ?? "");
    $name = trim($row[$headerMap[$nameKey]] ?? "");
    $geoLevel = trim($row[$headerMap[$geoLevelKey]] ?? "");
    $correspondenceCode = trim($row[$headerMap[$correspondenceKey]] ?? "");

    if ($code === "" || $name === "" || $geoLevel === "") {
        continue;
    }

    if ($geoLevel === "Reg") {
        $currentRegion = $name;
        $currentProvince = null;
        $currentMunicipality = null;
        continue;
    }

    if ($geoLevel === "Prov") {
        $currentProvince = [
            "code" => $code,
            "name" => $name,
            "region_name" => $currentRegion
        ];

        $provinces[$code] = $currentProvince;
        $currentMunicipality = null;
        continue;
    }

    if ($geoLevel === "City" || $geoLevel === "Mun") {
        // NCR and some independent cities may not have a normal province row.
        $municipalities[$code] = [
            "code" => $code,
            "province_code" => $currentProvince["code"] ?? "",
            "region_name" => $currentRegion,
            "name" => $name,
            "type" => ($geoLevel === "City") ? "city" : "municipality"
        ];

        $currentMunicipality = [
            "code" => $code,
            "name" => $name
        ];
        continue;
    }

    if ($geoLevel === "Bgy") {
        if (!$currentMunicipality) {
            continue;
        }

        $barangays[$code] = [
            "code" => $code,
            "municipality_code" => $currentMunicipality["code"],
            "name" => $name
        ];
    }
}

fclose($handle);

function writeCsv(string $filePath, array $headers, array $rows): void
{
    $file = fopen($filePath, "w");
    fputcsv($file, $headers);

    foreach ($rows as $row) {
        $ordered = [];
        foreach ($headers as $header) {
            $ordered[] = $row[$header] ?? "";
        }
        fputcsv($file, $ordered);
    }

    fclose($file);
}

writeCsv(
    $outputDir . "/provinces.csv",
    ["code", "name", "region_name"],
    array_values($provinces)
);

writeCsv(
    $outputDir . "/municipalities.csv",
    ["code", "province_code", "region_name", "name", "type"],
    array_values($municipalities)
);

writeCsv(
    $outputDir . "/barangays.csv",
    ["code", "municipality_code", "name"],
    array_values($barangays)
);

echo "Transform complete.\n";
echo "Provinces: " . count($provinces) . "\n";
echo "Municipalities: " . count($municipalities) . "\n";
echo "Barangays: " . count($barangays) . "\n";