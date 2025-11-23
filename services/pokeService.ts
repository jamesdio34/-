import { Pokemon } from '../types';

const BASE_URL = 'https://pokeapi.co/api/v2';

export const drawOnePokemon = async (): Promise<Pokemon> => {
  // Gen 5 animated sprites cover Gen 1-5 (IDs 1-649). 
  // We pick a random one from this range.
  const randomId = Math.floor(Math.random() * 649) + 1;
  
  try {
    // 1. Fetch Basic Pokemon Data (for Sprites and Species URL)
    const response = await fetch(`${BASE_URL}/pokemon/${randomId}`);
    if (!response.ok) {
        throw new Error("Failed to fetch pokemon");
    }
    const data = await response.json();

    // Prefer animated Gen 5 sprite
    const animatedSprite = data.sprites.versions['generation-v']['black-white'].animated.front_default;
    const staticSprite = data.sprites.front_default;

    // 2. Fetch Species Data to get Traditional Chinese Name
    let displayName = data.name;
    try {
        const speciesResponse = await fetch(data.species.url);
        if (speciesResponse.ok) {
            const speciesData = await speciesResponse.json();
            const foundName = speciesData.names.find((n: any) => n.language.name === 'zh-Hant');
            if (foundName) {
                displayName = foundName.name;
            }
        }
    } catch (e) {
        console.warn("Failed to fetch species name, falling back to English", e);
    }

    return {
      id: data.id,
      name: displayName, 
      spriteUrl: animatedSprite || staticSprite,
      obtainedAt: Date.now(),
    };
  } catch (error) {
    console.error("Gacha error:", error);
    // Fallback Pikachu with Chinese name
    return {
      id: 25,
      name: '皮卡丘',
      spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/25.gif',
      obtainedAt: Date.now(),
    };
  }
};
