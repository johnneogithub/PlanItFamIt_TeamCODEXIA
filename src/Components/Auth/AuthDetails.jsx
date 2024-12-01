import { onAuthStateChanged, signOut } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { auth } from "../../Config/firebase";


const AuthDetails = () => {
const [authUser, setAuthUser] = useState(null);

    useEffect(() => {
        const listen = onAuthStateChanged(auth, (user) => {
        if (user) {
            setAuthUser(user);
        } else {
            setAuthUser(null);
        }

        });
        
        return () =>{
            listen();
        }
    
    }, []);


        const userSignOut = () => {
            signOut(auth).then (() => {
                console.log('Successfully signed out!')
            }).catch(error => console.log(error))
        }

return (
    <div>
      {authUser ? (
        <>
          <p>Welcome, Signed In as {authUser.email}!</p>
          <button onClick={signOut}>Sign Out</button>
        </>
      ) : (
        <p>Signed Out</p>
      )}
    </div>
  );
};

export default AuthDetails;