import { BrowserRouter } from "react-router-dom";
import "./App.css";
import AppContext from "./providers/AppContext";
import { useState } from "react";


const App = () => {

  const [context, setContext] = useState({
    user: null,
    userData: null
  });

  return(
    <>
    <AppContext.Provider value={{ ...context, setContext }}>
      <BrowserRouter>
        <div className="App">

        </div>
      </BrowserRouter>
    </AppContext.Provider>
  </>
  );
};

export default App;
