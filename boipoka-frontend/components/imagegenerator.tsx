"use client";

import React, { useState } from "react";
import { usePollinationsImage } from '@pollinations/react';

// Ultra-enhanced character data with highly detailed visual prompts
const bookCharacters = [
  {
    id: "none",
    name: "None Selected",
    bookTitle: "No Character",
    author: "Select a character",
    description: "Please select a character to visualize",
    avatar: "❓",
    personality: [],
    visualPrompt: ""
  },
  {
    id: "adubhai",
    name: "আদুভাই",
    bookTitle: "আদুভাই (ছোটগল্প)",
    author: "আবুল মনসুর আহমদ",
    description: "শ্রেণীহীনতার ঊর্ধ্বে জ্ঞানান্বেষী, দৃঢ়চেতা এবং আদর্শবাদী এক চিরসবুজ ছাত্র।",
    avatar: "👨‍🎓",
    personality: ["Principled", "Resilient", "Optimistic", "Diligent"],
    visualPrompt: "Medium shot portrait of Aaduvai, a principled Bengali student from 1940s rural Bangladesh positioned in left third of frame. Face: oval-shaped with gentle features, warm brown eyes filled with determination and wisdom, thick black eyebrows, straight nose, soft smile lines. Hair: thick black hair, slightly wavy, parted to the side, well-groomed. Skin: medium brown complexion with subtle sun-touched glow. Body: lean build, confident posture. Clothing: crisp white cotton kurta with subtle embroidery, traditional white dhoti, simple brown leather sandals, worn leather satchel with books. Expression: serene confidence, thoughtful eyes. Background and atmosphere: expansive rustic village school courtyard with prominent Bangladesh flag 🇧🇩 flying on flagpole, mango trees, clay pots, traditional thatched huts, village children studying, golden hour lighting creating warm shadows, peaceful academic environment with birds chirping, dust motes in sunbeams, nostalgic sepia-toned warmth. Character occupies only 30% of frame, leaving 70% for rich environmental storytelling and cultural context."
  },
  {
    id: "mojid",
    name: "মজিদ",
    bookTitle: "লালসালু",
    author: "সৈয়দ ওয়ালীউল্লাহ",
    description: "গ্রামবাসীদের ধর্মীয় বিশ্বাসকে ব্যবহার করে নিয়ন্ত্রণ প্রতিষ্ঠা করা একজন ধূর্ত পীর।",
    avatar: "🕌",
    personality: ["Cunning", "Manipulative", "Religious", "Authoritative"],
    visualPrompt: "Wide cinematic shot of Mojid, a cunning spiritual leader positioned in right third of composition. Face: angular features with sharp cheekbones, piercing dark eyes with calculating gaze, thin lips curved in subtle scheming smile, weathered skin with deep lines. Hair: salt-and-pepper beard reaching mid-chest, black hair with gray streaks under traditional white cap (taqiyah). Body: medium build, commanding presence, authoritative posture. Clothing: distinctive flowing red silk robe (লালসালু) over white cotton kurta, ornate prayer beads (tasbih), traditional leather sandals. Expression: mixture of religious devotion and hidden cunning. Background and setting: expansive ancient weathered shrine (mazar) complex with prominent Bangladesh flag 🇧🇩 visible, crumbling brick walls with faded Arabic calligraphy, multiple oil lamps casting dancing shadows, red cloth draped over tomb, village mosque with minaret in distance, gathered villagers in background showing his influence. Atmospheric elements: mystical yet ominous mood, dramatic chiaroscuro lighting, golden oil lamp glow contrasting deep shadows, dust particles floating in amber light. Character takes only 25% of frame, emphasizing the religious compound and cultural atmosphere."
  },
  {
    id: "harry-potter",
    name: "Harry Potter",
    bookTitle: "Harry Potter and the Philosopher's Stone",
    author: "J.K. Rowling",
    description: "The Boy Who Lived, a young wizard discovering his magical heritage and fighting dark forces.",
    avatar: "⚡",
    personality: ["Brave", "Loyal", "Modest", "Determined"],
    visualPrompt: "Wide-angle portrait of 11-year-old Harry Potter positioned in center-left of frame, showing full figure and extensive magical environment. Face: round youthful face with pale complexion, light freckles across nose, bright emerald green eyes filled with wonder, thick black eyebrows, small straight nose, gentle smile. Hair: jet-black, perpetually messy and unruly, sticking up at odd angles. Scar: distinctive lightning bolt-shaped scar on forehead, thin red line partially hidden by hair, faintly glowing. Body: small for his age, thin but wiry build, quick reflexes. Clothing: authentic Hogwarts uniform with flowing black robes, white collared shirt, Gryffindor striped tie (deep red and gold), gray wool sweater vest. Accessories: round wire-rimmed glasses, holding elegant holly and phoenix feather wand, magical sparkles emanating from wand tip. Expression: mixture of wonder, determination, and slight nervousness. Background and atmosphere: magnificent Grand Hall of Hogwarts with soaring stone arches, floating candles, enchanted ceiling showing starry night sky, multiple house banners including prominent Gryffindor flag with lion emblem, magical portraits moving in frames, long tables with feast, other students in background, warm golden candlelight, floating sparks, ancient wisdom atmosphere. Harry occupies only 20% of composition, showcasing the vast magical world around him."
  },
  {
    id: "anupam",
    name: "অনুপম",
    bookTitle: "অপরিচিতা",
    author: "রবীন্দ্রনাথ ঠাকুর",
    description: "শুরুতে মামা-নির্ভর, কিন্তু পরে আত্মমর্যাদা ও প্রজ্ঞার প্রতি মুগ্ধ এক সংবেদনশীল যুবক।",
    avatar: "📖",
    personality: ["Sensitive", "Contemplative", "Evolving", "Idealistic"],
    visualPrompt: "Artistic environmental portrait of Anupam positioned in right third of frame, a sensitive 25-year-old Bengali gentleman from early 1900s Calcutta. Face: refined oval features with fair complexion, large expressive dark eyes reflecting deep sensitivity, well-defined eyebrows, straight aristocratic nose, full lips in thoughtful expression, clean-shaven with soft facial structure. Hair: thick black hair, neatly combed and parted, occasionally falling across forehead. Body: elegant slim build, graceful posture reflecting upper-class upbringing, long artistic fingers holding book. Clothing: sophisticated colonial-era Bengali formal wear - crisp white cotton kurta with subtle gold border, perfectly draped dhoti, silk chaddar (shawl) draped over shoulder, polished leather nagra shoes, simple gold chain. Expression: introspective and idealistic, eyes showing evolution from dependency to self-awareness, gentle smile. Background and setting: expansive elegant Calcutta mansion courtyard with marble pillars, hanging jasmine garlands, fountain with lotus flowers, vintage furniture, soft afternoon light filtering through silk curtains, classical Bengali architecture, British-Indian colonial flag or emblem visible, rose petals scattered on marble floor, gentle breeze moving curtains. Atmosphere: romantic and poetic mood inspired by Tagore's literature, soft golden lighting creating dreamy ambiance, sense of cultural refinement and emotional depth. Character occupies 25% of frame, emphasizing the opulent cultural setting."
  },
  {
    id: "paradoxical-sazid",
    name: "প্যারাডক্সিক্যাল সাজিদ",
    bookTitle: "প্যারাডক্সিক্যাল সাজিদ",
    author: "আরিফ আজাদ",
    description: "ইসলামের বিরুদ্ধে উত্থাপিত প্রশ্নগুলোর যৌক্তিক ও দার্শনিক উত্তর প্রদানকারী একজন তীক্ষ্ণবুদ্ধিসম্পন্ন গবেষক।",
    avatar: "🧠",
    personality: ["Logical", "Rational", "Apologetic", "Inquisitive"],
    visualPrompt: "Contemporary environmental portrait of Paradoxical Sazid positioned in left third of composition, a brilliant 30-year-old Bangladeshi Islamic researcher. Face: sharp intellectual features with medium brown complexion, penetrating dark eyes behind stylish rectangular glasses showing analytical mind, well-groomed thick eyebrows, defined cheekbones, neatly trimmed beard following Islamic tradition, confident smile. Hair: thick black hair, modern styled and well-maintained, slight receding hairline. Body: medium build with confident academic posture, gestures suggesting articulate communication. Clothing: contemporary professional attire - crisp white dress shirt, dark blue blazer, subtle patterned tie, pressed trousers, polished leather shoes, elegant wristwatch. Accessories: modern rectangular glasses, smartphone, leather portfolio, quality pen. Expression: intelligent concentration mixed with gentle confidence, eyes showing deep contemplation and rational thinking. Background and setting: expansive modern Islamic research center with floor-to-ceiling bookshelves filled with Islamic texts, contemporary computers displaying theological research, natural lighting from large windows, whiteboard with complex philosophical diagrams, comfortable reading chairs, Bangladesh flag 🇧🇩 prominently displayed, university campus visible through windows. Atmosphere: academic excellence and intellectual rigor, bright natural lighting suggesting clarity of thought, organized study environment, sense of bridging traditional Islamic scholarship with contemporary challenges. Character takes 30% of frame, showcasing the modern academic environment."
  }
];

