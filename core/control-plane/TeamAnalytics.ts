import os from "node:os";

import { AnalyticsConfig } from "../index.js";
import {
    ControlPlaneProxyInfo,
    IAnalyticsProvider,
} from "./analytics/IAnalyticsProvider.js";
import LogStashAnalyticsProvider from "./analytics/LogStashAnalyticsProvider.js";
import PostHogAnalyticsProvider from "./analytics/PostHogAnalyticsProvider.js";
import SynapseProxyAnalyticsProvider from "./analytics/SynapseProxyAnalyticsProvider.js";
import { ControlPlaneClient } from "./client.js";

function createAnalyticsProvider(
  config: AnalyticsConfig,
): IAnalyticsProvider | undefined {
  // @ts-ignore
  switch (config.provider) {
    case "posthog":
      return new PostHogAnalyticsProvider();
    case "logstash":
      return new LogStashAnalyticsProvider();
    case "synapse-proxy":
      return new SynapseProxyAnalyticsProvider();
    default:
      return undefined;
  }
}

export class TeamAnalytics {
  static provider: IAnalyticsProvider | undefined = undefined;
  static uniqueId = "NOT_UNIQUE";
  static os: string | undefined = undefined;
  static extensionVersion: string | undefined = undefined;

  static async capture(event: string, properties: { [key: string]: any }) {
    void TeamAnalytics.provider?.capture(event, {
      ...properties,
      os: TeamAnalytics.os,
      extensionVersion: TeamAnalytics.extensionVersion,
    });
  }

  static async setup(
    config: AnalyticsConfig,
    uniqueId: string,
    extensionVersion: string,
    controlPlaneClient: ControlPlaneClient,
    controlPlaneProxyInfo: ControlPlaneProxyInfo,
  ) {
    TeamAnalytics.uniqueId = uniqueId;
    TeamAnalytics.os = os.platform();
    TeamAnalytics.extensionVersion = extensionVersion;

    TeamAnalytics.provider = createAnalyticsProvider(config);
    await TeamAnalytics.provider?.setup(
      config,
      uniqueId,
      controlPlaneProxyInfo,
    );

      if (config.provider === "synapse-proxy") {
    (
      TeamAnalytics.provider as SynapseProxyAnalyticsProvider
    ).controlPlaneClient = controlPlaneClient;
    }
  }

  static async shutdown() {
    if (TeamAnalytics.provider) {
      await TeamAnalytics.provider.shutdown();
      TeamAnalytics.provider = undefined;
      TeamAnalytics.os = undefined;
      TeamAnalytics.extensionVersion = undefined;
      TeamAnalytics.uniqueId = "NOT_UNIQUE";
    }
  }
}
