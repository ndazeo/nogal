import './App.css';
import React, { Suspense, useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { APIContext, createAPI } from './Services/api';
import useToken from './Services/useToken';
import Nav from './Components/nav';
import Loading from './Components/loading';

import Login from './Login/Login'
const AdminConsole = React.lazy(() => import('./Admin/console.js'));
const SeriesTagger = React.lazy(() => import('./Series/tagger.js'));
const ImageTagger = React.lazy(() => import('./Image/tagger.js'));


function App() {
  const [token, saveToken] = useToken()
  const [user, setUser] = useState(null)
  const navigate = useNavigate();

  const updateAPI = async (props) => {
    if (props.token !== undefined) saveToken(props.token)
    await setAPI(createAPI({ token: api.token, db: api.db, updateAPI, ...props }))
  }
  const [api, setAPI] = useState(createAPI({ token, updateAPI }))
  

  useEffect(() => {
    if (token && user && user.dbs && user.dbs.length > 0) {
      let db = user.dbs[0]
      if (!user.dbs.includes(api.db)) api.update({db})
    }
  }, [user, api])

  useEffect(() => {
    if(api.token)
      api.getUser().then(user => setUser(user))
    else
      setUser(null)
  }, [api])

  const Home = () => {
    if(user && user.home)
      return (<Navigate to={user.home} />)
    else
      return (<Login />)
  }

  const logout = async () => api.update({token:null})
  const onlyAuth = (element) => token && api.token ? element : <Login />

  return (
    <div className="App">
      <APIContext.Provider value={{api, user}}>
        <Nav onSignOut={user ? logout : null} />
        <Suspense fallback={<Loading visible="true"></Loading>}>
            <Routes>
              <Route path="/admin/*" element={onlyAuth(<AdminConsole />)} />
              <Route path="/imagetagger" element={onlyAuth(<ImageTagger />)} />
              <Route path="/seriestagger" element={onlyAuth(<SeriesTagger />)} />
              <Route path="*" element={<Home /> } />
            </Routes>
        </Suspense>
      </APIContext.Provider>
    </div>
  );
}

export default App;
