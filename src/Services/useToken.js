import { useState } from 'react';

export default function useToken() {
  const getToken = () => {
    return localStorage.getItem('token');
  };

  const [token, setToken] = useState(getToken());

  const saveToken = (token) => {
    if (token)
      localStorage.setItem('token', token);
    else
      localStorage.removeItem('token');
    setToken(token);
  };

  return [
    token,
    saveToken
  ]
}
