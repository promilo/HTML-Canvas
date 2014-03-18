var stage;
var shapeArray = [];
var isDrawingShape = false;
var currentMode = 'drawLine';
var currentDrawingAnchorX = 0;
var currentDrawingAnchorY = 0;
var currentDrawingShape = null;
var currentSelectedShape = null;
var copiedShapeGroup = null,

// Create new stage and add layer to it which we will add shapes to.
stage = new Kinetic.Stage({
    container: 'container',
    width: 800,
    height: 600
});
var layer = new Kinetic.Layer();
stage.add(layer);
layer.draw();

// Add bordered transparent rectangle to define the drawing area
// and be pushed on top of shape array when drawing to listen
// for drawing mouse coordinates and pushed to the bottom of the 
// shape array when selecting previously drawn shapes and resizing them.
var drawingRectangle = new Kinetic.Rect({
    x: 0,
    y: 0,
    width: stage.getWidth(),
    height: stage.getHeight(),
    fill: 'transparent',
    stroke: 'black',
    strokeWidth: 1,
    listening: true,
    draggable: false,
    opacity: 1
});
layer.add(drawingRectangle);
layer.draw();

// Mouse-pressed listener for rectangles being drawn
drawingRectangle.on('mousedown', function () {
    if (currentMode == 'drawLine' || currentMode == 'drawRectangle' || currentMode == 'drawTriangle') {
        var mousePosition = stage.getMousePosition();
        var startX = mousePosition.x;
        var startY = mousePosition.y;
        var endX = startX;
        var endY = startY;
        currentDrawingAnchorX = startX;
        currentDrawingAnchorY = startY;
        var fillColorSelector = document.getElementById("fillColorSelector");
        var lineColorSelector = document.getElementById("lineColorSelector");
        var lineWidthSelector = document.getElementById("lineWidthSelector");

        var fillColor = fillColorSelector.options[fillColorSelector.selectedIndex].id;
        var lineColor = lineColorSelector.options[lineColorSelector.selectedIndex].id;
        var lineWidth = parseInt(lineWidthSelector.options[lineWidthSelector.selectedIndex].value);

        if (currentMode == 'drawLine') {
            currentDrawingShape = createLineInLayout(startX, startY, endX, endY, lineColor, lineWidth);
            drawingRectangle.moveToTop();
            isDrawingShape = true;
            shapeSelected(null);
            currentSelectedShape = null;
            layer.draw();
        } else if (currentMode == 'drawRectangle') {
            currentDrawingShape = createRectangleInLayout(startX, startY, endX, endY, fillColor, lineColor, lineWidth);
            drawingRectangle.moveToTop();
            isDrawingShape = true;
            shapeSelected(null);
            currentSelectedShape = null;
            layer.draw();
        } else if (currentMode == 'drawTriangle') {
            currentDrawingShape = createTriangleInLayout(startX, startY, endX, endY, fillColor, lineColor, lineWidth);
            drawingRectangle.moveToTop();
            isDrawingShape = true;
            shapeSelected(null);
            currentSelectedShape = null;
            layer.draw();
        } else {
            currentDrawingShape = null;
            isDrawingShape = false;
        }

        layer.draw();
    } else {
        shapeSelected(null);
        currentSelectedShape = null;
        layer.draw();
    }
});

// Mouse-movement listener for rectangles being drawn
drawingRectangle.on('mousemove', function () {
    if (currentMode == 'drawLine' || currentMode == 'drawRectangle' || currentMode == 'drawTriangle') {
        if (currentDrawingShape != null && isDrawingShape == true) {
            var mousePosition = stage.getMousePosition();
            resizeDrawingShape(currentDrawingShape, currentDrawingAnchorX, currentDrawingAnchorY, mousePosition);
            drawingRectangle.moveToTop();
            layer.draw();
        }
    }
});

