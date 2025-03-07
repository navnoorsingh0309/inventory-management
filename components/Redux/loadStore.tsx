"use client";

import { setId } from "@/lib/features/userdata/UserDataSlice";
import { useUser } from "@clerk/nextjs";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";

const LoadStore = () => {
  const { user } = useUser();
  const dispatch = useDispatch();
  useEffect(() => {
    if (user) {
      dispatch(setId(user.id));
    }
  }, [user, dispatch]);
  return <></>;
};

export default LoadStore;
