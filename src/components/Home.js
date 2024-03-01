import React, { useState } from "react";
import { v4 as uuidV4 } from "uuid";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState("");

  const [username, setUsername] = useState("");

  const createNewRoom = (e) => {
    e.preventDefault();
    const id = uuidV4();
    setRoomId(id);
    toast.success("Heyya, Created a new room!");
  };

  const onChangeId = (e) => {
    setRoomId(e.target.value);
  };

  const onChangeUser = (e) => {
    setUsername(e.target.value);
  };

  const joinRoom = () => {
    if (!roomId && !username) {
      toast.error("ROOM ID & USERNAME is required");
      return;
    } else if (!roomId) {
      toast.error("ROOM ID is required");
      return;
    } else if (!username) {
      toast.error("USERNAME is required");
      return;
    }
    //Redirect
    // ek route se dusre route me hum data pass kr skte hai
    // usenavigate ki madad se
    // jaise yaha home se editor route me state use krke data pass kr rhe hai
    // aur sath me redirect bhi ho rhe hai
    navigate(`/editor/${roomId}`, {
      state: { username },
    });
  };

  const handleInputEnter = (e) => {
    if (e.code === "Enter") {
      joinRoom();
    }
  };

  return (
    <div className="h-screen flex justify-center items-center text-[#fff]">
      {/* form */}
      <div className="bg-[#282a36] p-5 rounded-lg w-[400px] max-w-90">
        <img
          className="h-[80px] mb-[30px]"
          src="/code-sync.png"
          alt="code-sync-logo"
        />
        <h4 className="mt-0 mb-5">Paste invitation ROOM ID</h4>
        <div className="flex flex-col">
          <input
            type="text"
            className="text-black p-[10px] rounded-[5px] outline-none border-none mb-[14px] bg-[#eee]  text-[13px]"
            placeholder="ROOM ID"
            onChange={onChangeId}
            value={roomId}
            // agar enter bhi marenge to join ho jaega
            onKeyUp={handleInputEnter}
          />
          <input
            type="text"
            className=" text-black p-[10px] rounded-[5px] outline-none border-none mb-[14px] bg-[#eee] text-[13px]"
            placeholder="USERNAME"
            onChange={onChangeUser}
            value={username}
            onKeyUp={handleInputEnter}
          />
          <button
            className="btn text-black bg-[#4aee88] w-[100px] ml-auto hover:bg-[#2b824c]"
            onClick={joinRoom}
          >
            Join
          </button>
          <span className="mt-[20px] mx-auto ">
            if you don't have an invite then create &nbsp;
            <a
              onClick={createNewRoom}
              href=""
              className="text-[#4aed88] no-underline border-b border-solid border-[#4aed88] transition-all duration-300 ease-in-out hover:text-[#2b824c] hover:border-[#2b824c]"
            >
              new room
            </a>
          </span>
        </div>
      </div>

      {/* footer */}
      <footer className="fixed bottom-0 mx-auto">
        <h4>
          Built with 💛 by{" "}
          <a
            className="text-[#4aee88] transition-all duration-300 ease-in-out hover:text-[#2b824c] border-b border-solid border-[#4aed88] hover:border-[#2b824c]"
            href="https://github.com/Aman172003"
          >
            Aman
          </a>
        </h4>
      </footer>
    </div>
  );
};

export default Home;
