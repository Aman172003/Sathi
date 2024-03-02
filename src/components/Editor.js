import React, { useEffect, useRef } from "react";
import Codemirror from "codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/mode/javascript/javascript";
import "codemirror/theme/ayu-dark.css";
import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/closebrackets";
import ACTIONS from "../actions";

const Editor = ({ socketRef, roomId, onCodeChange }) => {
  const editorRef = useRef(null);

  useEffect(() => {
    async function init() {
      // Create a new CodeMirror instance when the component mounts
      editorRef.current = Codemirror.fromTextArea(
        document.getElementById("realtimeEditor"),
        {
          mode: { name: "javascript", json: true },
          theme: "ayu-dark",
          autoCloseTags: true,
          autoCloseBrackets: true,
          lineNumbers: true,
        }
      );

      // applying event listener
      editorRef.current.on("change", (instance, changes) => {
        const { origin } = changes;
        // har instance pe editor me jo bi code hoga wo mil jaega
        const code = instance.getValue();
        onCodeChange(code);
        // setValue ek method hai
        if (origin !== "setValue") {
          socketRef.current.emit(ACTIONS.CODE_CHANGE, {
            roomId,
            code,
          });
        }
      });
    }
    init();
  }, []); // Empty dependency array ensures the effect runs only once after initial render

  useEffect(() => {
    // server se bheja hua code saare clients recieve krenge
    if (socketRef.current) {
      socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
        if (code != null) {
          editorRef.current.setValue(code);
        }
      });
    }
    // jo changes hai unko unsubscribe bhi krna hota hai
    return () => {
      if (socketRef.current) socketRef.current.off(ACTIONS.CODE_CHANGE);
    };
  }, [socketRef.current]);
  return <textarea className="h-full" id="realtimeEditor"></textarea>;
};

export default Editor;
