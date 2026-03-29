import { useEffect, useState } from "react";
import DashboardStatsCards from "../components/admin/DashboardStatsCards";
import LocationStatsTables from "../components/admin/LocationStatsTables";
import UsersTable from "../components/admin/UsersTable";
import UserDetailsPanel from "../components/admin/UserDetailsPanel";
import {
    getDashboardStats,
    getUsersList,
    getAdminUserDetails,
    updateSystemRole,
    updateOfficialRole,
} from "../services/adminService";
import "../assets/admin-dashboard.css";

export default function AdminDashboardPage() {
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [userDetails, setUserDetails] = useState(null);

    const [loadingStats, setLoadingStats] = useState(true);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [loadingDetails, setLoadingDetails] = useState(false);

    const [filters, setFilters] = useState({
        search: "",
        verification_status: "",
        role: "",
        official_role: "",
    });

    useEffect(() => {
        loadStats();
        loadUsers();
    }, []);

    const loadStats = async () => {
        setLoadingStats(true);
        try {
            const result = await getDashboardStats();
            if (result.success) {
                setStats(result.data);
            } else {
                alert(result.message || "Failed to load dashboard stats");
            }
        } catch {
            alert("Failed to load dashboard stats");
        } finally {
            setLoadingStats(false);
        }
    };

    const loadUsers = async (customFilters = filters) => {
        setLoadingUsers(true);
        try {
            const result = await getUsersList(customFilters);
            if (result.success) {
                setUsers(result.data || []);
            } else {
                alert(result.message || "Failed to load users");
            }
        } catch {
            alert("Failed to load users");
        } finally {
            setLoadingUsers(false);
        }
    };

    const handleSelectUser = async (userId) => {
        setSelectedUserId(userId);
        setLoadingDetails(true);

        try {
            const result = await getAdminUserDetails(userId);
            if (result.success) {
                setUserDetails(result.data);
            } else {
                alert(result.message || "Failed to load user details");
            }
        } catch {
            alert("Failed to load user details");
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const applyFilters = () => {
        loadUsers(filters);
    };

    const resetFilters = () => {
        const cleared = {
            search: "",
            verification_status: "",
            role: "",
            official_role: "",
        };
        setFilters(cleared);
        loadUsers(cleared);
    };

    const handleUpdateSystemRole = async (role) => {
        if (!selectedUserId) return;

        const result = await updateSystemRole(selectedUserId, role);
        alert(result.message);

        if (result.success) {
            await loadUsers();
            await handleSelectUser(selectedUserId);
        }
    };

    const handleUpdateOfficialRole = async (officialRole, officialRoleVerified) => {
        if (!selectedUserId) return;

        const result = await updateOfficialRole(
            selectedUserId,
            officialRole,
            officialRoleVerified
        );
        alert(result.message);

        if (result.success) {
            await loadUsers();
            await handleSelectUser(selectedUserId);
        }
    };

    return (
        <div className="admin-dashboard-page">
            <div className="admin-page-header">
                <div>
                    <h1>Admin Dashboard</h1>
                    <p>Manage users, roles, official titles, posts, comments, and stats.</p>
                </div>
            </div>

            {loadingStats ? (
                <div className="admin-card">
                    <p className="muted-text">Loading dashboard stats...</p>
                </div>
            ) : (
                <>
                    <DashboardStatsCards summary={stats?.summary} />
                    <LocationStatsTables
                        usersByProvince={stats?.users_by_province || []}
                        usersByMunicipality={stats?.users_by_municipality || []}
                        usersByBarangay={stats?.users_by_barangay || []}
                    />
                </>
            )}

            <div className="admin-card">
                <div className="admin-card__header">
                    <h3>User Filters</h3>
                </div>

                <div className="admin-filters-grid">
                    <input
                        type="text"
                        name="search"
                        placeholder="Search user..."
                        value={filters.search}
                        onChange={handleFilterChange}
                    />

                    <select
                        name="verification_status"
                        value={filters.verification_status}
                        onChange={handleFilterChange}
                    >
                        <option value="">All Verification Status</option>
                        <option value="verified">Verified</option>
                        <option value="pending">Pending</option>
                        <option value="rejected">Rejected</option>
                    </select>

                    <select
                        name="role"
                        value={filters.role}
                        onChange={handleFilterChange}
                    >
                        <option value="">All System Roles</option>
                        <option value="resident">resident</option>
                        <option value="barangay_admin">barangay_admin</option>
                        <option value="municipal_admin">municipal_admin</option>
                        <option value="super_admin">super_admin</option>
                    </select>

                    <select
                        name="official_role"
                        value={filters.official_role}
                        onChange={handleFilterChange}
                    >
                        <option value="">All Official Roles</option>
                        <option value="barangay_captain">barangay_captain</option>
                        <option value="barangay_kagawad">barangay_kagawad</option>
                        <option value="barangay_secretary">barangay_secretary</option>
                        <option value="barangay_treasurer">barangay_treasurer</option>
                        <option value="sk_chairperson">sk_chairperson</option>
                        <option value="sk_kagawad">sk_kagawad</option>
                        <option value="mayor">mayor</option>
                        <option value="vice_mayor">vice_mayor</option>
                        <option value="councilor">councilor</option>
                        <option value="governor">governor</option>
                        <option value="vice_governor">vice_governor</option>
                        <option value="provincial_board_member">
                            provincial_board_member
                        </option>
                    </select>
                </div>

                <div className="admin-filter-actions">
                    <button type="button" onClick={applyFilters}>
                        Apply Filters
                    </button>
                    <button type="button" className="secondary-btn" onClick={resetFilters}>
                        Reset
                    </button>
                </div>
            </div>

            <div className="admin-main-layout">
                <section className="admin-left">
                    <UsersTable
                        users={users}
                        loading={loadingUsers}
                        selectedUserId={selectedUserId}
                        onSelectUser={handleSelectUser}
                    />
                </section>

                <aside className="admin-right">
                    <UserDetailsPanel
                        userDetails={userDetails}
                        loading={loadingDetails}
                        onUpdateSystemRole={handleUpdateSystemRole}
                        onUpdateOfficialRole={handleUpdateOfficialRole}
                    />
                </aside>
            </div>
        </div>
    );
}