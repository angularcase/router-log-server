export interface RouterService {
  getConnectedMacsRaw(): Promise<any>;
  getConnectedMacs(): Promise<string[]>;
}