export async function detectCircles(base64Image) {
  return new Promise((resolve, reject) => {
    if (!window.cv) {
      reject('OpenCV.js not loaded')
      return
    }
    const img = new window.Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, img.width, img.height)
      let src = cv.matFromImageData(imageData)
      let gray = new cv.Mat()
      cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0)
      cv.medianBlur(gray, gray, 5)
      let circles = new cv.Mat()
      cv.HoughCircles(
        gray,
        circles,
        cv.HOUGH_GRADIENT,
        1,
        30,
        100,
        30,
        10,
        80
      )
      // Draw circles
      for (let i = 0; i < circles.cols; ++i) {
        let x = circles.data32F[i * 3]
        let y = circles.data32F[i * 3 + 1]
        let r = circles.data32F[i * 3 + 2]
        cv.circle(src, new cv.Point(x, y), r, [255, 0, 0, 255], 4)
      }
      // Draw result back to canvas
      cv.imshow(canvas, src)
      let imageWithCircles = canvas.toDataURL('image/jpeg')
      let count = circles.cols
      src.delete()
      gray.delete()
      circles.delete()
      resolve({ count, imageWithCircles })
    }
    img.onerror = reject
    img.src = base64Image
  })
}