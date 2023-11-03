import React, { useState } from "react";
import { Button, Avatar, Typography } from "@material-tailwind/react";
import ClipLoader from "react-spinners/ClipLoader";
import { TrashIcon } from "@heroicons/react/24/outline";
import { notification } from "antd";
import axios from "axios";

export function FilesTab(props) {
  const [loading, setLoading] = useState(false);
  const [fileList, setFilelist] = useState([]);
  const [fileNameList, setFileNameList] = useState([]);

  const handleTrain = () => {
    setLoading(true);
    let samefiles = 0;
    const formData = new FormData();
    if (fileNameList.length != 0) {
      for (let i = 0; i < fileList.length; i++) {
        if (props.namelist.includes(fileList[i].name) == false) {
          formData.append("files", fileList[i]);
        } else {
          samefiles++;
        }
      }
    }
    if (samefiles != 0) {
      notification.warning({ message: `${samefiles} files are duplicated.` });
    }

    console.log('Making POST request to:', `${process.env.REACT_APP_BASED_URL}/upload`);

    axios
      .post(`${process.env.REACT_APP_BASED_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((res) => {
        props.setDataset(res.data.data);
        notification.success({ message: "Successfully trained." });
        setFileNameList([]);
        setFilelist([]);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        notification.error({ message: err });
        setLoading(false);
      });
  };

  const handleFileChanger = (e) => {
    let list = [...fileList];
    let filenameList = [...fileNameList];
    if (e.target.files.length != 0) {
      for (let i = 0; i < e.target.files.length; i++) {
        if (filenameList.includes(e.target.files[i].name) == false) {
          list.push(e.target.files[i]);
          filenameList.push(e.target.files[i].name);
        }
      }
      setFileNameList(filenameList);
      setFilelist(list);
    }
  };

  const handleDeletefile = (idx) => {
    let list = [...fileNameList];
    list.splice(idx, 1);
    setFileNameList(list);

    let file_list = [...fileList];
    file_list.splice(idx, 1);
    setFilelist(file_list);
  };

  return (
    <>
      <div className="flex w-full items-center justify-center">
        <label
          htmlFor="dropzone-file1"
          className="dark:hover:bg-bray-800 flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-600"
        >
          <div className="flex flex-col items-center justify-center pb-6 pt-5">
            <Avatar src="img/upload.svg" className="m-2 h-auto w-[2.2rem]" />
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
              Click to upload a file or drag and drop it here
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Up to 100MB in size. PDF
            </p>
          </div>
          <input
            id="dropzone-file1"
            type="file"
            accept=".pdf"
            onChange={handleFileChanger}
            className="hidden"
            multiple
          />
        </label>
      </div>
      <div className=" mt-2 flex flex-col items-start">
        {fileNameList.length != 0 &&
          fileNameList.map((item, idx) => {
            return (
              <div
                key={idx}
                className="flex w-full items-center justify-between"
              >
                <Typography className="text-[16px] text-black">
                  {item}
                </Typography>
                <Button
                  variant="text"
                  onClick={() => handleDeletefile(idx)}
                  className="flex h-8 w-8 items-center justify-center p-0"
                >
                  <TrashIcon className="w-6" color="black" />
                </Button>
              </div>
            );
          })}
      </div>
      <Button
        variant="filled"
        onClick={handleTrain}
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
          <Typography>Upload and Train</Typography>
        )}
      </Button>
    </>
  );
}

export default FilesTab;
