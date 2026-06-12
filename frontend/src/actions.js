const ACTIONS = {
  JOIN: "join",
  JOINED: "joined",
  DISCONNECTED: "disconnected",
  CODE_CHANGE: "code-change",
  SYNC_CODE: "sync-code",
  LEAVE: "leave",
  SEND_MESSAGE: "send-message",
  LANG_CHANGE: "lang-change",
  SYNC_OUTPUT: "sync-output",
  RUN_CODE: "run-code",
  DISPLAY_OUTPUT: "display-output",
  // AI Agent Chat
  AGENT_MESSAGE: "agent-message",
  AGENT_RESPONSE: "agent-response",
  AGENT_RESPONSE_STREAM: "agent-response-stream",
  AGENT_RESPONSE_END: "agent-response-end",
};
module.exports = ACTIONS;
