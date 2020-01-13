import React from "react";

import definitionsContext from "./definitionsContext";
import { useReducer, useEffect } from "react";
import {
  DefinitionsState,
  DefintionsDispatchData,
  DestinyWorldDefinitions
} from "./types";
import { getDefinitions } from "./getDefinitions";

let lastArray: string[] = [];
function stableTable(currentArray: string[]) {
  if (currentArray === lastArray) {
    return lastArray;
  }

  let isDifferent = false;

  for (let index = 0; index < currentArray.length; index++) {
    if (currentArray[index] !== lastArray[index]) {
      console.log(
        "Array",
        currentArray,
        "is different to previous array",
        lastArray,
        "because now in index",
        index,
        "there is the value",
        currentArray[index],
        "but previously it was",
        lastArray[index]
      );
      isDifferent = true;
      continue;
    }
  }

  if (isDifferent) {
    lastArray = currentArray;
  }

  return lastArray;
}

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
  const memoizedTables = stableTable(tables);

  useEffect(() => {
    console.log(
      "With Definitions effect is running. Apparently tables changed?"
    );
    getDefinitions(memoizedTables, (data: DefintionsDispatchData) => {
      dispatchDefinition(data);
    });
  }, [memoizedTables]);

  const Provider = definitionsContext.Provider;

  return <Provider value={store}>{children}</Provider>;
};

export default WithDefinitions;
