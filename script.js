var jsonData;
var sectionData;
var sectionDiv;

window.addEventListener("DOMContentLoaded", async function() {
    //Print content

    //Fetch the "en.json" file from STA's GitHub repository.
    await fetch("https://raw.githubusercontent.com/KelvinShadewing/supertux-advance/main/lang/en.json")
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            jsonData = data;
        });
    

    //Loop through all sections with translation entries and process them.
    for (section in jsonData) {
        if (section == "key") continue; //Don't show "key" entries initially.

        sectionData = jsonData[section];
        sectionDiv = document.createElement("div");
        sectionDiv.classList.add("translateSection");
        sectionDiv.id = section;
        
        //Section header.
        const headerText = document.createElement("h3");
        headerText.innerHTML = firstLetterUppercase(section.split("-").join(" "));
        sectionDiv.appendChild(headerText);

        printTranslateEntries();

        document.getElementById("translationDiv").appendChild(sectionDiv);
    }

    //Configure the "Open translation" file selector.
    document.getElementById('select-file').addEventListener('change', async function(event) {
        var jsonFile;
        await event.target.files[0].text().then((data) => {jsonFile = JSON.parse(data)});

        //Ask for confirmation from the user.
        if (!confirm("Importing another JSON file will result in current translations being reset. Are you sure?")) return;
        //Clean all text input fields.
        const textInputs = document.getElementsByClassName("text-input")
        for (var i = 0; i < textInputs.length; i++) {
            textInputs[i].value = null;
        }

        //Fill in all text fields with data from the file
        for (section in jsonFile) {
            for (entry in jsonFile[section]) {
                const entryElement = document.getElementById(entry);
                if (entryElement && jsonData[section][entry] !== jsonFile[section][entry]) {
                    entryElement.value = jsonFile[section][entry];
                }
            }
        }
    });

    //Configure all buttons on the page to have an outline, when hovering them
    const allButtons = document.getElementsByClassName("btn");
    for (button of allButtons) {
        button.addEventListener("mouseover", function() {this.focus()});
        button.addEventListener("mouseleave", function() {this.blur()});
    }
});

function showKeyTranslations() {
    sectionData = jsonData["key"];
    sectionDiv = document.createElement("div");
    sectionDiv.id = "key";

    printTranslateEntries();

    document.getElementById("translationDiv").appendChild(sectionDiv);
    document.getElementById("translateKeysButton").remove();
}

function endTranslation() {
    //Save the translations.
    var translatedData = jsonData;
    for (section in jsonData) {
        if (section == "key" && !document.getElementById("key")) {
            //If "key" div isn't shown, don't put it into the translated data.
            delete translatedData["key"];
            continue;
        }
        const textObjects = document.getElementById(section).getElementsByClassName("text-input");
        for (var i = 0; i < textObjects.length; i++) {
            const textObj = textObjects[i];
            if (textObj.value) {
                translatedData[section][textObj.id] = textObj.value;
            }
            else { //If an entry's text box is empty (entry is not translated), remove it.
                delete translatedData[section][textObj.id];
            }
        }
    }
    //Save the translations to a file and download it.
    const a = document.createElement("a");
    const file = new Blob([JSON.stringify(translatedData, null, "\t")], {type:"text/plain"});
    a.href = URL.createObjectURL(file);
    a.download = "sta_translation.json";
    a.click();
}

function printTranslateEntries() {
    //Print section entries to translate.
    for (entry in sectionData) {
        const entryText = document.createElement("h5");
        if (!entry) continue; //If an entry's name is empty, skip it.
        entryText.innerHTML = sectionData[entry];
        if (!sectionData[entry]) entryText.innerHTML = `${entry} [no default value given]`; //If an entry's value is empty, put a text indicating that.
        sectionDiv.appendChild(entryText);

        const textField = document.createElement("textarea");
        textField.classList.add("text-input");
        textField.id = entry;
        sectionDiv.appendChild(textField);
    }
}

function firstLetterUppercase(str) {
    if (typeof str !== "string" || str == null) return null;
    return str.charAt(0).toUpperCase() + str.slice(1);
}