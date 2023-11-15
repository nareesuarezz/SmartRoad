import React from 'react';
import ReactDOM from 'react-dom';
import './Login.css'

function Login() {
  return (
    <div className="container">
      <div className="form-box">
        <div className="header-form">
          <h4 className="text-primary text-center"><i className="fa fa-user-circle" style={{ fontSize: "110px" }}></i></h4>
          <div className="image">
          </div>
        </div>
        <div className="body-form">
          <form>
            <div className="input-group mb-3">
              <div className="input-group-prepend">
                <span className="input-group-text"><i className="fa fa-user"></i></span>
              </div>
              <input type="text" className="form-control" placeholder="Username" />
            </div>
            <div className="input-group mb-3">
              <div className="input-group-prepend">
                <span className="input-group-text"><i className="fa fa-lock"></i></span>
              </div>
              <input type="text" className="form-control" placeholder="Password" />
            </div>
            <button type="button" className="btn btn-secondary btn-block">LOGIN</button>
            <div className="message">
              <div><input type="checkbox" /> Relembre-me</div>
              <div><a href="#">Esqueci a senha</a></div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;

ReactDOM.render(<Login />, document.getElementById('root'));
