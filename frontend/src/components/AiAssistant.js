import React, { useEffect, useRef, useState } from "react";
import ACTIONS from "../actions";
import toast from "react-hot-toast";

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
    if (!socketRef.current) return;

    // Handle streamed chunks
    socketRef.current.on(ACTIONS.AGENT_RESPONSE_STREAM, ({ chunk, socketId }) => {
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
    socketRef.current.on(ACTIONS.AGENT_RESPONSE_END, ({ fullResponse, socketId }) => {
      setIsStreaming(false);
      toast.success("AI response complete!");
    });

    return () => {
      socketRef.current.off(ACTIONS.AGENT_RESPONSE_STREAM);
      socketRef.current.off(ACTIONS.AGENT_RESPONSE_END);
    };
  }, [socketRef]);

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!inputValue.trim()) {
      toast.error("Please enter a message");
      return;
    }

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
    });

    setInputValue("");
    inputRef.current?.focus();
  };

  const toggleAssistant = () => {
    setShowAssistant(!showAssistant);
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={toggleAssistant}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full w-14 h-14 shadow-lg hover:shadow-xl transform hover:scale-110 transition-transform flex items-center justify-center text-xl font-bold z-40"
        title="AI Assistant"
      >
        🤖
      </button>

      {/* Assistant Modal/Popup */}
      {showAssistant && (
        <div
          ref={assistantContainerRef}
          className="fixed bottom-24 right-6 w-96 h-96 bg-white rounded-lg shadow-2xl flex flex-col z-50 border-2 border-purple-500"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
            <h3 className="font-bold text-lg">🤖 AI Assistant</h3>
            <button
              onClick={toggleAssistant}
              className="text-white hover:text-gray-200 text-2xl font-bold"
            >
              ✕
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <p className="font-semibold">Hi, I'm your AI Assistant!</p>
                <p className="text-sm mt-2">Ask me to explain code, debug errors, or answer questions about your code.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        msg.role === "user"
                          ? "bg-blue-500 text-white rounded-br-none"
                          : "bg-gray-200 text-gray-800 rounded-bl-none"
                      }`}
                    >
                      {msg.role === "assistant" && (
                        <p className="text-xs font-semibold text-purple-600 mb-1">
                          AI Assistant
                        </p>
                      )}
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {isStreaming && (
                  <div className="flex justify-start">
                    <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg rounded-bl-none">
                      <span className="text-sm">Thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <form
            onSubmit={handleSendMessage}
            className="border-t border-gray-200 p-3 bg-white rounded-b-lg flex gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask me anything..."
              disabled={isStreaming}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="submit"
              disabled={isStreaming || !inputValue.trim()}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default AiAssistant;
