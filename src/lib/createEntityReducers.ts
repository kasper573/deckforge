import type { PayloadAction } from "@reduxjs/toolkit";
import { v4 as uuid } from "uuid";

export type CreateAction<T, IdProperty extends keyof T> = PayloadAction<
  Omit<T, IdProperty>
>;
export type UpdateAction<T> = PayloadAction<Partial<T>>;

export const createId = <T>() => uuid() as T;

export type EntityReducers<
  State,
  Entity,
  IdProperty extends keyof Entity,
  EntityName extends string
> = {
  [K in EntityName as `create${K}`]: (
    state: State,
    action: CreateAction<Entity, IdProperty>
  ) => void;
} & {
  [K in EntityName as `update${K}`]: (
    state: State,
    action: UpdateAction<Entity>
  ) => void;
} & {
  [K in EntityName as `delete${K}`]: (
    state: State,
    action: PayloadAction<Entity[IdProperty]>
  ) => void;
};

export function createEntityReducerFactory<State>() {
  return function createFactoryForEntity<Entity>() {
    return function createReducers<
      IdProperty extends keyof Entity,
      EntityName extends string
    >(
      entityName: EntityName,
      idProperty: IdProperty,
      selectList: (state: State) => Entity[]
    ) {
      return {
        [`create${entityName}`]: (
          state: State,
          { payload }: CreateAction<Entity, IdProperty>
        ) => {
          selectList(state).push({
            ...payload,
            [idProperty]: createId(),
          } as Entity);
        },
        [`update${entityName}`]: (
          state: State,
          { payload }: UpdateAction<Entity>
        ) => {
          const id = payload[idProperty];
          const entity = selectList(state).find((e) => e[idProperty] === id);
          if (!entity) {
            throw new Error(`${entityName} with id ${id} not found`);
          }
          Object.assign(entity, payload);
        },
        [`delete${entityName}`]: (
          state: State,
          { payload: id }: PayloadAction<Entity[IdProperty]>
        ) => {
          const list = selectList(state);
          const index = list.findIndex((e) => e[idProperty] === id);
          if (index === -1) {
            throw new Error(`${entityName} with id ${id} not found`);
          }
          list.splice(index, 1);
        },
      } as EntityReducers<State, Entity, IdProperty, EntityName>;
    };
  };
}
