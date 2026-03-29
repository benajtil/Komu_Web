export default function UsersTable({
    users,
    loading,
    selectedUserId,
    onSelectUser,
}) {
    return (
        <div className="admin-card">
            <div className="admin-card__header">
                <h3>Users</h3>
            </div>

            {loading ? (
                <p className="muted-text">Loading users...</p>
            ) : !users.length ? (
                <p className="muted-text">No users found.</p>
            ) : (
                <div className="users-table-wrap">
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Username</th>
                                <th>Status</th>
                                <th>System Role</th>
                                <th>Official Role</th>
                                <th>Posts</th>
                                <th>Comments</th>
                                <th>Barangay</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr
                                    key={user.id}
                                    className={selectedUserId === user.id ? "active-row" : ""}
                                    onClick={() => onSelectUser(user.id)}
                                >
                                    <td>{user.id}</td>
                                    <td>
                                        {user.first_name} {user.last_name}
                                    </td>
                                    <td>@{user.username}</td>
                                    <td>{user.verification_status}</td>
                                    <td>{user.role}</td>
                                    <td>{user.official_role || "-"}</td>
                                    <td>{user.post_count}</td>
                                    <td>{user.comment_count}</td>
                                    <td>{user.barangay_name || "-"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}