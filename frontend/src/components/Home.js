import React, { useEffect, useState } from "react";
import { v4 as uuidV4 } from "uuid";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import homeImage from "../media/bc.jpg";
import { Typed } from "react-typed";

const Home = () => {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState("");

  const [username, setUsername] = useState("");

  useEffect(() => {
    const typeData = new Typed(".role", {
      strings: [
        "<span style='color: #fff'>Code together</span>, <span style='color: #04cffc'>Chat together</span>",
        "<span style='color: #fff'>9 languages</span>, <span style='color: #04cffc'>Endless possibilities</span>",
        "<span style='color: #fff'>Bridging minds</span>, <span style='color: #04cffc'>Writing lines</span>",
        "<span style='color: #fff'>Multiple minds</span>, <span style='color: #04cffc'>One screen</span>",
      ],
      loop: true,
      typeSpeed: 100,
      backSpeed: 80,
      backDelay: 1000,
    });

    return () => {
      typeData.destroy(); // Cleanup on component unmount
    };
  }, []);

  const createNewRoom = (e) => {
    e.preventDefault();
    const id = uuidV4();
    setRoomId(id);
    toast.success("Heyya, Created a new room!");
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

  const onChangeId = (e) => {
    setRoomId(e.target.value);
  };

  const onChangeUser = (e) => {
    setUsername(e.target.value);
  };

  return (
    <div
      className="h-screen flex justify-center items-center text-[#fff] bg-cover "
      style={{
        backgroundImage: `url(${homeImage})`,
      }}
    >
      <div className="w-1/2">
        <div className="lg:block hidden left mr-[10px]  font-semibold text-4xl">
          <div class="heading">
            <span class="role"></span>
          </div>
        </div>
      </div>
      {/* form */}
      <div>
        <div className="right bg-[#000d0c] bg-opacity-50 p-8 rounded-2xl w-[400px] max-w-90 ">
          <img
            className="h-[80px] mb-[15px]"
            src="/sathi.png"
            alt="code-sync-logo"
          />
          <h4 className="mt-0 mb-3 text-[14px] font-medium">
            Paste invitation ROOM ID
          </h4>
          <div className="flex flex-col">
            <input
              type="text"
              className="text-black p-[10px] rounded-[5px] outline-none border-none mb-[14px] bg-[#eee] font-medium text-[14px]"
              placeholder="ROOM ID"
              onChange={onChangeId}
              value={roomId}
              // agar enter bhi marenge to join ho jaega
              onKeyUp={handleInputEnter}
            />
            <input
              type="text"
              className=" text-black font-medium p-[10px] rounded-[5px] outline-none border-none mb-[14px] bg-[#eee] text-[14px]"
              placeholder="USERNAME"
              onChange={onChangeUser}
              value={username}
              onKeyUp={handleInputEnter}
            />
            <button
              className="btn text-black font-medium bg-[#09fcf6] w-[100px] ml-auto hover:bg-[#09cffc]"
              onClick={joinRoom}
            >
              Join
            </button>
            <span className="mt-[20px] mx-auto text-[14px] font-medium">
              if you don't have an invite then create &nbsp;
              <a
                onClick={createNewRoom}
                href=""
                className="text-[#09fcf6] no-underline border-b border-solid border-[#09fcf6] transition-all duration-300 ease-in-out hover:text-[#09cffc] hover:border-[#09cffc]"
              >
                new room
              </a>
            </span>
          </div>
        </div>
      </div>

      {/* footer */}
      <footer className="fixed bottom-2 mx-auto">
        <h4 className="text-[15px] font-medium">
          Copyright &#169; 2024{" "}
          <a
            className="text-[#09fcf6] transition-all duration-300 ease-in-out hover:text-[#09cffc] border-b border-solid border-[#09fcf6] hover:border-[#09cffc]"
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