// Comprehensive world locations with detailed cultural contexts and None option
const worldLocations = [
  { 
    id: "none",
    name: "🌐 Default Setting",
    description: "Character's original environment",
    prompt: "",
    flag: ""
  },
  { 
    id: "bangladesh", 
    name: "🇧🇩 Bangladesh", 
    description: "Lush green rice paddies, traditional villages, rivers and boats",
    prompt: "rural Bengali countryside, emerald green rice paddies stretching to horizon, traditional clay and bamboo houses with thatched roofs, winding rivers with wooden boats, tall coconut palms, ancient banyan trees, monsoon clouds, village markets with colorful saris, golden mustard fields, peaceful village life",
    flag: "🇧🇩"
  },
  { 
    id: "england", 
    name: "🏴󠁧󠁢󠁥󠁮󠁧󠁿 England", 
    description: "Rolling countryside, Gothic architecture, misty mornings",
    prompt: "English countryside with rolling green hills, Gothic stone architecture, ancient castles with ivy-covered walls, misty mornings with soft fog, cobblestone streets, red telephone boxes, traditional English gardens with roses, Tudor-style buildings, gray stone bridges over gentle streams",
    flag: "🇬🇧"
  },
  { 
    id: "japan", 
    name: "🇯🇵 Japan", 
    description: "Cherry blossoms, traditional temples, zen gardens",
    prompt: "Japanese landscape with delicate pink cherry blossoms, traditional wooden temples with curved roofs, perfectly manicured zen gardens with raked gravel, stone lanterns, bamboo forests, koi ponds with wooden bridges, Mount Fuji in background, peaceful meditation spaces",
    flag: "🇯🇵"
  },
  { 
    id: "france", 
    name: "🇫🇷 France", 
    description: "Romantic Paris streets, lavender fields, elegant châteaux",
    prompt: "French setting with romantic Parisian streets, Haussmanian architecture, endless purple lavender fields in Provence, elegant Renaissance châteaux, wine vineyards with rolling hills, outdoor cafés with wrought iron tables, Seine River with stone bridges, golden sunset light",
    flag: "🇫🇷"
  },
  { 
    id: "egypt", 
    name: "🇪🇬 Egypt", 
    description: "Ancient pyramids, desert landscapes, Nile river",
    prompt: "Egyptian landscape with ancient pyramids and sphinx, golden desert sands with dunes, palm oases with date trees, Nile River with traditional felucca boats, hieroglyphic temple walls, columns with lotus capitals, warm desert lighting, archaeological sites",
    flag: "🇪🇬"
  },
  { 
    id: "india", 
    name: "🇮🇳 India", 
    description: "Colorful markets, majestic palaces, spice gardens",
    prompt: "Indian setting with vibrant spice markets, ornate Mughal palaces with marble inlays, colorful traditional clothing, sacred Ganges River, ancient temples with intricate carvings, monsoon gardens with lotus ponds, bustling bazaars with silk textiles, incense smoke",
    flag: "🇮🇳"
  },
  { 
    id: "morocco", 
    name: "🇲🇦 Morocco", 
    description: "Desert dunes, ancient medinas, colorful souks",
    prompt: "Moroccan landscape with golden sand dunes, ancient medina walls, colorful souks with hanging lanterns, ornate Islamic architecture with geometric patterns, traditional riads with courtyard fountains, Atlas Mountains, desert sunset with warm amber light",
    flag: "🇲🇦"
  },
  { 
    id: "norway", 
    name: "🇳🇴 Norway", 
    description: "Dramatic fjords, northern lights, snow-capped peaks",
    prompt: "Norwegian landscape with dramatic fjords, steep cliffs reflecting in dark water, snow-capped mountain peaks, northern lights aurora borealis in night sky, wooden stave churches, pine forests, crystalline waterfalls, midnight sun phenomenon",
    flag: "🇳🇴"
  },
  { 
    id: "iceland", 
    name: "🇮🇸 Iceland", 
    description: "Volcanic landscapes, geysers, glacial formations",
    prompt: "Icelandic terrain with volcanic black rocks, steaming geysers shooting water skyward, massive glaciers with blue ice formations, dramatic waterfalls, lupine flower fields, northern lights, otherworldly landscapes, geothermal hot springs",
    flag: "🇮🇸"
  }
];

