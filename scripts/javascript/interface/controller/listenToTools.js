(function(){

    if(!window.controller) window.controller= new Object();
    
    controller.playerColors = new Array(); 
    
    
    controller.listenToTools = function(){		
		
        $(".toolChooser").click( function(event) {
            var toolSelected = event.currentTarget.id;
            if(toolSelected === "save"){
                $('#save-form').dialog( "open" );
            }
            if(toolSelected === "load") {
                var loadForm = $('#load-form');
                loadForm.dialog( "open" );
                loadForm.load("./scripts/php/view/loadGame.php");
                if(controller.isPlaying)controller.reset();
            }
            if(toolSelected === "help") {
                var helpModal = $('#help-modal');
                helpModal.dialog( "open" );
                helpModal.load("./views/help-"+controller.page+".html");
            }
            if(toolSelected === "modeChooser") {
                var modeModal = $('#mode-modal');
                modeModal.dialog( "open" );
                modeModal.load("./views/mode.html");
            }
        });   
    }
    controller.initPlayerColors = function(){
        var player1 = $("#player1");
        var player2 = $("#player2");
        controller.playerColors[0] = player1[0].value;
        controller.playerColors[1] = player2[0].value;
    }
        
    controller.setPlayerColors = function(playerInt) {
        // VAR
        var player1 = $("#player1");
        var player2 = $("#player2");
        var playerColors = controller.playerColors;
        var player;
            
        
        if(playerInt === 0) player = player1;
        else if(playerInt === 1) player = player2;
        else return;
        //FUNCTION
        function swap(array, i, j){
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        function preventFromSameColor(){
            for(var i = 0; i < playerColors.length; i++){
                if(i !== playerInt){
                    if(playerColors[i] === player[0].value) swap(playerColors, i, playerInt);
                }
            }
            playerColors[playerInt] = player[0].value;
            player1[0].value = playerColors[0];
            player2[0].value = playerColors[1];
        }
        preventFromSameColor();
    };
    
    drawingArea.color = "green"; // default color : primary green
    drawingArea.tool = "draw"; // default tool : draw
    drawingArea.listenToTools = function() {
        
        $(".colorChooser").mousedown(function(event){
            drawingArea.color = event.currentTarget.id;
            if(drawingArea.selectedEdge)drawingArea.selectedEdge.weight.color = event.currentTarget.id; 
            drawingArea.update();
        });
        
        
        $(".toolChooser").click( function(event) {
            var toolSelected = event.currentTarget.id;
            if(toolSelected === "eraseAll") drawingArea.eraseAll();
            if (toolSelected === "edit" | toolSelected === "draw" | toolSelected === "erase") {
                drawingArea.elementSelected(toolSelected);
                drawingArea.setCursor(toolSelected);
                drawingArea.tool = toolSelected;
            }
            if(toolSelected !== "edit"){
                drawingArea.selectedEdge = null;
                drawingArea.update();
            }
        });
        
    }
    controller.initPlayerColors();
    controller.listenToTools();
    drawingArea.listenToTools();
})()