// Mouse-released listener for rectangles being drawn
drawingRectangle.on('mouseup mouseleave', function () {
    if (currentMode == 'drawLine' || currentMode == 'drawRectangle' || currentMode == 'drawTriangle') {
        isDrawingShape = false;
        currentDrawingShape = null;
        drawingRectangle.moveToTop();
        layer.draw();
    }
});
layer.draw();

// Line creator
function createLineInLayout(startX, startY, endX, endY, lineColor, lineWidth) {
    var lineGroup = createLine(startX, startY, endX, endY, lineColor, lineWidth);
    //shapeGroup.add(lineGroup);
    shapeArray.push(lineGroup);
    layer.add(lineGroup);
    return lineGroup;
}

// Line creator helper function
function createLine(startX, startY, endX, endY, lineColor, lineWidth) {
    var line = new Kinetic.Line({
        points: [startX, startY, endX, endY],
        stroke: lineColor,
        strokeWidth: lineWidth,
        lineCap: 'round',
        lineJoin: 'round',
        draggable: false,
        name: 'line'
    });

    line.on('mouseover', function () {
        setDraggable(false);
        setAllDraggable(true);
    });

    var resizePoint1 = createResizePoint(startX, startY, 'resizePoint1');
    var resizePoint2 = createResizePoint(endX, endY, 'resizePoint2');

    var lineGroup = new Kinetic.Group({
        name: 'lineGroup',
        listening: true
    });

    lineGroup.add(line);
    lineGroup.add(resizePoint1);
    lineGroup.add(resizePoint2);

    lineGroup.on('mousedown', function () {
        shapeSelected(this);
        currentSelectedShape = this;
        setMode(currentMode);
        layer.draw();
    });

    return lineGroup;
}

// Rectangle creator
function createRectangleInLayout(startX, startY, endX, endY, fillColor, lineColor, lineWidth) {
    var rectangleGroup = createRectangle(startX, startY, endX, endY, fillColor, lineColor, lineWidth);
    //shapeGroup.add(rectangleGroup);
    shapeArray.push(rectangleGroup);
    layer.add(rectangleGroup);
    return rectangleGroup;
}

// Rectangle creator helper function
function createRectangle(startX, startY, endX, endY, fillColor, lineColor, lineWidth) {
    var rectangle = new Kinetic.Rect({
        x: startX,
        y: startY,
        width: endX - startX,
        height: endY - startY,
        fill: fillColor,
        stroke: lineColor,
        strokeWidth: lineWidth,
        draggable: false,
        name: 'rectangle'
    });

    rectangle.on('mouseover', function () {
        setDraggable(false);
        setAllDraggable(true);
    });

    var resizePoint1 = createResizePoint(startX, startY, 'resizePoint1');
    var resizePoint2 = createResizePoint(endX, endY, 'resizePoint2');
    var resizePoint3 = createResizePoint(startX, endY, 'resizePoint3');
    var resizePoint4 = createResizePoint(endX, startY, 'resizePoint4');

    var rectangleGroup = new Kinetic.Group({
        name: 'rectangleGroup'
    });
    rectangleGroup.add(rectangle);
    rectangleGroup.add(resizePoint1);
    rectangleGroup.add(resizePoint2);
    rectangleGroup.add(resizePoint3);
    rectangleGroup.add(resizePoint4);

    rectangleGroup.on('mousedown', function () {
        shapeSelected(this);
        currentSelectedShape = this;
        setMode(currentMode);
        layer.draw();
    });

    return rectangleGroup;
}

// Triangle creator
function createTriangleInLayout(startX, startY, endX, endY, fillColor, lineColor, lineWidth) {
    var triangleGroup = createTriangle(startX, startY, endX, endY, fillColor, lineColor, lineWidth);
    //shapeGroup.add(triangleGroup);
    shapeArray.push(triangleGroup);
    layer.add(triangleGroup);
    return triangleGroup;
}

