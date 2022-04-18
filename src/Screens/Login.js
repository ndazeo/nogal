import React, { useRef, useState } from 'react';
import './login.css';
import base64 from 'react-native-base64';
import { login } from '../Services/api'

const Login = (props) => {
  const [error, setError] = useState(false);
  const user = useRef(null);
  const pass = useRef(null);
  const [, setToken] = props.token


  const loginHandler = async () => {
    const userData = 'Basic ' + base64.encode(user.current.value + ":" + pass.current.value);
    let token = await login(userData);
    setToken(token)
    if (!token) {
      setError(true);
    } else {
      setError(false);
    }
  }

  const clearError = () => {
    setError(false);
  }

  return (
    <div className="contenedor">
      <div className="loginForm">

        <label htmlFor="email">User</label>
        <input ref={user} onChange={clearError} type="text" placeholder="Ingresar Usuario" />

        <label htmlFor="password">Password</label>
        <input ref={pass} onChange={clearError} type="password" placeholder="Ingresar contraseña" />

        <div className="form-group">
          <button onClick={loginHandler} >Login</button>
          {
            error ?
              <div className="errorMsg">
                <p>Wrong user or password!</p>
              </div>
              :
              <div></div>
          }
        </div>
      </div>
    </div>

  )
}


export default Login
