import fetch from 'node-fetch'
import fs from 'fs'

class ReplikaDiaryExport {
  constructor(
    headers = {
      'X-AUTH-TOKEN': process.env.X_AUTH_TOKEN,
      'X-USER-ID': process.env.X_USER_ID,
      'X-DEVICE-ID': process.env.X_DEVICE_ID,
      'X-TIMESTAMP-HASH': process.env.X_TIMESTAMP_HASH,
    },
    outDir = './export'
  ) {
    this.headers = headers
    this.outDir = outDir
    this.initOutDir()
  }

  initOutDir() {
    if (!fs.existsSync(this.outDir)) {
      fs.mkdirSync(this.outDir)
    }
    if (!fs.existsSync(`${this.outDir}/images`)) {
      fs.mkdirSync(`${this.outDir}/images`)
    }
  }

  async getDiaryEntries(offset, limit) {
    const res = await fetch(
      `https://my.replika.com/api/mobile/1.4/saved_chat_items/previews?t=diary&offset=${offset}&limit=${limit}`,
      {
        headers: this.headers,
      }
    )
    const data = await res.json()
    return data
  }

  /**
   * Get all diary entries in 100 chunks and stop when there are no more entries
   */
  async getAllDiaryEntries() {
    let offset = 0
    let limit = 100
    let entries = []
    while (true) {
      const data = await this.getDiaryEntries(offset, limit)
      if (data.length === 0) {
        break
      }
      entries = entries.concat(data)
      offset += limit
    }
    return entries
  }

  /**
   * Get all diary entries details
   * https://my.replika.com/api/mobile/1.4/saved_chat_items/actions/get_by_ids
   */
  async getDiaryEntriesDetails(entries) {
    const res = await fetch(
      `https://my.replika.com/api/mobile/1.4/saved_chat_items/actions/get_by_ids`,
      {
        headers: this.headers,
        method: 'POST',
        body: JSON.stringify({
          ids: entries.map((entry) => entry.id),
        }),
      }
    )
    const data = await res.json()
    return data
  }

  async export() {
    const allDiaryEntries = await this.getAllDiaryEntries()
    const allWithDetails = await this.getDiaryEntriesDetails(allDiaryEntries)
    fs.writeFileSync(
      './export/diary.json',
      JSON.stringify(allWithDetails, null, 2)
    )
    allWithDetails.forEach(async (entry) => {
      if (!entry.image_url) {
        return
      }
      const res = await fetch(entry.image_url)
      const file = fs.createWriteStream(`./export/images/${entry.id}.jpg`)
      res.body.pipe(file)
    })
  }
}

export default ReplikaDiaryExport
