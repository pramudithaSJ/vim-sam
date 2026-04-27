import fs from 'fs'
import path from 'path'
import WeddingGallery from './components/WeddingGallery'

export default function Home() {
  // Auto-read images from public/images/ at build time
  const imagesDir = path.join(process.cwd(), 'public', 'images')
  let images: string[] = []
  try {
    images = fs
      .readdirSync(imagesDir)
      .filter((f) => /\.(jpe?g|png|gif|webp)$/i.test(f))
      .sort()
  } catch {
    // directory doesn't exist yet
  }
  return <WeddingGallery images={images} />
}
