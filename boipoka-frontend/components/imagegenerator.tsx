"use client";

import React, { useState } from "react";
import { usePollinationsImage } from '@pollinations/react';

// Simplified character data - realistic only
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
    visualPrompt: "Professional portrait of Aaduvai, a principled Bengali student from 1940s rural Bangladesh. Face: oval-shaped with gentle features, warm brown eyes filled with determination and wisdom, thick black eyebrows, straight nose, soft smile lines showing optimism. Hair: thick black hair, slightly wavy, parted to the side, well-groomed despite modest means. Skin: medium brown complexion, smooth with subtle sun-touched glow from outdoor village life. Body: lean build, average height, confident posture with shoulders back. Clothing: crisp white cotton kurta with subtle embroidery, traditional white dhoti perfectly draped, simple brown leather sandals. Expression: serene confidence, eyes reflecting deep thoughtfulness and unwavering principles, gentle smile suggesting inner peace and dedication to learning."
  },
  {
    id: "mojid",
    name: "মজিদ",
    bookTitle: "লালসালু",
    author: "সৈয়দ ওয়ালীউল্লাহ",
    description: "গ্রামবাসীদের ধর্মীয় বিশ্বাসকে ব্যবহার করে নিয়ন্ত্রণ প্রতিষ্ঠা করা একজন ধূর্ত পীর।",
    avatar: "🕌",
    personality: ["Cunning", "Manipulative", "Religious", "Authoritative"],
    visualPrompt: "Professional portrait of Mojid, a cunning 45-year-old spiritual leader from rural Bengal. Face: angular features with sharp cheekbones, piercing dark eyes with calculating gaze that seems to see through souls, thin lips curved in subtle scheming smile, weathered skin with deep lines from sun exposure and age. Hair: salt-and-pepper beard reaching mid-chest, meticulously groomed, black hair with gray streaks slicked back under traditional white cap (taqiyah). Body: medium build, commanding presence, authoritative posture with hands clasped. Clothing: distinctive flowing red silk robe (লালসালু) over white cotton kurta and loose white pants, ornate prayer beads (tasbih) hanging from neck. Expression: mixture of religious devotion and hidden cunning, slight smirk suggesting secret knowledge and manipulation."
  },
  {
    id: "harry-potter",
    name: "Harry Potter",
    bookTitle: "Harry Potter and the Philosopher's Stone",
    author: "J.K. Rowling",
    description: "The Boy Who Lived, a young wizard discovering his magical heritage and fighting dark forces.",
    avatar: "⚡",
    personality: ["Brave", "Loyal", "Modest", "Determined"],
    visualPrompt: "Professional portrait of 11-year-old Harry Potter. Face: round youthful face with pale complexion and light freckles across nose, bright emerald green eyes filled with wonder and determination, thick black eyebrows, small straight nose, gentle smile showing modest nature. Hair: jet-black, perpetually messy and unruly, sticking up at odd angles especially at the back, impossible to tame despite efforts. Scar: distinctive lightning bolt-shaped scar on forehead, thin red line partially hidden by falling hair strands. Body: small for his age due to childhood neglect, thin but wiry build, quick reflexes evident in posture. Clothing: authentic Hogwarts uniform with flowing black robes over white collared shirt, Gryffindor striped tie (deep red and gold), gray wool sweater vest. Accessories: round wire-rimmed glasses slightly askew, holding elegant holly and phoenix feather wand. Expression: mixture of wonder, determination, and slight nervousness, eyes wide with discovery of magical world, brave set to jaw despite modest demeanor."
  },
  {
    id: "anupam",
    name: "অনুপম",
    bookTitle: "অপরিচিতা",
    author: "রবীন্দ্রনাথ ঠাকুর",
    description: "শুরুতে মামা-নির্ভর, কিন্তু পরে আত্মমর্যাদা ও প্রজ্ঞার প্রতি মুগ্ধ এক সংবেদনশীল যুবক।",
    avatar: "📖",
    personality: ["Sensitive", "Contemplative", "Evolving", "Idealistic"],
    visualPrompt: "Professional portrait of Anupam, a sensitive 25-year-old Bengali gentleman from early 1900s Calcutta. Face: refined oval features with fair complexion, large expressive dark eyes reflecting deep sensitivity and contemplation, well-defined eyebrows, straight aristocratic nose, full lips often in thoughtful expression, clean-shaven with soft facial structure. Hair: thick black hair, neatly combed and parted, occasionally falling across forehead during moments of deep thought. Body: elegant slim build, graceful posture reflecting upper-class upbringing, long artistic fingers perfect for holding books and writing. Clothing: sophisticated colonial-era Bengali formal wear - crisp white cotton kurta with subtle gold border, perfectly draped dhoti, silk chaddar (shawl) draped over shoulder, simple gold chain visible at neck. Expression: introspective and idealistic, eyes showing evolution from dependency to self-awareness, gentle smile suggesting inner growth and wisdom gained through experience."
  },
  {
    id: "paradoxical-sazid",
    name: "প্যারাডক্সিক্যাল সাজিদ",
    bookTitle: "প্যারাডক্সিক্যাল সাজিদ",
    author: "আরিফ আজাদ",
    description: "ইসলামের বিরুদ্ধে উত্থাপিত প্রশ্নগুলোর যৌক্তিক ও দার্শনিক উত্তর প্রদানকারী একজন তীক্ষ্ণবুদ্ধিসম্পন্ন গবেষক।",
    avatar: "🧠",
    personality: ["Logical", "Rational", "Apologetic", "Inquisitive"],
    visualPrompt: "Professional portrait of Paradoxical Sazid, a brilliant 30-year-old Bangladeshi Islamic researcher and apologist. Face: sharp intellectual features with medium brown complexion, penetrating dark eyes behind stylish rectangular glasses showing analytical mind, well-groomed thick eyebrows, defined cheekbones, neatly trimmed beard following Islamic tradition, confident smile reflecting rational approach to complex questions. Hair: thick black hair, modern styled and well-maintained, slight receding hairline showing maturity. Body: medium build with confident academic posture, gestures suggesting articulate communication style. Clothing: contemporary professional attire - crisp white dress shirt, dark blue blazer, subtle patterned tie, polished leather shoes, elegant wristwatch. Accessories: modern rectangular glasses, quality pen for note-taking. Expression: intelligent concentration mixed with gentle confidence, eyes showing deep contemplation and rational thinking, slight smile suggesting readiness to engage in intellectual discourse."
  },
  {
    id: "sherlock-holmes",
    name: "Sherlock Holmes",
    bookTitle: "The Adventures of Sherlock Holmes",
    author: "Arthur Conan Doyle",
    description: "The world's greatest consulting detective, master of deductive reasoning and observation.",
    avatar: "🕵️",
    personality: ["Analytical", "Observant", "Logical", "Eccentric"],
    visualPrompt: "Professional portrait of Sherlock Holmes, the legendary Victorian detective in his prime. Face: sharp angular features with pale English complexion, penetrating steel-gray eyes that seem to see through everything with analytical intensity, prominent aquiline nose, thin lips often pursed in concentration, high cheekbones, clean-shaven with defined jawline. Hair: thick black hair, slightly wavy and perfectly groomed, receding slightly at the temples showing maturity and wisdom. Body: tall lean build around 6 feet, elegant posture with ramrod-straight spine, long slender fingers perfect for violin playing and delicate investigative work. Clothing: impeccably tailored Victorian gentleman's attire - charcoal gray wool frock coat with silk lapels, crisp white wing-collar shirt, silver pocket watch chain visible, perfectly knotted dark tie, polished black leather shoes. Accessories: iconic curved briar pipe held thoughtfully, magnifying glass in breast pocket, deerstalker hat nearby. Expression: intense intellectual concentration with slight knowing smile, eyes showing brilliant deductive mind at work, commanding presence that suggests complete confidence in his abilities."
  }
];

