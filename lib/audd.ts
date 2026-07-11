const API_TOKEN = "b5666487647019f6caa4073a075cc6c3"
const BASE_URL = "https://api.audd.io"

export interface Song {
  artist: string
  title: string
  album: string
  release_date: string
  label: string
  timecode: string
  song_link: string
  spotify?: {
    album: {
      name: string
      images: { url: string; height: number; width: number }[]
      release_date: string
    }
    artists: { name: string; id: string }[]
    external_urls: { spotify: string }
    name: string
    preview_url: string | null
    id: string
  }
  apple_music?: {
    artistName: string
    name: string
    albumName: string
    previews: { url: string }[]
    artwork: {
      url: string
      width: number
      height: number
    }
    url: string
  }
  deezer?: {
    title: string
    artist: { name: string }
    album: { title: string; cover_xl: string }
    preview: string
    link: string
  }
}

export interface RecognitionResult {
  status: "success" | "error"
  result: Song | null
  error?: {
    error_code: number
    error_message: string
  }
}

// Sample songs for display (since AudD is primarily for recognition, we'll show trending songs)
export const trendingSongs: Song[] = [
  {
    artist: "The Weeknd",
    title: "Blinding Lights",
    album: "After Hours",
    release_date: "2020-03-20",
    label: "XO / Republic Records",
    timecode: "0:00",
    song_link: "https://lis.tn/BlindingLights",
    spotify: {
      album: {
        name: "After Hours",
        images: [{ url: "https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36", height: 640, width: 640 }],
        release_date: "2020-03-20"
      },
      artists: [{ name: "The Weeknd", id: "1Xyo4u8uXC1ZmMpatF05PJ" }],
      external_urls: { spotify: "https://open.spotify.com/track/0VjIjW4GlUZAMYd2vXMi3b" },
      name: "Blinding Lights",
      preview_url: "https://p.scdn.co/mp3-preview/31f65b6a613010ff9e0ac10fe7c4e5dd4c6e7d4d",
      id: "0VjIjW4GlUZAMYd2vXMi3b"
    }
  },
  {
    artist: "Dua Lipa",
    title: "Levitating",
    album: "Future Nostalgia",
    release_date: "2020-03-27",
    label: "Warner Records",
    timecode: "0:00",
    song_link: "https://lis.tn/Levitating",
    spotify: {
      album: {
        name: "Future Nostalgia",
        images: [{ url: "https://i.scdn.co/image/ab67616d0000b273bd26ede1ae69327010d49946", height: 640, width: 640 }],
        release_date: "2020-03-27"
      },
      artists: [{ name: "Dua Lipa", id: "6M2wZ9GZgrQXHCFfjv46we" }],
      external_urls: { spotify: "https://open.spotify.com/track/463CkQjx2Zk1yXoBuierM9" },
      name: "Levitating",
      preview_url: "https://p.scdn.co/mp3-preview/fb9ad14b5c1af6e2a3f12356f9b9a0b3a0b7a5f5",
      id: "463CkQjx2Zk1yXoBuierM9"
    }
  },
  {
    artist: "Harry Styles",
    title: "As It Was",
    album: "Harry's House",
    release_date: "2022-05-20",
    label: "Columbia Records",
    timecode: "0:00",
    song_link: "https://lis.tn/AsItWas",
    spotify: {
      album: {
        name: "Harry's House",
        images: [{ url: "https://i.scdn.co/image/ab67616d0000b2732e8ed79e177ff6011076f5f0", height: 640, width: 640 }],
        release_date: "2022-05-20"
      },
      artists: [{ name: "Harry Styles", id: "6KImCVD70vtIoJWnq6nGn3" }],
      external_urls: { spotify: "https://open.spotify.com/track/4Dvkj6JhhA12EX05fT7y2e" },
      name: "As It Was",
      preview_url: null,
      id: "4Dvkj6JhhA12EX05fT7y2e"
    }
  },
  {
    artist: "Bad Bunny",
    title: "Titi Me Pregunto",
    album: "Un Verano Sin Ti",
    release_date: "2022-05-06",
    label: "Rimas Entertainment",
    timecode: "0:00",
    song_link: "https://lis.tn/TitiMePregunto",
    spotify: {
      album: {
        name: "Un Verano Sin Ti",
        images: [{ url: "https://i.scdn.co/image/ab67616d0000b27349d694203245f241a1bcaa72", height: 640, width: 640 }],
        release_date: "2022-05-06"
      },
      artists: [{ name: "Bad Bunny", id: "4q3ewBCX7sLwd24euuV69X" }],
      external_urls: { spotify: "https://open.spotify.com/track/1IHWl5LamUGEuP4ozKQSXZ" },
      name: "Titi Me Pregunto",
      preview_url: null,
      id: "1IHWl5LamUGEuP4ozKQSXZ"
    }
  },
  {
    artist: "Beyonce",
    title: "CUFF IT",
    album: "RENAISSANCE",
    release_date: "2022-07-29",
    label: "Columbia Records",
    timecode: "0:00",
    song_link: "https://lis.tn/CUFFIT",
    spotify: {
      album: {
        name: "RENAISSANCE",
        images: [{ url: "https://i.scdn.co/image/ab67616d0000b2730e58a0f8308c1ad403d105e7", height: 640, width: 640 }],
        release_date: "2022-07-29"
      },
      artists: [{ name: "Beyonce", id: "6vWDO969PvNqNYHIOW5v0m" }],
      external_urls: { spotify: "https://open.spotify.com/track/1xzi1Jcr7mEi9K2RfzLOqS" },
      name: "CUFF IT",
      preview_url: null,
      id: "1xzi1Jcr7mEi9K2RfzLOqS"
    }
  },
  {
    artist: "SZA",
    title: "Kill Bill",
    album: "SOS",
    release_date: "2022-12-09",
    label: "Top Dawg Entertainment",
    timecode: "0:00",
    song_link: "https://lis.tn/KillBill",
    spotify: {
      album: {
        name: "SOS",
        images: [{ url: "https://i.scdn.co/image/ab67616d0000b2730c471c36970b9406233842a5", height: 640, width: 640 }],
        release_date: "2022-12-09"
      },
      artists: [{ name: "SZA", id: "7tYKF4w9nC0nq9CsPZTHyP" }],
      external_urls: { spotify: "https://open.spotify.com/track/1Qrg8KqiBpW07V7PNxwwwL" },
      name: "Kill Bill",
      preview_url: null,
      id: "1Qrg8KqiBpW07V7PNxwwwL"
    }
  },
  {
    artist: "Miley Cyrus",
    title: "Flowers",
    album: "Endless Summer Vacation",
    release_date: "2023-03-10",
    label: "Columbia Records",
    timecode: "0:00",
    song_link: "https://lis.tn/Flowers",
    spotify: {
      album: {
        name: "Endless Summer Vacation",
        images: [{ url: "https://i.scdn.co/image/ab67616d0000b273f429549123dbe8552764ba1d", height: 640, width: 640 }],
        release_date: "2023-03-10"
      },
      artists: [{ name: "Miley Cyrus", id: "5YGY8feqx7naU7z4HrwZM6" }],
      external_urls: { spotify: "https://open.spotify.com/track/0yLdNVWF3Srea0uzk55zFn" },
      name: "Flowers",
      preview_url: null,
      id: "0yLdNVWF3Srea0uzk55zFn"
    }
  },
  {
    artist: "Metro Boomin ft. The Weeknd & 21 Savage",
    title: "Creepin'",
    album: "Heroes & Villains",
    release_date: "2022-12-02",
    label: "Republic Records",
    timecode: "0:00",
    song_link: "https://lis.tn/Creepin",
    spotify: {
      album: {
        name: "Heroes & Villains",
        images: [{ url: "https://i.scdn.co/image/ab67616d0000b273c4fee55d7b51479627c31f89", height: 640, width: 640 }],
        release_date: "2022-12-02"
      },
      artists: [{ name: "Metro Boomin", id: "0iEtIxbK0KxaSlF7G42ZOp" }],
      external_urls: { spotify: "https://open.spotify.com/track/2dHHgzDwk4BJdRwy9uXhTO" },
      name: "Creepin'",
      preview_url: null,
      id: "2dHHgzDwk4BJdRwy9uXhTO"
    }
  },
  {
    artist: "Taylor Swift",
    title: "Anti-Hero",
    album: "Midnights",
    release_date: "2022-10-21",
    label: "Republic Records",
    timecode: "0:00",
    song_link: "https://lis.tn/AntiHero",
    spotify: {
      album: {
        name: "Midnights",
        images: [{ url: "https://i.scdn.co/image/ab67616d0000b273bb54dde68cd23e2a268ae0f5", height: 640, width: 640 }],
        release_date: "2022-10-21"
      },
      artists: [{ name: "Taylor Swift", id: "06HL4z0CvFAxyc27GXpf02" }],
      external_urls: { spotify: "https://open.spotify.com/track/0V3wPSX9ygBnCm8psDIegu" },
      name: "Anti-Hero",
      preview_url: null,
      id: "0V3wPSX9ygBnCm8psDIegu"
    }
  },
  {
    artist: "Rema & Selena Gomez",
    title: "Calm Down",
    album: "Rave & Roses",
    release_date: "2022-08-25",
    label: "Mavin Records",
    timecode: "0:00",
    song_link: "https://lis.tn/CalmDown",
    spotify: {
      album: {
        name: "Rave & Roses",
        images: [{ url: "https://i.scdn.co/image/ab67616d0000b2736ecb5c59eebb10c124641969", height: 640, width: 640 }],
        release_date: "2022-08-25"
      },
      artists: [{ name: "Rema", id: "46pWGuE3dSwY3bMMXGBvVS" }, { name: "Selena Gomez", id: "0C8ZW7ezQVs4URX5aX7Kqx" }],
      external_urls: { spotify: "https://open.spotify.com/track/0WtM2NBVQNNJLh6scP13H8" },
      name: "Calm Down",
      preview_url: null,
      id: "0WtM2NBVQNNJLh6scP13H8"
    }
  },
  {
    artist: "Diamond Platnumz",
    title: "Komasava",
    album: "Komasava",
    release_date: "2023-01-15",
    label: "WCB Wasafi",
    timecode: "0:00",
    song_link: "https://lis.tn/Komasava",
    spotify: {
      album: {
        name: "Komasava",
        images: [{ url: "https://i.scdn.co/image/ab67616d0000b273d9b35a1d5b0d5d6bf3defd83", height: 640, width: 640 }],
        release_date: "2023-01-15"
      },
      artists: [{ name: "Diamond Platnumz", id: "4MdAb5Y1oo8jkF6sivCVvj" }],
      external_urls: { spotify: "https://open.spotify.com/track/example" },
      name: "Komasava",
      preview_url: null,
      id: "example1"
    }
  },
  {
    artist: "Harmonize",
    title: "Mwaka Wangu",
    album: "High School",
    release_date: "2023-02-20",
    label: "Konde Music Worldwide",
    timecode: "0:00",
    song_link: "https://lis.tn/MwakaWangu",
    spotify: {
      album: {
        name: "High School",
        images: [{ url: "https://i.scdn.co/image/ab67616d0000b273e5c7b4ad7b7e42b3e15b9e6a", height: 640, width: 640 }],
        release_date: "2023-02-20"
      },
      artists: [{ name: "Harmonize", id: "5tWJDaLkj8FKhCcV6VqLhW" }],
      external_urls: { spotify: "https://open.spotify.com/track/example2" },
      name: "Mwaka Wangu",
      preview_url: null,
      id: "example2"
    }
  }
]

