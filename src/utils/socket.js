import { io } from "socket.io-client";
import { SERVER_ORIGIN } from "../constants/commonData";

export const createSocketConnection = () => {
    return io(SERVER_ORIGIN, {
        withCredentials: true,
    });
};
