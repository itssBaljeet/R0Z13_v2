// Assumes both arrays = size
async function createMap(array1, array2) {
  if (array1.length !== array2.length) {
    throw new Error("Arrays must be of the same size to create a map.");
  }
  const map = new Map();
  for (let i = 0; i < array1.length; i++) {
    map.set(array1[i], array2[i])
  }
  return map;
}

module.exports = { createMap }