// Triangle creator helper function
function createTriangle(startX, startY, endX, endY, fillColor, lineColor, lineWidth) {
    var leftX, topY, rightX, bottomY;
    leftX = Math.min(startX, endX);
    topY = Math.min(startY, endY);
    rightX = Math.max(startX, endX);
    bottomY = Math.max(startY, endY);

    var x1, y1, x2, y2, x3, y3;
    x1 = (leftX + rightX) / 2;
    y1 = topY;
    x2 = leftX;
    y2 = bottomY;
    x3 = rightX;
    y3 = bottomY;

    return createTriangleFromThreePoints(x1, y1, x2, y2, x3, y3, fillColor, lineColor, lineWidth);
}

// Triangle creator helper function
function createTriangleFromThreePoints(x1, y1, x2, y2, x3, y3, fillColor, lineColor, lineWidth) {
    var triangle = new Kinetic.Polygon({
        points: [x1, y1, x2, y2, x3, y3],
        fill: fillColor,
        stroke: lineColor,
        strokeWidth: lineWidth,
        draggable: false,
        name: 'triangle'
    });

    triangle.on('mouseover', function () {
        setDraggable(false);
        setAllDraggable(true);
    });

    var resizePoint1 = createResizePoint(x1, y1, 'resizePoint1');
    var resizePoint2 = createResizePoint(x2, y2, 'resizePoint2');
    var resizePoint3 = createResizePoint(x3, y3, 'resizePoint3');

    var triangleGroup = new Kinetic.Group({
        name: 'triangleGroup'
    });
    triangleGroup.add(triangle);
    triangleGroup.add(resizePoint1);
    triangleGroup.add(resizePoint2);
    triangleGroup.add(resizePoint3);

    triangleGroup.on('mousedown', function () {
        shapeSelected(this);
        currentSelectedShape = this;
        setMode(currentMode);
        layer.draw();
    });

    return triangleGroup;
}

// Resize point creator
function createResizePoint(x, y, name) {
    var resizePoint = new Kinetic.Circle({
        x: x,
        y: y,
        radius: 5,
        fill: 'white',
        stroke: 'black',
        strokeWidth: 1,
        visible: false,
        listening: false,
        name: name
    });
    resizePoint.on('mouseover', function () {
        setAllDraggable(false);
        setDraggable(true);
    });
    resizePoint.on('dragstart', function () {
        isDrawingShape = true;
    });

    resizePoint.on('dragmove', function () {
        if (isDrawingShape == true) {
            resizeSelectedShape(this.getParent(), this);
            layer.draw();
        }

    });

    resizePoint.on('dragend', function () {
        isDrawingShape = false;
    });

    return resizePoint;
}

// Resize selected shape function
function resizeSelectedShape(selectedShapeGroup, resizePoint) {
    if (selectedShapeGroup.getName() == 'lineGroup') {
        resizeSelectedLine(selectedShapeGroup);
    } else if (selectedShapeGroup.getName() == 'rectangleGroup') {
        resizeSelectedRectangle(selectedShapeGroup, resizePoint);
    } else if (selectedShapeGroup.getName() == 'triangleGroup') {
        resizeSelectedTriangle(selectedShapeGroup);
    }
}

// Resize selected line function
function resizeSelectedLine(selectedShapeGroup) {
    resizeLine(selectedShapeGroup);
}

