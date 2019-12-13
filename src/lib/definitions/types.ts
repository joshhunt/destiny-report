import {
  DestinyActivityDefinition,
  DestinyInventoryItemDefinition,
  DestinyPresentationNodeDefinition
} from "bungie-api-ts/destiny2/interfaces";

type DefinitionsObject<Definition> = {
  [key: string]: Definition | undefined;
};

export interface DestinyWorldDefinitions {
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
