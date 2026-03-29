import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { searchBarangayContent } from "../services/searchService";
import "../assets/search.css"

export default function SearchResultsPage() {
    const [params] = useSearchParams();
    const query = params.get("q");

    const [data, setData] = useState(null);

    useEffect(() => {
        if (!query) return;

        searchBarangayContent(query).then((res) => {
            if (res.success) setData(res.data);
        });
    }, [query]);

    if (!query) return <p>No query</p>;

    return (
        <div className="search-page">
            <h2>Search Results for "{query}"</h2>

            <h3>People</h3>
            {data?.people?.map((p) => (
                <p key={p.id}>
                    {p.first_name} {p.last_name}
                </p>
            ))}

            <h3>Posts</h3>
            {data?.posts?.map((p) => (
                <p key={p.id}>{p.content}</p>
            ))}

            <h3>Comments</h3>
            {data?.comments?.map((c) => (
                <p key={c.id}>{c.content}</p>
            ))}
        </div>
    );
}