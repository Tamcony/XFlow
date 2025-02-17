/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { produce } from 'immer';
import { create } from 'zustand';
import type { UseBoundStore, StoreApi } from 'zustand';

import type { NodeOptions, EdgeOptions } from '../types';

export type Command =
  | 'init'
  | 'addNodes'
  | 'removeNodes'
  | 'updateNode'
  | 'addEdges'
  | 'removeEdges'
  | 'updateEdge';

export type ChangeItem = {
  command: Command;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
};

export type State = {
  changeList: ChangeItem[];
  nodes: NodeOptions[];
  edges: EdgeOptions[];
};

type ActionOptions = {
  silent?: boolean;
};

export type Actions = {
  initData: (
    data: { nodes: NodeOptions[]; edges: EdgeOptions[] },
    options?: ActionOptions,
  ) => void;
  addNodes: (ns: NodeOptions[], options?: ActionOptions) => void;
  removeNodes: (ids: string[], options?: ActionOptions) => void;
  updateNode: (id: string, data: Partial<NodeOptions>, options?: ActionOptions) => void;
  addEdges: (es: EdgeOptions[], options?: ActionOptions) => void;
  removeEdges: (ids: string[], options?: ActionOptions) => void;
  updateEdge: (id: string, data: Partial<EdgeOptions>, options?: ActionOptions) => void;
  clearChangeList: () => void;
};

export type GraphStore = UseBoundStore<StoreApi<State & Actions>>;

export const createGraphStore = () => {
  return create<State & Actions>((set) => ({
    nodes: [],
    edges: [],
    changeList: [],

    initData: (data, options) =>
      set(
        produce((state: State) => {
          state.nodes = data.nodes;
          state.edges = data.edges;
          if (!options?.silent) {
            state.changeList.push({
              command: 'init',
              data,
            });
          }
        }),
      ),

    addNodes: (ns, options) =>
      set(
        produce((state: State) => {
          if (!ns.length) return;
          const duplicated = state.nodes.find((n) => ns.some((m) => m.id === n.id));
          if (!duplicated) {
            state.nodes.push(...ns);
            if (!options?.silent) {
              state.changeList.push({
                command: 'addNodes',
                data: ns,
              });
            }
          } else {
            console.error(`node id=${duplicated.id} already existed`);
          }
        }),
      ),

    removeNodes: (ids, options) =>
      set(
        produce((state: State) => {
          if (!ids.length) return;
          state.nodes = state.nodes.filter((n) => !ids.includes(n.id!));
          if (!options?.silent) {
            state.changeList.push({
              command: 'removeNodes',
              data: ids,
            });
          }
        }),
      ),

    updateNode: (id, data, options) =>
      set(
        produce((state: State) => {
          const node = state.nodes.find((n) => n.id === id);
          if (node) {
            Object.assign(node, data);
            if (!options?.silent) {
              state.changeList.push({
                command: 'updateNode',
                data: { id, data },
              });
            }
          }
        }),
      ),

    addEdges: (es, options) =>
      set(
        produce((state: State) => {
          if (!es.length) return;
          const duplicated = state.edges.find((e) => es.some((m) => m.id === e.id));
          if (!duplicated) {
            state.edges.push(...es);
            if (!options?.silent) {
              state.changeList.push({
                command: 'addEdges',
                data: es,
              });
            }
          } else {
            console.error(`edge id=${duplicated.id} already existed`);
          }
        }),
      ),

    removeEdges: (ids, options) =>
      set(
        produce((state: State) => {
          if (!ids.length) return;
          state.edges = state.edges.filter((n) => !ids.includes(n.id!));
          if (!options?.silent) {
            state.changeList.push({
              command: 'removeEdges',
              data: ids,
            });
          }
        }),
      ),

    updateEdge: (id, data, options) =>
      set(
        produce((state: State) => {
          const edge = state.edges.find((n) => n.id === id);
          if (edge) {
            Object.assign(edge, data);
            if (!options?.silent) {
              state.changeList.push({
                command: 'updateEdge',
                data: { id, data },
              });
            }
          }
        }),
      ),

    clearChangeList: () =>
      set(
        produce((state: State) => {
          state.changeList = [];
        }),
      ),
  }));
};
