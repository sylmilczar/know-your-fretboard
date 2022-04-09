const SOUNDS = ['E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#'];

class FretboardModel {
    constructor(tuning=['E', 'A', 'D', 'G', 'B', 'E'], strings=6, frets=24) {
        this.fretboard = this.createFretboard(tuning, strings, frets);        
        this.selectedPositions = [];

        this.getNote = this.getNote.bind(this);
        this.clearSelections = this.clearSelections.bind(this);
    }

    createFretboard(tuning, strings, frets) {
        let fb = [];
        for(let string=0; string < strings; string++) {
            let current_s = [];
            const startingIdx = SOUNDS.indexOf(tuning[string]);
            for(let fret = 0; fret <= frets; fret++) {
                current_s.push(SOUNDS[(startingIdx + fret) % SOUNDS.length]);
            }
            fb.push(current_s);
        }
        return fb;
    }


    clearSelections() {
        this.selectedPositions = [];
    }


    togglePosition(string, fret) {
        //toggles position on fretboard

        //is the position already selected? 
        const idx = this.selectedPositions.findIndex( 
            position => position.string == string && position.fret == fret
        );
        if(idx !== -1) {
            //remove from selected positions
            this.selectedPositions = [
                ...this.selectedPositions.slice(0, idx),
                ...this.selectedPositions.slice(idx + 1)
            ];
        } else {
            //add to selected positions
            this.selectedPositions = [
                ...this.selectedPositions,
                {
                    string, 
                    fret, 
                    note: this.getNote(string, fret),
                },
            ];
        }
    }

    getNote(string, fret) {
        //returns note name from given position
        return this.fretboard[string][fret];
    }
}


class FretboardController {
    constructor(model, view) {
        this.model = model;
        this.view = view;

        this.handleSelectNote = this.handleSelectNote.bind(this);
        this.handleClearFretboard = this.handleClearFretboard.bind(this);

        // here call view's bind functions with all the controller's handlers
        this.view.bindSelectNote(this.handleSelectNote);
        this.view.bindClearAllButton(this.handleClearFretboard);

        // display initial fretboard state
        this.view.displayFretboard(model.fretboard, this.handleFbClick);

    }

    handleSelectNote(string, fret) {
        this.model.togglePosition(string, fret);
        this.view.clearFbMarkers();
        this.model.selectedPositions.forEach( position => {
            this.view.markNote(position.string, position.fret);
        });
        this.view.showSelectedPositions(this.model.selectedPositions);
    }


    handleClearFretboard() {
        this.model.clearSelections();
        this.view.clearFbMarkers();
        this.view.showSelectedPositions([]);
    }

}


class FretboardView {

    constructor() {
        this.fretboardContainer = document.querySelector("#fretboard");
        this.selectedPositionsList = document.querySelector(".selected-notes");

        this.notesVisibilityToggler = document.querySelector("#show-notes");
        this.notesVisibilityToggler.addEventListener(
            "change", 
            this.toggleNoteVisibility
        );
    }


    clearFbMarkers() {
        const notes = document.querySelectorAll("div.note");
        notes.forEach( note => note.classList.remove("selected"));
    }


    markNote(string, fret) {
        const note = document.querySelector(`div.note[data-string="${string}"][data-fret="${fret}"]`);
        note.classList.add("selected");
    }


    bindSelectNote(handler) {
        this.fretboardContainer.addEventListener("click", event => {
            if(event.target.classList.contains("note")) {
                const fret = event.target.getAttribute("data-fret");
                const string = event.target.getAttribute("data-string");
                handler(string, fret);
            }
        });
    }


    bindClearAllButton(handler) {
        const button = document.querySelector("button.clear-all");
        button.addEventListener("click", handler);
    }


    emptyDOMElement(element) {
        //removes all children of a given element
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    }


    displayFretboard(fretboard) {
        // remove old fretboard if already displayed
        this.emptyDOMElement(this.fretboardContainer);

        const table = document.createElement('table');

        //create table header
        const thead = document.createElement('thead');
        const fbMarkers = [3, 5, 7, 9, 12, 15, 17, 19, 21, 24];
        for(let i = -1; i <= fretboard[0].length; i++) {
            const th = document.createElement('th');
            th.setAttribute("scope", "col");
            if(fbMarkers.includes(i)) {
                th.innerText = i;
            }
            thead.appendChild(th);
        }
        table.appendChild(thead);

        //create table body
        const tbody = document.createElement('tbody');
        table.appendChild(tbody);

        for(let string = fretboard.length - 1; string >= 0; string--) {
            const tr = document.createElement('tr');
            tr.id = string;

            //create string label
            let sLabel = document.createElement('th');
            sLabel.setAttribute("scope", "row");
            sLabel.innerText = string + 1;
            tr.appendChild(sLabel);

            for(let fret = 0; fret < fretboard[string].length; fret++) {
                const td = document.createElement('td');
                const div = document.createElement('div');
                td.appendChild(div);
                div.setAttribute('data-fret', fret);
                div.setAttribute('data-string', string);
                div.classList.add('note');
                // setting width of the fret
                div.innerText = fretboard[string][fret];
                tr.appendChild(td);
            }
            tbody.appendChild(tr);
        }
        this.fretboardContainer.appendChild(table);
    }


    showSelectedPositions(positionsList) {
        //remove old positions
        this.emptyDOMElement(this.selectedPositionsList);

        positionsList.forEach( el => {
            const div = document.createElement('div');
            div.innerHTML = `[${parseInt(el.string) + 1} : ${el.fret}] <strong>${el.note}</strong>`;
            this.selectedPositionsList.appendChild(div);
        });
    }


    toggleNoteVisibility() {
        const sounds = document.querySelectorAll('td > div');
        sounds.forEach( el => el.classList.toggle('hidden'));
    }
}


const fretboard = new FretboardController(new FretboardModel(), new FretboardView);
