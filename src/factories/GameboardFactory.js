import Ship from "./ShipFactory.js";
import {
    checkIfAnyShipGotHit,
    checkIfPositionIsEmpty,
    getShipsPosition
} from "../game_helpers/gameboardFactoryHelpers"

class Gameboard {
    constructor(name) {
        this.name = name;
        this.shipsCoordinates = [];
        this.latestShipPlaced = [];
        this.ships = [];
        this.missedShots = [];
        this.hitShots = [];
        this.sunkenShips = [];
        this.allShipHaveSunk = false;
        this.attackInfo = {
            message: '',
            shotHit: false,
            shipThatGotHit: {},
            attackSunkAShip: false,
        };
    }

    get gameOver() {
        return this.allShipHaveSunk;
    }

    get latestHitShipName() {
        return this.attackInfo.shipThatGotHit.name;
    }

    get latestAttackInfoMsg() {
        return this.attackInfo.message;
    }

    get didLatestShotHit() {
        return this.attackInfo.shotHit;
    }

    get infoAboutShipThatGotHit() {
        // return coordinates from last sunkenShip
        if ( this.attackInfo.attackSunkAShip ) {
            const sunkenShipsCoordinates = this.sunkenShips[this.sunkenShips.length - 1].position;
            return {sunk: this.attackInfo.attackSunkAShip, position: sunkenShipsCoordinates};
        } else {
            return {sunk: this.attackInfo.attackSunkAShip}
        }

    }


    placeShip(obj, coordinate, axelIsVertical) {
        let newShip = new Ship(obj.name, obj.length, coordinate, axelIsVertical);
        let coordinates = getShipsPosition(newShip);
        if ( newShip.validPosition ) {
            // Checks if in that position is another ship
            const positionIsEmpty = checkIfPositionIsEmpty(this.ships, coordinates)
            if ( positionIsEmpty ) {
                newShip.setPosition = coordinates;
                this.shipsCoordinates.push(coordinates);
                this.ships.push(newShip);
                this.latestShipPlaced = coordinates;
                return 'placing ship was successful'
            }
        }
        return 'invalid position, try again'
    }

    receiveAttack(coordinate) {
        let shipSunk = false;
        let attackMessage;
        let [didShipGotHit, shipThatGotHit] = checkIfAnyShipGotHit(this.ships, coordinate);

        if ( didShipGotHit ) {
            shipSunk = this.checkIfShipsSunk(shipThatGotHit);
            attackMessage = this.getShipGotHitMessage(shipSunk, shipThatGotHit, coordinate);
            didShipGotHit = true;
            this.hitShots.push(coordinate);
        } else {
            didShipGotHit = false;
            attackMessage = `${ this.name === 'Friendly' ? 'Enemy' : 'You' } shot at ${ coordinate }. Didn't hit any ship`;
            this.missedShots.push(coordinate);
        }
        this.setInfoAboutTheAttack(attackMessage, didShipGotHit, shipThatGotHit, shipSunk)
    }

    setInfoAboutTheAttack(message, shotDidHit, shipThatGotHit, shipSunk) {
        this.attackInfo.message = message;
        this.attackInfo.shotHit = shotDidHit;
        this.attackInfo.attackSunkAShip = shipSunk;
        if ( shotDidHit ) {
            this.attackInfo.shipThatGotHit = {name: shipThatGotHit.name}
        }
    }

    checkIfShipsSunk(currentShip) {
        if ( currentShip.isSunk() ) {
            this.sunkenShips.push(currentShip);
            if ( this.sunkenShips.length === this.ships.length ) {
                this.allShipHaveSunk = true;
            }
            return true;
        }
        return false;
    }

    getShipGotHitMessage(shipSunk, shipThatGotHit, coordinate) {
        const playerName = this.name === 'Friendly' ? 'Enemy' : 'You';
        const gotHitMessage = `${ playerName } shot at ${ coordinate }.`;
        if ( shipSunk ) {
            if ( this.allShipHaveSunk ) {
                return `${ gotHitMessage } Ship ${ shipThatGotHit.name } got hit, sunk and now all the ships are sunk`;
            } else {
                return `${ gotHitMessage } Ship ${ shipThatGotHit.name } got hit and sunk`;
            }
        } else {
            return `${ gotHitMessage } Ship ${ shipThatGotHit.name } got hit`;
        }
    }
}


export default Gameboard;