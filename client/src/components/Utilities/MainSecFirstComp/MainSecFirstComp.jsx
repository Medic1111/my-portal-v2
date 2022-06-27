import classes from "./MainSecFirstComp.module.css";
import Link from "../Link/Link";
import { useSelector, useDispatch } from "react-redux";
import { chatActions } from "../../../features/chat";
import React from "react";
import { wrapperActions } from "../../../features/wrapper";
import axios from "axios";
import { currentClassActions } from "../../../features/currentClass";
import { errorActions } from "../../../features/error";
const MainSecFirstComp = ({ socket }) => {
  const dispatch = useDispatch();
  const currentClass = useSelector((state) => state.CurrentClass.class);
  const role = useSelector((state) => state.WhatRole.role);
  const dark = useSelector((state) => state.DarkMode.isDarkMode);

  const enterChatHandler = async () => {
    await axios
      .get(`/api/classes/${currentClass._id}`)
      .then((serverRes) => {
        dispatch(currentClassActions.setCurrentClass(serverRes.data));
        // IF EMPTY, HAVE SERVER SEND BACK ID PARAM
        // USE ID PARAM TO REMOVE CLASS REDUCER
        // FOUND IN CURRENT USER
        // SAME APPLIES FOR DROP OUT OF CLASS
        // AND CHOOSING THIS CLASS IN CLASS LIST
      })
      .catch((err) => console.log(err));

    socket.emit("join_room", currentClass.secretKey);
    dispatch(chatActions.setIsChat(true));
  };

  const openRosterHandler = () => {
    dispatch(wrapperActions.setRoster(true));
    dispatch(wrapperActions.setMain(false));
  };

  return (
    <div className={classes.div}>
      <h4 className={dark ? `${classes.darkH2}` : `${classes.lightH2}`}>
        {currentClass.className}
      </h4>
      {role === "Mentor" ? (
        <p className={dark ? `${classes.pDark}` : `${classes.pLight}`}>
          Key: {currentClass.secretKey}
        </p>
      ) : (
        <React.Fragment>
          <p className={dark ? `${classes.pDark}` : `${classes.pLight}`}>
            Mentor: {currentClass.whoTeach.lName}
          </p>
          <p className={dark ? `${classes.pDark}` : `${classes.pLight}`}>
            Email: {currentClass.whoTeach.email}
          </p>
        </React.Fragment>
      )}

      {role === "Mentor" && (
        <Link innerTxt={"ROSTER"} clickMe={openRosterHandler} />
      )}

      <Link innerTxt={"Chat"} clickMe={enterChatHandler} />
    </div>
  );
};

export default MainSecFirstComp;
