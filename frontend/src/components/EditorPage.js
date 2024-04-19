import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import Client from "./Client";
import Editor from "./Editor";
import { initSocket } from "./Socket";
import { FaPython, FaJava, FaJs, FaGofore } from "react-icons/fa";
import { SiCplusplus } from "react-icons/si";
import { TbLetterC } from "react-icons/tb";
import { DiRuby } from "react-icons/di";
import { DiRust } from "react-icons/di";
import { DiDart } from "react-icons/di";
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
  const outputRef = useRef(null);
  const { roomId } = useParams();
  const [clients, setClients] = useState([]);
  const [items, setItems] = useState(false);
  const [activeTab, setActiveTab] = useState("input");
  const [lang, setLang] = useState("cpp17");
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [input, setInput] = useState("");

  const toggleButton = () => {
    setItems(!items);
  };
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
    // Listening for messages
    // socketRef.current.on(ACTIONS.SEND_MESSAGE, ({ message }) => {
    //   const chatWindow = document.getElementById("chatWindow");
    //   var currText = chatWindow.value;
    //   currText += message;
    //   chatWindow.value = currText;
    //   chatWindow.scrollTop = chatWindow.scrollHeight;
    // });

    init();
    // humesha listenners ko clean krna chahiye htane ke baad
    // jaise hi function unmount ho jaega uska cleaning ho jaega
    return () => {
      if (socketRef.current) {
        socketRef.current.off(ACTIONS.JOINED);

        socketRef.current.off(ACTIONS.DISCONNECTED);
        // socketRef.current.off(ACTIONS.SEND_MESSAGE);
        socketRef.current.disconnect();
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

  const inputClicked = () => {
    setActiveTab("input");
    const inputArea = document.getElementById("input");
    inputArea.placeholder = "Enter your input here";
    inputArea.value = "";
    inputArea.disabled = false;
    const inputLabel = document.getElementById("inputLabel");
    const outputLabel = document.getElementById("outputLabel");
    inputLabel.classList.remove("notClickedLabel");
    inputLabel.classList.add("clickedLabel");
    outputLabel.classList.remove("clickedLabel");
    outputLabel.classList.add("notClickedLabel");
  };

  const outputClicked = () => {
    setActiveTab("output");
    const inputArea = document.getElementById("input");
    inputArea.placeholder =
      "You output will apear here, Click 'Run code' to see it";
    inputArea.value = "";
    inputArea.disabled = true;
    const inputLabel = document.getElementById("inputLabel");
    const outputLabel = document.getElementById("outputLabel");
    inputLabel.classList.remove("clickedLabel");
    inputLabel.classList.add("notClickedLabel");
    outputLabel.classList.remove("notClickedLabel");
    outputLabel.classList.add("clickedLabel");
  };

  // const handleInputEnter = (key) => {
  //   if (key.code === "Enter") {
  //     sendMessage();
  //   }
  // };

  const onInputChange = (e) => {
    setInput(e.target.value);
  };

  const runCode = async () => {
    outputRef.current.click();
    toast.loading("Running Code....");
    const url = "https://online-code-compiler.p.rapidapi.com/v1/";
    const options = {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "X-RapidAPI-Key": "80dc85687amshbc4b976aae3b8b7p1470ccjsn092c86007642",
        "X-RapidAPI-Host": "online-code-compiler.p.rapidapi.com",
      },
      body: JSON.stringify({
        language: lang,
        version: "latest",
        code: code,
        input: input,
      }),
    };

    try {
      const response = await fetch(url, options);
      const result = await response.json();
      console.log(result);
      const output = result.output;
      outputClicked();
      document.getElementById("input").value = output;
      toast.dismiss();
    } catch (error) {
      toast.dismiss();
      document.getElementById("input").value =
        "Something went wrong, Please check your code and input.";
      console.error(error);
    }
  };

  const handleClick = (language) => {
    setLang(language);
    console.log(language);
  };

  // const sendMessage = () => {
  //   if (document.getElementById("inputBox").value === "") return;
  //   var message = `> ${location.state.username}:\n${
  //     document.getElementById("inputBox").value
  //   }\n`;
  //   const chatWindow = document.getElementById("chatWindow");
  //   var currText = chatWindow.value;
  //   currText += message;
  //   chatWindow.value = currText;
  //   chatWindow.scrollTop = chatWindow.scrollHeight;
  //   document.getElementById("inputBox").value = "";
  //   socketRef.current.emit(ACTIONS.SEND_MESSAGE, { roomId, message });
  // };

  return (
    <div className="mainWrap h-screen relative">
      <div className="bg-black p-4 text-[#fff] flex justify-between items-center md:gap-16">
        <div>
          <img className="h-[50px]" src="/sathi.png" alt="logo" />
        </div>

        <div className="flex items-center md:hidden">
          <button
            className="hamburger inline-block cursor-pointer"
            onClick={toggleButton}
          >
            {items ? (
              <>
                <div className="line h-0.5 w-5 -my-0.1 -mx-6 bg-white transform rotate-45 origin-center absolute"></div>
                <div className="line h-0.5 w-5 -my-0.1 -mx-6 bg-white transform -rotate-45 origin-center absolute"></div>
              </>
            ) : (
              <>
                <div className="line h-0.5 w-6 my-1 bg-white"></div>
                <div className="line h-0.5 w-6 my-1 bg-white"></div>
                <div className="line h-0.5 w-6 my-1 bg-white"></div>
              </>
            )}
          </button>
        </div>
        <div
          className={`md:flex md:items-center md:gap-96 ${
            items ? "absolute" : "hidden"
          } mt-72 md:mt-auto bg-black w-full md:w-auto md:mx-0 -mx-4 h-60 md:h-auto md:overflow-y-auto overflow-y-scroll z-10`}
        >
          <div
            className={`flex md:items-center md:gap-1 flex-col md:flex-row items-start justify-center p-3 md:p-0 md:mt-0 mt-2`}
          >
            {clients.map((client) => {
              return (
                <Client key={client.socketId} username={client.username} />
              );
            })}
          </div>

          <div
            className={`flex md:items-center md:gap-4 md:flex-row flex-col gap-2 p-3 md:p-0 md:mt-0 mt-5`}
          >
            <button
              className="text-black bg-white px-4 py-2 rounded-md hover:bg-slate-300 focus:outline-none transition-all duration-300 ease-in-out"
              onClick={copyRoomId}
            >
              Copy ROOM ID
            </button>
            <button
              className="text-black bg-[#09fcf6] px-4 py-2 rounded-md hover:bg-[#09cffc] focus:outline-none transition-all duration-300 ease-in-out"
              onClick={leaveRoom}
            >
              Leave
            </button>
          </div>
        </div>
      </div>
      <div className="flex">
        <div className="sidebar w-fit p-3 border-r border-t mt-[2px] bg-black">
          <ul>
            <div className="liItems">
              <li onClick={() => handleClick("cpp17")}>
                <SiCplusplus color="white" size={30} />
              </li>
            </div>
            <div className="liItems">
              <li onClick={() => handleClick("c")}>
                <TbLetterC color="white" size={30} />
              </li>
            </div>
            <div className="liItems">
              <li onClick={() => handleClick("python3")}>
                <FaPython color="white" size={30} />
              </li>
            </div>
            <div className="liItems">
              <li onClick={() => handleClick("java")}>
                <FaJava color="white" size={30} />
              </li>
            </div>
            <div className="liItems">
              <li onClick={() => handleClick("javascript")}>
                <FaJs color="white" size={30} />
              </li>
            </div>
            <div className="liItems">
              <li onClick={() => handleClick("go")}>
                <FaGofore color="white" size={30} />
              </li>
            </div>
            <div className="liItems">
              <li onClick={() => handleClick("ruby")}>
                <DiRuby color="white" size={30} />
              </li>
            </div>
            <div className="liItems">
              <li onClick={() => handleClick("rust")}>
                <DiRust color="white" size={30} />
              </li>
            </div>
            <div className="liItems">
              <li onClick={() => handleClick("dart")}>
                <DiDart color="white" size={30} />
              </li>
            </div>
          </ul>
        </div>
        <div className="flex flex-col w-full">
          <div className="flex h-12 text-xl text-white justify-center items-center bg-black">
            <div className="flex justify-between items-center w-2/3 p-2 border  border-l-0">
              <div className="">Code</div>
              <div>
                <label
                  onClick={runCode}
                  id="runLabel"
                  className="bg-white text-black border-solid px-3 py-2 rounded-md text-center text-sm hover:bg-slate-300 transition duration-300 ease-in-out cursor-pointer"
                >
                  Run Code
                </label>
              </div>
            </div>

            <div className="p-2 IO-container w-1/3 border  border-l-0">
              <label
                id="inputLabel"
                className={`bg-white text-black border-solid px-3 py-2 rounded-md text-center text-sm hover:bg-slate-300 transition duration-300 ease-in-out cursor-pointer ${
                  activeTab === "input" ? "active" : ""
                }`}
                onClick={inputClicked}
              >
                Input
              </label>
              <label
                ref={outputRef}
                id="outputLabel"
                className={`bg-white text-black border-solid px-3 py-2 rounded-md text-center text-sm hover:bg-slate-300 transition duration-300 ease-in-out cursor-pointer mx-2 ${
                  activeTab === "output" ? "active" : ""
                }`}
                onClick={outputClicked}
              >
                Output
              </label>
            </div>
          </div>
          <div className="h-screen overflow-y-hidden flex">
            <div className="editorWrap bg-white w-2/3 border-r">
              <Editor
                socketRef={socketRef}
                roomId={roomId}
                onCodeChange={(code) => {
                  codeRef.current = code;
                  setCode(code);
                }}
              />
            </div>
            <div className="w-1/3">
              <textarea
                id="input"
                value={input}
                onChange={onInputChange}
                className="inputArea textarea-style w-full bg-[#3d3d3d] outline-none h-screen p-2 text-white border-r"
                placeholder="Enter your input here"
              ></textarea>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorPage;
