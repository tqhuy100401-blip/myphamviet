import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import logger from "../utils/logger";

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    
    if (token) {
      const newSocket = io("http://localhost:5002", {
        auth: { token }
      });

      newSocket.on("connect", () => {
        logger.success("Socket connected");
        setIsConnected(true);
      });

      newSocket.on("disconnect", () => {
        logger.info("Socket disconnected");
        setIsConnected(false);
      });

      newSocket.on("connect_error", (error) => {
        logger.error("Socket connection error:", error);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
