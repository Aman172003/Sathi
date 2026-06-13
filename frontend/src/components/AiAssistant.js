import React, { useEffect, useRef, useState } from "react";
import ACTIONS from "../actions";

const AiAssistant = ({
  socketRef,
  roomId,
  username,
  code,
  language,
  output,
  clients,
}) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [showAssistant, setShowAssistant] = useState(false);
  const messagesEndRef = useRef(null);
  const assistantContainerRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Listen for AI assistant responses
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    // Handle streamed chunks
    socket.on(ACTIONS.AGENT_RESPONSE_STREAM, ({ chunk, socketId }) => {
      setMessages((prev) => {
        const lastMsg = prev[prev.length - 1];
        if (
          lastMsg &&
          lastMsg.role === "assistant" &&
          lastMsg.socketId === socketId
        ) {
          // Append to existing assistant message
          return [
            ...prev.slice(0, -1),
            { ...lastMsg, content: lastMsg.content + chunk },
          ];
        }
        // New assistant message
        return [...prev, { role: "assistant", content: chunk, socketId }];
      });
    });

    // Handle end of stream
    socket.on(ACTIONS.AGENT_RESPONSE_END, ({ fullResponse, socketId }) => {
      setIsStreaming(false);
      toast.success("AI response complete!");
    });

    return () => {
      socket.off(ACTIONS.AGENT_RESPONSE_STREAM);
      socket.off(ACTIONS.AGENT_RESPONSE_END);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!inputValue.trim()) return;

    // Add user message to UI
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: inputValue,
        username,
      },
    ]);

    // Send to agent
    setIsStreaming(true);
    socketRef.current.emit(ACTIONS.AGENT_MESSAGE, {
      roomId,
      message: inputValue,
      code,
      language,
      output,
      users: clients?.map((c) => c.username) || [],
      history: messages.map((m) => ({ role: m.role, content: m.content })),
    });

    setInputValue("");
    inputRef.current?.focus();
  };

  const toggleAssistant = () => {
    setShowAssistant(!showAssistant);
  };

  return (
    <>
      {/* Toggle Button — pill style matching Chat, positioned to the left of Chat */}
      <button
        className="open-btn bg-[#09fcf6] text-black px-[9px] py-[12px] border rounded-[50px] border-none cursor-pointer fixed text-[16px] mr-[14px] flex items-center justify-center transition-all duration-300 bottom-6 right-[194px] md:right-[324px] md:w-[280px] w-[150px]"
        onClick={toggleAssistant}
      >
        🤖 AI
        {isStreaming && (
          <span style={{ color: "purple", marginLeft: "5px" }}>●</span>
        )}
      </button>

      {/* Popup — dark theme matching Chat popup */}
      <div
        className="fixed bottom-4 right-[194px] md:right-[324px] z-10 w-[300px] md:w-[320px]"
        ref={assistantContainerRef}
        style={{ display: showAssistant ? "block" : "none" }}
      >
        <div className="form-container flex flex-col items-stretch max-w-[400px]">
          <div className="chat-window-head flex justify-between px-[16px] py-[14px]">
            <h4 className="text-black font-[500] cursor-pointer">
              🤖 AI Assistant
            </h4>
            <span
              className="cursor-pointer text-black"
              onClick={toggleAssistant}
            >
              <i className="fa fa-times"></i>
            </span>
          </div>

          <div className="msg-container overflow-auto">
            {messages.length === 0 ? (
              <p className="text-[grey] text-sm">
                Ask me to explain code, debug errors, or answer questions!
              </p>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className="msg mb-4">
                  <p
                    className="text-xs text-white"
                    style={{ maxWidth: "90%", wordWrap: "break-word" }}
                  >
                    <strong
                      style={{
                        color: msg.role === "user" ? "#09fcf6" : "#a855f7",
                      }}
                    >
                      {msg.role === "user" ? username : "AI Assistant"}:
                    </strong>{" "}
                    {msg.content}
                  </p>
                </div>
              ))
            )}
            {isStreaming && (
              <div className="msg mb-4">
                <p className="text-xs text-[grey]">AI is thinking...</p>
              </div>
            )}
            <div ref={messagesEndRef}></div>
          </div>

          <div className="flex h-12 mb-4 px-[14px]">
            <div className="chat-box flex justify-between w-full overflow-hidden border border-solid rounded-[30px] border-[grey]">
              <input
                ref={inputRef}
                className="w-[80%] p-1 h-[46px] pl-4 border-none rounded-[4px] focus:outline-none focus:bg-[#0a0e13] bg-[#0a0e13] text-white"
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask me anything..."
                disabled={isStreaming}
                onKeyUp={(e) => e.key === "Enter" && handleSendMessage(e)}
              />
              <button
                type="button"
                className="clickbtn"
                onClick={handleSendMessage}
                disabled={isStreaming}
              >
                <i className="fa fa-chevron-circle-right send-btn"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AiAssistant;
