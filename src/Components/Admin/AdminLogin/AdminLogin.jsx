import React from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, crud } from "../../../Config/firebase";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import "../AdminLogin/AdminLoginStyle.css";
import logo_stmargaret from "../../Assets/StMargaret_Logo.jpg";
import logo_landscape from "../../Assets/PlanItFamIt Landspace Logo White-Bkg.png";
import { useAuth } from '../../../AuthContext';
import { doc, getDoc } from "firebase/firestore";

function AdminLogin() {
  const history = useHistory();
  const { loginAsAdmin } = useAuth(); // Destructure loginAsAdmin from AuthContext

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const emailVal = e.target.email.value;
    const passwordVal = e.target.password.value;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, emailVal, passwordVal);
      const user = userCredential.user;

      // Check user role
      const userDoc = await getDoc(doc(crud, 'admin', user.email));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.roles[0] === 'admin') {
          // After successful login and role check, call loginAsAdmin
          loginAsAdmin();
          // Redirect to dashboard
          history.push("/Dashboard");
        } else {
          alert("Unauthorized role");
        }
      } else {
        alert("No such document!");
      }
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <section className="bg-light p-3 p-md-4 p-xl-5 full-page">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-xxl-11">
            <div className="card border-light-subtle shadow-sm">
              <div className="row g-0">
                <div className="col-12 col-md-6">
                  <img
                    className="img-fluid rounded-start w-100 h-100 object-fit-cover"
                    loading="lazy"
                    src={logo_stmargaret}
                    alt="Admin login illustration"
                  />
                </div>
                <div className="col-12 col-md-6 d-flex align-items-center justify-content-center">
                  <div className="col-12 col-lg-11 col-xl-10">
                    <div className="card-body p-3 p-md-4 p-xl-5">
                      <div className="text-center mb-4">
                        <img
                          className="image-fluid"
                          src={logo_landscape}
                          alt="PlanItFamIt Landscape Logo"
                          width="375"
                          height="87"
                        />
                      </div>
                      <h2 className="h4 text-center">Hello, Admin!</h2>
                      <h3 className="fs-6 fw-normal text-secondary text-center m-0">
                        Login with your email and password to access the admin dashboard.
                      </h3>
                      <form onSubmit={handleSubmit}>
                        <div className="form-floating mb-2">
                          <input
                            type="email"
                            className="form-control"
                            name="email"
                            id="email"
                            placeholder="name@example.com"
                            required
                          />
                          <label htmlFor="email" className="form-label">
                            Email
                          </label>
                        </div>
                        <div className="form-floating mb-2">
                          <input
                            type="password"
                            className="form-control"
                            name="password"
                            id="password"
                            placeholder="Password"
                            required
                          />
                          <label htmlFor="password" className="form-label">
                            Password
                          </label>
                        </div>
                        <div className="d-grid">
                          <button className="btn btn-dark btn-lg" type="submit">
                            Login to Dashboard
                          </button>
                        </div>
                      </form>
                      <div className="d-flex gap-2 gap-md-4 flex-column flex-md-row justify-content-md-center mt-5">
                        <a href="/Welcome" className="link-secondary text-decoration-none">
                          Go to Welcome Page
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AdminLogin;