// Recognize song from URL
export async function recognizeSongFromUrl(audioUrl: string): Promise<RecognitionResult> {
  try {
    const response = await fetch(`${BASE_URL}/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        api_token: API_TOKEN,
        url: audioUrl,
        return: "spotify,apple_music,deezer",
      }),
    })

    const data = await response.json()
    return data as RecognitionResult
  } catch (error) {
    console.error("Recognition error:", error)
    return {
      status: "error",
      result: null,
      error: {
        error_code: 999,
        error_message: "Network error occurred",
      },
    }
  }
}

// Get trending songs (mock data for display)
export async function getTrendingSongs(): Promise<Song[]> {
  // In a real app, you would fetch from a music API like Spotify Charts
  // For now, we return our curated trending list
  return trendingSongs
}

// Get album artwork URL helper
export function getAlbumArt(song: Song, size: "small" | "medium" | "large" = "large"): string {
  // Try Spotify first
  if (song.spotify?.album?.images?.[0]?.url) {
    return song.spotify.album.images[0].url
  }
  
  // Try Apple Music
  if (song.apple_music?.artwork?.url) {
    const width = size === "large" ? 640 : size === "medium" ? 300 : 100
    return song.apple_music.artwork.url.replace("{w}", String(width)).replace("{h}", String(width))
  }
  
  // Try Deezer
  if (song.deezer?.album?.cover_xl) {
    return song.deezer.album.cover_xl
  }
  
  // Fallback placeholder
  return "/placeholder.svg"
}

// Get preview URL helper
export function getPreviewUrl(song: Song): string | null {
  if (song.spotify?.preview_url) return song.spotify.preview_url
  if (song.apple_music?.previews?.[0]?.url) return song.apple_music.previews[0].url
  if (song.deezer?.preview) return song.deezer.preview
  return null
}

// Get streaming link helper
export function getStreamingLink(song: Song, platform: "spotify" | "apple" | "deezer" = "spotify"): string | null {
  switch (platform) {
    case "spotify":
      return song.spotify?.external_urls?.spotify || null
    case "apple":
      return song.apple_music?.url || null
    case "deezer":
      return song.deezer?.link || null
    default:
      return song.song_link || null
  }
}
