function Stacker() {
	// Dividing the problem in subparts 
	// 1) creating the map 
    //		1.1) Traversing the map with the help of dfs to gather all the coordinates
	//		1.2) Creating the stairs surrounding the tower
	// 2) Gathering the blocks and filling the stairs 
	//		2.1) BFS to look for nearest block which can be pickup
	//		2.2) Get the stair which needed to be filled and traverse there with BFS
	//		2.3) Place the block
	// 3) The Victory Step make to last move (this could have been included in the above stages but victory stage feels different..XD)
	
	// Defining variables to control the mind of the troll
	
	/**********           Ran 10 Times Average of 937 steps             **********/  
	var
		EMPTY = 0,
		WALL = 1,
		BLOCK = 2,
		GOLD = 3;
	let stack = [];
	let visited = Array.from(Array(34), () => Array(34).fill(0));
	let map = Array.from(Array(34), () => Array.from({ length: 34 }, () => [1, null]));
	let currIndex = [17, 17];
	var directions = ["left", "up", "right", "down"];
	var x = currIndex[0]
	var y = currIndex[1]
	var createMap = true
	var CreateStairs = false
	var towerX = -1
	var towerY = -1
	var leftStairCount = 7
	var currStairCount = 0
	var getBlock = true
	var Stairlvl = 1;
	var pathFound = true
	var returnBlock = true
	var finalStep = false
	// here goes the wizardry
	this.turn = function (cell) {
		//
		// Step 1 : Create the map and stairs by traversing the entire map by DFS
		//

		if (createMap) {
			this.towerCordinates(cell)
			this.checkValidNeighbours(cell, x, y, visited);

			map[x][y] = [cell.type, cell.level];
			map[x + 1][y] = [cell.down.type, cell.down.level];
			map[x - 1][y] = [cell.up.type, cell.up.level];
			map[x][y + 1] = [cell.right.type, cell.right.level];
			map[x][y - 1] = [cell.left.type, cell.left.level];
			visited[x][y] = 1;
			var dir = null;
			// 
			// Step 1.1 Traversing the map
			//
			for (var i = 0; i < directions.length; i++) {
				dir = directions[i];
				if (!this.isVisited(dir)) {
					stack.push(dir);
					return this.moveInDirection(dir);
				}
			}
			let direction = this.moveOppositeDirection(stack.pop())
			if (direction !== "") {
				return this.moveInDirection(direction)
			}
			else {
				createMap = false
				CreateStairs = true
			}
			//
			// Step 1.2 : Create Stairs now  for the tower surrounding it to climb on top of it 
			// 
			if (CreateStairs) {
				var chest = [towerX, towerY]
				laidStairs = [[chest[0], chest[1] + 1], [chest[0] + 1, chest[1] + 1],[chest[0] + 1, chest[1]], [chest[0] + 1, chest[1] - 1],[chest[0], chest[1] - 1], [chest[0] - 1, chest[1] - 1],[chest[0]-1,chest[1]]];
			}
			// reaching to the stair to start the iteration and gathering the near by blocks to create stair
			itrerate = this.bfs(x, y, laidStairs[0][0], laidStairs[0][1])
			fillStair = true
		}

		//
		//Step 2 : Gathering the blocks and filling the stairs
		//
		if (fillStair){
			//
			// Step 2.1 :  BFS to look for nearest block which can be pickup
			//
			if (getBlock){
				//
				// Step 2.2 Get the stair which needed to be filled and traverse there with BFS
				//
				end = this.getEndingIndex()
				iterate = this.bfsGetBlock(x, y)
				getBlock = false
			}
			if (pathFound){
				moveDir = iterate.shift()
				if (moveDir){
					return this.moveInDirection(moveDir)
				}
				else{
					pathFound = false
					map[x][y][0] = EMPTY
					map[x][y][1]-= 1
					return 'pickup'
				}
			}
			//
			// Step 2.3 Place the block
			//
			if (returnBlock){
				returnIterate = this.bfs(x,y,end[0],end[1])
				returnDir = returnIterate.shift()
				if (returnDir){
					return this.moveInDirection(returnDir)
				}
				else{
					getBlock = true
					pathFound = true
					currStairCount+=1
					map[x][y][1] +=1
					if (leftStairCount == 1){
						getBlock = false
						pathFound = false
						fillStair = false
						finalStep = true
					}
					return 'drop';
				}

			}			
		}
		//
		// Step 3: Last Step on the chest YAY!!! reached the tower
		//
		if (finalStep){
			return "down";
		}
	}

	// Get the stair which needed to be filled
	this.getEndingIndex = function(){
		if (currStairCount == leftStairCount ){
			leftStairCount-=1
			currStairCount =0
			Stairlvl+=1
		}
		targetLength = laidStairs.length
		while(map[laidStairs[targetLength-currStairCount-1][0]][laidStairs[targetLength-currStairCount-1][1]][1]===Stairlvl){
			currStairCount+=1
			if (currStairCount == leftStairCount ){
				leftStairCount-=1
				currStairCount =0
				Stairlvl+=1
			}
		}
		return laidStairs[targetLength-currStairCount-1]
	}
	// Gets to the nearest block
	this.bfsGetBlock = function(startX,startY){
		const dir = [[0, 1], [0, -1], [-1, 0], [1, 0]];
		const visited = new Set();
		let queue = [[startX, startY, []]];
		
		while (queue.length > 0) {
			let current = queue.shift();
			let startX = current[0];
			let startY = current[1];
			let direction = current[2];
			if (map[startX][startY][0] === BLOCK && (!laidStairs.some(item => item[0] === startX && item[1] === startY))) {
				return direction
			}

			for (const [tempX, tempY] of dir) {
				const currX = startX + tempX;
				const currY = startY + tempY;
				if (visited.has([currX, currY].toString()) || Math.abs(map[startX][startY][1] - map[currX][currY][1]) > 1 || map[currX][currY][0] === WALL ) {
					continue;
				}
				let newDirection = [...direction];
				let pushDirection  = this.pushCoordinate(tempX,tempY,newDirection)
				visited.add([currX, currY].toString());
				queue.push([currX, currY, pushDirection]);
			}
		}
	}

	// Gets to the destiantion from a given point with smallest steps
	this.bfs = function (startX, startY, endX, endY) {
		const dir = [[0, 1], [0, -1], [-1, 0], [1, 0]];
		const visited = new Set();
		let queue = [[startX, startY, []]];
		while (queue.length > 0) {
			let current = queue.shift();
			let startX = current[0];
			let startY = current[1];
			let direction = current[2];
			if (startX === endX && startY === endY) {
				return direction
				break;
			}
			for (const [tempX, tempY] of dir) {
				const currX = startX + tempX;
				const currY = startY + tempY;
				if (visited.has([currX, currY].toString()) || Math.abs(map[startX][startY][1] - map[currX][currY][1]) > 1 || map[currX][currY][0] === 1) {
					continue;
				}
				let newDirection = [...direction];
				let pushDirection  = this.pushCoordinate(tempX,tempY,newDirection)
				visited.add([currX, currY].toString());
				queue.push([currX, currY, pushDirection]);
			}
		}
	}

	///
	/// Helper functions below this
	///
	this.isVisited = function (dir) {
		var check = true;
		switch (dir) {
			case "left":
				check = visited[x][y - 1];
				break;
			case "up":
				check = visited[x - 1][y];
				break;
			case "right":
				check = visited[x][y + 1];
				break;
			case "down":
				check = visited[x + 1][y];
				break;
			default:
				console.log("Incorrect direction given: " + dir);
				break;
		}
		return check;
	}
	this.checkValidNeighbours = function (cell, x, y, visited) {
		if (cell["left"]["type"] == WALL || cell["left"]["type"] == GOLD) {
			visited[x][y - 1] = 1;
		}
		if (cell["up"]["type"] == WALL || cell["up"]["type"] == GOLD) {
			visited[x - 1][y] = 1;
		}
		if (cell["right"]["type"] == WALL || cell["right"]["type"] == GOLD) {
			visited[x][y + 1] = 1;
		}
		if (cell["down"]["type"] == WALL || cell["down"]["type"] == GOLD) {
			visited[x + 1][y] = 1;
		}
	}


	this.moveOppositeDirection = function (dir) {
		var oppositeDirection = "";
		switch (dir) {
			case "left":
				oppositeDirection = "right";
				break;
			case "up":
				oppositeDirection = "down";
				break;
			case "right":
				oppositeDirection = "left";
				break;
			case "down":
				oppositeDirection = "up";
				break;
			default:
				break;
		}
		return oppositeDirection;
	}
	this.moveInDirection = function (dir) {
		switch (dir) {
			case "left":
				y = y - 1;
				break;
			case "up":
				x = x - 1;
				break;
			case "right":
				y = y + 1;
				break;
			case "down":
				x = x + 1;
				break;
			default:
				dir = ""
				break;
		}
		return dir;
	}
	this.towerCordinates = function(cell){
		if (cell["left"]["type"] == GOLD) {
			towerX = x;
			towerY = y - 1;
		} else if (cell["up"]["type"] == GOLD) {
			towerX = x - 1;
			towerY = y;
		} else if (cell["right"]["type"] == GOLD) {
			towerX = x;
			towerY = y + 1;
		} else if (cell["down"]["type"] == GOLD) {
			towerX = x + 1;
			towerY = y;
		}
	}
	this.pushCoordinate = function(tempX,tempY,newDirection){
		if (tempX === 0 && tempY === -1) {
			newDirection.push('left');
		} else if (tempX === -1 && tempY === 0) {
			newDirection.push('up');
		} else if (tempX === 0 && tempY === 1) {
			newDirection.push('right');
		} else if (tempX === 1 && tempY === 0) {
			newDirection.push('down');
		}
		return newDirection
	}
}