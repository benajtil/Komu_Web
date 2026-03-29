function MiniTable({ title, rows, nameKey }) {
    return (
        <div className="admin-card">
            <div className="admin-card__header">
                <h3>{title}</h3>
            </div>

            {rows?.length ? (
                <div className="mini-table-wrap">
                    <table className="mini-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Users</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row) => (
                                <tr key={row.id}>
                                    <td>{row[nameKey]}</td>
                                    <td>{row.user_count}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="muted-text">No data available.</p>
            )}
        </div>
    );
}

export default function LocationStatsTables({
    usersByProvince,
    usersByMunicipality,
    usersByBarangay,
}) {
    return (
        <div className="location-stats-grid">
            <MiniTable
                title="Users by Province"
                rows={usersByProvince}
                nameKey="province_name"
            />
            <MiniTable
                title="Users by Municipality"
                rows={usersByMunicipality}
                nameKey="municipality_name"
            />
            <MiniTable
                title="Users by Barangay"
                rows={usersByBarangay}
                nameKey="barangay_name"
            />
        </div>
    );
}