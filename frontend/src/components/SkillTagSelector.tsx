import { useState } from "react";

const PHP_SKILLS: Record<string, string[]> = {
  Frameworks: ["Laravel", "Symfony", "CodeIgniter", "Yii", "CakePHP", "Slim", "Lumen", "Phalcon"],
  "CMS & eCommerce": ["WordPress", "Drupal", "Joomla", "Magento", "WooCommerce", "PrestaShop", "OpenCart"],
  Databases: ["MySQL", "PostgreSQL", "Redis", "MongoDB", "SQLite", "MariaDB"],
  "Tools & API": ["Composer", "PHPUnit", "Docker", "REST API", "GraphQL", "SOAP", "Git", "Nginx", "Apache"],
  Stacks: ["LAMP", "LEMP", "PHP 8.x", "PHP 7.x"],
};

interface Props {
  selectedSkills: string[];
  onChange: (skills: string[]) => void;
  label?: string;
}

const SkillTagSelector = ({ selectedSkills, onChange, label = "Skills & Technologies" }: Props) => {
  const [customInput, setCustomInput] = useState("");
  const [activeCategory, setActiveCategory] = useState("Frameworks");

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      onChange(selectedSkills.filter((s) => s !== skill));
    } else {
      onChange([...selectedSkills, skill]);
    }
  };

  const addCustom = () => {
    const t = customInput.trim();
    if (t && !selectedSkills.includes(t)) {
      onChange([...selectedSkills, t]);
    }
    setCustomInput("");
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") { e.preventDefault(); addCustom(); }
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-3">{label}</label>

      {/* Selected skills */}
      {selectedSkills.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3 p-3 bg-violet-50 border border-violet-200 rounded-xl min-h-[44px]">
          {selectedSkills.map((skill) => (
            <span key={skill} className="inline-flex items-center gap-1 bg-violet-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
              {skill}
              <button type="button" onClick={() => toggleSkill(skill)} className="ml-1 hover:text-violet-200 leading-none text-base">
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Category tabs */}
      <div className="flex flex-wrap gap-1.5 mb-2">
        {Object.keys(PHP_SKILLS).map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1 text-xs font-semibold rounded-full border transition-all ${
              activeCategory === cat
                ? "bg-violet-600 text-white border-violet-600"
                : "bg-white text-slate-500 border-slate-200 hover:border-violet-300 hover:text-violet-600"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Skill pills palette */}
      <div className="flex flex-wrap gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl mb-3 min-h-[56px]">
        {PHP_SKILLS[activeCategory]?.map((skill) => (
          <button
            key={skill}
            type="button"
            onClick={() => toggleSkill(skill)}
            className={`px-3 py-1 text-xs font-semibold rounded-full border transition-all ${
              selectedSkills.includes(skill)
                ? "bg-violet-600 text-white border-violet-600 shadow-sm"
                : "bg-white text-slate-600 border-slate-200 hover:border-violet-400 hover:text-violet-600"
            }`}
          >
            {selectedSkills.includes(skill) ? "✓ " : "+ "}{skill}
          </button>
        ))}
      </div>

      {/* Custom skill input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Add custom skill (press Enter or click Add)"
          className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg"
        />
        <button
          type="button"
          onClick={addCustom}
          className="px-4 py-2 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-700 transition-colors"
        >
          Add
        </button>
      </div>
    </div>
  );
};

export default SkillTagSelector;
