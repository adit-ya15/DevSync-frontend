import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import feedReducer from "./feedSlice";
import connectionReducer from "./connectionSlice";
import requestReducer from "./requestSlice";
import reelsReducer from "./reelsSlice";
import themeReducer from "./themeSlice";
import projectReducer from "./projectSlice";
import notificationReducer from "./notificationSlice";

const appStore = configureStore({
    reducer: {
        user: userReducer,
        feed: feedReducer,
        connections: connectionReducer,
        requests: requestReducer,
        reels: reelsReducer,
        theme: themeReducer,
        projects: projectReducer,
        notifications: notificationReducer,
    }
})

export default appStore;