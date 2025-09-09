import { textureHelper } from './TextureHelper.js';

export function showBackgroundImages( cbSetBackground ) {
    const _html = `
        <dialog id="bgImageDialog">
            <form>
                <p>
                <label>
                    <h2>Add a Background image</h2>
                    <div class="responsive">
                    <div class="gallery">
                        <img src="./backgrounds/cityview.jpg" alt="cityview" width="60" height="40">
                        <input type="radio" name="background" id="cityview" value="CityView" checked/>City View
                    </div>
                    </div>
                    <div class="responsive">
                    <div class="gallery">
                        <img src="./backgrounds/downtown.jpg" alt="downtown" width="60" height="40">
                        <input type="radio" name="background" id="downtown" value="Downtown"/>Downtown
                    </div>
                    </div>
                    <div class="responsive">
                    <div class="gallery">
                        <img src="./backgrounds/romania.jpg" alt="romania" width="60" height="40">
                        <input type="radio" name="background" id="romania" value="Romania"/>Romania
                    </div>
                    </div>
                </label>
                </p>
                <div class="clearfix"></div>
                <div style="padding:6px;">
                <p>
                <button value="cancel" formmethod="dialog">Cancel</button>
                <button id="confirmBtn" value="default">Apply</button>
                </p>
                </div>
            </form>
        </dialog>
`

    const dom = new DOMParser().parseFromString(_html, 'text/html');
    const dialog = dom.querySelector("dialog");
    document.body.appendChild(dialog)

    const bgImageDialog = document.getElementById("bgImageDialog");
    const confirmBtn = bgImageDialog.querySelector("#confirmBtn");

    // let editorscope = editor;

    // "Cancel" button closes the dialog without submitting because of [formmethod="dialog"], triggering a close event.
    bgImageDialog.addEventListener("close", (e) => {
        document.body.removeChild(dialog)
    });

    // Prevent the "confirm" button from the default behavior of submitting the form, and close the dialog with the `close()` method, which triggers the "close" event.
    confirmBtn.addEventListener("click", (event) => {
        event.preventDefault(); // We don't want to submit this fake form
        var backgroundSelected = document.querySelector('input[name=background]:checked').value;
        document.body.removeChild(dialog)
        
        const background = textureHelper.get(backgroundSelected, 1, 1);

        cbSetBackground(background)
    });

    bgImageDialog.showModal();
}