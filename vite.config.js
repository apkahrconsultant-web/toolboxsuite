import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main:               resolve(__dirname, 'index.html'),
        removeBackground:   resolve(__dirname, 'remove-background.html'),
        pdfToWord:          resolve(__dirname, 'pdf-to-word.html'),
        wordToPdf:          resolve(__dirname, 'word-to-pdf.html'),
        excelToPdf:         resolve(__dirname, 'excel-to-pdf.html'),
        pdfToExcel:         resolve(__dirname, 'pdf-to-excel.html'),
        imageCompressor:    resolve(__dirname, 'image-compressor.html'),
        pdfMerger:          resolve(__dirname, 'pdf-merger.html'),
        imageResizer:       resolve(__dirname, 'image-resizer.html'),
        jpgToPng:           resolve(__dirname, 'jpg-to-png.html'),
        about: resolve(__dirname, 'src/about.html'),
        privacyPolicy: resolve(__dirname, 'src/privacy-policy.html'),
        contact: resolve(__dirname, 'src/contact.html'),
      }
    }
  }
})
