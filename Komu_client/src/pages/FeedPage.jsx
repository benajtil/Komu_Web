import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
    createPost,
    getPostsByBarangay,
    updatePost,
    deletePost,
} from "../services/postService";
import CommentsSection from "../components/CommentsSection";
import "../assets/feed.css";
import "../assets/role-badges.css";
import { officialRoleMeta } from "../utils/officialRoleMeta";
import SearchBar from "../components/SearchBar";

export default function FeedPage() {
    const { user } = useAuth();
    const [content, setContent] = useState("");
    const [posts, setPosts] = useState([]);
    const [editingPostId, setEditingPostId] = useState(null);
    const [editContent, setEditContent] = useState("");
    const [openMenuId, setOpenMenuId] = useState(null);


    const loadPosts = async () => {
        if (!user?.barangay_id) return;


        const result = await getPostsByBarangay(user.barangay_id);

        if (result.success) {
            setPosts(result.data);
        }
    };

    useEffect(() => {
        loadPosts();
    }, [user]);

    const handleCreatePost = async (e) => {
        e.preventDefault();

        if (!content.trim()) {
            alert("Post content is required");
            return;
        }

        const result = await createPost({ content });

        if (result.success) {
            setContent("");
            loadPosts();
        } else {
            alert(result.message);
        }
    };

    const startEditPost = (post) => {
        setEditingPostId(post.id);
        setEditContent(post.content);
    };

    const cancelEditPost = () => {
        setEditingPostId(null);
        setEditContent("");
    };

    const handleUpdatePost = async (postId) => {
        if (!editContent.trim()) {
            alert("Post content is required");
            return;
        }

        const result = await updatePost({
            post_id: postId,
            content: editContent,
        });

        if (result.success) {
            setEditingPostId(null);
            setEditContent("");
            loadPosts();
        } else {
            alert(result.message);
        }
    };

    const handleDeletePost = async (postId) => {
        const confirmed = window.confirm("Delete this post?");
        if (!confirmed) return;

        const result = await deletePost(postId);

        if (result.success) {
            loadPosts();
        } else {
            alert(result.message);
        }
    };

    return (
        <div className="feed-layout">
            <section className="feed-main">
                <SearchBar />
                <div className="composer-card">
                    <h2>Barangay Feed</h2>
                    <form onSubmit={handleCreatePost}>
                        <textarea
                            placeholder="What’s happening in your community?"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                        <div className="composer-actions">
                            <button type="submit">Post</button>
                        </div>
                    </form>
                </div>

                <div className="posts-list">
                    {posts.length === 0 ? (
                        <div className="post-card">
                            <p>No posts yet.</p>
                        </div>
                    ) : (
                        posts.map((post) => {
                            const isOwner = Number(user?.id) === Number(post.user_id);

                            const badge =
                                post.official_role &&
                                    post.official_role_verified &&
                                    officialRoleMeta[post.official_role]
                                    ? officialRoleMeta[post.official_role]
                                    : null;

                            return (
                                <article className="post-card" key={post.id}>
                                    <div className="post-card__header">

                                        <div className="post-card__identity">
                                            {badge && (
                                                <div>
                                                    <span className={badge.className}>
                                                        {badge.label}
                                                    </span>
                                                </div>
                                            )}
                                            <h4>{post.first_name} {post.last_name}</h4>
                                            <span className="post-card__username">@{post.username}</span>
                                        </div>

                                        {isOwner && (
                                            <div className="post-menu">
                                                <button
                                                    type="button"
                                                    className="menu-trigger"
                                                    onClick={() =>
                                                        setOpenMenuId(openMenuId === post.id ? null : post.id)
                                                    }
                                                >
                                                    ⋮
                                                </button>

                                                {openMenuId === post.id && (
                                                    <div className="menu-dropdown">
                                                        <button type="button" onClick={() => startEditPost(post)}>
                                                            Edit
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="danger"
                                                            onClick={() => handleDeletePost(post.id)}
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {editingPostId === post.id ? (
                                        <div className="edit-box">
                                            <textarea
                                                value={editContent}
                                                onChange={(e) => setEditContent(e.target.value)}
                                            />
                                            <div className="edit-actions">
                                                <button type="button" onClick={() => handleUpdatePost(post.id)}>
                                                    Save
                                                </button>
                                                <button type="button" className="secondary" onClick={cancelEditPost}>
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <p className="post-card__content">{post.content}</p>
                                            <small className="post-card__time">{post.created_at}</small>
                                        </>
                                    )}

                                    <CommentsSection postId={post.id} isLoggedIn={!!user} />
                                </article>
                            );
                        })
                    )}
                </div>
            </section>

            <aside className="feed-sidebar right">
                <div className="sidebar-card">
                    <h3>Community</h3>
                    <p><strong>User:</strong> {user?.username}</p>
                    <p><strong>Role:</strong> {user?.role}</p>
                    <p><strong>Barangay ID:</strong> {user?.barangay_id}</p>
                </div>

                <div className="sidebar-card" style={{ marginTop: "16px" }}>
                    <h3>About KOMU</h3>
                    <p>Local discussions, announcements, and community updates.</p>
                </div>
            </aside>
        </div>
    );
}