// Resize selected rectangle function
function resizeSelectedRectangle(selectedShapeGroup, resizePoint) {
    var anchorPoint;
    if (resizePoint == selectedShapeGroup.get('.resizePoint1')[0]) {
        anchorPoint = selectedShapeGroup.get('.resizePoint2')[0];
    } else if (resizePoint == selectedShapeGroup.get('.resizePoint2')[0]) {
        anchorPoint = selectedShapeGroup.get('.resizePoint1')[0];
    } else if (resizePoint == selectedShapeGroup.get('.resizePoint3')[0]) {
        anchorPoint = selectedShapeGroup.get('.resizePoint4')[0];
    } else {
        anchorPoint = selectedShapeGroup.get('.resizePoint3')[0];
    }

    var selectedShapeGroupChildren = selectedShapeGroup.getChildren().toArray();

    var isFirstPoint = true;
    var firstPointSetX = false;

    for (var i = 0; i < selectedShapeGroupChildren.length; i++) {
        var shape = selectedShapeGroupChildren[i];
        if (shape != selectedShapeGroup.get('.rectangle')[0] && shape != anchorPoint && shape != resizePoint) {
            var shapeX = shape.getX(),
                shapeY = shape.getY();
            if (isFirstPoint) {
                if (shapeX == anchorPoint.getX()) {
                    shape.setY(resizePoint.getY());
                    firstPointSetX = false;
                } else {
                    shape.setX(resizePoint.getX());
                    firstPointSetX = true;
                }
                isFirstPoint = false;
            } else {
                if (firstPointSetX) {
                    shape.setY(resizePoint.getY());
                } else {
                    shape.setX(resizePoint.getX());
                }
            }
        }
    }
    layer.draw();
    resizeRectangle(selectedShapeGroup);
}

// Resize selected triangle function
function resizeSelectedTriangle(selectedShapeGroup) {
    resizeTriangle(selectedShapeGroup);
}

// Resize drawing shape function
function resizeDrawingShape(drawingShapeGroup, oldX, oldY, newPosition) {
    if (drawingShapeGroup.getName() == 'lineGroup') {
        resizeDrawingLine(drawingShapeGroup, newPosition);
    } else if (drawingShapeGroup.getName() == 'rectangleGroup') {
        resizeDrawingRectangle(drawingShapeGroup, newPosition);
    } else if (drawingShapeGroup.getName() == 'triangleGroup') {
        resizeDrawingTriangle(drawingShapeGroup, oldX, oldY, newPosition);
    }
}

// Resize drawing line function
function resizeDrawingLine(drawingShapeGroup, newPosition) {
    var newX = newPosition.x;
    var newY = newPosition.y;
    drawingShapeGroup.get('.resizePoint2')[0].setX(newX);
    drawingShapeGroup.get('.resizePoint2')[0].setY(newY);
    layer.draw();
    resizeLine(drawingShapeGroup);
}

// Resize drawing rectangle function
function resizeDrawingRectangle(drawingShapeGroup, newPosition) {
    var newX = newPosition.x;
    var newY = newPosition.y;
    drawingShapeGroup.get('.resizePoint2')[0].setX(newX);
    drawingShapeGroup.get('.resizePoint2')[0].setY(newY);
    drawingShapeGroup.get('.resizePoint3')[0].setY(newY);
    drawingShapeGroup.get('.resizePoint4')[0].setX(newX);
    layer.draw();
    resizeRectangle(drawingShapeGroup);
}

// Resize drawing triangle function
function resizeDrawingTriangle(drawingShapeGroup, oldX, oldY, newPosition) {
    var newX, newY, leftX, topY, rightX, bottomY;
    newX = newPosition.x;
    newY = newPosition.y;

    leftX = Math.min(oldX, newX);
    topY = Math.min(oldY, newY);
    rightX = Math.max(oldX, newX);
    bottomY = Math.max(oldY, newY);

    var x1, y1, x2, y2, x3, y3;
    x1 = (leftX + rightX) / 2;
    y1 = topY;
    x2 = leftX;
    y2 = bottomY;
    x3 = rightX;
    y3 = bottomY;

    drawingShapeGroup.get('.resizePoint1')[0].setX(x1);
    drawingShapeGroup.get('.resizePoint1')[0].setY(y1);
    drawingShapeGroup.get('.resizePoint2')[0].setX(x2);
    drawingShapeGroup.get('.resizePoint2')[0].setY(y2);
    drawingShapeGroup.get('.resizePoint3')[0].setX(x3);
    drawingShapeGroup.get('.resizePoint3')[0].setY(y3);

    layer.draw();
    resizeTriangle(drawingShapeGroup);
}

