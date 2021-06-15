import React from "react";

import { Typography } from "@material-ui/core";

const AuthError = ({ error }) => {
  console.log(error);
  return (
    Boolean(error) && (
      <Typography
        align="center"
        gutterBottom
        variant="body2"
        style={{ color: "red" }}
      >
        {error}
      </Typography>
    )
  );
};

export default AuthError;
