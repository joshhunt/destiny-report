import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import Home from "./views/Home";
import Triumphs from "./views/Triumphs";

const App: React.FC = () => {
  return (
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
  );
};

export default App;
