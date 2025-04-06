function getTimeDate() {
    const today = new Date();
    let year = today.getFullYear();
    let month = today.getMonth() + 1;
    let day = today.getDate();
    let h = today.getHours();
    let min = today.getMinutes();
    min = checkTime(min);

    document.getElementById("clock").innerHTML = `${h}:${min} ${day}/${month}/${year}`;
}

function checkTime(i) {
    if (i < 10) { 
        i = "0" + i; 
    }    
    return i;
}

function quickLinkAdd() {
    document.querySelector("#addLink").addEventListener("click", () => {
        let input = prompt("Please add the URL you wish to add");

        if (input.trim() === "") {
            alert("Please enter a URL.");
            return;
        }

        // Prepend "https://" if no protocol is present
        if (!input.match(/^https?:\/\//i)) {
            input = "https://" + input.trim();
        }

        try {
            // Attempt to create a new URL object to validate the URL
            let link = new URL(input.trim());

            // Check if the URL is https:// and starts with www.
            if (link.protocol !== "https:" || !link.hostname.startsWith("www.")) {
                alert("Invalid URL format. Please use the format https://www.example.com");
                return;
            }

            // Proceed to add the link to the list
            let linkList = document.querySelector("#linkList");
            let listItem = document.createElement("li");

            // Create a unique delete icon ID (simpler format)
            let deleteIconId = `delete-${Date.now()}`;

            listItem.innerHTML = `
                <a href="${link.href}" target="_blank">${link.href}</a>
                <i class="fa-solid fa-rectangle-xmark fa-2xl" id="${deleteIconId}"></i>
            `;

            linkList.appendChild(listItem);

            // Event delegation: instead of binding the event to each delete icon, bind it to the parent
            document.querySelector("#linkList").addEventListener("click", function(event) {
                // Check if the clicked element is a delete icon
                if (event.target && event.target.matches(`i#${deleteIconId}`)) {
                    linkList.removeChild(listItem);
                }
            });

            alert("Valid URL added: " + input);
        } catch (error) {
            alert("Invalid URL, please try again.");
        }
    });
}

getTimeDate();

setInterval(getTimeDate, 60000);

quickLinkAdd();
