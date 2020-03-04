import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import Home from "./views/Home";
import Triumphs from "./views/Triumphs";
import { BungieAuthProvider } from "./lib/bungieAuth";

const App: React.FC = () => {
  return (
    <BungieAuthProvider>
      <Router>
        <Switch>
          <Route path="/triumphs">
            <Triumphs />
          </Route>

          <Route path="/:membershipType(\d+)/:membershipId(\d+)">
            <Home />
          </Route>

          <Route path="/">
            <Home />
          </Route>
        </Switch>
      </Router>
    </BungieAuthProvider>
  );
};

export default App;
