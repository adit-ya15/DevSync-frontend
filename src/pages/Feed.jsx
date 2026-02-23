import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { BASE_URL } from '../constants/commonData';
import { addFeed, removeFeed } from '../redux/feedSlice';
import UserCard from '../components/UserCard';
import './Feed.css';
import toast from 'react-hot-toast';

const SWIPE_THRESHOLD = 120;
const VELOCITY_THRESHOLD = 0.5;
const FLY_DURATION = 350;

const Feed = () => {
    const feed = useSelector(store => store.feed);
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [swiping, setSwiping] = useState(false);

    // Refs for smooth DOM manipulation (no re-renders during drag)
    const cardRef = useRef(null);
    const likeStampRef = useRef(null);
    const nopeStampRef = useRef(null);
    const isDragging = useRef(false);
    const startPos = useRef({ x: 0, y: 0 });
    const currentPos = useRef({ x: 0, y: 0 });
    const velocity = useRef({ x: 0, y: 0 });
    const lastPos = useRef({ x: 0, y: 0 });
    const lastTime = useRef(0);
    const rafId = useRef(null);

    const fetchFeed = async () => {
        if (feed) return;
        setLoading(true);
        try {
            const res = await axios.get(BASE_URL + '/user/feed', { withCredentials: true });
            dispatch(addFeed(res.data?.feed || res.data?.data || []));
        } catch (error) {
            console.error('Feed fetch error:', error);
            toast.error('Failed to load feed');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchFeed(); }, []);

    const advanceFeed = useCallback(() => {
        const newFeed = feed.slice(1);
        if (newFeed.length === 0) {
            dispatch(removeFeed());
        } else {
            dispatch(addFeed(newFeed));
        }
    }, [feed, dispatch]);

    const sendAction = useCallback(async (status, userId) => {
        try {
            await axios.post(
                `${BASE_URL}/request/send/${status}/${userId}`,
                {},
                { withCredentials: true }
            );
        } catch (error) {
            console.error('Action error:', error);
            toast.error('Action failed. Try again.');
        }
    }, []);

    // ── Apply transform directly to DOM (60fps) ──
    const applyTransform = useCallback((x, y) => {
        if (!cardRef.current) return;
        const rotation = x * 0.1;
        cardRef.current.style.transform =
            `translate3d(${x}px, ${y}px, 0) rotate(${rotation}deg)`;

        // Stamp opacity
        const progress = Math.abs(x) / SWIPE_THRESHOLD;
        if (likeStampRef.current) {
            likeStampRef.current.style.opacity = x > 0 ? Math.min(progress, 1) : 0;
        }
        if (nopeStampRef.current) {
            nopeStampRef.current.style.opacity = x < 0 ? Math.min(progress, 1) : 0;
        }
    }, []);

    // ── Fly card off screen ──
    const flyOff = useCallback((direction) => {
        if (!cardRef.current || swiping) return;
        setSwiping(true);

        const card = cardRef.current;
        const flyX = direction === 'right' ? window.innerWidth * 1.5 : -window.innerWidth * 1.5;
        const flyRotation = direction === 'right' ? 30 : -30;

        card.style.transition = `transform ${FLY_DURATION}ms cubic-bezier(0.2, 0, 0.2, 1), opacity ${FLY_DURATION}ms ease`;
        card.style.transform = `translate3d(${flyX}px, -50px, 0) rotate(${flyRotation}deg)`;
        card.style.opacity = '0';

        // Show the correct stamp
        if (likeStampRef.current) likeStampRef.current.style.opacity = direction === 'right' ? '1' : '0';
        if (nopeStampRef.current) nopeStampRef.current.style.opacity = direction === 'left' ? '1' : '0';

        const currentUser = feed?.[0];
        if (currentUser) {
            sendAction(direction === 'right' ? 'interested' : 'ignored', currentUser._id);
        }

        setTimeout(() => {
            setSwiping(false);
            advanceFeed();
        }, FLY_DURATION);
    }, [feed, advanceFeed, sendAction, swiping]);

    // ── Spring back to center ──
    const snapBack = useCallback(() => {
        if (!cardRef.current) return;
        const card = cardRef.current;
        card.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s ease';
        card.style.transform = 'translate3d(0, 0, 0) rotate(0deg)';
        if (likeStampRef.current) {
            likeStampRef.current.style.transition = 'opacity 0.3s ease';
            likeStampRef.current.style.opacity = '0';
        }
        if (nopeStampRef.current) {
            nopeStampRef.current.style.transition = 'opacity 0.3s ease';
            nopeStampRef.current.style.opacity = '0';
        }
    }, []);

    // ── Pointer handlers ──
    const getEventPos = (e) => {
        if (e.touches) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
        return { x: e.clientX, y: e.clientY };
    };

    const handleStart = useCallback((e) => {
        if (swiping) return;
        const pos = getEventPos(e);
        isDragging.current = true;
        startPos.current = pos;
        currentPos.current = { x: 0, y: 0 };
        lastPos.current = pos;
        lastTime.current = Date.now();
        velocity.current = { x: 0, y: 0 };

        if (cardRef.current) {
            cardRef.current.style.transition = 'none';
        }
        if (likeStampRef.current) likeStampRef.current.style.transition = 'none';
        if (nopeStampRef.current) nopeStampRef.current.style.transition = 'none';
    }, [swiping]);

    const handleMove = useCallback((e) => {
        if (!isDragging.current || swiping) return;
        e.preventDefault();

        const pos = getEventPos(e);
        const now = Date.now();
        const dt = now - lastTime.current;

        if (dt > 0) {
            velocity.current = {
                x: (pos.x - lastPos.current.x) / dt,
                y: (pos.y - lastPos.current.y) / dt,
            };
        }

        lastPos.current = pos;
        lastTime.current = now;

        currentPos.current = {
            x: pos.x - startPos.current.x,
            y: (pos.y - startPos.current.y) * 0.4, // dampen vertical
        };

        // Use rAF for smooth frame updates
        if (rafId.current) cancelAnimationFrame(rafId.current);
        rafId.current = requestAnimationFrame(() => {
            applyTransform(currentPos.current.x, currentPos.current.y);
        });
    }, [applyTransform, swiping]);

    const handleEnd = useCallback(() => {
        if (!isDragging.current || swiping) return;
        isDragging.current = false;
        if (rafId.current) cancelAnimationFrame(rafId.current);

        const x = currentPos.current.x;
        const vx = velocity.current.x;

        // Check threshold OR velocity
        if (x > SWIPE_THRESHOLD || vx > VELOCITY_THRESHOLD) {
            flyOff('right');
        } else if (x < -SWIPE_THRESHOLD || vx < -VELOCITY_THRESHOLD) {
            flyOff('left');
        } else {
            snapBack();
        }
    }, [flyOff, snapBack, swiping]);

    // ── Event listeners (passive: false for touch-action) ──
    useEffect(() => {
        const card = cardRef.current;
        if (!card) return;

        const onTouchMove = (e) => handleMove(e);

        card.addEventListener('touchmove', onTouchMove, { passive: false });
        return () => {
            card.removeEventListener('touchmove', onTouchMove);
        };
    }, [handleMove, feed]);

    // Cleanup rAF on unmount
    useEffect(() => {
        return () => {
            if (rafId.current) cancelAnimationFrame(rafId.current);
        };
    }, []);

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
    const nextUser = feed[1] || null;

    return currentUser && (
        <div className="feed-page">
            <div className="feed-deck">
                {/* Next card (behind) */}
                {nextUser && (
                    <div className="feed-card-behind">
                        <UserCard user={nextUser} />
                    </div>
                )}

                {/* Current card (draggable) */}
                <div
                    className="feed-card-wrap"
                    key={currentUser._id}
                    ref={cardRef}
                    onMouseDown={handleStart}
                    onMouseMove={handleMove}
                    onMouseUp={handleEnd}
                    onMouseLeave={() => { if (isDragging.current) handleEnd(); }}
                    onTouchStart={handleStart}
                    onTouchEnd={handleEnd}
                >
                    {/* Stamp overlays */}
                    <div className="feed-stamp feed-stamp-like" ref={likeStampRef}>LIKE</div>
                    <div className="feed-stamp feed-stamp-nope" ref={nopeStampRef}>NOPE</div>

                    <UserCard
                        user={currentUser}
                        actions={
                            <div className="feed-actions">
                                <button
                                    className="feed-action-btn feed-btn-pass"
                                    onClick={(e) => { e.stopPropagation(); flyOff('left'); }}
                                    title="Pass"
                                >
                                    {passIcon}
                                </button>
                                <button
                                    className="feed-action-btn feed-btn-like"
                                    onClick={(e) => { e.stopPropagation(); flyOff('right'); }}
                                    title="Interested"
                                >
                                    {likeIcon}
                                </button>
                            </div>
                        }
                    />
                </div>
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