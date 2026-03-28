import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';

const ThemeProvider = ({ children }) => {
    const theme = useSelector(store => store.theme);

    useEffect(() => {
        // Apply theme to the root HTML element
        document.documentElement.setAttribute('data-theme', theme);
        
        // Let's also add it as a class for broader CSS support
        document.body.className = `${theme}-theme`;
    }, [theme]);

    return (
        <>
            {children}
        </>
    );
};

export default ThemeProvider;
