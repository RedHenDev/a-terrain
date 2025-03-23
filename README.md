# jojo world (formally a-terrain)
A-frame project using procedural terrain and z-tilt VR locomotion controls

attributions

"Great Hall" (https://skfb.ly/69RHE) by Abby Crawford is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).

"Harry Potter Hogwarts Castle and the Commons" (https://skfb.ly/oVpLy) by Bardiks is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).

To Do & ideas

*these below from March 16 2025

DONE-refac - port project to Eigenlicht, for multiplaying with jojo.

-f jojo request: buildings and 'minecraft people'

-f tyrannosaurus to be black with blue eyes, white teeth, and pink tongue ('no lips')

-f would also now like triceratops to be black

-f Jojo request: family of triceratops and one tyrannosaurus

-f Jojo request: Ender dragon purple, and is a villain; Ghast fights Ender

-refac look_at yclamping ported to ai-loco DONE

-dev allow ai-loco to fly up and down and adjust rotation when
incorrect model rotation DONE

*below before March 2025

DONE -feature ai dedicated movement component (rather than spaghetti in a-loco)

-feature cross-platform controls (menu button on screen?)

-feature control instructions

-feature snomodillo to follow and talk with etc quest master

DONE -feature mobs from blockbench

-bug Stop 'lag' at start due to loading of terrains immediately of moving

-feature replace all instaces of 'player' with 'subject'

-feature Direction indicators

DONE -bug correct tree trunks

DONE -feature double sided canopy

DONE -bug correct pitch when at zero?

DONE -project organise projects: for Amelie; for DEV; collapse VR and basic into 1 proj
            (DEV), and think about how to maintain updated integration in modular way

-feature collision with trees by Map()-ing their locations and widths

-bug are grass, plant, and forest chunks being removed correctly?

DONE -bug-feature have HUD face player

-feature 'game' manager, so that particular features only appear for particular
            world seeds or by some other determinant.
            see urizen.js 282; see HUD.js

-bug text on top

-feature caverns somehow

-feature fauna -- ducklings and lunar bunnies etc.

-feature story system

-feature quest system (against the clock adventures?)

-bug quest system v1 not working on mobile?

-feature ambient sound

-feature ability to reload entire terrain etc. e.g. when subject changes properties

-feature snow layer via shader when is snowing (use timer)

-feature vary time of day?

-feature rain

-feature develop flora and grass

-feature fauna: fish

-feature ability to slip and constrain against climbing terrain if too steep

-feature explore different means of multiplayer (Websockets first)

-feature aesthetics of fog, sky, terrain vistas


# Jojo World
VR multiplayer game - for Jojo

Attempting to port from Eigengrau Light...

https://docs.google.com/forms/d/e/1FAIpQLSdB8LEZIoYuh4_tO89s2DbMT7nqyDvJGrgrrUoBquLA4XCBRA/viewform

WT: 'Eigengrau Light'

attributions
(see bottom of doc for more details about licensing etc)

Claude 3.7 (Anthropic) - coding
Grok 3 beta (X) - coding
MeshyAI - 3D modelling, textures, rigging
Suno - music


CONTROLS:
- Click anywhere to enable mouse look
- Press ESC to exit mouse look (not fullscreen)
- Press F to toggle fullscreen mode
- WASD/Arrow keys to move
- Shift to toggle run
- m to toggle music
- p next track

triage

1- avatars with nice models

2- sync behaviours and test terrain feature for multi-p

3- collectibles system (that can lift from different kinds of script, e.g. where pyramids might supply its items, but in other script where I might manually place things, or where NPCs have dropped them)

ad como key

-dev = develop new features from existing system
-f = create new feature
-i = general idea that might become feature or something developed
-b = bug
-refac = something to refactor

to do

-dev woods in only certain areas; option to decide manually as well as 'background' deployment of wooded areas from world seed.

-f bioluminescent mushrooms and, or, will 'o the wisps.

-i just one track for entire game (to keep lightweight). OK, maybe two -- since we have ambient and a lyrical.

-i ambient music track: is there a term for music that does not exhaust the ear, but whose melodies and other properties find themselves welcome and even addicting for the listener?

-refac adjust positions and possibly colours of ui buttons (music and menu) - i.e. out of way of and in line with other elements.

DONE-refac temporary 'fix' -- remove miniHud

-refac remove micro-hud as visible in default. Perhaps 'port' to menu
have commented out in a-loco.js. Also will comment out or hide in index.html

-refac port music button to menu

-f metavibe portal

-f avatars

-f dome-like rocks or plant 'bulbs', on pattern of grass instancing

-f modular articulated 'serpents'. Cf. worms of Dune. 

-i huge quarry machines and loader vehicles hauling off mysterious cubes with numbers on them (secret: farming the digits of pi 'for use in the human world -- all numbers are created here'); other ideas, naming clients after Mathematicians and mathematical concepts; quarry of prime numbers?

-i collectibles called 'vibes' and the 'kaparthy diamond', the latter where subjects can choose a behaviour to happen to all other (or targeted?) subjects by avatar name, such as floating them upward to a certain height, then dropping; or all mobs swarming, etc.
-i+ every 1 minute a new kaparthy dropped ('shipped'); then, if collected, this client has 5seconds to use, else start 1min wait again.

-f gamemode -- event triggers or just timed, 'night time' when sky goes dark and perhaps the more disturbing mobs appear

-f headlights

DONE-f clouds

DONE-refac desktop mouselook DONE

DONE-f opening message for controls and goal

DONE-f simple mobile button for locomotion 

DONE-f button to access menu on mobile

-f music

-f sound effects

-dev pool terrain chunks

DONE -dev pool npcs

-feature randomized names

-f view other players (must include ability to view VR client)

-f jump with space (menu some other button - Enter?)

-f sensitivity to gradients -- for sliding and climb-labour

-b reinstate pitch of npcs

DONE-b npc spawning DONE

-b npc spawning and states


**

Additional attributions info

'if you wrote the lyrics for your song(s), you own those lyrics'

You can use music created with Suno AI for commercial purposes if you have a Pro or Premier subscription, which grants you a commercial use license, but not with the Basic (free) plan. 
Here's a more detailed explanation:
Basic (Free) Plan:
If you create music using the free version of Suno, Suno retains ownership of the songs, and you are only allowed to use them for non-commercial purposes. 
Pro and Premier Plans:
If you create music while subscribed to a Pro or Premier plan, you own the songs and are granted a commercial use license, allowing you to monetize them. 
Commercial Use License:
This license allows you to distribute your songs on platforms like Spotify and Apple Music, and use them in content you post on platforms like YouTube and TikTok. 
No Retroactive Licensing:
Starting a subscription after creating songs with the free plan does not give you retroactive commercial use rights for those songs. 
Ownership of Material:
As with any time you monetize your songs, you must be the exclusive rights holder of 100% of the material. 