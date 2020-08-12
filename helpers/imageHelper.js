const jimp = require('jimp');

const formatAvatar = async (buffer) => {
  const image = await jimp.read(buffer);

  const newImageBuffer = await image
    .resize(100, 100)
    .getBufferAsync(jimp.MIME_PNG);

  return {
    buffer: newImageBuffer,
    mime: jimp.MIME_PNG
  };
};

/* ==========================================================================
      Exports
      ========================================================================== */

module.exports = {
  formatAvatar
};
