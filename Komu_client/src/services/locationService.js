import API_BASE_URL from "./api";

export async function getProvinces() {
    const response = await fetch(`${API_BASE_URL}/locations/provinces.php`, {
        method: "GET",
        credentials: "include",
    });
    return response.json();
}

export async function getMunicipalities(provinceId) {
    const response = await fetch(
        `${API_BASE_URL}/locations/municipalities.php?province_id=${provinceId}`,
        {
            method: "GET",
            credentials: "include",
        }
    );
    return response.json();
}

export async function getBarangays(municipalityId) {
    const response = await fetch(
        `${API_BASE_URL}/locations/barangays.php?municipality_id=${municipalityId}`,
        {
            method: "GET",
            credentials: "include",
        }
    );
    return response.json();
}