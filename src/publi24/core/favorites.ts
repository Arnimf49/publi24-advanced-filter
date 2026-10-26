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
        const {ads: data} = await adData.loadInAdsData([uuid], (id) => {
          WWStorage.removePhoneAd(phone, id);
        });
        await new Promise(r => setTimeout(r, 2500));

        if (!data.length) {
          continue;
        }

        const timestamp = data[0].timestamp;
        // Ads reposted on the same minute share a timestamp. Use the id as a
        // deterministic tie-breaker so the first ad does not depend on the
        // current order of the stored ads.
        const isNewer = timestamp > newestTime
          || (timestamp === newestTime && timestamp > 0 && !!newestUuid && uuid.id < newestUuid.id);

        if (isNewer) {
          newestTime = timestamp;
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
