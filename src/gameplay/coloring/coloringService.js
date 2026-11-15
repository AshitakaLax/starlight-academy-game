/**
 * Coloring persistence service: validate and save textures to wardrobe.
 */
import { WardrobeService } from "../../systems/wardrobe/wardrobeService.js";
import { ColoringStudio } from "./coloringStudio.js";

export class ColoringService {
  constructor(store, economy) {
    this.store = store;
    this.wardrobe = new WardrobeService(store, economy);
  }

  saveDesign(itemId, dataUrl) {
    const v = ColoringStudio.validateTexture(dataUrl);
    if (!v.ok) return v;
    return this.wardrobe.saveTexture(itemId, dataUrl);
  }

  loadDesign(itemId) {
    const textures = this.store.getState().wardrobe.textures || {};
    return textures[itemId] || null;
  }
}
export default ColoringService;
