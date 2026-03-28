import { createSlice } from "@reduxjs/toolkit";

const getInitialTheme = () => {
    // Forcing light mode explicitly due to user preference.
    localStorage.removeItem("app-theme");
    return "light";
};

const themeSlice = createSlice({
    name: "theme",
    initialState: getInitialTheme(),
    reducers: {
        setTheme: (state, action) => {
            return "light";
        }
    }
});

export const { setTheme } = themeSlice.actions;
export default themeSlice.reducer;
