window.onload = initialization();

function initialization(){
    const div = document.createElement("div");  // Creates a "DIV" feature that you see in HTML files.
    div.innerHTML = "<label id = initMsg>HELLO</label>";  // Creates greeting for the user.
    div.innerHTML += "<button id = userBtn>Professor</button>";  // Creates an interactive button for the user.
    document.body.appendChild(div);  // Sets the "HELLO [Professor]" on the wep page for interaction.

    // NON-IMPORTANT - Creating a CSS value to stylize the web page.
    const introduction = document.getElementById("initMsg");
    introduction.style.color = "blue";
    introduction.style.fontWeight = "bold";
    introduction.style.padding = "10px";

    // Created a listener value so that when the button is pushed, a pop-up will appear with an automated message.
    const guestInteraction = document.getElementById("userBtn");
    guestInteraction.addEventListener("click", autoResponse);  // Sets up an automatic response when you press the button.
    function autoResponse(){
        setTimeout(()=>{
            alert("This is Samuel Mouradian.");
        }, 1000);
    }
}