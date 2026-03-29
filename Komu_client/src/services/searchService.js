import API_BASE_URL from "./api";

export async function searchBarangayContent(query) {
    const response = await fetch(
        `${API_BASE_URL}/search/global_search.php?q=${encodeURIComponent(query)}`,
        {
            method: "GET",
            credentials: "include",
        }
    );

    return response.json();
}
export async function searchPeopleSuggestions(query) {
    const res = await fetch(
        `http://localhost:8000/search/people_suggestions.php?q=${encodeURIComponent(query)}`,
        { credentials: "include" }
    );

    return res.json();
}