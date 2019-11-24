import { createBrowserHistory } from "history";
import { createContext, useContext, useState, useEffect } from "react";

const history = createBrowserHistory();

export default history;
export const HistoryContext = createContext(history);
export const useHistory = () => useContext(HistoryContext);

export const useLocation = () => {
  const history = useHistory();
  const [_location, setLocation] = useState(history.location);

  useEffect(() => {
    return history.listen(newLocation => setLocation(newLocation));
  }, [history]);

  return _location;
};
