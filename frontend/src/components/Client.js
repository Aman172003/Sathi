import React from "react";
import Avatar from "react-avatar";

const Client = ({ username }) => {
  return (
    <div className="flex md:flex-col items-center flex-wrap text-sm text-wrap mt-3">
      <Avatar name={username} size={40} round="14px" />
      <span className="mt-[2px] ml-2 md:ml-0">{username}</span>
    </div>
  );
};

export default Client;