// Comprehensive time periods with detailed historical contexts and None option
const timePeriods = [
  { 
    id: "none", 
    name: "📅 Original Era", 
    description: "Character's default time period", 
    prompt: ""
  },
  { 
    id: "prehistoric", 
    name: "🦕 Prehistoric Era", 
    description: "Primordial world with dinosaurs and volcanic activity (65M BCE)", 
    prompt: "prehistoric landscape, massive dinosaurs roaming, dense primordial forests with giant ferns, active volcanoes with lava flows, meteor showers, primitive earth atmosphere, ancient ocean life, evolutionary dawn"
  },
  { 
    id: "ancient", 
    name: "🏛️ Ancient Civilization", 
    description: "Golden age of pyramids, temples, and classical culture (3000 BCE - 500 CE)", 
    prompt: "ancient civilization, marble temples with towering columns, Egyptian pyramids under construction, Roman forums with togas, Greek amphitheaters, chariot races, classical sculptures, philosophical gardens, historical grandeur"
  },
  { 
    id: "medieval", 
    name: "🏰 Medieval Era", 
    description: "Age of knights, castles, and feudal kingdoms (500 - 1500 CE)", 
    prompt: "medieval times, imposing stone castles with towers, knights in shining armor on horseback, feudal villages with thatched cottages, heraldic banners fluttering, torch-lit great halls, monastery libraries, guild workshops"
  },
  { 
    id: "renaissance", 
    name: "🎨 Renaissance Period", 
    description: "Artistic and scientific rebirth in Europe (1400 - 1600)", 
    prompt: "renaissance era, ornate palazzo architecture, artists' studios with easels, scientific instruments, elegant court dress with rich fabrics, marble sculptures being carved, printed books, cultural refinement, humanistic ideals"
  },
  { 
    id: "victorian", 
    name: "🎩 Victorian Era", 
    description: "Industrial revolution and British elegance (1837 - 1901)", 
    prompt: "victorian setting, industrial steam engines, gas-lit London streets, elegant horse-drawn carriages, formal Victorian dress, ornate furniture, railway stations, smoking chimneys, technological progress"
  },
  { 
    id: "1920s", 
    name: "🎷 Jazz Age", 
    description: "Roaring twenties with art deco and cultural revolution (1920s)", 
    prompt: "1920s jazz age, art deco architecture with geometric patterns, vintage automobiles, flapper fashion, speakeasy clubs, jazz musicians, radio broadcasts, economic prosperity, cultural liberation"
  },
  { 
    id: "present", 
    name: "🌐 Digital Age", 
    description: "Contemporary world with internet and smartphones (2020s)", 
    prompt: "modern contemporary setting, smartphones and digital devices, high-speed internet, social media, sustainable technology, urban lifestyle, global connectivity, AI integration, environmental consciousness"
  },
  { 
    id: "cyberpunk", 
    name: "🌃 Cyberpunk Future", 
    description: "High-tech, low-life dystopian society (2080s)", 
    prompt: "cyberpunk future cityscape, towering neon-lit skyscrapers, holographic advertisements, cybernetic implants, flying vehicles, digital rain, underground markets, technological dystopia, artificial intelligence"
  },
  { 
    id: "space-age", 
    name: "🚀 Galactic Civilization", 
    description: "Interstellar society with space colonies (2300s)", 
    prompt: "space age civilization, floating space stations, interstellar ships, alien worlds with multiple moons, advanced technology beyond recognition, cosmic backgrounds with nebulae, post-human evolution, galactic architecture"
  }
];

