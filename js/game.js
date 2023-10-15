class Game {
    constructor(host, board, firstClickIds, secondClickIds) {
        this.host = host;
        this.board = board;
        this.firstClickIds = firstClickIds;
        this.secondClickIds = secondClickIds;
        this.previousCell = null;
        this.initialize();
    }

    initialize() {
        this.setupRestartButton();
        this.setupCellClickHandlers();
    }

    setupRestartButton() {
        const restartButton = document.getElementById('restart');
        restartButton.addEventListener('click', () => {
            location.reload();
        });
    }

    setupCellClickHandlers() {
        document.querySelectorAll('.cell, .tableCell').forEach(cell => {
            cell.addEventListener('click', this.handleCellClick.bind(this));
        });
    }

    handleCellClick(event) {
        const clickedCell = event.currentTarget;
        if (!this.previousCell && !this.firstClickIds.includes(clickedCell.id)) {
            this.showMessage("You need to select from players first");
            this.clearCellHighlights();
            return;
        }

        if (this.previousCell && !this.secondClickIds.includes(clickedCell.id)) {
            this.showMessage("Reselect from player");
            this.clearCellHighlights();
            this.previousCell = null;
            return;
        }

        this.clearCellHighlights();
        clickedCell.classList.add('highlighted');

        if (this.previousCell) {
            this.swapCells(this.previousCell, clickedCell);
            this.validate();
            this.previousCell = null;
        } else {
            this.previousCell = clickedCell;
        }
    }

    showMessage(message) {
        document.getElementById('board').textContent = message;
    }

    clearCellHighlights() {
        document.querySelectorAll('.cell, .tableCell').forEach(cell => {
            cell.classList.remove('highlighted');
        });
    }

    swapCells(sourceCell, targetCell) {
        targetCell.textContent = sourceCell.textContent;
        targetCell.style.fontSize = this.getFontSizeFromId(sourceCell.id);
        sourceCell.textContent = '';
        sourceCell.classList.remove('highlighted');
    }

    getFontSizeFromId(cellId) {
        if (cellId.includes('S')) {
            return '50px';
        } else if (cellId.includes('M')) {
            return '100px';
        } else if (cellId.includes('L')) {
            return '150px';
        }
        return '';
    }

    validate() {
        const newArray = this.secondClickIds.map(id => this.getCellIndex(id));
        const requestData = newArray.join('-');
        this.sendAPIRequest(requestData);
    }

    getCellIndex(id) {
        const element = document.getElementById(id);
        const fontSize = window.getComputedStyle(element, null).getPropertyValue('font-size');
        const text = element.innerText;
        let index = id;
        if (fontSize === '50px') {
            index += 'S';
        } else if (fontSize === '100px') {
            index += 'M';
        } else if (fontSize === '150px') {
            index += 'L';
        } else {
            index += 'Z';
        }
        if (!text) {
            index += '0';
        } else if (text === 'X') {
            index += 'X';
        } else if (text === 'O') {
            index += 'Y';
        }
        return index;
    }

    sendAPIRequest(data) {
        const apiURL = this.host + "/api/?gameBoard=" + data;
        fetch(apiURL,{method:'GET'})
            .then(response => response.json())
            .then(data => {
                const apiResponse = new ApiResponse(data);
                const divElement = document.getElementById('board');
                divElement.innerHTML = apiResponse.toString();
            })
            .catch(error => console.error('Error:', error));
    }
}

class ApiResponse {
    constructor(data) {
        this.Message = null;
        this.Winner = null;
        this.Winnings = null;
        this.xPosition = null;
        this.xValues = null;
        this.yPosition = null;
        this.yValues = null;
        this.Error = null;
        this.setData(data);
    }

    setData(data) {
        for (let key in data) {
            if (this.hasOwnProperty(key)) {
                this[key] = data[key];
            }
        }
    }

    toString() {
        let result = '';
        for (let key in this) {
            if (this[key] !== null) {
                result += `${key}: ${this[key]}<br>`;
            }
        }
        return result;
    }
}
// const host = 'http://localhost:8080';
const host = 'https://tictactoe-production.up.railway.app';
const board = ['1Z0','2Z0','3ZO','4Z0','5Z0','6Z0','7Z0','8Z0','9Z0'];
const firstClickIds = ['XS1', 'XS2', 'XS3', 'XM1', 'XM2', 'XM3', 'XL1', 'XL2', 'XL3', 'YS1', 'YS2', 'YS3', 'YM1', 'YM2', 'YM3', 'YL1', 'YL2', 'YL3'];
const secondClickIds = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

const game = new Game(host, board, firstClickIds, secondClickIds);
