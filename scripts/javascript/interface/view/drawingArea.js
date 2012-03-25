(function(){

    var canvas = $("#canvasArea");
    var context = canvas[0].getContext('2d');
    var width = canvas[0].width;
    var height = canvas[0].height;

    window.drawingArea = new AbstractView();
    
    drawingArea.canvas = canvas;
    
    drawingArea.context = context;
    
    drawingArea.imageData = context.getImageData(0, 0, width, height);
    
    drawingArea.grassHeight = 30;
    
    drawingArea.nodeRadius = 8;
    drawingArea.nodeFillColor = "white";
    drawingArea.nodeBorderColor = "black";
    drawingArea.nodeBorderWidth = 1;
        
    drawingArea.controlPRadius = 5;
    drawingArea.controlPFillColor = "white";
    drawingArea.controlPBorderWidth = 1;
        
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
    
    drawingArea.drawNode = function(point){
        
        var context = drawingArea.context;
        context.lineWidth = drawingArea.nodeBorderWidth;
        context.strokeStyle = drawingArea.nodeBorderColor;
        context.fillStyle = drawingArea.nodeFillColor;
            
        context.beginPath();
        context.arc(point.x, point.y, drawingArea.nodeRadius, 0, 2 * Math.PI);
        context.stroke();
        context.fill();
        context.closePath();
    }
        
    drawingArea.drawShadowNode = function(point){
        
        var context = drawingArea.context;
        context.shadowColor = "black";
        context.shadowBlur = 20;
        drawingArea.drawNode(point);
        context.shadowBlur = 0;
    }
        
    drawingArea.drawBezierCurve = function(start, goal, bezierCurve, alpha){
        var context = drawingArea.context;
        context.lineWidth = 3;
        context.strokeStyle = bezierCurve.color;
        context.globalAlpha = alpha;
            
        context.beginPath();
        context.moveTo(start.x, start.y);
        context.bezierCurveTo(bezierCurve.beginOrientationPoint.x, bezierCurve.beginOrientationPoint.y, bezierCurve.endOrientationPoint.x, bezierCurve.endOrientationPoint.y, goal.x, goal.y);
        context.stroke();
        context.closePath();
            
        context.globalAlpha = 1;
    }
    
 
    drawingArea.drawGrass = function() {
        var context = drawingArea.context;
        context.beginPath();
        context.fillStyle = '#00ff00';
        context.shadowColor = '#00ff00';
        context.shadowBlur = 30;
        context.fillRect(0,height-drawingArea.grassHeight,width,drawingArea.grassHeight);
        context.closePath();
        context.shadowColor = 'black';
        context.shadowBlur = 0;
        drawingArea.imageData = context.getImageData(0, 0, width, height);
    }
        
    drawingArea.refresh = function() {
        drawingArea.context.putImageData(drawingArea.imageData, 0, 0);
            
        var point;
        if(controller.currentNodeId){
            point = drawingArea.dash.getNodeValue(controller.currentNodeId);
            drawingArea.drawShadowNode(point);
            drawingArea.cursorIsOver();
        }
        else if(controller.mouseoverNode){
            point = controller.mouseoverNode.weight;
            drawingArea.drawShadowNode(point);
            drawingArea.cursorIsOver();
        }
        else this.setCursor(controller.tool);
            
        for (var itemKey in drawingArea.dash.nodes){
            var node = drawingArea.dash.nodes[itemKey];
            var start = node.weight;
                
            for(var neighborKey in node.neighbors){
                var goal = drawingArea.dash.nodes[neighborKey].weight;
                var edges = node.neighbors[neighborKey];
                    
                for(var i = 0; i < edges.length; i++){
                    var bezierCurve = edges[i].weight;
                    var alpha = 0.3;
                    if(drawingArea.graphUi.linkedToGround[itemKey]) alpha = 1;
                    drawingArea.drawBezierCurve(start, goal, bezierCurve, alpha);
                }                   
            }
        }
        for (itemKey in drawingArea.dash.nodes){
            point = drawingArea.dash.nodes[itemKey].weight;
            drawingArea.drawNode(point);
        }
    }
        
    drawingArea.update = function(){            
        drawingArea.reset();
            
        for (var itemKey in drawingArea.graphUi.nodes){
            var node = drawingArea.graphUi.nodes[itemKey];
            var start = node.weight;                
                
            for(var neighborKey in node.neighbors){
                    
                var goal = drawingArea.graphUi.nodes[neighborKey].weight;
                var edges = node.neighbors[neighborKey];
                    
                for(var i = 0; i < edges.length; i++){
                    var startId = itemKey.replace('#','')*1;
                    var goalId = neighborKey.replace('#','')*1;
                    if(startId !== controller.currentNodeId && goalId !==controller.currentNodeId){
                        var beizerCurve = edges[i].weight;
                        var alpha = 0.3;
                        if(drawingArea.graphUi.linkedToGround[itemKey]) alpha = 1;
                        drawingArea.drawBezierCurve(start, goal, beizerCurve, alpha);
                    }
                }
            }
                    
        }
        
        for(itemKey in drawingArea.graphUi.nodes){
            var point = drawingArea.graphUi.nodes[itemKey].weight;
            var id = itemKey.replace('#', '')*1;
            if(id !== controller.currentNodeId){
                drawingArea.drawNode(point);
            }
        }
            
        drawingArea.imageData = drawingArea.context.getImageData(0, 0, width, height);
    }
        
        

    drawingArea.setCursor = function(tool) {
        if (tool === "draw") canvas.css("cursor", "crosshair");
        else if(tool === "erase") canvas.css("cursor", "url('./ressources/images/cursor-scissors.png'), pointer");
        else if(tool === "edit") canvas.css("cursor", "pointer");
        else if (tool === "selected") canvas.css("cursor", "move");
    }
        
    drawingArea.cursorIsOver = function() {
        if (controller.tool === "edit") drawingArea.setCursor('selected');
        if (controller.tool === "erase") canvas.css("cursor", "url('./ressources/images/cursor-scissors-active.png'), not-allowed");
    }
        
    drawingArea.reset = function(){
        var context = drawingArea.context;
        context.clearRect(0, 0, width, height);
        drawingArea.drawGrass();
    }
    
    drawingArea.drawGrass();
})();
