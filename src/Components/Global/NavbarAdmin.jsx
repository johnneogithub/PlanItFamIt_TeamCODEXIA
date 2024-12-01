import './NavbarAdmin.css'
import Moment from 'react-moment';


import logostmargaret from '../Assets/stmargaretlogo.png'

const NavbarAdmin = () => {
  let date = new Date();
  return (
    <>


      <nav className='navbaradmin'>
        
        
        <div className='navbar-logo-admin'>
          <h1>PlanIt<span>FamIt</span></h1>
        </div>
        <div className='logo-st-margaret-style'>
          <img className='logo-sizes' src={logostmargaret} alt="" />
          <p>St.Margaret Lying In Clinic</p>
        </div>
        <div className='navbar-MDYT'>
      <Moment format="dddd, MMMM  YYYY, h:mm A">{date}</Moment>
    </div>

      </nav>

    
</>
  )
}
export default NavbarAdmin;