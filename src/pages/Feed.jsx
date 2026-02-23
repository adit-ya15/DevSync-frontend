import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { BASE_URL } from '../constants/commonData';
import { addFeed, removeFeed } from '../redux/feedSlice';
import UserCard from '../components/UserCard';
import './Feed.css';

const SWIPE_THRESHOLD = 100; // px to trigger action
const FLY_DURATION = 400;    // ms for fly-off animation

const Feed = () => {
    const feed = useSelector(store => store.feed);
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);

    // Swipe state
    const [dragX, setDragX] = useState(0);
    const [dragging, setDragging] = useState(false);
    const [flyDirection, setFlyDirection] = useState(null); // 'left' | 'right' | null
    const startX = useRef(0);
    const cardRef = useRef(null);

    const fetchFeed = async () => {
        if (feed) return;
        setLoading(true);
        try {
            const res = await axios.get(BASE_URL + '/user/feed', { withCredentials: true });
            dispatch(addFeed(res.data?.feed || res.data?.data || []));
        } catch (error) {
            console.error('Feed fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeed();
    }, []);

    const advanceFeed = useCallback(() => {
        const newFeed = feed.slice(1);
        if (newFeed.length === 0) {
            dispatch(removeFeed());
        } else {
            dispatch(addFeed(newFeed));
        }
    }, [feed, dispatch]);

    const handleAction = useCallback(async (status, userId, direction) => {
        // Fly the card off screen
        setFlyDirection(direction);

        try {
            await axios.post(
                `${BASE_URL}/request/send/${status}/${userId}`,
                {},
                { withCredentials: true }
            );
        } catch (error) {
            console.error('Action error:', error);
        }

        // Wait for fly animation, then advance
        setTimeout(() => {
            setFlyDirection(null);
            setDragX(0);
            advanceFeed();
        }, FLY_DURATION);
    }, [advanceFeed]);

    // ── Pointer handlers ──
    const onPointerDown = (e) => {
        if (flyDirection) return;
        setDragging(true);
        startX.current = e.clientX || e.touches?.[0]?.clientX || 0;
        if (cardRef.current) cardRef.current.style.transition = 'none';
    };

    const onPointerMove = (e) => {
        if (!dragging || flyDirection) return;
        const clientX = e.clientX || e.touches?.[0]?.clientX || 0;
        const dx = clientX - startX.current;
        setDragX(dx);
    };

    const onPointerUp = () => {
        if (!dragging || flyDirection) return;
        setDragging(false);
        if (cardRef.current) cardRef.current.style.transition = '';

        const currentUser = feed?.[0];
        if (!currentUser) return;

        if (dragX > SWIPE_THRESHOLD) {
            handleAction('interested', currentUser._id, 'right');
        } else if (dragX < -SWIPE_THRESHOLD) {
            handleAction('ignored', currentUser._id, 'left');
        } else {
            setDragX(0); // snap back
        }
    };

    // ── Touch handlers ──
    const onTouchStart = (e) => {
        if (flyDirection) return;
        setDragging(true);
        startX.current = e.touches[0].clientX;
        if (cardRef.current) cardRef.current.style.transition = 'none';
    };

    const onTouchMove = (e) => {
        if (!dragging || flyDirection) return;
        const dx = e.touches[0].clientX - startX.current;
        setDragX(dx);
    };

    const onTouchEnd = () => onPointerUp();

    // ── Compute card transform ──
    const rotation = dragging || flyDirection ? dragX * 0.08 : 0;
    const likeOpacity = Math.min(Math.max(dragX / SWIPE_THRESHOLD, 0), 1);
    const nopeOpacity = Math.min(Math.max(-dragX / SWIPE_THRESHOLD, 0), 1);

    let cardStyle = {};
    if (flyDirection === 'right') {
        cardStyle = {
            transform: `translateX(120vw) rotate(25deg)`,
            transition: `transform ${FLY_DURATION}ms ease-out, opacity ${FLY_DURATION}ms ease-out`,
            opacity: 0,
        };
    } else if (flyDirection === 'left') {
        cardStyle = {
            transform: `translateX(-120vw) rotate(-25deg)`,
            transition: `transform ${FLY_DURATION}ms ease-out, opacity ${FLY_DURATION}ms ease-out`,
            opacity: 0,
        };
    } else {
        cardStyle = {
            transform: `translateX(${dragX}px) rotate(${rotation}deg)`,
            transition: dragging ? 'none' : 'transform 0.3s ease, opacity 0.3s ease',
        };
    }

    /* ── Loading state ── */
    if (loading) {
        return (
            <div className="feed-page">
                <div className="feed-loading">
                    <div className="feed-spinner" />
                </div>
            </div>
        );
    }

    /* ── Empty / end of feed ── */
    if (!feed || feed.length === 0) {
        return (
            <div className="feed-page">
                <div className="feed-empty">
                    <span className="feed-empty-icon">🚀</span>
                    <h2 className="feed-empty-title">No new developers</h2>
                    <p className="feed-empty-text">
                        You&apos;ve seen everyone for now. Check back later for new connections!
                    </p>
                </div>
            </div>
        );
    }

    const currentUser = feed[0];

    return currentUser && (
        <div className="feed-page">
            <div
                className="feed-card-wrap"
                key={currentUser._id}
                ref={cardRef}
                style={cardStyle}
                onMouseDown={onPointerDown}
                onMouseMove={onPointerMove}
                onMouseUp={onPointerUp}
                onMouseLeave={() => { if (dragging) onPointerUp(); }}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            >
                {/* Swipe stamp overlays */}
                <div className="feed-stamp feed-stamp-like" style={{ opacity: likeOpacity }}>
                    LIKE
                </div>
                <div className="feed-stamp feed-stamp-nope" style={{ opacity: nopeOpacity }}>
                    NOPE
                </div>

                <UserCard
                    user={currentUser}
                    actions={
                        <div className="feed-actions">
                            <button
                                className="feed-action-btn feed-btn-pass"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleAction('ignored', currentUser._id, 'left');
                                }}
                                title="Pass"
                            >
                                {passIcon}
                            </button>
                            <button
                                className="feed-action-btn feed-btn-like"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleAction('interested', currentUser._id, 'right');
                                }}
                                title="Interested"
                            >
                                {likeIcon}
                            </button>
                        </div>
                    }
                />
            </div>
        </div>
    );
};

/* ── Icons ── */
const passIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
);

const likeIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
        <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
    </svg>
);

export default Feed;