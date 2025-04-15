import { useState, useEffect } from 'react';

const usePasswordMatch = (password, confirmPassword) => {
  const [error, setError] = useState("");

  useEffect(() => {
    if (!password || !confirmPassword) {
      setError("");
    } else if (password !== confirmPassword) {
      setError("Passwords do not match.");
    } else {
      setError("");
    }
  }, [password, confirmPassword]);

  return {
    isMatching: password === confirmPassword && password !== "",
    error,
  };
};

export default usePasswordMatch;
