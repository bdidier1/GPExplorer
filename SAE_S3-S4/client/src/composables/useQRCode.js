import QRCode from 'qrcode'
import { ref } from 'vue'

export function useQRCode() {
  const qrCodeDataURL = ref('')
  const error = ref('')
  const loading = ref(false)

  async function generateQRCode(text) {
    if (!text) {
      error.value = 'Aucun texte fourni pour générer le QR code'
      return null
    }

    loading.value = true
    error.value = ''

    try {
      const dataURL = await QRCode.toDataURL(text, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      qrCodeDataURL.value = dataURL
      return dataURL
    } catch (err) {
      error.value = 'Erreur lors de la génération du QR code'
      console.error('Erreur QR Code:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    qrCodeDataURL,
    error,
    loading,
    generateQRCode
  }
}
