import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useAuth } from "../../../../AuthContext";
import { toast } from "react-toastify";

const useLoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const history = useHistory();
  const auth = getAuth();
  const { loginAsUser } = useAuth();

  useEffect(() => {
    const storedEmail = localStorage.getItem("rememberedEmail");
    if (storedEmail) {
      setEmail(storedEmail);
      setRememberMe(true);
    }
  }, []);

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const SignIn = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        toast.warning("Please verify your email before logging in", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
        });
        return;
      }

      loginAsUser(user);

      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      toast.success("Login successful! Redirecting...", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
      });

      setTimeout(() => {
        history.push("/home");
      }, 2000);
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        toast.error("No account found. Please register or verify your email.", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
        });
      } else if (error.code === "auth/wrong-password") {
        toast.error("Incorrect password. Please try again.", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
        });
      } else {
        toast.error(`Login failed: ${error.message}`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
        });
      }
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    rememberMe,
    setRememberMe,
    showPassword,
    toggleShowPassword,
    SignIn,
  };
};

export default useLoginForm;
