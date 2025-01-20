class UI {
    constructor() {
        document.addEventListener('DOMContentLoaded', (event) => {
            this.initMaxNumberForm();
            this.initNameForm();
        });
    }

    initMaxNumberForm() {
        const maxNumberInput = document.getElementById('maxNumberInput');
        const savedMaxNumber = localStorage.getItem('maxNumber');
        if (savedMaxNumber) {
            maxNumberInput.value = savedMaxNumber;
        }
        const maxNumberForm = document.getElementById('maxNumberForm');

        // Load max number from localStorage
        let maxNumber = localStorage.getItem('maxNumber') || '';

        if (maxNumber) {
            maxNumberInput.value = maxNumber;
        }

        maxNumberForm.onsubmit = (event) => {
            event.preventDefault();
            const maxNumberValue = maxNumberInput.value.trim();
            if (maxNumberValue) {
                localStorage.setItem('maxNumber', maxNumberValue);
                alert('Max number set to ' + maxNumberValue);
            }
        };
    }

    initNameForm() {
        const nameForm = document.getElementById('nameForm');
        const nameInput = document.getElementById('nameInput');
        const nameList = document.getElementById('nameList');

        // Load names from localStorage
        let names = JSON.parse(localStorage.getItem('names')) || [];

        const renderNames = () => {
            nameList.innerHTML = '';
            names.forEach((name, index) => {
                const li = document.createElement('li');
                li.className = 'list--names--item';
                li.textContent = name;
                const editButton = document.createElement('button');
                editButton.className = 'list--names--item--edit';
                editButton.textContent = 'Edit';
                editButton.onclick = () => this.editName(index);
                const removeButton = document.createElement('button');
                removeButton.className = 'list--names--item--delete';
                removeButton.textContent = 'Remove';
                removeButton.onclick = () => this.removeName(index);
                li.appendChild(editButton);
                li.appendChild(removeButton);
                nameList.appendChild(li);
            });
        };

        const addName = (name) => {
            names.push(name);
            localStorage.setItem('names', JSON.stringify(names));
            renderNames();
        };

        this.editName = (index) => {
            const newName = prompt('Edit name:', names[index]);
            if (newName) {
                names[index] = newName;
                localStorage.setItem('names', JSON.stringify(names));
                renderNames();
            }
        };

        this.removeName = (index) => {
            names.splice(index, 1);
            localStorage.setItem('names', JSON.stringify(names));
            renderNames();
        };

        nameForm.onsubmit = (event) => {
            event.preventDefault();
            const name = nameInput.value.trim();
            if (name) {
                addName(name);
                nameInput.value = '';
            }
        };

        renderNames();
    }
}

const ui = new UI();