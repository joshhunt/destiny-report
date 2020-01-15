import {
  DestinyActivityDefinition,
  DestinyInventoryItemDefinition,
  DestinyPresentationNodeDefinition,
  DestinyRecordDefinition
} from "bungie-api-ts/destiny2/interfaces";

type DefinitionsObject<Definition> = {
  [key: string]: Definition | undefined;
};

export type DestinyRecordDefinitionCollection = DefinitionsObject<
  DestinyRecordDefinition
>;
export type DestinyActivityDefinitionCollection = DefinitionsObject<
  DestinyActivityDefinition
>;
export type DestinyInventoryItemDefinitionCollection = DefinitionsObject<
  DestinyInventoryItemDefinition
>;
export type DestinyPresentationNodeDefinitionCollection = DefinitionsObject<
  DestinyPresentationNodeDefinition
>;

export interface DestinyWorldDefinitions {
  DestinyRecordDefinition?: DestinyRecordDefinitionCollection;
  DestinyActivityDefinition?: DestinyActivityDefinitionCollection;
  DestinyInventoryItemDefinition?: DestinyInventoryItemDefinitionCollection;
  DestinyPresentationNodeDefinition?: DestinyPresentationNodeDefinitionCollection;
}

export type DefinitionsState = Record<string, any>;

export interface DefintionsDispatchData {
  tableName: string;
  definitions: DestinyWorldDefinitions;
}
