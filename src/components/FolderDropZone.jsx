import React, { useState, useRef } from 'react'
import { extractTextFromPDF, parseFlexMLS } from '../lib/mlsParser'

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic']
const isImage = (file) => IMAGE_TYPES.includes(file.type) || /\.(jpg|jpeg|png|webp|gif|heic)$/i.test(file.name)
const isPDF = (file) => file.type === 'application/pdf' || /\.pdf$/i.test(file.name)

// Guess room label from filename
function guessLabel(filename) {
  const name = filename.toLowerCase()
  if (/front|exterior|outside|curb/.test(name)) return 'Exterior'
  if (/kitchen/.test(name)) return 'Kitchen'
  if (/living|family|great/.test(name)) return 'Living Room'
  if (/master|primary|main\s*bed/.test(name)) return 'Master Bedroom'
  if (/bed/.test(name)) return 'Bedroom'
  if (/bath/.test(name)) return 'Bathroom'
  if (/dining/.test(name)) return 'Dining Room'
  if (/garage/.test(name)) return 'Garage'
  if (/yard|backyard|patio|lanai|pool|outdoor/.test(name)) return 'Outdoor'
  if (/laundry|utility/.test(name)) return 'Laundry'
  if (/office|den|study/.test(name)) return 'Office'
  if (/foyer|entry|entrance/.test(name)) return 'Entryway'
  return ''
}

export default function FolderDropZone({ onParsed }) {
  const [status, setStatus] = useState('idle') // idle | parsing | done | error
  const [log, setLog] = useState([])
  const [isDragOver, setIsDragOver] = useState(false)
  const inputRef = useRef()

  function addLog(msg, type = 'info') {
    setLog(prev => [...prev, { msg, type, id: Date.now() + Math.random() }])
  }

  async function processFiles(fileList) {
    setStatus('parsing')
    setLog([])

    const files = Array.from(fileList)
    addLog(`Found ${files.length} files in folder...`)

    // Separate PDFs and images
    const pdfs = files.filter(isPDF)
    const images = files.filter(isImage)

    addLog(`📄 ${pdfs.length} PDF(s) found, 🖼️ ${images.length} photo(s) found`)

    let parsedData = {}

    // Parse MLS PDF
    if (pdfs.length > 0) {
      const mlsPDF = pdfs.find(f => /mls|detail|listing/i.test(f.name)) || pdfs[0]
      addLog(`Reading MLS sheet: ${mlsPDF.name}...`)
      try {
        const text = await extractTextFromPDF(mlsPDF)
        parsedData = parseFlexMLS(text)
        addLog(`✅ Address: ${parsedData.address || 'Not found'}`, parsedData.address ? 'success' : 'warn')
        addLog(`✅ Price: ${parsedData.price ? '$' + parsedData.price + '/mo' : 'Not found'}`, parsedData.price ? 'success' : 'warn')
        addLog(`✅ Beds/Baths: ${parsedData.bedrooms || '?'}bd / ${parsedData.bathrooms || '?'}ba`, 'success')
        if (parsedData.sqft) addLog(`✅ Sqft: ${parsedData.sqft}`, 'success')
        if (parsedData.description) addLog(`✅ Description found (${parsedData.description.length} chars)`, 'success')
        if (parsedData.amenities?.length) addLog(`✅ Amenities: ${parsedData.amenities.join(', ')}`, 'success')
      } catch (err) {
        addLog(`⚠️ Could not read PDF — you can fill in details manually`, 'warn')
        console.error(err)
      }
    } else {
      addLog('⚠️ No PDF found — fill in listing details manually', 'warn')
    }

    // Process photos
    const photoFiles = images
      .sort((a, b) => {
        // Sort: exterior/front first, then by filename
        const aFront = /front|exterior|outside|curb/i.test(a.name)
        const bFront = /front|exterior|outside|curb/i.test(b.name)
        if (aFront && !bFront) return -1
        if (!aFront && bFront) return 1
        return a.name.localeCompare(b.name)
      })
      .map(file => ({
        file,
        label: guessLabel(file.name),
        preview: URL.createObjectURL(file)
      }))

    if (photoFiles.length > 0) {
      addLog(`✅ ${photoFiles.length} photos loaded & labeled`, 'success')
    }

    setStatus('done')
    addLog(`🎉 Ready! Review the form below and click Publish.`, 'success')

    onParsed(parsedData, photoFiles)
  }

  async function handleDrop(e) {
    e.preventDefault()
    setIsDragOver(false)

    const items = e.dataTransfer.items
    const files = []

    async function traverseEntry(entry) {
      if (entry.isFile) {
        return new Promise(resolve => entry.file(f => { files.push(f); resolve() }))
      } else if (entry.isDirectory) {
        return new Promise(resolve => {
          const reader = entry.createReader()
          reader.readEntries(async entries => {
            await Promise.all(entries.map(traverseEntry))
            resolve()
          })
        })
      }
    }

    const entries = Array.from(items).map(i => i.webkitGetAsEntry()).filter(Boolean)
    await Promise.all(entries.map(traverseEntry))

    if (files.length > 0) await processFiles(files)
  }

  function handleFolderInput(e) {
    processFiles(e.target.files)
  }

  const colors = { info: 'var(--charcoal)', success: 'var(--success)', warn: '#B07D00', error: 'var(--accent)' }

  return (
    <div style={{ marginBottom: '28px' }}>
      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={e => { e.preventDefault(); setIsDragOver(true) }}
        onDragLeave={() => setIsDragOver(false)}
        onClick={() => inputRef.current.click()}
        style={{
          border: `2px dashed ${isDragOver ? 'var(--accent)' : 'var(--border-strong)'}`,
          borderRadius: '12px',
          padding: '40px 24px',
          textAlign: 'center',
          cursor: 'pointer',
          background: isDragOver ? 'rgba(181,72,42,0.04)' : 'var(--cream)',
          transition: 'all 0.2s'
        }}
      >
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>📁</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: '500', marginBottom: '8px' }}>
          Drop Your Address Folder Here
        </div>
        <div style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.6 }}>
          Drag the entire folder (e.g. <strong>"3456 Oak St"</strong>) — it will read the MLS PDF<br />
          and load all photos automatically
        </div>
        <div style={{ marginTop: '16px', display: 'inline-block', padding: '8px 20px', background: 'var(--charcoal)', color: 'white', borderRadius: '100px', fontSize: '13px', fontWeight: '500' }}>
          Or click to browse folder
        </div>
      </div>

      {/* Hidden folder input */}
      <input
        ref={inputRef}
        type="file"
        webkitdirectory="true"
        multiple
        onChange={handleFolderInput}
        style={{ display: 'none' }}
      />

      {/* Parse Log */}
      {log.length > 0 && (
        <div style={{ marginTop: '16px', background: 'var(--deep)', borderRadius: '8px', padding: '16px 20px' }}>
          {log.map(entry => (
            <div key={entry.id} style={{ fontSize: '13px', color: colors[entry.type] || 'white', marginBottom: '4px', fontFamily: 'monospace' }}>
              {entry.msg}
            </div>
          ))}
        </div>
      )}

      {status === 'done' && (
        <div style={{ marginTop: '12px', padding: '10px 16px', background: 'rgba(58,125,68,0.1)', border: '1px solid rgba(58,125,68,0.3)', borderRadius: '8px', fontSize: '13px', color: 'var(--success)', fontWeight: '500' }}>
          ✅ Form auto-filled from MLS data — review below and publish!
        </div>
      )}
    </div>
  )
}
