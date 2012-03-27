
(function(){

    var canvas = $("#canvasArea");
    var width = canvas[0].width;
    var height = canvas[0].height;
    
    drawingArea.isOnGrass = function(x, y){
        if(y+drawingArea.nodeRadius >= height - drawingArea.grassHeight) return true;
        return false;
    }
    
    drawingArea.getNodeByCoord = function(x, y) {
        var radius = drawingArea.nodeRadius;
        var distance = 2*radius;
        for(var itemKey in drawingArea.graphUi.nodes){
            var item = drawingArea.graphUi.nodes[itemKey].weight;
            if(x >= item.x - distance && x <= item.x + distance && y >= item.y - distance && y <= item.y + distance) return itemKey.replace('#', '')*1;
        }
        return 0;          
    }
    
    drawingArea.getEdgeByCoord = function(x, y) {
        
        function match(start, bezierCurve, goal){
            
            var X0 = start.x;
            var Y0 = start.y;
            var X1 = bezierCurve.controlP1.x;
            var Y1 = bezierCurve.controlP1.y;
            var X2 = bezierCurve.controlP2.x;
            var Y2 = bezierCurve.controlP2.y;
            var X3 = goal.x;
            var Y3 = goal.y;
            
            var t0, t1, Xstart, Ystart, Ygoal, direction, a, b, c, distance;
            for(var i = 0; i < 20; i++) {
                t0 = i/20;
                t1 = (i+1)/20;
                Xstart = X0*Math.pow(1 - t0, 3) + 3*X1*t0*Math.pow(1-t0, 2) + 3*X2*Math.pow(t0, 2)*(1-t0) + X3*Math.pow(t0, 3);
                Ystart = Y0*Math.pow(1 - t0, 3) + 3*Y1*t0*Math.pow(1-t0, 2) + 3*Y2*Math.pow(t0, 2)*(1-t0) + Y3*Math.pow(t0, 3);
                Xgoal = X0*Math.pow(1 - t1, 3) + 3*X1*t1*Math.pow(1-t1, 2) + 3*X2*Math.pow(t1, 2)*(1-t1) + X3*Math.pow(t1, 3);
                Ygoal = Y0*Math.pow(1 - t1, 3) + 3*Y1*t1*Math.pow(1-t1, 2) + 3*Y2*Math.pow(t1, 2)*(1-t1) + Y3*Math.pow(t1, 3);
                direction = new Point(Xgoal - Xstart, Ygoal - Ystart);
                a = direction.y;
                b = -direction.x;
                c = -1*(a*X0 + b*Y0);
                distance = Math.sqrt(Math.pow(a*x + b*y + c, 2)/(Math.pow(a, 2) + Math.pow(b, 2)));
                var PstartP = new Point(x - Xstart, y - Ystart);
                var PgoalP = new Point(x - Xstart, y -  Ystart);
                if(distance <= drawingArea.bezierCurveWidth*4){
                    //console.log("coucou");
                    return true;  
                }                 
            }
            return false;
        }
        var visitedEdges = new Object();
        
        for (var nodeKey in drawingArea.graphUi.nodes) {
            var startId = nodeKey.replace('#','')*1;
            var startNode = drawingArea.graphUi.getNodeById(startId);
            
            for(var neighborKey in startNode.neighbors) {
                var edges = startNode.neighbors[neighborKey];
                for(var i = 0; i < edges.length; i++){
                    if(!visitedEdges['#'+edges[i].id]){
                        visitedEdges['#'+edges[i].id] = true;
                        if(match(drawingArea.graphUi.getNodeValue(startId), edges[i].weight, drawingArea.graphUi.getNodeValue(startId)))
                            return edges[i].weight;
                    }
                }
            }
        }
        return null;
    }
    
    
    drawingArea.setSelectedItem = function(x, y){
                 
        var id = drawingArea.getNodeByCoord(x, y);
        if(id){
            drawingArea.currentNodeId = id;
            var node = drawingArea.graphUi.getNodeById(id);
            drawingArea.dash.addWeightedNode(id, node.weight);
                
            for(var itemKey in node.neighbors) {
                var neighborId = itemKey.replace("#", '')*1;
                if(!drawingArea.dash.nodeExists(neighborId)) {
                    var point = drawingArea.graphUi.getNodeValue(neighborId);
                    drawingArea.dash.addWeightedNode(neighborId, point);  
                }
            }
                
            for(itemKey in node.neighbors) {
                neighborId = itemKey.replace("#", '')*1;
                var edges = node.neighbors[itemKey];
                for(var i = 0; i < edges.length; i++) {
                    var bezierCurve = drawingArea.graphUi.getEdgeValue(id, neighborId, i);
                    drawingArea.dash.addWeightedEdge(id, neighborId, bezierCurve);
                }
            }
        }
        else{
            var edge = drawingArea.getEdgeByCoord(x, y); 
            if(edge)drawingArea.selectedEdge = edge;
        }
        drawingArea.update(false);
        drawingArea.refresh();
    }
    
    drawingArea.mouseOverSomething = function(x, y){
        var id = drawingArea.getNodeByCoord(x, y);
        if(id) {
            drawingArea.mouseoverNode = drawingArea.graphUi.getNodeById(id);
        }
        else{
            drawingArea.mouseoverNode = null;
            drawingArea.mouseoverEdge = drawingArea.getEdgeByCoord(x, y);
        }
        drawingArea.refresh();
    }
    
    
    drawingArea.addNode = function(x, y) {
            
        if(drawingArea.isOnGrass(x,y)) y = height-drawingArea.grassHeight;
            
        var point;
        var id = drawingArea.getNodeByCoord(x, y);
            
        if(id) point = drawingArea.graphUi.getNodeValue(id);
            
        else{
            id = ++drawingArea.nodeIdCounter;                
            point = new Point( x, y);
            drawingArea.graphUi.addWeightedNode(id, point);
            if(drawingArea.isOnGrass(x,y)) drawingArea.graphUi.groundNode(id);
        }
        drawingArea.dash.addWeightedNode(id, point);
        drawingArea.currentNodeId = id;
            
        drawingArea.refresh();
    }
    
    
    drawingArea.move = function(x, y){
        
        if(drawingArea.currentNodeId){
            var point;  
            if(drawingArea.isOnGrass(x,y)) y = height - drawingArea.grassHeight;
                
            var id = drawingArea.getNodeByCoord(x, y);
            if(id && id !== drawingArea.currentNodeId) {
                var coord = drawingArea.graphUi.getNodeValue(id);
                point = new Point(coord.x, coord.y);
            }
            else{
                point = new Point(x, y);
            }
            drawingArea.dash.setNodeValue(drawingArea.currentNodeId, point);
        }
        drawingArea.refresh();
    }
    
    
    drawingArea.draw = function(x, y, color){
                        
        if(drawingArea.isOnGrass(x,y)) y = height - drawingArea.grassHeight;
            
        var id = drawingArea.getNodeByCoord(x, y);
            
        if(id){
            var item = drawingArea.graphUi.getNodeValue(id);
            x = item.x;
            y = item.y;   
        }
            
        id = drawingArea.nodeIdCounter + 42;
        var goal = new Point(x, y);
            
        var startPoint = drawingArea.graphUi.getNodeValue(drawingArea.currentNodeId);
        var averageX = (x + startPoint.x)/2;
        var averageY = (y + startPoint.y)/2;
        var orientationP1 = new Point(averageX, averageY);
        var orientationP2 = new Point(averageX, averageY);
        var bezierCurve = new BezierCurve(drawingArea.currentNodeId, orientationP1, orientationP2, id, color)
                
        if(!drawingArea.dash.nodeExists(id)) {
            drawingArea.dash.addWeightedNode(id, goal);
            drawingArea.dash.addWeightedEdge(drawingArea.currentNodeId, id, bezierCurve);
        }
        else{
            drawingArea.dash.setNodeValue(id, goal);
            drawingArea.dash.setEdgeValue(drawingArea.currentNodeId, id, 0, bezierCurve);
        }
                
        drawingArea.refresh();
    }
        
        
    drawingArea.addEdge = function() {
            
        var dashId = drawingArea.nodeIdCounter + 42;
        var startId = drawingArea.currentNodeId;
            
        if(drawingArea.dash.nodeExists(dashId)){
                
            var indexEdge = drawingArea.dash.getNodeById(startId).neighbors["#"+dashId].length - 1;
            var color = drawingArea.dash.getEdgeValue(startId, dashId, indexEdge).color;
                
            var point = drawingArea.dash.getNodeValue(dashId);
            var id = drawingArea.getNodeByCoord(point.x, point.y);
                
            if(!id) {
                drawingArea.addNode(point.x, point.y);
                id = drawingArea.nodeIdCounter;
            }
            var start = drawingArea.graphUi.getNodeValue(startId);
            var goal = drawingArea.graphUi.getNodeValue(id);
            var averageX = (start.x + goal.x)/2;
            var averageY = (start.y + goal.y)/2;
            var bezierCurve = new BezierCurve(startId, new Point(averageX, averageY), new Point(averageX, averageY), id, color);
                
            drawingArea.graphUi.addWeightedEdge(startId, id, bezierCurve); 
        }
            
    }
        
    drawingArea.saveChanges = function(){
        //FUNCTIONS
        function searchDuplicate(currentNodeId){
                
            var currentPoint = drawingArea.dash.getNodeValue(currentNodeId);
                
            for(var itemKey in drawingArea.graphUi.nodes){
                var id = itemKey.replace('#', '')*1;
                var point = drawingArea.graphUi.getNodeValue(id);
                if(id !== currentNodeId && currentPoint.x === point.x && currentPoint.y === point.y)return id;
            }
            return 0;
        }            
        function mergeNodes(oldId, id){
            var oldNode = drawingArea.graphUi.getNodeById(oldId);
                
            for(var neighborKey in oldNode.neighbors){
                var neighborId = neighborKey.replace('#', '')*1;
                var edges = oldNode.neighbors[neighborKey];
                for(var i = 0; i < edges.length; i++){
                    var weight = edges[i].weight;
                    if(edges[i].weight.startId === oldId) edges[i].weight.startId = id;
                    if(edges[i].weight.goalId === oldId) edges[i].weight.goalId = id;
                    drawingArea.graphUi.addWeightedEdge(id, neighborId, weight);
                }
            }
            drawingArea.graphUi.removeNode(oldId);
        }
        //ALGORITHM
        var currentNodeId = drawingArea.currentNodeId;
        if(currentNodeId){
                
            var currentPoint = drawingArea.dash.getNodeValue(currentNodeId);
            drawingArea.graphUi.setNodeValue(currentNodeId, currentPoint);
            var id = searchDuplicate(currentNodeId);
            var point = drawingArea.graphUi.getNodeValue(currentNodeId);
            if (id) mergeNodes(currentNodeId, id);
                
            else if (drawingArea.isOnGrass(point.x, point.y) && !drawingArea.graphUi.isAlreadyGrounded(currentNodeId)){
                drawingArea.graphUi.groundNode(currentNodeId);
            }
                
            else if (!drawingArea.isOnGrass(point.x, point.y) &&  drawingArea.graphUi.isAlreadyGrounded(currentNodeId)) 
                drawingArea.graphUi.unGroundNode(currentNodeId);
        }
    }
        
    drawingArea.erase = function(x, y){
        var id = drawingArea.getNodeByCoord(x, y);
        if(id)drawingArea.graphUi.removeNode(id);
    }
        
    drawingArea.apply = function(){
        drawingArea.dash = new HackenbushGraph();
        drawingArea.currentNodeId = 0;
        drawingArea.mouseoverNode = null;
        drawingArea.graphUi.removeLonelyNodes();
        drawingArea.update(true);
    }
        
    drawingArea.eraseAll = function() {
        drawingArea.graphUi = new HackenbushGraph();
        drawingArea.dash = new HackenbushGraph();
        drawingArea.update(true);
    }
    
    drawingArea.buildGraphGame = function(){
        
        var graph = new HackenbushGraph();
        
        for(var nodeKey in drawingArea.graphUi.nodes) {
            var id = nodeKey.replace('#','')*1;
            graph.addNode(id);
        }
        for(nodeKey in drawingArea.graphUi.nodes) {
            id = nodeKey.replace('#','')*1;
            var neighbors = drawingArea.graphUi.getNodeById(id).neighbors;
            
            for(var neighborKey in neighbors){
                var destId = neighborKey.replace('#','')*1;
                var edges = neighbors[neighborKey];
                
                for(var i = 0; i < edges.length; i++){
                    var color = controller.playerColors.indexOf(edges[i].weight.color);
                    if (color === -1) color = 2;
                    graph.addWeightedEdge(id, destId, color);
                }
            }
        }
        return graph;
    }
    
    drawingArea.listenToDrawingArea = function() {
        
        var mousedown = false;
        
        var getMouseCoords = function (event){
            var canvasOffset = canvas.offset();
            var currentX = Math.floor(event.pageX - canvasOffset.left);
            var currentY = Math.floor(event.pageY - canvasOffset.top);
            return {
                x: currentX, 
                y: currentY
            };	
        };
        
        var Xtolerance = Math.ceil( (canvas[0].offsetWidth - canvas[0].width) /2 );
        var Ytolerance = Math.ceil( (canvas[0].offsetHeight - canvas[0].height) /2 );
        
         
        
        
        
        canvas.mousedown( function(event) {
            
            mousedown = true;
            var startCoords = getMouseCoords(event);  
            //taking care of the border width
            if(startCoords.x > canvas[0].width - Xtolerance || startCoords.x < Xtolerance || startCoords.y > canvas[0].height - Ytolerance || startCoords.y < Ytolerance) return
            
            if(controller.tool === "draw") drawingArea.addNode(startCoords.x, startCoords.y);
            else if(controller.tool === "erase") drawingArea.erase(startCoords.x, startCoords.y);
            else if(controller.tool === "edit") drawingArea.setSelectedItem(startCoords.x, startCoords.y);
            
            
        });
        
        canvas.mousemove(function(event) {
            var canvasCoords =  getMouseCoords(event);  
            
            if(mousedown){
                if(canvasCoords.x > canvas[0].width - Xtolerance || canvasCoords.x < Xtolerance || canvasCoords.y > canvas[0].height - Ytolerance || canvasCoords.y < Ytolerance) return
                if(controller.tool === "draw") drawingArea.draw(canvasCoords.x, canvasCoords.y, controller.color);
                if(controller.tool === "edit") drawingArea.move(canvasCoords.x, canvasCoords.y);
             
            }
            else drawingArea.mouseOverSomething(canvasCoords.x, canvasCoords.y);
        });
        
        
        $('body').mouseup(function(event){
            mousedown = false;
            
            if(controller.tool === "draw") drawingArea.addEdge();
            else if(controller.tool === "edit") drawingArea.saveChanges();
            drawingArea.apply(); 
        });
    }     
    drawingArea.listenToDrawingArea(); 
})();
