import './App.css';
import Tagger from './Screens/tagger.js';
import Login from './Screens/Login'
import { useAPI } from './Services/api'
import useToken from './Services/useToken';
import Nav from './Components/nav'


function App() {
  const token = useToken()
  const [ jwt, setToken ] = token
  const api = useAPI({token})

  return (
    <div className="App">
      <Nav onSignOut={jwt?setToken:null} />
      {jwt ?
        <Tagger api={api} />
        :
        <Login token={token} />
      }
    </div>
  );
}

export default App;
