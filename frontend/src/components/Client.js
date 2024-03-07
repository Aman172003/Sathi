import React from "react";
import Avatar from "react-avatar";

const Client = ({ username }) => {
  return (
    <div className="flex flex-col items-center flex-wrap text-sm text-wrap mt-3">
      <Avatar name={username} size={50} round="14px" />
      <span className="mt-[10px]">{username}</span>
    </div>
  );
};

export default Client;
