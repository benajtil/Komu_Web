import { useState } from "react";

const SYSTEM_ROLES = [
    "resident",
    "barangay_admin",
    "municipal_admin",
    "super_admin",
];

const OFFICIAL_ROLES = [
    "",
    "barangay_captain",
    "barangay_kagawad",
    "barangay_secretary",
    "barangay_treasurer",
    "sk_chairperson",
    "sk_kagawad",
    "mayor",
    "vice_mayor",
    "councilor",
    "governor",
    "vice_governor",
    "provincial_board_member",
];

export default function RoleEditors({
    user,
    onUpdateSystemRole,
    onUpdateOfficialRole,
}) {
    const [systemRole, setSystemRole] = useState(user?.role || "");
    const [officialRole, setOfficialRole] = useState(user?.official_role || "");
    const [officialVerified, setOfficialVerified] = useState(
        !!user?.official_role_verified
    );

    const handleSystemSave = () => {
        onUpdateSystemRole(systemRole);
    };

    const handleOfficialSave = () => {
        onUpdateOfficialRole(officialRole, officialVerified);
    };

    return (
        <div className="role-editors-grid">
            <div className="role-editor-box">
                <h4>System Role</h4>
                <select
                    value={systemRole}
                    onChange={(e) => setSystemRole(e.target.value)}
                >
                    {SYSTEM_ROLES.map((role) => (
                        <option key={role} value={role}>
                            {role}
                        </option>
                    ))}
                </select>
                <button type="button" onClick={handleSystemSave}>
                    Save System Role
                </button>
            </div>

            <div className="role-editor-box">
                <h4>Official Role</h4>
                <select
                    value={officialRole}
                    onChange={(e) => setOfficialRole(e.target.value)}
                >
                    {OFFICIAL_ROLES.map((role) => (
                        <option key={role || "none"} value={role}>
                            {role || "None"}
                        </option>
                    ))}
                </select>

                <label className="checkbox-row">
                    <input
                        type="checkbox"
                        checked={officialVerified}
                        onChange={(e) => setOfficialVerified(e.target.checked)}
                    />
                    Official role verified
                </label>

                <button type="button" onClick={handleOfficialSave}>
                    Save Official Role
                </button>
            </div>
        </div>
    );
}