export default function BoipokaCharacterImageGenerator() {
  const [selectedCharacter, setSelectedCharacter] = useState(bookCharacters[0]);
  const [additionalPrompt, setAdditionalPrompt] = useState("");
  const [finalPrompt, setFinalPrompt] = useState("");
  const [artStyle, setArtStyle] = useState("photorealistic");
  const [imageQuality, setImageQuality] = useState("ultra");
  const [error, setError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [useAdditionalPrompt, setUseAdditionalPrompt] = useState(false);

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

    // Quality descriptors
    const qualityEnhancers = imageQuality === "ultra" 
      ? [
        "ultra high definition", "8K resolution", "professional photography", "hyper-detailed", 
        "studio lighting", "award-winning portrait", "crystal clear focus", 
        "perfect composition", "cinematic quality", "flawless rendering"
      ]
      : imageQuality === "high"
      ? [
        "high quality", "4K resolution", "detailed", "professional", "sharp focus", 
        "perfect lighting", "cinematic"
      ]
      : ["good quality", "detailed", "clear focus", "professional"];
    
    // Enhanced art style options
    const styleEnhancer = artStyle === "photorealistic" 
      ? "hyperrealistic photography, ultra-detailed facial features, perfect skin texture, natural lighting, DSLR camera quality, professional portrait photography"
      : artStyle === "oil-painting"
      ? "classical oil painting, renaissance master technique, fine art quality, painterly brushstrokes, museum piece, traditional medium mastery"
      : artStyle === "watercolor"
      ? "watercolor painting masterpiece, soft brush technique, flowing colors, artistic transparency, traditional watercolor paper texture"
      : artStyle === "digital-art"
      ? "digital art masterpiece, concept art quality, detailed character design, professional digital illustration, perfect digital painting technique"
      : artStyle === "pencil-sketch"
      ? "detailed pencil sketch, fine line art, professional drawing technique, artistic study, graphite mastery, architectural precision"
      : artStyle === "charcoal"
      ? "charcoal drawing masterpiece, dramatic shadows and highlights, expressive strokes, classical drawing technique, fine art quality"
      : artStyle === "acrylic"
      ? "acrylic painting, vibrant colors, textured brushwork, contemporary art style, expressive technique, gallery quality"
      : artStyle === "pastel"
      ? "soft pastel drawing, delicate color blending, gentle texture, artistic refinement, traditional pastel technique"
      : "artistic masterpiece, creative illustration, professional quality";

    // Comprehensive prompt assembly - ADDITIONAL PROMPT IS COMBINED WITH ALL OTHER PROMPTS
    const baseCharacterPrompt = selectedCharacter.id !== "none" ? `Character: ${selectedCharacter.visualPrompt}` : "";

    const personalityPrompt = selectedCharacter.personality.length > 0 ? `Character personality traits: ${selectedCharacter.personality.join(', ')}` : "";
    const bookContextPrompt = selectedCharacter.id !== "none" ? `Literary context: character from "${selectedCharacter.bookTitle}" by ${selectedCharacter.author}` : "";

    // Start building prompt parts with base character information
    const promptParts = [
      baseCharacterPrompt,
      personalityPrompt,
      bookContextPrompt,
      styleEnhancer,
      qualityEnhancers.join(", "),
      "literary character portrait",
      "character-focused composition"
    ].filter(part => part.trim() !== "");

    // ADD additional prompt as EXTRA enhancement if provided
    if (useAdditionalPrompt && additionalPrompt.trim()) {
      promptParts.push(`Additional enhancements: ${additionalPrompt.trim()}`);
    }

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
    a.download = `boipoka-${selectedCharacter.id}-${artStyle}-${imageQuality}-${Date.now()}.png`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Boipoka.AI Header */}
      <div className="border-b border-blue-200 bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <span className="text-white text-2xl font-bold">B</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold">Boipoka Imagene</h1>
              <p className="text-blue-100">Imagine + Generate Your Favourite Characters</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Controls */}
          <div className="space-y-6">
            {/* Character Selection */}
            <div className="bg-white rounded-2xl border border-blue-200 shadow-lg">
              <div className="p-6 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-cyan-50">
                <h2 className="text-xl font-bold text-blue-800 flex items-center gap-3">
                  <span className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">📚</span>
                  Select Character
                </h2>
              </div>
              <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
                {bookCharacters.map((character) => (
                  <button
                    key={character.id}
                    onClick={() => setSelectedCharacter(character)}
                    className={`w-full p-4 rounded-xl text-left transition-all duration-300 ${
                      selectedCharacter.id === character.id
                        ? "bg-gradient-to-r from-blue-100 to-cyan-100 border-2 border-blue-300 shadow-md transform scale-105"
                        : "bg-blue-50 border-2 border-transparent hover:bg-blue-100 hover:border-blue-200"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">{character.avatar}</div>
                      <div className="flex-1">
                        <h3 className="font-bold text-blue-800">{character.name}</h3>
                        <p className="text-sm text-blue-600">{character.author}</p>
                        <p className="text-xs text-blue-500 mt-1">{character.bookTitle}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Art Style Selection */}
            <div className="bg-white rounded-2xl border border-blue-200 shadow-lg">
              <div className="p-6 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-cyan-50">
                <h2 className="text-xl font-bold text-blue-800 flex items-center gap-3">
                  <span className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">🎨</span>
                  Art Style
                </h2>
              </div>
              <div className="p-4 grid grid-cols-2 gap-3">
                {[
                  { value: "photorealistic", label: "📸 Photorealistic", description: "Ultra-realistic photography" },
                  { value: "oil-painting", label: "🖼️ Oil Painting", description: "Classical fine art" },
                  { value: "watercolor", label: "🎨 Watercolor", description: "Soft flowing colors" },
                  { value: "digital-art", label: "💻 Digital Art", description: "Modern digital illustration" },
                  { value: "pencil-sketch", label: "✏️ Pencil Sketch", description: "Hand-drawn graphite" },
                  { value: "charcoal", label: "⚫ Charcoal", description: "Dramatic shadows" },
                  { value: "acrylic", label: "🌈 Acrylic", description: "Vibrant paint texture" },
                  { value: "pastel", label: "🎭 Pastel", description: "Soft color blending" }
                ].map((style) => (
                  <button
                    key={style.value}
                    onClick={() => setArtStyle(style.value)}
                    className={`p-4 rounded-xl text-left transition-all duration-300 ${
                      artStyle === style.value
                        ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg transform scale-105"
                        : "bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200"
                    }`}
                  >
                    <div className="font-bold text-sm">{style.label}</div>
                    <div className="text-xs opacity-80 mt-1">{style.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quality Selection */}
            <div className="bg-white rounded-2xl border border-blue-200 shadow-lg">
              <div className="p-6 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-cyan-50">
                <h2 className="text-xl font-bold text-blue-800 flex items-center gap-3">
                  <span className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">💎</span>
                  Quality Level
                </h2>
              </div>
              <div className="p-4 space-y-3">
                {[
                  { value: "ultra", label: "💎 Ultra (8K)", description: "Maximum detail and quality" },
                  { value: "high", label: "⭐ High (4K)", description: "Professional quality" },
                  { value: "standard", label: "✨ Standard", description: "Good quality" }
                ].map((quality) => (
                  <button
                    key={quality.value}
                    onClick={() => setImageQuality(quality.value)}
                    className={`w-full p-4 rounded-xl text-left transition-all duration-300 ${
                      imageQuality === quality.value
                        ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg"
                        : "bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200"
                    }`}
                  >
                    <div className="font-bold text-sm">{quality.label}</div>
                    <div className="text-xs opacity-80 mt-1">{quality.description}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Additional Prompt & Generation */}
          <div className="space-y-6">
            {/* Additional Prompt Area */}
            <div className="bg-white rounded-2xl border border-blue-200 shadow-lg">
              <div className="p-6 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-cyan-50">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="useAdditionalPrompt"
                    checked={useAdditionalPrompt}
                    onChange={(e) => setUseAdditionalPrompt(e.target.checked)}
                    className="w-5 h-5 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                  />
                  <h2 className="text-xl font-bold text-blue-800 flex items-center gap-3">
                    <span className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">✨</span>
                    Additional Prompt
                  </h2>
                </div>
              </div>
              <div className="p-6">
                <textarea
                  placeholder={useAdditionalPrompt ? 
                    "Add extra details to enhance the character portrait... (e.g., 'golden hour lighting, mystical aura, holding ancient scroll, ornate background decorations, soft glow around character')" : 
                    "Enable to add additional details that will be combined with character description..."
                  }
                  value={additionalPrompt}
                  onChange={(e) => setAdditionalPrompt(e.target.value)}
                  disabled={!useAdditionalPrompt}
                  className={`w-full px-4 py-4 border-2 rounded-xl resize-none text-sm transition-all duration-300 ${
                    useAdditionalPrompt 
                      ? "border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white text-blue-800" 
                      : "border-blue-100 bg-blue-50 text-blue-400 cursor-not-allowed"
                  }`}
                  rows={8}
                  maxLength={2000}
                />
                <div className="flex justify-between items-center mt-3">
                  <p className="text-xs text-blue-600">
                    {useAdditionalPrompt ? 
                      "✅ These details will be ADDED to the character, style, and quality prompts" : 
                      "❌ Enable checkbox above to add extra enhancement details"
                    }
                  </p>
                  <span className="text-xs text-blue-500 font-mono bg-blue-50 px-2 py-1 rounded">
                    {additionalPrompt.length}/2000
                  </span>
                </div>
                {useAdditionalPrompt && additionalPrompt.length > 0 && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-xs text-green-700 font-semibold">
                      ✨ Additional details will be combined with all existing prompts for enhanced results!
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={generateCharacterImage}
              disabled={isGenerating || selectedCharacter.id === "none"}
              className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-600 hover:from-blue-700 hover:via-blue-800 hover:to-cyan-700 text-white font-bold py-6 px-8 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 text-xl"
            >
              {isGenerating ? (
                <div className="flex items-center justify-center gap-4">
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating Masterpiece...</span>
                </div>
              ) : (
                <span>🚀 Generate Character Portrait</span>
              )}
            </button>

            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-red-500 text-2xl">⚠️</span>
                  <p className="text-red-700 font-semibold">{error}</p>
                </div>
              </div>
            )}

            {/* Generated Image */}
            <div className="bg-white rounded-2xl border border-blue-200 shadow-lg">
              <div className="p-6 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-cyan-50">
                <h2 className="text-xl font-bold text-blue-800">Generated Portrait</h2>
              </div>
              <div className="p-6">
                {imageUrl && finalPrompt ? (
                  <div className="space-y-4">
                    <div className="relative">
                      <img 
                        src={imageUrl} 
                        alt={`AI Generated ${selectedCharacter.name}`}
                        className="w-full h-96 object-cover rounded-xl border-2 border-blue-200 shadow-lg"
                      />
                      <div className="absolute top-4 right-4 bg-black/80 text-white px-4 py-2 rounded-lg text-sm font-bold">
                        {artStyle.toUpperCase()} • {imageQuality.toUpperCase()}
                      </div>
                      {useAdditionalPrompt && additionalPrompt.trim() && (
                        <div className="absolute bottom-4 left-4 bg-green-600/90 text-white px-3 py-1 rounded-lg text-xs font-bold">
                          + Enhanced
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={downloadImage}
                        className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-bold transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
                      >
                        📥 Download
                      </button>
                      <button
                        onClick={clearImage}
                        className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-bold transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
                      >
                        🗑️ Clear
                      </button>
                      <button
                        onClick={generateCharacterImage}
                        disabled={isGenerating}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl font-bold transition-all duration-300 disabled:opacity-50 flex items-center gap-2 shadow-lg hover:shadow-xl"
                      >
                        🔄 Regenerate
                      </button>
                    </div>
                    
                    <div className="text-sm text-blue-700 bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-200 space-y-2">
                      <div><strong>Character:</strong> {selectedCharacter.name}</div>
                      <div><strong>Style:</strong> {artStyle.replace('-', ' ')} • Quality: {imageQuality}</div>
                      <div><strong>Seed:</strong> {seed}</div>
                      {useAdditionalPrompt && additionalPrompt.trim() && <div><strong>Enhancement:</strong> ✅ Additional prompts applied</div>}
                    </div>
                  </div>
                ) : finalPrompt && isGenerating ? (
                  <div className="text-center py-20">
                    <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-8"></div>
                    <p className="text-blue-700 font-bold text-xl mb-4">Creating Character Portrait...</p>
                    <p className="text-blue-600 text-lg mb-2">Character: {selectedCharacter.name}</p>
                    <p className="text-blue-500 text-lg">Style: {artStyle.replace('-', ' ')} • Quality: {imageQuality}</p>
                    {useAdditionalPrompt && additionalPrompt.trim() && (
                      <p className="text-green-600 text-sm mt-2">+ Additional enhancements applied</p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-20 border-2 border-dashed border-blue-300 rounded-xl bg-gradient-to-br from-blue-25 to-cyan-25">
                    <span className="text-8xl mb-6 block">{selectedCharacter.avatar}</span>
                    <p className="text-blue-700 font-bold text-xl mb-2">Ready to Create Portrait</p>
                    <p className="text-blue-600">Select character, style, and generate!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Character Info */}
            {selectedCharacter.id !== "none" && (
              <div className="bg-gradient-to-r from-blue-100 via-cyan-50 to-blue-100 rounded-2xl border-2 border-blue-300 p-6 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="text-5xl">{selectedCharacter.avatar}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-blue-800 mb-2">{selectedCharacter.name}</h3>
                    <p className="text-blue-700 font-semibold mb-2">
                      "{selectedCharacter.bookTitle}" by {selectedCharacter.author}
                    </p>
                    <p className="text-blue-600 mb-4 leading-relaxed">{selectedCharacter.description}</p>
                    {selectedCharacter.personality.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {selectedCharacter.personality.map((trait) => (
                          <span
                            key={trait}
                            className="px-3 py-1 bg-blue-200 text-blue-800 text-sm rounded-full font-semibold"
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

            {/* Additional Prompt Info */}
            {useAdditionalPrompt && additionalPrompt.trim() && (
              <div className="bg-gradient-to-r from-green-100 via-emerald-50 to-green-100 rounded-2xl border-2 border-green-300 p-6 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="text-5xl">✨</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-green-800 mb-2">Additional Enhancements</h3>
                    <p className="text-green-700 font-semibold mb-2">Combined with character description</p>
                    <p className="text-green-600 text-sm leading-relaxed bg-green-50 p-3 rounded-lg">
                      "{additionalPrompt.substring(0, 200)}{additionalPrompt.length > 200 ? '...' : ''}"
                    </p>
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