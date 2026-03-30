// FlexMLS PDF Parser
// Reads text extracted from a FlexMLS detail sheet and pulls out listing fields

export function parseFlexMLS(text) {
  const result = {
    address: '',
    city: '',
    state: 'FL',
    zip: '',
    price: '',
    bedrooms: '',
    bathrooms: '',
    sqft: '',
    description: '',
    amenities: [],
    available_date: '',
    pets_allowed: false,
    parking: '',
    laundry: '',
  }

  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  const full = text.replace(/\n/g, ' ')

  // --- Price ---
  // FlexMLS shows "List Price: $1,800/mo" or "Price: $1,800" or "$1,800/Month"
  const priceMatch = full.match(/(?:list\s*price|price|rent)[:\s]*\$?([\d,]+)/i)
    || full.match(/\$([\d,]+)\s*(?:\/mo|per month|\/month)/i)
    || full.match(/\$([\d,]+)/)
  if (priceMatch) result.price = priceMatch[1].replace(/,/g, '')

  // --- Address ---
  // FlexMLS typically puts address near top, often "Address: 123 Main St"
  const addrMatch = full.match(/(?:address|property address)[:\s]+([^\n,]+(?:St|Ave|Blvd|Dr|Rd|Ln|Way|Ct|Cir|Pl|Loop|Trail|Ter|Hwy|US-\d+)[^\n,]*)/i)
    || full.match(/(\d+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:St|Ave|Blvd|Dr|Rd|Ln|Way|Ct|Cir|Pl|Loop|Trail|Ter|Hwy)(?:\s+(?:N|S|E|W|NE|NW|SE|SW))?(?:\s+#\d+)?)/i)
  if (addrMatch) result.address = addrMatch[1].trim()

  // --- City, State, ZIP ---
  const cityStateZip = full.match(/([A-Za-z\s]+),\s*(FL|Florida)\s+(\d{5})/i)
  if (cityStateZip) {
    result.city = cityStateZip[1].trim()
    result.state = 'FL'
    result.zip = cityStateZip[3]
  }

  // --- Bedrooms ---
  const bedMatch = full.match(/(\d+(?:\.\d)?)\s*(?:bed(?:room)?s?|bd|br)\b/i)
    || full.match(/bed(?:room)?s?[:\s]+(\d+(?:\.\d)?)/i)
  if (bedMatch) result.bedrooms = bedMatch[1]

  // --- Bathrooms ---
  const bathMatch = full.match(/(\d+(?:\.\d+)?)\s*(?:bath(?:room)?s?|ba|bth)\b/i)
    || full.match(/bath(?:room)?s?[:\s]+(\d+(?:\.\d+)?)/i)
  if (bathMatch) result.bathrooms = bathMatch[1]

  // --- Sqft ---
  const sqftMatch = full.match(/([\d,]+)\s*(?:sq\.?\s*ft\.?|square\s*feet|sqft)/i)
    || full.match(/(?:sq\.?\s*ft\.?|square\s*feet|sqft|living area)[:\s]+([\d,]+)/i)
  if (sqftMatch) result.sqft = sqftMatch[1].replace(/,/g, '')

  // --- Pets ---
  if (/pets?\s*(?:allowed|ok|welcome|permitted|yes)/i.test(full)) result.pets_allowed = true
  if (/(?:no|not)\s*pets?/i.test(full)) result.pets_allowed = false

  // --- Parking ---
  const parkMatch = full.match(/parking[:\s]+([^\n.]+)/i)
    || full.match(/(attached garage|detached garage|carport|driveway|street parking|covered parking|garage)/i)
  if (parkMatch) result.parking = parkMatch[1].trim()

  // --- Laundry ---
  const laundryMatch = full.match(/laundry[:\s]+([^\n.]+)/i)
    || full.match(/(in-unit|in unit|washer.*dryer|w\/d hookup|laundry room|coin laundry)/i)
  if (laundryMatch) result.laundry = laundryMatch[1].trim()

  // --- Description / Remarks ---
  // FlexMLS has "Remarks:", "Public Remarks:", "Description:" sections
  const remarksMatch = text.match(/(?:public\s*)?remarks?[:\s]*\n?([\s\S]{30,800}?)(?:\n[A-Z][a-z]+:|$)/i)
    || text.match(/(?:description|comments?)[:\s]*\n?([\s\S]{30,600}?)(?:\n[A-Z][a-z]+:|$)/i)
  if (remarksMatch) result.description = remarksMatch[1].replace(/\s+/g, ' ').trim()

  // --- Amenities ---
  const amenityKeywords = [
    'Pool', 'Hot Tub', 'Spa', 'Gym', 'Fitness', 'Clubhouse', 'Gated',
    'Waterfront', 'Water View', 'Lake', 'Ocean', 'Beach',
    'AC', 'Air Conditioning', 'Central Air',
    'Dishwasher', 'Refrigerator', 'Microwave', 'Stove', 'Oven',
    'Hardwood', 'Tile', 'Carpet',
    'Patio', 'Balcony', 'Deck', 'Screened', 'Lanai',
    'Fenced', 'Yard', 'Garden',
    'Security', 'Alarm', 'Camera',
    'Furnished', 'Unfurnished',
    'HOA', 'Community',
    'EV Charging', 'Solar',
  ]
  const found = amenityKeywords.filter(a => new RegExp(a, 'i').test(full))
  result.amenities = found

  return result
}

// Extract text from PDF file using pdf.js via CDN
export async function extractTextFromPDF(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        // Dynamically load pdf.js
        if (!window.pdfjsLib) {
          await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js')
          window.pdfjsLib.GlobalWorkerOptions.workerSrc =
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
        }

        const typedArray = new Uint8Array(e.target.result)
        const pdf = await window.pdfjsLib.getDocument({ data: typedArray }).promise
        let fullText = ''

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i)
          const content = await page.getTextContent()
          const pageText = content.items.map(item => item.str).join(' ')
          fullText += pageText + '\n'
        }

        resolve(fullText)
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return }
    const s = document.createElement('script')
    s.src = src
    s.onload = resolve
    s.onerror = reject
    document.head.appendChild(s)
  })
}
