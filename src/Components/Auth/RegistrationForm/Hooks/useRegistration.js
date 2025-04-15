import { useState, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import {
  getAuth,
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  sendEmailVerification,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  runTransaction,
  setDoc,
} from "firebase/firestore";

const useRegistrationForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleInitial, setMiddleInitial] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthdate, setBirthdate] = useState(null);

  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [termsModalIsOpen, setTermsModalIsOpen] = useState(false);
  const [privacyModalIsOpen, setPrivacyModalIsOpen] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const history = useHistory();
  const location = useLocation();

  const calculateAge = (birthdate) => {
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  useEffect(() => {
    setTermsModalIsOpen(location.pathname === "/Register/TermsAndConditions");
    setPrivacyModalIsOpen(location.pathname === "/Register/DataPrivacyAct");
  }, [location.pathname]);

  const openTermsModal = (e) => {
    e?.preventDefault();
    history.push("/Register/TermsAndConditions");
  };

  const openPrivacyModal = (e) => {
    e?.preventDefault();
    history.push("/Register/DataPrivacyAct");
  };

  const closeTermsModal = () => {
    setTermsModalIsOpen(false);
    history.replace("/Register");
  };

  const agreeToTerms = () => {
    setAgreedToTerms(true);
    closeTermsModal();
  };

  const closePrivacyModal = () => {
    setPrivacyModalIsOpen(false);
    history.replace("/Register");
  };

  const agreeToPrivacy = () => {
    setAgreedToPrivacy(true);
    closePrivacyModal();
  };

  const handleTermsCheckboxChange = () => {
    setAgreedToTerms((prev) => !prev);
  };

  const handlePrivacyCheckboxChange = () => {
    setAgreedToPrivacy((prev) => !prev);
  };

  const SignUp = async (e) => {
    e.preventDefault();

    if (!birthdate) {
      alert("Please select your birthdate.");
      return;
    }

    const age = calculateAge(birthdate);

    if (age < 20) {
      alert("You must be 20 years old or older to register.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords don't match!");
      return;
    }

    if (!agreedToTerms || !agreedToPrivacy) {
      alert(
        "You must agree to both Terms and Conditions and Data Privacy Act to register."
      );
      return;
    }

    const auth = getAuth();
    const firestore = getFirestore();

    try {
      const existingUser = await fetchSignInMethodsForEmail(auth, email);
      if (existingUser.length > 0) {
        alert("This email is already registered.");
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await setDoc(doc(firestore, "users", user.uid), {
        firstName,
        middleInitial,
        lastName,
        email,
        birthdate: birthdate.toISOString(),
        age,
        createdAt: new Date().toISOString(),
      });

      await sendEmailVerification(user);
      alert("Verification email sent.");

      const userCountRef = doc(firestore, "statistics", "userCount");
      await runTransaction(firestore, async (transaction) => {
        const userCountDoc = await transaction.get(userCountRef);
        if (!userCountDoc.exists()) {
          transaction.set(userCountRef, { count: 1 });
        } else {
          transaction.update(userCountRef, {
            count: userCountDoc.data().count + 1,
          });
        }
      });

      setRegistrationSuccess(true);
      setTimeout(() => {
        history.push("/Login");
      }, 2000);
    } catch (error) {
      console.error("Error registering user:", error.message);
      alert("Error: " + error.message);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    firstName,
    setFirstName,
    middleInitial,
    setMiddleInitial,
    lastName,
    setLastName,
    birthdate,
    setBirthdate,
    agreedToTerms,
    agreedToPrivacy,
    termsModalIsOpen,
    privacyModalIsOpen,
    registrationSuccess,
    openTermsModal,
    openPrivacyModal,
    closeTermsModal,
    agreeToTerms,
    closePrivacyModal,
    agreeToPrivacy,
    handleTermsCheckboxChange,
    handlePrivacyCheckboxChange,
    SignUp,
    calculateAge,
  };
};

export default useRegistrationForm;
