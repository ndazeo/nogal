import React, { useRef, useState, useContext } from 'react';
import './login.css';
import base64 from 'react-native-base64';
import { APIContext } from '../Services/api'

const Login = (props) => {
  const { api } = useContext(APIContext);
  const [error, setError] = useState(false);
  const user = useRef(null);
  const pass = useRef(null);
  
  const loginHandler = async (e) => {
    e.preventDefault();
    const userData = 'Basic ' + base64.encode(user.current.value + ":" + pass.current.value);
    let token = await api.login(userData);
    api.update({token: token})
    if (!token) {
      setError(true);
    } else {
      setError(false);
    }
    return false;
  }

  const clearError = () => {
    setError(false);
  }

  return (
    <div className="contenedor">
      <div className="loginForm">
        <form onSubmit={loginHandler}>
          <label htmlFor="email">User</label>
          <input ref={user} onChange={clearError} type="text" placeholder="Ingresar Usuario" />

          <label htmlFor="password">Password</label>
          <input ref={pass} onChange={clearError} type="password" placeholder="Ingresar contraseña" />

          <div className="form-group">
            <button type="submit" >Login</button>
            {
              error ?
                <div className="errorMsg">
                  <p>Wrong user or password!</p>
                </div>
                :
                <div></div>
            }
          </div>
        </form>
      </div>
    </div>

  )
}


export default Login
