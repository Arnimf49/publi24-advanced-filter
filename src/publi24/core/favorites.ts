import {AdUuid, WWStorage} from "./storage";
import {adData} from "./adData";

const favorites = {
  async optimizeFavorites(): Promise<void> {
    const favs = WWStorage.getFavorites();
    for (let phone of favs) {
      const phoneAds = WWStorage.getPhoneAds(phone);

      if (
        phoneAds.length < 2 ||
        Date.now() - WWStorage.getLastTimeAdsOptimized(phone) < 2.16e+7 // 6 hours
      ) {
        continue;
      }

      let newestTime = -Infinity;
      let newestUuid: AdUuid | undefined;

      for (let uuid of phoneAds) {
        const data = await adData.loadInAdsData([uuid]);
        await new Promise(r => setTimeout(r, 2500));

        if (data.length && data[0].timestamp > newestTime) {
          newestTime = data[0].timestamp;
          newestUuid = uuid;
        }
      }

      if (newestUuid) {
        WWStorage.setPhoneAdFirst(phone, newestUuid);
        WWStorage.setOptimizedAdsNow(phone);
        console.log(`Optimized first ad for favorite ${phone}`);
      }
    }
  },
};

export {favorites};
