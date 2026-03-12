import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "./Premium.css";
import { BASE_URL } from "../constants/commonData";
import axios from "axios";

const Premium = () => {
    const user = useSelector((store) => store.user);
    const navigate = useNavigate();
    const [isUserPremium, setIsUserPremium] = useState(false);

    // Verify if user already has premium
    const verifyPremiumUser = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/premium/verify`, {
                withCredentials: true,
            });

            if (res.data.isPremium) {
                setIsUserPremium(true);
            }
        } catch (err) {
            console.error("Premium verification failed", err);
        }
    };

    useEffect(() => {
        verifyPremiumUser();
    }, []);

    // Verify payment after Razorpay success
    const verifyPayment = async (response) => {
        try {
            const res = await axios.post(
                `${BASE_URL}/payment/verify`,
                response,
                { withCredentials: true }
            );

            if (res.data.success) {
                toast.success("Payment successful 🎉");
                setIsUserPremium(true);
            }
        } catch (err) {
            console.error("Payment verification failed", err);
            toast.error("Payment verification failed");
        }
    };

    const handlePurchase = async (type) => {
        try {
            if (!user) {
                toast.error("Please login to purchase premium");
                navigate("/login");
                return;
            }

            if (isUserPremium) {
                toast("You already have premium!");
                return;
            }

            const order = await axios.post(
                `${BASE_URL}/payment/create`,
                { membershipType: type },
                { withCredentials: true }
            );

            const { amount, keyId, currency, notes, orderId } = order.data;

            if (!window.Razorpay) {
                toast.error("Payment system not loaded");
                return;
            }

            const options = {
                key: keyId,
                amount: amount,
                currency: currency,
                name: "DevSync",
                description: "Premium Membership",
                image: "https://www.devsync.com/logo.png",
                order_id: orderId,
                notes: notes,
                prefill: {
                    name: `${notes.firstName} ${notes.lastName}`,
                    email: notes.email,
                },
                theme: {
                    color: "#637214",
                },
                handler: verifyPayment,
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (err) {
            console.error("Payment creation failed", err);
            toast.error("Payment initialization failed");
        }
    };

    return (
        <div className="premium-page">
            <div className="premium-container max-w-7xl mx-auto">
                <div className="premium-header">
                    <h1>Stand Out on DevSync</h1>
                    <p>
                        Upgrade to get a verified badge, priority placement, and exclusive
                        profile features.
                    </p>
                </div>

                <div className="premium-card-wrapper">

                    {/* Verified Badge */}
                    <div className="premium-card featured">
                        <h2 className="premium-card-title">Verified Badge</h2>

                        <div className="premium-card-price">
                            ₹99 <span>/ lifetime</span>
                        </div>

                        <div className="verified-preview">
                            <span className="name">
                                {user ? `${user.firstName} ${user.lastName}` : "Alex Developer"}
                            </span>

                            <svg
                                className="verified-badge"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                            >
                                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                            </svg>
                        </div>

                        <ul className="premium-features" style={{ marginTop: "1.5rem" }}>
                            <li>
                                <CheckIcon />
                                <span>
                                    <strong>Blue Verified Checkmark</strong>
                                </span>
                            </li>

                            <li>
                                <CheckIcon />
                                <span>Show legitimacy to connections</span>
                            </li>

                            <li>
                                <CheckIcon />
                                <span>Stand out in search results</span>
                            </li>

                            <li>
                                <CheckIcon />
                                <span>One-time payment</span>
                            </li>
                        </ul>

                        <button
                            disabled={isUserPremium}
                            className="premium-action-btn primary"
                            onClick={() => handlePurchase("badge")}
                        >
                            {isUserPremium ? "Already Premium" : "Get Verified Now"}
                        </button>
                    </div>

                    {/* Pro Plan */}
                    <div className="premium-card">
                        <h2 className="premium-card-title">DevSync Pro</h2>

                        <div className="premium-card-price">
                            ₹249 <span>/ month</span>
                        </div>

                        <ul className="premium-features" style={{ marginTop: "2.5rem" }}>
                            <li>
                                <CheckIcon />
                                <span>Everything in Verified Badge</span>
                            </li>

                            <li>
                                <CheckIcon />
                                <span>See who requested you</span>
                            </li>

                            <li>
                                <CheckIcon />
                                <span>Unlimited connection requests</span>
                            </li>

                            <li>
                                <CheckIcon />
                                <span>Neon Profile Border</span>
                            </li>
                        </ul>

                        <button
                            disabled={isUserPremium}
                            className="premium-action-btn"
                            style={{
                                background: "var(--bg-default)",
                                color: "var(--text-primary)",
                                border: "1px solid var(--border-color)",
                            }}
                            onClick={() => handlePurchase("pro")}
                        >
                            {isUserPremium ? "Already Premium" : "Subscribe to Pro"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CheckIcon = () => (
    <svg
        className="feature-icon"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2.5}
        stroke="currentColor"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.5 12.75l6 6 9-13.5"
        />
    </svg>
);

export default Premium;