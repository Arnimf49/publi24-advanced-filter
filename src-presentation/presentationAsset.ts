const getUrl = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;

export const presentationAsset = {
  getUrl,
};
