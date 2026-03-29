import { useEffect, useState } from "react";
import {
    getPendingUsers,
    getUserDetails,
    approveUser,
    rejectUser,
} from "../services/verificationService";
import "../assets/verification.css";

export default function VerificationDashboardPage() {
    const [pendingUsers, setPendingUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [selectedUserData, setSelectedUserData] = useState(null);
    const [history, setHistory] = useState([]);
    const [loadingList, setLoadingList] = useState(true);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [remarks, setRemarks] = useState("");

    useEffect(() => {
        loadPendingUsers();
    }, []);

    const loadPendingUsers = async () => {
        setLoadingList(true);
        try {
            const result = await getPendingUsers();

            if (result.success) {
                setPendingUsers(result.data || []);

                if (!selectedUserId && result.data?.length > 0) {
                    handleSelectUser(result.data[0].id);
                }
            } else {
                alert(result.message || "Failed to load pending users");
            }
        } catch (error) {
            alert("Failed to load pending users");
        } finally {
            setLoadingList(false);
        }
    };

    const handleSelectUser = async (userId) => {
        setSelectedUserId(userId);
        setLoadingDetails(true);
        setRemarks("");

        try {
            const result = await getUserDetails(userId);

            if (result.success) {
                setSelectedUserData(result.data?.user || null);
                setHistory(result.data?.history || []);
            } else {
                alert(result.message || "Failed to load user details");
            }
        } catch (error) {
            alert("Failed to load user details");
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleApprove = async () => {
        if (!selectedUserId) return;

        const confirmed = window.confirm("Approve this registration?");
        if (!confirmed) return;

        setActionLoading(true);
        try {
            const result = await approveUser(selectedUserId, remarks);

            if (result.success) {
                alert(result.message || "User approved successfully");
                setSelectedUserData(null);
                setHistory([]);
                setSelectedUserId(null);
                setRemarks("");
                await loadPendingUsers();
            } else {
                alert(result.message || "Failed to approve user");
            }
        } catch (error) {
            alert("Failed to approve user");
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!selectedUserId) return;

        if (!remarks.trim()) {
            alert("Please enter rejection remarks");
            return;
        }

        const confirmed = window.confirm("Reject this registration?");
        if (!confirmed) return;

        setActionLoading(true);
        try {
            const result = await rejectUser(selectedUserId, remarks);

            if (result.success) {
                alert(result.message || "User rejected successfully");
                setSelectedUserData(null);
                setHistory([]);
                setSelectedUserId(null);
                setRemarks("");
                await loadPendingUsers();
            } else {
                alert(result.message || "Failed to reject user");
            }
        } catch (error) {
            alert("Failed to reject user");
        } finally {
            setActionLoading(false);
        }
    };

    const getValidIdUrl = (path) => {
        if (!path) return "";
        return `http://localhost:8000/${path}`;
    };

    const isImageFile = (path) => {
        return /\.(jpg|jpeg|png)$/i.test(path || "");
    };

    return (
        <div className="verification-page">
            <div className="verification-header">
                <div>
                    <h1>Verification Dashboard</h1>
                    <p>Review pending registrations and verify community members.</p>
                </div>
            </div>

            <div className="verification-layout">
                <aside className="verification-sidebar">
                    <div className="verification-card">
                        <div className="verification-card__header">
                            <h2>Pending Users</h2>
                            <span className="verification-badge">
                                {loadingList ? "..." : pendingUsers.length}
                            </span>
                        </div>

                        {loadingList ? (
                            <p className="muted-text">Loading pending users...</p>
                        ) : pendingUsers.length === 0 ? (
                            <p className="muted-text">No pending users found.</p>
                        ) : (
                            <div className="pending-users-list">
                                {pendingUsers.map((user) => (
                                    <button
                                        key={user.id}
                                        type="button"
                                        className={`pending-user-item ${selectedUserId === user.id ? "active" : ""
                                            }`}
                                        onClick={() => handleSelectUser(user.id)}
                                    >
                                        <div className="pending-user-item__top">
                                            <strong>
                                                {user.first_name} {user.last_name}
                                            </strong>
                                        </div>
                                        <p>@{user.username}</p>
                                        <small>
                                            {user.barangay_name}, {user.municipality_name}
                                        </small>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </aside>

                <section className="verification-main">
                    {loadingDetails ? (
                        <div className="verification-card">
                            <p className="muted-text">Loading applicant details...</p>
                        </div>
                    ) : !selectedUserData ? (
                        <div className="verification-card">
                            <p className="muted-text">
                                Select a pending user to view details.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="verification-card">
                                <div className="verification-card__header">
                                    <h2>Applicant Details</h2>
                                    <span className="status-pill pending">
                                        {selectedUserData.verification_status}
                                    </span>
                                </div>

                                <div className="details-grid">
                                    <div className="detail-box">
                                        <label>Full Name</label>
                                        <p>
                                            {selectedUserData.first_name} {selectedUserData.last_name}
                                        </p>
                                    </div>

                                    <div className="detail-box">
                                        <label>Username</label>
                                        <p>@{selectedUserData.username}</p>
                                    </div>

                                    <div className="detail-box">
                                        <label>Email</label>
                                        <p>{selectedUserData.email}</p>
                                    </div>

                                    <div className="detail-box">
                                        <label>Contact Number</label>
                                        <p>{selectedUserData.contact_number}</p>
                                    </div>

                                    <div className="detail-box">
                                        <label>Province</label>
                                        <p>{selectedUserData.province_name || "N/A"}</p>
                                    </div>

                                    <div className="detail-box">
                                        <label>Municipality / City</label>
                                        <p>{selectedUserData.municipality_name || "N/A"}</p>
                                    </div>

                                    <div className="detail-box detail-box--full">
                                        <label>Barangay</label>
                                        <p>{selectedUserData.barangay_name || "N/A"}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="verification-card">
                                <div className="verification-card__header">
                                    <h2>Uploaded Valid ID</h2>
                                </div>

                                {!selectedUserData.valid_id_path ? (
                                    <p className="muted-text">No valid ID uploaded.</p>
                                ) : isImageFile(selectedUserData.valid_id_path) ? (
                                    <div className="valid-id-preview">
                                        <img
                                            src={getValidIdUrl(selectedUserData.valid_id_path)}
                                            alt="Valid ID"
                                        />
                                    </div>
                                ) : (
                                    <div className="valid-id-file-box">
                                        <p>PDF file uploaded.</p>
                                        <a
                                            href={getValidIdUrl(selectedUserData.valid_id_path)}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            Open Valid ID
                                        </a>
                                    </div>
                                )}
                            </div>

                            <div className="verification-card">
                                <div className="verification-card__header">
                                    <h2>Decision</h2>
                                </div>

                                <textarea
                                    className="verification-remarks"
                                    placeholder="Add remarks for approval or rejection..."
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                />

                                <div className="verification-actions">
                                    <button
                                        type="button"
                                        className="approve-btn"
                                        onClick={handleApprove}
                                        disabled={actionLoading}
                                    >
                                        {actionLoading ? "Processing..." : "Approve User"}
                                    </button>

                                    <button
                                        type="button"
                                        className="reject-btn"
                                        onClick={handleReject}
                                        disabled={actionLoading}
                                    >
                                        {actionLoading ? "Processing..." : "Reject User"}
                                    </button>
                                </div>
                            </div>

                            <div className="verification-card">
                                <div className="verification-card__header">
                                    <h2>Verification History</h2>
                                </div>

                                {history.length === 0 ? (
                                    <p className="muted-text">No verification history yet.</p>
                                ) : (
                                    <div className="history-list">
                                        {history.map((item) => (
                                            <div className="history-item" key={item.id}>
                                                <div className="history-item__top">
                                                    <strong>{item.action}</strong>
                                                    <span>{item.reviewer_role}</span>
                                                </div>
                                                <p>Reviewer: @{item.reviewer_username}</p>
                                                <p>{item.remarks || "No remarks provided."}</p>
                                                <small>{item.created_at}</small>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </section>
            </div>
        </div>
    );
}