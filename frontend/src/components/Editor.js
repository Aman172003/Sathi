import React, { useEffect, useRef, useState } from "react";
import Codemirror from "codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/mode/javascript/javascript";
import "codemirror/theme/ayu-dark.css";
import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/closebrackets";
import ACTIONS from "../actions";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  getDocs,
  writeBatch,
  setDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase/Config";

const Editor = ({ socketRef, roomId, onCodeChange }) => {
  const editorRef = useRef(null);
  const codeRef = collection(db, `code-${roomId}`);
  const [initialCodeLoaded, setInitialCodeLoaded] = useState(false);

  const deleteCollection = async () => {
    try {
      const q = query(codeRef);
      const snapshot = await getDocs(q);
      const batch = writeBatch(db);
      snapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      console.log(
        `Firestore collection messages-${roomId} deleted successfully.`
      );
    } catch (error) {
      console.error("Error deleting collection:", error);
    }
  };

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
        saveCodeToFirestore(code);
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
    // Fetch initial code from Firestore
    async function fetchInitialCode() {
      try {
        const querySnapshot = await getDocs(codeRef);
        querySnapshot.forEach((doc) => {
          if (doc.exists()) {
            const codeData = doc.data();
            editorRef.current.setValue(codeData.code);
            setInitialCodeLoaded(true);
          }
        });
      } catch (error) {
        console.error("Error fetching initial code from Firestore: ", error);
      }
    }

    if (!initialCodeLoaded) {
      fetchInitialCode();
    }

    // server se bheja hua code saare clients recieve krenge
    if (socketRef.current) {
      socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
        if (code != null) {
          editorRef.current.setValue(code);
        }
      });
      socketRef.current.on("disconnect", () => {
        // Trigger function to delete Firestore collection
        deleteCollection();
      });
    }
    // jo changes hai unko unsubscribe bhi krna hota hai
    return () => {
      if (socketRef.current) socketRef.current.off(ACTIONS.CODE_CHANGE);
    };
  }, [initialCodeLoaded, socketRef.current]);

  const saveCodeToFirestore = async (code) => {
    try {
      // Set a document within the collection with the code as its data
      await setDoc(doc(codeRef, "codeDocument"), { code });
    } catch (error) {
      console.error("Error saving code to Firestore: ", error);
    }
  };

  return <textarea className="h-full" id="realtimeEditor"></textarea>;
};

export default Editor;
