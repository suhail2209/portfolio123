import Room from '../objects/Room.jsx'
import Environment from '../objects/Environment.jsx'
import Desk from '../objects/Desk.jsx'
import Monitors from '../objects/Monitors.jsx'
import Setup from '../objects/Setup.jsx'
import Designer from '../objects/Designer.jsx'
import Cat from '../objects/Cat.jsx'
import Collection from '../objects/Collection.jsx'
import Decor from '../objects/Decor.jsx'

/**
 * FRAME 1 — Designer's Room (hero scene).
 *
 * External assets: Designer (avatar GLB), Cat (GLB), Setup (PC + curved monitor GLB).
 * Everything else is procedural.
 * Interactive objects (hover/click): Designer, Cat, Collection, main monitor (Setup).
 *
 * Later frames (2: work / notice board, 3: skills / bookshelf, 4: studio door)
 * will be siblings of this group, positioned further along the room.
 */
export default function Frame1Room() {
  return (
    <group name="frame-1-room">
      <Room />
      <Environment />
      <Desk />
      <Monitors />
      <Setup />
      <Designer />
      <Cat />
      <Collection />
      <Decor />
    </group>
  )
}
