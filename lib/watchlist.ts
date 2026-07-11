"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Movie } from "./tmdb"

interface WatchlistStore {
  watchlist: Movie[]
  addToWatchlist: (movie: Movie) => void
  removeFromWatchlist: (movieId: number) => void
  isInWatchlist: (movieId: number) => boolean
  clearWatchlist: () => void
}

export const useWatchlist = create<WatchlistStore>()(
  persist(
    (set, get) => ({
      watchlist: [],
      addToWatchlist: (movie) =>
        set((state) => {
          if (state.watchlist.some((m) => m.id === movie.id)) return state
          return { watchlist: [...state.watchlist, movie] }
        }),
      removeFromWatchlist: (movieId) =>
        set((state) => ({
          watchlist: state.watchlist.filter((m) => m.id !== movieId),
        })),
      isInWatchlist: (movieId) => get().watchlist.some((m) => m.id === movieId),
      clearWatchlist: () => set({ watchlist: [] }),
    }),
    {
      name: "nadhili-watchlist",
    }
  )
)
