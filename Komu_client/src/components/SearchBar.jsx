import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { searchPeopleSuggestions } from "../services/searchService";
import { officialRoleMeta } from "../utils/officialRoleMeta";
import "../assets/search-bar.css"

export default function SearchBar() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [show, setShow] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const delay = setTimeout(async () => {
            if (!query.trim()) {
                setResults([]);
                return;
            }

            const res = await searchPeopleSuggestions(query);
            if (res.success) {
                setResults(res.data);
            }
        }, 300);

        return () => clearTimeout(delay);
    }, [query]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        navigate(`/search?q=${encodeURIComponent(query)}`);
    };

    return (
        <div className="searchbar">
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Search people..."
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setShow(true);
                    }}
                    onFocus={() => setShow(true)}
                />
            </form>

            {show && results.length > 0 && (
                <div className="search-dropdown">
                    {results.map((user) => {
                        const badge =
                            user.official_role &&
                            user.official_role_verified &&
                            officialRoleMeta[user.official_role];

                        return (
                            <div
                                key={user.id}
                                className="search-item"
                                onClick={() => navigate(`/profile/${user.id}`)}
                            >
                                <strong>
                                    {user.first_name} {user.last_name}
                                </strong>

                                {badge && (
                                    <span className={badge.className}>
                                        {badge.label}
                                    </span>
                                )}

                                <p>@{user.username}</p>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}