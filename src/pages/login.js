import {
  Button,
  Card,
  CardHeader,
  InputAdornment,
  TextField,
  Typography,
} from "@material-ui/core";
import React, { useContext, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import SEO from "../components/shared/Seo";
import { useLoginPageStyles } from "../styles";
import FacebookIconBlue from "../images/facebook-icon-blue.svg";
import FacebookIconWhite from "../images/facebook-icon-white.png";
import { useForm } from "react-hook-form";
import { AuthContext } from "../auth";
import isEmail from "validator/lib/isEmail";
import { useApolloClient } from "@apollo/client";
import { GET_USER_EMAIL } from "../graphql/querires";
import AuthError from "../components/shared/AuthError";
function LoginPage() {
  const classes = useLoginPageStyles();
  const { register, handleSubmit, watch, formState } = useForm({
    mode: "onBlur",
  });
  const [error, setError] = useState("");
  const client = useApolloClient();
  const { loginWithEmailAndPassword } = useContext(AuthContext);
  const [showPassword, setShowPassword] = useState(false);
  const hasPassword = Boolean(watch("password"));
  const history = useHistory();
  async function onSubmit(data) {
    try {
      setError("");
      if (!isEmail(data.input)) {
        data.input = await getUserEmail(data.input);
      }
      await loginWithEmailAndPassword(data.input, data.password);
      setTimeout(() => {
        history.push("/");
      }, 0);
    } catch (e) {
      console.error("login error", e);
      handleError(e);
    }
  }
  function handleError(error) {
    if (error.code.includes("auth")) {
      setError(error.message);
    }
  }
  async function getUserEmail(input) {
    const variables = { input };
    const response = await client.query({
      query: GET_USER_EMAIL,
      variables,
    });
    console.log(response);
    const userEmail = response.data.users[0]?.email || "no@email.com";
    return userEmail;
  }
  function togglePasswordVisibility() {
    setShowPassword((prev) => !prev);
  }
  return (
    <>
      <SEO title="Login" />
      <section className={classes.section}>
        <article>
          <Card className={classes.card}>
            <CardHeader className={classes.cardHeader} />
            <form onSubmit={handleSubmit(onSubmit)}>
              <TextField
                name="input"
                {...register("input", {
                  required: true,
                  minLength: 5,
                })}
                fullWidth
                variant="filled"
                label="Username, email or phone"
                margin="dense"
                className={classes.TextField}
                autoComplete="username"
              />
              <TextField
                name="password"
                {...register("password", {
                  required: true,
                  minLength: 5,
                })}
                InputProps={{
                  endAdornment: hasPassword && (
                    <InputAdornment>
                      <Button onClick={togglePasswordVisibility}>
                        {showPassword ? "Hide" : "Show"}
                      </Button>
                    </InputAdornment>
                  ),
                }}
                type={showPassword ? "text" : "password"}
                fullWidth
                variant="filled"
                label="Password"
                margin="dense"
                className={classes.TextField}
                autoComplete="current-password"
              />
              <Button
                disabled={!formState.isValid || formState.isSubmitting}
                variant="contained"
                fullWidth
                color="primary"
                className={classes.button}
                type="submit"
              >
                Log In
              </Button>
            </form>
            <div className={classes.orContainer}>
              <div className={classes.orLine} />
              <div>
                <Typography variant="body2" color="textSecondary">
                  OR
                </Typography>
              </div>
              <div className={classes.orLine} />
            </div>
            <LoginWithFacebook color="secondary" iconColor="blue" />
            <AuthError error={error} />
            <Button fullWidth color="secondary">
              <Typography variant="caption">Forgot Password?</Typography>
            </Button>
          </Card>
          <Card className={classes.signUpCard}>
            <Typography align="right" variant="body2">
              Don't have an account?
            </Typography>
            <Link to="/accounts/emailsignup">
              <Button color="primary" className={classes.signUpButton}>
                Sign up
              </Button>
            </Link>
          </Card>
        </article>
      </section>
    </>
  );
}
export const LoginWithFacebook = ({ color, iconColor, variant }) => {
  const classes = useLoginPageStyles();
  const { loginInWithGoogle } = useContext(AuthContext);
  const [error, setError] = useState("");
  const history = useHistory();
  async function handleLoginWihGoogle() {
    try {
      setError("");
      await loginInWithGoogle();
      setTimeout(() => {
        history.push("/");
      }, 10);
    } catch (e) {
      console.error("error logging in with Google", e);
      setError(e.message);
    }
  }
  const facebookIcon =
    iconColor === "blue" ? FacebookIconBlue : FacebookIconWhite;

  return (
    <>
      <Button
        onClick={handleLoginWihGoogle}
        fullWidth
        color={color}
        variant={variant}
      >
        <img
          src={facebookIcon}
          alt="facebook icon"
          className={classes.facebookIcon}
        />
        Login With Facebook
      </Button>
      <AuthError error={error} />
    </>
  );
};

export default LoginPage;
