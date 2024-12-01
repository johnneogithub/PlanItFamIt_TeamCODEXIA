import React from 'react';
import { useHistory } from 'react-router-dom';
import '../Global/Error404Style.css';

const Error404 = () => {
    const history = useHistory();

    const goBack = () => {
        history.goBack();
    };

    return (
        <div className="error-404-container">
            <h1 className="error-404-code">404</h1>
            <p className="error-404-msg">Oops! Page Not Found</p>
            <p className="error-404-msg2">We can't seem to find the page you're looking for. <br/> Find more with PlanItFamIt! </p>
            <button className="go-back-btn" onClick={goBack}>Go Back</button>
        </div>
    );
};

export default Error404;

