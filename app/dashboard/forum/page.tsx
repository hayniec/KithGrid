"use client";

import { useState } from "react";
import styles from "./forum.module.css";
import { MessageSquare, Heart, Share2, Send, MessageCircle, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { ForumPost, ForumCategory, ForumComment } from "@/types/forum";

export default function ForumPage() {
    const router = useRouter();
    const [newPost, setNewPost] = useState("");
    const [activeCategory, setActiveCategory] = useState<ForumCategory | "All">("All");
    const [newPostCategory, setNewPostCategory] = useState<ForumCategory>("General");
    const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
    const [newComment, setNewComment] = useState("");

    const [posts, setPosts] = useState<ForumPost[]>([
        {
            id: 1,
            author: "Sarah Jenkins",
            initials: "SJ",
            content: "Has anyone else noticed the streetlights on Maple Drive flickering lately? Just wanted to check before I report it.",
            timestamp: "2 hours ago",
            likes: 5,
            comments: [
                { id: "c1", authorId: "mc", authorName: "Mike Chen", content: "Yes! The one in front of my house has been doing it for days.", timestamp: "1 hour ago" },
                { id: "c2", authorId: "er", authorName: "Emily R.", content: "I called the city yesterday, they said they'd check it out.", timestamp: "30 mins ago" }
            ],
            category: "Safety"
        },
        {
            id: 2,
            author: "Mike Chen",
            initials: "MC",
            content: "Just a reminder that the annual block party planning meeting is this Saturday at the community center! We need volunteers for the grill station.",
            timestamp: "5 hours ago",
            likes: 12,
            comments: [],
            category: "Events"
        },
        {
            id: 3,
            author: "Emily Rodriguez",
            initials: "ER",
            content: "Found a set of keys near the park entrance. Describe them and I'll drop them off!",
            timestamp: "1 day ago",
            likes: 8,
            comments: [],
            category: "Lost & Found"
        }
    ]);

    const handlePost = () => {
        if (!newPost.trim()) return;

        const post: ForumPost = {
            id: Date.now(),
            author: "Eric H.",
            initials: "EH",
            content: newPost,
            timestamp: "Just now",
            likes: 0,
            comments: [],
            category: newPostCategory
        };

        setPosts([post, ...posts]);
        setNewPost("");
        setNewPostCategory("General");
    };

    const handleComment = () => {
        if (!selectedPost || !newComment.trim()) return;

        const comment: ForumComment = {
            id: Date.now().toString(),
            authorId: "me",
            authorName: "Eric H.",
            content: newComment,
            timestamp: "Just now"
        };

        const updatedPost = {
            ...selectedPost,
            comments: Array.isArray(selectedPost.comments) ? [...selectedPost.comments, comment] : [comment]
        };

        setPosts(posts.map(p => p.id === selectedPost.id ? updatedPost : p));
        setSelectedPost(updatedPost);
        setNewComment("");
    };

    const handleLike = (e: React.MouseEvent, postId: string | number) => {
        e.stopPropagation();

        const updateLike = (post: ForumPost) => {
            if (post.id !== postId) return post;
            const isLiked = !!post.likedByMe;
            return {
                ...post,
                likes: isLiked ? post.likes - 1 : post.likes + 1,
                likedByMe: !isLiked
            };
        };

        const newPosts = posts.map(updateLike);
        setPosts(newPosts);

        if (selectedPost && selectedPost.id === postId) {
            setSelectedPost(updateLike(selectedPost));
        }
    };

    const handleMessageUser = (e: React.MouseEvent, userName: string) => {
        e.stopPropagation();
        router.push(`/dashboard/messages?to=${encodeURIComponent(userName)}`);
    };

    const filteredPosts = activeCategory === "All"
        ? posts
        : posts.filter(post => post.category === activeCategory);

    const categories: (ForumCategory | "All")[] = ["All", "General", "Safety", "Events", "Lost & Found", "Recommendations"];
    const postCategories: ForumCategory[] = ["General", "Safety", "Events", "Lost & Found", "Recommendations"];

    return (
        <div style={{ paddingBottom: '3rem' }}>
            {/* Post Details Modal */}
            {selectedPost && (
                <div className={styles.modalOverlay} onClick={() => setSelectedPost(null)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <div className={styles.modalTitle}>Post Details</div>
                            <button className={styles.closeButton} onClick={() => setSelectedPost(null)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.postHeader}>
                                <div className={styles.author}>
                                    <div className={styles.avatar}>{selectedPost.initials}</div>
                                    <div className={styles.authorInfo}>
                                        <div className={styles.authorName}>{selectedPost.author}</div>
                                        <div className={styles.timestamp}>{selectedPost.timestamp}</div>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.postCategoryTag}>{selectedPost.category}</div>
                            <div className={styles.postContent} style={{ fontSize: '1.05rem' }}>{selectedPost.content}</div>

                            <div className={styles.commentSection}>
                                <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Comments ({Array.isArray(selectedPost.comments) ? selectedPost.comments.length : 0})</h3>
                                <div className={styles.commentsList}>
                                    {Array.isArray(selectedPost.comments) && selectedPost.comments.map(comment => (
                                        <div key={comment.id} className={styles.comment}>
                                            <div className={styles.commentAvatar}>{comment.authorName.charAt(0)}</div>
                                            <div className={styles.commentContent}>
                                                <div className={styles.commentAuthor}>
                                                    {comment.authorName}
                                                    <span className={styles.commentTime}>{comment.timestamp}</span>
                                                </div>
                                                <div>{comment.content}</div>
                                            </div>
                                        </div>
                                    ))}
                                    {(!Array.isArray(selectedPost.comments) || selectedPost.comments.length === 0) && (
                                        <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem', fontStyle: 'italic' }}>No comments yet. Be the first!</p>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className={styles.commentInputArea}>
                            <div className={styles.commentInputWrapper}>
                                <input
                                    className={styles.commentInput}
                                    placeholder="Write a comment..."
                                    value={newComment}
                                    onChange={e => setNewComment(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleComment()}
                                    autoFocus
                                />
                                <button className={styles.sendCommentButton} onClick={handleComment}>
                                    <Send size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className={styles.feed}>
                <div style={{ marginBottom: '1rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Community Forum</h1>
                    <p style={{ color: 'var(--muted-foreground)' }}>Discuss neighborhood matters, ask questions, and share updates.</p>
                </div>

                {/* Category Filter */}
                <div className={styles.categoryFilter}>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            className={`${styles.filterPill} ${activeCategory === cat ? styles.activeFilter : ''}`}
                            onClick={() => setActiveCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Create Post Widget */}
                <div className={styles.createPost}>
                    <textarea
                        className={styles.postInput}
                        placeholder="What's on your mind, Eric?"
                        value={newPost}
                        onChange={e => setNewPost(e.target.value)}
                    />
                    <div className={styles.postActions}>
                        <select
                            className={styles.selectCategory}
                            value={newPostCategory}
                            onChange={(e) => setNewPostCategory(e.target.value as ForumCategory)}
                        >
                            {postCategories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                        <button className={styles.button} onClick={handlePost}>Post Update</button>
                    </div>
                </div>

                {/* Feed */}
                {filteredPosts.map(post => (
                    <div
                        key={post.id}
                        className={styles.post}
                        onClick={() => setSelectedPost(post)}
                    >
                        <div className={styles.postHeader}>
                            <div className={styles.author}>
                                <div className={styles.avatar}>{post.initials}</div>
                                <div className={styles.authorInfo}>
                                    <div className={styles.authorName}>{post.author}</div>
                                    <div className={styles.timestamp}>{post.timestamp}</div>
                                </div>
                            </div>
                            {post.author !== "Eric H." && (
                                <button
                                    className={styles.messageButton}
                                    onClick={(e) => handleMessageUser(e, post.author)}
                                >
                                    <MessageCircle size={14} />
                                    Message
                                </button>
                            )}
                        </div>

                        <div className={styles.postCategoryTag}>
                            {post.category}
                        </div>

                        <div className={styles.postContent}>
                            {post.content}
                        </div>
                        <div className={styles.postFooter}>
                            <button
                                className={styles.actionButton}
                                onClick={(e) => handleLike(e, post.id)}
                                style={{ color: post.likedByMe ? '#ef4444' : undefined }}
                            >
                                <Heart size={18} fill={post.likedByMe ? "currentColor" : "none"} />
                                {post.likes} Likes
                            </button>
                            <button className={styles.actionButton}>
                                <MessageSquare size={18} />
                                {Array.isArray(post.comments) ? post.comments.length : post.comments} Comments
                            </button>
                            <button className={styles.actionButton}>
                                <Share2 size={18} />
                                Share
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