// Sets resize points of non-selected shapes invisible
// Sets resize points of selected shape visible
function shapeSelected(selectedShapeGroup) {
    for (var i = 0; i < shapeArray.length; i++) {
        showResizePoint(false, shapeArray[i]);
    }
    layer.draw();
    if (selectedShapeGroup != null) {
        showResizePoint(true, selectedShapeGroup);
        selectedShapeGroup.moveToTop();
        layer.draw();
    }
}

// Activates resize points based on shape type
function showResizePoint(isShown, selectedShapeGroup) {
    if (selectedShapeGroup.getName() == 'lineGroup') {
        selectedShapeGroup.get('.resizePoint1')[0].setVisible(isShown);
        selectedShapeGroup.get('.resizePoint2')[0].setVisible(isShown);
        selectedShapeGroup.get('.resizePoint1')[0].setListening(isShown);
        selectedShapeGroup.get('.resizePoint2')[0].setListening(isShown);
    } else if (selectedShapeGroup.getName() == 'rectangleGroup') {
        selectedShapeGroup.get('.resizePoint1')[0].setVisible(isShown);
        selectedShapeGroup.get('.resizePoint2')[0].setVisible(isShown);
        selectedShapeGroup.get('.resizePoint3')[0].setVisible(isShown);
        selectedShapeGroup.get('.resizePoint4')[0].setVisible(isShown);
        selectedShapeGroup.get('.resizePoint1')[0].setListening(isShown);
        selectedShapeGroup.get('.resizePoint2')[0].setListening(isShown);
        selectedShapeGroup.get('.resizePoint3')[0].setListening(isShown);
        selectedShapeGroup.get('.resizePoint4')[0].setListening(isShown);
    } else if (selectedShapeGroup.getName() == 'triangleGroup') {
        selectedShapeGroup.get('.resizePoint1')[0].setVisible(isShown);
        selectedShapeGroup.get('.resizePoint2')[0].setVisible(isShown);
        selectedShapeGroup.get('.resizePoint3')[0].setVisible(isShown);
        selectedShapeGroup.get('.resizePoint1')[0].setListening(isShown);
        selectedShapeGroup.get('.resizePoint2')[0].setListening(isShown);
        selectedShapeGroup.get('.resizePoint3')[0].setListening(isShown);
    }
}

// Removes selected shape from shape array
function eraseShape(selectedShapeGroup) {
    var index = shapeArray.indexOf(selectedShapeGroup);
    if (index > -1) {
        shapeArray.splice(index, 1);
        selectedShapeGroup.remove();
        layer.draw();
    }
}

// Sets resize points to be individually draggable for resizing when moused over
function setDraggable(isDraggable) {
    for (var i = 0; i < shapeArray.length; i++) {
        if (isDraggable) {
            shapeArray[i].getChildren().each(function (shape, n) {
                shape.setDraggable(true);
            });
        } else {
            shapeArray[i].getChildren().each(function (shape, n) {
                shape.setDraggable(false);
            });
        }

    }
}

// Sets shape groups to be draggable as a whole for repositioning
function setAllDraggable(isDraggable) {
    for (var i = 0; i < shapeArray.length; i++) {
        shapeArray[i].setDraggable(isDraggable);
    }
}

// Resizes line according to its resize points
function resizeLine(selectedLineGroup) {
    var selectedLine = selectedLineGroup.get('.line')[0];
    var resizePoint1 = selectedLineGroup.get('.resizePoint1')[0];
    var resizePoint2 = selectedLineGroup.get('.resizePoint2')[0];

    var x1 = resizePoint1.getX(),
        y1 = resizePoint1.getY();
    var x2 = resizePoint2.getX(),
        y2 = resizePoint2.getY();
    selectedLine.getPoints()[0].x = x1;
    selectedLine.getPoints()[0].y = y1;
    selectedLine.getPoints()[1].x = x2;
    selectedLine.getPoints()[1].y = y2;

    layer.draw();
}

