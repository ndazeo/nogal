import './App.css';
import Tagger from './Screens/tagger.js';
import Login from './Screens/Login'
import { useAPI } from './Services/api'
import useToken from './Services/useToken';


function App() {
  const token = useToken()
  const [ jwt, ] = token 
  const api = useAPI(token)

  return (
    <div className="App">
      {jwt ?
        <Tagger api={api} />
        :
        <Login token={token} />
      }
    </div>
  );
}

export default App;
