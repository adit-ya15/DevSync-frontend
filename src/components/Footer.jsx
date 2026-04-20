import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer 
            className="w-full py-2 mt-auto flex flex-col items-center justify-center gap-2 relative z-10 transition-colors"
            style={{ 
                background: 'var(--dashboard-glass-bg)', 
                borderTop: '1px solid var(--dashboard-glass-border-translucent)', 
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)'
            }}
        >
            <div className="flex flex-wrap justify-center gap-6 font-semibold text-sm">
                <Link to="/privacy" className="hover:text-purple-600 transition-colors" style={{ color: 'var(--dashboard-text-main)' }}>Privacy Policy</Link>
                <Link to="/terms" className="hover:text-purple-600 transition-colors" style={{ color: 'var(--dashboard-text-main)' }}>Terms of Service</Link>
                <Link to="/refund" className="hover:text-purple-600 transition-colors" style={{ color: 'var(--dashboard-text-main)' }}>Refund Policy</Link>
                <Link to="/contact" className="hover:text-purple-600 transition-colors" style={{ color: 'var(--dashboard-text-main)' }}>Contact Us</Link>
            </div>
            <p className="text-sm font-medium opacity-80" style={{ color: 'var(--dashboard-text-faint)' }}>
                Copyright © {new Date().getFullYear()} - All rights reserved by DevSync Ltd
            </p>
        </footer>
    );
};

export default Footer;
