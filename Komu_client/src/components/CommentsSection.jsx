import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
    createComment,
    getCommentsByPost,
    updateComment,
    deleteComment,
} from "../services/commentService";
import "../assets/comments.css";

export default function CommentsSection({ postId, isLoggedIn }) {
    const { user } = useAuth();

    const [comments, setComments] = useState([]);
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);

    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editContent, setEditContent] = useState("");

    const loadComments = async () => {
        const result = await getCommentsByPost(postId);

        if (result.success) {
            setComments(result.data);
        }
    };

    useEffect(() => {
        loadComments();
    }, [postId]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!content.trim()) {
            alert("Comment is required");
            return;
        }

        setLoading(true);

        const result = await createComment({
            post_id: postId,
            content,
        });

        setLoading(false);

        if (result.success) {
            setContent("");
            loadComments();
        } else {
            alert(result.message);
        }
    };

    const startEditComment = (comment) => {
        setEditingCommentId(comment.id);
        setEditContent(comment.content);
    };

    const cancelEditComment = () => {
        setEditingCommentId(null);
        setEditContent("");
    };

    const handleUpdateComment = async (commentId) => {
        if (!editContent.trim()) {
            alert("Comment is required");
            return;
        }

        const result = await updateComment({
            comment_id: commentId,
            content: editContent,
        });

        if (result.success) {
            setEditingCommentId(null);
            setEditContent("");
            loadComments();
        } else {
            alert(result.message);
        }
    };

    const handleDeleteComment = async (commentId) => {
        const confirmed = window.confirm("Delete this comment?");
        if (!confirmed) return;

        const result = await deleteComment(commentId);

        if (result.success) {
            loadComments();
        } else {
            alert(result.message);
        }
    };

    return (
        <div className="comments">
            <h5 className="comments__title">Comments</h5>

            {isLoggedIn && (
                <form className="comments__form" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Write a comment..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />
                    <button type="submit" disabled={loading}>
                        {loading ? "Posting..." : "Comment"}
                    </button>
                </form>
            )}

            <div className="comments__list">
                {comments.length === 0 ? (
                    <p className="comments__empty">No comments yet.</p>
                ) : (
                    comments.map((comment) => {
                        const isOwner = Number(user?.id) === Number(comment.user_id);

                        return (
                            <div className="comment-item" key={comment.id}>
                                <div className="comment-item__header">
                                    <div className="comment-author">
                                        <strong>
                                            {comment.first_name} {comment.last_name}
                                        </strong>
                                        <span>@{comment.username}</span>
                                    </div>

                                    {isOwner && (
                                        <div className="comment-actions">
                                            <button onClick={() => startEditComment(comment)}>Edit</button>
                                            <button
                                                className="danger"
                                                onClick={() => handleDeleteComment(comment.id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {editingCommentId === comment.id ? (
                                    <div className="edit-box">
                                        <input
                                            type="text"
                                            value={editContent}
                                            onChange={(e) => setEditContent(e.target.value)}
                                        />
                                        <div className="edit-actions">
                                            <button onClick={() => handleUpdateComment(comment.id)}>
                                                Save
                                            </button>
                                            <button className="secondary" onClick={cancelEditComment}>
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <p className="comment-item__content">{comment.content}</p>
                                        <small className="comment-item__time">{comment.created_at}</small>
                                    </>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}