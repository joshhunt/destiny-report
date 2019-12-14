import {
  DestinyActivityDefinition,
  DestinyInventoryItemDefinition,
  DestinyPresentationNodeDefinition,
  DestinyRecordDefinition
} from "bungie-api-ts/destiny2/interfaces";

type DefinitionsObject<Definition> = {
  [key: string]: Definition | undefined;
};

export interface DestinyWorldDefinitions {
  DestinyRecordDefinition?: DefinitionsObject<DestinyRecordDefinition>;
  DestinyActivityDefinition?: DefinitionsObject<DestinyActivityDefinition>;
  DestinyInventoryItemDefinition?: DefinitionsObject<
    DestinyInventoryItemDefinition
  >;
  DestinyPresentationNodeDefinition?: DefinitionsObject<
    DestinyPresentationNodeDefinition
  >;
}

export type DefinitionsState = Record<string, any>;

export interface DefintionsDispatchData {
  tableName: string;
  definitions: DestinyWorldDefinitions;
}
