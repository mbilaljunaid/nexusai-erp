import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { i18n, type Language } from "@/lib/i18n";
import { useState } from "react";
import { Globe } from "lucide-react";

const languages: { code: Language; name: string }[] = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'zh', name: '中文' },
  { code: 'ja', name: '日本語' },
  { code: 'ar', name: 'العربية' },
  { code: 'pt', name: 'Português' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'ru', name: 'Русский' },
  { code: 'th', name: 'ไทย' },
  { code: 'id', name: 'Bahasa Indonesia' },
];

export function LanguageSwitcher() {
  const [currentLang, setCurrentLang] = useState<Language>(i18n.getLanguage());

  const handleLanguageChange = (lang: Language) => {
    i18n.setLanguage(lang);
    setCurrentLang(lang);
    window.location.reload();
  };

  return (
    <Select value={currentLang} onValueChange={(value) => handleLanguageChange(value as Language)}>
      <SelectTrigger className="w-32" data-testid="select-language">
        <Globe className="h-4 w-4 mr-2" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {languages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code} data-testid={`option-language-${lang.code}`}>
            {lang.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
