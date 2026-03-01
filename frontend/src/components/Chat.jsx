import { useState, useEffect, useRef } from "react";
import { useSocket } from "../context/SocketContext";
import axiosClient from "../api/axiosClient";
import { toast } from "react-toastify";
import { FiSend, FiMessageCircle, FiX, FiUser, FiMinimize2, FiMaximize2 } from "react-icons/fi";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import logger from "../utils/logger";

function Chat() {
    const [unreadCount, setUnreadCount] = useState(0);
    const notificationSound = useRef(null);
  const { socket, isConnected } = useSocket();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const queryClient = useQueryClient();
  
  const currentUserId = localStorage.getItem("token") 
    ? JSON.parse(atob(localStorage.getItem("token").split('.')[1])).id 
    : null;
  const currentUserRole = localStorage.getItem("role");

  // Lấy danh sách conversations
  const { data: conversationsData } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => axiosClient.get("/chat/conversations").then(res => res.data),
    enabled: isOpen && !!socket,
    refetchInterval: 5000
  });

  // Lấy danh sách users (cho admin)
  const { data: usersData } = useQuery({
    queryKey: ["chat-users"],
    queryFn: () => axiosClient.get("/chat/users").then(res => res.data),
    enabled: isOpen && currentUserRole === "admin"
  });

  const conversations = conversationsData?.conversations || [];
  const users = usersData?.users || [];

  // Lấy tin nhắn khi chọn conversation
  useEffect(() => {
        // Lấy số tin nhắn chưa đọc
        if (socket && isOpen === false) {
          axiosClient.get("/chat/unread-count").then(res => setUnreadCount(res.data.count));
        }
    if (conversationId && socket) {
      axiosClient.get(`/chat/messages/${conversationId}`)
        .then(res => {
          setMessages(res.data.messages);
          socket.emit("join-conversation", conversationId);
          socket.emit("mark-read", conversationId);
        })
        .catch(err => {
          logger.error("Error loading messages:", err);
        });
    }
  }, [conversationId, socket]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    socket.on("new-message", (newMessage) => {
      if (newMessage.conversationId === conversationId) {
        setMessages(prev => [...prev, newMessage]);
        socket.emit("mark-read", conversationId);
      } else {
        toast.info(`Tin nhắn mới từ ${newMessage.sender.name || "người dùng"}`);
        setUnreadCount(c => c + 1);
        // Popup notification
        if (window.Notification && Notification.permission === "granted") {
          new Notification("Tin nhắn mới", { body: `Từ: ${newMessage.sender.name}` });
        }
        // Play sound
        if (notificationSound.current) notificationSound.current.play();
      }
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    });

    socket.on("user-typing", (data) => {
      if (data.conversationId === conversationId && data.userId !== currentUserId) {
        setIsTyping(true);
      }
    });

    socket.on("user-stop-typing", (data) => {
      if (data.conversationId === conversationId) {
        setIsTyping(false);
      }
    });

    return () => {
      socket.off("new-message");
      socket.off("user-typing");
      socket.off("user-stop-typing");
    };
  }, [socket, conversationId, currentUserId, queryClient]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !socket || !selectedUser) return;

    const receiverId = selectedUser._id;
    const newConversationId = [currentUserId, receiverId].sort().join("-");

    socket.emit("send-message", {
      receiverId,
      content: message.trim(),
      conversationId: newConversationId
    });

    setMessage("");
    socket.emit("stop-typing", { conversationId: newConversationId });
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    
    if (!socket || !selectedUser) return;

    const newConversationId = [currentUserId, selectedUser._id].sort().join("-");
    socket.emit("typing", { conversationId: newConversationId });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop-typing", { conversationId: newConversationId });
    }, 1000);
  };

  const handleSelectConversation = (conv) => {
    setSelectedUser(conv.otherUser);
    setConversationId(conv.conversationId);
    setMessages([]);
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    const newConversationId = [currentUserId, user._id].sort().join("-");
    setConversationId(newConversationId);
    setMessages([]);
  };

  if (!socket) return null;

  return (
    <>
      <audio ref={notificationSound} src="/notification.mp3" preload="auto" />
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setUnreadCount(0);
            if (window.Notification && Notification.permission !== "granted") {
              Notification.requestPermission();
            }
          }}
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #667eea, #764ba2)",
            color: "#fff",
            border: "none",
            boxShadow: "0 4px 20px rgba(102,126,234,0.4)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
            transition: "all 0.3s ease",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = "scale(1.1)";
            e.currentTarget.style.boxShadow = "0 6px 25px rgba(102,126,234,0.5)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "0 4px 20px rgba(102,126,234,0.4)";
          }}
        >
          <FiMessageCircle size={28} />
          {unreadCount > 0 && (
            <span style={{
              position: "absolute",
              top: 8,
              right: 8,
              background: "#f56565",
              color: "#fff",
              borderRadius: "50%",
              minWidth: 20,
              height: 20,
              fontSize: 12,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              zIndex: 1000
            }}>{unreadCount}</span>
          )}
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          position: "fixed",
          bottom: 0,
          right: 0,
          width: isMinimized ? "260px" : "360px",
          height: isMinimized ? "54px" : "520px",
          background: "#fff",
          borderTopLeftRadius: "18px",
          boxShadow: "-2px 0 32px rgba(0,0,0,0.18)",
          display: "flex",
          flexDirection: "column",
          zIndex: 9999,
          overflow: "hidden",
          transition: "all 0.3s cubic-bezier(.4,2,.6,1)",
          borderRight: 0,
          borderBottom: 0
        }}>
          {/* Header */}
          <div style={{
            background: "linear-gradient(135deg, #667eea, #764ba2)",
            color: "#fff",
            padding: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <FiMessageCircle size={20} />
              <h6 style={{ margin: 0, fontWeight: 700 }}>
                {selectedUser ? selectedUser.name : "Tin nhắn"}
              </h6>
              {!isConnected && (
                <span style={{ fontSize: "10px", opacity: 0.8 }}>(Offline)</span>
              )}
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  border: "none",
                  color: "#fff",
                  borderRadius: "8px",
                  padding: "6px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center"
                }}
              >
                {isMinimized ? <FiMaximize2 size={16} /> : <FiMinimize2 size={16} />}
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setSelectedUser(null);
                  setMessages([]);
                }}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  border: "none",
                  color: "#fff",
                  borderRadius: "8px",
                  padding: "6px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center"
                }}
              >
                <FiX size={16} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Body */}
              {!selectedUser ? (
                <div style={{ flex: 1, overflow: "auto", padding: "16px" }}>
                  <h6 style={{ marginBottom: "12px", fontSize: "14px", color: "#4a5568" }}>
                    Cuộc trò chuyện
                  </h6>
                  {conversations.length === 0 && currentUserRole !== "admin" && (
                    <p style={{ textAlign: "center", color: "#a0aec0", fontSize: "14px" }}>
                      Chưa có cuộc trò chuyện nào
                    </p>
                  )}
                  {conversations.map((conv) => (
                    <div
                      key={conv.conversationId}
                      onClick={() => handleSelectConversation(conv)}
                      style={{
                        padding: "12px",
                        background: "#f7fafc",
                        borderRadius: "12px",
                        marginBottom: "8px",
                        cursor: "pointer",
                        transition: "all 0.2s ease"
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = "#edf2f7";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = "#f7fafc";
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: "14px", marginBottom: "4px" }}>
                            {conv.otherUser.name}
                            {conv.otherUser.role === "admin" && (
                              <span style={{ 
                                marginLeft: "6px",
                                fontSize: "10px",
                                background: "#667eea",
                                color: "#fff",
                                padding: "2px 6px",
                                borderRadius: "4px"
                              }}>
                                Admin
                              </span>
                            )}
                          </div>
                          <div style={{ 
                            fontSize: "12px", 
                            color: "#718096",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap"
                          }}>
                            {conv.lastMessage.content}
                          </div>
                        </div>
                        {conv.unreadCount > 0 && (
                          <span style={{
                            background: "#f56565",
                            color: "#fff",
                            borderRadius: "50%",
                            width: "20px",
                            height: "20px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "10px",
                            fontWeight: 700
                          }}>
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Admin: List users */}
                  {currentUserRole === "admin" && users.length > 0 && (
                    <div style={{ maxHeight: "260px", overflowY: "auto" }}>
                      <h6 style={{ marginTop: "20px", marginBottom: "12px", fontSize: "14px", color: "#4a5568" }}>
                        Người dùng
                      </h6>
                      {users.map((user) => (
                        <div
                          key={user._id}
                          onClick={() => handleSelectUser(user)}
                          style={{
                            padding: "12px",
                            background: "#f7fafc",
                            borderRadius: "12px",
                            marginBottom: "8px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            transition: "all 0.2s ease"
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.background = "#edf2f7";
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.background = "#f7fafc";
                          }}
                        >
                          <FiUser size={18} color="#667eea" />
                          <div>
                            <div style={{ fontWeight: 600, fontSize: "14px" }}>
                              {user.name}
                            </div>
                            <div style={{ fontSize: "12px", color: "#718096" }}>
                              {user.email}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* Messages */}
                  <div style={{ 
                    flex: 1, 
                    overflow: "auto", 
                    padding: "16px",
                    background: "#f7fafc"
                  }}>
                    {messages.length === 0 && (
                      <p style={{ textAlign: "center", color: "#a0aec0", fontSize: "14px", marginTop: "20px" }}>
                        Bắt đầu cuộc trò chuyện
                      </p>
                    )}
                    {messages.map((msg, idx) => {
                      const isMine = msg.sender._id === currentUserId;
                      return (
                        <div
                          key={idx}
                          style={{
                            display: "flex",
                            justifyContent: isMine ? "flex-end" : "flex-start",
                            marginBottom: "12px"
                          }}
                        >
                          <div style={{
                            maxWidth: "70%",
                            padding: "10px 14px",
                            borderRadius: "16px",
                            background: isMine 
                              ? "linear-gradient(135deg, #667eea, #764ba2)"
                              : "#fff",
                            color: isMine ? "#fff" : "#2d3748",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                            fontSize: "14px",
                            wordBreak: "break-word"
                          }}>
                            {!isMine && (
                              <div style={{ 
                                fontSize: "11px", 
                                fontWeight: 600,
                                marginBottom: "4px",
                                opacity: 0.9
                              }}>
                                {msg.sender.name}
                              </div>
                            )}
                            {msg.content}
                            <div style={{ 
                              fontSize: "10px", 
                              marginTop: "4px",
                              opacity: 0.7
                            }}>
                              {new Date(msg.createdAt).toLocaleTimeString("vi-VN", {
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {isTyping && (
                      <div style={{ fontSize: "12px", color: "#718096", fontStyle: "italic" }}>
                        Đang nhập...
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <form onSubmit={handleSendMessage} style={{ 
                    padding: "12px",
                    borderTop: "1px solid #e2e8f0",
                    display: "flex",
                    gap: "8px"
                  }}>
                    <input
                      type="text"
                      value={message}
                      onChange={handleTyping}
                      placeholder="Nhập tin nhắn..."
                      style={{
                        flex: 1,
                        padding: "10px 14px",
                        border: "2px solid #e2e8f0",
                        borderRadius: "12px",
                        fontSize: "14px",
                        outline: "none",
                        transition: "all 0.2s ease"
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#667eea";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#e2e8f0";
                      }}
                    />
                    <button
                      type="submit"
                      disabled={!message.trim()}
                      style={{
                        padding: "10px 16px",
                        background: message.trim() 
                          ? "linear-gradient(135deg, #667eea, #764ba2)"
                          : "#e2e8f0",
                        color: message.trim() ? "#fff" : "#a0aec0",
                        border: "none",
                        borderRadius: "12px",
                        cursor: message.trim() ? "pointer" : "not-allowed",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <FiSend size={16} />
                    </button>
                  </form>
                  
                  {/* Back button */}
                  <button
                    onClick={() => {
                      setSelectedUser(null);
                      setMessages([]);
                    }}
                    style={{
                      width: "100%",
                      padding: "10px",
                      background: "#f7fafc",
                      border: "none",
                      color: "#667eea",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.2s ease"
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = "#edf2f7";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = "#f7fafc";
                    }}
                  >
                    ← Quay lại
                  </button>
                </>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
}

export default Chat;
