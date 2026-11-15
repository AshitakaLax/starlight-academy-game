# Rendering boundary

The rendering layer owns the stage canvas, character/pet composition, scene backdrops, ribbon and particle effects, resize behavior, and animation lifecycle. It reads presentation state and draws frames; it must not mutate progression, grant rewards, handle save data, or decide whether an answer is correct. Essential text and controls remain in the DOM UI layer.
