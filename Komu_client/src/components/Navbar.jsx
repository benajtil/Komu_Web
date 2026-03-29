import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../assets/navbar.css";
import logo from "../assets/images/O.png"
import home from "../assets/images/icons/home.svg"

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const canAccessAdminDashboard =
        user &&
        ["super_admin", "municipal_admin", "barangay_admin"].includes(user.role);

    const canAccessVerification =
        user &&
        ["barangay_admin", "municipal_admin", "super_admin"].includes(user.role);

    const handleLogout = async () => {
        const result = await logout();
        alert(result.message);
        navigate("/login");
    };

    return (
        <aside className="side-nav">
            <div className="side-nav__top">
                <NavLink to="/feed" className="side-nav__brand">
                    <img src={logo} alt="Komu Logo" className="side-nav__logo" />
                    <div className="side-nav__brand-text">
                        <h2>KOMU</h2>
                        <p>Komunikasyon</p>
                    </div>
                </NavLink>
            </div>

            <nav className="side-nav__menu">
                {user ? (
                    <>
                        <NavLink
                            to="/feed"
                            className={({ isActive }) =>
                                `side-nav__link ${isActive ? "side-nav__link--active" : ""}`
                            }
                        >
                            <span className="side-nav__icon" ><img src={home} alt="home" /></span>
                            <span className="side-nav__label">News Feed</span>
                        </NavLink>

                        {canAccessVerification && (
                            <NavLink
                                to="/verification"
                                className={({ isActive }) =>
                                    `side-nav__link ${isActive ? "side-nav__link--active" : ""}`
                                }
                            >
                                <span className="side-nav__icon">✓</span>
                                <span className="side-nav__label">Verification</span>
                            </NavLink>
                        )}

                        {canAccessAdminDashboard && (
                            <NavLink
                                to="/admin-dashboard"
                                className={({ isActive }) =>
                                    `side-nav__link ${isActive ? "side-nav__link--active" : ""}`
                                }
                            >
                                <span className="side-nav__icon">▦</span>
                                <span className="side-nav__label">Dashboard</span>
                            </NavLink>
                        )}
                    </>
                ) : (
                    <>
                        <NavLink
                            to="/login"
                            className={({ isActive }) =>
                                `side-nav__link ${isActive ? "side-nav__link--active" : ""}`
                            }
                        >
                            <span className="side-nav__icon">→</span>
                            <span className="side-nav__label">Login</span>
                        </NavLink>

                        <NavLink
                            to="/register"
                            className={({ isActive }) =>
                                `side-nav__link side-nav__link--primary ${isActive ? "side-nav__link--primary-active" : ""}`
                            }
                        >
                            <span className="side-nav__icon">+</span>
                            <span className="side-nav__label">Register</span>
                        </NavLink>
                    </>
                )}
            </nav>

            {user && (
                <div className="side-nav__footer">
                    <div className="side-nav__profile-card">
                        <div className="side-nav__profile">
                            <div className="side-nav__avatar">
                                {user.username?.charAt(0)?.toUpperCase()}
                            </div>

                            <div className="side-nav__profile-text">
                                <strong>@{user.username}</strong>
                                <p>{user.role?.replaceAll("_", " ")}</p>
                            </div>
                        </div>
                    </div>

                    <button type="button" className="side-nav__logout" onClick={handleLogout}>
                        <span className="side-nav__icon">⎋</span>
                        <span className="side-nav__label">Logout</span>
                    </button>
                </div>
            )}
        </aside>
    );
}