import { IContextProvider } from "core";

import { VsCodeExtension } from "../extension/VsCodeExtension";

export class VsCodeSynapseApi {
  constructor(private readonly vscodeExtension: VsCodeExtension) {}

  registerCustomContextProvider(contextProvider: IContextProvider) {
    this.vscodeExtension.registerCustomContextProvider(contextProvider);
  }
}
