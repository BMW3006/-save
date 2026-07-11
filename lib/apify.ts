const APIFY_API_KEY = process.env.APIFY_API_KEY || "apify_api_VCqBbkFEozXsGKeqlHor0KwF718Eej113f0Q"

export interface MovieDownload {
  id: string
  title: string
  year: string
  quality: string
  size: string
  format: string
  downloadUrl: string
  posterUrl: string
  rating: number
  genre: string[]
}

export interface SearchResult {
  title: string
  year: string
  imdbId: string
  posterUrl: string
  type: string
}

// Search for movies to download
export async function searchMoviesForDownload(query: string): Promise<SearchResult[]> {
  try {
    const response = await fetch(
      `https://api.apify.com/v2/acts/epctex~imdb-scraper/run-sync-get-dataset-items?token=${APIFY_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          search: query,
          maxItems: 10,
        }),
      }
    )

    if (!response.ok) {
      // Return mock data if API fails
      return getMockSearchResults(query)
    }

    const data = await response.json()
    return data.map((item: Record<string, unknown>) => ({
      title: item.title || "Unknown",
      year: item.year || "N/A",
      imdbId: item.imdbId || "",
      posterUrl: item.poster || "/placeholder.svg",
      type: item.type || "movie",
    }))
  } catch {
    return getMockSearchResults(query)
  }
}

// Get download links for a movie
export async function getMovieDownloadLinks(imdbId: string, title: string): Promise<MovieDownload[]> {
  // Since Apify actors vary, we'll provide mock download data
  // In production, you'd use a specific torrent/download scraper actor
  return getMockDownloadLinks(imdbId, title)
}

// Mock search results for demo
function getMockSearchResults(query: string): SearchResult[] {
  const mockMovies = [
    { title: "Inception", year: "2010", imdbId: "tt1375666", posterUrl: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Ber.jpg", type: "movie" },
    { title: "The Dark Knight", year: "2008", imdbId: "tt0468569", posterUrl: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg", type: "movie" },
    { title: "Interstellar", year: "2014", imdbId: "tt0816692", posterUrl: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg", type: "movie" },
    { title: "The Matrix", year: "1999", imdbId: "tt0133093", posterUrl: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg", type: "movie" },
    { title: "Pulp Fiction", year: "1994", imdbId: "tt0110912", posterUrl: "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg", type: "movie" },
    { title: "Fight Club", year: "1999", imdbId: "tt0137523", posterUrl: "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg", type: "movie" },
    { title: "Forrest Gump", year: "1994", imdbId: "tt0109830", posterUrl: "https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg", type: "movie" },
    { title: "The Shawshank Redemption", year: "1994", imdbId: "tt0111161", posterUrl: "https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg", type: "movie" },
  ]

  const lowerQuery = query.toLowerCase()
  return mockMovies.filter(m => m.title.toLowerCase().includes(lowerQuery))
}

// Mock download links
function getMockDownloadLinks(imdbId: string, title: string): MovieDownload[] {
  return [
    {
      id: `${imdbId}-1080p`,
      title,
      year: "2024",
      quality: "1080p BluRay",
      size: "2.4 GB",
      format: "MKV",
      downloadUrl: "#",
      posterUrl: "/placeholder.svg",
      rating: 8.5,
      genre: ["Action", "Thriller"],
    },
    {
      id: `${imdbId}-720p`,
      title,
      year: "2024",
      quality: "720p WEB-DL",
      size: "1.2 GB",
      format: "MP4",
      downloadUrl: "#",
      posterUrl: "/placeholder.svg",
      rating: 8.5,
      genre: ["Action", "Thriller"],
    },
    {
      id: `${imdbId}-480p`,
      title,
      year: "2024",
      quality: "480p HDTV",
      size: "600 MB",
      format: "MP4",
      downloadUrl: "#",
      posterUrl: "/placeholder.svg",
      rating: 8.5,
      genre: ["Action", "Thriller"],
    },
  ]
}

// Popular movies for download section
export const popularDownloads: SearchResult[] = [
  { title: "Dune: Part Two", year: "2024", imdbId: "tt15239678", posterUrl: "https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg", type: "movie" },
  { title: "Oppenheimer", year: "2023", imdbId: "tt15398776", posterUrl: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg", type: "movie" },
  { title: "Barbie", year: "2023", imdbId: "tt1517268", posterUrl: "https://image.tmdb.org/t/p/w500/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg", type: "movie" },
  { title: "The Batman", year: "2022", imdbId: "tt1877830", posterUrl: "https://image.tmdb.org/t/p/w500/74xTEgt7R36Fvber9LAhLVovAS.jpg", type: "movie" },
  { title: "Top Gun: Maverick", year: "2022", imdbId: "tt1745960", posterUrl: "https://image.tmdb.org/t/p/w500/62HCnUTziyWcpDaBO2i1DG17Ecy.jpg", type: "movie" },
  { title: "Avatar: The Way of Water", year: "2022", imdbId: "tt1630029", posterUrl: "https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg", type: "movie" },
]
