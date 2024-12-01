import React from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../../Config/firebase";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import "../LoginForm/PasswordResetFormStyle.css";
import forgotpassImage from "../../Assets/landing_page_bkg3.jpg";
import logo_landscape from "../../Assets/PlanItFamIt Landspace Logo White-Bkg.png";

function PasswordResetForm() {
  const history = useHistory();

  const handleSubmit = async(e)=>{
    e.preventDefault()
    
    const emailVal = e.target.email.value;
    sendPasswordResetEmail(auth,emailVal).then(data=>{
        alert("Check your email, refresh if needed!")
        history.push("/")
    }).catch(err=>{
        alert(err.code)
    })
  }

  return (
    <>
      <section className="bg-light p-3 p-md-4 p-xl-5 full-page">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-xxl-11">
              <div className="card border-light-subtle shadow-sm">
                <div className="row g-0">
                  <div className="col-12 col-md-6">
                    <img className="img-fluid rounded-start w-100 h-100 object-fit-cover" loading="lazy" src= { forgotpassImage } alt="Forgot password illustration holder."/>
                  </div>
                  <div className="col-12 col-md-6 d-flex align-items-center justify-content-center">
                    <div className="col-12 col-lg-11 col-xl-10">
                      <div className="card-body p-3 p-md-4 p-xl-5">
                        <div className="row">
                          <div className="col-12">
                            <div className="mb-5">
                              
                              <div className="text-center mb-4">
                                <a href="/Resetyourpassword">
                                  <img className="image-fluid" src= { logo_landscape } alt="PlanItFamIt Landscape Logo" width="375" height="87"/>
                                </a>
                              </div>
                              <h2 className="h4 text-center">Password Reset</h2>
                              <h3 className="fs-6 fw-normal text-secondary text-center m-0">Provide the email address associated with your account 
                              to recover your password.  <br/>Also, make sure the email is registered!</h3>
                            </div>
                          </div>
                        </div>


                        <form onSubmit={handleSubmit}>
                          <div className="row gy-3 overflow-hidden">
                            <div className="col-12">
                              <div className="form-floating mb-3">
                                <input type="email" className="form-control" name="email" id="email" placeholder="name@example.com" required/>
                                <label for="email" className="form-label">Email</label>
                              </div>
                            </div>
                            <div className="col-12">
                              <div className="d-grid">
                                <button className="btn btn-dark btn-lg" type="submit">Reset Password</button>
                              </div>
                            </div>
                          </div>
                        </form>

                        
                        <div className="row">
                          <div className="col-12">
                            <div className="d-flex gap-2 gap-md-4 flex-column flex-md-row justify-content-md-center mt-5">
                              <a href="/Login" className="link-secondary text-decoration-none">Login</a>
                              <a href="/Register" className="link-secondary text-decoration-none">Register</a>
                            </div>
                          </div>
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
    </>
  );
}

export default PasswordResetForm;
