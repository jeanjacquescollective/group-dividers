export default class ShowGroups {
    constructor(data) {
        this.data = data;
    }
    createGroupCard(group, index) {
        let card = document.createElement("div");
        card.className = "group-card";

        let cardHeader = document.createElement("h3");
        cardHeader.innerText = `Group ${index + 1}`;
        card.appendChild(cardHeader);

        let cardBody = this.createNameList();
        card.appendChild(cardBody);

        return card;
    }

    createNameList() {
        let nameList = document.createElement("div");
        let names = this.data[0].map(member => member.name);
        for (let i = 0; i < names.length; i++) {
            let name = names[i];
            let nameCard = this.createNameCard(name, i);
            nameList.appendChild(nameCard);
        }

        return nameList;
    }

    createNameCard(name, index) {
        let card = document.createElement("div");
        card.className = "name-card";

        let cardHeader = document.createElement("h3");
        cardHeader.innerText = `Name ${index + 1}`;
        card.appendChild(cardHeader);

        let cardBody = document.createElement("p");
        cardBody.innerText = name;
        card.appendChild(cardBody);

        return card;
    }


    show() {
        let groups = this.data;
        let groupList = document.getElementById("groupList");
        groupList.innerHTML = "";
        for (let i = 0; i < groups.length; i++) {
            let group = groups[i];
            let groupCard = this.createGroupCard(group, i);
            groupList.appendChild(groupCard);
        }
    }
}