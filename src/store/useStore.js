import { create } from 'zustand'

/**
 * Global UI/scene state.
 *  hovered      : id of the interactive object under the pointer (or null)
 *  activeFrame  : 0 = Designer's Room. Future frames will bump this via scroll.
 */
export const useStore = create((set) => ({
  hovered: null,
  setHovered: (v) => set((s) => ({ hovered: typeof v === 'function' ? v(s.hovered) : v })),

  activeFrame: 0,
  setActiveFrame: (activeFrame) => set({ activeFrame }),
}))

/** Mutable animation bus (read/written inside useFrame, outside React). */
export const anim = {
  mouseOffset: 0, // metres, x-offset of the mouse + right hand
  typing: 0, // 0..1 typing intensity
}
