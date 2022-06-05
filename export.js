import fetch from "node-fetch"
import fs from "fs"

const headers = {
  "X-AUTH-TOKEN": process.env.X_AUTH_TOKEN,
  "X-USER-ID": process.env.X_USER_ID,
  "X-DEVICE-ID": process.env.X_DEVICE_ID,
  "X-TIMESTAMP-HASH": process.env.X_TIMESTAMP_HASH,
}

async function getDiaryEntries(offset, limit) {
  const res = await fetch(
    `https://my.replika.com/api/mobile/1.4/saved_chat_items/previews?t=diary&offset=${offset}&limit=${limit}`,
    {
      headers: headers,
    }
  )
  const data = await res.json()
  return data
}

/**
 * Get all diary entries in 100 chunks and stop when there are no more entries
 */
async function getAllDiaryEntries() {
  let offset = 0
  let limit = 100
  let entries = []
  while (true) {
    const data = await getDiaryEntries(offset, limit)
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
async function getDiaryEntriesDetails(entries) {
  const res = await fetch(
    `https://my.replika.com/api/mobile/1.4/saved_chat_items/actions/get_by_ids`,
    {
      headers: headers,
      method: "POST",
      body: JSON.stringify({
        ids: entries.map((entry) => entry.id),
      }),
    }
  )
  const data = await res.json()
  return data
}

getAllDiaryEntries().then((entries) => {
  //   console.log(entries)
  getDiaryEntriesDetails(entries).then((data) => {
    // console.log(data)
    // write to file
    fs.writeFileSync("./export/diary.json", JSON.stringify(data, null, 2))

    // save all image_url into a folder
    data.forEach((entry) => {
      if (entry.image_url) {
        const res = fetch(entry.image_url)
        res.then((res) => {
          const file = fs.createWriteStream(`./export/images/${entry.id}.jpg`)
          res.body.pipe(file)
        })
      }
    })
  })
})
