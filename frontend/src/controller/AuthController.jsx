import { useNavigate } from "react-router-dom";
import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../model/providers/authprovider";
import UserModel from "../model/Usermodel";
import jwtDecode from "jwt-decode";

//view
import LoginView from "../view/Login.view";
export default function AuthController() {
  const [state, dispatch] = useContext(AuthContext);

  //navigate to dashboard if login successful
  const navigate = useNavigate();

  //state of login inputs
  const [userData, setUserData] = useState({
    username: "",
    password: "",
  });

  const [loginLoading, setLoginLoading] = useState(false); //pass this as value to disabled button in view
  const [loginError, setLoginError] = useState(false); //if login error true, use this for message
  const [emptyDataError, setEmptyDataError] = useState(false); //if user data is empty, set true

  //listen to changes in inputs of username and password
  const handleChange = (event) => {
    switch (event.target.id) {
      case "username":
        setUserData({ ...userData, username: event.target.value });
        break;

      case "password":
        setUserData({ ...userData, password: event.target.value });
        break;
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();

    localStorage.removeItem("token");

    if (!userData.username || !userData.password) {
      setEmptyDataError(true);
      setLoginError(false);
      return;
    }

    setLoginLoading(true);

    try {
      // Login attempt
      const token = await UserModel.login(userData.username, userData.password);
      await dispatch({ type: "SAVE_TOKEN", payload: token });

      const decodedToken = await jwtDecode(token);

      const role = await decodedToken.role;

      if (role === "player") {
        setTimeout(() => {
          navigate("/player/dashboard");
        }, 1000);
      } else if (role === "builder") {
        setTimeout(() => {
          navigate("/builder/dashboard");
        }, 1000);
      }
    } catch (err) {
      setLoginError(true);
    } finally {
      setLoginLoading(false);
    }
  };

  useEffect(() => {
    //stored token
    let jwtToken = localStorage.getItem("token");

    if (jwtToken) {
      const decodedToken = jwtDecode(jwtToken);

      const role = decodedToken.role;

      if (role === "player") {
        navigate("/player/dashboard");
      } else if (role === "builder") {
        navigate("/builder/dashboard");
      }
    }
  }, []);

  const signup = () => {
    navigate("/signup");
  };
  return (
    <div>
      <LoginView
        onChange={handleChange}
        onSubmit={onSubmit}
        loginError={loginError}
        emptyDataError={emptyDataError}
        loginLoading={loginLoading}
        signup={signup}
      />
    </div>
  );
}
