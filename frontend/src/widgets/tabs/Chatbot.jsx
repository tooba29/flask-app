import React, { useState } from "react";
import { Button, Typography, Textarea, Avatar } from "@material-tailwind/react";
import { notification } from "antd";
import ClipLoader from "react-spinners/ClipLoader";
import axios from "axios";

export function Chatbot(props) {
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [prompt, setPrompt] = useState("");

  const handleChange = (e) => {
    setPrompt(e.target.value);
  };

  const handleReply = async () => {
    if (prompt == "") {
      notification.warning({ message: "Please input correctly" });
      return;
    }

    let chat_history = [...chatHistory];
    chat_history.push({ role: "User", content: prompt });
    setChatHistory(chat_history);

    setLoading(true);
    axios
      .post(`${process.env.REACT_APP_BASED_URL}/getReply`, {
        prompt: prompt,
      })
      .then((res) => {
        chat_history.push({ role: "Assistant", content: res.data });
        let chats = [...chat_history];
        setChatHistory(chats);
        setPrompt("");
        setLoading(false);
      })
      .catch((err) => {
        console.log('Making POST request to:', `${process.env.REACT_APP_BASED_URL}/upload`);
        console.log(err);
        notification.error({ message: err.response.data.message });
        setLoading(false);
      });
  };

  return (
    <div className="rounded bg-white">
      <div className="my-5 w-full p-5">
        {chatHistory &&
          chatHistory.map((item, idx) => {
            return (
              <div key={idx} className="w-full">
                {item.role == "User" && (
                  <div className="flex w-full items-start justify-end">
                    <div className="my-1 w-fit max-w-[80%] rounded-md border-2 border-solid border-black p-2 text-right">
                      {item.content}
                    </div>
                    <Avatar
                      src="img/user.svg"
                      className=" h-auto w-[50px] rounded-none p-0"
                    />
                  </div>
                )}
                {item.role == "Assistant" && (
                  <div className="flex w-full items-start justify-start">
                    <Avatar
                      src="img/bot.svg"
                      className=" h-auto w-[50px] rounded-none p-0"
                    />
                    <div className="my-1 w-fit max-w-[80%] rounded-md border-2 border-solid border-black p-2 text-left">
                      {item.content}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
      </div>
      <div className="w-full px-5 py-3">
        <Textarea label="Message" value={prompt} onChange={handleChange} />
      </div>
      <Button
        variant="filled"
        onClick={handleReply}
        className="my-5 text-[16px] normal-case"
      >
        {loading ? (
          <ClipLoader
            color={"#000000"}
            loading={loading}
            size={13}
            cssOverride={{ height: "25px", width: "25px" }}
          />
        ) : (
          <Typography>Send</Typography>
        )}
      </Button>
    </div>
  );
}

export default Chatbot;
