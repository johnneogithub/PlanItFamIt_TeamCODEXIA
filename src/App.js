// App.js
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch, useLocation } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import ProtectedRoute from './ProtectedRoute'; // Admin protected route
import UserProtectedRoute from './UserProtectedRoute'; // User protected route
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


// Import Components
import AdminLogin from './Components/Admin/AdminLogin/AdminLogin.jsx';
import Dashboard from './Components/Admin/DashboardAdmin';
import PatientsRecord from './Components/Admin/PatientsRecord';
import WelcomeLanding from './Components/Landing/WelcomeLanding.jsx';
import Error404 from './Components/Global/Error404.jsx';
import LoginForm from './Components/Auth/LoginForm/LoginForm.jsx';
import RegistrationForm from './Components/Auth/RegistrationForm/RegistrationForm.jsx';
import PasswordResetForm from './Components/Auth/LoginForm/PasswordResetForm.jsx';
import Home from './pages/Home';
import CheckHealth from './pages/CheckHealth';
import FillUpAppointment from './pages/FillUpAppointment';
import Articles from './pages/Articles';
import PregnancyWheel from './Components/Admin/PregnancyWheelLMP.jsx';
import Chatbot from './pages/Chatbot';
import UserProfile from './pages/UserProfile';
import OvulationTracker from './pages/ovulation-tracker-folder/OvulationTracker.jsx';
import Aboutus from './pages/Aboutus';
import AppointmentHistory from './pages/AppointmentHistory';
import HistoricalAppointment from './pages/HistoricalAppointment';
import PregnancyCalculator from './Components/User/PregnancyCalculator.jsx';
import ImagePreview from './pages/ImagePreview';
import ManagePackage from './Components/Admin/AdminLogin/ManagePackage.jsx';
function App() {
  return (
    <AuthProvider>
      <Router>
        <GoogleAnalyticsHandler />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        <Switch>
          <Route path='/' component={WelcomeLanding} exact />
          <Route path='/Welcome' component={WelcomeLanding} exact />
          <Route path='/Login' component={LoginForm} exact />
          <Route path='/Register' component={RegistrationForm} exact />
          <Route path='/Register/TermsAndConditions' component={RegistrationForm} exact />
          <Route path='/Register/DataPrivacyAct' component={RegistrationForm} exact />
          <Route path='/Resetyourpassword' component={PasswordResetForm} exact />
          <Route path="/StMargaretLyingInClinic" component={CheckHealth} exact />

          {/* User-protected routes */}
          <UserProtectedRoute path='/Aboutus' component={Aboutus} exact />
          <UserProtectedRoute path='/Home' component={Home} exact />
          <UserProtectedRoute path='/Articles' component={Articles} exact />
          <UserProtectedRoute path='/Chatbot' component={Chatbot} exact />
          <UserProtectedRoute path='/UserProfile' component={UserProfile} exact />
          <UserProtectedRoute path='/AppointmentHistory/:userId' component={AppointmentHistory} exact />
          <Route path="/HistoricalAppointment" component={HistoricalAppointment} exact />
          <UserProtectedRoute path='/FillUpAppointment' component={FillUpAppointment} exact />
          <UserProtectedRoute path='/OvulationTracker' component={OvulationTracker} exact />
          <UserProtectedRoute path='/PregnancyCalculator' component={PregnancyCalculator} exact />
          <Route path="/image-preview" component={ImagePreview} />

          {/* Admin-protected routes */}
          <ProtectedRoute path='/PregnancyWheel' component={PregnancyWheel} exact />
          <ProtectedRoute path='/Dashboard' component={Dashboard} exact />
          <ProtectedRoute path='/PatientsRecord' component={PatientsRecord} exact />
          <ProtectedRoute path='/ManagePackage' component={ManagePackage} exact />
          <Route path='/AdminLogin' component={AdminLogin} exact />

          {/* 404 Error Route */}
          <Route component={Error404} />

          {/* Add this to your routes */}
      
        </Switch>
      </Router>
    </AuthProvider>
  );
}

function GoogleAnalyticsHandler() {
  const location = useLocation();

  useEffect(() => {
    window.gtag('config', 'G-TQF0WD897P', {
      page_path: location.pathname + location.search,
    });
    console.log('Pageview tracked:', location.pathname + location.search);
  }, [location]);

  return null;
}

export default App;
