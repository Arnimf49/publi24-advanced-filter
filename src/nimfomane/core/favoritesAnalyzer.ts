import {NimfomaneStorage} from "./storage";
import {analyzer} from "./analyzer";

const FAVORITES_ANALYSIS_PRIORITY = 50;

export const favoritesAnalyzer = {
  async analyze() {
    const favorites = NimfomaneStorage.getFavorites();
    
    for (const user of favorites) {
      const escort = NimfomaneStorage.getEscort(user);
      
      if (escort.optimizedProfileImage === undefined || escort.phone === undefined) {
        analyzer.analyzeEscort(user, FAVORITES_ANALYSIS_PRIORITY).catch(console.error);
      }
    }
  }
};