// Resizes rectangle according to its resize points
function resizeRectangle(selectedRectangleGroup) {
    var selectedRectangle = selectedRectangleGroup.get('.rectangle')[0];
    var resizePoint1 = selectedRectangleGroup.get('.resizePoint1')[0];
    var resizePoint2 = selectedRectangleGroup.get('.resizePoint2')[0];

    var x1 = resizePoint1.getX(),
        y1 = resizePoint1.getY();
    var x2 = resizePoint2.getX(),
        y2 = resizePoint2.getY();
    selectedRectangle.setX(x1);
    selectedRectangle.setY(y1);
    selectedRectangle.setWidth(x2 - x1);
    selectedRectangle.setHeight(y2 - y1);

    layer.draw();
}

// Resizes triangle according to its resize points
function resizeTriangle(selectedTriangleGroup) {
    var selectedTriangle = selectedTriangleGroup.get('.triangle')[0];
    var resizePoint1 = selectedTriangleGroup.get('.resizePoint1')[0];
    var resizePoint2 = selectedTriangleGroup.get('.resizePoint2')[0];
    var resizePoint3 = selectedTriangleGroup.get('.resizePoint3')[0];

    var x1 = resizePoint1.getX(),
        y1 = resizePoint1.getY();
    var x2 = resizePoint2.getX(),
        y2 = resizePoint2.getY();
    var x3 = resizePoint3.getX(),
        y3 = resizePoint3.getY();
    selectedTriangle.setPoints([x1, y1, x2, y2, x3, y3]);

    layer.draw();
}

// Copies selected shape into global copiedShape variable by creating an identical line or cloning the triangle or rectangle.
function copyShape(selectedShapeGroup) {
    if (selectedShapeGroup.getName() == 'lineGroup') {
        var selectedLine = selectedShapeGroup.get('.line')[0];
        copiedShapeGroup = createLine(selectedLine.getPoints()[0].x, selectedLine.getPoints()[0].y, selectedLine.getPoints()[1].x, selectedLine.getPoints()[1].y, selectedLine.getStroke(), selectedLine.getStrokeWidth());
    } else {
        copiedShapeGroup = selectedShapeGroup.clone();
    }
}

// Applies small offset to copiedShape variable, copies it, then pastes by adding it to the display.
function pasteShape() {
    if (copiedShapeGroup != null) {
        var pasteShapeGroup = null;
        if (copiedShapeGroup.getName() == 'lineGroup') {
            repositionLineForPaste();
            var copiedLine = copiedShapeGroup.get('.line')[0];
            pasteShapeGroup = createLine(copiedLine.getPoints()[0].x, copiedLine.getPoints()[0].y, copiedLine.getPoints()[1].x, copiedLine.getPoints()[1].y, copiedLine.getStroke(), copiedLine.getStrokeWidth());
            shapeArray.push(pasteShapeGroup);
            layer.add(pasteShapeGroup);
            layer.draw();
        } else if (copiedShapeGroup.getName() == 'rectangleGroup') {
            repositionRectangleForPaste();
            pasteShapeGroup = copiedShapeGroup.clone();
            shapeArray.push(pasteShapeGroup);
            layer.add(pasteShapeGroup);
            layer.draw();
        } else if (copiedShapeGroup.getName() == 'triangleGroup') {
            repositionTriangleForPaste();
            pasteShapeGroup = copiedShapeGroup.clone();
            shapeArray.push(pasteShapeGroup);
            layer.add(pasteShapeGroup);
            layer.draw();
        }
		if (pasteShapeGroup != null) {
			shapeSelected(pasteShapeGroup);
                        currentSelectedShape = pasteShapeGroup;
		}
		layer.draw();
    }
}

