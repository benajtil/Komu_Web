<?php

// 🔧 DATABASE CONFIG
$pdo = new PDO(
    "pgsql:host=localhost;port=5432;dbname=Komu",
    "postgres",
    "Til091002"
);

$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// 📂 FILE PATHS
$base = __DIR__ . "/..";

$provinceFile = "$base/provinces.csv";
$municipalityFile = "$base/municipalities.csv";
$barangayFile = "$base/barangays.csv";

// 📥 CSV READER
function readCsvAssoc(string $filePath): array
{
    $rows = [];

    if (!file_exists($filePath)) {
        echo "File not found: $filePath\n";
        return $rows;
    }

    $handle = fopen($filePath, "r");
    if (!$handle) {
        echo "Failed to open: $filePath\n";
        return $rows;
    }

    $headers = fgetcsv($handle);

    while (($row = fgetcsv($handle)) !== false) {
        if (count($row) !== count($headers)) continue;
        $rows[] = array_combine($headers, $row);
    }

    fclose($handle);
    return $rows;
}

// ======================
// 🏗️ LOAD CSV FILES
// ======================
$provinces = readCsvAssoc($provinceFile);
$municipalities = readCsvAssoc($municipalityFile);
$barangays = readCsvAssoc($barangayFile);

echo "Loaded CSVs\n";
echo "Provinces: " . count($provinces) . "\n";
echo "Municipalities: " . count($municipalities) . "\n";
echo "Barangays: " . count($barangays) . "\n\n";

// ======================
// 🏗️ INSERT PROVINCES
// ======================
$insertProvince = $pdo->prepare("
    INSERT INTO provinces (code, name, region_name)
    VALUES (:code, :name, :region_name)
    ON CONFLICT (code) DO NOTHING
");

foreach ($provinces as $province) {
    $insertProvince->execute([
        "code" => $province["code"],
        "name" => $province["name"],
        "region_name" => $province["region_name"] ?? null
    ]);
}

echo "Provinces inserted.\n";

// ======================
// 🔗 BUILD PROVINCE MAP
// ======================
$provinceMap = [];

$stmt = $pdo->query("SELECT id, code FROM provinces");

foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
    $provinceMap[$row["code"]] = $row["id"];
}

// ======================
// 🏗️ INSERT MUNICIPALITIES
// ======================
$insertMunicipality = $pdo->prepare("
    INSERT INTO municipalities (code, province_id, region_name, name, type)
    VALUES (:code, :province_id, :region_name, :name, :type)
    ON CONFLICT (code) DO NOTHING
");

foreach ($municipalities as $municipality) {
    $provinceCode = $municipality["province_code"] ?? "";
    $provinceId = null;

    // NCR / no province case handled here
    if ($provinceCode !== "" && isset($provinceMap[$provinceCode])) {
        $provinceId = $provinceMap[$provinceCode];
    }

    $insertMunicipality->execute([
        "code" => $municipality["code"],
        "province_id" => $provinceId,
        "region_name" => $municipality["region_name"] ?? null,
        "name" => $municipality["name"],
        "type" => $municipality["type"] ?? null
    ]);
}

echo "Municipalities inserted.\n";

// ======================
// 🔗 BUILD MUNICIPALITY MAP
// ======================
$municipalityMap = [];

$stmt = $pdo->query("SELECT id, code FROM municipalities");

foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
    $municipalityMap[$row["code"]] = $row["id"];
}

// ======================
// 🏗️ INSERT BARANGAYS
// ======================
$insertBarangay = $pdo->prepare("
    INSERT INTO barangays (code, municipality_id, name)
    VALUES (:code, :municipality_id, :name)
    ON CONFLICT (code) DO NOTHING
");

$count = 0;

foreach ($barangays as $barangay) {
    $municipalityCode = $barangay["municipality_code"] ?? "";

    if (!isset($municipalityMap[$municipalityCode])) {
        continue;
    }

    $insertBarangay->execute([
        "code" => $barangay["code"],
        "municipality_id" => $municipalityMap[$municipalityCode],
        "name" => $barangay["name"]
    ]);

    $count++;

    // progress indicator
    if ($count % 5000 === 0) {
        echo "Inserted $count barangays...\n";
    }
}

echo "Barangays inserted: $count\n";

echo "\n✅ SEED COMPLETE!\n";