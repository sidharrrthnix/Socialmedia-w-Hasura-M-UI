import {
  Button,
  Card,
  InputAdornment,
  TextField,
  Typography,
} from "@material-ui/core";
import React, { useContext, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import SEO from "../components/shared/Seo";
import { useSignUpPageStyles } from "../styles";
import isEmail from "validator/lib/isEmail";
import { LoginWithFacebook } from "./login";
import { AuthContext } from "../auth";
import { useForm } from "react-hook-form";
import { CheckCircleOutline, HighlightOff } from "@material-ui/icons";
import AuthError from "../components/shared/AuthError";
import { useApolloClient } from "@apollo/client";
import { CHECK_IF_USERNAME_TAKEN } from "../graphql/querires";
function SignUpPage() {
  const classes = useSignUpPageStyles();
  const client = useApolloClient();
  const { register, handleSubmit, formState } = useForm({
    mode: "onBlur",
  });
  const [error, setError] = useState("");
  const { signUpWithEmailAndPassword } = useContext(AuthContext);

  const history = useHistory();
  //   const handleChange = (e) => {
  //     const { name, value } = e.target;
  //     setValues((prev) => ({ ...prev, [name]: value }));
  //   };
  const validateUsername = async (username) => {
    const variables = { username };

    const response = await client.query({
      query: CHECK_IF_USERNAME_TAKEN,
      variables,
    });
    console.log(response);
  };
  const errorIcon = (
    <InputAdornment>
      <HighlightOff style={{ color: "red", height: 30, width: 30 }} />
    </InputAdornment>
  );
  const validIcon = (
    <InputAdornment>
      <CheckCircleOutline style={{ color: "#ccc", height: 30, width: 30 }} />
    </InputAdornment>
  );

  const onSubmit = async (data) => {
    try {
      setError("");
      await signUpWithEmailAndPassword(data);
      history.push("/");
    } catch (e) {
      console.error("Error signing up", e);
      handleError(e);
    }
  };
  const handleError = (error) => {
    if (error.message.includes("user_username_key")) {
      setError("Username already taken");
    } else if (error?.code?.includes("auth")) {
      setError(error.message);
    }
  };
  return (
    <>
      <SEO title="Sign up" />
      <section className={classes.section}>
        <article>
          <Card className={classes.card}>
            <div className={classes.cardHeader} />
            <Typography className={classes.cardHeaderSubHeader}>
              Sign up to see photos and videos from your friends
            </Typography>
            <LoginWithFacebook
              color="primary"
              iconColor="white"
              variant="contained"
            />
            <div className={classes.orContainer}>
              <div className={classes.orLine} />
              <div>
                <Typography variant="body2" color="textSecondary">
                  OR
                </Typography>
              </div>
              <div className={classes.orLine} />
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              <TextField
                name="email"
                {...register("email", {
                  required: true,
                  validate: (input) => isEmail(input),
                })}
                InputProps={{
                  endAdornment: formState.errors.email
                    ? errorIcon
                    : formState.touchedFields.email && validIcon,
                }}
                fullWidth
                variant="filled"
                label="Email"
                type="email"
                margin="dense"
                className={classes.TextField}
              />
              <TextField
                name="name"
                {...register("name", {
                  required: true,
                  minLength: 5,
                  maxLength: 20,
                })}
                InputProps={{
                  endAdornment: formState.errors.name
                    ? errorIcon
                    : formState.touchedFields.name && validIcon,
                }}
                fullWidth
                variant="filled"
                label="Full Name"
                margin="dense"
                className={classes.TextField}
              />
              <TextField
                name="username"
                {...register("username", {
                  required: true,
                  minLength: 5,
                  maxLength: 20,
                  validate: async (input) => await validateUsername(input),
                  pattern: /^[a-zA-Z0-9_.]*$/,
                })}
                InputProps={{
                  endAdornment: formState.errors.username
                    ? errorIcon
                    : formState.touchedFields.username && validIcon,
                }}
                fullWidth
                variant="filled"
                label="Username"
                margin="dense"
                className={classes.TextField}
                autoComplete="username"
              />
              <TextField
                name="password"
                {...register("password", {
                  required: true,
                  minLength: 6,
                })}
                InputProps={{
                  endAdornment: formState.errors.password
                    ? errorIcon
                    : formState.touchedFields.password && validIcon,
                }}
                fullWidth
                variant="filled"
                label="Password"
                type="password"
                margin="dense"
                className={classes.TextField}
                autoComplete="new-password"
              />
              <Button
                disabled={!formState.isValid || formState.isSubmitting}
                variant="contained"
                fullWidth
                color="primary"
                className={classes.button}
                type="submit"
              >
                Sign up
              </Button>
            </form>
            <AuthError error={error} />
          </Card>
          <Card className={classes.loginCard}>
            <Typography align="right" variant="body2">
              have an account?
            </Typography>
            <Link to="/accounts/login">
              <Button color="primary" className={classes.loginButton}>
                Login
              </Button>
            </Link>
          </Card>
        </article>
      </section>
    </>
  );
}

export default SignUpPage;
