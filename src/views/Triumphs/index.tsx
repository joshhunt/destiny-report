import React, { useState, useEffect, useMemo } from "react";

import s from "./styles.module.scss";
import { useDefinitions } from "../../lib/definitions";

const ROOT_TRIUMPH_NODE = 1024788583;

function useLocalStorage<Value>(
  key: string,
  initialValue: Value
): [Value, (v: Value) => void] {
  const previousInitialValue = useMemo(() => {
    const previous = window.localStorage.getItem(key);
    return previous && JSON.parse(previous);
  }, [key]);

  const [value, setValue] = useState<Value>(
    previousInitialValue || initialValue
  );

  const setter = (newValue: Value) => {
    setValue(newValue);
    window.localStorage.setItem(key, JSON.stringify(newValue));
  };

  return [value, setter];
}

const Record: React.FC<{ recordHash: number }> = ({ recordHash }) => {
  const { DestinyRecordDefinition: recordDefs } = useDefinitions();

  const record = recordDefs && recordDefs[recordHash];

  if (!record) {
    return null;
  }

  return (
    <div className={s.record}>
      <div className={s.recordTitle}>{record.displayProperties.name}</div>
      <div className={s.recordDescription}>
        {record.displayProperties.description}
      </div>
    </div>
  );
};

const Node: React.FC<{
  noUi?: boolean;
  presentationNodeHash: number;
}> = ({ noUi, presentationNodeHash }) => {
  const { DestinyPresentationNodeDefinition: nodeDefs } = useDefinitions();
  const [isCollapsed, setIsCollapsed] = useLocalStorage(
    `collapsed_${presentationNodeHash}`,
    false
  );
  const node = nodeDefs && nodeDefs[presentationNodeHash];

  return node ? (
    <div className={s.node}>
      {!noUi && (
        <div className={s.side}>
          <button
            className={isCollapsed ? s.expandButton : s.collapseButton}
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? "expand" : "collapse"}
          </button>
        </div>
      )}

      <div className={s.main}>
        {!noUi && (
          <p
            className={s.nodeHeading}
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {node.displayProperties.name}{" "}
          </p>
        )}

        {!isCollapsed && (
          <div>
            {node.children.presentationNodes.map(child => {
              return (
                <Node
                  key={child.presentationNodeHash}
                  presentationNodeHash={child.presentationNodeHash}
                />
              );
            })}

            {node.children.records.map(child => {
              return (
                <Record key={child.recordHash} recordHash={child.recordHash} />
              );
            })}
          </div>
        )}
      </div>
    </div>
  ) : null;
};

const Triumphs = function() {
  return (
    <div className={s.root}>
      <h2>Triumphs</h2>

      <div className={s.triumphs}>
        <Node noUi presentationNodeHash={ROOT_TRIUMPH_NODE} />
      </div>
    </div>
  );
};

export default Triumphs;
