import jsQR from 'jsqr';

export function generateQRString(itemName) {
  const timestamp = Date.now();
  const sanitizedName = itemName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  return `${sanitizedName}-${timestamp}`;
}

export async function extractQRFromBase64(base64Image) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      resolve(code ? [code.data] : []);
    };
    img.onerror = () => resolve([]);
    img.src = base64Image;
  });
}