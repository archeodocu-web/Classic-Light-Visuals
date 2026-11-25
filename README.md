
# Classic Light Visuals 0.3.0

Restores a classic light-bulb marker for Ambient Lights in Foundry VTT V14. The icon is drawn over the V14 light-origin handle, rather than changing the light's data or replacing Foundry's interaction object.

## Install

1. Stop Foundry VTT.
2. Copy the complete `classic-light-visuals` folder into `Data/modules/`.
3. Start Foundry and open **Game Settings → Manage Modules**.
4. Enable **Classic Light Visuals**.
5. Open **Game Settings → Configure Settings → Module Settings** and adjust **Classic Light Visuals: Glühbirnen-Größe**.
6. Switch to the Lighting layer or reload the scene to see the bulb markers.

## Settings

- Default size: 40 screen pixels.
- Range: 20–96 screen pixels.
- Scope: client. Each user can choose their own size.

## Technical notes

- Uses the V14 `AmbientLight.controls.handles` accessor and the `drawAmbientLight`, `refreshAmbientLight`, `canvasReady`, and `canvasPan` hooks.
- The overlay sprite is non-interactive. Foundry's original light handle remains responsible for selecting and moving lights.
- The module does not update Scene documents, light radii, intensities, visibility, or permissions.
- It is independent of `token-light-controls` and does not modify Scene Controls.

<img width="1691" height="1072" alt="12" src="https://github.com/user-attachments/assets/2bb3821c-b92d-4918-bd75-b6d13abb2e01" />
<img width="768" height="576" alt="foundry-v12-style-light-recreation-preview" src="https://github.com/user-attachments/assets/e8415334-4ec7-4827-ac49-7d76b480b2df" />
