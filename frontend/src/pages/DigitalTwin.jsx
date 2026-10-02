import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Network, Search, Filter, Sparkles } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useSOC } from "../context/SOCContext";
import { InfrastructureMap } from "../components/digital-twin/InfrastructureMap";
import { AssetInvestigationDrawer } from "../components/digital-twin/AssetInvestigationDrawer";
import { ExplainButton } from "../components/common/ExplainButton";

export default function DigitalTwin() {
  const { t } = useLanguage();
  const { assetList } = useSOC();
  const [searchParams] = useSearchParams();

  const [selectedAsset, setSelectedAsset] = useState(null);
  const [highlightThreatPath, setHighlightThreatPath] = useState(false);

  return (
    <div className="page digital-twin-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">HOSPITAL INFRASTRUCTURE</p>
          <h1>{t("digitalTwin.title")}</h1>
          <p className="page-description">{t("digitalTwin.subtitle")}</p>
        </div>

        <ExplainButton
          title="Hospital Digital Twin"
          explanation="A 2D/3D digital representation of all medical computers, servers, and IoMT patient monitors across hospital departments."
          simpleConcept="Click any device icon to inspect its security risk, cyber DNA baseline, and connected infrastructure."
        />
      </div>

      <InfrastructureMap
        onSelectAsset={(ast) => setSelectedAsset(ast)}
        highlightThreatPath={highlightThreatPath}
        setHighlightThreatPath={setHighlightThreatPath}
      />

      {selectedAsset && (
        <AssetInvestigationDrawer
          asset={selectedAsset}
          onClose={() => setSelectedAsset(null)}
        />
      )}
    </div>
  );
}