// Line offset helper function for paste function
function repositionLineForPaste() {
    var copiedLine = copiedShapeGroup.get('.line')[0];
    var resizePoint1 = copiedShapeGroup.get('.resizePoint1')[0];
    var resizePoint2 = copiedShapeGroup.get('.resizePoint2')[0];

    copiedLine.getPoints()[0].x += 10;
    copiedLine.getPoints()[0].y += 10;
    copiedLine.getPoints()[1].x += 10;
    copiedLine.getPoints()[1].y += 10;
    resizePoint1.setX(resizePoint1.getX() + 10);
    resizePoint1.setY(resizePoint1.getY() + 10);
    resizePoint2.setX(resizePoint2.getX() + 10);
    resizePoint2.setY(resizePoint2.getY() + 10);
}

// Rectangle offset helper function for paste function
function repositionRectangleForPaste() {
    var copiedRectangle = copiedShapeGroup.get('.rectangle')[0];
    var resizePoint1 = copiedShapeGroup.get('.resizePoint1')[0];
    var resizePoint2 = copiedShapeGroup.get('.resizePoint2')[0];
    var resizePoint3 = copiedShapeGroup.get('.resizePoint3')[0];
    var resizePoint4 = copiedShapeGroup.get('.resizePoint4')[0];

    copiedRectangle.setX(copiedRectangle.getX() + 10);
    copiedRectangle.setY(copiedRectangle.getY() + 10);
    resizePoint1.setX(resizePoint1.getX() + 10);
    resizePoint1.setY(resizePoint1.getY() + 10);
    resizePoint2.setX(resizePoint2.getX() + 10);
    resizePoint2.setY(resizePoint2.getY() + 10);
    resizePoint3.setX(resizePoint3.getX() + 10);
    resizePoint3.setY(resizePoint3.getY() + 10);
    resizePoint4.setX(resizePoint4.getX() + 10);
    resizePoint4.setY(resizePoint4.getY() + 10);
}

// Triangle offset helper function for paste function
function repositionTriangleForPaste() {
    var copiedTriangle = copiedShapeGroup.get('.triangle')[0];
    var resizePoint1 = copiedShapeGroup.get('.resizePoint1')[0];
    var resizePoint2 = copiedShapeGroup.get('.resizePoint2')[0];
    var resizePoint3 = copiedShapeGroup.get('.resizePoint3')[0];

    copiedTriangle.setX(copiedTriangle.getX() + 10);
    copiedTriangle.setY(copiedTriangle.getY() + 10);
    resizePoint1.setX(resizePoint1.getX() + 10);
    resizePoint1.setY(resizePoint1.getY() + 10);
    resizePoint2.setX(resizePoint2.getX() + 10);
    resizePoint2.setY(resizePoint2.getY() + 10);
    resizePoint3.setX(resizePoint3.getX() + 10);
    resizePoint3.setY(resizePoint3.getY() + 10);
}

// Remove all shapes from shape array
function clearAll() {
    shapeArray.splice(0, shapeArray.length);
    var drawRect = drawingRectangle;
    layer.removeChildren();
    layer.add(drawRect);
    layer.draw();
}

// Sets line color
function setLineColor(selectedShapeGroup, lineColor) {
    var shape = getShapeFromGroup(selectedShapeGroup);
    if (shape != null) {
        shape.setStroke(lineColor);
    }
    layer.draw();
}

// Sets fill color
function setFillColor(selectedShapeGroup, fillColor) {
    var shape = getShapeFromGroup(selectedShapeGroup);
    if (shape != null) {
        shape.setFill(fillColor);
    }
    layer.draw();
}

// Sets line width
function setLineWidth(selectedShapeGroup, lineWidth) {
    var shape = getShapeFromGroup(selectedShapeGroup);
    if (shape != null) {
        shape.setStrokeWidth(lineWidth);
    }
    layer.draw();
}

