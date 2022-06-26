import './App.css';
import React, { Suspense, useState, useEffect } from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import { APIContext, createAPI } from './Services/api';
import Nav from './Components/nav';
import Loading from './Components/loading';

import Login from './Login/Login'
const AdminConsole = React.lazy(() => import('./Admin/console.js'));
const SeriesTagger = React.lazy(() => import('./Series/tagger.js'));
const ImageTagger = React.lazy(() => import('./Image/tagger.js'));


function App() {
  const [user, setUser] = useState(null)

  const updateAPI = async (props) => {
    await setAPI(createAPI({ db: api.db, updateAPI, ...props }))
  }
  const [api, setAPI] = useState(createAPI({ updateAPI }))
  

  useEffect(() => {
    if (user && user.dbs && user.dbs.length > 0) {
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
      return (<div></div>)
  }

  const logout = async () => { console.log("logout"); api.update({token:null})}
  const onlyAuth = (element) => api.token ? element : <Login />
  
  return (
    <div className="App">
      <APIContext.Provider value={{api, user}}>
        <Nav onSignOut={user ? logout : null} />
        <Suspense fallback={<Loading visible="true"></Loading>}>
            <Routes>
              <Route path="/admin/*" element={onlyAuth(<AdminConsole />)} />
              <Route path="/imagetagger" element={onlyAuth(<ImageTagger />)} />
              <Route path="/seriestagger" element={onlyAuth(<SeriesTagger />)} />
              <Route path="*" element={onlyAuth(<Home />)} />
            </Routes>
        </Suspense>
      </APIContext.Provider>
    </div>
  );
}

export default App;
