import { createSlice } from "@reduxjs/toolkit";

const getInitialTheme = () => {
    const savedTheme = localStorage.getItem("app-theme");
    if (savedTheme) {
        return savedTheme;
    }
    return "light";
};

const themeSlice = createSlice({
    name: "theme",
    initialState: getInitialTheme(),
    reducers: {
        setTheme: (state, action) => {
            const newTheme = action.payload;
            localStorage.setItem("app-theme", newTheme);
            return newTheme;
        },
        toggleTheme: (state) => {
            const newTheme = state === "light" ? "dark" : "light";
            localStorage.setItem("app-theme", newTheme);
            return newTheme;
        }
    }
});

export const { setTheme, toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