// Determines shape type of shape group by name
function getShapeFromGroup(shapeGroup) {
    if (shapeGroup.getName() == 'lineGroup') {
        return shapeGroup.get('.line')[0];
    } else if (shapeGroup.getName() == 'rectangleGroup') {
        return shapeGroup.get('.rectangle')[0];
    } else if (shapeGroup.getName() == 'triangleGroup') {
        return shapeGroup.get('.triangle')[0];
    } else {
        return null;
    }
}

// Gets selected fill color option from menu and sets it
function updateFillColor(element) {
    var idx = element.selectedIndex;
    var color = element.options[idx].id;
    if (currentSelectedShape != null) {
        setFillColor(currentSelectedShape, color);
        layer.draw();
    }
}

// Gets selected line color option from menu and sets it
function updateLineColor(element) {
    var idx = element.selectedIndex;
    var color = element.options[idx].id;
    if (currentSelectedShape != null) {
        setLineColor(currentSelectedShape, color);
    }
}

// Gets selected line width option from menu and sets it
function updateLineWidth(element) {
    var idx = element.selectedIndex;
    var width = element.options[idx].value;
    if (currentSelectedShape != null) {
        setLineWidth(currentSelectedShape, parseInt(width));
    }
}

// Operation handler based on current mode set by button listeners
function setMode(mode) {
    currentMode = mode;
    if (currentMode == 'select') {
        drawingRectangle.moveToBottom();
    } else if (currentMode == 'clear') {
        clearAll();
    } else if (currentMode == 'fillColor') {
        if (currentSelectedShape != null) {
            var selector = document.getElementById("fillColorSelector");
            updateFillColor(selector);
        }
    } else if (currentMode == 'lineColor') {
        if (currentSelectedShape != null) {
            var selector = document.getElementById("lineColorSelector");
            updateLineColor(selector);
        }
    } else if (currentMode == 'lineWidth') {
        if (currentSelectedShape != null) {
            var selector = document.getElementById("lineWidthSelector");
            updateLineWidth(selector);
        }
    } else if (currentMode == 'copy') {
        if (currentSelectedShape != null) {
            copyShape(currentSelectedShape);
            currentMode = 'selection';
        }
    } else if (currentMode == 'paste') {
        pasteShape();
		currentMode = 'selection';
    } else if (currentMode == 'erase') {
        if (currentSelectedShape != null) {
            eraseShape(currentSelectedShape);
            currentMode = 'selection';
        }
    }
    if (currentMode == 'drawLine' || currentMode == 'drawRectangle' || currentMode == 'drawTriangle') {
        drawingRectangle.moveToTop();
    } else {
        drawingRectangle.moveToBottom();
    }
    layer.draw();
}

// Select button listener
document.getElementById('selectButton').addEventListener("click", function () {
    setMode('select')
}, false);

// Draw Line button listener
document.getElementById('drawLineButton').addEventListener("click", function () {
    setMode('drawLine')
}, false);

// Draw Rectangle button listener
document.getElementById('drawRectangleButton').addEventListener("click", function () {
    setMode('drawRectangle')
}, false);

// Draw Triangle button listener
document.getElementById('drawTriangleButton').addEventListener("click", function () {
    setMode('drawTriangle')
}, false);

// Clear button listener
document.getElementById('clearButton').addEventListener("click", function () {
    setMode('clear')
}, false);

// Fill Color button listener
document.getElementById('fillColorButton').addEventListener("click", function () {
    setMode('fillColor')
}, false);

// Line Color button listener
document.getElementById('lineColorButton').addEventListener("click", function () {
    setMode('lineColor')
}, false);

// Line Width button listener
document.getElementById('lineWidthButton').addEventListener("click", function () {
    setMode('lineWidth')
}, false);

// Copy button listener
document.getElementById('copyButton').addEventListener("click", function () {
    setMode('copy')
}, false);

// Paste button listener
document.getElementById('pasteButton').addEventListener("click", function () {
    setMode('paste')
}, false);

// Erase button listener
document.getElementById('eraseButton').addEventListener("click", function () {
    setMode('erase')
}, false);