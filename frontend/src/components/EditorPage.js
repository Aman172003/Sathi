import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import Client from "./Client";
import Editor from "./Editor";
import { initSocket } from "./Socket";
import ACTIONS from "../actions";
import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

const EditorPage = () => {
  // useRef use krke nye component render hone pe bhi values persiist krti hai
  const socketRef = useRef(null);
  const codeRef = useRef(null);
  const location = useLocation();
  const { roomId } = useParams();
  const [clients, setClients] = useState([]);
  const reactNavigator = useNavigate();
  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();
      socketRef.current.on("connect_error", (err) => handleErrors(err));
      socketRef.current.on("connect_failed", (err) => handleErrors(err));

      function handleErrors(e) {
        console.log("Socket error", e);
        toast.error("Socket connection failed, try again later.");
        reactNavigator("/");
      }

      // hum join req emit krenge
      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        // since humne use navigate krke username pass kiya tha join krne pe
        // to hum data ko aise retrieve krte hai
        //  "?" isliye hai kyuki .username agar present nhi hoga to error throw nhi krega
        username: location.state?.username,
      });
      // listening for joined event
      socketRef.current.on(
        ACTIONS.JOINED,
        ({ clients, username, socketId }) => {
          // matlab jo client join kr rha hai usko bas notification nhi milna chahiye ki wo joined hua hai
          if (username !== location.state?.username) {
            toast.success(`${username} joined the room`);
          }
          setClients(clients);
          // jo bho code texteditor me hoga wo nye client ko bhi dikhange
          // server pe req maar rhe hai ki cuurent socket ko prev code dikahna hai
          socketRef.current.emit(ACTIONS.SYNC_CODE, {
            code: codeRef.current,
            socketId,
          });
        }
      );
      //Listeneing for disconnected
      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        toast.success(`${username} left the room`);
        // uss socket ko nikal denge
        setClients((prev) => {
          return prev.filter((client) => client.socketId !== socketId);
        });
      });
    };
    init();
    // humesha listenners ko clean krna chahiye htane ke baad
    // jaise hi function unmount ho jaega uska cleaning ho jaega
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current.off(ACTIONS.JOINED);
        socketRef.current.off(ACTIONS.DISCONNECTED);
      }
    };
  }, []);

  async function copyRoomId() {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success("ROOM ID copied to clipboard");
    } catch (err) {
      toast.error("Could not copy ROOM ID");
      console.status(404).error(err);
    }
  }

  function leaveRoom() {
    reactNavigator("/");
  }

  if (!location.state) {
    return <Navigate to="/" />;
  }

  return (
    // mainwrap class banake humne normal css se styling di hai kyuki wo styling tailind me nhi thi
    <div className="grid mainWrap h-screen">
      <div className="bg-[#000d0c] p-4 text-[#fff] flex flex-col">
        <div className="flex-1">
          <div className="border-b border-solid border-[#424242] pb-[10px]">
            <img className="h-[50px]" src="/sathi.png" alt="logo" />
          </div>
          <h3 className="mt-3">Connected</h3>
          <div className="flex items-center flex-wrap gap-5">
            {clients.map((client) => {
              return (
                <Client key={client.socketId} username={client.username} />
              );
            })}
          </div>
        </div>
        <button
          className="btn text-black bg-white w-full hover:bg-slate-300"
          onClick={copyRoomId}
        >
          Copy ROOM ID
        </button>
        <button
          className="btn text-black mt-5 bg-[#09fcf6] w-full hover:bg-[#09cffc]"
          onClick={leaveRoom}
        >
          Leave
        </button>
      </div>
      <div className="editorWrap bg-white">
        <Editor
          socketRef={socketRef}
          roomId={roomId}
          onCodeChange={(code) => {
            codeRef.current = code;
          }}
        />
      </div>
    </div>
  );
};

export default EditorPage;
