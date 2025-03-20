export const sliceUrl = (url) => {
  console.log(url);
  const index = url.indexOf("?");

  const newUrl = url.slice(0, index);
  return newUrl;
};
