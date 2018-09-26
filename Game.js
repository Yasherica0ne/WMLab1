const StateEnum = {
    Empty: 1,
    Store: 2,
    Exit: 3,
};

function getRandomInt(max) 
{
    return this.getRandomIntMin(0, max);
}

function getRandomIntMin(min, max)
{
    return Math.floor(Math.random() * (max - min)) + min;
}

function getDivName(row, col)
{
    return 'div' + row + '_' + col;
}

class Grid
{
    constructor(fieldWidth, fieldHeight, storesCount, maxBoxesInStore, maxBoxesAtPlayer)
    {
        this.FieldWidth = fieldWidth;
        this.FieldHeight = fieldHeight;
        this.StoresCount = storesCount;
        this.MaxBoxesCountInStore = maxBoxesInStore;
        this.fieldModel = [];
    }

    get FieldModel()
    {
        return this.fieldModel;
    }

    CreateField()
    {
        let field = '';
        try
        {
            if(this.StoresCount > this.FieldWidth * this.FieldHeight)
            {
                throw new error("Bad stores count");
            }
            if(this.FieldWidth < 1 || this.FieldHeight < 1)
            {
                throw new error("Field length must be greater than zero");
            }
            
            let fieldCells = [];
            const startOffset = 200;
            let storesCounter = 0;

            for(let i = 0; i < this.FieldHeight; i++)
            {
                this.fieldModel[i] = [];
                fieldCells[i] = [];
                for(let j = 0; j < this.FieldWidth; j++)
                {
                    this.fieldModel[i][j] = StateEnum.Empty;
                    fieldCells[i][j] = '<td class="EmptyCell"></td>';
                }
            }

            this.fieldModel[this.FieldHeight - 1][this.FieldWidth - 1] = StateEnum.Exit;
            fieldCells[this.FieldHeight - 1][this.FieldWidth - 1] = '<td id="ExitCell"><div id="ExitCounter">0</div></td>';

            while(storesCounter < this.StoresCount)
            {
                let row = getRandomInt(this.FieldHeight - 1);
                let col = getRandomInt(this.FieldWidth - 1);
                console.log(row + " " + col);
                if(this.fieldModel[row][col] == StateEnum.Empty)
                {
                    this.fieldModel[row][col] = StateEnum.Store;
                    let store = new Store(this.MaxBoxesCountInStore);
                    fieldCells[row][col] = `<td class="StoreCell"><div class="BoxCounter" id='${getDivName(row, col)}'>${store.BoxesCount}</div></td>`;
                    storesCounter++;
                    console.log(storesCounter);
                }
            }

            field += '<div style="position: absolute;">Boxes count: </div><div id="BoxesCount" style="position: absolute; margin-left: 15vh;">0</div>\n'
            field += '<table id="Table" style="border: 2px solid black; top: 25vh; position: absolute;"\n';
            for(let i = 0; i < this.FieldHeight; i++)
            {
                field += '<tr>\n';
                for(let j = 0; j < this.FieldWidth; j++)
                {
                    field += fieldCells[i][j] + '\n';
                }
                field += '</tr>\n';
            }
            field += '</table>';
        }
        catch(error)
        {
            console.log(error.message);
        }
        return field;
    }
}

class Character
{
    constructor(width, height, maxBoxesAtPlayer)
    {
        this.x = 0;
        this.y = 0;
        this.xEnd = width;
        this.yEnd = height;
        this.yOffset = 28;
        this.xOffset = 4.5;
        this.boxesCount = 0;
        this.MaxBoxesCountAtPlayer = maxBoxesAtPlayer;
    }    

    TakeBox(boxesAtStore)
    {
        if(this.boxesCount < this.MaxBoxesCountAtPlayer && boxesAtStore > 0)
        {
            this.boxesCount++;
            return true;
        }
        else return false;
    }

    DropBox()
    {
        if(this.boxesCount > 0)
        {
            this.boxesCount--;
            return true;
        }
        else return false;
    }

    getPlayer()
    {
        return '<div id="Player"></div>\n';
    }

    MoveRight(player)
    {
        if(this.x + 1 < this.xEnd)
        {
            this.x++;
            player.style.left = `${this.x * 11.7 + this.xOffset}vh`;
        }
    }

    MoveLeft(player)
    {
        if(this.x > 0)
        {
            this.x--;
            player.style.left = `${this.x * 11.7 + this.xOffset}vh`;
        }
    }

    MoveUp(player)
    {
        if(this.y > 0)
        {
            this.y--;
            player.style.top = `${this.y * 10.3 + this.yOffset}vh`;
        }
    }

    MoveDown(player)
    {
        if(this.y + 1 < this.yEnd)
        {
            this.y++;
            player.style.top = `${this.y * 10.3 + this.yOffset}vh`;
        }
    }

    get X()
    {
        return this.x;
    }
    get Y()
    {
        return this.y;
    }
}

class Store
{
    constructor(max)
    {
        this.boxesCount = getRandomIntMin(1, max);
    }
    
    get BoxesCount()
    {
        return this.boxesCount;
    }
}

let FModel;
let player;


class Game
{
    CreateGame(fieldWidth, fieldHeight, storesCount, maxBoxesInStore, maxBoxesAtPlayer)
    {
        let grid = new Grid(fieldWidth, fieldHeight, storesCount, maxBoxesInStore);
        player = new Character(fieldWidth, fieldHeight, maxBoxesAtPlayer);
        let field = player.getPlayer();
        field += grid.CreateField();
        FModel = grid.FieldModel;
        return field;
    }  

    getValue(str, table)
    {
        let counter = table.getElementById(str);
        return parseInt(counter.innerHTML);
    }

    changeValue(str, table, val)
    {
        let counter = table.getElementById(str);
        let value = parseInt(counter.innerHTML);
        counter.innerHTML = value + val;
    }
    CheckCell(table)
    {
        switch(FModel[player.Y][player.X])
        {
            case StateEnum.Store:
                let str = getDivName(player.Y, player.X);
                if(player.TakeBox(this.getValue(str, table)))
                {
                    this.changeValue(str, table, -1);
                    this.changeValue("BoxesCount", table, 1);
                }
                break;
            case StateEnum.Exit:
                if(player.DropBox())
                {
                    this.changeValue("ExitCounter", table, 1);
                    this.changeValue("BoxesCount", table, -1);
                }
                break;
        }
    }
    
    Move(key, character, table)
    {
        switch(key)
        {         
            case 37:  // если нажата клавиша влево
                player.MoveLeft(character);
                break;
            case 38:   // если нажата клавиша вверх
                player.MoveUp(character);
                break;
            case 39:   // если нажата клавиша вправо
                player.MoveRight(character);
                break;
            case 40:   // если нажата клавиша вниз
                player.MoveDown(character);
                break;
            case 32:
                this.CheckCell(table);
                break;

        }
    }
}