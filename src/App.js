import './App.css';
import React, { Suspense, useState, useEffect } from 'react';
import { useAPI } from './Services/api';
import useToken from './Services/useToken';
import Nav from './Components/nav';
import Loading from './Components/loading';

import Login from './Login/Login'
const SeriesTagger = React.lazy(() => import('./Series/tagger.js'));


function App() {
  const token = useToken()
  const [user, setUser] = useState(null)
  const [jwt, setToken] = token
  const api = useAPI({ token })
  
  useEffect(() => {
    if (!jwt){
      setUser(null);
      return;
    } 
    
    api.getUser().then(user => setUser(user))
    
  }, [jwt, api])
  
  return (
    <div className="App">
      <Nav onSignOut={jwt ? setToken : null} />
      <Suspense fallback={<Loading visible="true"></Loading>}>
      {user && user.home ?
          {
            'admin': <SeriesTagger  api={api} />,
            'series': <SeriesTagger api={api} />,
          }[user.home]
        :
        <Login token={token} />
      }
      </Suspense>
    </div>
  );
}

export default App;
