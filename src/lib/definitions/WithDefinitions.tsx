import React from "react";

import definitionsContext from "./definitionsContext";
import { useReducer, useEffect } from "react";
import {
  DefinitionsState,
  DefintionsDispatchData,
  DestinyWorldDefinitions
} from "./types";
import { getDefinitions } from "./getDefinitions";

const definitionsReducer = (
  state: DefinitionsState,
  data: DefintionsDispatchData
) => ({
  ...state,
  [data.tableName]: data.definitions
});

const WithDefinitions: React.FC<{
  tables: (keyof DestinyWorldDefinitions)[];
}> = ({ tables, children }) => {
  const [store, dispatchDefinition] = useReducer(definitionsReducer, {});

  useEffect(() => {
    console.log(
      "With Definitions effect is running. Apparently tables changed?"
    );
    getDefinitions(tables, (data: DefintionsDispatchData) => {
      dispatchDefinition(data);
    });
  }, [tables]);

  const Provider = definitionsContext.Provider;

  return <Provider value={store}>{children}</Provider>;
};

export default WithDefinitions;
