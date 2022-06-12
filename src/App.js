import './App.css';
import React, { Suspense, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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

  const updateAPI = (props) => {
    if (props.token) saveToken(props.token)
    setAPI(createAPI({ token: api.token, db: api.db, updateAPI, ...props }))
  }
  const [api, setAPI] = useState(createAPI({ token, updateAPI }))
  

  useEffect(() => {
    if (user && user.dbs && user.dbs.length > 0) {
      let db = user.dbs[0]
      if (!user.dbs.includes(api.db)) api.update({db})
    }
  }, [user, api])

  useEffect(() => {
    api.getUser().then(user => setUser(user))
  }, [api])

  const Home = () => {
    if(user && user.home)
      return (<Navigate to={user.home} />)
    else
      return (<Login />)
  }

  return (
    <div className="App">
      <APIContext.Provider value={{api, user}}>
        <Nav onSignOut={user ? ()=>{updateAPI({token:null})} : null} />
        <Suspense fallback={<Loading visible="true"></Loading>}>
          <Router>
            <Routes>
              <Route path="/admin/*" element={<AdminConsole />} />
              <Route path="/imagetagger" element={<ImageTagger />} />
              <Route path="/seriestagger" element={<SeriesTagger />} />
              <Route path="*" element={<Home /> } />
            </Routes>
          </Router>
        </Suspense>
      </APIContext.Provider>
    </div>
  );
}

export default App;
