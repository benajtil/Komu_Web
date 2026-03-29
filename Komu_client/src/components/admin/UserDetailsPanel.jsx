import RoleEditors from "./RoleEditors";

export default function UserDetailsPanel({
    userDetails,
    loading,
    onUpdateSystemRole,
    onUpdateOfficialRole,
}) {
    if (loading) {
        return (
            <div className="admin-card">
                <p className="muted-text">Loading user details...</p>
            </div>
        );
    }

    if (!userDetails?.user) {
        return (
            <div className="admin-card">
                <p className="muted-text">Select a user to view details.</p>
            </div>
        );
    }

    const { user, posts, comments, verification_history } = userDetails;

    const validIdUrl = user.valid_id_path
        ? `http://localhost:8000/${user.valid_id_path}`
        : "";

    const isImage = /\.(jpg|jpeg|png)$/i.test(user.valid_id_path || "");

    return (
        <div className="details-stack">
            <div className="admin-card">
                <div className="admin-card__header">
                    <h3>User Details</h3>
                </div>

                <div className="details-grid">
                    <div className="detail-box">
                        <label>User ID</label>
                        <p>{user.id}</p>
                    </div>
                    <div className="detail-box">
                        <label>Full Name</label>
                        <p>
                            {user.first_name} {user.last_name}
                        </p>
                    </div>
                    <div className="detail-box">
                        <label>Username</label>
                        <p>@{user.username}</p>
                    </div>
                    <div className="detail-box">
                        <label>Email</label>
                        <p>{user.email}</p>
                    </div>
                    <div className="detail-box">
                        <label>Contact Number</label>
                        <p>{user.contact_number || "-"}</p>
                    </div>
                    <div className="detail-box">
                        <label>Verification Status</label>
                        <p>{user.verification_status}</p>
                    </div>
                    <div className="detail-box">
                        <label>Province</label>
                        <p>{user.province_name || "-"}</p>
                    </div>
                    <div className="detail-box">
                        <label>Municipality</label>
                        <p>{user.municipality_name || "-"}</p>
                    </div>
                    <div className="detail-box detail-box--full">
                        <label>Barangay</label>
                        <p>{user.barangay_name || "-"}</p>
                    </div>
                </div>
            </div>

            <div className="admin-card">
                <div className="admin-card__header">
                    <h3>Role Management</h3>
                </div>

                <RoleEditors
                    user={user}
                    onUpdateSystemRole={onUpdateSystemRole}
                    onUpdateOfficialRole={onUpdateOfficialRole}
                />
            </div>

            <div className="admin-card">
                <div className="admin-card__header">
                    <h3>Valid ID</h3>
                </div>

                {!user.valid_id_path ? (
                    <p className="muted-text">No valid ID uploaded.</p>
                ) : isImage ? (
                    <div className="valid-id-preview">
                        <img src={validIdUrl} alt="Valid ID" />
                    </div>
                ) : (
                    <div className="valid-id-file-box">
                        <a href={validIdUrl} target="_blank" rel="noreferrer">
                            Open uploaded ID
                        </a>
                    </div>
                )}
            </div>

            <div className="admin-card">
                <div className="admin-card__header">
                    <h3>User Posts</h3>
                </div>

                {!posts?.length ? (
                    <p className="muted-text">No posts found.</p>
                ) : (
                    <div className="simple-list">
                        {posts.map((post) => (
                            <div key={post.id} className="simple-list-item">
                                <strong>Post #{post.id}</strong>
                                <p>{post.content}</p>
                                <small>{post.created_at}</small>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="admin-card">
                <div className="admin-card__header">
                    <h3>User Comments</h3>
                </div>

                {!comments?.length ? (
                    <p className="muted-text">No comments found.</p>
                ) : (
                    <div className="simple-list">
                        {comments.map((comment) => (
                            <div key={comment.id} className="simple-list-item">
                                <strong>Comment #{comment.id}</strong>
                                <p>{comment.content}</p>
                                <small>{comment.created_at}</small>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="admin-card">
                <div className="admin-card__header">
                    <h3>Verification History</h3>
                </div>

                {!verification_history?.length ? (
                    <p className="muted-text">No verification history found.</p>
                ) : (
                    <div className="simple-list">
                        {verification_history.map((item) => (
                            <div key={item.id} className="simple-list-item">
                                <strong>{item.action}</strong>
                                <p>Reviewer: @{item.reviewer_username}</p>
                                <p>Role: {item.reviewer_role}</p>
                                <p>{item.remarks || "No remarks."}</p>
                                <small>{item.created_at}</small>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}