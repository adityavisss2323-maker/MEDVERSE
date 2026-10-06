import { createContext, useContext, useState, useEffect } from "react";

import { assets as initialAssets } from "../data/assets";
import { alerts as initialAlerts } from "../data/alerts";
import { incidents as initialIncidents } from "../data/incidents";
import { forensicEvents as initialForensics } from "../data/forensicEvents";

import { API_ENDPOINTS } from "../services/api";

const SOCContext = createContext();

export function SOCProvider({ children }) {
  const [assetList, setAssetList] = useState(initialAssets);
  const [alertList, setAlertList] = useState(initialAlerts);
  const [incidentList, setIncidentList] =
    useState(initialIncidents);

  const [forensicList, setForensicList] =
    useState(initialForensics);

  const [loading, setLoading] = useState(true);

  /* =========================================
     LOAD REAL SOC DATA
     ========================================= */

  useEffect(() => {
    const loadSOCData = async () => {
      try {
        setLoading(true);

        const [
          assetsResponse,
          alertsResponse,
          incidentsResponse,
          forensicResponse
        ] = await Promise.all([
          fetch(API_ENDPOINTS.ASSETS),
          fetch(API_ENDPOINTS.ALERTS),
          fetch(API_ENDPOINTS.INCIDENTS),
          fetch(API_ENDPOINTS.FORENSICS)
        ]);

        if (!assetsResponse.ok) {
          throw new Error("Failed to fetch assets");
        }

        if (!alertsResponse.ok) {
          throw new Error("Failed to fetch alerts");
        }

        if (!incidentsResponse.ok) {
          throw new Error("Failed to fetch incidents");
        }

        if (!forensicResponse.ok) {
          throw new Error(
            "Failed to fetch forensic data"
          );
        }

        const assetsJson =
          await assetsResponse.json();

        const alertsJson =
          await alertsResponse.json();

        const incidentsJson =
          await incidentsResponse.json();

        const forensicJson =
          await forensicResponse.json();

        /* =========================================
           ASSETS
           ========================================= */

        setAssetList(
          Array.isArray(assetsJson.data)
            ? assetsJson.data
            : initialAssets
        );

        /* =========================================
           ALERTS
           ========================================= */

        setAlertList(
          Array.isArray(alertsJson.data)
            ? alertsJson.data
            : initialAlerts
        );

        /* =========================================
           INCIDENTS
           ========================================= */

        setIncidentList(
          Array.isArray(incidentsJson.data)
            ? incidentsJson.data
            : initialIncidents
        );

        /* =========================================
           FORENSIC TIMELINES
           ========================================= */

        const forensicTimelines =
          Array.isArray(forensicJson.data)
            ? forensicJson.data
            : [];

        const forensicEvents =
          forensicTimelines.flatMap(
            (item) => {
              const assetName =
                item.asset?.name || "";

              const department =
                item.asset?.department || "";

              return (
                item.timeline || []
              ).map((event) => {

                const timestamp =
                  event.timestamp
                    ? new Date(
                        event.timestamp
                      ).toLocaleTimeString(
                        "en-US",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          hour12: false
                        }
                      )
                    : "";

                return {
                  id: event.id,

                  timestamp,

                  timeAgo: "Recorded",

                  assetId:
                    item.asset?.id || "",

                  assetName,

                  department,

                  severity:
                    event.severity ||
                    "Low",

                  eventType:
                    event.type ||
                    "EVENT",

                  title:
                    event.title || "",

                  description:
                    event.description ||
                    "",

                  incidentId:
                    item.incident?.id ||
                    "",

                  rawLog: [
                    timestamp,

                    event.source ||
                      "MED-VERSE",

                    event.type ||
                      "EVENT",

                    event.title ||
                      "",

                    event.description ||
                      "",

                    event.target
                      ? `Target: ${event.target}`
                      : "",

                    event.actionType
                      ? `Action: ${event.actionType}`
                      : "",

                    event.status
                      ? `Status: ${event.status}`
                      : ""
                  ]
                    .filter(Boolean)
                    .join(" | ")
                };
              });
            }
          );

        setForensicList(
          forensicEvents.length > 0
            ? forensicEvents
            : initialForensics
        );

      } catch (error) {
        console.info("SOC Context: Operating with local dataset fallback.");
      } finally {
        setLoading(false);
      }
    };

    loadSOCData();

  }, []);

  /* =========================================
     QUARANTINE ASSET
     
     IMPORTANT:
     Backend response action is the
     source of truth.
     
     Do NOT create a fake forensic event
     here.
     ========================================= */

  const quarantineAsset = (assetId) => {

    setAssetList((prev) =>
      prev.map((asset) => {

        if (
          String(asset.id) !==
          String(assetId)
        ) {
          return asset;
        }

        return {
          ...asset,

          status: "quarantined",

          risk: asset.risk || "low",

          simpleDescription:
            `${asset.name} has been isolated by SOC response.`
        };
      })
    );

  };

  /* =========================================
     CONTEXT
     ========================================= */

  return (
    <SOCContext.Provider
      value={{
        assetList,
        alertList,
        incidentList,
        forensicList,

        loading,

        quarantineAsset,

        setAssetList,
        setAlertList,
        setIncidentList,
        setForensicList
      }}
    >
      {children}
    </SOCContext.Provider>
  );
}

/* =========================================
   USE SOC HOOK
   ========================================= */

export function useSOC() {

  const context =
    useContext(SOCContext);

  if (!context) {
    throw new Error(
      "useSOC must be used within a SOCProvider"
    );
  }

  return context;
}