import { createSlice } from "@reduxjs/toolkit";

const requestSlice = createSlice({
    name: "requests",
    initialState: null,
    reducers: {
        addRequests: (state, action) => {
            return action.payload;
        },
        removeRequest: (state, action) => {
            if (!state) return state;
            return state.filter(req => req._id !== action.payload);
        },
        removeRequests: () => {
            return null;
        },
    },
});

export const { addRequests, removeRequest, removeRequests } = requestSlice.actions;
export default requestSlice.reducer;
