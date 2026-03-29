import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getUserProfile } from "../services/profileService";
import { officialRoleMeta } from "../utils/officialRoleMeta";
import "../assets/profile.css";
import "../assets/role-badges.css";

export default function ProfilePage() {
    const { id } = useParams();

    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProfile();
    }, [id]);

    const loadProfile = async () => {
        setLoading(true);

        try {
            const result = await getUserProfile(id);

            if (result.success) {
                setProfileData(result.data);
            } else {
                setProfileData(null);
            }
        } catch (error) {
            setProfileData(null);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="profile-page">
                <div className="profile-card">
                    <p>Loading profile...</p>
                </div>
            </div>
        );
    }

    if (!profileData?.user) {
        return (
            <div className="profile-page">
                <div className="profile-card">
                    <h2>Profile not found</h2>
                    <p>This user may not exist or is outside your barangay scope.</p>
                </div>
            </div>
        );
    }

    const { user, posts } = profileData;

    const badge =
        user.official_role &&
            user.official_role_verified &&
            officialRoleMeta[user.official_role]
            ? officialRoleMeta[user.official_role]
            : null;

    return (
        <div className="profile-page">
            <div className="profile-layout">
                <section className="profile-main">
                    <div className="profile-hero-card">
                        <div className="profile-avatar">
                            {user.first_name?.charAt(0)}
                            {user.last_name?.charAt(0)}
                        </div>

                        <div className="profile-hero-content">
                            <div className="profile-name-row">
                                <h1>
                                    {user.first_name} {user.last_name}
                                </h1>

                                {badge && (
                                    <span className={badge.className}>
                                        {badge.label}
                                    </span>
                                )}
                            </div>

                            <p className="profile-username">@{user.username}</p>

                            <div className="profile-meta">
                                <span>
                                    <strong>System Role:</strong> {user.role}
                                </span>
                                <span>
                                    <strong>Status:</strong> {user.verification_status}
                                </span>
                            </div>

                            <div className="profile-location">
                                <strong>Location:</strong>{" "}
                                {user.barangay_name}, {user.municipality_name}, {user.province_name}
                            </div>
                        </div>
                    </div>

                    <div className="profile-card">
                        <div className="profile-card__header">
                            <h3>Posts</h3>
                            <span>{posts?.length || 0}</span>
                        </div>

                        {!posts?.length ? (
                            <p className="muted-text">No posts yet.</p>
                        ) : (
                            <div className="profile-posts-list">
                                {posts.map((post) => (
                                    <article key={post.id} className="profile-post-card">
                                        <p>{post.content}</p>
                                        <small>{post.created_at}</small>
                                    </article>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                <aside className="profile-sidebar">
                    <div className="profile-card">
                        <div className="profile-card__header">
                            <h3>About</h3>
                        </div>

                        <div className="profile-info-list">
                            <div className="profile-info-item">
                                <label>Email</label>
                                <p>{user.email}</p>
                            </div>

                            <div className="profile-info-item">
                                <label>Comments</label>
                                <p>{user.comment_count}</p>
                            </div>

                            <div className="profile-info-item">
                                <label>Joined</label>
                                <p>{user.created_at}</p>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}