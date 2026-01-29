"use client";

import { useState } from "react";
import styles from "./messages.module.css";
import { Send, User } from "lucide-react";
import { DirectMessage } from "@/types/forum";

export default function MessagesPage() {
    const [activeChat, setActiveChat] = useState("Sarah Jenkins");
    const [newMessage, setNewMessage] = useState("");

    // Mock conversations
    const [conversations, setConversations] = useState([
        { id: "1", name: "Sarah Jenkins", lastMessage: "Thanks for borrowing the ladder!", unread: 2 },
        { id: "2", name: "Mike Chen", lastMessage: "Can you help me with the fence?", unread: 0 },
        { id: "3", name: "Emily Rodriguez", lastMessage: "See you at the meeting.", unread: 0 },
    ]);

    // Mock messages for the active chat
    const [messages, setMessages] = useState<DirectMessage[]>([
        { id: "m1", senderId: "2", senderName: "Sarah Jenkins", recipientId: "me", content: "Hey Eric! Do you still have that power drill?", timestamp: "10:30 AM", read: true },
        { id: "m2", senderId: "me", senderName: "Eric H.", recipientId: "2", content: "Yes I do! You can swing by anytime to grab it.", timestamp: "10:32 AM", read: true },
        { id: "m3", senderId: "2", senderName: "Sarah Jenkins", recipientId: "me", content: "Awesome, thanks! I'll be there in 30 mins.", timestamp: "10:35 AM", read: true },
    ]);

    const handleSendMessage = () => {
        if (!newMessage.trim()) return;

        const msg: DirectMessage = {
            id: Math.random().toString(36),
            senderId: "me",
            senderName: "Eric H.",
            recipientId: "active",
            content: newMessage,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            read: true
        };

        setMessages([...messages, msg]);
        setNewMessage("");
    };

    return (
        <div className={styles.container}>
            {/* Sidebar List */}
            <div className={styles.sidebar}>
                <div className={styles.sidebarHeader}>Messages</div>
                <div className={styles.conversationList}>
                    {conversations.map(conv => (
                        <div
                            key={conv.id}
                            className={`${styles.conversationItem} ${activeChat === conv.name ? styles.activeConversation : ''}`}
                            onClick={() => setActiveChat(conv.name)}
                        >
                            <div className={styles.conversationName}>{conv.name}</div>
                            <div className={styles.lastMessage}>{conv.lastMessage}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className={styles.chatArea}>
                <div className={styles.chatHeader}>
                    <User size={20} />
                    {activeChat}
                </div>

                <div className={styles.messagesList}>
                    {messages.map(msg => (
                        <div key={msg.id} className={`${styles.messageBubble} ${msg.senderId === 'me' ? styles.sent : styles.received}`}>
                            {msg.content}
                        </div>
                    ))}
                </div>

                <div className={styles.inputArea}>
                    <input
                        className={styles.input}
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                    />
                    <button className={styles.sendButton} onClick={handleSendMessage}>
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
