import React, { useEffect, useRef, useState } from "react";
import ACTIONS from "../actions";
import {
  addDoc,
  collection,
  onSnapshot,
  query,
  orderBy,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase/Config";

const Chat = ({ socketRef, roomId, username, clients }) => {
  const endRef = useRef();
  const [messages, setMessages] = useState([]);
  const inputRef = useRef(null);
  const [unseenMessageCount, setUnseenMessageCount] = useState(0);
  const chatFormContainerRef = useRef(null);
  const messageRef = collection(db, `messages-${roomId}`);

  const deleteCollectionAfter8Hours = () => {
    const eightHoursInMillis = 8 * 60 * 60 * 1000; // 6 hours in milliseconds

    setTimeout(async () => {
      try {
        const q = query(messageRef);
        const snapshot = await getDocs(q);
        const batch = writeBatch(db);
        snapshot.forEach((doc) => {
          batch.delete(doc.ref);
        });
        await batch.commit();
        console.log(
          `Firestore collection messages-${roomId} deleted successfully after 8 hours.`
        );
      } catch (error) {
        console.error("Error deleting collection:", error);
      }
    }, eightHoursInMillis);
  };

  const openChatWindow = () => {
    if (chatFormContainerRef.current) {
      chatFormContainerRef.current.style.display = "block";
      setUnseenMessageCount(0); // Reset unseen message count when chat is opened
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const closeChatWindow = () => {
    if (chatFormContainerRef.current) {
      chatFormContainerRef.current.style.display = "none";
    }
  };

  const handleInputEnter = (event) => {
    if (event.key === "Enter") {
      sendMessage();
    }
  };

  const senderColorMap = {};

  const sendMessage = async () => {
    const messageContent = inputRef.current.value.trim();

    if (messageContent === "") {
      return;
    }

    const currentTime = getCurrentTime();
    const message = {
      content: messageContent,
      time: currentTime,
      sender: username,
    };
    setMessages((prevMessages) => [...prevMessages, message]);

    await addDoc(messageRef, {
      text: messageContent,
      createdAt: new Date(),
      user: username,
    });

    // Emit message to server via socket
    socketRef.current.emit(ACTIONS.SEND_MESSAGE, { roomId, message });

    // Clear input box after sending message
    inputRef.current.value = "";
  };

  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const amOrPm = hours >= 12 ? "pm" : "am";
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes}${amOrPm}`;
  };

  const getRandomColor = () => {
    const colors = [
      "#ff7f50",
      "#6495ed",
      "#32cd32",
      "#ffa500",
      "#8a2be2",
      "#ff69b4",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  useEffect(() => {
    if (!socketRef.current) return;
    deleteCollectionAfter8Hours();
    // Listen for incoming messages
    socketRef.current.on(ACTIONS.SEND_MESSAGE, ({ message }) => {
      if (!senderColorMap[message.sender]) {
        senderColorMap[message.sender] = getRandomColor();
      }
      message.color = senderColorMap[message.sender];
      setMessages((prevMessages) => [...prevMessages, message]); // Update messages state
      if (chatFormContainerRef.current.style.display === "none") {
        // Increment unseen message count when chat is closed
        setUnseenMessageCount((prevCount) => prevCount + 1);
      }
    });

    return () => {
      // Clean up event listener when component unmounts
      socketRef.current.off(ACTIONS.SEND_MESSAGE);
    };
  }, []);

  useEffect(() => {
    // Query to fetch messages for the current room, ordered by creation time
    const q = query(messageRef, orderBy("createdAt"));
    // Real-time listener for Firestore
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesFromFirestore = snapshot.docs.map((doc) => {
        const data = doc.data();
        const message = {
          content: data.text,
          time: getCurrentTime(new Date(data.createdAt.seconds * 1000)),
          sender: data.user,
        };
        if (!senderColorMap[message.sender]) {
          senderColorMap[message.sender] = getRandomColor();
        }
        message.color = senderColorMap[message.sender];
        return message;
      });

      setMessages(messagesFromFirestore);
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [roomId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      <button
        className="open-btn bg-[#09fcf6] text-black px-[9px] py-[12px] border rounded-[50px] border-none cursor-pointer fixed text-[16px] mr-[14px] flex items-center justify-center transition-all duration-300 bottom-6 right-[30px] md:w-[280px] w-[150px]"
        onClick={openChatWindow}
      >
        <i className="fa fa-comment text-[28px] mr-5"></i>chat
        {unseenMessageCount > 0 && (
          <span
            className="font-[500]"
            style={{ color: "red", marginLeft: "5px" }}
          >
            ({unseenMessageCount})
          </span>
        )}
      </button>
      <div
        className="fixed bottom-4 right-4 z-10 w-[320px] hidden"
        id="chat-form-container"
        ref={chatFormContainerRef}
      >
        <div className="form-container flex flex-col items-stretch max-w-[400px]">
          <div className="chat-window-head flex justify-between px-[16px] py-[14px]">
            <h4 className="text-black font-[500] cursor-pointer">
              <i className="fa fa-comment text-[24px] mr-[10px] cursor-pointer"></i>
              Chat Box
            </h4>
            <span
              className="cursor-pointer text-black"
              onClick={closeChatWindow}
            >
              <i className="fa fa-times"></i>
            </span>
          </div>

          <div className="msg-container overflow-auto">
            {messages.length === 0 ? (
              <p className="text-[grey] text-sm">No messages to display</p>
            ) : (
              messages.map((msg, index) => (
                <div key={index} className="msg mb-4">
                  <p
                    className="text-xs text-white"
                    style={{ maxWidth: "90%", wordWrap: "break-word" }}
                  >
                    <strong
                      className="text-[#DAC0A3]"
                      style={{ color: msg.color }}
                    >
                      {msg.sender}:
                    </strong>{" "}
                    {msg.content}
                  </p>
                  <span className="text-[10px] text-[grey]">{msg.time}</span>
                </div>
              ))
            )}
            <div ref={endRef}></div>
          </div>

          <div className="flex h-12 mb-4 px-[14px]">
            <div className="chat-box flex justify-between w-full overflow-hidden border border-solid rounded-[30px] border-[grey]">
              <input
                id="inputBox"
                ref={inputRef}
                className="w-[80%] p-1 h-[46px] pl-4 border-none rounded-[4px] focus:outline-none focus:bg-[#0a0e13] bg-[#0a0e13] text-white"
                type="text"
                placeholder="Type your message..."
                name="msg"
                onKeyUp={handleInputEnter}
              />
              <button type="button" className="clickbtn" onClick={sendMessage}>
                <i className="fa fa-chevron-circle-right send-btn"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Chat;
