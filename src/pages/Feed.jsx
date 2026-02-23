import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { BASE_URL } from '../constants/commonData';
import { addFeed, removeFeed } from '../redux/feedSlice';
import UserCard from '../components/UserCard';
import './Feed.css';

const Feed = () => {
    const feed = useSelector(store => store.feed);
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);

    const fetchFeed = async () => {
        if (feed) return;
        setLoading(true);
        try {
            const res = await axios.get(BASE_URL + '/user/feed', { withCredentials: true });
            console.log(res.data);
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

    const handleAction = async (status, userId) => {
        try {
            await axios.post(
                `${BASE_URL}/request/send/${status}/${userId}`,
                {},
                { withCredentials: true }
            );
        } catch (error) {
            console.error('Action error:', error);
        }

        // Advance to next card
        const newFeed = feed.slice(1);
        if (newFeed.length === 0) {
            dispatch(removeFeed());
        } else {
            dispatch(addFeed(newFeed));
        }
    };

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
            <div className="feed-card-wrap" key={currentUser._id}>
                <UserCard
                    user={currentUser}
                    actions={
                        <div className="feed-actions">
                            <button
                                className="feed-action-btn feed-btn-pass"
                                onClick={() => handleAction('ignored', currentUser._id)}
                                title="Pass"
                            >
                                {passIcon}
                            </button>
                            <button
                                className="feed-action-btn feed-btn-like"
                                onClick={() => handleAction('interested', currentUser._id)}
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