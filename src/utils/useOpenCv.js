import { useEffect, useState } from "react"

export function useOpenCv() {
  const [cvLoaded, setCvLoaded] = useState(false)

  useEffect(() => {
    if (window.cv) {
      setCvLoaded(true)
      return
    }
    if (document.getElementById("opencvjs")) {
      const check = setInterval(() => {
        if (window.cv) {
          setCvLoaded(true)
          clearInterval(check)
        }
      }, 100)
      return
    }
    const script = document.createElement("script")
    script.id = "opencvjs"
    script.src = "https://docs.opencv.org/4.x/opencv.js"
    script.async = true
    script.onload = () => setCvLoaded(true)
    document.body.appendChild(script)
  }, [])

  return cvLoaded
}