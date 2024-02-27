
import { useContext, useEffect, useState } from "react";
import AppContext from "../providers/AppContext";

const Loading = ({ children }) => {
  const { userData } = useContext(AppContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userData) {
      setLoading(false);
    }
  }, [userData]);

  if (loading) {
    return <h1>LOADING...</h1>;
  }

  return <>{children}</>;
};

export default Loading;