import { Globe } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="language-selector">
      <Globe size={15} />
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className="language-dropdown"
        aria-label="Select Language"
      >
        <option value="en">English (US)</option>
        <option value="hi">हिंदी (Hindi)</option>
        <option value="gu">ગુજરાતી (Gujarati)</option>
      </select>
    </div>
  );
}
