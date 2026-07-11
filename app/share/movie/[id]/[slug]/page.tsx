import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getMovieDetails, IMG_URL, BACKDROP_URL } from '@/lib/tmdb'
import { MovieShareView } from '@/components/movie-share-view'

interface MovieSharePageProps {
  params: {
    id: string
    slug: string
  }
}

export async function generateMetadata({
  params,
}: MovieSharePageProps): Promise<Metadata> {
  try {
    const movieId = parseInt(params.id)
    const details = await getMovieDetails(movieId, 'movie')

    return {
      title: `${details.title} - BMW Community`,
      description: details.overview || 'Check out this movie on BMW Community',
      openGraph: {
        title: details.title,
        description: details.overview || 'Check out this movie on BMW Community',
        images: details.backdrop_path
          ? [`${IMG_URL}${details.backdrop_path}`]
          : [],
      },
    }
  } catch {
    return {
      title: 'Movie - BMW Community',
      description: 'Check out this movie on BMW Community',
    }
  }
}

export default async function MovieSharePage({
  params,
}: MovieSharePageProps) {
  try {
    const movieId = parseInt(params.id)
    if (isNaN(movieId)) {
      notFound()
    }

    const details = await getMovieDetails(movieId, 'movie')

    return <MovieShareView movie={details} movieId={movieId} />
  } catch (error) {
    console.error('Failed to load movie:', error)
    notFound()
  }
}
