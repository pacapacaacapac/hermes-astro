import { createClient } from '@sanity/client'

export const sanityClient = createClient({
  projectId: 'wbuk0exn',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
})

export interface Concert {
  _id: string
  date: string        // ISO format: "2026-06-10"
  venue: string
  detail?: string
  city: string
  imageUrl?: string   // Sanity CDN URL
  imageCredit?: string
}

export async function getConcerts(): Promise<Concert[]> {
  return sanityClient.fetch(
    `*[_type == "concert"] | order(date desc) {
      _id,
      date,
      venue,
      detail,
      city,
      "imageUrl": image.asset->url,
      imageCredit
    }`
  )
}