export default function BoipokaCharacterImageGenerator() {
  const [selectedCharacter, setSelectedCharacter] = useState(bookCharacters[0]);
  const [selectedLocation, setSelectedLocation] = useState(worldLocations[0]);
  const [selectedTimePeriod, setSelectedTimePeriod] = useState(timePeriods[0]);
  const [customPrompt, setCustomPrompt] = useState("");
  const [finalPrompt, setFinalPrompt] = useState("");
  const [artStyle, setArtStyle] = useState("realistic");
  const [imageQuality, setImageQuality] = useState("ultra");
  const [error, setError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [useCustomPrompt, setUseCustomPrompt] = useState(false);

  // Generate random seed for each new image
  const [seed, setSeed] = useState(42);

  // Ensure all inputs are submitted before generating prompt
  const validateInputs = () => {
    if (!selectedCharacter || selectedCharacter.id === "none") {
      setError("Please select a character");
      return false;
    }
    if (!artStyle) {
      setError("Please select an art style");
      return false;
    }
    if (useCustomPrompt && !customPrompt.trim()) {
      setError("Please enter a custom prompt or disable custom prompt option");
      return false;
    }
    return true;
  };

  // High-quality image generation with Pollinations React hook
  const imageUrl = usePollinationsImage(finalPrompt, {
    width: 1024,
    height: 1024,
    seed: seed,
    model: "flux",
    nologo: true
  });

  const generateCharacterImage = () => {
    setError("");
    
    // Validate all inputs before proceeding
    if (!validateInputs()) {
      return;
    }

    setIsGenerating(true);

    // Ultra-enhanced quality descriptors
    const qualityEnhancers = imageQuality === "ultra" 
      ? [
        "ultra high definition", "8K resolution", "photorealistic masterpiece", "hyper-detailed", 
        "professional studio lighting", "award-winning photography", "crystal clear focus", 
        "perfect composition", "cinematic quality", "museum-worthy artwork", "flawless rendering"
      ]
      : imageQuality === "high"
      ? [
        "high quality", "4K resolution", "detailed", "professional", "sharp focus", 
        "perfect lighting", "cinematic", "artistic excellence"
      ]
      : ["good quality", "detailed", "clear focus", "professional"];
    
    // Art style specific enhancements
    const styleEnhancer = artStyle === "realistic" 
      ? "hyperrealistic photography, ultra-detailed facial features, perfect skin texture, natural lighting, DSLR camera quality, professional portrait photography"
      : artStyle === "anime" 
      ? "studio anime quality, detailed character design, vibrant colors, perfect anime anatomy, professional manga illustration, cel-shaded perfection"
      : artStyle === "digital-art"
      ? "digital art masterpiece, concept art quality, detailed character design, professional digital illustration, perfect digital painting technique"
      : artStyle === "oil-painting"
      ? "classical oil painting, renaissance master technique, fine art quality, painterly brushstrokes, museum piece, traditional medium mastery"
      : artStyle === "watercolor"
      ? "watercolor painting masterpiece, soft brush technique, flowing colors, artistic transparency, traditional watercolor paper texture"
      : artStyle === "sketch"
      ? "detailed pencil sketch, fine line art, professional drawing technique, artistic study, graphite mastery, architectural precision"
      : "artistic masterpiece, creative illustration, professional quality";

    // Enhanced composition instructions
    const compositionInstructions = [
      "wide-angle environmental shot",
      "character positioned strategically within frame taking maximum 30% of total composition",
      "70% of frame dedicated to rich environmental storytelling and atmospheric details",
      "cinematic composition with rule of thirds",
      "extensive background and foreground elements visible",
      "cultural flag prominently displayed in scene"
    ];

    // Comprehensive prompt assembly ensuring ALL inputs are included
    const baseCharacterPrompt = useCustomPrompt && customPrompt.trim() 
      ? `Custom character description: ${customPrompt.trim()}`
      : `Character: ${selectedCharacter.visualPrompt}`;

    const locationPrompt = selectedLocation.id !== "none" ? `Location setting: ${selectedLocation.prompt}, ${selectedLocation.flag} flag prominently visible` : "";
    const timePrompt = selectedTimePeriod.id !== "none" ? `Time period: ${selectedTimePeriod.prompt}` : "";
    const personalityPrompt = selectedCharacter.personality.length > 0 ? `Character personality traits: ${selectedCharacter.personality.join(', ')}` : "";
    const bookContextPrompt = selectedCharacter.id !== "none" ? `Literary context: character from "${selectedCharacter.bookTitle}" by ${selectedCharacter.author}` : "";

    // Final comprehensive prompt with all inputs guaranteed
    const promptParts = [
      compositionInstructions.join(", "),
      baseCharacterPrompt,
      locationPrompt, 
      timePrompt,
      personalityPrompt,
      bookContextPrompt,
      styleEnhancer,
      qualityEnhancers.join(", "),
      "literary character visualization",
      "environmental storytelling masterpiece"
    ].filter(part => part.trim() !== "");

    const enhancedPrompt = promptParts.join(", ");
    
    // Generate new random seed for variety
    setSeed(Math.floor(Math.random() * 1000000));
    
    // Set the final prompt to trigger image generation
    setFinalPrompt(enhancedPrompt);
    
    // Simulate loading time for better UX
    setTimeout(() => {
      setIsGenerating(false);
    }, 5000);
  };

  const clearImage = () => {
    setFinalPrompt("");
    setError("");
    setIsGenerating(false);
  };

  const downloadImage = () => {
    if (!imageUrl) return;
    
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `boipoka-${selectedCharacter.id}-${selectedLocation.id}-${selectedTimePeriod.id}-${artStyle}-${imageQuality}-${Date.now()}.png`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Modern Minimalistic Header */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-2xl font-bold">B</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Boipoka.ai</h1>
                <p className="text-sm text-slate-600">Character Visualizer</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-6 text-sm text-slate-600">
              <span className="flex items-center gap-2">🌍 10 Locations</span>
              <span className="flex items-center gap-2">⏰ 10 Time Periods</span>
              <span className="flex items-center gap-2">🎭 5 Characters</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Controls */}
          <div className="lg:col-span-1 space-y-6">
            {/* Character Selection */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="p-6 border-b border-slate-100">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <span className="w-5 h-5 bg-blue-100 rounded flex items-center justify-center text-blue-600 text-sm">📚</span>
                  Character
                </h2>
              </div>
              <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
                {bookCharacters.map((character) => (
                  <button
                    key={character.id}
                    onClick={() => setSelectedCharacter(character)}
                    className={`w-full p-4 rounded-xl text-left transition-all duration-200 ${
                      selectedCharacter.id === character.id
                        ? "bg-blue-50 border-2 border-blue-200 shadow-sm"
                        : "border-2 border-transparent hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{character.avatar}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-slate-800 truncate text-sm">{character.name}</h3>
                        <p className="text-xs text-slate-500 truncate">{character.author}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Location Selection */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="p-6 border-b border-slate-100">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <span className="w-5 h-5 bg-green-100 rounded flex items-center justify-center text-green-600 text-sm">🌍</span>
                  Location
                </h2>
              </div>
              <div className="p-4 space-y-2">
                {worldLocations.map((location) => (
                  <button
                    key={location.id}
                    onClick={() => setSelectedLocation(location)}
                    className={`w-full p-3 rounded-lg text-left transition-all duration-200 text-sm ${
                      selectedLocation.id === location.id
                        ? "bg-green-50 border border-green-200"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="font-medium text-slate-800">{location.name}</div>
                    <div className="text-xs text-slate-500 mt-1">{location.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Period Selection */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="p-6 border-b border-slate-100">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <span className="w-5 h-5 bg-purple-100 rounded flex items-center justify-center text-purple-600 text-sm">⏰</span>
                  Time Period
                </h2>
              </div>
              <div className="p-4 space-y-2 max-h-60 overflow-y-auto">
                {timePeriods.map((period) => (
                  <button
                    key={period.id}
                    onClick={() => setSelectedTimePeriod(period)}
                    className={`w-full p-3 rounded-lg text-left transition-all duration-200 text-sm ${
                      selectedTimePeriod.id === period.id
                        ? "bg-purple-50 border border-purple-200"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="font-medium text-slate-800">{period.name}</div>
                    <div className="text-xs text-slate-500 mt-1">{period.description}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Middle Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Art Style & Quality */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
                <div className="p-6 border-b border-slate-100">
                  <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <span className="w-5 h-5 bg-pink-100 rounded flex items-center justify-center text-pink-600 text-sm">🎨</span>
                    Art Style
                  </h2>
                </div>
                <div className="p-4 grid grid-cols-2 gap-3">
                  {[
                    { value: "realistic", label: "📸 Realistic" },
                    { value: "anime", label: "🎌 Anime" },
                    { value: "digital-art", label: "💻 Digital" },
                    { value: "oil-painting", label: "🖼️ Oil Paint" },
                    { value: "watercolor", label: "🎨 Watercolor" },
                    { value: "sketch", label: "✏️ Sketch" }
                  ].map((style) => (
                    <button
                      key={style.value}
                      onClick={() => setArtStyle(style.value)}
                      className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                        artStyle === style.value
                          ? "bg-blue-600 text-white shadow-sm"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
                <div className="p-6 border-b border-slate-100">
                  <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <span className="w-5 h-5 bg-orange-100 rounded flex items-center justify-center text-orange-600 text-sm">💎</span>
                    Quality
                  </h2>
                </div>
                <div className="p-4 space-y-3">
                  {[
                    { value: "ultra", label: "💎 Ultra (8K)", description: "Maximum detail" },
                    { value: "high", label: "⭐ High (4K)", description: "Professional" },
                    { value: "standard", label: "✨ Standard", description: "Good quality" }
                  ].map((quality) => (
                    <button
                      key={quality.value}
                      onClick={() => setImageQuality(quality.value)}
                      className={`w-full p-3 rounded-lg text-left transition-all duration-200 ${
                        imageQuality === quality.value
                          ? "bg-orange-50 border border-orange-200"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="font-medium text-slate-800 text-sm">{quality.label}</div>
                      <div className="text-xs text-slate-500">{quality.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Custom Prompt */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="p-6 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="useCustomPrompt"
                    checked={useCustomPrompt}
                    onChange={(e) => setUseCustomPrompt(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="useCustomPrompt" className="text-lg font-semibold text-slate-800">
                    Custom Description
                  </label>
                </div>
              </div>
              {useCustomPrompt && (
                <div className="p-6">
                  <textarea
                    placeholder="Describe your unique vision in detail..."
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                    rows={4}
                    maxLength={2000}
                  />
                </div>
              )}
            </div>

            {/* Generate Button */}
            <button
              onClick={generateCharacterImage}
              disabled={isGenerating || selectedCharacter.id === "none"}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-4 px-6 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              {isGenerating ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating Masterpiece...</span>
                </div>
              ) : (
                <span>🚀 Generate Character Art</span>
              )}
            </button>

            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-red-500 text-xl">⚠️</span>
                  <p className="text-red-600 font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* Generated Image */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="p-6 border-b border-slate-100">
                <h2 className="text-lg font-semibold text-slate-800">Generated Artwork</h2>
              </div>
              <div className="p-6">
                {imageUrl && finalPrompt ? (
                  <div className="space-y-4">
                    <div className="relative">
                      <img 
                        src={imageUrl} 
                        alt={`AI Generated ${selectedCharacter.name}`}
                        className="w-full h-96 object-cover rounded-lg border border-slate-200"
                      />
                      <div className="absolute top-3 right-3 bg-black/70 text-white px-3 py-1 rounded-lg text-sm font-medium">
                        {artStyle.toUpperCase()} • {imageQuality.toUpperCase()}
                      </div>
                    </div>
                    
                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={downloadImage}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                      >
                        📥 Download
                      </button>
                      <button
                        onClick={clearImage}
                        className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                      >
                        🗑️ Clear
                      </button>
                      <button
                        onClick={generateCharacterImage}
                        disabled={isGenerating}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        🔄 Regenerate
                      </button>
                    </div>
                    
                    <div className="text-sm text-slate-600 bg-slate-50 p-4 rounded-lg space-y-1">
                      <div><strong>Character:</strong> {selectedCharacter.name}</div>
                      <div><strong>Location:</strong> {selectedLocation.name}</div>
                      <div><strong>Era:</strong> {selectedTimePeriod.name}</div>
                      <div><strong>Style:</strong> {artStyle} • Quality: {imageQuality}</div>
                      <div><strong>Seed:</strong> {seed}</div>
                    </div>
                  </div>
                ) : finalPrompt && isGenerating ? (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                    <p className="text-slate-600 font-medium mb-2">Creating ultra-detailed artwork...</p>
                    <p className="text-sm text-slate-500">This may take a few moments</p>
                  </div>
                ) : (
                  <div className="text-center py-16 border-2 border-dashed border-slate-300 rounded-lg">
                    <span className="text-6xl mb-4 block">{selectedCharacter.avatar}</span>
                    <p className="text-slate-600 font-medium mb-2">Ready to create artwork</p>
                    <p className="text-sm text-slate-500">Select options and click generate</p>
                  </div>
                )}
              </div>
            </div>

            {/* Selected Character Info */}
            {selectedCharacter.id !== "none" && (
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-200 p-6">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{selectedCharacter.avatar}</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-800 mb-1">{selectedCharacter.name}</h3>
                    <p className="text-sm text-blue-600 mb-2 font-medium">
                      "{selectedCharacter.bookTitle}" by {selectedCharacter.author}
                    </p>
                    <p className="text-sm text-slate-600 mb-3 leading-relaxed">{selectedCharacter.description}</p>
                    {selectedCharacter.personality.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {selectedCharacter.personality.map((trait) => (
                          <span
                            key={trait}
                            className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium"
                          >
                            {trait}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}