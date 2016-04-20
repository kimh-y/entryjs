var Entry = {block:{}, TEXT_ALIGN_CENTER:0, TEXT_ALIGN_LEFT:1, TEXT_ALIGN_RIGHT:2, TEXT_ALIGNS:["center", "left", "right"], loadProject:function(b) {
  b || (b = Entry.getStartProject(Entry.mediaFilePath));
  "workspace" == this.type && Entry.stateManager.startIgnore();
  Entry.projectId = b._id;
  Entry.variableContainer.setVariables(b.variables);
  Entry.variableContainer.setMessages(b.messages);
  Entry.variableContainer.setFunctions(b.functions);
  Entry.scene.addScenes(b.scenes);
  Entry.stage.initObjectContainers();
  Entry.container.setObjects(b.objects);
  Entry.FPS = b.speed ? b.speed : 60;
  createjs.Ticker.setFPS(Entry.FPS);
  "workspace" == this.type && Entry.stateManager.endIgnore();
  Entry.engine.projectTimer || Entry.variableContainer.generateTimer();
  0 === Object.keys(Entry.container.inputValue).length && Entry.variableContainer.generateAnswer();
  Entry.start();
  return b;
}, exportProject:function(b) {
  b || (b = {});
  Entry.engine.isState("stop") || Entry.engine.toggleStop();
  Entry.Func && Entry.Func.workspace && Entry.Func.workspace.visible && Entry.Func.cancelEdit();
  b.objects = Entry.container.toJSON();
  b.scenes = Entry.scene.toJSON();
  b.variables = Entry.variableContainer.getVariableJSON();
  b.messages = Entry.variableContainer.getMessageJSON();
  b.functions = Entry.variableContainer.getFunctionJSON();
  b.scenes = Entry.scene.toJSON();
  b.speed = Entry.FPS;
  return b;
}, setBlockByText:function(b, a) {
  for (var c = [], d = jQuery.parseXML(a).getElementsByTagName("category"), e = 0;e < d.length;e++) {
    for (var f = d[e], g = {category:f.getAttribute("id"), blocks:[]}, f = f.childNodes, h = 0;h < f.length;h++) {
      var k = f[h];
      !k.tagName || "BLOCK" != k.tagName.toUpperCase() && "BTN" != k.tagName.toUpperCase() || g.blocks.push(k.getAttribute("type"));
    }
    c.push(g);
  }
  Entry.playground.setBlockMenu(c);
}, setBlock:function(b, a) {
  Entry.playground.setMenuBlock(b, a);
}, enableArduino:function() {
}, initSound:function(b) {
  b.path = b.fileurl ? b.fileurl : Entry.defaultPath + "/uploads/" + b.filename.substring(0, 2) + "/" + b.filename.substring(2, 4) + "/" + b.filename + b.ext;
  Entry.soundQueue.loadFile({id:b.id, src:b.path, type:createjs.LoadQueue.SOUND});
}, beforeUnload:function(b) {
  Entry.hw.closeConnection();
  Entry.variableContainer.updateCloudVariables();
  if ("workspace" == Entry.type && (localStorage && Entry.interfaceState && localStorage.setItem("workspace-interface", JSON.stringify(Entry.interfaceState)), !Entry.stateManager.isSaved())) {
    return Lang.Workspace.project_changed;
  }
}, loadInterfaceState:function() {
  if ("workspace" == Entry.type) {
    if (localStorage && localStorage.getItem("workspace-interface")) {
      var b = localStorage.getItem("workspace-interface");
      this.resizeElement(JSON.parse(b));
    } else {
      this.resizeElement({menuWidth:280, canvasWidth:480});
    }
  }
}, resizeElement:function(b) {
  if ("workspace" == Entry.type) {
    var a = this.interfaceState;
    !b.canvasWidth && a.canvasWidth && (b.canvasWidth = a.canvasWidth);
    !b.menuWidth && this.interfaceState.menuWidth && (b.menuWidth = a.menuWidth);
    Entry.engine.speedPanelOn && Entry.engine.toggleSpeedPanel();
    (a = b.canvasWidth) ? 325 > a ? a = 325 : 720 < a && (a = 720) : a = 400;
    b.canvasWidth = a;
    var c = 9 * a / 16;
    Entry.engine.view_.style.width = a + "px";
    Entry.engine.view_.style.height = c + "px";
    Entry.engine.view_.style.top = "40px";
    Entry.stage.canvas.canvas.style.height = c + "px";
    Entry.stage.canvas.canvas.style.width = a + "px";
    400 <= a ? Entry.engine.view_.removeClass("collapsed") : Entry.engine.view_.addClass("collapsed");
    Entry.playground.view_.style.left = a + .5 + "px";
    Entry.propertyPanel.resize(a);
    var d = Entry.engine.view_.getElementsByClassName("entryAddButtonWorkspace_w")[0];
    d && (Entry.objectAddable ? (d.style.top = c + 24 + "px", d.style.width = .7 * a + "px") : d.style.display = "none");
    if (d = Entry.engine.view_.getElementsByClassName("entryRunButtonWorkspace_w")[0]) {
      Entry.objectAddable ? (d.style.top = c + 24 + "px", d.style.left = .7 * a + "px", d.style.width = .3 * a + "px") : (d.style.left = "2px", d.style.top = c + 24 + "px", d.style.width = a - 4 + "px");
    }
    if (d = Entry.engine.view_.getElementsByClassName("entryStopButtonWorkspace_w")[0]) {
      Entry.objectAddable ? (d.style.top = c + 24 + "px", d.style.left = .7 * a + "px", d.style.width = .3 * a + "px") : (d.style.left = "2px", d.style.top = c + 24 + "px", d.style.width = a + "px");
    }
    (a = b.menuWidth) ? 244 > a ? a = 244 : 400 < a && (a = 400) : a = 264;
    b.menuWidth = a;
    Entry.playground.blockMenuView_.style.width = a - 64 + "px";
    $(".entryBlockMenuWorkspace>svg").css({width:a - 64 + "px"});
    $(".entryBlocklyWorkspace").css({left:a + "px"});
    Entry.playground.resizeHandle_.style.left = a + "px";
    Entry.playground.variableViewWrapper_.style.width = a + "px";
    this.interfaceState = b;
  }
  Blockly.fireUiEvent(window, "resize");
}, getUpTime:function() {
  return (new Date).getTime() - this.startTime;
}, addActivity:function(b) {
  Entry.stateManager && Entry.stateManager.addActivity(b);
}, startActivityLogging:function() {
  Entry.reporter && Entry.reporter.start(Entry.projectId, window.user ? window.user._id : null, Entry.startTime);
}, getActivityLog:function() {
  var b = {};
  Entry.stateManager && (b.activityLog = Entry.stateManager.activityLog_);
  return b;
}, DRAG_MODE_NONE:0, DRAG_MODE_MOUSEDOWN:1, DRAG_MODE_DRAG:2, cancelObjectEdit:function(b) {
  var a = Entry.playground.object;
  if (a) {
    var c = b.target;
    b = 0 !== $(a.view_).find(c).length;
    c = c.tagName.toUpperCase();
    !a.isEditing || "INPUT" === c && b || a.editObjectValues(!1);
  }
}};
window.Entry = Entry;
Entry.Albert = {PORT_MAP:{leftWheel:0, rightWheel:0, buzzer:0, leftEye:0, rightEye:0, note:0, bodyLed:0, frontLed:0, padWidth:0, padHeight:0}, setZero:function() {
  var b = Entry.Albert.PORT_MAP, a = Entry.hw.sendQueue, c;
  for (c in b) {
    a[c] = b[c];
  }
  Entry.hw.update();
  b = Entry.Albert;
  b.tempo = 60;
  b.removeAllTimeouts();
}, monitorTemplate:{imgPath:"hw/albert.png", width:387, height:503, listPorts:{oid:{name:"OID", type:"input", pos:{x:0, y:0}}, buzzer:{name:Lang.Hw.buzzer, type:"output", pos:{x:0, y:0}}, note:{name:Lang.Hw.note, type:"output", pos:{x:0, y:0}}}, ports:{leftProximity:{name:Lang.Blocks.ALBERT_sensor_leftProximity, type:"input", pos:{x:178, y:401}}, rightProximity:{name:Lang.Blocks.ALBERT_sensor_rightProximity, type:"input", pos:{x:66, y:359}}, battery:{name:Lang.Blocks.ALBERT_sensor_battery, type:"input", 
pos:{x:88, y:368}}, light:{name:Lang.Blocks.ALBERT_sensor_light, type:"input", pos:{x:127, y:391}}, leftWheel:{name:Lang.Hw.leftWheel, type:"output", pos:{x:299, y:406}}, rightWheel:{name:Lang.Hw.rightWheel, type:"output", pos:{x:22, y:325}}, leftEye:{name:Lang.Hw.leftEye, type:"output", pos:{x:260, y:26}}, rightEye:{name:Lang.Hw.rightEye, type:"output", pos:{x:164, y:13}}, bodyLed:{name:Lang.Hw.body + " " + Lang.Hw.led, type:"output", pos:{x:367, y:308}}, frontLed:{name:Lang.Hw.front + " " + Lang.Hw.led, 
pos:{x:117, y:410}}}, mode:"both"}, tempo:60, timeouts:[], removeTimeout:function(b) {
  clearTimeout(b);
  var a = this.timeouts;
  b = a.indexOf(b);
  0 <= b && a.splice(b, 1);
}, removeAllTimeouts:function() {
  var b = this.timeouts, a;
  for (a in b) {
    clearTimeout(b[a]);
  }
  this.timeouts = [];
}, name:"albert"};
Blockly.Blocks.albert_hand_found = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_hand_found);
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}};
Entry.block.albert_hand_found = function(b, a) {
  var c = Entry.hw.portData;
  return 40 < c.leftProximity || 40 < c.rightProximity;
};
Blockly.Blocks.albert_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdown([[Lang.Blocks.ALBERT_sensor_leftProximity, "leftProximity"], [Lang.Blocks.ALBERT_sensor_rightProximity, "rightProximity"], [Lang.Blocks.ALBERT_sensor_light, "light"], [Lang.Blocks.ALBERT_sensor_battery, "battery"], [Lang.Blocks.ALBERT_sensor_signalStrength, "signalStrength"], [Lang.Blocks.ALBERT_sensor_frontOid, "frontOid"], [Lang.Blocks.ALBERT_sensor_backOid, "backOid"], [Lang.Blocks.ALBERT_sensor_positionX, "positionX"], 
  [Lang.Blocks.ALBERT_sensor_positionY, "positionY"], [Lang.Blocks.ALBERT_sensor_orientation, "orientation"]]), "DEVICE");
  this.setInputsInline(!0);
  this.setOutput(!0, "Number");
}};
Entry.block.albert_value = function(b, a) {
  var c = Entry.hw.portData, d = a.getField("DEVICE");
  return c[d];
};
Blockly.Blocks.albert_move_forward_for_secs = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_move_forward_for_secs_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_move_forward_for_secs_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_move_forward_for_secs = function(b, a) {
  var c = Entry.hw.sendQueue;
  if (a.isStart) {
    if (1 == a.timeFlag) {
      return a;
    }
    delete a.isStart;
    delete a.timeFlag;
    Entry.engine.isContinue = !1;
    c.leftWheel = 0;
    c.rightWheel = 0;
    return a.callReturn();
  }
  a.isStart = !0;
  a.timeFlag = 1;
  c.leftWheel = 30;
  c.rightWheel = 30;
  var c = 1E3 * a.getNumberValue("VALUE"), d = setTimeout(function() {
    a.timeFlag = 0;
    Entry.Albert.removeTimeout(d);
  }, c);
  Entry.Albert.timeouts.push(d);
  return a;
};
Blockly.Blocks.albert_move_backward_for_secs = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_move_backward_for_secs_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_move_backward_for_secs_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_move_backward_for_secs = function(b, a) {
  var c = Entry.hw.sendQueue;
  if (a.isStart) {
    if (1 == a.timeFlag) {
      return a;
    }
    delete a.isStart;
    delete a.timeFlag;
    Entry.engine.isContinue = !1;
    c.leftWheel = 0;
    c.rightWheel = 0;
    return a.callReturn();
  }
  a.isStart = !0;
  a.timeFlag = 1;
  c.leftWheel = -30;
  c.rightWheel = -30;
  var c = 1E3 * a.getNumberValue("VALUE"), d = setTimeout(function() {
    a.timeFlag = 0;
    Entry.Albert.removeTimeout(d);
  }, c);
  Entry.Albert.timeouts.push(d);
  return a;
};
Blockly.Blocks.albert_turn_for_secs = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_turn_for_secs_1).appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"]]), "DIRECTION").appendField(Lang.Blocks.ALBERT_turn_for_secs_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_turn_for_secs_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_turn_for_secs = function(b, a) {
  var c = Entry.hw.sendQueue;
  if (a.isStart) {
    if (1 == a.timeFlag) {
      return a;
    }
    delete a.isStart;
    delete a.timeFlag;
    Entry.engine.isContinue = !1;
    c.leftWheel = 0;
    c.rightWheel = 0;
    return a.callReturn();
  }
  a.isStart = !0;
  a.timeFlag = 1;
  "LEFT" == a.getField("DIRECTION", a) ? (c.leftWheel = -30, c.rightWheel = 30) : (c.leftWheel = 30, c.rightWheel = -30);
  var c = 1E3 * a.getNumberValue("VALUE"), d = setTimeout(function() {
    a.timeFlag = 0;
    Entry.Albert.removeTimeout(d);
  }, c);
  Entry.Albert.timeouts.push(d);
  return a;
};
Blockly.Blocks.albert_change_both_wheels_by = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_change_both_wheels_by_1);
  this.appendValueInput("LEFT").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_change_both_wheels_by_2);
  this.appendValueInput("RIGHT").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_change_both_wheels_by_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_change_both_wheels_by = function(b, a) {
  var c = Entry.hw.sendQueue, d = a.getNumberValue("LEFT"), e = a.getNumberValue("RIGHT");
  c.leftWheel = void 0 != c.leftWheel ? c.leftWheel + d : d;
  c.rightWheel = void 0 != c.rightWheel ? c.rightWheel + e : e;
  return a.callReturn();
};
Blockly.Blocks.albert_set_both_wheels_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_both_wheels_to_1);
  this.appendValueInput("LEFT").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_both_wheels_to_2);
  this.appendValueInput("RIGHT").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_both_wheels_to_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_set_both_wheels_to = function(b, a) {
  var c = Entry.hw.sendQueue;
  c.leftWheel = a.getNumberValue("LEFT");
  c.rightWheel = a.getNumberValue("RIGHT");
  return a.callReturn();
};
Blockly.Blocks.albert_change_wheel_by = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_change_wheel_by_1).appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"], [Lang.General.both, "BOTH"]]), "DIRECTION").appendField(Lang.Blocks.ALBERT_change_wheel_by_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_change_wheel_by_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_change_wheel_by = function(b, a) {
  var c = Entry.hw.sendQueue, d = a.getField("DIRECTION"), e = a.getNumberValue("VALUE");
  "LEFT" == d ? c.leftWheel = void 0 != c.leftWheel ? c.leftWheel + e : e : ("RIGHT" != d && (c.leftWheel = void 0 != c.leftWheel ? c.leftWheel + e : e), c.rightWheel = void 0 != c.rightWheel ? c.rightWheel + e : e);
  return a.callReturn();
};
Blockly.Blocks.albert_set_wheel_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_wheel_to_1).appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"], [Lang.General.both, "BOTH"]]), "DIRECTION").appendField(Lang.Blocks.ALBERT_set_wheel_to_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_wheel_to_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_set_wheel_to = function(b, a) {
  var c = Entry.hw.sendQueue, d = a.getField("DIRECTION"), e = a.getNumberValue("VALUE");
  "LEFT" == d ? c.leftWheel = e : ("RIGHT" != d && (c.leftWheel = e), c.rightWheel = e);
  return a.callReturn();
};
Blockly.Blocks.albert_stop = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_stop).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_stop = function(b, a) {
  var c = Entry.hw.sendQueue;
  c.leftWheel = 0;
  c.rightWheel = 0;
  return a.callReturn();
};
Blockly.Blocks.albert_set_pad_size_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_pad_size_to_1);
  this.appendValueInput("WIDTH").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_pad_size_to_2);
  this.appendValueInput("HEIGHT").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_pad_size_to_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_set_pad_size_to = function(b, a) {
  var c = Entry.hw.sendQueue;
  c.padWidth = a.getNumberValue("WIDTH");
  c.padHeight = a.getNumberValue("HEIGHT");
  return a.callReturn();
};
Blockly.Blocks.albert_set_eye_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_eye_to_1).appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"], [Lang.General.both, "BOTH"]]), "DIRECTION").appendField(Lang.Blocks.ALBERT_set_eye_to_2).appendField(new Blockly.FieldDropdown([[Lang.General.red, "4"], [Lang.General.yellow, "6"], [Lang.General.green, "2"], [Lang.Blocks.ALBERT_color_cyan, "3"], [Lang.General.blue, "1"], [Lang.Blocks.ALBERT_color_magenta, "5"], [Lang.General.white, 
  "7"]]), "COLOR").appendField(Lang.Blocks.ALBERT_set_eye_to_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_set_eye_to = function(b, a) {
  var c = Entry.hw.sendQueue, d = a.getField("DIRECTION", a), e = Number(a.getField("COLOR", a));
  "LEFT" == d ? c.leftEye = e : ("RIGHT" != d && (c.leftEye = e), c.rightEye = e);
  return a.callReturn();
};
Blockly.Blocks.albert_clear_eye = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_clear_eye_1).appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"], [Lang.General.both, "BOTH"]]), "DIRECTION").appendField(Lang.Blocks.ALBERT_clear_eye_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_clear_eye = function(b, a) {
  var c = Entry.hw.sendQueue, d = a.getField("DIRECTION", a);
  "LEFT" == d ? c.leftEye = 0 : ("RIGHT" != d && (c.leftEye = 0), c.rightEye = 0);
  return a.callReturn();
};
Blockly.Blocks.albert_body_led = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_body_led_1).appendField(new Blockly.FieldDropdown([[Lang.General.turn_on, "ON"], [Lang.General.turn_off, "OFF"]]), "STATE").appendField(Lang.Blocks.ALBERT_body_led_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_body_led = function(b, a) {
  var c = Entry.hw.sendQueue;
  "ON" == a.getField("STATE", a) ? c.bodyLed = 1 : c.bodyLed = 0;
  return a.callReturn();
};
Blockly.Blocks.albert_front_led = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_front_led_1).appendField(new Blockly.FieldDropdown([[Lang.General.turn_on, "ON"], [Lang.General.turn_off, "OFF"]]), "STATE").appendField(Lang.Blocks.ALBERT_front_led_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_front_led = function(b, a) {
  var c = Entry.hw.sendQueue;
  "ON" == a.getField("STATE", a) ? c.frontLed = 1 : c.frontLed = 0;
  return a.callReturn();
};
Blockly.Blocks.albert_beep = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_beep).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_beep = function(b, a) {
  var c = Entry.hw.sendQueue;
  if (a.isStart) {
    if (1 == a.timeFlag) {
      return a;
    }
    delete a.isStart;
    delete a.timeFlag;
    Entry.engine.isContinue = !1;
    c.buzzer = 0;
    return a.callReturn();
  }
  a.isStart = !0;
  a.timeFlag = 1;
  c.buzzer = 440;
  c.note = 0;
  var d = setTimeout(function() {
    a.timeFlag = 0;
    Entry.Albert.removeTimeout(d);
  }, 200);
  Entry.Albert.timeouts.push(d);
  return a;
};
Blockly.Blocks.albert_change_buzzer_by = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_change_buzzer_by_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_change_buzzer_by_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_change_buzzer_by = function(b, a) {
  var c = Entry.hw.sendQueue, d = a.getNumberValue("VALUE");
  c.buzzer = void 0 != c.buzzer ? c.buzzer + d : d;
  c.note = 0;
  return a.callReturn();
};
Blockly.Blocks.albert_set_buzzer_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_buzzer_to_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_buzzer_to_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_set_buzzer_to = function(b, a) {
  var c = Entry.hw.sendQueue;
  c.buzzer = a.getNumberValue("VALUE");
  c.note = 0;
  return a.callReturn();
};
Blockly.Blocks.albert_clear_buzzer = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_clear_buzzer).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_clear_buzzer = function(b, a) {
  var c = Entry.hw.sendQueue;
  c.buzzer = 0;
  c.note = 0;
  return a.callReturn();
};
Blockly.Blocks.albert_play_note_for = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_play_note_for_1).appendField(new Blockly.FieldDropdown([[Lang.General.note_c + "", "4"], [Lang.General.note_c + "#", "5"], [Lang.General.note_d + "", "6"], [Lang.General.note_e + "b", "7"], [Lang.General.note_e + "", "8"], [Lang.General.note_f + "", "9"], [Lang.General.note_f + "#", "10"], [Lang.General.note_g + "", "11"], [Lang.General.note_g + "#", "12"], [Lang.General.note_a + "", "13"], [Lang.General.note_b + "b", "14"], [Lang.General.note_b + 
  "", "15"]]), "NOTE").appendField(Lang.Blocks.ALBERT_play_note_for_2).appendField(new Blockly.FieldDropdown([["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"]]), "OCTAVE").appendField(Lang.Blocks.ALBERT_play_note_for_3);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_play_note_for_4).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_play_note_for = function(b, a) {
  var c = Entry.hw.sendQueue;
  if (a.isStart) {
    if (1 == a.timeFlag) {
      return a;
    }
    delete a.isStart;
    delete a.timeFlag;
    Entry.engine.isContinue = !1;
    c.note = 0;
    return a.callReturn();
  }
  var d = a.getNumberField("NOTE", a), e = a.getNumberField("OCTAVE", a), f = a.getNumberValue("VALUE", a), g = Entry.Albert.tempo, f = 6E4 * f / g;
  a.isStart = !0;
  a.timeFlag = 1;
  c.buzzer = 0;
  c.note = d + 12 * (e - 1);
  if (100 < f) {
    var h = setTimeout(function() {
      c.note = 0;
      Entry.Albert.removeTimeout(h);
    }, f - 100);
    Entry.Albert.timeouts.push(h);
  }
  var k = setTimeout(function() {
    a.timeFlag = 0;
    Entry.Albert.removeTimeout(k);
  }, f);
  Entry.Albert.timeouts.push(k);
  return a;
};
Blockly.Blocks.albert_rest_for = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_rest_for_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_rest_for_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_rest_for = function(b, a) {
  var c = Entry.hw.sendQueue;
  if (a.isStart) {
    if (1 == a.timeFlag) {
      return a;
    }
    delete a.isStart;
    delete a.timeFlag;
    Entry.engine.isContinue = !1;
    return a.callReturn();
  }
  a.isStart = !0;
  a.timeFlag = 1;
  var d = a.getNumberValue("VALUE"), d = 6E4 * d / Entry.Albert.tempo;
  c.buzzer = 0;
  c.note = 0;
  var e = setTimeout(function() {
    a.timeFlag = 0;
    Entry.Albert.removeTimeout(e);
  }, d);
  Entry.Albert.timeouts.push(e);
  return a;
};
Blockly.Blocks.albert_change_tempo_by = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_change_tempo_by_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_change_tempo_by_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_change_tempo_by = function(b, a) {
  Entry.Albert.tempo += a.getNumberValue("VALUE");
  1 > Entry.Albert.tempo && (Entry.Albert.tempo = 1);
  return a.callReturn();
};
Blockly.Blocks.albert_set_tempo_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_tempo_to_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_tempo_to_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_set_tempo_to = function(b, a) {
  Entry.Albert.tempo = a.getNumberValue("VALUE");
  1 > Entry.Albert.tempo && (Entry.Albert.tempo = 1);
  return a.callReturn();
};
Blockly.Blocks.albert_move_forward = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_move_forward).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_move_forward = function(b, a) {
  var c = Entry.hw.sendQueue;
  if (a.isStart) {
    if (1 == a.timeFlag) {
      return a;
    }
    delete a.timeFlag;
    delete a.isStart;
    Entry.engine.isContinue = !1;
    c.leftWheel = 0;
    c.rightWheel = 0;
    return a.callReturn();
  }
  a.isStart = !0;
  a.timeFlag = 1;
  c.leftWheel = 30;
  c.rightWheel = 30;
  setTimeout(function() {
    a.timeFlag = 0;
  }, 1E3);
  return a;
};
Blockly.Blocks.albert_move_backward = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_move_backward).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_move_backward = function(b, a) {
  var c = Entry.hw.sendQueue;
  if (a.isStart) {
    if (1 == a.timeFlag) {
      return c.leftWheel = -30, c.rightWheel = -30, a;
    }
    delete a.timeFlag;
    delete a.isStart;
    Entry.engine.isContinue = !1;
    c.leftWheel = 0;
    c.rightWheel = 0;
    return a.callReturn();
  }
  a.isStart = !0;
  a.timeFlag = 1;
  setTimeout(function() {
    a.timeFlag = 0;
  }, 1E3);
  return a;
};
Blockly.Blocks.albert_turn_around = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_turn_around_1).appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"]]), "DIRECTION").appendField(Lang.Blocks.HAMSTER_turn_around_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_turn_around = function(b, a) {
  var c = Entry.hw.sendQueue;
  if (a.isStart) {
    if (1 == a.timeFlag) {
      return c.leftWheel = a.leftValue, c.rightWheel = a.rightValue, a;
    }
    delete a.timeFlag;
    delete a.isStart;
    delete a.leftValue;
    delete a.rightValue;
    Entry.engine.isContinue = !1;
    c.leftWheel = 0;
    c.rightWheel = 0;
    return a.callReturn();
  }
  c = "LEFT" == a.getField("DIRECTION", a);
  a.leftValue = c ? -30 : 30;
  a.rightValue = c ? 30 : -30;
  a.isStart = !0;
  a.timeFlag = 1;
  setTimeout(function() {
    a.timeFlag = 0;
  }, 1E3);
  return a;
};
Blockly.Blocks.albert_set_led_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_led_to_1).appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"], [Lang.General.both, "FRONT"]]), "DIRECTION").appendField(Lang.Blocks.ALBERT_set_led_to_2).appendField(new Blockly.FieldDropdown([[Lang.General.red, "4"], [Lang.General.yellow, "6"], [Lang.General.green, "2"], [Lang.General.skyblue, "3"], [Lang.General.blue, "1"], [Lang.General.purple, "5"], [Lang.General.white, "7"]]), "COLOR").appendField(Lang.Blocks.HAMSTER_set_led_to_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + 
  "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_set_led_to = function(b, a) {
  var c = Entry.hw.sendQueue, d = a.getField("DIRECTION", a), e = Number(a.getField("COLOR", a));
  "FRONT" == d ? (c.leftEye = e, c.rightEye = e) : "LEFT" == d ? c.leftEye = e : c.rightEye = e;
  return a.callReturn();
};
Blockly.Blocks.albert_clear_led = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_clear_led_1).appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"], [Lang.General.both, "FRONT"]]), "DIRECTION").appendField(Lang.Blocks.ALBERT_clear_led_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_clear_led = function(b, a) {
  var c = Entry.hw.sendQueue, d = a.getField("DIRECTION", a);
  "FRONT" == d ? (c.leftEye = 0, c.rightEye = 0) : "LEFT" == d ? c.leftEye = 0 : c.rightEye = 0;
  return a.callReturn();
};
Blockly.Blocks.albert_change_wheels_by = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_wheels_by_1).appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"], [Lang.General.both, "FRONT"]]), "DIRECTION").appendField(Lang.Blocks.HAMSTER_change_wheels_by_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_wheels_by_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_change_wheels_by = function(b, a) {
  var c = Entry.hw.sendQueue, d = Entry.hw.portData, e = a.getField("DIRECTION"), f = a.getNumberValue("VALUE");
  "LEFT" == e ? c.leftWheel = void 0 != c.leftWheel ? c.leftWheel + f : d.leftWheel + f : ("RIGHT" != e && (c.leftWheel = void 0 != c.leftWheel ? c.leftWheel + f : d.leftWheel + f), c.rightWheel = void 0 != c.rightWheel ? c.rightWheel + f : d.rightWheel + f);
  return a.callReturn();
};
Blockly.Blocks.albert_set_wheels_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_wheels_to_1).appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"], [Lang.General.both, "FRONT"]]), "DIRECTION").appendField(Lang.Blocks.HAMSTER_set_wheels_to_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_wheels_to_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_set_wheels_to = function(b, a) {
  var c = Entry.hw.sendQueue, d = a.getField("DIRECTION"), e = a.getNumberValue("VALUE");
  "LEFT" == d ? c.leftWheel = e : ("RIGHT" != d && (c.leftWheel = e), c.rightWheel = e);
  return a.callReturn();
};
Entry.Arduino = {name:"arduino", setZero:function() {
  Entry.hw.sendQueue.readablePorts = [];
  for (var b = 0;20 > b;b++) {
    Entry.hw.sendQueue[b] = 0, Entry.hw.sendQueue.readablePorts.push(b);
  }
  Entry.hw.update();
}, monitorTemplate:{imgPath:"hw/arduino.png", width:268, height:270, listPorts:{2:{name:Lang.Hw.port_en + " 2 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 3:{name:Lang.Hw.port_en + " 3 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 4:{name:Lang.Hw.port_en + " 4 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 5:{name:Lang.Hw.port_en + " 5 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 6:{name:Lang.Hw.port_en + " 6 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 7:{name:Lang.Hw.port_en + 
" 7 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 8:{name:Lang.Hw.port_en + " 8 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 9:{name:Lang.Hw.port_en + " 9 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 10:{name:Lang.Hw.port_en + " 10 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 11:{name:Lang.Hw.port_en + " 11 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 12:{name:Lang.Hw.port_en + " 12 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 13:{name:Lang.Hw.port_en + " 13 " + 
Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, a0:{name:Lang.Hw.port_en + " A0 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, a1:{name:Lang.Hw.port_en + " A1 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, a2:{name:Lang.Hw.port_en + " A2 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, a3:{name:Lang.Hw.port_en + " A3 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, a4:{name:Lang.Hw.port_en + " A4 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, a5:{name:Lang.Hw.port_en + " A5 " + 
Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}}, mode:"both"}};
Entry.SensorBoard = {name:"sensorBoard", setZero:Entry.Arduino.setZero, monitorTemplate:{imgPath:"hw/sensorBoard.png", width:268, height:270, listPorts:{2:{name:Lang.Hw.port_en + " 2 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 3:{name:Lang.Hw.port_en + " 3 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 4:{name:Lang.Hw.port_en + " 4 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 5:{name:Lang.Hw.port_en + " 5 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, a3:{name:Lang.Hw.port_en + 
" A3 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, a4:{name:Lang.Hw.port_en + " A4 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, a5:{name:Lang.Hw.port_en + " A5 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 6:{name:Lang.Hw.port_en + " 6 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 7:{name:Lang.Hw.port_en + " 7 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 12:{name:Lang.Hw.port_en + " 12 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 13:{name:Lang.Hw.port_en + " 13 " + 
Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}}, ports:{0:{name:Lang.Hw.light + " " + Lang.Hw.sensor + "2", type:"input", pos:{x:190, y:215}}, slider:{name:Lang.Blocks.CODEino_sensor_name_2, type:"input", pos:{x:150, y:20}}, 1:{name:Lang.Hw.temp, type:"input", pos:{x:207, y:251}}, 8:{name:Lang.Hw.right_ko + Lang.Hw.switch_ + Lang.Hw.right_en, type:"input", pos:{x:180, y:120}}, 9:{name:Lang.Hw.left_ko + Lang.Hw.switch_ + Lang.Hw.left_en, type:"input", pos:{x:90, y:143}}, 10:{name:Lang.Hw.up_ko + Lang.Hw.switch_ + 
Lang.Hw.up_en, type:"input", pos:{x:130, y:73}}, 11:{name:Lang.Hw.down_ko + Lang.Hw.switch_ + Lang.Hw.down_en, type:"input", pos:{x:120, y:185}}}, mode:"both"}};
Entry.dplay = {name:"dplay", setZero:Entry.Arduino.setZero};
Entry.CODEino = {name:"CODEino", setZero:Entry.Arduino.setZero, monitorTemplate:Entry.Arduino.monitorTemplate};
Blockly.Blocks.arduino_text = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldTextInput("Arduino"), "NAME");
  this.setOutput(!0, "String");
  this.setInputsInline(!0);
}};
Entry.block.arduino_text = function(b, a) {
  return a.getStringField("NAME");
};
Blockly.Blocks.arduino_send = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_arduino_send_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_arduino_send_2);
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.arduino_send = function(b, a) {
  var c = a.getValue("VALUE", a), d = new XMLHttpRequest;
  d.open("POST", "http://localhost:23518/arduino/", !1);
  d.send(String(c));
  Entry.assert(200 == d.status, "arduino is not connected");
  return a.callReturn();
};
Blockly.Blocks.arduino_get_string = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_arduino_get_string_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_arduino_get_string_2);
  this.setOutput(!0, "String");
  this.setInputsInline(!0);
}};
Entry.block.arduino_get_number = function(b, a) {
  var c = a.getValue("VALUE", a), d = new XMLHttpRequest;
  d.open("POST", "http://localhost:23518/arduino/", !1);
  d.send(String(c));
  Entry.assert(200 == d.status, "arduino is not connected");
  return Number(d.responseText);
};
Blockly.Blocks.arduino_get_number = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_arduino_get_number_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_arduino_get_number_2);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.arduino_get_string = function(b, a) {
  var c = a.getValue("VALUE", a), d = new XMLHttpRequest;
  d.open("POST", "http://localhost:23518/arduino/", !1);
  d.send(String(c));
  Entry.assert(200 == d.status, "arduino is not connected");
  return d.responseText;
};
Blockly.Blocks.arduino_get_sensor_number = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.ARDUINO_arduino_get_sensor_number_0, "A0"], [Lang.Blocks.ARDUINO_arduino_get_sensor_number_1, "A1"], [Lang.Blocks.ARDUINO_arduino_get_sensor_number_2, "A2"], [Lang.Blocks.ARDUINO_arduino_get_sensor_number_3, "A3"], [Lang.Blocks.ARDUINO_arduino_get_sensor_number_4, "A4"], [Lang.Blocks.ARDUINO_arduino_get_sensor_number_5, "A5"]]), "PORT");
  this.appendDummyInput().appendField(" ");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.arduino_get_sensor_number = function(b, a) {
  return a.getStringField("PORT");
};
Blockly.Blocks.arduino_get_port_number = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["0", "0"], ["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"], ["9", "9"], ["10", "10"], ["11", "11"], ["12", "12"], ["13", "13"]]), "PORT");
  this.appendDummyInput().appendField(" ");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.arduino_get_port_number = function(b, a) {
  return a.getStringField("PORT");
};
Blockly.Blocks.arduino_get_pwm_port_number = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["3", "3"], ["5", "5"], ["6", "6"], ["9", "9"], ["10", "10"], ["11", "11"]]), "PORT");
  this.appendDummyInput().appendField(" ");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.arduino_get_pwm_port_number = function(b, a) {
  return a.getStringField("PORT");
};
Blockly.Blocks.arduino_get_number_sensor_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_num_sensor_value_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_num_sensor_value_2).appendField(" ");
  this.setInputsInline(!0);
  this.setOutput(!0, "Number");
}};
Entry.block.arduino_get_number_sensor_value = function(b, a) {
  var c = a.getValue("VALUE", a);
  return Entry.hw.getAnalogPortValue(c[1]);
};
Blockly.Blocks.arduino_get_digital_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_get_digital_value_1);
  this.appendValueInput("VALUE").setCheck("Number");
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_num_sensor_value_2).appendField(" ");
  this.setInputsInline(!0);
  this.setOutput(!0, "Boolean");
}};
Entry.block.arduino_get_digital_value = function(b, a) {
  var c = a.getNumberValue("VALUE", a);
  return Entry.hw.getDigitalPortValue(c);
};
Blockly.Blocks.arduino_toggle_led = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_num_pin_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_num_pin_2);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.ARDUINO_on, "on"], [Lang.Blocks.ARDUINO_off, "off"]]), "OPERATOR").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.arduino_toggle_led = function(b, a) {
  var c = a.getNumberValue("VALUE"), d = a.getField("OPERATOR");
  Entry.hw.setDigitalPortValue(c, "on" == d ? 255 : 0);
  return a.callReturn();
};
Blockly.Blocks.arduino_toggle_pwm = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_toggle_pwm_1);
  this.appendValueInput("PORT").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_toggle_pwm_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_toggle_pwm_3);
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.arduino_toggle_pwm = function(b, a) {
  var c = a.getNumberValue("PORT"), d = a.getNumberValue("VALUE"), d = Math.round(d), d = Math.max(d, 0), d = Math.min(d, 255);
  Entry.hw.setDigitalPortValue(c, d);
  return a.callReturn();
};
Blockly.Blocks.arduino_convert_scale = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_convert_scale_1);
  this.appendValueInput("VALUE1").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_convert_scale_2);
  this.appendValueInput("VALUE2").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_convert_scale_3);
  this.appendValueInput("VALUE3").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_convert_scale_4);
  this.appendValueInput("VALUE4").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_convert_scale_5);
  this.appendValueInput("VALUE5").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_convert_scale_6);
  this.appendDummyInput().appendField(" ");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.arduino_convert_scale = function(b, a) {
  var c = a.getNumberValue("VALUE1", a), d = a.getNumberValue("VALUE2", a), e = a.getNumberValue("VALUE3", a), f = a.getNumberValue("VALUE4", a), g = a.getNumberValue("VALUE5", a);
  if (d > e) {
    var h = d, d = e, e = h
  }
  f > g && (h = f, f = g, g = h);
  c -= d;
  c *= (g - f) / (e - d);
  c += f;
  c = Math.min(g, c);
  c = Math.max(f, c);
  return Math.round(c);
};
Blockly.Blocks.sensorBoard_get_named_sensor_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdown([["\uc18c\ub9ac", "0"], ["\ube5b \uac10\uc9c0", "1"], ["\uc2ac\ub77c\uc774\ub354", "2"], ["\uc628\ub3c4", "3"]]), "PORT").appendField(" \uc13c\uc11c\uac12");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.sensorBoard_get_named_sensor_value = function(b, a) {
  return Entry.hw.getAnalogPortValue(a.getField("PORT", a));
};
Blockly.Blocks.sensorBoard_is_button_pressed = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdown([["\ube68\uac04", "8"], ["\ud30c\ub780", "9"], ["\ub178\ub780", "10"], ["\ucd08\ub85d", "11"]]), "PORT");
  this.appendDummyInput().appendField(" \ubc84\ud2bc\uc744 \ub20c\ub800\ub294\uac00?");
  this.setInputsInline(!0);
  this.setOutput(!0, "Boolean");
}};
Entry.block.sensorBoard_is_button_pressed = function(b, a) {
  return Entry.hw.getDigitalPortValue(a.getNumberField("PORT", a));
};
Blockly.Blocks.sensorBoard_led = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdown([["\ube68\uac04", "2"], ["\ucd08\ub85d", "3"], ["\ud30c\ub780", "4"], ["\ud770\uc0c9", "5"]]), "PORT").appendField(" LED").appendField(new Blockly.FieldDropdown([["\ucf1c\uae30", "255"], ["\ub044\uae30", "0"]]), "OPERATOR").appendField(" ").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.sensorBoard_led = function(b, a) {
  Entry.hw.setDigitalPortValue(a.getField("PORT"), a.getNumberField("OPERATOR"));
  return a.callReturn();
};
Blockly.Blocks.CODEino_get_sensor_number = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.CODEino_get_sensor_number_0, "A0"], [Lang.Blocks.CODEino_get_sensor_number_1, "A1"], [Lang.Blocks.CODEino_get_sensor_number_2, "A2"], [Lang.Blocks.CODEino_get_sensor_number_3, "A3"], [Lang.Blocks.CODEino_get_sensor_number_4, "A4"], [Lang.Blocks.CODEino_get_sensor_number_5, "A5"], [Lang.Blocks.CODEino_get_sensor_number_6, "A6"]]), "PORT");
  this.appendDummyInput().appendField(" ");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.CODEino_get_sensor_number = function(b, a) {
  return a.getStringField("PORT");
};
Blockly.Blocks.CODEino_get_named_sensor_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(" ").appendField(new Blockly.FieldDropdown([[Lang.Blocks.CODEino_sensor_name_0, "0"], [Lang.Blocks.CODEino_sensor_name_1, "1"], [Lang.Blocks.CODEino_sensor_name_2, "2"], [Lang.Blocks.CODEino_sensor_name_3, "3"], [Lang.Blocks.CODEino_sensor_name_4, "4"], [Lang.Blocks.CODEino_sensor_name_5, "5"], [Lang.Blocks.CODEino_sensor_name_6, "6"]]), "PORT").appendField(Lang.Blocks.CODEino_string_1);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.CODEino_get_named_sensor_value = function(b, a) {
  return Entry.hw.getAnalogPortValue(a.getField("PORT", a));
};
Blockly.Blocks.CODEino_get_sound_status = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.CODEino_string_10).appendField(new Blockly.FieldDropdown([[Lang.Blocks.CODEino_string_11, "GREAT"], [Lang.Blocks.CODEino_string_12, "SMALL"]]), "STATUS").appendField(" ");
  this.setInputsInline(!0);
  this.setOutput(!0, "Boolean");
}};
Entry.block.CODEino_get_sound_status = function(b, a) {
  return "GREAT" == a.getField("STATUS", a) ? 600 < Entry.hw.getAnalogPortValue(0) ? 1 : 0 : 600 > Entry.hw.getAnalogPortValue(0) ? 1 : 0;
};
Blockly.Blocks.CODEino_get_light_status = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.CODEino_string_13).appendField(new Blockly.FieldDropdown([[Lang.Blocks.CODEino_string_14, "BRIGHT"], [Lang.Blocks.CODEino_string_15, "DARK"]]), "STATUS").appendField(" ");
  this.setInputsInline(!0);
  this.setOutput(!0, "Boolean");
}};
Entry.block.CODEino_get_light_status = function(b, a) {
  return "DARK" == a.getField("STATUS", a) ? 800 < Entry.hw.getAnalogPortValue(1) ? 1 : 0 : 800 > Entry.hw.getAnalogPortValue(1) ? 1 : 0;
};
Blockly.Blocks.CODEino_is_button_pressed = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.CODEino_string_2).appendField(new Blockly.FieldDropdown([[Lang.Blocks.CODEino_string_3, "4"], [Lang.Blocks.CODEino_string_4, "17"], [Lang.Blocks.CODEino_string_5, "18"], [Lang.Blocks.CODEino_string_6, "19"], [Lang.Blocks.CODEino_string_7, "20"]]), "PORT").appendField(" ");
  this.setInputsInline(!0);
  this.setOutput(!0, "Boolean");
}};
Entry.block.CODEino_is_button_pressed = function(b, a) {
  var c = a.getNumberField("PORT", a);
  return 14 < c ? !Entry.hw.getAnalogPortValue(c - 14) : !Entry.hw.getDigitalPortValue(c);
};
Blockly.Blocks.CODEino_get_accelerometer_direction = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.CODEino_string_8).appendField(new Blockly.FieldDropdown([[Lang.Blocks.CODEino_string_16, "LEFT"], [Lang.Blocks.CODEino_string_17, "RIGHT"], [Lang.Blocks.CODEino_string_18, "FRONT"], [Lang.Blocks.CODEino_string_19, "REAR"], [Lang.Blocks.CODEino_string_20, "REVERSE"]]), "DIRECTION");
  this.appendDummyInput().appendField(" ");
  this.setInputsInline(!0);
  this.setOutput(!0, "Boolean");
}};
Entry.block.CODEino_get_accelerometer_direction = function(b, a) {
  var c = a.getField("DIRECTION", a), d = 0;
  "LEFT" == c || "RIGHT" == c ? d = 3 : "FRONT" == c || "REAR" == c ? d = 4 : "REVERSE" == c && (d = 5);
  d = Entry.hw.getAnalogPortValue(d);
  d = 180 / 137 * (d - 265);
  d += -90;
  d = Math.min(90, d);
  d = Math.max(-90, d);
  d = Math.round(d);
  if ("LEFT" == c || "REAR" == c) {
    return -30 > d ? 1 : 0;
  }
  if ("RIGHT" == c || "FRONT" == c) {
    return 30 < d ? 1 : 0;
  }
  if ("REVERSE" == c) {
    return -50 > d ? 1 : 0;
  }
};
Blockly.Blocks.CODEino_get_accelerometer_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.CODEino_string_8).appendField(new Blockly.FieldDropdown([[Lang.Blocks.CODEino_accelerometer_X, "3"], [Lang.Blocks.CODEino_accelerometer_Y, "4"], [Lang.Blocks.CODEino_accelerometer_Z, "5"]]), "PORT").appendField(Lang.Blocks.CODEino_string_9);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.CODEino_get_accelerometer_value = function(b, a) {
  var c = 265, d = 402, e = -90, f = 90, g = Entry.hw.getAnalogPortValue(a.getField("PORT", a));
  if (c > d) {
    var h = c, c = d, d = h
  }
  e > f && (h = e, e = f, f = h);
  g = (f - e) / (d - c) * (g - c);
  g += e;
  g = Math.min(f, g);
  g = Math.max(e, g);
  return Math.round(g);
};
Entry.Bitbrick = {SENSOR_MAP:{1:"light", 2:"IR", 3:"touch", 4:"potentiometer", 5:"MIC", 21:"UserSensor", 11:"USER INPUT", 20:"LED", 19:"SERVO", 18:"DC"}, PORT_MAP:{buzzer:2, 5:4, 6:6, 7:8, 8:10, LEDR:12, LEDG:14, LEDB:16}, sensorList:function() {
  for (var b = [], a = Entry.hw.portData, c = 1;5 > c;c++) {
    var d = a[c];
    d && (d.value || 0 === d.value) && b.push([c + " - " + Lang.Blocks["BITBRICK_" + d.type], c.toString()]);
  }
  return 0 == b.length ? [[Lang.Blocks.no_target, "null"]] : b;
}, touchList:function() {
  for (var b = [], a = Entry.hw.portData, c = 1;5 > c;c++) {
    var d = a[c];
    d && "touch" === d.type && b.push([c.toString(), c.toString()]);
  }
  return 0 == b.length ? [[Lang.Blocks.no_target, "null"]] : b;
}, servoList:function() {
  for (var b = [], a = Entry.hw.portData, c = 5;9 > c;c++) {
    var d = a[c];
    d && "SERVO" === d.type && b.push(["ABCD"[c - 5], c.toString()]);
  }
  return 0 == b.length ? [[Lang.Blocks.no_target, "null"]] : b;
}, dcList:function() {
  for (var b = [], a = Entry.hw.portData, c = 5;9 > c;c++) {
    var d = a[c];
    d && "DC" === d.type && b.push(["ABCD"[c - 5], c.toString()]);
  }
  return 0 == b.length ? [[Lang.Blocks.no_target, "null"]] : b;
}, setZero:function() {
  var b = Entry.hw.sendQueue, a;
  for (a in Entry.Bitbrick.PORT_MAP) {
    b[a] = 0;
  }
  Entry.hw.update();
}, name:"bitbrick", servoMaxValue:181, servoMinValue:1, dcMaxValue:100, dcMinValue:-100, monitorTemplate:{imgPath:"hw/bitbrick.gif", width:133, height:153, listPorts:{1:{name:Lang.Hw.port_en + " 1 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 2:{name:Lang.Hw.port_en + " 2 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 3:{name:Lang.Hw.port_en + " 3 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 4:{name:Lang.Hw.port_en + " 4 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, A:{name:Lang.Hw.port_en + 
" A " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, B:{name:Lang.Hw.port_en + " B " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, C:{name:Lang.Hw.port_en + " C " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, D:{name:Lang.Hw.port_en + " D " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}}, mode:"both"}};
Blockly.Blocks.bitbrick_sensor_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdownDynamic(Entry.Bitbrick.sensorList), "PORT").appendField(" \uac12");
  this.setOutput(!0, "String");
  this.setInputsInline(!0);
}};
Entry.block.bitbrick_sensor_value = function(b, a) {
  var c = a.getStringField("PORT");
  return Entry.hw.portData[c].value;
};
Blockly.Blocks.bitbrick_is_touch_pressed = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.BITBRICK_touch).appendField(new Blockly.FieldDropdownDynamic(Entry.Bitbrick.touchList), "PORT").appendField("\uc774(\uac00) \ub20c\ub838\ub294\uac00?");
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}};
Entry.block.bitbrick_is_touch_pressed = function(b, a) {
  return 0 === Entry.hw.portData[a.getStringField("PORT")].value;
};
Blockly.Blocks.bitbrick_turn_off_color_led = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uceec\ub7ec LED \ub044\uae30").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.bitbrick_turn_off_color_led = function(b, a) {
  Entry.hw.sendQueue.LEDR = 0;
  Entry.hw.sendQueue.LEDG = 0;
  Entry.hw.sendQueue.LEDB = 0;
  return a.callReturn();
};
Blockly.Blocks.bitbrick_turn_on_color_led_by_rgb = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uceec\ub7ec LED \ucf1c\uae30 R");
  this.appendValueInput("rValue").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("G");
  this.appendValueInput("gValue").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("B");
  this.appendValueInput("bValue").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.bitbrick_turn_on_color_led_by_rgb = function(b, a) {
  var c = a.getNumberValue("rValue"), d = a.getNumberValue("gValue"), e = a.getNumberValue("bValue"), f = Entry.adjustValueWithMaxMin, g = Entry.hw.sendQueue;
  g.LEDR = f(c, 0, 255);
  g.LEDG = f(d, 0, 255);
  g.LEDB = f(e, 0, 255);
  return a.callReturn();
};
Blockly.Blocks.bitbrick_turn_on_color_led_by_picker = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uceec\ub7ec LED \uc0c9 ").appendField(new Blockly.FieldColour("#ff0000"), "VALUE").appendField("\ub85c \uc815\ud558\uae30").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.bitbrick_turn_on_color_led_by_picker = function(b, a) {
  var c = a.getStringField("VALUE");
  Entry.hw.sendQueue.LEDR = parseInt(c.substr(1, 2), 16);
  Entry.hw.sendQueue.LEDG = parseInt(c.substr(3, 2), 16);
  Entry.hw.sendQueue.LEDB = parseInt(c.substr(5, 2), 16);
  return a.callReturn();
};
Blockly.Blocks.bitbrick_turn_on_color_led_by_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uceec\ub7ec LED \ucf1c\uae30 \uc0c9");
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("\ub85c \uc815\ud558\uae30").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.bitbrick_turn_on_color_led_by_value = function(b, a) {
  var c = a.getNumberValue("VALUE"), d, e, f, c = c % 200;
  67 > c ? (d = 200 - 3 * c, e = 3 * c, f = 0) : 134 > c ? (c -= 67, d = 0, e = 200 - 3 * c, f = 3 * c) : 201 > c && (c -= 134, d = 3 * c, e = 0, f = 200 - 3 * c);
  Entry.hw.sendQueue.LEDR = d;
  Entry.hw.sendQueue.LEDG = e;
  Entry.hw.sendQueue.LEDB = f;
  return a.callReturn();
};
Blockly.Blocks.bitbrick_buzzer = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\ubc84\uc800\uc74c ");
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("\ub0b4\uae30").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.bitbrick_buzzer = function(b, a) {
  if (a.isStart) {
    return Entry.hw.sendQueue.buzzer = 0, delete a.isStart, a.callReturn();
  }
  var c = a.getNumberValue("VALUE");
  Entry.hw.sendQueue.buzzer = c;
  a.isStart = !0;
  return a;
};
Blockly.Blocks.bitbrick_turn_off_all_motors = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\ubaa8\ub4e0 \ubaa8\ud130 \ub044\uae30").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.bitbrick_turn_off_all_motors = function(b, a) {
  var c = Entry.hw.sendQueue, d = Entry.Bitbrick;
  d.servoList().map(function(a) {
    c[a[1]] = 0;
  });
  d.dcList().map(function(a) {
    c[a[1]] = 128;
  });
  return a.callReturn();
};
Blockly.Blocks.bitbrick_dc_speed = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("DC \ubaa8\ud130").appendField(new Blockly.FieldDropdownDynamic(Entry.Bitbrick.dcList), "PORT").appendField(" \uc18d\ub3c4");
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
  this.setInputsInline(!0);
}};
Entry.block.bitbrick_dc_speed = function(b, a) {
  var c = a.getNumberValue("VALUE"), c = Math.min(c, Entry.Bitbrick.dcMaxValue), c = Math.max(c, Entry.Bitbrick.dcMinValue);
  Entry.hw.sendQueue[a.getStringField("PORT")] = c + 128;
  return a.callReturn();
};
Blockly.Blocks.bitbrick_dc_direction_speed = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("DC \ubaa8\ud130").appendField(new Blockly.FieldDropdownDynamic(Entry.Bitbrick.dcList), "PORT").appendField(" ").appendField(new Blockly.FieldDropdown([[Lang.Blocks.BITBRICK_dc_direction_cw, "CW"], [Lang.Blocks.BITBRICK_dc_direction_ccw, "CCW"]]), "DIRECTION").appendField(" \ubc29\ud5a5").appendField(" \uc18d\ub825");
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
  this.setInputsInline(!0);
}};
Entry.block.bitbrick_dc_direction_speed = function(b, a) {
  var c = "CW" === a.getStringField("DIRECTION"), d = a.getNumberValue("VALUE"), d = Math.min(d, Entry.Bitbrick.dcMaxValue), d = Math.max(d, 0);
  Entry.hw.sendQueue[a.getStringField("PORT")] = c ? d + 128 : 128 - d;
  return a.callReturn();
};
Blockly.Blocks.bitbrick_servomotor_angle = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uc11c\ubcf4 \ubaa8\ud130").appendField(new Blockly.FieldDropdownDynamic(Entry.Bitbrick.servoList), "PORT").appendField(" \uac01\ub3c4");
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
  this.setInputsInline(!0);
}};
Entry.block.bitbrick_servomotor_angle = function(b, a) {
  var c = a.getNumberValue("VALUE") + 1, c = Math.min(c, Entry.Bitbrick.servoMaxValue), c = Math.max(c, Entry.Bitbrick.servoMinValue);
  Entry.hw.sendQueue[a.getStringField("PORT")] = c;
  return a.callReturn();
};
Blockly.Blocks.bitbrick_convert_scale = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\ubcc0\ud658");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdownDynamic(Entry.Bitbrick.sensorList), "PORT");
  this.appendDummyInput().appendField("\uac12");
  this.appendValueInput("VALUE2").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_convert_scale_3);
  this.appendValueInput("VALUE3").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField("\uc5d0\uc11c");
  this.appendValueInput("VALUE4").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_convert_scale_5);
  this.appendValueInput("VALUE5").setCheck(["Number", "String", null]);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.bitbrick_convert_scale = function(b, a) {
  var c = a.getNumberField("PORT"), d = Entry.hw.portData[c].value, c = a.getNumberValue("VALUE2", a), e = a.getNumberValue("VALUE3", a), f = a.getNumberValue("VALUE4", a), g = a.getNumberValue("VALUE5", a);
  if (f > g) {
    var h = f, f = g, g = h
  }
  d -= c;
  d *= (g - f) / (e - c);
  d += f;
  d = Math.min(g, d);
  d = Math.max(f, d);
  return Math.round(d);
};
var categoryColor = "#FF9E20";
Blockly.Blocks.start_drawing = {init:function() {
  this.setColour(categoryColor);
  this.appendDummyInput().appendField(Lang.Blocks.BRUSH_start_drawing).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/brush_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.start_drawing = function(b, a) {
  b.brush ? b.brush.stop = !1 : Entry.setBasicBrush(b);
  Entry.stage.sortZorder();
  b.brush.moveTo(b.getX(), -1 * b.getY());
  return a.callReturn();
};
Blockly.Blocks.stop_drawing = {init:function() {
  this.setColour(categoryColor);
  this.appendDummyInput().appendField(Lang.Blocks.BRUSH_stop_drawing).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/brush_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.stop_drawing = function(b, a) {
  b.brush && b.shape && (b.brush.stop = !0);
  return a.callReturn();
};
Blockly.Blocks.set_color = {init:function() {
  this.setColour(categoryColor);
  this.appendDummyInput().appendField(Lang.Blocks.BRUSH_set_color_1);
  this.appendDummyInput().appendField(new Blockly.FieldColour("#ff0000"), "VALUE");
  this.appendDummyInput().appendField(Lang.Blocks.BRUSH_set_color_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/brush_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.set_color = function(b, a) {
  var c = a.getField("VALUE", a);
  b.brush || (Entry.setBasicBrush(b), b.brush.stop = !0);
  b.brush && (c = Entry.hex2rgb(c), b.brush.rgb = c, b.brush.endStroke(), b.brush.beginStroke("rgba(" + c.r + "," + c.g + "," + c.b + "," + b.brush.opacity / 100 + ")"), b.brush.moveTo(b.getX(), -1 * b.getY()));
  return a.callReturn();
};
Blockly.Blocks.set_random_color = {init:function() {
  this.setColour(categoryColor);
  this.appendDummyInput().appendField(Lang.Blocks.BRUSH_set_random_color).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/brush_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.set_random_color = function(b, a) {
  b.brush || (Entry.setBasicBrush(b), b.brush.stop = !0);
  if (b.brush) {
    var c = Entry.generateRgb();
    b.brush.rgb = c;
    b.brush.endStroke();
    b.brush.beginStroke("rgba(" + c.r + "," + c.g + "," + c.b + "," + b.brush.opacity / 100 + ")");
    b.brush.moveTo(b.getX(), -1 * b.getY());
  }
  return a.callReturn();
};
Blockly.Blocks.change_thickness = {init:function() {
  this.setColour(categoryColor);
  this.appendDummyInput().appendField(Lang.Blocks.BRUSH_change_thickness_1);
  this.appendValueInput("VALUE").setCheck(["Number", "Boolean"]);
  this.appendDummyInput().appendField(Lang.Blocks.BRUSH_change_thickness_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/brush_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.change_thickness = function(b, a) {
  var c = a.getNumberValue("VALUE", a);
  b.brush || (Entry.setBasicBrush(b), b.brush.stop = !0);
  b.brush && (b.brush.thickness += c, 1 > b.brush.thickness && (b.brush.thickness = 1), b.brush.setStrokeStyle(b.brush.thickness), b.brush.moveTo(b.getX(), -1 * b.getY()));
  return a.callReturn();
};
Blockly.Blocks.set_thickness = {init:function() {
  this.setColour(categoryColor);
  this.appendDummyInput().appendField(Lang.Blocks.BRUSH_set_thickness_1);
  this.appendValueInput("VALUE").setCheck(["Number", "Boolean"]);
  this.appendDummyInput().appendField(Lang.Blocks.BRUSH_set_thickness_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/brush_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.set_thickness = function(b, a) {
  var c = a.getNumberValue("VALUE", a);
  b.brush || (Entry.setBasicBrush(b), b.brush.stop = !0);
  b.brush && (b.brush.thickness = c, b.brush.setStrokeStyle(b.brush.thickness), b.brush.moveTo(b.getX(), -1 * b.getY()));
  return a.callReturn();
};
Blockly.Blocks.change_opacity = {init:function() {
  this.setColour(categoryColor);
  this.appendDummyInput().appendField(Lang.Blocks.BRUSH_change_opacity_1);
  this.appendValueInput("VALUE").setCheck(["Number", "Boolean"]);
  this.appendDummyInput().appendField(Lang.Blocks.BRUSH_change_opacity_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/brush_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.change_opacity = function(b, a) {
  var c = a.getNumberValue("VALUE", a);
  b.brush || (Entry.setBasicBrush(b), b.brush.stop = !0);
  c = Entry.adjustValueWithMaxMin(b.brush.opacity + c, 0, 100);
  b.brush && (b.brush.opacity = c, b.brush.endStroke(), c = b.brush.rgb, b.brush.beginStroke("rgba(" + c.r + "," + c.g + "," + c.b + "," + b.brush.opacity / 100 + ")"), b.brush.moveTo(b.getX(), -1 * b.getY()));
  return a.callReturn();
};
Blockly.Blocks.set_opacity = {init:function() {
  this.setColour(categoryColor);
  this.appendDummyInput().appendField(Lang.Blocks.BRUSH_set_opacity_1);
  this.appendValueInput("VALUE").setCheck(["Number", "Boolean"]);
  this.appendDummyInput().appendField(Lang.Blocks.BRUSH_set_opacity_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/brush_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.set_opacity = function(b, a) {
  var c = a.getNumberValue("VALUE", a);
  b.brush || (Entry.setBasicBrush(b), b.brush.stop = !0);
  b.brush && (b.brush.opacity = Entry.adjustValueWithMaxMin(c, 0, 100), b.brush.endStroke(), c = b.brush.rgb, b.brush.beginStroke("rgba(" + c.r + "," + c.g + "," + c.b + "," + b.brush.opacity / 100 + ")"), b.brush.moveTo(b.getX(), -1 * b.getY()));
  return a.callReturn();
};
Blockly.Blocks.brush_erase_all = {init:function() {
  this.setColour(categoryColor);
  this.appendDummyInput().appendField(Lang.Blocks.BRUSH_brush_erase_all).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/brush_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.brush_erase_all = function(b, a) {
  var c = b.brush;
  if (c) {
    var d = c._stroke.style, e = c._strokeStyle.width;
    c.clear().setStrokeStyle(e).beginStroke(d);
    c.moveTo(b.getX(), -1 * b.getY());
  }
  c = b.parent.getStampEntities();
  c.map(function(a) {
    a.removeClone();
  });
  c = null;
  return a.callReturn();
};
Blockly.Blocks.brush_stamp = {init:function() {
  this.setColour(categoryColor);
  this.appendDummyInput().appendField(Lang.Blocks.BRUSH_stamp).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/brush_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.brush_stamp = function(b, a) {
  b.parent.addStampEntity(b);
  return a.callReturn();
};
Blockly.Blocks.change_brush_transparency = {init:function() {
  this.setColour(categoryColor);
  this.appendDummyInput().appendField(Lang.Blocks.BRUSH_change_brush_transparency_1);
  this.appendValueInput("VALUE").setCheck(["Number", "Boolean"]);
  this.appendDummyInput().appendField(Lang.Blocks.BRUSH_change_brush_transparency_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/brush_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.change_brush_transparency = function(b, a) {
  var c = a.getNumberValue("VALUE", a);
  b.brush || (Entry.setBasicBrush(b), b.brush.stop = !0);
  c = Entry.adjustValueWithMaxMin(b.brush.opacity - c, 0, 100);
  b.brush && (b.brush.opacity = c, b.brush.endStroke(), c = b.brush.rgb, b.brush.beginStroke("rgba(" + c.r + "," + c.g + "," + c.b + "," + b.brush.opacity / 100 + ")"), b.brush.moveTo(b.getX(), -1 * b.getY()));
  return a.callReturn();
};
Blockly.Blocks.set_brush_tranparency = {init:function() {
  this.setColour(categoryColor);
  this.appendDummyInput().appendField(Lang.Blocks.BRUSH_set_brush_transparency_1);
  this.appendValueInput("VALUE").setCheck(["Number", "Boolean"]);
  this.appendDummyInput().appendField(Lang.Blocks.BRUSH_set_brush_transparency_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/brush_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.set_brush_tranparency = function(b, a) {
  var c = a.getNumberValue("VALUE", a);
  b.brush || (Entry.setBasicBrush(b), b.brush.stop = !0);
  b.brush && (b.brush.opacity = Entry.adjustValueWithMaxMin(c, 0, 100), b.brush.endStroke(), c = b.brush.rgb, b.brush.beginStroke("rgba(" + c.r + "," + c.g + "," + c.b + "," + (1 - b.brush.opacity / 100) + ")"), b.brush.moveTo(b.getX(), -1 * b.getY()));
  return a.callReturn();
};
var calcArrowColor = "#e8b349", calcBlockColor = "#FFD974", calcFontColor = "#3D3D3D";
Blockly.Blocks.number = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(new Blockly.FieldTextInput(""), "NUM");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.number = function(b, a) {
  return a.fields.NUM;
};
Blockly.Blocks.angle = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(new Blockly.FieldAngle("90"), "ANGLE");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.angle = function(b, a) {
  return a.getNumberField("ANGLE");
};
Blockly.Blocks.get_x_coordinate = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_get_x_coordinate, calcFontColor);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.get_x_coordinate = function(b, a) {
  return b.getX();
};
Blockly.Blocks.get_y_coordinate = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_get_y_coordinate, calcFontColor);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.get_y_coordinate = function(b, a) {
  return b.getY();
};
Blockly.Blocks.get_angle = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_get_angle, calcFontColor);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.get_angle = function(b, a) {
  return parseFloat(b.getRotation().toFixed(1));
};
Blockly.Blocks.get_rotation_direction = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.CALC_rotation_value, "ROTATION"], [Lang.Blocks.CALC_direction_value, "DIRECTION"]], null, !0, calcArrowColor), "OPERATOR");
  this.appendDummyInput().appendField(" ");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.get_rotation_direction = function(b, a) {
  return "DIRECTION" == a.getField("OPERATOR", a).toUpperCase() ? parseFloat(b.getDirection().toFixed(1)) : parseFloat(b.getRotation().toFixed(1));
};
Blockly.Blocks.distance_something = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_distance_something_1, calcFontColor).appendField(new Blockly.FieldDropdownDynamic("spritesWithMouse", null, !0, calcArrowColor), "VALUE").appendField(Lang.Blocks.CALC_distance_something_2, calcFontColor);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.distance_something = function(b, a) {
  var c = a.getField("VALUE", a);
  if ("mouse" == c) {
    return c = Entry.stage.mouseCoordinate, Math.sqrt(Math.pow(b.getX() - c.x, 2) + Math.pow(b.getY() - c.y, 2));
  }
  c = Entry.container.getEntity(c);
  return Math.sqrt(Math.pow(b.getX() - c.getX(), 2) + Math.pow(b.getY() - c.getY(), 2));
};
Blockly.Blocks.coordinate_mouse = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_coordinate_mouse_1, calcFontColor).appendField(new Blockly.FieldDropdown([["x", "x"], ["y", "y"]], null, !0, calcArrowColor), "VALUE").appendField(Lang.Blocks.CALC_coordinate_mouse_2, calcFontColor);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.coordinate_mouse = function(b, a) {
  return "x" === a.getField("VALUE", a) ? Number(Entry.stage.mouseCoordinate.x) : Number(Entry.stage.mouseCoordinate.y);
};
Blockly.Blocks.coordinate_object = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_coordinate_object_1, calcFontColor).appendField(new Blockly.FieldDropdownDynamic("spritesWithSelf", null, !0, calcArrowColor), "VALUE").appendField(Lang.Blocks.CALC_coordinate_object_2, calcFontColor).appendField(new Blockly.FieldDropdown([[Lang.Blocks.CALC_coordinate_x_value, "x"], [Lang.Blocks.CALC_coordinate_y_value, "y"], [Lang.Blocks.CALC_coordinate_rotation_value, "rotation"], [Lang.Blocks.CALC_coordinate_direction_value, "direction"], 
  [Lang.Blocks.CALC_coordinate_size_value, "size"], [Lang.Blocks.CALC_picture_index, "picture_index"], [Lang.Blocks.CALC_picture_name, "picture_name"]], null, !0, calcArrowColor), "COORDINATE").appendField(Lang.Blocks.CALC_coordinate_object_3, calcFontColor);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.coordinate_object = function(b, a) {
  var c = a.getField("VALUE", a), c = "self" == c ? b : Entry.container.getEntity(c);
  switch(a.getField("COORDINATE", a)) {
    case "x":
      return c.getX();
    case "y":
      return c.getY();
    case "rotation":
      return c.getRotation();
    case "direction":
      return c.getDirection();
    case "picture_index":
      var d = c.parent, d = d.pictures;
      return d.indexOf(c.picture) + 1;
    case "size":
      return Number(c.getSize().toFixed(1));
    case "picture_name":
      return d = c.parent, d = d.pictures, d[d.indexOf(c.picture)].name;
  }
};
Blockly.Blocks.calc_basic = {init:function() {
  this.setColour(calcBlockColor);
  this.appendValueInput("LEFTHAND").setCheck(["String", "Number"]);
  this.appendDummyInput("VALUE").appendField(new Blockly.FieldDropdown([["+", "PLUS"], ["-", "MINUS"], ["x", "MULTI"], ["/", "DIVIDE"]], null, !1), "OPERATOR");
  this.appendValueInput("RIGHTHAND").setCheck(["Number", "String"]);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.calc_basic = function(b, a) {
  var c = a.getField("OPERATOR", a), d = a.getNumberValue("LEFTHAND", a), e = a.getNumberValue("RIGHTHAND", a);
  return "PLUS" == c ? d + e : "MINUS" == c ? d - e : "MULTI" == c ? d * e : d / e;
};
Blockly.Blocks.calc_plus = {init:function() {
  this.setColour(calcBlockColor);
  this.appendValueInput("LEFTHAND").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("+", calcFontColor);
  this.appendValueInput("RIGHTHAND").setCheck(["Number", "String"]);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.calc_plus = function(b, a) {
  var c = a.getNumberValue("LEFTHAND", a), d = a.getNumberValue("RIGHTHAND", a);
  return c + d;
};
Blockly.Blocks.calc_minus = {init:function() {
  this.setColour(calcBlockColor);
  this.appendValueInput("LEFTHAND").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("-", calcFontColor);
  this.appendValueInput("RIGHTHAND").setCheck(["Number", "String"]);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.calc_minus = function(b, a) {
  var c = a.getNumberValue("LEFTHAND", a), d = a.getNumberValue("RIGHTHAND", a);
  return c - d;
};
Blockly.Blocks.calc_times = {init:function() {
  this.setColour(calcBlockColor);
  this.appendValueInput("LEFTHAND").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("x", calcFontColor);
  this.appendValueInput("RIGHTHAND").setCheck(["Number", "String"]);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.calc_times = function(b, a) {
  var c = a.getNumberValue("LEFTHAND", a), d = a.getNumberValue("RIGHTHAND", a);
  return c * d;
};
Blockly.Blocks.calc_divide = {init:function() {
  this.setColour(calcBlockColor);
  this.appendValueInput("LEFTHAND").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("/", calcFontColor);
  this.appendValueInput("RIGHTHAND").setCheck(["Number", "String"]);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.calc_divide = function(b, a) {
  var c = a.getNumberValue("LEFTHAND", a), d = a.getNumberValue("RIGHTHAND", a);
  return c / d;
};
Blockly.Blocks.calc_mod = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_calc_mod_1, calcFontColor);
  this.appendValueInput("LEFTHAND").setCheck(["Number", "String"]);
  this.appendDummyInput("VALUE").appendField(Lang.Blocks.CALC_calc_mod_2, calcFontColor);
  this.appendValueInput("RIGHTHAND").setCheck(["Number", "String"]);
  this.setOutput(!0, "Number");
  this.appendDummyInput("VALUE").appendField(Lang.Blocks.CALC_calc_mod_3, calcFontColor);
  this.setInputsInline(!0);
}};
Entry.block.calc_mod = function(b, a) {
  var c = a.getNumberValue("LEFTHAND", a), d = a.getNumberValue("RIGHTHAND", a);
  return c % d;
};
Blockly.Blocks.calc_share = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_calc_share_1, calcFontColor);
  this.appendValueInput("LEFTHAND").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_calc_share_2, calcFontColor);
  this.appendValueInput("RIGHTHAND").setCheck(["Number", "String"]);
  this.setOutput(!0, "Number");
  this.appendDummyInput("VALUE").appendField(Lang.Blocks.CALC_calc_share_3, calcFontColor);
  this.setInputsInline(!0);
}};
Entry.block.calc_share = function(b, a) {
  var c = a.getNumberValue("LEFTHAND", a), d = a.getNumberValue("RIGHTHAND", a);
  return Math.floor(c / d);
};
Blockly.Blocks.calc_operation = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput("VALUE").appendField(Lang.Blocks.CALC_calc_operation_of_1, calcFontColor);
  this.appendValueInput("LEFTHAND").setCheck(["Number", "String"]);
  this.appendDummyInput("VALUE").appendField(Lang.Blocks.CALC_calc_operation_of_2, calcFontColor);
  this.appendDummyInput("VALUE").appendField(new Blockly.FieldDropdown([[Lang.Blocks.CALC_calc_operation_square, "square"], [Lang.Blocks.CALC_calc_operation_root, "root"], [Lang.Blocks.CALC_calc_operation_sin, "sin"], [Lang.Blocks.CALC_calc_operation_cos, "cos"], [Lang.Blocks.CALC_calc_operation_tan, "tan"], [Lang.Blocks.CALC_calc_operation_asin, "asin_radian"], [Lang.Blocks.CALC_calc_operation_acos, "acos_radian"], [Lang.Blocks.CALC_calc_operation_atan, "atan_radian"], [Lang.Blocks.CALC_calc_operation_log, 
  "log"], [Lang.Blocks.CALC_calc_operation_ln, "ln"], [Lang.Blocks.CALC_calc_operation_unnatural, "unnatural"], [Lang.Blocks.CALC_calc_operation_floor, "floor"], [Lang.Blocks.CALC_calc_operation_ceil, "ceil"], [Lang.Blocks.CALC_calc_operation_round, "round"], [Lang.Blocks.CALC_calc_operation_factorial, "factorial"], [Lang.Blocks.CALC_calc_operation_abs, "abs"]], null, !0, calcArrowColor), "VALUE");
  this.setOutput(!0, "Number");
  this.appendDummyInput().appendField(" ");
  this.setInputsInline(!0);
}};
Entry.block.calc_operation = function(b, a) {
  var c = a.getNumberValue("LEFTHAND", a), d = a.getField("VALUE", a);
  if (-1 < ["asin_radian", "acos_radian"].indexOf(d) && (1 < c || -1 > c)) {
    throw Error("x range exceeded");
  }
  d.indexOf("_") && (d = d.split("_")[0]);
  -1 < ["sin", "cos", "tan"].indexOf(d) && (c = Entry.toRadian(c));
  var e = 0;
  switch(d) {
    case "square":
      e = c * c;
      break;
    case "factorial":
      e = Entry.factorial(c);
      break;
    case "root":
      e = Math.sqrt(c);
      break;
    case "log":
      e = Math.log(c) / Math.LN10;
      break;
    case "ln":
      e = Math.log(c);
      break;
    case "asin":
    ;
    case "acos":
    ;
    case "atan":
      e = Entry.toDegrees(Math[d](c));
      break;
    case "unnatural":
      e = c - Math.floor(c);
      0 > c && (e = 1 - e);
      break;
    default:
      e = Math[d](c);
  }
  return Math.round(1E3 * e) / 1E3;
};
Blockly.Blocks.calc_rand = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_calc_rand_1, calcFontColor);
  this.appendValueInput("LEFTHAND").setCheck(["Number", "String"]);
  this.appendDummyInput("VALUE").appendField(Lang.Blocks.CALC_calc_rand_2, calcFontColor);
  this.appendValueInput("RIGHTHAND").setCheck(["Number", "String"]);
  this.setOutput(!0, "Number");
  this.appendDummyInput("VALUE").appendField(Lang.Blocks.CALC_calc_rand_3, calcFontColor);
  this.setInputsInline(!0);
}};
Entry.block.calc_rand = function(b, a) {
  var c = a.getStringValue("LEFTHAND", a), d = a.getStringValue("RIGHTHAND", a), e = Math.min(c, d), f = Math.max(c, d), c = Entry.isFloat(c);
  return Entry.isFloat(d) || c ? (Math.random() * (f - e) + e).toFixed(2) : Math.floor(Math.random() * (f - e + 1) + e);
};
Blockly.Blocks.get_date = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_get_date_1, calcFontColor).appendField(new Blockly.FieldDropdown([[Lang.Blocks.CALC_get_date_year, "YEAR"], [Lang.Blocks.CALC_get_date_month, "MONTH"], [Lang.Blocks.CALC_get_date_day, "DAY"], [Lang.Blocks.CALC_get_date_hour, "HOUR"], [Lang.Blocks.CALC_get_date_minute, "MINUTE"], [Lang.Blocks.CALC_get_date_second, "SECOND"]], null, !0, calcArrowColor), "VALUE");
  this.appendDummyInput().appendField(" ").appendField(Lang.Blocks.CALC_get_date_2, calcFontColor);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.get_date = function(b, a) {
  var c = a.getField("VALUE", a), d = new Date;
  return "YEAR" == c ? d.getFullYear() : "MONTH" == c ? d.getMonth() + 1 : "DAY" == c ? d.getDate() : "HOUR" == c ? d.getHours() : "MINUTE" == c ? d.getMinutes() : d.getSeconds();
};
Blockly.Blocks.get_sound_duration = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_get_sound_duration_1, calcFontColor);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("sounds", null, !0, calcArrowColor), "VALUE");
  this.appendDummyInput().appendField(Lang.Blocks.CALC_get_sound_duration_2, calcFontColor);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.get_sound_duration = function(b, a) {
  for (var c = a.getField("VALUE", a), d = b.parent.sounds, e = 0;e < d.length;e++) {
    if (d[e].id == c) {
      return d[e].duration;
    }
  }
};
Blockly.Blocks.reset_project_timer = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_timer_reset, calcFontColor);
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, whenAdd:function() {
  Entry.engine.showProjectTimer();
}, whenRemove:function(b) {
  Entry.engine.hideProjectTimer(b);
}};
Entry.block.reset_project_timer = function(b, a) {
  Entry.engine.updateProjectTimer(0);
  return a.callReturn();
};
Blockly.Blocks.set_visible_project_timer = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_timer_visible_1, calcFontColor);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.CALC_timer_visible_show, "SHOW"], [Lang.Blocks.CALC_timer_visible_hide, "HIDE"]], null, !0, calcArrowColor), "ACTION");
  this.appendDummyInput().appendField(Lang.Blocks.CALC_timer_visible_2, calcFontColor).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/calc_01.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, whenAdd:function() {
  Entry.engine.showProjectTimer();
}, whenRemove:function(b) {
  Entry.engine.hideProjectTimer(b);
}};
Entry.block.set_visible_project_timer = function(b, a) {
  var c = a.getField("ACTION", a), d = Entry.engine.projectTimer;
  "SHOW" == c ? d.setVisible(!0) : d.setVisible(!1);
  return a.callReturn();
};
Blockly.Blocks.timer_variable = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_get_timer_value, calcFontColor).appendField(" ", calcFontColor);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.timer_variable = function(b, a) {
  return Entry.container.inputValue.getValue();
};
Blockly.Blocks.get_project_timer_value = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_get_timer_value, calcFontColor).appendField(" ", calcFontColor);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}, whenAdd:function() {
  Entry.engine.showProjectTimer();
}, whenRemove:function(b) {
  Entry.engine.hideProjectTimer(b);
}};
Entry.block.get_project_timer_value = function(b, a) {
  return Entry.engine.projectTimer.getValue();
};
Blockly.Blocks.char_at = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_char_at_1, calcFontColor);
  this.appendValueInput("LEFTHAND").setCheck(["Number", "String"]);
  this.appendDummyInput("VALUE").appendField(Lang.Blocks.CALC_char_at_2, calcFontColor);
  this.appendValueInput("RIGHTHAND").setCheck(["Number", "String"]);
  this.setOutput(!0, "Number");
  this.appendDummyInput("VALUE").appendField(Lang.Blocks.CALC_char_at_3, calcFontColor);
  this.setInputsInline(!0);
}};
Entry.block.char_at = function(b, a) {
  var c = a.getStringValue("LEFTHAND", a), d = a.getNumberValue("RIGHTHAND", a) - 1;
  if (0 > d || d > c.length - 1) {
    throw Error();
  }
  return c[d];
};
Blockly.Blocks.length_of_string = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_length_of_string_1, calcFontColor);
  this.appendValueInput("STRING").setCheck(["Number", "String"]);
  this.appendDummyInput("VALUE").appendField(Lang.Blocks.CALC_length_of_string_2, calcFontColor);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.length_of_string = function(b, a) {
  return a.getStringValue("STRING", a).length;
};
Blockly.Blocks.substring = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_substring_1, calcFontColor);
  this.appendValueInput("STRING").setCheck(["Number", "String"]);
  this.appendDummyInput("VALUE").appendField(Lang.Blocks.CALC_substring_2, calcFontColor);
  this.appendValueInput("START").setCheck(["Number", "String"]);
  this.appendDummyInput("VALUE").appendField(Lang.Blocks.CALC_substring_3, calcFontColor);
  this.appendValueInput("END").setCheck(["Number", "String"]);
  this.appendDummyInput("VALUE").appendField(Lang.Blocks.CALC_substring_4, calcFontColor);
  this.setOutput(!0, "String");
  this.setInputsInline(!0);
}};
Entry.block.substring = function(b, a) {
  var c = a.getStringValue("STRING", a), d = a.getNumberValue("START", a) - 1, e = a.getNumberValue("END", a) - 1, f = c.length - 1;
  if (0 > d || 0 > e || d > f || e > f) {
    throw Error();
  }
  return c.substring(Math.min(d, e), Math.max(d, e) + 1);
};
Blockly.Blocks.replace_string = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_replace_string_1, calcFontColor);
  this.appendValueInput("STRING").setCheck(["Number", "String"]);
  this.appendDummyInput("VALUE").appendField(Lang.Blocks.CALC_replace_string_2, calcFontColor);
  this.appendValueInput("OLD_WORD").setCheck(["Number", "String"]);
  this.appendDummyInput("VALUE").appendField(Lang.Blocks.CALC_replace_string_3, calcFontColor);
  this.appendValueInput("NEW_WORD").setCheck(["Number", "String"]);
  this.appendDummyInput("VALUE").appendField(Lang.Blocks.CALC_replace_string_4, calcFontColor);
  this.setOutput(!0, "String");
  this.setInputsInline(!0);
}};
Entry.block.replace_string = function(b, a) {
  return a.getStringValue("STRING", a).replace(new RegExp(a.getStringValue("OLD_WORD", a), "gm"), a.getStringValue("NEW_WORD", a));
};
Blockly.Blocks.change_string_case = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_change_string_case_1, calcFontColor);
  this.appendValueInput("STRING").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_change_string_case_2, calcFontColor);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.CALC_change_string_case_sub_1, "toUpperCase"], [Lang.Blocks.CALC_change_string_case_sub_2, "toLowerCase"]], null, !0, calcArrowColor), "CASE");
  this.appendDummyInput().appendField(Lang.Blocks.CALC_change_string_case_3, calcFontColor);
  this.setOutput(!0, "String");
  this.setInputsInline(!0);
}};
Entry.block.change_string_case = function(b, a) {
  return a.getStringValue("STRING", a)[a.getField("CASE", a)]();
};
Blockly.Blocks.index_of_string = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_index_of_string_1, calcFontColor);
  this.appendValueInput("LEFTHAND").setCheck(["Number", "String"]);
  this.appendDummyInput("VALUE").appendField(Lang.Blocks.CALC_index_of_string_2, calcFontColor);
  this.appendValueInput("RIGHTHAND").setCheck(["Number", "String"]);
  this.setOutput(!0, "Number");
  this.appendDummyInput("VALUE").appendField(Lang.Blocks.CALC_index_of_string_3, calcFontColor);
  this.setInputsInline(!0);
}};
Entry.block.index_of_string = function(b, a) {
  var c = a.getStringValue("LEFTHAND", a), d = a.getStringValue("RIGHTHAND", a), c = c.indexOf(d);
  return -1 < c ? c + 1 : 0;
};
Blockly.Blocks.combine_something = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_combine_something_1, calcFontColor);
  this.appendValueInput("VALUE1").setCheck(["String", "Number", null]);
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_combine_something_2, calcFontColor);
  this.appendValueInput("VALUE2").setCheck(["String", "Number", null]);
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_combine_something_3, calcFontColor);
  this.setInputsInline(!0);
  this.setOutput(!0, "String");
}};
Entry.block.combine_something = function(b, a) {
  var c = a.getStringValue("VALUE1", a), d = a.getStringValue("VALUE2", a);
  return c + d;
};
Blockly.Blocks.get_sound_volume = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_get_sound_volume, calcFontColor).appendField(" ", calcFontColor);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.get_sound_volume = function(b, a) {
  return 100 * createjs.Sound.getVolume();
};
Blockly.Blocks.quotient_and_mod = {init:function() {
  this.setColour(calcBlockColor);
  "ko" == Lang.type ? (this.appendDummyInput().appendField(Lang.Blocks.CALC_quotient_and_mod_1, calcFontColor), this.appendValueInput("LEFTHAND").setCheck(["Number", "String"]), this.appendDummyInput().appendField(Lang.Blocks.CALC_quotient_and_mod_2, calcFontColor), this.appendValueInput("RIGHTHAND").setCheck(["Number", "String"]), this.appendDummyInput().appendField(Lang.Blocks.CALC_quotient_and_mod_3, calcFontColor).appendField(new Blockly.FieldDropdown([[Lang.Blocks.CALC_quotient_and_mod_sub_1, 
  "QUOTIENT"], [Lang.Blocks.CALC_quotient_and_mod_sub_2, "MOD"]], null, !0, calcArrowColor), "OPERATOR")) : "en" == Lang.type && (this.appendDummyInput().appendField(Lang.Blocks.CALC_quotient_and_mod_1, calcFontColor).appendField(new Blockly.FieldDropdown([[Lang.Blocks.CALC_quotient_and_mod_sub_1, "QUOTIENT"], [Lang.Blocks.CALC_quotient_and_mod_sub_2, "MOD"]], null, !0, calcArrowColor), "OPERATOR"), this.appendDummyInput().appendField(Lang.Blocks.CALC_quotient_and_mod_2, calcFontColor), this.appendValueInput("LEFTHAND").setCheck(["Number", 
  "String"]), this.appendDummyInput().appendField(Lang.Blocks.CALC_quotient_and_mod_3, calcFontColor), this.appendValueInput("RIGHTHAND").setCheck(["Number", "String"]));
  this.appendDummyInput().appendField(Lang.Blocks.CALC_quotient_and_mod_4, calcFontColor);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.quotient_and_mod = function(b, a) {
  var c = a.getNumberValue("LEFTHAND", a), d = a.getNumberValue("RIGHTHAND", a);
  if (isNaN(c) || isNaN(d)) {
    throw Error();
  }
  return "QUOTIENT" == a.getField("OPERATOR", a) ? Math.floor(c / d) : c % d;
};
Blockly.Blocks.choose_project_timer_action = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_choose_project_timer_action_1, calcFontColor).appendField(new Blockly.FieldDropdown([[Lang.Blocks.CALC_choose_project_timer_action_sub_1, "START"], [Lang.Blocks.CALC_choose_project_timer_action_sub_2, "STOP"], [Lang.Blocks.CALC_choose_project_timer_action_sub_3, "RESET"]], null, !0, calcArrowColor), "ACTION").appendField(Lang.Blocks.CALC_choose_project_timer_action_2, calcFontColor).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/calc_01.png", 
  "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, whenAdd:function() {
  Entry.engine.showProjectTimer();
}, whenRemove:function(b) {
  Entry.engine.hideProjectTimer(b);
}};
Entry.block.choose_project_timer_action = function(b, a) {
  var c = a.getField("ACTION"), d = Entry.engine, e = d.projectTimer;
  "START" == c ? e.isInit ? e.isInit && e.isPaused && (e.pauseStart && (e.pausedTime += (new Date).getTime() - e.pauseStart), delete e.pauseStart, e.isPaused = !1) : d.startProjectTimer() : "STOP" == c ? e.isInit && !e.isPaused && (e.isPaused = !0, e.pauseStart = (new Date).getTime()) : "RESET" == c && e.isInit && (e.setValue(0), e.start = (new Date).getTime(), e.pausedTime = 0, delete e.pauseStart);
  return a.callReturn();
};
Blockly.Blocks.wait_second = {init:function() {
  this.setColour("#498deb");
  this.appendDummyInput().appendField(Lang.Blocks.FLOW_wait_second_1);
  this.appendValueInput("SECOND").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.FLOW_wait_second_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/flow_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.wait_second = function(b, a) {
  if (a.isStart) {
    if (1 == a.timeFlag) {
      return a;
    }
    delete a.timeFlag;
    delete a.isStart;
    Entry.engine.isContinue = !1;
    return a.callReturn();
  }
  a.isStart = !0;
  a.timeFlag = 1;
  var c = a.getNumberValue("SECOND", a);
  setTimeout(function() {
    a.timeFlag = 0;
  }, 60 / (Entry.FPS || 60) * c * 1E3);
  return a;
};
Blockly.Blocks.repeat_basic = {init:function() {
  this.setColour("#498deb");
  this.appendDummyInput().appendField(Lang.Blocks.FLOW_repeat_basic_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.FLOW_repeat_basic_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/flow_03.png", "*"));
  this.appendStatementInput("DO");
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.repeat_basic = function(b, a) {
  var c;
  if (!a.isLooped) {
    a.isLooped = !0;
    c = a.getNumberValue("VALUE", a);
    if (0 > c) {
      throw Error(Lang.Blocks.FLOW_repeat_basic_errorMsg);
    }
    a.iterCount = Math.floor(c);
  }
  if (0 == a.iterCount || 0 > a.iterCount) {
    return delete a.isLooped, delete a.iterCount, a.callReturn();
  }
  a.iterCount--;
  return a.getStatement("DO", a);
};
Blockly.Blocks.repeat_inf = {init:function() {
  this.setColour("#498deb");
  this.appendDummyInput().appendField(Lang.Blocks.FLOW_repeat_inf).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/flow_03.png", "*"));
  this.appendStatementInput("DO");
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.repeat_inf = function(b, a) {
  a.isLooped = !0;
  return a.getStatement("DO");
};
Blockly.Blocks.stop_repeat = {init:function() {
  this.setColour("#498deb");
  this.appendDummyInput().appendField(Lang.Blocks.FLOW_stop_repeat).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/flow_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.stop_repeat = function(b, a) {
  for (var c = a;"REPEAT" != c.type.substr(0, 6).toUpperCase() && c.parentScript;) {
    c = c.parentScript, delete c.isLooped, delete c.iterCount;
  }
  var d = c.callReturn();
  return c.statements && d ? d : c ? null : a.callReturn();
};
Blockly.Blocks.wait_until_true = {init:function() {
  this.setColour("#498deb");
  this.appendDummyInput().appendField(Lang.Blocks.FLOW_wait_until_true_1);
  this.appendValueInput("BOOL").setCheck("Boolean");
  this.appendDummyInput().appendField(Lang.Blocks.FLOW_wait_until_true_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/flow_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.wait_until_true = function(b, a) {
  return a.getBooleanValue("BOOL", a) ? a.callReturn() : a;
};
Blockly.Blocks._if = {init:function() {
  this.setColour("#498deb");
  this.appendDummyInput().appendField(Lang.Blocks.FLOW__if_1);
  this.appendValueInput("BOOL").setCheck("Boolean");
  this.appendDummyInput().appendField(Lang.Blocks.FLOW__if_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/flow_03.png", "*"));
  this.appendStatementInput("STACK");
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block._if = function(b, a) {
  return a.isLooped ? (delete a.isLooped, a.callReturn()) : a.getBooleanValue("BOOL", a) ? (a.isLooped = !0, a.getStatement("STACK", a)) : a.callReturn();
};
Blockly.Blocks.if_else = {init:function() {
  this.setColour("#498deb");
  this.appendDummyInput().appendField(Lang.Blocks.FLOW_if_else_1);
  this.appendValueInput("BOOL").setCheck("Boolean");
  this.appendDummyInput().appendField(Lang.Blocks.FLOW_if_else_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/flow_03.png", "*"));
  this.appendStatementInput("STACK_IF");
  this.appendDummyInput().appendField(Lang.Blocks.FLOW_if_else_3);
  this.appendStatementInput("STACK_ELSE");
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.if_else = function(b, a) {
  if (a.isLooped) {
    return delete a.isLooped, a.callReturn();
  }
  var c = a.getBooleanValue("BOOL", a);
  a.isLooped = !0;
  return c ? a.getStatement("STACK_IF", a) : a.getStatement("STACK_ELSE", a);
};
Blockly.Blocks.create_clone = {init:function() {
  this.setColour("#498deb");
  this.appendDummyInput().appendField(Lang.Blocks.FLOW_create_clone_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("clone"), "VALUE");
  this.appendDummyInput().appendField(Lang.Blocks.FLOW_create_clone_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/flow_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.create_clone = function(b, a) {
  var c = a.getField("VALUE", a), d = a.callReturn();
  "self" == c ? b.parent.addCloneEntity(b.parent, b, null) : Entry.container.getObject(c).addCloneEntity(b.parent, null, null);
  return d;
};
Blockly.Blocks.delete_clone = {init:function() {
  this.setColour("#498deb");
  this.appendDummyInput().appendField(Lang.Blocks.FLOW_delete_clone).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/flow_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
}};
Entry.block.delete_clone = function(b, a) {
  if (!b.isClone) {
    return a.callReturn();
  }
  b.removeClone();
};
Blockly.Blocks.when_clone_start = {init:function() {
  this.setColour("#498deb");
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/start_icon_clone.png", "*", "start")).appendField(Lang.Blocks.FLOW_when_clone_start);
  this.setInputsInline(!0);
  this.setNextStatement(!0);
}};
Entry.block.when_clone_start = function(b, a) {
  return a.callReturn();
};
Blockly.Blocks.stop_run = {init:function() {
  this.setColour("#498deb");
  this.appendDummyInput().appendField(Lang.Blocks.FLOW_stop_run).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/flow_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.stop_run = function(b, a) {
  return Entry.engine.toggleStop();
};
Blockly.Blocks.repeat_while_true = {init:function() {
  this.setColour("#498deb");
  "ko" == Lang.type ? (this.appendDummyInput().appendField(Lang.Blocks.FLOW_repeat_while_true_1), this.appendValueInput("BOOL").setCheck("Boolean"), this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.FLOW_repeat_while_true_until, "until"], [Lang.Blocks.FLOW_repeat_while_true_while, "while"]]), "OPTION").appendField(Lang.Blocks.FLOW_repeat_while_true_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/flow_03.png", "*"))) : (this.appendDummyInput().appendField(Lang.Blocks.FLOW_repeat_while_true_1), 
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.FLOW_repeat_while_true_until, "until"], [Lang.Blocks.FLOW_repeat_while_true_while, "while"]]), "OPTION"), this.appendValueInput("BOOL").setCheck("Boolean"), this.appendDummyInput().appendField(Lang.Blocks.FLOW_repeat_while_true_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/flow_03.png", "*")));
  this.appendStatementInput("DO");
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.repeat_while_true = function(b, a) {
  var c = a.getBooleanValue("BOOL", a);
  "until" == a.getField("OPTION", a) && (c = !c);
  return (a.isLooped = c) ? a.getStatement("DO", a) : a.callReturn();
};
Blockly.Blocks.stop_object = {init:function() {
  this.setColour("#498deb");
  this.appendDummyInput().appendField(Lang.Blocks.FLOW_stop_object_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.FLOW_stop_object_all, "all"], [Lang.Blocks.FLOW_stop_object_this_object, "thisOnly"], [Lang.Blocks.FLOW_stop_object_this_thread, "thisThread"], [Lang.Blocks.FLOW_stop_object_other_thread, "otherThread"]]), "TARGET");
  this.appendDummyInput().appendField(Lang.Blocks.FLOW_stop_object_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/flow_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.stop_object = function(b, a) {
  var c = a.getField("TARGET", a), d = Entry.container;
  switch(c) {
    case "all":
      d.mapEntityIncludeCloneOnScene(function(a) {
        a.clearScript();
      });
      break;
    case "thisObject":
      b.clearScript();
      c = b.parent.clonedEntities;
      c.map(function(a) {
        a.clearScript();
      });
      break;
    case "thisOnly":
      b.clearScript();
      break;
    case "otherThread":
      return b.clearScript(), c = b.parent.clonedEntities, c.map(function(a) {
        a.clearScript();
      }), a.callReturn();
  }
  return null;
};
Blockly.Blocks.restart_project = {init:function() {
  this.setColour("#498deb");
  this.appendDummyInput().appendField(Lang.Blocks.FLOW_restart).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/flow_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
}};
Entry.block.restart_project = function(b, a) {
  Entry.engine.toggleStop();
  Entry.engine.toggleRun();
};
Blockly.Blocks.remove_all_clones = {init:function() {
  this.setColour("#498deb");
  this.appendDummyInput().appendField(Lang.Blocks.FLOW_delete_clone_all).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/flow_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.remove_all_clones = function(b, a) {
  var c = b.parent.getClonedEntities();
  c.map(function(a) {
    a.removeClone();
  });
  c = null;
  return a.callReturn();
};
Blockly.Blocks.function_field_label = {init:function() {
  this.setColour("#f9c535");
  this.appendDummyInput().appendField(new Blockly.FieldTextInput(Lang.Blocks.FUNCTION_explanation_1), "NAME");
  this.appendValueInput("NEXT").setCheck(["Param"]);
  this.setOutput(!0, "Param");
  this.setInputsInline(!0);
}};
Blockly.Blocks.function_field_string = {init:function() {
  this.setColour("#FFD974");
  this.appendValueInput("PARAM").setCheck(["String"]);
  this.appendValueInput("NEXT").setCheck(["Param"]);
  this.setOutput(!0, "Param");
  this.setInputsInline(!0);
}};
Blockly.Blocks.function_field_boolean = {init:function() {
  this.setColour("#AEB8FF");
  this.appendValueInput("PARAM").setCheck(["Boolean"]);
  this.appendValueInput("NEXT").setCheck(["Param"]);
  this.setOutput(!0, "Param");
  this.setInputsInline(!0);
}};
Blockly.Blocks.function_param_string = {init:function() {
  this.setEditable(!1);
  this.setColour("#FFD974");
  this.setOutput(!0, ["String", "Number"]);
  this.setInputsInline(!0);
}, domToMutation:function(b) {
  b.getElementsByTagName("field");
  this.hashId = b.getAttribute("hashid");
  (b = Entry.Func.targetFunc.stringHash[this.hashId]) || (b = "");
  this.appendDummyInput().appendField(new Blockly.FieldTextInput(Lang.Blocks.FUNCTION_character_variable + b), "");
}, mutationToDom:function() {
  var b = document.createElement("mutation");
  b.setAttribute("hashid", this.hashId);
  return b;
}};
Entry.block.function_param_string = function(b, a, c) {
  return a.register[a.hashId].run();
};
Blockly.Blocks.function_param_boolean = {init:function() {
  this.setEditable(!1);
  this.setColour("#AEB8FF");
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}, domToMutation:function(b) {
  b.getElementsByTagName("field");
  this.hashId = b.getAttribute("hashid");
  (b = Entry.Func.targetFunc.booleanHash[this.hashId]) || (b = "");
  this.appendDummyInput().appendField(new Blockly.FieldTextInput(Lang.Blocks.FUNCTION_logical_variable + b), "");
}, mutationToDom:function() {
  var b = document.createElement("mutation");
  b.setAttribute("hashid", this.hashId);
  return b;
}};
Entry.block.function_param_boolean = function(b, a, c) {
  return a.register[a.hashId].run();
};
Blockly.Blocks.function_create = {init:function() {
  this.appendDummyInput().appendField(Lang.Blocks.FUNCTION_define);
  this.setColour("#cc7337");
  this.appendValueInput("FIELD").setCheck(["Param"]);
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/function_03.png", "*"));
  this.setInputsInline(!0);
  this.setNextStatement(!0);
}};
Entry.block.function_create = function(b, a) {
  return a.callReturn();
};
Blockly.Blocks.function_general = {init:function() {
  this.setColour("#cc7337");
  this.setInputsInline(!0);
  this.setNextStatement(!0);
  this.setPreviousStatement(!0);
}, domToMutation:function(b) {
  var a = b.getElementsByTagName("field");
  this.appendDummyInput().appendField("");
  a.length || this.appendDummyInput().appendField(Lang.Blocks.FUNCTION_function);
  for (var c = 0;c < a.length;c++) {
    var d = a[c], e = d.getAttribute("hashid");
    switch(d.getAttribute("type").toLowerCase()) {
      case "label":
        this.appendDummyInput().appendField(d.getAttribute("content"));
        break;
      case "string":
        this.appendValueInput(e).setCheck(["String", "Number"]);
        break;
      case "boolean":
        this.appendValueInput(e).setCheck(["Boolean"]);
    }
  }
  this.hashId = b.getAttribute("hashid");
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/function_03.png", "*"));
}, mutationToDom:function() {
  for (var b = document.createElement("mutation"), a = 1;a < this.inputList.length;a++) {
    var c = this.inputList[a];
    if (c.fieldRow[0] && c.fieldRow[0] instanceof Blockly.FieldLabel) {
      var c = c.fieldRow[0], d = document.createElement("field");
      d.setAttribute("type", "label");
      d.setAttribute("content", c.text_);
    } else {
      c.connection && "String" == c.connection.check_[0] ? (d = document.createElement("field"), d.setAttribute("type", "string"), d.setAttribute("hashid", c.name)) : c.connection && "Boolean" == c.connection.check_[0] && (d = document.createElement("field"), d.setAttribute("type", "boolean"), d.setAttribute("hashid", c.name));
    }
    b.appendChild(d);
  }
  b.setAttribute("hashid", this.hashId);
  return b;
}};
Entry.block.function_general = function(b, a) {
  if (!a.thread) {
    var c = Entry.variableContainer.getFunction(a.hashId);
    a.thread = new Entry.Script(b);
    a.thread.register = a.values;
    for (var d = 0;d < c.content.childNodes.length;d++) {
      "function_create" == c.content.childNodes[d].getAttribute("type") && a.thread.init(c.content.childNodes[d]);
    }
  }
  if (c = Entry.Engine.computeThread(b, a.thread)) {
    return a.thread = c, a;
  }
  delete a.thread;
  return a.callReturn();
};
Entry.Hamster = {PORT_MAP:{leftWheel:0, rightWheel:0, buzzer:0, outputA:0, outputB:0, leftLed:0, rightLed:0, note:0, lineTracerMode:0, lineTracerModeId:0, lineTracerSpeed:5, ioModeA:0, ioModeB:0}, setZero:function() {
  var b = Entry.Hamster.PORT_MAP, a = Entry.hw.sendQueue, c;
  for (c in b) {
    a[c] = b[c];
  }
  Entry.hw.update();
  b = Entry.Hamster;
  b.lineTracerModeId = 0;
  b.lineTracerStateId = -1;
  b.tempo = 60;
  b.removeAllTimeouts();
}, lineTracerModeId:0, lineTracerStateId:-1, tempo:60, timeouts:[], removeTimeout:function(b) {
  clearTimeout(b);
  var a = this.timeouts;
  b = a.indexOf(b);
  0 <= b && a.splice(b, 1);
}, removeAllTimeouts:function() {
  var b = this.timeouts, a;
  for (a in b) {
    clearTimeout(b[a]);
  }
  this.timeouts = [];
}, setLineTracerMode:function(b, a) {
  this.lineTracerModeId = this.lineTracerModeId + 1 & 255;
  b.lineTracerMode = a;
  b.lineTracerModeId = this.lineTracerModeId;
}, name:"hamster", monitorTemplate:{imgPath:"hw/hamster.png", width:256, height:256, listPorts:{temperature:{name:Lang.Blocks.HAMSTER_sensor_temperature, type:"input", pos:{x:0, y:0}}, accelerationX:{name:Lang.Blocks.HAMSTER_sensor_accelerationX, type:"input", pos:{x:0, y:0}}, accelerationY:{name:Lang.Blocks.HAMSTER_sensor_accelerationY, type:"input", pos:{x:0, y:0}}, accelerationZ:{name:Lang.Blocks.HAMSTER_sensor_accelerationZ, type:"input", pos:{x:0, y:0}}, buzzer:{name:Lang.Hw.buzzer, type:"output", 
pos:{x:0, y:0}}, note:{name:Lang.Hw.buzzer + "2", type:"output", pos:{x:0, y:0}}, outputA:{name:Lang.Hw.output + "A", type:"output", pos:{x:0, y:0}}, outputB:{name:Lang.Hw.output + "B", type:"output", pos:{x:0, y:0}}}, ports:{leftProximity:{name:Lang.Blocks.HAMSTER_sensor_leftProximity, type:"input", pos:{x:122, y:156}}, rightProximity:{name:Lang.Blocks.HAMSTER_sensor_rightProximity, type:"input", pos:{x:10, y:108}}, leftFloor:{name:Lang.Blocks.HAMSTER_sensor_leftFloor, type:"input", pos:{x:100, 
y:234}}, rightFloor:{name:Lang.Blocks.HAMSTER_sensor_rightFloor, type:"input", pos:{x:13, y:180}}, lightsensor:{name:Lang.Hw.light + Lang.Hw.sensor, type:"input", pos:{x:56, y:189}}, leftWheel:{name:Lang.Hw.leftWheel, type:"output", pos:{x:209, y:115}}, rightWheel:{name:Lang.Hw.rightWheel, type:"output", pos:{x:98, y:30}}, leftLed:{name:Lang.Hw.left + " " + Lang.Hw.led, type:"output", pos:{x:87, y:210}}, rightLed:{name:Lang.Hw.right + " " + Lang.Hw.led, type:"output", pos:{x:24, y:168}}}, mode:"both"}};
Blockly.Blocks.hamster_hand_found = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_hand_found);
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}};
Entry.block.hamster_hand_found = function(b, a) {
  var c = Entry.hw.portData;
  return 50 < c.leftProximity || 50 < c.rightProximity;
};
Blockly.Blocks.hamster_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdown([[Lang.Blocks.HAMSTER_sensor_leftProximity, "leftProximity"], [Lang.Blocks.HAMSTER_sensor_rightProximity, "rightProximity"], [Lang.Blocks.HAMSTER_sensor_leftFloor, "leftFloor"], [Lang.Blocks.HAMSTER_sensor_rightFloor, "rightFloor"], [Lang.Blocks.HAMSTER_sensor_accelerationX, "accelerationX"], [Lang.Blocks.HAMSTER_sensor_accelerationY, "accelerationY"], [Lang.Blocks.HAMSTER_sensor_accelerationZ, "accelerationZ"], [Lang.Blocks.HAMSTER_sensor_light, 
  "light"], [Lang.Blocks.HAMSTER_sensor_temperature, "temperature"], [Lang.Blocks.HAMSTER_sensor_signalStrength, "signalStrength"], [Lang.Blocks.HAMSTER_sensor_inputA, "inputA"], [Lang.Blocks.HAMSTER_sensor_inputB, "inputB"]]), "DEVICE");
  this.setInputsInline(!0);
  this.setOutput(!0, "Number");
}};
Entry.block.hamster_value = function(b, a) {
  var c = Entry.hw.portData, d = a.getField("DEVICE");
  return c[d];
};
Blockly.Blocks.hamster_move_forward_once = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_move_forward_once).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_move_forward_once = function(b, a) {
  var c = Entry.hw.sendQueue, d = Entry.hw.portData;
  if (a.isStart) {
    if (a.isMoving) {
      switch(a.boardState) {
        case 1:
          2 > a.count ? (50 > d.leftFloor && 50 > d.rightFloor ? a.count++ : a.count = 0, d = d.leftFloor - d.rightFloor, c.leftWheel = 45 + .25 * d, c.rightWheel = 45 - .25 * d) : (a.count = 0, a.boardState = 2);
          break;
        case 2:
          d = d.leftFloor - d.rightFloor;
          c.leftWheel = 45 + .25 * d;
          c.rightWheel = 45 - .25 * d;
          a.boardState = 3;
          var e = setTimeout(function() {
            a.boardState = 4;
            Entry.Hamster.removeTimeout(e);
          }, 250);
          Entry.Hamster.timeouts.push(e);
          break;
        case 3:
          d = d.leftFloor - d.rightFloor;
          c.leftWheel = 45 + .25 * d;
          c.rightWheel = 45 - .25 * d;
          break;
        case 4:
          c.leftWheel = 0, c.rightWheel = 0, a.boardState = 0, a.isMoving = !1;
      }
      return a;
    }
    delete a.isStart;
    delete a.isMoving;
    delete a.count;
    delete a.boardState;
    Entry.engine.isContinue = !1;
    c.leftWheel = 0;
    c.rightWheel = 0;
    return a.callReturn();
  }
  a.isStart = !0;
  a.isMoving = !0;
  a.count = 0;
  a.boardState = 1;
  c.leftWheel = 45;
  c.rightWheel = 45;
  Entry.Hamster.setLineTracerMode(c, 0);
  return a;
};
Blockly.Blocks.hamster_turn_once = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_turn_once_1).appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"]]), "DIRECTION").appendField(Lang.Blocks.HAMSTER_turn_once_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_turn_once = function(b, a) {
  var c = Entry.hw.sendQueue, d = Entry.hw.portData;
  if (a.isStart) {
    if (a.isMoving) {
      if (a.isLeft) {
        switch(a.boardState) {
          case 1:
            2 > a.count ? 50 < d.leftFloor && a.count++ : (a.count = 0, a.boardState = 2);
            break;
          case 2:
            20 > d.leftFloor && (a.boardState = 3);
            break;
          case 3:
            2 > a.count ? 20 > d.leftFloor && a.count++ : (a.count = 0, a.boardState = 4);
            break;
          case 4:
            50 < d.leftFloor && (a.boardState = 5);
            break;
          case 5:
            d = d.leftFloor - d.rightFloor, -15 < d ? (c.leftWheel = 0, c.rightWheel = 0, a.boardState = 0, a.isMoving = !1) : (c.leftWheel = .5 * d, c.rightWheel = .5 * -d);
        }
      } else {
        switch(a.boardState) {
          case 1:
            2 > a.count ? 50 < d.rightFloor && a.count++ : (a.count = 0, a.boardState = 2);
            break;
          case 2:
            20 > d.rightFloor && (a.boardState = 3);
            break;
          case 3:
            2 > a.count ? 20 > d.rightFloor && a.count++ : (a.count = 0, a.boardState = 4);
            break;
          case 4:
            50 < d.rightFloor && (a.boardState = 5);
            break;
          case 5:
            d = d.rightFloor - d.leftFloor, -15 < d ? (c.leftWheel = 0, c.rightWheel = 0, a.boardState = 0, a.isMoving = !1) : (c.leftWheel = .5 * -d, c.rightWheel = .5 * d);
        }
      }
      return a;
    }
    delete a.isStart;
    delete a.isMoving;
    delete a.count;
    delete a.boardState;
    delete a.isLeft;
    Entry.engine.isContinue = !1;
    c.leftWheel = 0;
    c.rightWheel = 0;
    return a.callReturn();
  }
  a.isStart = !0;
  a.isMoving = !0;
  a.count = 0;
  a.boardState = 1;
  "LEFT" == a.getField("DIRECTION", a) ? (a.isLeft = !0, c.leftWheel = -45, c.rightWheel = 45) : (a.isLeft = !1, c.leftWheel = 45, c.rightWheel = -45);
  Entry.Hamster.setLineTracerMode(c, 0);
  return a;
};
Blockly.Blocks.hamster_move_forward_for_secs = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_move_forward_for_secs_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_move_forward_for_secs_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_move_forward_for_secs = function(b, a) {
  var c = Entry.hw.sendQueue;
  if (a.isStart) {
    if (1 == a.timeFlag) {
      return a;
    }
    delete a.isStart;
    delete a.timeFlag;
    Entry.engine.isContinue = !1;
    c.leftWheel = 0;
    c.rightWheel = 0;
    return a.callReturn();
  }
  a.isStart = !0;
  a.timeFlag = 1;
  c.leftWheel = 30;
  c.rightWheel = 30;
  Entry.Hamster.setLineTracerMode(c, 0);
  var c = 1E3 * a.getNumberValue("VALUE"), d = setTimeout(function() {
    a.timeFlag = 0;
    Entry.Hamster.removeTimeout(d);
  }, c);
  Entry.Hamster.timeouts.push(d);
  return a;
};
Blockly.Blocks.hamster_move_backward_for_secs = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_move_backward_for_secs_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_move_backward_for_secs_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_move_backward_for_secs = function(b, a) {
  var c = Entry.hw.sendQueue;
  if (a.isStart) {
    if (1 == a.timeFlag) {
      return a;
    }
    delete a.isStart;
    delete a.timeFlag;
    Entry.engine.isContinue = !1;
    c.leftWheel = 0;
    c.rightWheel = 0;
    return a.callReturn();
  }
  a.isStart = !0;
  a.timeFlag = 1;
  c.leftWheel = -30;
  c.rightWheel = -30;
  Entry.Hamster.setLineTracerMode(c, 0);
  var c = 1E3 * a.getNumberValue("VALUE"), d = setTimeout(function() {
    a.timeFlag = 0;
    Entry.Hamster.removeTimeout(d);
  }, c);
  Entry.Hamster.timeouts.push(d);
  return a;
};
Blockly.Blocks.hamster_turn_for_secs = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_turn_for_secs_1).appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"]]), "DIRECTION").appendField(Lang.Blocks.HAMSTER_turn_for_secs_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_turn_for_secs_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_turn_for_secs = function(b, a) {
  var c = Entry.hw.sendQueue;
  if (a.isStart) {
    if (1 == a.timeFlag) {
      return a;
    }
    delete a.isStart;
    delete a.timeFlag;
    Entry.engine.isContinue = !1;
    c.leftWheel = 0;
    c.rightWheel = 0;
    return a.callReturn();
  }
  a.isStart = !0;
  a.timeFlag = 1;
  "LEFT" == a.getField("DIRECTION", a) ? (c.leftWheel = -30, c.rightWheel = 30) : (c.leftWheel = 30, c.rightWheel = -30);
  Entry.Hamster.setLineTracerMode(c, 0);
  var c = 1E3 * a.getNumberValue("VALUE"), d = setTimeout(function() {
    a.timeFlag = 0;
    Entry.Hamster.removeTimeout(d);
  }, c);
  Entry.Hamster.timeouts.push(d);
  return a;
};
Blockly.Blocks.hamster_change_both_wheels_by = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_both_wheels_by_1);
  this.appendValueInput("LEFT").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_both_wheels_by_2);
  this.appendValueInput("RIGHT").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_both_wheels_by_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_change_both_wheels_by = function(b, a) {
  var c = Entry.hw.sendQueue, d = a.getNumberValue("LEFT"), e = a.getNumberValue("RIGHT");
  c.leftWheel = void 0 != c.leftWheel ? c.leftWheel + d : d;
  c.rightWheel = void 0 != c.rightWheel ? c.rightWheel + e : e;
  Entry.Hamster.setLineTracerMode(c, 0);
  return a.callReturn();
};
Blockly.Blocks.hamster_set_both_wheels_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_both_wheels_to_1);
  this.appendValueInput("LEFT").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_both_wheels_to_2);
  this.appendValueInput("RIGHT").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_both_wheels_to_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_set_both_wheels_to = function(b, a) {
  var c = Entry.hw.sendQueue;
  c.leftWheel = a.getNumberValue("LEFT");
  c.rightWheel = a.getNumberValue("RIGHT");
  Entry.Hamster.setLineTracerMode(c, 0);
  return a.callReturn();
};
Blockly.Blocks.hamster_change_wheel_by = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_wheel_by_1).appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"], [Lang.General.both, "BOTH"]]), "DIRECTION").appendField(Lang.Blocks.HAMSTER_change_wheel_by_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_wheel_by_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_change_wheel_by = function(b, a) {
  var c = Entry.hw.sendQueue, d = a.getField("DIRECTION"), e = a.getNumberValue("VALUE");
  "LEFT" == d ? c.leftWheel = void 0 != c.leftWheel ? c.leftWheel + e : e : ("RIGHT" != d && (c.leftWheel = void 0 != c.leftWheel ? c.leftWheel + e : e), c.rightWheel = void 0 != c.rightWheel ? c.rightWheel + e : e);
  Entry.Hamster.setLineTracerMode(c, 0);
  return a.callReturn();
};
Blockly.Blocks.hamster_set_wheel_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_wheel_to_1).appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"], [Lang.General.both, "BOTH"]]), "DIRECTION").appendField(Lang.Blocks.HAMSTER_set_wheel_to_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_wheel_to_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_set_wheel_to = function(b, a) {
  var c = Entry.hw.sendQueue, d = a.getField("DIRECTION"), e = a.getNumberValue("VALUE");
  "LEFT" == d ? c.leftWheel = e : ("RIGHT" != d && (c.leftWheel = e), c.rightWheel = e);
  Entry.Hamster.setLineTracerMode(c, 0);
  return a.callReturn();
};
Blockly.Blocks.hamster_follow_line_using = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_follow_line_using_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.HAMSTER_color_black, "BLACK"], [Lang.General.white, "WHITE"]]), "COLOR").appendField(Lang.Blocks.HAMSTER_follow_line_using_2).appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"], [Lang.General.both, "BOTH"]]), "DIRECTION").appendField(Lang.Blocks.HAMSTER_follow_line_using_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + 
  "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_follow_line_using = function(b, a) {
  var c = Entry.hw.sendQueue, d = a.getField("COLOR"), e = a.getField("DIRECTION"), f = 1;
  "RIGHT" == e ? f = 2 : "BOTH" == e && (f = 3);
  "WHITE" == d && (f += 7);
  c.leftWheel = 0;
  c.rightWheel = 0;
  Entry.Hamster.setLineTracerMode(c, f);
  return a.callReturn();
};
Blockly.Blocks.hamster_follow_line_until = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_follow_line_until_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.HAMSTER_color_black, "BLACK"], [Lang.General.white, "WHITE"]]), "COLOR").appendField(Lang.Blocks.HAMSTER_follow_line_until_2).appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"], [Lang.Blocks.HAMSTER_front, "FRONT"], [Lang.Blocks.HAMSTER_rear, "REAR"]]), "DIRECTION").appendField(Lang.Blocks.HAMSTER_follow_line_until_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + 
  "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_follow_line_until = function(b, a) {
  var c = Entry.hw.sendQueue, d = Entry.hw.portData, e = a.getField("COLOR"), f = a.getField("DIRECTION"), g = 4;
  "RIGHT" == f ? g = 5 : "FRONT" == f ? g = 6 : "REAR" == f && (g = 7);
  "WHITE" == e && (g += 7);
  if (a.isStart) {
    if (e = Entry.Hamster, d.lineTracerStateId != e.lineTracerStateId && (e.lineTracerStateId = d.lineTracerStateId, 64 == d.lineTracerState)) {
      return delete a.isStart, Entry.engine.isContinue = !1, e.setLineTracerMode(c, 0), a.callReturn();
    }
  } else {
    a.isStart = !0, c.leftWheel = 0, c.rightWheel = 0, Entry.Hamster.setLineTracerMode(c, g);
  }
  return a;
};
Blockly.Blocks.hamster_set_following_speed_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_following_speed_to_1).appendField(new Blockly.FieldDropdown([["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"]]), "SPEED").appendField(Lang.Blocks.HAMSTER_set_following_speed_to_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_set_following_speed_to = function(b, a) {
  Entry.hw.sendQueue.lineTracerSpeed = Number(a.getField("SPEED", a));
  return a.callReturn();
};
Blockly.Blocks.hamster_stop = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_stop).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_stop = function(b, a) {
  var c = Entry.hw.sendQueue;
  c.leftWheel = 0;
  c.rightWheel = 0;
  Entry.Hamster.setLineTracerMode(c, 0);
  return a.callReturn();
};
Blockly.Blocks.hamster_set_led_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_led_to_1).appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"], [Lang.General.both, "BOTH"]]), "DIRECTION").appendField(Lang.Blocks.HAMSTER_set_led_to_2).appendField(new Blockly.FieldDropdown([[Lang.General.red, "4"], [Lang.General.yellow, "6"], [Lang.General.green, "2"], [Lang.Blocks.HAMSTER_color_cyan, "3"], [Lang.General.blue, "1"], [Lang.Blocks.HAMSTER_color_magenta, "5"], [Lang.General.white, 
  "7"]]), "COLOR").appendField(Lang.Blocks.HAMSTER_set_led_to_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_set_led_to = function(b, a) {
  var c = Entry.hw.sendQueue, d = a.getField("DIRECTION", a), e = Number(a.getField("COLOR", a));
  "LEFT" == d ? c.leftLed = e : ("RIGHT" != d && (c.leftLed = e), c.rightLed = e);
  return a.callReturn();
};
Blockly.Blocks.hamster_clear_led = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_clear_led_1).appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"], [Lang.General.both, "BOTH"]]), "DIRECTION").appendField(Lang.Blocks.HAMSTER_clear_led_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_clear_led = function(b, a) {
  var c = Entry.hw.sendQueue, d = a.getField("DIRECTION", a);
  "LEFT" == d ? c.leftLed = 0 : ("RIGHT" != d && (c.leftLed = 0), c.rightLed = 0);
  return a.callReturn();
};
Blockly.Blocks.hamster_beep = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_beep).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_beep = function(b, a) {
  var c = Entry.hw.sendQueue;
  if (a.isStart) {
    if (1 == a.timeFlag) {
      return a;
    }
    delete a.isStart;
    delete a.timeFlag;
    Entry.engine.isContinue = !1;
    c.buzzer = 0;
    return a.callReturn();
  }
  a.isStart = !0;
  a.timeFlag = 1;
  c.buzzer = 440;
  c.note = 0;
  var d = setTimeout(function() {
    a.timeFlag = 0;
    Entry.Hamster.removeTimeout(d);
  }, 200);
  Entry.Hamster.timeouts.push(d);
  return a;
};
Blockly.Blocks.hamster_change_buzzer_by = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_buzzer_by_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_buzzer_by_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_change_buzzer_by = function(b, a) {
  var c = Entry.hw.sendQueue, d = a.getNumberValue("VALUE");
  c.buzzer = void 0 != c.buzzer ? c.buzzer + d : d;
  c.note = 0;
  return a.callReturn();
};
Blockly.Blocks.hamster_set_buzzer_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_buzzer_to_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_buzzer_to_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_set_buzzer_to = function(b, a) {
  var c = Entry.hw.sendQueue;
  c.buzzer = a.getNumberValue("VALUE");
  c.note = 0;
  return a.callReturn();
};
Blockly.Blocks.hamster_clear_buzzer = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_clear_buzzer).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_clear_buzzer = function(b, a) {
  var c = Entry.hw.sendQueue;
  c.buzzer = 0;
  c.note = 0;
  return a.callReturn();
};
Blockly.Blocks.hamster_play_note_for = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_play_note_for_1).appendField(new Blockly.FieldDropdown([[Lang.General.note_c + "", "4"], [Lang.General.note_c + "#", "5"], [Lang.General.note_d + "", "6"], [Lang.General.note_e + "b", "7"], [Lang.General.note_e + "", "8"], [Lang.General.note_f + "", "9"], [Lang.General.note_f + "#", "10"], [Lang.General.note_g + "", "11"], [Lang.General.note_g + "#", "12"], [Lang.General.note_a + "", "13"], [Lang.General.note_b + "b", "14"], [Lang.General.note_b + 
  "", "15"]]), "NOTE").appendField(Lang.Blocks.HAMSTER_play_note_for_2).appendField(new Blockly.FieldDropdown([["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"]]), "OCTAVE").appendField(Lang.Blocks.HAMSTER_play_note_for_3);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_play_note_for_4).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_play_note_for = function(b, a) {
  var c = Entry.hw.sendQueue;
  if (a.isStart) {
    if (1 == a.timeFlag) {
      return a;
    }
    delete a.isStart;
    delete a.timeFlag;
    Entry.engine.isContinue = !1;
    c.note = 0;
    return a.callReturn();
  }
  var d = a.getNumberField("NOTE", a), e = a.getNumberField("OCTAVE", a), f = a.getNumberValue("VALUE", a), g = Entry.Hamster.tempo, f = 6E4 * f / g;
  a.isStart = !0;
  a.timeFlag = 1;
  c.buzzer = 0;
  c.note = d + 12 * (e - 1);
  if (100 < f) {
    var h = setTimeout(function() {
      c.note = 0;
      Entry.Hamster.removeTimeout(h);
    }, f - 100);
    Entry.Hamster.timeouts.push(h);
  }
  var k = setTimeout(function() {
    a.timeFlag = 0;
    Entry.Hamster.removeTimeout(k);
  }, f);
  Entry.Hamster.timeouts.push(k);
  return a;
};
Blockly.Blocks.hamster_rest_for = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_rest_for_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_rest_for_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_rest_for = function(b, a) {
  var c = Entry.hw.sendQueue;
  if (a.isStart) {
    if (1 == a.timeFlag) {
      return a;
    }
    delete a.isStart;
    delete a.timeFlag;
    Entry.engine.isContinue = !1;
    return a.callReturn();
  }
  a.isStart = !0;
  a.timeFlag = 1;
  var d = a.getNumberValue("VALUE"), d = 6E4 * d / Entry.Hamster.tempo;
  c.buzzer = 0;
  c.note = 0;
  var e = setTimeout(function() {
    a.timeFlag = 0;
    Entry.Hamster.removeTimeout(e);
  }, d);
  Entry.Hamster.timeouts.push(e);
  return a;
};
Blockly.Blocks.hamster_change_tempo_by = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_tempo_by_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_tempo_by_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_change_tempo_by = function(b, a) {
  Entry.Hamster.tempo += a.getNumberValue("VALUE");
  1 > Entry.Hamster.tempo && (Entry.Hamster.tempo = 1);
  return a.callReturn();
};
Blockly.Blocks.hamster_set_tempo_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_tempo_to_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_tempo_to_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_set_tempo_to = function(b, a) {
  Entry.Hamster.tempo = a.getNumberValue("VALUE");
  1 > Entry.Hamster.tempo && (Entry.Hamster.tempo = 1);
  return a.callReturn();
};
Blockly.Blocks.hamster_set_port_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_port_to_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.HAMSTER_port_a, "A"], [Lang.Blocks.HAMSTER_port_b, "B"], [Lang.Blocks.HAMSTER_port_ab, "AB"]]), "PORT").appendField(Lang.Blocks.HAMSTER_set_port_to_2).appendField(new Blockly.FieldDropdown([[Lang.Blocks.HAMSTER_analog_input, "0"], [Lang.Blocks.HAMSTER_digital_input, "1"], [Lang.Blocks.HAMSTER_servo_output, "8"], [Lang.Blocks.HAMSTER_pwm_output, "9"], [Lang.Blocks.HAMSTER_digital_output, 
  "10"]]), "MODE").appendField(Lang.Blocks.HAMSTER_set_port_to_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_set_port_to = function(b, a) {
  var c = Entry.hw.sendQueue, d = a.getField("PORT", a), e = Number(a.getField("MODE", a));
  "A" == d ? c.ioModeA = e : ("B" != d && (c.ioModeA = e), c.ioModeB = e);
  return a.callReturn();
};
Blockly.Blocks.hamster_change_output_by = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_output_by_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.HAMSTER_port_a, "A"], [Lang.Blocks.HAMSTER_port_b, "B"], [Lang.Blocks.HAMSTER_port_ab, "AB"]]), "PORT").appendField(Lang.Blocks.HAMSTER_change_output_by_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_output_by_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_change_output_by = function(b, a) {
  var c = Entry.hw.sendQueue, d = a.getField("PORT"), e = a.getNumberValue("VALUE");
  "A" == d ? c.outputA = void 0 != c.outputA ? c.outputA + e : e : ("B" != d && (c.outputA = void 0 != c.outputA ? c.outputA + e : e), c.outputB = void 0 != c.outputB ? c.outputB + e : e);
  return a.callReturn();
};
Blockly.Blocks.hamster_set_output_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_output_to_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.HAMSTER_port_a, "A"], [Lang.Blocks.HAMSTER_port_b, "B"], [Lang.Blocks.HAMSTER_port_ab, "AB"]]), "PORT").appendField(Lang.Blocks.HAMSTER_set_output_to_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_output_to_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_set_output_to = function(b, a) {
  var c = Entry.hw.sendQueue, d = a.getField("PORT"), e = a.getNumberValue("VALUE");
  "A" == d ? c.outputA = e : ("B" != d && (c.outputA = e), c.outputB = e);
  return a.callReturn();
};
Blockly.Blocks.is_clicked = {init:function() {
  this.setColour("#AEB8FF");
  this.appendDummyInput().appendField(Lang.Blocks.JUDGEMENT_is_clicked, "#3D3D3D");
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}};
Entry.block.is_clicked = function(b, a) {
  return Entry.stage.isClick;
};
Blockly.Blocks.is_press_some_key = {init:function() {
  this.setColour("#AEB8FF");
  this.appendDummyInput().appendField(Lang.Blocks.JUDGEMENT_is_press_some_key_1, "#3D3D3D");
  this.appendDummyInput().appendField(new Blockly.FieldKeydownInput("81"), "VALUE").appendField(Lang.Blocks.JUDGEMENT_is_press_some_key_2, "#3D3D3D");
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}};
Entry.block.is_press_some_key = function(b, a) {
  var c = Number(a.getField("VALUE", a));
  return 0 <= Entry.engine.pressedKeys.indexOf(c);
};
Blockly.Blocks.reach_something = {init:function() {
  this.setColour("#AEB8FF");
  this.appendDummyInput().appendField(Lang.Blocks.JUDGEMENT_reach_something_1, "#3D3D3D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("collision"), "VALUE");
  this.appendDummyInput().appendField(Lang.Blocks.JUDGEMENT_reach_something_2, "#3D3D3D");
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}};
Entry.block.reach_something = function(b, a) {
  if (!b.getVisible()) {
    return !1;
  }
  var c = a.getField("VALUE", a), d = b.object, e = /wall/.test(c), f = ndgmr.checkPixelCollision;
  if (e) {
    switch(e = Entry.stage.wall, c) {
      case "wall":
        if (f(d, e.up, .2, !0) || f(d, e.down, .2, !0) || f(d, e.left, .2, !0) || f(d, e.right, .2, !0)) {
          return !0;
        }
        break;
      case "wall_up":
        if (f(d, e.up, .2, !0)) {
          return !0;
        }
        break;
      case "wall_down":
        if (f(d, e.down, .2, !0)) {
          return !0;
        }
        break;
      case "wall_right":
        if (f(d, e.right, .2, !0)) {
          return !0;
        }
        break;
      case "wall_left":
        if (f(d, e.left, .2, !0)) {
          return !0;
        }
      ;
    }
  } else {
    if ("mouse" == c) {
      return f = Entry.stage.canvas, f = d.globalToLocal(f.mouseX, f.mouseY), d.hitTest(f.x, f.y);
    }
    c = Entry.container.getEntity(c);
    if ("textBox" == c.type || "textBox" == b.type) {
      f = c.object.getTransformedBounds();
      d = d.getTransformedBounds();
      if (Entry.checkCollisionRect(d, f)) {
        return !0;
      }
      for (var c = c.parent.clonedEntities, e = 0, g = c.length;e < g;e++) {
        var h = c[e];
        if (!h.isStamp && h.getVisible() && Entry.checkCollisionRect(d, h.object.getTransformedBounds())) {
          return !0;
        }
      }
    } else {
      if (c.getVisible() && f(d, c.object, .2, !0)) {
        return !0;
      }
      c = c.parent.clonedEntities;
      e = 0;
      for (g = c.length;e < g;e++) {
        if (h = c[e], !h.isStamp && h.getVisible() && f(d, h.object, .2, !0)) {
          return !0;
        }
      }
    }
  }
  return !1;
};
Blockly.Blocks.boolean_comparison = {init:function() {
  this.setColour("#AEB8FF");
  this.appendValueInput("LEFTHAND").setCheck(["String", "Number"]);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["=", "EQUAL"], ["<", "SMALLER"], [">", "BIGGER"]]), "OPERATOR");
  this.appendValueInput("RIGHTHAND").setCheck(["String", "Number"]);
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}};
Entry.block.boolean_comparison = function(b, a) {
  var c = a.getField("OPERATOR", a), d = a.getNumberValue("LEFTHAND", a), e = a.getNumberValue("RIGHTHAND", a);
  return "EQUAL" == c ? d == e : "BIGGER" == c ? d > e : d < e;
};
Blockly.Blocks.boolean_equal = {init:function() {
  this.setColour("#AEB8FF");
  this.appendValueInput("LEFTHAND").setCheck(["String", "Number"]);
  this.appendDummyInput().appendField("=", "#3D3D3D");
  this.appendValueInput("RIGHTHAND").setCheck(["String", "Number"]);
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}};
Entry.block.boolean_equal = function(b, a) {
  var c = a.getStringValue("LEFTHAND", a), d = a.getStringValue("RIGHTHAND", a);
  return c == d;
};
Blockly.Blocks.boolean_bigger = {init:function() {
  this.setColour("#AEB8FF");
  this.appendValueInput("LEFTHAND").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(">", "#3D3D3D");
  this.appendValueInput("RIGHTHAND").setCheck(["Number", "String"]);
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}};
Entry.block.boolean_bigger = function(b, a) {
  var c = a.getNumberValue("LEFTHAND", a), d = a.getNumberValue("RIGHTHAND", a);
  return c > d;
};
Blockly.Blocks.boolean_smaller = {init:function() {
  this.setColour("#AEB8FF");
  this.appendValueInput("LEFTHAND").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("<", "#3D3D3D");
  this.appendValueInput("RIGHTHAND").setCheck(["Number", "String"]);
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}};
Entry.block.boolean_smaller = function(b, a) {
  var c = a.getNumberValue("LEFTHAND", a), d = a.getNumberValue("RIGHTHAND", a);
  return c < d;
};
Blockly.Blocks.boolean_and_or = {init:function() {
  this.setColour("#AEB8FF");
  this.appendValueInput("LEFTHAND").setCheck("Boolean");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.JUDGEMENT_boolean_and, "AND"], [Lang.Blocks.JUDGEMENT_boolean_or, "OR"]]), "OPERATOR");
  this.appendValueInput("RIGHTHAND").setCheck("Boolean");
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}};
Entry.block.boolean_and_or = function(b, a) {
  var c = a.getField("OPERATOR", a), d = a.getBooleanValue("LEFTHAND", a), e = a.getBooleanValue("RIGHTHAND", a);
  return "AND" == c ? d && e : d || e;
};
Blockly.Blocks.boolean_and = {init:function() {
  this.setColour("#AEB8FF");
  this.appendValueInput("LEFTHAND").setCheck("Boolean");
  this.appendDummyInput().appendField(Lang.Blocks.JUDGEMENT_boolean_and, "#3D3D3D");
  this.appendValueInput("RIGHTHAND").setCheck("Boolean");
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}};
Entry.block.boolean_and = function(b, a) {
  var c = a.getBooleanValue("LEFTHAND", a), d = a.getBooleanValue("RIGHTHAND", a);
  return c && d;
};
Blockly.Blocks.boolean_or = {init:function() {
  this.setColour("#AEB8FF");
  this.appendValueInput("LEFTHAND").setCheck("Boolean");
  this.appendDummyInput().appendField(Lang.Blocks.JUDGEMENT_boolean_or, "#3D3D3D");
  this.appendValueInput("RIGHTHAND").setCheck("Boolean");
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}};
Entry.block.boolean_or = function(b, a) {
  var c = a.getBooleanValue("LEFTHAND", a), d = a.getBooleanValue("RIGHTHAND", a);
  return c || d;
};
Blockly.Blocks.boolean_not = {init:function() {
  this.setColour("#AEB8FF");
  this.appendDummyInput().appendField(Lang.Blocks.JUDGEMENT_boolean_not_1, "#3D3D3D");
  this.appendValueInput("VALUE").setCheck("Boolean");
  this.appendDummyInput().appendField(Lang.Blocks.JUDGEMENT_boolean_not_2, "#3D3D3D");
  this.appendDummyInput();
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}};
Entry.block.boolean_not = function(b, a) {
  return !a.getBooleanValue("VALUE");
};
Blockly.Blocks.true_or_false = {init:function() {
  this.setColour("#AEB8FF");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.JUDGEMENT_true, "true"], [Lang.Blocks.JUDGEMENT_false, "false"]]), "VALUE");
  this.appendDummyInput();
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}};
Entry.block.true_or_false = function(b, a) {
  return "true" == a.children[0].textContent;
};
Blockly.Blocks.True = {init:function() {
  this.setColour("#AEB8FF");
  this.appendDummyInput().appendField(Lang.Blocks.JUDGEMENT_true, "#3D3D3D").appendField(" ");
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}};
Entry.block.True = function(b, a) {
  return !0;
};
Blockly.Blocks.False = {init:function() {
  this.setColour("#AEB8FF");
  this.appendDummyInput().appendField(Lang.Blocks.JUDGEMENT_false, "#3D3D3D").appendField(" ");
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}};
Entry.block.False = function(b, a) {
  return !1;
};
Blockly.Blocks.boolean_basic_operator = {init:function() {
  this.setColour("#AEB8FF");
  this.appendValueInput("LEFTHAND").setCheck(["String", "Number"]);
  this.appendDummyInput("VALUE").appendField(new Blockly.FieldDropdown([["=", "EQUAL"], [">", "GREATER"], ["<", "LESS"], ["\u2265", "GREATER_OR_EQUAL"], ["\u2264", "LESS_OR_EQUAL"]], null, !1), "OPERATOR");
  this.appendValueInput("RIGHTHAND").setCheck(["Number", "String"]);
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}};
Entry.block.boolean_basic_operator = function(b, a) {
  var c = a.getField("OPERATOR", a), d = a.getStringValue("LEFTHAND", a), e = a.getStringValue("RIGHTHAND", a);
  switch(c) {
    case "EQUAL":
      return d == e;
    case "GREATER":
      return Number(d) > Number(e);
    case "LESS":
      return Number(d) < Number(e);
    case "GREATER_OR_EQUAL":
      return Number(d) >= Number(e);
    case "LESS_OR_EQUAL":
      return Number(d) <= Number(e);
  }
};
Blockly.Blocks.show = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_show).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.show = function(b, a) {
  b.setVisible(!0);
  return a.callReturn();
};
Blockly.Blocks.hide = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_hide).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hide = function(b, a) {
  b.setVisible(!1);
  return a.callReturn();
};
Blockly.Blocks.dialog_time = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_dialog_time_1);
  this.appendValueInput("VALUE").setCheck(["String", "Number", null]);
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_dialog_time_2);
  this.appendValueInput("SECOND").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_dialog_time_3);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.speak, "speak"]]), "OPTION");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_dialog_time_4).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.dialog_time = function(b, a) {
  if (!a.isStart) {
    var c = a.getNumberValue("SECOND", a), d = a.getStringValue("VALUE", a), e = a.getField("OPTION", a);
    a.isStart = !0;
    a.timeFlag = 1;
    d || "number" == typeof d || (d = "    ");
    d = Entry.convertToRoundedDecimals(d, 3);
    new Entry.Dialog(b, d, e);
    b.syncDialogVisible(b.getVisible());
    setTimeout(function() {
      a.timeFlag = 0;
    }, 1E3 * c);
  }
  return 0 == a.timeFlag ? (delete a.timeFlag, delete a.isStart, b.dialog && b.dialog.remove(), a.callReturn()) : a;
};
Blockly.Blocks.dialog = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_dialog_1);
  this.appendValueInput("VALUE").setCheck(["String", "Number", null]);
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_dialog_2);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.speak, "speak"]]), "OPTION");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_dialog_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.dialog = function(b, a) {
  var c = a.getStringValue("VALUE", a);
  c || "number" == typeof c || (c = "    ");
  var d = a.getField("OPTION", a), c = Entry.convertToRoundedDecimals(c, 3);
  new Entry.Dialog(b, c, d);
  b.syncDialogVisible(b.getVisible());
  return a.callReturn();
};
Blockly.Blocks.remove_dialog = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_remove_dialog).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.remove_dialog = function(b, a) {
  b.dialog && b.dialog.remove();
  return a.callReturn();
};
Blockly.Blocks.change_to_nth_shape = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_change_to_nth_shape_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("pictures"), "VALUE");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_change_to_nth_shape_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.change_to_nth_shape = function(b, a) {
  var c = a.getField("VALUE", a), c = b.parent.getPicture(c);
  b.setImage(c);
  return a.callReturn();
};
Blockly.Blocks.change_to_next_shape = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_change_to_near_shape_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.LOOKS_change_shape_next, "next"], [Lang.Blocks.LOOKS_change_shape_prev, "prev"]]), "DRIECTION").appendField(Lang.Blocks.LOOKS_change_to_near_shape_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.change_to_next_shape = function(b, a) {
  var c;
  c = a.fields && "prev" === a.getStringField("DRIECTION") ? b.parent.getPrevPicture(b.picture.id) : b.parent.getNextPicture(b.picture.id);
  b.setImage(c);
  return a.callReturn();
};
Blockly.Blocks.set_effect_volume = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_effect_volume_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.color, "color"], [Lang.Blocks.brightness, "brightness"], [Lang.Blocks.opacity, "opacity"]]), "EFFECT");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_effect_volume_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_effect_volume_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.set_effect_volume = function(b, a) {
  var c = a.getField("EFFECT", a), d = a.getNumberValue("VALUE", a);
  "color" == c ? b.effect.hue = d + b.effect.hue : "lens" != c && "swriling" != c && "pixel" != c && "mosaic" != c && ("brightness" == c ? b.effect.brightness = d + b.effect.brightness : "blur" != c && "opacity" == c && (b.effect.alpha += d / 100));
  b.applyFilter();
  return a.callReturn();
};
Blockly.Blocks.set_effect = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_effect_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.color, "color"], [Lang.Blocks.brightness, "brightness"], [Lang.Blocks.opacity, "opacity"]]), "EFFECT");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_effect_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_effect_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.set_effect = function(b, a) {
  var c = a.getField("EFFECT", a), d = a.getNumberValue("VALUE", a);
  "color" == c ? b.effect.hue = d : "lens" != c && "swriling" != c && "pixel" != c && "mosaic" != c && ("brightness" == c ? b.effect.brightness = d : "blur" != c && "opacity" == c && (b.effect.alpha = d / 100));
  b.applyFilter();
  return a.callReturn();
};
Blockly.Blocks.erase_all_effects = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_erase_all_effects).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.erase_all_effects = function(b, a) {
  b.resetFilter();
  return a.callReturn();
};
Blockly.Blocks.change_scale_percent = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_change_scale_percent_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_change_scale_percent_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.change_scale_percent = function(b, a) {
  var c = (a.getNumberValue("VALUE", a) + 100) / 100;
  b.setScaleX(b.getScaleX() * c);
  b.setScaleY(b.getScaleY() * c);
  return a.callReturn();
};
Blockly.Blocks.set_scale_percent = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_scale_percent_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_scale_percent_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.set_scale_percent = function(b, a) {
  var c = a.getNumberValue("VALUE", a) / 100, d = b.snapshot_;
  b.setScaleX(c * d.scaleX);
  b.setScaleY(c * d.scaleY);
  return a.callReturn();
};
Blockly.Blocks.change_scale_size = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_change_scale_percent_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_change_scale_percent_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.change_scale_size = function(b, a) {
  var c = a.getNumberValue("VALUE", a);
  b.setSize(b.getSize() + c);
  return a.callReturn();
};
Blockly.Blocks.set_scale_size = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_scale_percent_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_scale_percent_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.set_scale_size = function(b, a) {
  var c = a.getNumberValue("VALUE", a);
  b.setSize(c);
  return a.callReturn();
};
Blockly.Blocks.flip_y = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_flip_y).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.flip_y = function(b, a) {
  b.setScaleX(-1 * b.getScaleX());
  return a.callReturn();
};
Blockly.Blocks.flip_x = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_flip_x).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.flip_x = function(b, a) {
  b.setScaleY(-1 * b.getScaleY());
  return a.callReturn();
};
Blockly.Blocks.set_object_order = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_object_order_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("objectSequence"), "VALUE");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_object_order_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.set_object_order = function(b, a) {
  var c = a.getField("VALUE", a), d = Entry.container.getCurrentObjects().indexOf(b.parent);
  if (-1 < d) {
    return Entry.container.moveElementByBlock(d, c), a.callReturn();
  }
  throw Error("object is not available");
};
Blockly.Blocks.get_pictures = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField("");
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("pictures"), "VALUE");
  this.appendDummyInput().appendField(" ");
  this.setOutput(!0, "String");
  this.setInputsInline(!0);
}};
Entry.block.get_pictures = function(b, a) {
  return a.getStringField("VALUE");
};
Blockly.Blocks.change_to_some_shape = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_change_to_nth_shape_1);
  this.appendValueInput("VALUE").setCheck(["String", "Number"]);
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_change_to_nth_shape_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.change_to_some_shape = function(b, a) {
  var c = a.getStringValue("VALUE");
  Entry.parseNumber(c);
  c = b.parent.getPicture(c);
  b.setImage(c);
  return a.callReturn();
};
Blockly.Blocks.add_effect_amount = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_effect_volume_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.color, "color"], [Lang.Blocks.brightness, "brightness"], [Lang.Blocks.transparency, "transparency"]]), "EFFECT");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_effect_volume_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_effect_volume_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.add_effect_amount = function(b, a) {
  var c = a.getField("EFFECT", a), d = a.getNumberValue("VALUE", a);
  "color" == c ? b.effect.hsv = d + b.effect.hsv : "brightness" == c ? b.effect.brightness = d + b.effect.brightness : "transparency" == c && (b.effect.alpha -= d / 100);
  b.applyFilter();
  return a.callReturn();
};
Blockly.Blocks.change_effect_amount = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_effect_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.color, "color"], [Lang.Blocks.brightness, "brightness"], [Lang.Blocks.transparency, "transparency"]]), "EFFECT");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_effect_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_effect_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.change_effect_amount = function(b, a) {
  var c = a.getField("EFFECT", a), d = a.getNumberValue("VALUE", a);
  "color" == c ? b.effect.hsv = d : "brightness" == c ? b.effect.brightness = d : "transparency" == c && (b.effect.alpha = 1 - d / 100);
  b.applyFilter();
  return a.callReturn();
};
Blockly.Blocks.set_effect_amount = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_effect_volume_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.color, "color"], [Lang.Blocks.brightness, "brightness"], [Lang.Blocks.transparency, "transparency"]]), "EFFECT");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_effect_volume_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_effect_volume_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.set_effect_amount = function(b, a) {
  var c = a.getField("EFFECT", a), d = a.getNumberValue("VALUE", a);
  "color" == c ? b.effect.hue = d + b.effect.hue : "brightness" == c ? b.effect.brightness = d + b.effect.brightness : "transparency" == c && (b.effect.alpha -= d / 100);
  b.applyFilter();
  return a.callReturn();
};
Blockly.Blocks.set_entity_effect = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_effect_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.color, "color"], [Lang.Blocks.brightness, "brightness"], [Lang.Blocks.transparency, "transparency"]]), "EFFECT");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_effect_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_effect_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.set_entity_effect = function(b, a) {
  var c = a.getField("EFFECT", a), d = a.getNumberValue("VALUE", a);
  "color" == c ? b.effect.hue = d : "brightness" == c ? b.effect.brightness = d : "transparency" == c && (b.effect.alpha = 1 - d / 100);
  b.applyFilter();
  return a.callReturn();
};
Blockly.Blocks.change_object_index = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_change_object_index_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.LOOKS_change_object_index_sub_1, "FRONT"], [Lang.Blocks.LOOKS_change_object_index_sub_2, "FORWARD"], [Lang.Blocks.LOOKS_change_object_index_sub_3, "BACKWARD"], [Lang.Blocks.LOOKS_change_object_index_sub_4, "BACK"]]), "LOCATION").appendField(Lang.Blocks.LOOKS_change_object_index_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.change_object_index = function(b, a) {
  var c, d = a.getField("LOCATION", a), e = Entry.container.getCurrentObjects(), f = e.indexOf(b.parent), e = e.length - 1;
  if (0 > f) {
    throw Error("object is not available for current scene");
  }
  switch(d) {
    case "FRONT":
      c = 0;
      break;
    case "FORWARD":
      c = Math.max(0, f - 1);
      break;
    case "BACKWARD":
      c = Math.min(e, f + 1);
      break;
    case "BACK":
      c = e;
  }
  Entry.container.moveElementByBlock(f, c);
  return a.callReturn();
};
Blockly.Blocks.move_direction = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_move_direction_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_move_direction_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.move_direction = function(b, a) {
  var c = a.getNumberValue("VALUE", a);
  b.setX(b.getX() + c * Math.cos((b.getRotation() + b.getDirection() - 90) / 180 * Math.PI));
  b.setY(b.getY() - c * Math.sin((b.getRotation() + b.getDirection() - 90) / 180 * Math.PI));
  b.brush && !b.brush.stop && b.brush.lineTo(b.getX(), -1 * b.getY());
  return a.callReturn();
};
Blockly.Blocks.move_x = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_move_x_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_move_x_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.move_x = function(b, a) {
  var c = a.getNumberValue("VALUE", a);
  b.setX(b.getX() + c);
  b.brush && !b.brush.stop && b.brush.lineTo(b.getX(), -1 * b.getY());
  return a.callReturn();
};
Blockly.Blocks.move_y = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_move_y_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_move_y_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.move_y = function(b, a) {
  var c = a.getNumberValue("VALUE", a);
  b.setY(b.getY() + c);
  b.brush && !b.brush.stop && b.brush.lineTo(b.getX(), -1 * b.getY());
  return a.callReturn();
};
Blockly.Blocks.locate_xy_time = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_locate_xy_time_1);
  this.appendValueInput("VALUE1").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_locate_xy_time_2);
  this.appendValueInput("VALUE2").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_locate_xy_time_3);
  this.appendValueInput("VALUE3").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_locate_xy_time_4).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.locate_xy_time = function(b, a) {
  if (!a.isStart) {
    var c;
    c = a.getNumberValue("VALUE1", a);
    a.isStart = !0;
    a.frameCount = Math.floor(c * Entry.FPS);
    a.x = a.getNumberValue("VALUE2", a);
    a.y = a.getNumberValue("VALUE3", a);
  }
  if (0 != a.frameCount) {
    c = a.x - b.getX();
    var d = a.y - b.getY();
    c /= a.frameCount;
    d /= a.frameCount;
    b.setX(b.getX() + c);
    b.setY(b.getY() + d);
    a.frameCount--;
    b.brush && !b.brush.stop && b.brush.lineTo(b.getX(), -1 * b.getY());
    return a;
  }
  delete a.isStart;
  delete a.frameCount;
  return a.callReturn();
};
Blockly.Blocks.rotate_by_angle = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_rotate_by_angle_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_rotate_by_angle_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.rotate_by_angle = function(b, a) {
  var c = a.getNumberValue("VALUE", a);
  b.setRotation(b.getRotation() + c);
  return a.callReturn();
};
Blockly.Blocks.rotate_by_angle_dropdown = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_rotate_by_angle_dropdown_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["45", "45"], ["90", "90"], ["135", "135"], ["180", "180"]]), "VALUE").appendField(Lang.Blocks.MOVING_rotate_by_angle_dropdown_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.rotate_by_angle_dropdown = function(b, a) {
  var c = a.getField("VALUE", a);
  b.setRotation(b.getRotation() + Number(c));
  return a.callReturn();
};
Blockly.Blocks.see_angle = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_see_angle_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_see_angle_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.see_angle = function(b, a) {
  var c = a.getNumberValue("VALUE", a);
  b.setDirection(c);
  return a.callReturn();
};
Blockly.Blocks.see_direction = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_see_direction_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("sprites"), "VALUE");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_see_direction_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.see_direction = function(b, a) {
  var c = a.getField("VALUE", a), d = Entry.container.getEntity(c), c = d.getX() - b.getX(), d = d.getY() - b.getY();
  0 <= c ? b.setRotation(Math.atan(d / c) / Math.PI * 180 + 90) : b.setRotation(Math.atan(d / c) / Math.PI * 180 + 270);
  return a.callReturn();
};
Blockly.Blocks.locate_xy = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_locate_xy_1);
  this.appendValueInput("VALUE1").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_locate_xy_2);
  this.appendValueInput("VALUE2").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_locate_xy_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.locate_xy = function(b, a) {
  var c = a.getNumberValue("VALUE1", a);
  b.setX(c);
  c = a.getNumberValue("VALUE2", a);
  b.setY(c);
  b.brush && !b.brush.stop && b.brush.lineTo(b.getX(), -1 * b.getY());
  return a.callReturn();
};
Blockly.Blocks.locate_x = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_locate_x_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_locate_x_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.locate_x = function(b, a) {
  var c = a.getNumberValue("VALUE", a);
  b.setX(c);
  b.brush && !b.brush.stop && b.brush.lineTo(b.getX(), -1 * b.getY());
  return a.callReturn();
};
Blockly.Blocks.locate_y = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_locate_y_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_locate_y_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.locate_y = function(b, a) {
  var c = a.getNumberValue("VALUE", a);
  b.setY(c);
  b.brush && !b.brush.stop && b.brush.lineTo(b.getX(), -1 * b.getY());
  return a.callReturn();
};
Blockly.Blocks.locate = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_locate_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("spritesWithMouse"), "VALUE");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_locate_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.locate = function(b, a) {
  var c = a.getField("VALUE", a), d;
  "mouse" == c ? (c = Entry.stage.mouseCoordinate.x, d = Entry.stage.mouseCoordinate.y) : (d = Entry.container.getEntity(c), c = d.getX(), d = d.getY());
  b.setX(Number(c));
  b.setY(Number(d));
  b.brush && !b.brush.stop && b.brush.lineTo(c, -1 * d);
  return a.callReturn();
};
Blockly.Blocks.move_xy_time = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_move_xy_time_1);
  this.appendValueInput("VALUE1").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_move_xy_time_2);
  this.appendValueInput("VALUE2").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_move_xy_time_3);
  this.appendValueInput("VALUE3").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_move_xy_time_4).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.move_xy_time = function(b, a) {
  if (!a.isStart) {
    var c;
    c = a.getNumberValue("VALUE1", a);
    var d = a.getNumberValue("VALUE2", a), e = a.getNumberValue("VALUE3", a);
    a.isStart = !0;
    a.frameCount = Math.floor(c * Entry.FPS);
    a.dX = d / a.frameCount;
    a.dY = e / a.frameCount;
  }
  if (0 != a.frameCount) {
    return b.setX(b.getX() + a.dX), b.setY(b.getY() + a.dY), a.frameCount--, b.brush && !b.brush.stop && b.brush.lineTo(b.getX(), -1 * b.getY()), a;
  }
  delete a.isStart;
  delete a.frameCount;
  return a.callReturn();
};
Blockly.Blocks.locate_time = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_locate_time_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_locate_time_2);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("sprites"), "VALUE");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_locate_time_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Blockly.Blocks.rotate_by_angle_time = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_rotate_by_angle_time_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_rotate_by_angle_time_2);
  this.appendDummyInput().appendField(new Blockly.FieldAngle("90"), "VALUE");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_rotate_by_angle_time_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.rotate_by_angle_time = function(b, a) {
  if (!a.isStart) {
    var c;
    c = a.getNumberValue("VALUE", a);
    var d = a.getNumberField("VALUE", a);
    a.isStart = !0;
    a.frameCount = Math.floor(c * Entry.FPS);
    a.dAngle = d / a.frameCount;
  }
  if (0 != a.frameCount) {
    return b.setRotation(b.getRotation() + a.dAngle), a.frameCount--, a;
  }
  delete a.isStart;
  delete a.frameCount;
  return a.callReturn();
};
Blockly.Blocks.bounce_when = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_bounce_when_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("bounce"), "VALUE");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_bounce_when_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setPreviousStatement(!0);
  this.setInputsInline(!0);
  this.setNextStatement(!0);
}};
Blockly.Blocks.bounce_wall = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_bounce_wall).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.bounce_wall = function(b, a) {
  var c = b.parent.getRotateMethod(), d = "free" == c ? (b.getRotation() + b.getDirection()).mod(360) : b.getDirection(), e = Entry.Utils.COLLISION.NONE;
  if (90 > d && 0 <= d || 360 > d && 270 <= d) {
    var e = b.collision == Entry.Utils.COLLISION.UP, f = ndgmr.checkPixelCollision(Entry.stage.wall.up, b.object, 0, !1);
    !f && e && (b.collision = Entry.Utils.COLLISION.NONE);
    f && e && (f = !1);
    f ? ("free" == c ? b.setRotation(-b.getRotation() - 2 * b.getDirection() + 180) : b.setDirection(-b.getDirection() + 180), b.collision = Entry.Utils.COLLISION.UP) : (e = b.collision == Entry.Utils.COLLISION.DOWN, f = ndgmr.checkPixelCollision(Entry.stage.wall.down, b.object, 0, !1), !f && e && (b.collision = Entry.Utils.COLLISION.NONE), f && e && (f = !1), f && ("free" == c ? b.setRotation(-b.getRotation() - 2 * b.getDirection() + 180) : b.setDirection(-b.getDirection() + 180), b.collision = 
    Entry.Utils.COLLISION.DOWN));
  } else {
    270 > d && 90 <= d && (e = b.collision == Entry.Utils.COLLISION.DOWN, f = ndgmr.checkPixelCollision(Entry.stage.wall.down, b.object, 0, !1), !f && e && (b.collision = Entry.Utils.COLLISION.NONE), f && e && (f = !1), f ? ("free" == c ? b.setRotation(-b.getRotation() - 2 * b.getDirection() + 180) : b.setDirection(-b.getDirection() + 180), b.collision = Entry.Utils.COLLISION.DOWN) : (e = b.collision == Entry.Utils.COLLISION.UP, f = ndgmr.checkPixelCollision(Entry.stage.wall.up, b.object, 0, !1), 
    !f && e && (b.collision = Entry.Utils.COLLISION.NONE), f && e && (f = !1), f && ("free" == c ? b.setRotation(-b.getRotation() - 2 * b.getDirection() + 180) : b.setDirection(-b.getDirection() + 180), b.collision = Entry.Utils.COLLISION.UP)));
  }
  360 > d && 180 <= d ? (e = b.collision == Entry.Utils.COLLISION.LEFT, d = ndgmr.checkPixelCollision(Entry.stage.wall.left, b.object, 0, !1), !d && e && (b.collision = Entry.Utils.COLLISION.NONE), d && e && (d = !1), d ? ("free" == c ? b.setRotation(-b.getRotation() - 2 * b.getDirection()) : b.setDirection(-b.getDirection() + 360), b.collision = Entry.Utils.COLLISION.LEFT) : (e = b.collision == Entry.Utils.COLLISION.RIGHT, d = ndgmr.checkPixelCollision(Entry.stage.wall.right, b.object, 0, !1), !d && 
  e && (b.collision = Entry.Utils.COLLISION.NONE), d && e && (d = !1), d && ("free" == c ? b.setRotation(-b.getRotation() - 2 * b.getDirection()) : b.setDirection(-b.getDirection() + 360), b.collision = Entry.Utils.COLLISION.RIGHT))) : 180 > d && 0 <= d && (e = b.collision == Entry.Utils.COLLISION.RIGHT, d = ndgmr.checkPixelCollision(Entry.stage.wall.right, b.object, 0, !1), !d && e && (b.collision = Entry.Utils.COLLISION.NONE), d && e && (d = !1), d ? ("free" == c ? b.setRotation(-b.getRotation() - 
  2 * b.getDirection()) : b.setDirection(-b.getDirection() + 360), b.collision = Entry.Utils.COLLISION.RIGHT) : (e = b.collision == Entry.Utils.COLLISION.LEFT, d = ndgmr.checkPixelCollision(Entry.stage.wall.left, b.object, 0, !1), !d && e && (b.collision = Entry.Utils.COLLISION.NONE), d && e && (d = !1), d && ("free" == c ? b.setRotation(-b.getRotation() - 2 * b.getDirection()) : b.setDirection(-b.getDirection() + 360), b.collision = Entry.Utils.COLLISION.LEFT)));
  return a.callReturn();
};
Blockly.Blocks.flip_arrow_horizontal = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_flip_arrow_horizontal).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.flip_arrow_horizontal = function(b, a) {
  b.setDirection(b.getDirection() + 180);
  return a.callReturn();
};
Blockly.Blocks.flip_arrow_vertical = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_flip_arrow_vertical).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.flip_arrow_vertical = function(b, a) {
  b.setDirection(b.getDirection() + 180);
  return a.callReturn();
};
Blockly.Blocks.see_angle_object = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_see_angle_object_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("spritesWithMouse"), "VALUE");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_see_angle_object_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.see_angle_object = function(b, a) {
  var c = a.getField("VALUE", a), d = b.getX(), e = b.getY();
  if (b.parent.id == c) {
    return a.callReturn();
  }
  "mouse" == c ? (c = Entry.stage.mouseCoordinate.y, d = Entry.stage.mouseCoordinate.x - d, e = c - e) : (c = Entry.container.getEntity(c), d = c.getX() - d, e = c.getY() - e);
  e = 0 === d && 0 === e ? b.getDirection() + b.getRotation() : 0 <= d ? -Math.atan(e / d) / Math.PI * 180 + 90 : -Math.atan(e / d) / Math.PI * 180 + 270;
  d = b.getDirection() + b.getRotation();
  b.setRotation(b.getRotation() + e - d);
  return a.callReturn();
};
Blockly.Blocks.see_angle_direction = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_see_angle_direction_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_see_angle_direction_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.see_angle_direction = function(b, a) {
  var c = a.getNumberValue("VALUE", a), d = b.getDirection() + b.getRotation();
  b.setRotation(b.getRotation() + c - d);
  return a.callReturn();
};
Blockly.Blocks.rotate_direction = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_rotate_direction_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_rotate_direction_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.rotate_direction = function(b, a) {
  var c = a.getNumberValue("VALUE", a);
  b.setDirection(c + b.getDirection());
  return a.callReturn();
};
Blockly.Blocks.locate_object_time = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_locate_object_time_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_locate_object_time_2);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("spritesWithMouse"), "TARGET");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_locate_object_time_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.locate_object_time = function(b, a) {
  if (!a.isStart) {
    var c, d, e;
    d = a.getField("TARGET", a);
    c = a.getNumberValue("VALUE", a);
    c = Math.floor(c * Entry.FPS);
    e = Entry.stage.mouseCoordinate;
    if (0 != c) {
      "mouse" == d ? (d = e.x - b.getX(), e = e.y - b.getY()) : (e = Entry.container.getEntity(d), d = e.getX() - b.getX(), e = e.getY() - b.getY()), a.isStart = !0, a.frameCount = c, a.dX = d / a.frameCount, a.dY = e / a.frameCount;
    } else {
      return "mouse" == d ? (d = Number(e.x), e = Number(e.y)) : (e = Entry.container.getEntity(d), d = e.getX(), e = e.getY()), b.setX(d), b.setY(e), b.brush && !b.brush.stop && b.brush.lineTo(b.getX(), -1 * b.getY()), a.callReturn();
    }
  }
  if (0 != a.frameCount) {
    return b.setX(b.getX() + a.dX), b.setY(b.getY() + a.dY), a.frameCount--, b.brush && !b.brush.stop && b.brush.lineTo(b.getX(), -1 * b.getY()), a;
  }
  delete a.isStart;
  delete a.frameCount;
  return a.callReturn();
};
Blockly.Blocks.rotate_absolute = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_set_direction_by_angle_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_set_direction_by_angle_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.rotate_absolute = function(b, a) {
  var c = a.getNumberValue("VALUE", a);
  b.setRotation(c);
  return a.callReturn();
};
Blockly.Blocks.rotate_relative = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_add_direction_by_angle_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_add_direction_by_angle_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.rotate_relative = function(b, a) {
  var c = a.getNumberValue("VALUE", a);
  b.setRotation(c + b.getRotation());
  return a.callReturn();
};
Blockly.Blocks.direction_absolute = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_see_angle_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_see_angle_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.direction_absolute = function(b, a) {
  var c = a.getNumberValue("VALUE", a);
  b.setDirection(c);
  return a.callReturn();
};
Blockly.Blocks.direction_relative = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_rotate_direction_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_rotate_direction_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.direction_relative = function(b, a) {
  var c = a.getNumberValue("VALUE", a);
  b.setDirection(c + b.getDirection());
  return a.callReturn();
};
Blockly.Blocks.move_to_angle = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_move_direction_angle_1);
  this.appendValueInput("ANGLE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_move_direction_angle_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_move_direction_angle_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.move_to_angle = function(b, a) {
  var c = a.getNumberValue("VALUE", a), d = a.getNumberValue("ANGLE", a);
  b.setX(b.getX() + c * Math.cos((d - 90) / 180 * Math.PI));
  b.setY(b.getY() - c * Math.sin((d - 90) / 180 * Math.PI));
  b.brush && !b.brush.stop && b.brush.lineTo(b.getX(), -1 * b.getY());
  return a.callReturn();
};
Blockly.Blocks.rotate_by_time = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_add_direction_by_angle_time_explain_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_add_direction_by_angle_time_2);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_add_direction_by_angle_time_1);
  this.appendValueInput("ANGLE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_add_direction_by_angle_time_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.rotate_by_time = function(b, a) {
  if (!a.isStart) {
    var c;
    c = a.getNumberValue("VALUE", a);
    var d = a.getNumberValue("ANGLE", a);
    a.isStart = !0;
    a.frameCount = Math.floor(c * Entry.FPS);
    a.dAngle = d / a.frameCount;
  }
  if (0 != a.frameCount) {
    return b.setRotation(b.getRotation() + a.dAngle), a.frameCount--, a;
  }
  delete a.isStart;
  delete a.frameCount;
  return a.callReturn();
};
Blockly.Blocks.direction_relative_duration = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_direction_relative_duration_1);
  this.appendValueInput("DURATION").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_direction_relative_duration_2);
  this.appendValueInput("AMOUNT").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_direction_relative_duration_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.direction_relative_duration = function(b, a) {
  if (!a.isStart) {
    var c;
    c = a.getNumberValue("DURATION", a);
    var d = a.getNumberValue("AMOUNT", a);
    a.isStart = !0;
    a.frameCount = Math.floor(c * Entry.FPS);
    a.dDirection = d / a.frameCount;
  }
  if (0 != a.frameCount) {
    return b.setDirection(b.getDirection() + a.dDirection), a.frameCount--, a;
  }
  delete a.isStart;
  delete a.frameCount;
  delete a.dDirection;
  return a.callReturn();
};
Entry.Neobot = {name:"neobot", PORT_MAP:{1:0, 2:0, 3:0, SERVO1:0, SERVO2:0, SERVO1_SPEED:3, SERVO2_SPEED:3, LMOT:0, RMOT:0, note:0, octave:0, duration:0, sound_check:0, O_1:0, O_2:0}, setZero:function() {
  for (var b in Entry.Neobot.PORT_MAP) {
    Entry.hw.sendQueue[b] = Entry.Neobot.PORT_MAP[b];
  }
  Entry.hw.update();
}, name:"neobot", monitorTemplate:{imgPath:"hw/neobot.png", width:268, height:270, ports:{1:{name:Lang.Hw.port_en + " 1 " + Lang.Hw.port_ko, type:"input", pos:{x:78, y:9}}, 2:{name:Lang.Hw.port_en + " 2 " + Lang.Hw.port_ko, type:"input", pos:{x:115, y:9}}, 3:{name:Lang.Hw.port_en + " 3 " + Lang.Hw.port_ko, type:"input", pos:{x:153, y:9}}, LMOT:{name:Lang.Hw.left + " " + Lang.Hw.motor, type:"output", pos:{x:78, y:259}}, RMOT:{name:Lang.Hw.right + " " + Lang.Hw.motor, type:"output", pos:{x:191, y:259}}, 
note:{name:Lang.Hw.buzzer, type:"output", pos:{x:98, y:184}}, SERVO1:{name:Lang.Hw.sub + " " + Lang.Hw.motor + " 1", type:"output", pos:{x:115, y:259}}, SERVO2:{name:Lang.Hw.sub + " " + Lang.Hw.motor + " 2", type:"output", pos:{x:191, y:9}}}}};
Blockly.Blocks.neobot_sensor_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdown([["1\ubc88 \ud3ec\ud2b8", "1"], ["2\ubc88 \ud3ec\ud2b8", "2"], ["3\ubc88 \ud3ec\ud2b8", "3"], ["\ub9ac\ubaa8\ucee8", "4"]]), "PORT").appendField(" \uac12");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.neobot_sensor_value = function(b, a) {
  var c = a.getStringField("PORT");
  return Entry.hw.portData[c];
};
Blockly.Blocks.neobot_turn_left = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uc67c\ucabd\ubaa8\ud130\ub97c").appendField(new Blockly.FieldDropdown([["\uc55e\uc73c\ub85c", "1"], ["\ub4a4\ub85c", "-1"]]), "DIRECTION").appendField(new Blockly.FieldDropdown([["\ub290\ub9ac\uac8c", "1"], ["\ubcf4\ud1b5", "2"], ["\ube60\ub974\uac8c", "3"]]), "VALUE").appendField("\ud68c\uc804").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.neobot_turn_left = function(b, a) {
  var c = a.getNumberField("VALUE"), d = a.getNumberField("DIRECTION");
  Entry.hw.sendQueue.LMOT = c * d;
  return a.callReturn();
};
Blockly.Blocks.neobot_stop_left = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uc67c\ucabd\ubaa8\ud130 \uc815\uc9c0").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.neobot_stop_left = function(b, a) {
  Entry.hw.sendQueue.LMOT = 0;
  return a.callReturn();
};
Blockly.Blocks.neobot_turn_right = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uc624\ub978\ucabd\ubaa8\ud130\ub97c").appendField(new Blockly.FieldDropdown([["\uc55e\uc73c\ub85c", "1"], ["\ub4a4\ub85c", "-1"]]), "DIRECTION").appendField(new Blockly.FieldDropdown([["\ub290\ub9ac\uac8c", "1"], ["\ubcf4\ud1b5", "2"], ["\ube60\ub974\uac8c", "3"]]), "VALUE").appendField("\ud68c\uc804").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.neobot_turn_right = function(b, a) {
  var c = a.getNumberField("VALUE"), d = a.getNumberField("DIRECTION");
  Entry.hw.sendQueue.RMOT = c * d;
  return a.callReturn();
};
Blockly.Blocks.neobot_stop_right = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uc624\ub978\ucabd\ubaa8\ud130 \uc815\uc9c0").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.neobot_stop_right = function(b, a) {
  Entry.hw.sendQueue.RMOT = 0;
  return a.callReturn();
};
Blockly.Blocks.neobot_run_motor = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["\uc591\ucabd", "1"], ["\uc67c\ucabd", "2"], ["\uc624\ub978\ucabd", "3"]]), "TYPE").appendField("\ubaa8\ud130\ub97c ");
  this.appendValueInput("DURATION").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("\ucd08\uac04").appendField(new Blockly.FieldDropdown([["\ub290\ub9ac\uac8c", "1"], ["\ubcf4\ud1b5", "2"], ["\ube60\ub974\uac8c", "3"]]), "VALUE").appendField(new Blockly.FieldDropdown([["\uc804\uc9c4", "1"], ["\ud6c4\uc9c4", "2"], ["\uc88c\ud68c\uc804", "3"], ["\uc6b0\ud68c\uc804", "4"]]), "DIRECTION").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.neobot_run_motor = function(b, a) {
  if (a.isStart) {
    if (1 == a.timeFlag) {
      var c = a.getNumberField("TYPE"), d = a.getNumberField("VALUE");
      switch(a.getNumberField("DIRECTION")) {
        case 1:
          Entry.hw.sendQueue.LMOT = d;
          Entry.hw.sendQueue.RMOT = d;
          break;
        case 2:
          Entry.hw.sendQueue.LMOT = -1 * d;
          Entry.hw.sendQueue.RMOT = -1 * d;
          break;
        case 3:
          Entry.hw.sendQueue.LMOT = d;
          Entry.hw.sendQueue.RMOT = -1 * d;
          break;
        case 4:
          Entry.hw.sendQueue.LMOT = -1 * d, Entry.hw.sendQueue.RMOT = d;
      }
      2 === c ? Entry.hw.sendQueue.RMOT = 0 : 3 === c && (Entry.hw.sendQueue.LMOT = 0);
      return a;
    }
    delete a.timeFlag;
    delete a.isStart;
    Entry.engine.isContinue = !1;
    Entry.hw.sendQueue.LMOT = 0;
    Entry.hw.sendQueue.RMOT = 0;
    return a.callReturn();
  }
  a.isStart = !0;
  a.timeFlag = 1;
  c = 1E3 * a.getNumberValue("DURATION");
  setTimeout(function() {
    a.timeFlag = 0;
  }, c);
  return a;
};
Blockly.Blocks.neobot_servo_1 = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("SERVO1\uc5d0 \uc5f0\uacb0\ub41c \uc11c\ubcf4\ubaa8\ud130\ub97c").appendField(new Blockly.FieldDropdown([["\ube60\ub978", "3"], ["\ubcf4\ud1b5", "2"], ["\ub290\ub9b0", "1"]]), "SPEED").appendField("\uc18d\ub3c4\ub85c").appendField(new Blockly.FieldDropdown([["0\ub3c4", "0"], ["10\ub3c4", "1"], ["20\ub3c4", "2"], ["30\ub3c4", "3"], ["40\ub3c4", "4"], ["50\ub3c4", "5"], ["60\ub3c4", "6"], ["70\ub3c4", "7"], ["80\ub3c4", "8"], ["90\ub3c4", "9"], ["100\ub3c4", "10"], 
  ["110\ub3c4", "11"], ["120\ub3c4", "12"], ["130\ub3c4", "13"], ["140\ub3c4", "14"], ["150\ub3c4", "15"], ["160\ub3c4", "16"]]), "VALUE").appendField("\ub85c \uc774\ub3d9").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.neobot_servo_1 = function(b, a) {
  var c = a.getNumberField("VALUE"), d = a.getNumberField("SPEED");
  Entry.hw.sendQueue.SERVO1 = c;
  Entry.hw.sendQueue.SERVO1_SPEED = d;
  return a.callReturn();
};
Blockly.Blocks.neobot_servo_2 = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("SERVO2\uc5d0 \uc5f0\uacb0\ub41c \uc11c\ubcf4\ubaa8\ud130\ub97c").appendField(new Blockly.FieldDropdown([["\ube60\ub978", "3"], ["\ubcf4\ud1b5", "2"], ["\ub290\ub9b0", "1"]]), "SPEED").appendField("\uc18d\ub3c4\ub85c").appendField(new Blockly.FieldDropdown([["0\ub3c4", "0"], ["10\ub3c4", "1"], ["20\ub3c4", "2"], ["30\ub3c4", "3"], ["40\ub3c4", "4"], ["50\ub3c4", "5"], ["60\ub3c4", "6"], ["70\ub3c4", "7"], ["80\ub3c4", "8"], ["90\ub3c4", "9"], ["100\ub3c4", "10"], 
  ["110\ub3c4", "11"], ["120\ub3c4", "12"], ["130\ub3c4", "13"], ["140\ub3c4", "14"], ["150\ub3c4", "15"], ["160\ub3c4", "16"]]), "VALUE").appendField("\ub85c \uc774\ub3d9").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.neobot_servo_2 = function(b, a) {
  var c = a.getNumberField("VALUE"), d = a.getNumberField("SPEED");
  Entry.hw.sendQueue.SERVO2 = c;
  Entry.hw.sendQueue.SERVO2_SPEED = d;
  return a.callReturn();
};
Blockly.Blocks.neobot_play_note_for = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uba5c\ub85c\ub514").appendField(new Blockly.FieldDropdown([[Lang.General.note_c + "", "1"], [Lang.General.note_d + "", "2"], [Lang.General.note_e + "", "3"], [Lang.General.note_f + "", "4"], [Lang.General.note_g + "", "5"], [Lang.General.note_a + "", "6"], [Lang.General.note_b + "", "7"], [Lang.General.note_c + "", "8"]]), "NOTE").appendField("\uc744(\ub97c)").appendField(new Blockly.FieldDropdown([["1", "0"], ["2", "1"], ["3", "2"]]), "OCTAVE").appendField("\uc625\ud0c0\ube0c\ub85c").appendField(new Blockly.FieldDropdown([["2\ubd84\uc74c\ud45c", 
  "2"], ["4\ubd84\uc74c\ud45c", "4"], ["8\ubd84\uc74c\ud45c", "8"]]), "DURATION");
  this.appendDummyInput().appendField("\uae38\uc774\ub9cc\ud07c \uc18c\ub9ac\ub0b4\uae30").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.neobot_play_note_for = function(b, a) {
  var c = Entry.hw.sendQueue;
  if (a.isStart) {
    if (1 == a.timeFlag) {
      return a;
    }
    delete a.timeFlag;
    delete a.isStart;
    Entry.engine.isContinue = !1;
    return a.callReturn();
  }
  var d = a.getNumberField("NOTE", a), e = a.getNumberField("OCTAVE", a), f = a.getNumberField("DURATION", a);
  a.note = d;
  a.isStart = !0;
  a.timeFlag = 1;
  c.note = d;
  c.octave = e;
  c.duration = f;
  c.sound_check = (1E5 * Math.random()).toFixed(0);
  setTimeout(function() {
    a.timeFlag = 0;
  }, 1 / f * 2E3);
  return a;
};
Blockly.Blocks.neobot_set_sensor_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["1", "O_1"], ["2", "O_2"]]), "PORT").appendField("\ubc88 \ud3ec\ud2b8\uc758 \uac12\uc744").appendField(new Blockly.FieldDropdown([["\ucf1c\uae30", "1"], ["\ub044\uae30", "0"]]), "VALUE");
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.neobot_set_sensor_value = function(b, a) {
  var c = Entry.hw.sendQueue, d = a.getStringField("PORT", a), e = a.getNumberField("VALUE", a);
  c[d] = e;
  return a.callReturn();
};
Entry.Robotis_carCont = {INSTRUCTION:{NONE:0, WRITE:3, READ:2}, CONTROL_TABLE:{CM_LED:[67, 1], CM_SPRING_RIGHT:[69, 1, 69, 2], CM_SPRING_LEFT:[70, 1, 69, 2], CM_SWITCH:[71, 1], CM_SOUND_DETECTED:[86, 1], CM_SOUND_DETECTING:[87, 1], CM_IR_LEFT:[91, 2, 91, 4], CM_IR_RIGHT:[93, 2, 91, 4], CM_CALIBRATION_LEFT:[95, 2], CM_CALIBRATION_RIGHT:[97, 2], AUX_MOTOR_SPEED_LEFT:[152, 2], AUX_MOTOR_SPEED_RIGHT:[154, 2]}, setZero:function() {
  this.setRobotisData([[Entry.Robotis_carCont.INSTRUCTION.WRITE, 152, 2, 0], [Entry.Robotis_carCont.INSTRUCTION.WRITE, 154, 2, 0]]);
  Entry.hw.sendQueue.setZero = [1];
  this.update();
  this.setRobotisData(null);
  Entry.hw.sendQueue.setZero = null;
  this.update();
}, name:"robotis_carCont", delay:40, postCallReturn:function(b, a, c) {
  if (0 >= c) {
    return this.setRobotisData(a), this.update(), b.callReturn();
  }
  if (b.isStart) {
    if (1 == b.timeFlag) {
      return this.setRobotisData(null), b;
    }
    delete b.timeFlag;
    delete b.isStart;
    Entry.engine.isContinue = !1;
    this.update();
    return b.callReturn();
  }
  b.isStart = !0;
  b.timeFlag = 1;
  this.setRobotisData(a);
  setTimeout(function() {
    b.timeFlag = 0;
  }, c);
  return b;
}, wait:function(b, a) {
  Entry.hw.socket.send(JSON.stringify(b));
  for (var c = (new Date).getTime(), d = c;d < c + a;) {
    d = (new Date).getTime();
  }
}, update:function() {
  Entry.hw.update();
  this.setRobotisData(null);
}, setRobotisData:function(b) {
  Entry.hw.sendQueue.ROBOTIS_DATA = null == b ? null : Entry.hw.sendQueue.ROBOTIS_DATA ? Entry.hw.sendQueue.ROBOTIS_DATA.concat(b) : b;
}};
Entry.Robotis_openCM70 = {INSTRUCTION:{NONE:0, WRITE:3, READ:2}, CONTROL_TABLE:{CM_LED_R:[79, 1], CM_LED_G:[80, 1], CM_LED_B:[81, 1], CM_BUZZER_INDEX:[84, 1], CM_BUZZER_TIME:[85, 1], CM_SOUND_DETECTED:[86, 1], CM_SOUND_DETECTING:[87, 1], CM_USER_BUTTON:[26, 1], CM_MOTION:[66, 1], AUX_SERVO_POSITION:[152, 2], AUX_IR:[168, 2], AUX_TOUCH:[202, 1], AUX_TEMPERATURE:[234, 1], AUX_ULTRASONIC:[242, 1], AUX_MAGNETIC:[250, 1], AUX_MOTION_DETECTION:[258, 1], AUX_COLOR:[266, 1], AUX_CUSTOM:[216, 2], AUX_BRIGHTNESS:[288, 
2], AUX_HYDRO_THEMO_HUMIDITY:[274, 1], AUX_HYDRO_THEMO_TEMPER:[282, 1], AUX_SERVO_MODE:[126, 1], AUX_SERVO_SPEED:[136, 2], AUX_MOTOR_SPEED:[136, 2], AUX_LED_MODULE:[210, 1]}, setZero:function() {
  Entry.Robotis_carCont.setRobotisData([[Entry.Robotis_openCM70.INSTRUCTION.WRITE, 136, 2, 0], [Entry.Robotis_openCM70.INSTRUCTION.WRITE, 138, 2, 0], [Entry.Robotis_openCM70.INSTRUCTION.WRITE, 140, 2, 0], [Entry.Robotis_openCM70.INSTRUCTION.WRITE, 142, 2, 0], [Entry.Robotis_openCM70.INSTRUCTION.WRITE, 144, 2, 0], [Entry.Robotis_openCM70.INSTRUCTION.WRITE, 146, 2, 0], [Entry.Robotis_openCM70.INSTRUCTION.WRITE, 79, 1, 0], [Entry.Robotis_openCM70.INSTRUCTION.WRITE, 80, 1, 0], [Entry.Robotis_openCM70.INSTRUCTION.WRITE, 
  81, 1, 0]]);
  Entry.hw.sendQueue.setZero = [1];
  Entry.Robotis_carCont.update();
  Entry.Robotis_carCont.setRobotisData(null);
  Entry.hw.sendQueue.setZero = null;
  Entry.Robotis_carCont.update();
}, name:"robotis_openCM70", delay:15};
Blockly.Blocks.robotis_openCM70_cm_custom_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_cm_custom);
  this.appendDummyInput().appendField("(");
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(")");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["BYTE", "BYTE"], ["WORD", "WORD"], ["DWORD", "DWORD"]]), "SIZE");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_value);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.robotis_openCM70_cm_custom_value = function(b, a) {
  var c = Entry.Robotis_openCM70.INSTRUCTION.READ, d = 0, e = 0, f = 0, d = a.getStringField("SIZE");
  "BYTE" == d ? e = 1 : "WORD" == d ? e = 2 : "DWORD" == d && (e = 4);
  f = d = a.getNumberValue("VALUE");
  Entry.Robotis_carCont.setRobotisData([[c, d, e, 0, e]]);
  Entry.Robotis_carCont.update();
  return Entry.hw.portData[f];
};
Blockly.Blocks.robotis_openCM70_sensor_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_cm);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown(this.sensorList()), "SENSOR");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_value);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}, sensorList:function() {
  var b = [];
  b.push([Lang.Blocks.robotis_cm_sound_detected, "CM_SOUND_DETECTED"]);
  b.push([Lang.Blocks.robotis_cm_sound_detecting, "CM_SOUND_DETECTING"]);
  b.push([Lang.Blocks.robotis_cm_user_button, "CM_USER_BUTTON"]);
  return b;
}};
Entry.block.robotis_openCM70_sensor_value = function(b, a) {
  var c = Entry.Robotis_openCM70.INSTRUCTION.READ, d = 0, e = 0, f = 0, g = 0, h = a.getStringField("SENSOR");
  "CM_SOUND_DETECTED" == h ? (f = Entry.Robotis_openCM70.CONTROL_TABLE.CM_SOUND_DETECTED[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.CM_SOUND_DETECTED[1], d = Entry.Robotis_openCM70.CONTROL_TABLE.CM_SOUND_DETECTED[0], e = Entry.Robotis_openCM70.CONTROL_TABLE.CM_SOUND_DETECTED[1]) : "CM_SOUND_DETECTING" == h ? (f = Entry.Robotis_openCM70.CONTROL_TABLE.CM_SOUND_DETECTING[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.CM_SOUND_DETECTING[1], d = Entry.Robotis_openCM70.CONTROL_TABLE.CM_SOUND_DETECTING[0], 
  e = Entry.Robotis_openCM70.CONTROL_TABLE.CM_SOUND_DETECTING[1]) : "CM_USER_BUTTON" == h && (f = Entry.Robotis_openCM70.CONTROL_TABLE.CM_USER_BUTTON[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.CM_USER_BUTTON[1], d = Entry.Robotis_openCM70.CONTROL_TABLE.CM_USER_BUTTON[0], e = Entry.Robotis_openCM70.CONTROL_TABLE.CM_USER_BUTTON[1]);
  f += 0 * g;
  Entry.Robotis_carCont.setRobotisData([[c, d, e, 0, g]]);
  Entry.Robotis_carCont.update();
  return Entry.hw.portData[f];
};
Blockly.Blocks.robotis_openCM70_aux_sensor_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown(this.portList()), "PORT");
  this.appendDummyInput().appendField(" ");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown(this.sensorList()), "SENSOR");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_value);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}, portList:function() {
  var b = [];
  b.push([Lang.Blocks.robotis_common_port_3, "PORT_3"]);
  b.push([Lang.Blocks.robotis_common_port_4, "PORT_4"]);
  b.push([Lang.Blocks.robotis_common_port_5, "PORT_5"]);
  b.push([Lang.Blocks.robotis_common_port_6, "PORT_6"]);
  return b;
}, sensorList:function() {
  var b = [];
  b.push([Lang.Blocks.robotis_aux_servo_position, "AUX_SERVO_POSITION"]);
  b.push([Lang.Blocks.robotis_aux_ir, "AUX_IR"]);
  b.push([Lang.Blocks.robotis_aux_touch, "AUX_TOUCH"]);
  b.push([Lang.Blocks.robotis_aux_brightness, "AUX_BRIGHTNESS"]);
  b.push([Lang.Blocks.robotis_aux_hydro_themo_humidity, "AUX_HYDRO_THEMO_HUMIDITY"]);
  b.push([Lang.Blocks.robotis_aux_hydro_themo_temper, "AUX_HYDRO_THEMO_TEMPER"]);
  b.push([Lang.Blocks.robotis_aux_temperature, "AUX_TEMPERATURE"]);
  b.push([Lang.Blocks.robotis_aux_ultrasonic, "AUX_ULTRASONIC"]);
  b.push([Lang.Blocks.robotis_aux_magnetic, "AUX_MAGNETIC"]);
  b.push([Lang.Blocks.robotis_aux_motion_detection, "AUX_MOTION_DETECTION"]);
  b.push([Lang.Blocks.robotis_aux_color, "AUX_COLOR"]);
  b.push([Lang.Blocks.robotis_aux_custom, "AUX_CUSTOM"]);
  return b;
}};
Entry.block.robotis_openCM70_aux_sensor_value = function(b, a) {
  var c = Entry.Robotis_openCM70.INSTRUCTION.READ, d = 0, e = 0, f = 0, g = 0, h = a.getStringField("PORT"), k = a.getStringField("SENSOR"), l = 0;
  "PORT_3" == h ? l = 2 : "PORT_4" == h ? l = 3 : "PORT_5" == h ? l = 4 : "PORT_6" == h && (l = 5);
  "AUX_SERVO_POSITION" == k ? (f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_SERVO_POSITION[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_SERVO_POSITION[1], d = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_SERVO_POSITION[0], e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_SERVO_POSITION[1]) : "AUX_IR" == k ? (f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_IR[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_IR[1], d = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_IR[0], e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_IR[1]) : 
  "AUX_TOUCH" == k ? (f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_TOUCH[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_TOUCH[1], d = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_TOUCH[0], e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_TOUCH[1]) : "AUX_TEMPERATURE" == k ? (f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_TEMPERATURE[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_TEMPERATURE[1], d = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_TEMPERATURE[0], e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_TEMPERATURE[1]) : 
  "AUX_BRIGHTNESS" == k ? (f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_BRIGHTNESS[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_BRIGHTNESS[1], d = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_BRIGHTNESS[0], e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_BRIGHTNESS[1]) : "AUX_HYDRO_THEMO_HUMIDITY" == k ? (f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_HYDRO_THEMO_HUMIDITY[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_HYDRO_THEMO_HUMIDITY[1], d = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_HYDRO_THEMO_HUMIDITY[0], 
  e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_HYDRO_THEMO_HUMIDITY[1]) : "AUX_HYDRO_THEMO_TEMPER" == k ? (f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_HYDRO_THEMO_TEMPER[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_HYDRO_THEMO_TEMPER[1], d = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_HYDRO_THEMO_TEMPER[0], e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_HYDRO_THEMO_TEMPER[1]) : "AUX_ULTRASONIC" == k ? (f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_ULTRASONIC[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_ULTRASONIC[1], 
  d = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_ULTRASONIC[0], e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_ULTRASONIC[1]) : "AUX_MAGNETIC" == k ? (f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_MAGNETIC[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_MAGNETIC[1], d = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_MAGNETIC[0], e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_MAGNETIC[1]) : "AUX_MOTION_DETECTION" == k ? (f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_MOTION_DETECTION[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_MOTION_DETECTION[1], 
  d = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_MOTION_DETECTION[0], e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_MOTION_DETECTION[1]) : "AUX_COLOR" == k ? (f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_COLOR[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_COLOR[1], d = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_COLOR[0], e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_COLOR[1]) : "AUX_CUSTOM" == k && (f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_CUSTOM[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_CUSTOM[1], 
  d = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_CUSTOM[0], e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_CUSTOM[1]);
  f += l * g;
  0 != l && (e = 6 * g);
  Entry.Robotis_carCont.setRobotisData([[c, d, e, 0, g]]);
  Entry.Robotis_carCont.update();
  return Entry.hw.portData[f];
};
Blockly.Blocks.robotis_openCM70_cm_buzzer_index = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_cm);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_cm_buzzer_index);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.General.note_a + "(0)", "0"], [Lang.General.note_a + "#(1)", "1"], [Lang.General.note_b + "(2)", "2"], [Lang.General.note_c + "(3)", "3"], [Lang.General.note_c + "#(4)", "4"], [Lang.General.note_d + "(5)", "5"], [Lang.General.note_d + "#(6)", "6"], [Lang.General.note_e + "(7)", "7"], [Lang.General.note_f + "(8)", "8"], [Lang.General.note_f + "#(9)", "9"], [Lang.General.note_g + "(10)", "10"], [Lang.General.note_g + "#(11)", "11"], 
  [Lang.General.note_a + "(12)", "12"], [Lang.General.note_a + "#(13)", "13"], [Lang.General.note_b + "(14)", "14"], [Lang.General.note_c + "(15)", "15"], [Lang.General.note_c + "#(16)", "16"], [Lang.General.note_d + "(17)", "17"], [Lang.General.note_d + "#(18)", "18"], [Lang.General.note_e + "(19)", "19"], [Lang.General.note_f + "(20)", "20"], [Lang.General.note_f + "#(21)", "21"], [Lang.General.note_g + "(22)", "22"], [Lang.General.note_g + "#(23)", "23"], [Lang.General.note_a + "(24)", "24"], 
  [Lang.General.note_a + "#(25)", "25"], [Lang.General.note_b + "(26)", "26"], [Lang.General.note_c + "(27)", "27"], [Lang.General.note_c + "#(28)", "28"], [Lang.General.note_d + "(29)", "29"], [Lang.General.note_d + "#(30)", "30"], [Lang.General.note_e + "(31)", "31"], [Lang.General.note_f + "(32)", "32"], [Lang.General.note_f + "#(33)", "33"], [Lang.General.note_g + "(34)", "34"], [Lang.General.note_g + "#(35)", "35"], [Lang.General.note_a + "(36)", "36"], [Lang.General.note_a + "#(37)", "37"], 
  [Lang.General.note_b + "(38)", "38"], [Lang.General.note_c + "(39)", "39"], [Lang.General.note_c + "#(40)", "40"], [Lang.General.note_d + "(41)", "41"], [Lang.General.note_d + "#(42)", "42"], [Lang.General.note_e + "(43)", "43"], [Lang.General.note_f + "(44)", "44"], [Lang.General.note_f + "#(45)", "45"], [Lang.General.note_g + "(46)", "46"], [Lang.General.note_g + "#(47)", "47"], [Lang.General.note_a + "(48)", "48"], [Lang.General.note_a + "#(49)", "49"], [Lang.General.note_b + "(50)", "50"], 
  [Lang.General.note_c + "(51)", "51"]]), "CM_BUZZER_INDEX").appendField(Lang.Blocks.LOOKS_dialog_time_2);
  this.appendValueInput("CM_BUZZER_TIME").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_dialog_time_3).appendField(Lang.Blocks.robotis_common_play_buzzer).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_cm_buzzer_index = function(b, a) {
  var c = a.getField("CM_BUZZER_INDEX", a), d = a.getNumberValue("CM_BUZZER_TIME", a), e = Entry.Robotis_openCM70.INSTRUCTION.WRITE, f = 0, g = 0, h = 0, k = 0, l = 0, f = Entry.Robotis_openCM70.CONTROL_TABLE.CM_BUZZER_TIME[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.CM_BUZZER_TIME[1], h = parseInt(10 * d);
  50 < h && (h = 50);
  k = Entry.Robotis_openCM70.CONTROL_TABLE.CM_BUZZER_INDEX[0];
  l = Entry.Robotis_openCM70.CONTROL_TABLE.CM_BUZZER_INDEX[1];
  return Entry.Robotis_carCont.postCallReturn(a, [[e, f, g, h], [e, k, l, c]], 1E3 * d);
};
Blockly.Blocks.robotis_openCM70_cm_buzzer_melody = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_cm);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_cm_buzzer_melody);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["0", "0"], ["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"], ["9", "9"], ["10", "10"], ["11", "11"], ["12", "12"], ["13", "13"], ["14", "14"], ["15", "15"], ["16", "16"], ["17", "17"], ["18", "18"], ["19", "19"], ["20", "20"], ["21", "21"], ["22", "22"], ["23", "23"], ["24", "24"]]), "CM_BUZZER_MELODY");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_index_number);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_play_buzzer).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_cm_buzzer_melody = function(b, a) {
  var c = a.getField("CM_BUZZER_MELODY", a), d = Entry.Robotis_openCM70.INSTRUCTION.WRITE, e = 0, f = 0, g = 0, h = 0, e = Entry.Robotis_openCM70.CONTROL_TABLE.CM_BUZZER_TIME[0], f = Entry.Robotis_openCM70.CONTROL_TABLE.CM_BUZZER_TIME[1], g = Entry.Robotis_openCM70.CONTROL_TABLE.CM_BUZZER_INDEX[0], h = Entry.Robotis_openCM70.CONTROL_TABLE.CM_BUZZER_INDEX[1];
  return Entry.Robotis_carCont.postCallReturn(a, [[d, e, f, 255], [d, g, h, c]], 1E3);
};
Blockly.Blocks.robotis_openCM70_cm_sound_detected_clear = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_cm_clear_sound_detected).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_cm_sound_detected_clear = function(b, a) {
  var c = Entry.Robotis_openCM70.INSTRUCTION.WRITE, d = 0, e = 0, d = Entry.Robotis_openCM70.CONTROL_TABLE.CM_SOUND_DETECTED[0], e = Entry.Robotis_openCM70.CONTROL_TABLE.CM_SOUND_DETECTED[1];
  return Entry.Robotis_carCont.postCallReturn(a, [[c, d, e, 0]], Entry.Robotis_openCM70.delay);
};
Blockly.Blocks.robotis_openCM70_cm_led = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_cm);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_red_color, "CM_LED_R"], [Lang.Blocks.robotis_common_green_color, "CM_LED_G"], [Lang.Blocks.robotis_common_blue_color, "CM_LED_B"]]), "CM_LED").appendField("LED").appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_on, "1"], [Lang.Blocks.robotis_common_off, "0"]]), "VALUE").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_cm_led = function(b, a) {
  var c = a.getField("CM_LED", a), d = a.getField("VALUE", a), e = Entry.Robotis_openCM70.INSTRUCTION.WRITE, f = 0, g = 0;
  "CM_LED_R" == c ? (f = Entry.Robotis_openCM70.CONTROL_TABLE.CM_LED_R[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.CM_LED_R[1]) : "CM_LED_G" == c ? (f = Entry.Robotis_openCM70.CONTROL_TABLE.CM_LED_G[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.CM_LED_G[1]) : "CM_LED_B" == c && (f = Entry.Robotis_openCM70.CONTROL_TABLE.CM_LED_B[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.CM_LED_B[1]);
  return Entry.Robotis_carCont.postCallReturn(a, [[e, f, g, d]], Entry.Robotis_openCM70.delay);
};
Blockly.Blocks.robotis_openCM70_cm_motion = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_motion);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_index_number);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_play_motion).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_cm_motion = function(b, a) {
  var c = Entry.Robotis_openCM70.INSTRUCTION.WRITE, d = 0, e = 0, f = 0, d = Entry.Robotis_openCM70.CONTROL_TABLE.CM_MOTION[0], e = Entry.Robotis_openCM70.CONTROL_TABLE.CM_MOTION[1], f = a.getNumberValue("VALUE", a);
  return Entry.Robotis_carCont.postCallReturn(a, [[c, d, e, f]], Entry.Robotis_openCM70.delay);
};
Blockly.Blocks.robotis_openCM70_aux_motor_speed = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_port_1, "1"], [Lang.Blocks.robotis_common_port_2, "2"]]), "PORT").appendField(Lang.Blocks.robotis_openCM70_aux_motor_speed_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_clockwhise, "CW"], [Lang.Blocks.robotis_common_counter_clockwhise, "CCW"]]), "DIRECTION_ANGLE").appendField(Lang.Blocks.robotis_openCM70_aux_motor_speed_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_set).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_aux_motor_speed = function(b, a) {
  var c = a.getField("PORT", a), d = a.getField("DIRECTION_ANGLE", a), e = a.getNumberValue("VALUE"), f = Entry.Robotis_openCM70.INSTRUCTION.WRITE, g = 0, h = 0, g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_MOTOR_SPEED[0], h = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_MOTOR_SPEED[1];
  "CW" == d ? (e += 1024, 2047 < e && (e = 2047)) : 1023 < e && (e = 1023);
  return Entry.Robotis_carCont.postCallReturn(a, [[f, g + (c - 1) * h, h, e]], Entry.Robotis_openCM70.delay);
};
Blockly.Blocks.robotis_openCM70_aux_servo_mode = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_port_3, "3"], [Lang.Blocks.robotis_common_port_4, "4"], [Lang.Blocks.robotis_common_port_5, "5"], [Lang.Blocks.robotis_common_port_6, "6"]]), "PORT").appendField(Lang.Blocks.robotis_openCM70_aux_servo_mode_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_wheel_mode, "0"], [Lang.Blocks.robotis_common_joint_mode, "1"]]), "MODE");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_set).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_aux_servo_mode = function(b, a) {
  var c = a.getField("PORT", a), d = a.getField("MODE", a), e = Entry.Robotis_openCM70.INSTRUCTION.WRITE, f = 0, g = 0, f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_SERVO_MODE[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_SERVO_MODE[1];
  return Entry.Robotis_carCont.postCallReturn(a, [[e, f + (c - 1) * g, g, d]], Entry.Robotis_openCM70.delay);
};
Blockly.Blocks.robotis_openCM70_aux_servo_speed = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_port_3, "3"], [Lang.Blocks.robotis_common_port_4, "4"], [Lang.Blocks.robotis_common_port_5, "5"], [Lang.Blocks.robotis_common_port_6, "6"]]), "PORT").appendField(Lang.Blocks.robotis_openCM70_aux_servo_speed_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_clockwhise, "CW"], [Lang.Blocks.robotis_common_counter_clockwhise, "CCW"]]), "DIRECTION_ANGLE").appendField(Lang.Blocks.robotis_openCM70_aux_servo_speed_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_set).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_aux_servo_speed = function(b, a) {
  var c = a.getField("PORT", a), d = a.getField("DIRECTION_ANGLE", a), e = a.getNumberValue("VALUE"), f = Entry.Robotis_openCM70.INSTRUCTION.WRITE, g = 0, h = 0, g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_SERVO_SPEED[0], h = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_SERVO_SPEED[1];
  "CW" == d ? (e += 1024, 2047 < e && (e = 2047)) : 1023 < e && (e = 1023);
  return Entry.Robotis_carCont.postCallReturn(a, [[f, g + (c - 1) * h, h, e]], Entry.Robotis_openCM70.delay);
};
Blockly.Blocks.robotis_openCM70_aux_servo_position = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_port_3, "3"], [Lang.Blocks.robotis_common_port_4, "4"], [Lang.Blocks.robotis_common_port_5, "5"], [Lang.Blocks.robotis_common_port_6, "6"]]), "PORT").appendField(Lang.Blocks.robotis_openCM70_aux_servo_position_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_set).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_aux_servo_position = function(b, a) {
  var c = a.getField("PORT", a), d = a.getNumberValue("VALUE"), e = Entry.Robotis_openCM70.INSTRUCTION.WRITE, f = 0, g = 0, f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_SERVO_POSITION[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_SERVO_POSITION[1];
  1023 < d ? d = 1023 : 0 > d && (d = 0);
  return Entry.Robotis_carCont.postCallReturn(a, [[e, f + (c - 1) * g, g, d]], Entry.Robotis_openCM70.delay);
};
Blockly.Blocks.robotis_openCM70_aux_led_module = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_port_3, "3"], [Lang.Blocks.robotis_common_port_4, "4"], [Lang.Blocks.robotis_common_port_5, "5"], [Lang.Blocks.robotis_common_port_6, "6"]]), "PORT").appendField(Lang.Blocks.robotis_openCM70_aux_led_module_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_cm_led_both + Lang.Blocks.robotis_common_off, "0"], [Lang.Blocks.robotis_cm_led_right + Lang.Blocks.robotis_common_on, "1"], [Lang.Blocks.robotis_cm_led_left + 
  Lang.Blocks.robotis_common_on, "2"], [Lang.Blocks.robotis_cm_led_both + Lang.Blocks.robotis_common_on, "3"]]), "LED_MODULE");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_set).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_aux_led_module = function(b, a) {
  var c = a.getField("PORT", a), d = a.getField("LED_MODULE", a), e = Entry.Robotis_openCM70.INSTRUCTION.WRITE, f = 0, g = 0, f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_LED_MODULE[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_LED_MODULE[1];
  return Entry.Robotis_carCont.postCallReturn(a, [[e, f + (c - 1) * g, g, d]], Entry.Robotis_openCM70.delay);
};
Blockly.Blocks.robotis_openCM70_aux_custom = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_port_3, "3"], [Lang.Blocks.robotis_common_port_4, "4"], [Lang.Blocks.robotis_common_port_5, "5"], [Lang.Blocks.robotis_common_port_6, "6"]]), "PORT").appendField(Lang.Blocks.robotis_openCM70_aux_custom_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_set).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_aux_custom = function(b, a) {
  var c = a.getField("PORT", a), d = a.getNumberValue("VALUE"), e = Entry.Robotis_openCM70.INSTRUCTION.WRITE, f = 0, g = 0, f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_CUSTOM[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_CUSTOM[1];
  return Entry.Robotis_carCont.postCallReturn(a, [[e, f + (c - 1) * g, g, d]], Entry.Robotis_openCM70.delay);
};
Blockly.Blocks.robotis_openCM70_cm_custom = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_cm_custom);
  this.appendDummyInput().appendField("(");
  this.appendValueInput("ADDRESS").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(")");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_case_01);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_set).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_cm_custom = function(b, a) {
  var c = Entry.Robotis_openCM70.INSTRUCTION.WRITE, d = 0, e = 0, d = a.getNumberValue("ADDRESS"), e = a.getNumberValue("VALUE");
  return Entry.Robotis_carCont.postCallReturn(a, [[c, d, 65535 < e ? 4 : 255 < e ? 2 : 1, e]], Entry.Robotis_openCM70.delay);
};
Blockly.Blocks.robotis_carCont_sensor_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_cm_spring_left, "CM_SPRING_LEFT"], [Lang.Blocks.robotis_cm_spring_right, "CM_SPRING_RIGHT"], [Lang.Blocks.robotis_cm_switch, "CM_SWITCH"], [Lang.Blocks.robotis_cm_sound_detected, "CM_SOUND_DETECTED"], [Lang.Blocks.robotis_cm_sound_detecting, "CM_SOUND_DETECTING"], [Lang.Blocks.robotis_cm_ir_left, "CM_IR_LEFT"], [Lang.Blocks.robotis_cm_ir_right, "CM_IR_RIGHT"], [Lang.Blocks.robotis_cm_calibration_left, 
  "CM_CALIBRATION_LEFT"], [Lang.Blocks.robotis_cm_calibration_right, "CM_CALIBRATION_RIGHT"]]), "SENSOR").appendField(" ").appendField(Lang.Blocks.robotis_common_value);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.robotis_carCont_sensor_value = function(b, a) {
  var c = Entry.Robotis_carCont.INSTRUCTION.READ, d = 0, e = 0, f = 0, g = 0, h = a.getStringField("SENSOR");
  "CM_SPRING_LEFT" == h ? (f = Entry.Robotis_carCont.CONTROL_TABLE.CM_SPRING_LEFT[0], g = Entry.Robotis_carCont.CONTROL_TABLE.CM_SPRING_LEFT[1], d = Entry.Robotis_carCont.CONTROL_TABLE.CM_SPRING_LEFT[2], e = Entry.Robotis_carCont.CONTROL_TABLE.CM_SPRING_LEFT[3]) : "CM_SPRING_RIGHT" == h ? (f = Entry.Robotis_carCont.CONTROL_TABLE.CM_SPRING_RIGHT[0], g = Entry.Robotis_carCont.CONTROL_TABLE.CM_SPRING_RIGHT[1], d = Entry.Robotis_carCont.CONTROL_TABLE.CM_SPRING_RIGHT[2], e = Entry.Robotis_carCont.CONTROL_TABLE.CM_SPRING_RIGHT[3]) : 
  "CM_SWITCH" == h ? (f = Entry.Robotis_carCont.CONTROL_TABLE.CM_SWITCH[0], g = Entry.Robotis_carCont.CONTROL_TABLE.CM_SWITCH[1], d = Entry.Robotis_carCont.CONTROL_TABLE.CM_SWITCH[0], e = Entry.Robotis_carCont.CONTROL_TABLE.CM_SWITCH[1]) : "CM_SOUND_DETECTED" == h ? (f = Entry.Robotis_carCont.CONTROL_TABLE.CM_SOUND_DETECTED[0], g = Entry.Robotis_carCont.CONTROL_TABLE.CM_SOUND_DETECTED[1], d = Entry.Robotis_carCont.CONTROL_TABLE.CM_SOUND_DETECTED[0], e = Entry.Robotis_carCont.CONTROL_TABLE.CM_SOUND_DETECTED[1]) : 
  "CM_SOUND_DETECTING" == h ? (f = Entry.Robotis_carCont.CONTROL_TABLE.CM_SOUND_DETECTING[0], g = Entry.Robotis_carCont.CONTROL_TABLE.CM_SOUND_DETECTING[1], d = Entry.Robotis_carCont.CONTROL_TABLE.CM_SOUND_DETECTING[0], e = Entry.Robotis_carCont.CONTROL_TABLE.CM_SOUND_DETECTING[1]) : "CM_IR_LEFT" == h ? (f = Entry.Robotis_carCont.CONTROL_TABLE.CM_IR_LEFT[0], g = Entry.Robotis_carCont.CONTROL_TABLE.CM_IR_LEFT[1], d = Entry.Robotis_carCont.CONTROL_TABLE.CM_IR_LEFT[2], e = Entry.Robotis_carCont.CONTROL_TABLE.CM_IR_LEFT[3]) : 
  "CM_IR_RIGHT" == h ? (f = Entry.Robotis_carCont.CONTROL_TABLE.CM_IR_RIGHT[0], g = Entry.Robotis_carCont.CONTROL_TABLE.CM_IR_RIGHT[1], d = Entry.Robotis_carCont.CONTROL_TABLE.CM_IR_RIGHT[2], e = Entry.Robotis_carCont.CONTROL_TABLE.CM_IR_RIGHT[3]) : "CM_CALIBRATION_LEFT" == h ? (f = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_LEFT[0], g = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_LEFT[1], d = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_LEFT[0], e = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_LEFT[1]) : 
  "CM_CALIBRATION_RIGHT" == h ? (f = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_RIGHT[0], g = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_RIGHT[1], d = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_RIGHT[0], e = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_RIGHT[1]) : "CM_BUTTON_STATUS" == h && (f = Entry.Robotis_carCont.CONTROL_TABLE.CM_BUTTON_STATUS[0], g = Entry.Robotis_carCont.CONTROL_TABLE.CM_BUTTON_STATUS[1], d = Entry.Robotis_carCont.CONTROL_TABLE.CM_BUTTON_STATUS[0], 
  e = Entry.Robotis_carCont.CONTROL_TABLE.CM_BUTTON_STATUS[1]);
  Entry.Robotis_carCont.setRobotisData([[c, d, e, 0, g]]);
  Entry.Robotis_carCont.update();
  return Entry.hw.portData[f];
};
Blockly.Blocks.robotis_carCont_cm_led = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_cm_led_4).appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_on, "1"], [Lang.Blocks.robotis_common_off, "0"]]), "VALUE_LEFT").appendField(", ").appendField(Lang.Blocks.robotis_cm_led_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_on, "1"], [Lang.Blocks.robotis_common_off, "0"]]), "VALUE_RIGHT").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_carCont_cm_led = function(b, a) {
  var c = a.getField("VALUE_LEFT", a), d = a.getField("VALUE_RIGHT", a), e = Entry.Robotis_carCont.INSTRUCTION.WRITE, f = 0, g = 0, h = 0, f = Entry.Robotis_carCont.CONTROL_TABLE.CM_LED[0], g = Entry.Robotis_carCont.CONTROL_TABLE.CM_LED[1];
  1 == c && 1 == d ? h = 9 : 1 == c && 0 == d && (h = 8);
  0 == c && 1 == d && (h = 1);
  return Entry.Robotis_carCont.postCallReturn(a, [[e, f, g, h]], Entry.Robotis_carCont.delay);
};
Blockly.Blocks.robotis_carCont_cm_sound_detected_clear = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_cm_clear_sound_detected).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_carCont_cm_sound_detected_clear = function(b, a) {
  var c = Entry.Robotis_carCont.INSTRUCTION.WRITE, d = 0, e = 0, d = Entry.Robotis_carCont.CONTROL_TABLE.CM_SOUND_DETECTED[0], e = Entry.Robotis_carCont.CONTROL_TABLE.CM_SOUND_DETECTED[1];
  return Entry.Robotis_carCont.postCallReturn(a, [[c, d, e, 0]], Entry.Robotis_carCont.delay);
};
Blockly.Blocks.robotis_carCont_aux_motor_speed = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"]]), "DIRECTION").appendField(Lang.Blocks.robotis_carCont_aux_motor_speed_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_clockwhise, "CW"], [Lang.Blocks.robotis_common_counter_clockwhise, "CCW"]]), "DIRECTION_ANGLE").appendField(Lang.Blocks.robotis_carCont_aux_motor_speed_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_set).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_carCont_aux_motor_speed = function(b, a) {
  var c = a.getField("DIRECTION", a), d = a.getField("DIRECTION_ANGLE", a), e = a.getNumberValue("VALUE"), f = Entry.Robotis_carCont.INSTRUCTION.WRITE, g = 0, h = 0;
  "LEFT" == c ? (g = Entry.Robotis_carCont.CONTROL_TABLE.AUX_MOTOR_SPEED_LEFT[0], h = Entry.Robotis_carCont.CONTROL_TABLE.AUX_MOTOR_SPEED_LEFT[1]) : (g = Entry.Robotis_carCont.CONTROL_TABLE.AUX_MOTOR_SPEED_RIGHT[0], h = Entry.Robotis_carCont.CONTROL_TABLE.AUX_MOTOR_SPEED_RIGHT[1]);
  "CW" == d ? (e += 1024, 2047 < e && (e = 2047)) : 1023 < e && (e = 1023);
  return Entry.Robotis_carCont.postCallReturn(a, [[f, g, h, e]], Entry.Robotis_carCont.delay);
};
Blockly.Blocks.robotis_carCont_cm_calibration = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"]]), "DIRECTION").appendField(Lang.Blocks.robotis_carCont_calibration_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_set).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_carCont_cm_calibration = function(b, a) {
  var c = a.getField("DIRECTION", a), d = a.getNumberValue("VALUE"), e = Entry.Robotis_carCont.INSTRUCTION.WRITE, f = 0, g = 0;
  "LEFT" == c ? (f = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_LEFT[0], g = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_LEFT[1]) : (f = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_RIGHT[0], g = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_RIGHT[1]);
  return Entry.Robotis_carCont.postCallReturn(a, [[e, f, g, d]], Entry.Robotis_carCont.delay);
};
Blockly.Blocks.when_scene_start = {init:function() {
  this.setColour("#3BBD70");
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/start_icon_scene_1_2.png", "*", "start")).appendField(Lang.Blocks.SCENE_when_scene_start);
  this.setInputsInline(!0);
  this.setNextStatement(!0);
}};
Entry.block.when_scene_start = function(b, a) {
  return a.callReturn();
};
Blockly.Blocks.start_scene = {init:function() {
  this.setColour("#3BBD70");
  this.appendDummyInput().appendField(Lang.Blocks.SCENE_start_scene_1).appendField(new Blockly.FieldDropdownDynamic("scenes"), "VALUE").appendField(Lang.Blocks.SCENE_start_scene_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/start_03.png", "*"));
  this.setInputsInline(!0);
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
}};
Entry.block.start_scene = function(b, a) {
  var c = a.getField("VALUE", a);
  if (c = Entry.scene.getSceneById(c)) {
    Entry.scene.selectScene(c), Entry.engine.fireEvent("when_scene_start");
  }
  return null;
};
Blockly.Blocks.start_neighbor_scene = {init:function() {
  this.setColour("#3BBD70");
  this.appendDummyInput().appendField(Lang.Blocks.SCENE_start_neighbor_scene_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.SCENE_start_scene_next, "next"], [Lang.Blocks.SCENE_start_scene_pre, "pre"]]), "OPERATOR").appendField(Lang.Blocks.SCENE_start_neighbor_scene_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/start_03.png", "*"));
  this.setInputsInline(!0);
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
}};
Entry.block.start_neighbor_scene = function(b, a) {
  var c = Entry.scene.selectedScene, d = Entry.scene.getScenes(), c = d.indexOf(c);
  "next" == a.getField("OPERATOR", a) ? c + 1 < d.length && (d = Entry.scene.getSceneById(d[c + 1].id)) && (Entry.scene.selectScene(d), Entry.engine.fireEvent("when_scene_start")) : 0 < c && (d = Entry.scene.getSceneById(d[c - 1].id)) && (Entry.scene.selectScene(d), Entry.engine.fireEvent("when_scene_start"));
  return null;
};
Blockly.Blocks.sound_something = {init:function() {
  this.setColour("#A4D01D");
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_something_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("sounds"), "VALUE");
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_something_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/sound_03.png", "*"));
  this.setInputsInline(!0);
  this.setNextStatement(!0);
  this.setPreviousStatement(!0);
}};
Entry.block.sound_something = function(b, a) {
  var c = a.getField("VALUE", a);
  Entry.isExist(c, "id", b.parent.sounds) && createjs.Sound.play(c);
  return a.callReturn();
};
Blockly.Blocks.sound_something_second = {init:function() {
  this.setColour("#A4D01D");
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_something_second_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("sounds"), "VALUE");
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_something_second_2);
  this.appendValueInput("SECOND").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_something_second_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/sound_03.png", "*"));
  this.setInputsInline(!0);
  this.setNextStatement(!0);
  this.setPreviousStatement(!0);
}};
Entry.block.sound_something_second = function(b, a) {
  var c = a.getField("VALUE", a), d = a.getNumberValue("SECOND", a);
  if (Entry.isExist(c, "id", b.parent.sounds)) {
    var e = createjs.Sound.play(c);
    setTimeout(function() {
      e.stop();
    }, 1E3 * d);
  }
  return a.callReturn();
};
Blockly.Blocks.sound_something_wait = {init:function() {
  this.setColour("#A4D01D");
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_something_wait_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("sounds"), "VALUE");
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_something_wait_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/sound_03.png", "*"));
  this.setInputsInline(!0);
  this.setNextStatement(!0);
  this.setPreviousStatement(!0);
}};
Entry.block.sound_something_wait = function(b, a) {
  if (a.isPlay) {
    if (1 == a.playState) {
      return a;
    }
    delete a.playState;
    delete a.isPlay;
    return a.callReturn();
  }
  a.isPlay = !0;
  a.playState = 1;
  var c = a.getField("VALUE", a), d = b.parent.getSound(c);
  Entry.isExist(c, "id", b.parent.sounds) && (createjs.Sound.play(c), setTimeout(function() {
    a.playState = 0;
  }, 1E3 * d.duration));
  return a;
};
Blockly.Blocks.sound_something_second_wait = {init:function() {
  this.setColour("#A4D01D");
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_something_second_wait_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("sounds"), "VALUE");
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_something_second_wait_2);
  this.appendValueInput("SECOND").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_something_second_wait_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/sound_03.png", "*"));
  this.setInputsInline(!0);
  this.setNextStatement(!0);
  this.setPreviousStatement(!0);
}};
Entry.block.sound_something_second_wait = function(b, a) {
  if (a.isPlay) {
    if (1 == a.playState) {
      return a;
    }
    delete a.isPlay;
    delete a.playState;
    return a.callReturn();
  }
  a.isPlay = !0;
  a.playState = 1;
  var c = a.getField("VALUE", a);
  if (Entry.isExist(c, "id", b.parent.sounds)) {
    var d = createjs.Sound.play(c), c = a.getNumberValue("SECOND", a);
    setTimeout(function() {
      d.stop();
      a.playState = 0;
    }, 1E3 * c);
    d.addEventListener("complete", function(a) {
    });
  }
  return a;
};
Blockly.Blocks.sound_volume_change = {init:function() {
  this.setColour("#A4D01D");
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_volume_change_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_volume_change_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/sound_03.png", "*"));
  this.setInputsInline(!0);
  this.setNextStatement(!0);
  this.setPreviousStatement(!0);
}};
Entry.block.sound_volume_change = function(b, a) {
  var c = a.getNumberValue("VALUE", a) / 100, c = c + createjs.Sound.getVolume();
  1 < c && (c = 1);
  0 > c && (c = 0);
  createjs.Sound.setVolume(c);
  return a.callReturn();
};
Blockly.Blocks.sound_volume_set = {init:function() {
  this.setColour("#A4D01D");
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_volume_set_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_volume_set_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/sound_03.png", "*"));
  this.setInputsInline(!0);
  this.setNextStatement(!0);
  this.setPreviousStatement(!0);
}};
Entry.block.sound_volume_set = function(b, a) {
  var c = a.getNumberValue("VALUE", a) / 100;
  1 < c && (c = 1);
  0 > c && (c = 0);
  createjs.Sound.setVolume(c);
  return a.callReturn();
};
Blockly.Blocks.sound_silent_all = {init:function() {
  this.setColour("#A4D01D");
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_silent_all).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/sound_03.png", "*"));
  this.setInputsInline(!0);
  this.setNextStatement(!0);
  this.setPreviousStatement(!0);
}};
Entry.block.sound_silent_all = function(b, a) {
  createjs.Sound.stop();
  return a.callReturn();
};
Blockly.Blocks.get_sounds = {init:function() {
  this.setColour("#A4D01D");
  this.appendDummyInput().appendField("");
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("sounds"), "VALUE");
  this.appendDummyInput().appendField(" ");
  this.setOutput(!0, "String");
  this.setInputsInline(!0);
}};
Entry.block.get_sounds = function(b, a) {
  return a.getStringField("VALUE");
};
Blockly.Blocks.sound_something_with_block = {init:function() {
  this.setColour("#A4D01D");
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_something_1);
  this.appendValueInput("VALUE").setCheck(["String", "Number"]);
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_something_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/sound_03.png", "*"));
  this.setInputsInline(!0);
  this.setNextStatement(!0);
  this.setPreviousStatement(!0);
}};
Entry.block.sound_something_with_block = function(b, a) {
  var c = a.getStringValue("VALUE", a);
  (c = b.parent.getSound(c)) && createjs.Sound.play(c.id);
  return a.callReturn();
};
Blockly.Blocks.sound_something_second_with_block = {init:function() {
  this.setColour("#A4D01D");
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_something_second_1);
  this.appendValueInput("VALUE").setCheck(["String", "Number"]);
  this.appendDummyInput().appendField(" ").appendField(Lang.Blocks.SOUND_sound_something_second_2);
  this.appendValueInput("SECOND").setCheck(["String", "Number"]);
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_something_second_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/sound_03.png", "*"));
  this.setInputsInline(!0);
  this.setNextStatement(!0);
  this.setPreviousStatement(!0);
}};
Entry.block.sound_something_second_with_block = function(b, a) {
  var c = a.getStringValue("VALUE", a), d = a.getNumberValue("SECOND", a);
  (c = b.parent.getSound(c)) && createjs.Sound.play(c.id, {startTime:0, duration:1E3 * d});
  return a.callReturn();
};
Blockly.Blocks.sound_something_wait_with_block = {init:function() {
  this.setColour("#A4D01D");
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_something_wait_1);
  this.appendValueInput("VALUE").setCheck(["String", "Number"]);
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_something_wait_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/sound_03.png", "*"));
  this.setInputsInline(!0);
  this.setNextStatement(!0);
  this.setPreviousStatement(!0);
}};
Entry.block.sound_something_wait_with_block = function(b, a) {
  if (a.isPlay) {
    if (1 == a.playState) {
      return a;
    }
    delete a.playState;
    delete a.isPlay;
    return a.callReturn();
  }
  a.isPlay = !0;
  a.playState = 1;
  var c = a.getStringValue("VALUE", a);
  if (c = b.parent.getSound(c)) {
    createjs.Sound.play(c.id), setTimeout(function() {
      a.playState = 0;
    }, 1E3 * c.duration);
  }
  return a;
};
Blockly.Blocks.sound_something_second_wait_with_block = {init:function() {
  this.setColour("#A4D01D");
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_something_second_wait_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_something_second_wait_2).appendField(" ");
  this.appendValueInput("SECOND").setCheck(["String", "Number"]);
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_something_second_wait_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/sound_03.png", "*"));
  this.setInputsInline(!0);
  this.setNextStatement(!0);
  this.setPreviousStatement(!0);
}};
Entry.block.sound_something_second_wait_with_block = function(b, a) {
  if (a.isPlay) {
    if (1 == a.playState) {
      return a;
    }
    delete a.isPlay;
    delete a.playState;
    return a.callReturn();
  }
  a.isPlay = !0;
  a.playState = 1;
  var c = a.getStringValue("VALUE", a);
  if (c = b.parent.getSound(c)) {
    var d = createjs.Sound.play(c.id), c = a.getNumberValue("SECOND", a);
    setTimeout(function() {
      d.stop();
      a.playState = 0;
    }, 1E3 * c);
    d.addEventListener("complete", function(a) {
    });
  }
  return a;
};
Blockly.Blocks.sound_from_to = {init:function() {
  this.setColour("#A4D01D");
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_from_to_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_from_to_2);
  this.appendValueInput("START").setCheck(["String", "Number"]);
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_from_to_3);
  this.appendValueInput("END").setCheck(["String", "Number"]);
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_from_to_4).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/sound_03.png", "*"));
  this.setInputsInline(!0);
  this.setNextStatement(!0);
  this.setPreviousStatement(!0);
}};
Entry.block.sound_from_to = function(b, a) {
  var c = a.getStringValue("VALUE", a);
  if (c = b.parent.getSound(c)) {
    var d = 1E3 * a.getNumberValue("START", a), e = 1E3 * a.getNumberValue("END", a);
    createjs.Sound.play(c.id, {startTime:Math.min(d, e), duration:Math.max(d, e) - Math.min(d, e)});
  }
  return a.callReturn();
};
Blockly.Blocks.sound_from_to_and_wait = {init:function() {
  this.setColour("#A4D01D");
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_from_to_and_wait_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_from_to_and_wait_2);
  this.appendValueInput("START").setCheck(["String", "Number"]);
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_from_to_and_wait_3);
  this.appendValueInput("END").setCheck(["String", "Number"]);
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_from_to_and_wait_4).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/sound_03.png", "*"));
  this.setInputsInline(!0);
  this.setNextStatement(!0);
  this.setPreviousStatement(!0);
}};
Entry.block.sound_from_to_and_wait = function(b, a) {
  if (a.isPlay) {
    if (1 == a.playState) {
      return a;
    }
    delete a.isPlay;
    delete a.playState;
    return a.callReturn();
  }
  a.isPlay = !0;
  a.playState = 1;
  var c = a.getStringValue("VALUE", a);
  if (c = b.parent.getSound(c)) {
    var d = 1E3 * a.getNumberValue("START", a), e = 1E3 * a.getNumberValue("END", a), f = Math.min(d, e), d = Math.max(d, e) - f;
    createjs.Sound.play(c.id, {startTime:f, duration:d});
    setTimeout(function() {
      a.playState = 0;
    }, d);
  }
  return a;
};
Blockly.Blocks.when_run_button_click = {init:function() {
  this.setColour("#3BBD70");
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/start_icon_play.png", "*", "start")).appendField(Lang.Blocks.START_when_run_button_click);
  this.setInputsInline(!0);
  this.setNextStatement(!0);
}};
Entry.block.when_run_button_click = function(b, a) {
  return a.callReturn();
};
Blockly.Blocks.press_some_key = {init:function() {
  this.setColour("#3BBD70");
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/start_icon_keyboard.png", "*", "start")).appendField(Lang.Blocks.START_press_some_key_1).appendField(new Blockly.FieldDropdown([["q", "81"], ["w", "87"], ["e", "69"], ["r", "82"], ["a", "65"], ["s", "83"], ["d", "68"], [Lang.Blocks.START_press_some_key_up, "38"], [Lang.Blocks.START_press_some_key_down, "40"], [Lang.Blocks.START_press_some_key_left, "37"], [Lang.Blocks.START_press_some_key_right, "39"], [Lang.Blocks.START_press_some_key_enter, 
  "13"], [Lang.Blocks.START_press_some_key_space, "32"]]), "VALUE").appendField(Lang.Blocks.START_press_some_key_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/start_03.png", "*"));
  this.setInputsInline(!0);
  this.setNextStatement(!0);
}};
Entry.block.press_some_key = function(b, a) {
  return a.callReturn();
};
Blockly.Blocks.when_some_key_pressed = {init:function() {
  this.setColour("#3BBD70");
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/start_icon_keyboard.png", "*", "start")).appendField(Lang.Blocks.START_press_some_key_1).appendField(new Blockly.FieldKeydownInput("81"), "VALUE").appendField(Lang.Blocks.START_press_some_key_2);
  this.setInputsInline(!0);
  this.setNextStatement(!0);
}};
Entry.block.when_some_key_pressed = function(b, a) {
  return a.callReturn();
};
Blockly.Blocks.mouse_clicked = {init:function() {
  this.setColour("#3BBD70");
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/start_icon_mouse.png", "*", "start")).appendField(Lang.Blocks.START_mouse_clicked);
  this.setInputsInline(!0);
  this.setNextStatement(!0);
}};
Entry.block.mouse_clicked = function(b, a) {
  return a.callReturn();
};
Blockly.Blocks.mouse_click_cancled = {init:function() {
  this.setColour("#3BBD70");
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/start_icon_mouse.png", "*", "start")).appendField(Lang.Blocks.START_mouse_click_cancled);
  this.setInputsInline(!0);
  this.setNextStatement(!0);
}};
Entry.block.mouse_click_cancled = function(b, a) {
  return a.callReturn();
};
Blockly.Blocks.when_object_click = {init:function() {
  this.setColour("#3BBD70");
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/start_icon_mouse.png", "*", "start")).appendField(Lang.Blocks.START_when_object_click);
  this.setInputsInline(!0);
  this.setNextStatement(!0);
}};
Entry.block.when_object_click = function(b, a) {
  return a.callReturn();
};
Blockly.Blocks.when_object_click_canceled = {init:function() {
  this.setColour("#3BBD70");
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/start_icon_mouse.png", "*", "start")).appendField(Lang.Blocks.START_when_object_click_canceled);
  this.setInputsInline(!0);
  this.setNextStatement(!0);
}};
Entry.block.when_object_click_canceled = function(b, a) {
  return a.callReturn();
};
Blockly.Blocks.when_some_key_click = {init:function() {
  this.setColour("#3BBD70");
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/start_icon_keyboard.png", "*", "start")).appendField(Lang.Blocks.START_when_some_key_click);
  this.setInputsInline(!0);
  this.setNextStatement(!0);
}};
Entry.block.when_some_key_click = function(b, a) {
  return a.callReturn();
};
Blockly.Blocks.when_message_cast = {init:function() {
  this.setColour("#3BBD70");
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/start_icon_signal.png", "*", "start")).appendField(Lang.Blocks.START_when_message_cast_1).appendField(new Blockly.FieldDropdownDynamic("messages"), "VALUE").appendField(Lang.Blocks.START_when_message_cast_2);
  this.setInputsInline(!0);
  this.setNextStatement(!0);
}};
Entry.block.when_message_cast = function(b, a) {
  return a.callReturn();
};
Blockly.Blocks.message_cast = {init:function() {
  this.setColour("#3BBD70");
  this.appendDummyInput().appendField(Lang.Blocks.START_message_cast_1).appendField(new Blockly.FieldDropdownDynamic("messages"), "VALUE").appendField(Lang.Blocks.START_message_cast_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/start_03.png", "*"));
  this.setInputsInline(!0);
  this.setInputsInline(!0);
  this.setNextStatement(!0);
  this.setPreviousStatement(!0);
}};
Entry.block.message_cast = function(b, a) {
  var c = a.getField("VALUE", a), d = Entry.isExist(c, "id", Entry.variableContainer.messages_);
  if ("null" == c || !d) {
    throw Error("value can not be null or undefined");
  }
  Entry.container.mapEntityIncludeCloneOnScene(Entry.engine.raiseKeyEvent, ["when_message_cast", c]);
  return a.callReturn();
};
Blockly.Blocks.add_message = {init:function() {
  this.setColour("#3BBD70");
  this.appendDummyInput().appendField(Lang.Blocks.START_add_message).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/start_03.png", "*"));
  this.setInputsInline(!0);
}};
Entry.block.add_massage = function(b, a) {
  return a.callReturn();
};
Blockly.Blocks.message_cast_wait = {init:function() {
  this.setColour("#3BBD70");
  this.appendDummyInput().appendField(Lang.Blocks.START_message_send_wait_1).appendField(new Blockly.FieldDropdownDynamic("messages"), "VALUE").appendField(Lang.Blocks.START_message_send_wait_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/start_03.png", "*"));
  this.setInputsInline(!0);
  this.setNextStatement(!0);
  this.setPreviousStatement(!0);
}};
Entry.block.message_cast_wait = function(b, a) {
  if (a.runningScript) {
    if (a.runningScript.length) {
      return Entry.engine.computeFunction(a), a;
    }
    delete a.runningScript;
    return a.callReturn();
  }
  var c = a.getField("VALUE", a), d = Entry.isExist(c, "id", Entry.variableContainer.messages_);
  if ("null" == c || !d) {
    throw Error("value can not be null or undefined");
  }
  var e = [];
  Entry.container.mapEntityIncludeCloneOnScene(function(a, b) {
    for (var c = b[0], d = b[1], l = a.parent.script.childNodes, q = 0;q < l.length;q++) {
      var n = l[q], m = Entry.Xml.getField("VALUE", n);
      Entry.Xml.isTypeOf(c, n) && m == d && (m = new Entry.Script(a), m.init(n), e.push(m));
    }
  }, ["when_message_cast", c]);
  a.runningScript = e;
  return a;
};
var colour = "#FFCA36";
Blockly.Blocks.text = {init:function() {
  this.setColour("#FFD974");
  this.appendDummyInput().appendField(new Blockly.FieldTextInput(Lang.Blocks.TEXT_text), "NAME");
  this.setOutput(!0, "String");
  this.setInputsInline(!0);
}};
Entry.block.text = function(b, a) {
  return a.getField("NAME");
};
Blockly.Blocks.text_write = {init:function() {
  this.setColour(colour);
  this.appendDummyInput().appendField(Lang.Blocks.TEXT_text_write_1);
  this.appendValueInput("VALUE").setCheck(["String", "Number"]);
  this.appendDummyInput().appendField(Lang.Blocks.TEXT_text_write_2);
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.text_write = function(b, a) {
  var c = a.getStringValue("VALUE", a), c = Entry.convertToRoundedDecimals(c, 3);
  b.setText(c);
  return a.callReturn();
};
Blockly.Blocks.text_append = {init:function() {
  this.setColour(colour);
  this.appendDummyInput().appendField(Lang.Blocks.TEXT_text_append_1);
  this.appendValueInput("VALUE").setCheck(["String", "Number"]);
  this.appendDummyInput().appendField(Lang.Blocks.TEXT_text_append_2);
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.text_append = function(b, a) {
  var c = a.getStringValue("VALUE", a);
  b.setText(Entry.convertToRoundedDecimals(b.getText(), 3) + Entry.convertToRoundedDecimals(c, 3));
  return a.callReturn();
};
Blockly.Blocks.text_prepend = {init:function() {
  this.setColour(colour);
  this.appendDummyInput().appendField(Lang.Blocks.TEXT_text_prepend_1);
  this.appendValueInput("VALUE").setCheck(["String", "Number"]);
  this.appendDummyInput().appendField(Lang.Blocks.TEXT_text_prepend_2);
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.text_prepend = function(b, a) {
  var c = a.getStringValue("VALUE", a);
  b.setText(Entry.convertToRoundedDecimals(c, 3) + Entry.convertToRoundedDecimals(b.getText(), 3));
  return a.callReturn();
};
Blockly.Blocks.text_flush = {init:function() {
  this.setColour(colour);
  this.appendDummyInput().appendField(Lang.Blocks.TEXT_text_flush);
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.text_flush = function(b, a) {
  b.setText("");
  return a.callReturn();
};
Blockly.Blocks.change_variable = {init:function() {
  this.setColour("#E457DC");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_change_variable_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("variables"), "VARIABLE");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_change_variable_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_change_variable_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/variable_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.change_variable = function(b, a) {
  var c = a.getField("VARIABLE", a), d = a.getNumberValue("VALUE", a), e = 0, d = Entry.parseNumber(d);
  if (0 == d && "boolean" == typeof d) {
    throw Error("Type is not correct");
  }
  c = Entry.variableContainer.getVariable(c, b);
  e = Entry.getMaxFloatPoint([d, c.getValue()]);
  c.setValue((d + c.getValue()).toFixed(e));
  return a.callReturn();
};
Blockly.Blocks.set_variable = {init:function() {
  this.setColour("#E457DC");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_set_variable_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("variables"), "VARIABLE");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_set_variable_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_set_variable_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/variable_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.set_variable = function(b, a) {
  var c = a.getField("VARIABLE", a), d = a.getValue("VALUE", a);
  Entry.variableContainer.getVariable(c, b).setValue(d);
  return a.callReturn();
};
Blockly.Blocks.show_variable = {init:function() {
  this.setColour("#E457DC");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_show_variable_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("variables"), "VARIABLE").appendField(Lang.Blocks.VARIABLE_show_variable_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/variable_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.show_variable = function(b, a) {
  var c = a.getField("VARIABLE", a), c = Entry.variableContainer.getVariable(c, b);
  c.setVisible(!0);
  c.updateView();
  return a.callReturn();
};
Blockly.Blocks.hide_variable = {init:function() {
  this.setColour("#E457DC");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_hide_variable_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("variables"), "VARIABLE").appendField(Lang.Blocks.VARIABLE_hide_variable_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/variable_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hide_variable = function(b, a) {
  var c = a.getField("VARIABLE", a);
  Entry.variableContainer.getVariable(c, b).setVisible(!1);
  return a.callReturn();
};
Blockly.Blocks.get_y = {init:function() {
  this.setColour(230);
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_get_y).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/variable_03.png", "*"));
  this.setOutput(!0, "Number");
}};
Blockly.Blocks.get_variable = {init:function() {
  this.setColour("#E457DC");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_get_variable_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("variables"), "VARIABLE").appendField(Lang.Blocks.VARIABLE_get_variable_2);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.get_variable = function(b, a) {
  var c = a.getField("VARIABLE", a);
  return Entry.variableContainer.getVariable(c, b).getValue();
};
Blockly.Blocks.ask_and_wait = {init:function() {
  this.setColour("#E457DC");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_ask_and_wait_1);
  this.appendValueInput("VALUE").setCheck(["String", "Number", null]);
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_ask_and_wait_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/variable_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, whenAdd:function() {
  Entry.container.showProjectAnswer();
}, whenRemove:function(b) {
  Entry.container.hideProjectAnswer(b);
}};
Entry.block.ask_and_wait = function(b, a) {
  var c = Entry.container.inputValue, d = Entry.stage.inputField, e = a.getValue("VALUE", a);
  if (!e) {
    throw Error("message can not be empty");
  }
  if (c.sprite == b && d && !d._isHidden) {
    return a;
  }
  if (c.sprite != b && a.isInit) {
    return b.dialog && b.dialog.remove(), delete a.isInit, a.callReturn();
  }
  if (c.complete && c.sprite == b && d._isHidden && a.isInit) {
    return b.dialog && b.dialog.remove(), delete c.complete, delete a.isInit, a.callReturn();
  }
  e = Entry.convertToRoundedDecimals(e, 3);
  new Entry.Dialog(b, e, "speak");
  Entry.stage.showInputField();
  c.script = a;
  c.sprite = b;
  a.isInit = !0;
  return a;
};
Blockly.Blocks.get_canvas_input_value = {init:function() {
  this.setColour("#E457DC");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_get_canvas_input_value);
  this.appendDummyInput().appendField(" ");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}, whenAdd:function() {
  Entry.container.showProjectAnswer();
}, whenRemove:function(b) {
  Entry.container.hideProjectAnswer(b);
}};
Entry.block.get_canvas_input_value = function(b, a) {
  return Entry.container.getInputValue();
};
Blockly.Blocks.add_value_to_list = {init:function() {
  this.setColour("#E457DC");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_add_value_to_list_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_add_value_to_list_2);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("lists"), "LIST");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_add_value_to_list_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/variable_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.add_value_to_list = function(b, a) {
  var c = a.getField("LIST", a), d = a.getValue("VALUE", a), c = Entry.variableContainer.getList(c, b);
  c.array_ || (c.array_ = []);
  c.array_.push({data:d});
  c.updateView();
  return a.callReturn();
};
Blockly.Blocks.remove_value_from_list = {init:function() {
  this.setColour("#E457DC");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_remove_value_from_list_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_remove_value_from_list_2);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("lists"), "LIST");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_remove_value_from_list_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/variable_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.remove_value_from_list = function(b, a) {
  var c = a.getField("LIST", a), d = a.getValue("VALUE", a), c = Entry.variableContainer.getList(c, b);
  if (!c.array_ || isNaN(d) || d > c.array_.length) {
    throw Error("can not remove value from array");
  }
  c.array_.splice(d - 1, 1);
  c.updateView();
  return a.callReturn();
};
Blockly.Blocks.insert_value_to_list = {init:function() {
  this.setColour("#E457DC");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_insert_value_to_list_1);
  this.appendValueInput("DATA").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_insert_value_to_list_2);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("lists"), "LIST");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_insert_value_to_list_3);
  this.appendValueInput("INDEX").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_insert_value_to_list_4).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/variable_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.insert_value_to_list = function(b, a) {
  var c = a.getField("LIST", a), d = a.getValue("DATA", a), e = a.getValue("INDEX", a), c = Entry.variableContainer.getList(c, b);
  if (!c.array_ || isNaN(e) || 0 == e || e > c.array_.length + 1) {
    throw Error("can not insert value to array");
  }
  c.array_.splice(e - 1, 0, {data:d});
  c.updateView();
  return a.callReturn();
};
Blockly.Blocks.change_value_list_index = {init:function() {
  this.setColour("#E457DC");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_change_value_list_index_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("lists"), "LIST");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_change_value_list_index_2);
  this.appendValueInput("INDEX").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_change_value_list_index_3);
  this.appendValueInput("DATA").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_change_value_list_index_4).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/variable_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.change_value_list_index = function(b, a) {
  var c = a.getField("LIST", a), d = a.getValue("DATA", a), e = a.getValue("INDEX", a), c = Entry.variableContainer.getList(c, b);
  if (!c.array_ || isNaN(e) || e > c.array_.length) {
    throw Error("can not insert value to array");
  }
  c.array_[e - 1].data = d;
  c.updateView();
  return a.callReturn();
};
Blockly.Blocks.value_of_index_from_list = {init:function() {
  this.setColour("#E457DC");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_value_of_index_from_list_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("lists"), "LIST");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_value_of_index_from_list_2);
  this.appendValueInput("INDEX").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_value_of_index_from_list_3);
  this.setOutput(!0, "String");
  this.setInputsInline(!0);
}};
Entry.block.value_of_index_from_list = function(b, a) {
  var c = a.getField("LIST", a), d = a.getValue("INDEX", a), c = Entry.variableContainer.getList(c, b), d = Entry.getListRealIndex(d, c);
  if (!c.array_ || isNaN(d) || d > c.array_.length) {
    throw Error("can not insert value to array");
  }
  return c.array_[d - 1].data;
};
Blockly.Blocks.length_of_list = {init:function() {
  this.setColour("#E457DC");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_length_of_list_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("lists"), "LIST");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_length_of_list_2);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.length_of_list = function(b, a) {
  var c = a.getField("LIST", a);
  return Entry.variableContainer.getList(c).array_.length;
};
Blockly.Blocks.show_list = {init:function() {
  this.setColour("#E457DC");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_show_list_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("lists"), "LIST").appendField(Lang.Blocks.VARIABLE_show_list_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/variable_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.show_list = function(b, a) {
  var c = a.getField("LIST", a);
  Entry.variableContainer.getList(c).setVisible(!0);
  return a.callReturn();
};
Blockly.Blocks.hide_list = {init:function() {
  this.setColour("#E457DC");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_hide_list_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("lists"), "LIST").appendField(Lang.Blocks.VARIABLE_hide_list_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/variable_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hide_list = function(b, a) {
  var c = a.getField("LIST", a);
  Entry.variableContainer.getList(c).setVisible(!1);
  return a.callReturn();
};
Blockly.Blocks.options_for_list = {init:function() {
  this.setColour("#E457DC");
  this.appendDummyInput().appendField("");
  this.appendDummyInput("VALUE").appendField(new Blockly.FieldDropdown([[Lang.Blocks.VARIABLE_list_option_first, "FIRST"], [Lang.Blocks.VARIABLE_list_option_last, "LAST"], [Lang.Blocks.VARIABLE_list_option_random, "RANDOM"]]), "OPERATOR");
  this.appendDummyInput().appendField(" ");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.options_for_list = function(b, a) {
  return a.getField("OPERATOR", a);
};
Blockly.Blocks.set_visible_answer = {init:function() {
  this.setColour("#E457DC");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_get_canvas_input_value);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.CALC_timer_visible_show, "SHOW"], [Lang.Blocks.CALC_timer_visible_hide, "HIDE"]]), "BOOL");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/variable_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, whenAdd:function() {
  Entry.container.showProjectAnswer();
}, whenRemove:function(b) {
  Entry.container.hideProjectAnswer(b);
}};
Entry.block.set_visible_answer = function(b, a) {
  "HIDE" == a.getField("BOOL", a) ? Entry.container.inputValue.setVisible(!1) : Entry.container.inputValue.setVisible(!0);
  return a.callReturn();
};
Blockly.Blocks.is_included_in_list = {init:function() {
  this.setColour("#E457DC");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_is_included_in_list_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("lists"), "LIST");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_is_included_in_list_2);
  this.appendValueInput("DATA").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_is_included_in_list_3);
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}};
Entry.block.is_included_in_list = function(b, a) {
  var c = a.getField("LIST", a), d = a.getStringValue("DATA", a), c = Entry.variableContainer.getList(c);
  if (!c) {
    return !1;
  }
  for (var c = c.array_, e = 0, f = c.length;e < f;e++) {
    if (c[e].data.toString() == d.toString()) {
      return !0;
    }
  }
  return !1;
};
Entry.Xbot = {PORT_MAP:{rightWheel:0, leftWheel:0, head:90, armR:90, armL:90, analogD5:127, analogD6:127, D4:0, D7:0, D12:0, D13:0, ledR:0, ledG:0, ledB:0, lcdNum:0, lcdTxt:"                ", note:262, duration:0}, setZero:function() {
  var b = Entry.Xbot.PORT_MAP, a = Entry.hw.sendQueue, c;
  for (c in b) {
    a[c] = b[c];
  }
  Entry.hw.update();
  Entry.Xbot.removeAllTimeouts();
}, timeouts:[], removeTimeout:function(b) {
  clearTimeout(b);
  var a = this.timeouts;
  b = a.indexOf(b);
  0 <= b && a.splice(b, 1);
}, removeAllTimeouts:function() {
  var b = this.timeouts, a;
  for (a in b) {
    clearTimeout(b[a]);
  }
  this.timeouts = [];
}, name:"xbot_epor_edge"};
Blockly.Blocks.xbot_digitalInput = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdown([[Lang.Blocks.XBOT_D2_digitalInput, "D2"], [Lang.Blocks.XBOT_D3_digitalInput, "D3"], [Lang.Blocks.XBOT_D11_digitalInput, "D11"]]), "DEVICE");
  this.setInputsInline(!0);
  this.setOutput(!0, "Boolean");
}};
Entry.block.xbot_digitalInput = function(b, a) {
  var c = Entry.hw.portData, d = a.getField("DEVICE");
  return c[d];
};
Blockly.Blocks.xbot_analogValue = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdown([[Lang.Blocks.XBOT_CDS, "light"], [Lang.Blocks.XBOT_MIC, "mic"], [Lang.Blocks.XBOT_analog0, "adc0"], [Lang.Blocks.XBOT_analog1, "adc1"], [Lang.Blocks.XBOT_analog2, "adc2"], [Lang.Blocks.XBOT_analog3, "adc3"]]), "DEVICE");
  this.setInputsInline(!0);
  this.setOutput(!0, "Number");
}};
Entry.block.xbot_analogValue = function(b, a) {
  var c = Entry.hw.portData, d = a.getField("DEVICE");
  return c[d];
};
Blockly.Blocks.xbot_digitalOutput = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.XBOT_digital).appendField(new Blockly.FieldDropdown([["LED", "D13"], ["D4", "D4"], ["D7", "D7"], ["D12 ", "D12"]]), "DEVICE").appendField(Lang.Blocks.XBOT_pin_OutputValue).appendField(new Blockly.FieldDropdown([[Lang.Blocks.XBOT_High, "HIGH"], [Lang.Blocks.XBOT_Low, "LOW"]]), "VALUE");
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.xbot_digitalOutput = function(b, a) {
  var c = Entry.hw.sendQueue, d = a.getStringField("DEVICE", a), e = a.getStringField("VALUE", a);
  c.D13 = "D13" == d && "HIGH" == e ? 1 : 0;
  c.D4 = "D4" == d && "HIGH" == e ? 1 : 0;
  c.D7 = "D7" == d && "HIGH" == e ? 1 : 0;
  c.D12 = "D12" == d && "HIGH" == e ? 1 : 0;
  return a.callReturn();
};
Blockly.Blocks.xbot_analogOutput = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.XBOT_analog).appendField(new Blockly.FieldDropdown([["D5", "analogD5"], ["D6", "analogD6"]]), "DEVICE").appendField(Lang.Blocks.XBOT_pin_Output_Value);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.xbot_analogOutput = function(b, a) {
  var c = Entry.hw.sendQueue, d = a.getStringField("DEVICE", a), e = a.getNumberValue("VALUE", a);
  "analogD5" == d ? c.analogD5 = e : "analogD6" == d && (c.analogD6 = e);
  return a.callReturn();
};
Blockly.Blocks.xbot_servo = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.XBOT_Servo).appendField(new Blockly.FieldDropdown([[Lang.Blocks.XBOT_Head, "head"], [Lang.Blocks.XBOT_ArmR, "right"], [Lang.Blocks.XBOT_ArmL, "left"]]), "DEVICE").appendField(Lang.Blocks.XBOT_angle);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.xbot_servo = function(b, a) {
  var c = Entry.hw.sendQueue, d = a.getStringField("DEVICE", a), e = a.getNumberValue("VALUE", a);
  "head" == d ? c.head = e : "right" == d ? c.armR = e : "left" == d && (c.armL = e);
  return a.callReturn();
};
Blockly.Blocks.xbot_oneWheel = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.XBOT_DC).appendField(new Blockly.FieldDropdown([[Lang.Blocks.XBOT_rightWheel, "rightWheel"], [Lang.Blocks.XBOT_leftWheel, "leftWheel"], [Lang.Blocks.XBOT_bothWheel, "bothWheel"]]), "DEVICE").appendField(Lang.Blocks.XBOT_speed);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.xbot_oneWheel = function(b, a) {
  var c = Entry.hw.sendQueue, d = a.getStringField("DEVICE", a), e = a.getNumberValue("VALUE", a);
  "rightWheel" == d ? c.rightWheel = e : "leftWheel" == d ? c.leftWheel = e : c.rightWheel = c.leftWheel = e;
  return a.callReturn();
};
Blockly.Blocks.xbot_twoWheel = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.XBOT_rightSpeed);
  this.appendValueInput("rightWheel").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.XBOT_leftSpeed);
  this.appendValueInput("leftWheel").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.xbot_twoWheel = function(b, a) {
  var c = Entry.hw.sendQueue;
  c.rightWheel = a.getNumberValue("rightWheel");
  c.leftWheel = a.getNumberValue("leftWheel");
  return a.callReturn();
};
Blockly.Blocks.xbot_rgb = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.XBOT_RGBLED_R);
  this.appendValueInput("ledR").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.XBOT_RGBLED_G);
  this.appendValueInput("ledG").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.XBOT_RGBLED_B);
  this.appendValueInput("ledB").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.xbot_rgb = function(b, a) {
  var c = Entry.hw.sendQueue;
  c.ledR = a.getNumberValue("ledR");
  c.ledG = a.getNumberValue("ledG");
  c.ledB = a.getNumberValue("ledB");
  return a.callReturn();
};
Blockly.Blocks.xbot_rgb_picker = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.XBOT_RGBLED_color).appendField(new Blockly.FieldColour("#ff0000"), "VALUE").appendField(Lang.Blocks.XBOT_set).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.xbot_rgb_picker = function(b, a) {
  var c = a.getStringField("VALUE"), d = Entry.hw.sendQueue;
  d.ledR = parseInt(c.substr(1, 2), 16);
  d.ledG = parseInt(c.substr(3, 2), 16);
  d.ledB = parseInt(c.substr(5, 2), 16);
  return a.callReturn();
};
Blockly.Blocks.xbot_buzzer = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_play_note_for_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.XBOT_c, "C"], [Lang.Blocks.XBOT_d, "D"], [Lang.Blocks.XBOT_e, "E"], [Lang.Blocks.XBOT_f, "F"], [Lang.Blocks.XBOT_g, "G"], [Lang.Blocks.XBOT_a, "A"], [Lang.Blocks.XBOT_b, "B"]]), "NOTE").appendField(" ").appendField(new Blockly.FieldDropdown([["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"]]), "OCTAVE").appendField(Lang.Blocks.HAMSTER_play_note_for_3);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.XBOT_melody_ms).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.xbot_buzzer = function(b, a) {
  var c = Entry.hw.sendQueue, d = a.getStringField("NOTE", a), e = a.getStringField("OCTAVE", a), f = a.getNumberValue("VALUE", a), d = d + e;
  c.note = "C2" == d ? 65 : "D2" == d ? 73 : "E2" == d ? 82 : "F2" == d ? 87 : "G2" == d ? 98 : "A2" == d ? 110 : "B2" == d ? 123 : "C3" == d ? 131 : "D3" == d ? 147 : "E3" == d ? 165 : "F3" == d ? 175 : "G3" == d ? 196 : "A3" == d ? 220 : "B3" == d ? 247 : "C4" == d ? 262 : "D4" == d ? 294 : "E4" == d ? 330 : "F4" == d ? 349 : "G4" == d ? 392 : "A4" == d ? 440 : "B4" == d ? 494 : "C5" == d ? 523 : "D5" == d ? 587 : "E5" == d ? 659 : "F5" == d ? 698 : "G5" == d ? 784 : "A5" == d ? 880 : "B5" == d ? 
  988 : "C6" == d ? 1047 : "D6" == d ? 1175 : "E6" == d ? 1319 : "F6" == d ? 1397 : "G6" == d ? 1568 : "A6" == d ? 1760 : "B6" == d ? 1976 : "C7" == d ? 2093 : "D7" == d ? 2349 : "E7" == d ? 2637 : "F7" == d ? 2794 : "G7" == d ? 3136 : "A7" == d ? 3520 : "B7" == d ? 3951 : 262;
  c.duration = 40 * f;
  return a.callReturn();
};
Blockly.Blocks.xbot_lcd = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("LCD").appendField(new Blockly.FieldDropdown([["0", "0"], ["1", "1"]]), "LINE").appendField(Lang.Blocks.XBOT_Line).appendField(", ").appendField(Lang.Blocks.XBOT_outputValue);
  this.appendValueInput("VALUE").setCheck(["String", "Number"]);
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.xbot_lcd = function(b, a) {
  var c = Entry.hw.sendQueue, d = a.getNumberField("LINE", a), e = a.getStringValue("VALUE", a);
  0 == d ? (c.lcdNum = 0, c.lcdTxt = e) : 1 == d && (c.lcdNum = 1, c.lcdTxt = e);
  return a.callReturn();
};
Entry.Collection = function(b) {
  this.length = 0;
  this._hashMap = {};
  this._observers = [];
  this.set(b);
};
(function(b, a) {
  b.set = function(b) {
    for (;this.length;) {
      a.pop.call(this);
    }
    var d = this._hashMap, e;
    for (e in d) {
      delete d[e];
    }
    if (void 0 !== b) {
      e = 0;
      for (var f = b.length;e < f;e++) {
        var g = b[e];
        d[g.id] = g;
        a.push.call(this, g);
      }
    }
  };
  b.push = function(b) {
    this._hashMap[b.id] = b;
    a.push.call(this, b);
  };
  b.unshift = function() {
    for (var b = Array.prototype.slice.call(arguments, 0), d = this._hashMap, e = b.length - 1;0 <= e;e--) {
      var f = b[e];
      a.unshift.call(this, f);
      d[f.id] = f;
    }
  };
  b.insert = function(b, d) {
    a.splice.call(this, d, 0, b);
    this._hashMap[b.id] = b;
  };
  b.has = function(a) {
    return !!this._hashMap[a];
  };
  b.get = function(a) {
    return this._hashMap[a];
  };
  b.at = function(a) {
    return this[a];
  };
  b.getAll = function() {
    for (var a = this.length, b = [], e = 0;e < a;e++) {
      b.push(this[e]);
    }
    return b;
  };
  b.indexOf = function(b) {
    return a.indexOf.call(this, b);
  };
  b.find = function(a) {
    for (var b = [], e, f = 0, g = this.length;f < g;f++) {
      e = !0;
      var h = this[f], k;
      for (k in a) {
        if (a[k] != h[k]) {
          e = !1;
          break;
        }
      }
      e && b.push(h);
    }
    return b;
  };
  b.pop = function() {
    var b = a.pop.call(this);
    delete this._hashMap[b.id];
    return b;
  };
  b.shift = function() {
    var b = a.shift.call(this);
    delete this._hashMap[b.id];
    return b;
  };
  b.slice = function(b, d) {
    var e = a.slice.call(this, b, d), f = this._hashMap, g;
    for (g in e) {
      delete f[e[g].id];
    }
    return e;
  };
  b.remove = function(a) {
    var b = this.indexOf(a);
    -1 < b && (delete this._hashMap[a.id], this.splice(b, 1));
  };
  b.splice = function(b, d) {
    var e = a.slice.call(arguments, 2), f = this._hashMap;
    d = void 0 === d ? this.length - b : d;
    for (var g = a.splice.call(this, b, d), h = 0, k = g.length;h < k;h++) {
      delete f[g[h].id];
    }
    h = 0;
    for (k = e.length;h < k;h++) {
      f = e[h], a.splice.call(this, b++, 0, f), this._hashMap[f.id] = f;
    }
    return g;
  };
  b.clear = function() {
    for (;this.length;) {
      a.pop.call(this);
    }
    this._hashMap = {};
  };
  b.map = function(a, b) {
    for (var e = 0, f = this.length;e < f;e++) {
      a(this[e], b);
    }
  };
  b.moveFromTo = function(b, d) {
    var e = this.length - 1;
    0 > b || 0 > d || b > e || d > e || a.splice.call(this, d, 0, a.splice.call(this, b, 1)[0]);
  };
  b.sort = function() {
  };
  b.fromJSON = function() {
  };
  b.toJSON = function() {
    for (var a = [], b = 0, e = this.length;b < e;b++) {
      a.push(this[b].toJSON());
    }
    return a;
  };
  b.observe = function() {
  };
  b.unobserve = function() {
  };
  b.notify = function() {
  };
  b.destroy = function() {
  };
})(Entry.Collection.prototype, Array.prototype);
Entry.Event = function(b) {
  this._sender = b;
  this._listeners = [];
};
(function(b) {
  b.attach = function(a, b) {
    var d = {obj:a, fn:b};
    this._listeners.push(d);
    return d;
  };
  b.detach = function(a) {
    var b = this._listeners;
    a = b.indexOf(a);
    if (-1 < a) {
      return b.splice(a, 1);
    }
  };
  b.clear = function() {
    for (var a = this._listeners;a.length;) {
      a.pop();
    }
  };
  b.notify = function() {
    var a = arguments;
    this._listeners.slice().forEach(function(b) {
      b.fn.apply(b.obj, a);
    });
  };
})(Entry.Event.prototype);
Entry.Observer = function(b, a, c, d) {
  this.parent = b;
  this.object = a;
  this.funcName = c;
  this.attrs = d;
  b.push(this);
};
(function(b) {
  b.destroy = function() {
    var a = this.parent, b = a.indexOf(this);
    -1 < b && a.splice(b, 1);
    return this;
  };
})(Entry.Observer.prototype);
Entry.Container = function() {
  this.objects_ = [];
  this.cachedPicture = {};
  this.inputValue = {};
  this.currentObjects_ = this.copiedObject = null;
};
Entry.Container.prototype.generateView = function(b, a) {
  this._view = b;
  this._view.addClass("entryContainer");
  if (a && "workspace" != a) {
    "phone" == a && (this._view.addClass("entryContainerPhone"), c = Entry.createElement("div"), c.addClass("entryAddObjectWorkspace"), c.innerHTML = Lang.Workspace.add_object, c.bindOnClick(function(a) {
      Entry.dispatchEvent("openSpriteManager");
    }), c = Entry.createElement("div"), c.addClass("entryContainerListPhoneWrapper"), this._view.appendChild(c), d = Entry.createElement("ul"), d.addClass("entryContainerListPhone"), c.appendChild(d), this.listView_ = d);
  } else {
    this._view.addClass("entryContainerWorkspace");
    this._view.setAttribute("id", "entryContainerWorkspaceId");
    var c = Entry.createElement("div");
    c.addClass("entryAddObjectWorkspace");
    c.innerHTML = Lang.Workspace.add_object;
    c.bindOnClick(function(a) {
      Entry.dispatchEvent("openSpriteManager");
    });
    c = Entry.createElement("div");
    c.addClass("entryContainerListWorkspaceWrapper");
    Entry.isForLecture && (this.generateTabView(), c.addClass("lecture"));
    Entry.Utils.disableContextmenu(c);
    $(c).on("contextmenu", function(a) {
      Entry.ContextMenu.show([{text:Lang.Blocks.Paste_blocks, callback:function() {
        Entry.container.copiedObject ? Entry.container.addCloneObject(Entry.container.copiedObject) : Entry.toast.alert(Lang.Workspace.add_object_alert, Lang.Workspace.object_not_found_for_paste);
      }}], "workspace-contextmenu");
    });
    this._view.appendChild(c);
    var d = Entry.createElement("ul");
    d.addClass("entryContainerListWorkspace");
    c.appendChild(d);
    this.listView_ = d;
    this.enableSort();
  }
};
Entry.Container.prototype.enableSort = function() {
  $ && $(this.listView_).sortable({start:function(b, a) {
    a.item.data("start_pos", a.item.index());
  }, stop:function(b, a) {
    var c = a.item.data("start_pos"), d = a.item.index();
    Entry.container.moveElement(c, d);
  }, axis:"y"});
};
Entry.Container.prototype.disableSort = function() {
  $ && $(this.listView_).sortable("destroy");
};
Entry.Container.prototype.updateListView = function() {
  if (this.listView_) {
    for (var b = this.listView_;b.hasChildNodes();) {
      b.removeChild(b.lastChild);
    }
    var a = this.getCurrentObjects(), c;
    for (c in a) {
      b.appendChild(a[c].view_);
    }
    Entry.stage.sortZorder();
  }
};
Entry.Container.prototype.setObjects = function(b) {
  for (var a in b) {
    var c = new Entry.EntryObject(b[a]);
    this.objects_.push(c);
    c.generateView();
    c.pictures.map(function(a) {
      Entry.playground.generatePictureElement(a);
    });
    c.sounds.map(function(a) {
      Entry.playground.generateSoundElement(a);
    });
  }
  this.updateObjectsOrder();
  this.updateListView();
  Entry.stage.sortZorder();
  Entry.variableContainer.updateViews();
  b = Entry.type;
  ("workspace" == b || "phone" == b) && (b = this.getCurrentObjects()[0]) && this.selectObject(b.id);
};
Entry.Container.prototype.getPictureElement = function(b) {
  for (var a in this.objects_) {
    var c = this.objects_[a], d;
    for (d in c.pictures) {
      if (b === c.pictures[d].id) {
        return c.pictures[d].view;
      }
    }
  }
  throw Error("No picture found");
};
Entry.Container.prototype.setPicture = function(b) {
  for (var a in this.objects_) {
    var c = this.objects_[a], d;
    for (d in c.pictures) {
      if (b.id === c.pictures[d].id) {
        a = {};
        a.dimension = b.dimension;
        a.id = b.id;
        a.filename = b.filename;
        a.fileurl = b.fileurl;
        a.name = b.name;
        a.view = c.pictures[d].view;
        c.pictures[d] = a;
        return;
      }
    }
  }
  throw Error("No picture found");
};
Entry.Container.prototype.selectPicture = function(b) {
  for (var a in this.objects_) {
    var c = this.objects_[a], d;
    for (d in c.pictures) {
      var e = c.pictures[d];
      if (b === e.id) {
        return c.selectedPicture = e, c.entity.setImage(e), c.updateThumbnailView(), c.id;
      }
    }
  }
  throw Error("No picture found");
};
Entry.Container.prototype.addObject = function(b, a) {
  var c = new Entry.EntryObject(b);
  c.name = Entry.getOrderedName(c.name, this.objects_);
  Entry.stateManager && Entry.stateManager.addCommand("add object", this, this.removeObject, c);
  c.scene || (c.scene = Entry.scene.selectedScene);
  "number" == typeof a ? b.sprite.category && "background" == b.sprite.category.main ? (c.setLock(!0), this.objects_.push(c)) : this.objects_.splice(a, 0, c) : b.sprite.category && "background" == b.sprite.category.main ? this.objects_.push(c) : this.objects_.unshift(c);
  c.generateView();
  c.pictures.map(function(a) {
    a.id = Entry.generateHash();
    Entry.playground.generatePictureElement(a);
  });
  c.sounds.map(function(a) {
    Entry.playground.generateSoundElement(a);
  });
  this.setCurrentObjects();
  this.updateObjectsOrder();
  this.updateListView();
  this.selectObject(c.id);
  Entry.variableContainer.updateViews();
  return new Entry.State(this, this.removeObject, c);
};
Entry.Container.prototype.addCloneObject = function(b, a) {
  var c = b.toJSON(), d = Entry.generateHash();
  Entry.variableContainer.addCloneLocalVariables({objectId:c.id, newObjectId:d, json:c});
  c.id = d;
  c.scene = a || Entry.scene.selectedScene;
  this.addObject(c);
};
Entry.Container.prototype.removeObject = function(b) {
  var a = this.objects_.indexOf(b), c = b.toJSON();
  Entry.stateManager && Entry.stateManager.addCommand("remove object", this, this.addObject, c, a);
  c = new Entry.State(this.addObject, c, a);
  b.destroy();
  this.objects_.splice(a, 1);
  this.setCurrentObjects();
  Entry.stage.sortZorder();
  this.objects_.length && 0 !== a ? 0 < this.getCurrentObjects().length ? Entry.container.selectObject(this.getCurrentObjects()[0].id) : Entry.container.selectObject() : this.objects_.length && 0 === a ? Entry.container.selectObject(this.getCurrentObjects()[0].id) : (Entry.container.selectObject(), Entry.playground.flushPlayground());
  Entry.toast.success(Lang.Workspace.remove_object, b.name + " " + Lang.Workspace.remove_object_msg);
  Entry.variableContainer.removeLocalVariables(b.id);
  Entry.playground.reloadPlayground();
  return c;
};
Entry.Container.prototype.selectObject = function(b, a) {
  var c = this.getObject(b);
  a && c && Entry.scene.selectScene(c.scene);
  this.mapObjectOnScene(function(a) {
    a.view_ && a.view_.removeClass("selectedObject");
    a.isSelected_ = !1;
  });
  c && (c.view_ && c.view_.addClass("selectedObject"), c.isSelected_ = !0);
  Entry.playground && Entry.playground.injectObject(c);
  "minimize" != Entry.type && Entry.engine.isState("stop") && Entry.stage.selectObject(c);
};
Entry.Container.prototype.getAllObjects = function() {
  return this.objects_;
};
Entry.Container.prototype.getObject = function(b) {
  for (var a = this.objects_.length, c = 0;c < a;c++) {
    var d = this.objects_[c];
    if (d.id == b) {
      return d;
    }
  }
};
Entry.Container.prototype.getEntity = function(b) {
  if (b = this.getObject(b)) {
    return b.entity;
  }
  Entry.toast.alert(Lang.Msgs.runtime_error, Lang.Workspace.object_not_found, !0);
};
Entry.Container.prototype.getVariable = function(b) {
  for (var a = 0;a < this.variables_.length;a++) {
    var c = this.variables_[a];
    if (c.getId() == b || c.getName() == b) {
      return c;
    }
  }
};
Entry.Container.prototype.moveElement = function(b, a, c) {
  var d;
  d = this.getCurrentObjects();
  b = this.getAllObjects().indexOf(d[b]);
  a = this.getAllObjects().indexOf(d[a]);
  !c && Entry.stateManager && Entry.stateManager.addCommand("reorder object", Entry.container, Entry.container.moveElement, a, b, !0);
  this.objects_.splice(a, 0, this.objects_.splice(b, 1)[0]);
  this.setCurrentObjects();
  Entry.container.updateListView();
  return new Entry.State(Entry.container, Entry.container.moveElement, a, b, !0);
};
Entry.Container.prototype.moveElementByBlock = function(b, a) {
  var c = this.getCurrentObjects().splice(b, 1)[0];
  this.getCurrentObjects().splice(a, 0, c);
  Entry.stage.sortZorder();
  this.updateListView();
};
Entry.Container.prototype.getDropdownList = function(b) {
  var a = [];
  switch(b) {
    case "sprites":
      var c = this.getCurrentObjects(), d = c.length;
      for (b = 0;b < d;b++) {
        var e = c[b];
        a.push([e.name, e.id]);
      }
      break;
    case "spritesWithMouse":
      c = this.getCurrentObjects();
      d = c.length;
      for (b = 0;b < d;b++) {
        e = c[b], a.push([e.name, e.id]);
      }
      a.push([Lang.Blocks.mouse_pointer, "mouse"]);
      break;
    case "spritesWithSelf":
      c = this.getCurrentObjects();
      d = c.length;
      for (b = 0;b < d;b++) {
        e = c[b], a.push([e.name, e.id]);
      }
      a.push([Lang.Blocks.self, "self"]);
      break;
    case "collision":
      a.push([Lang.Blocks.mouse_pointer, "mouse"]);
      c = this.getCurrentObjects();
      d = c.length;
      for (b = 0;b < d;b++) {
        e = c[b], a.push([e.name, e.id]);
      }
      a.push([Lang.Blocks.wall, "wall"]);
      a.push([Lang.Blocks.wall_up, "wall_up"]);
      a.push([Lang.Blocks.wall_down, "wall_down"]);
      a.push([Lang.Blocks.wall_right, "wall_right"]);
      a.push([Lang.Blocks.wall_left, "wall_left"]);
      break;
    case "pictures":
      c = Entry.playground.object.pictures;
      for (b = 0;b < c.length;b++) {
        d = c[b], a.push([d.name, d.id]);
      }
      break;
    case "messages":
      c = Entry.variableContainer.messages_;
      for (b = 0;b < c.length;b++) {
        d = c[b], a.push([d.name, d.id]);
      }
      break;
    case "variables":
      c = Entry.variableContainer.variables_;
      for (b = 0;b < c.length;b++) {
        d = c[b], d.object_ && d.object_ != Entry.playground.object.id || a.push([d.getName(), d.getId()]);
      }
      a && 0 !== a.length || a.push([Lang.Blocks.VARIABLE_variable, "null"]);
      break;
    case "lists":
      c = Entry.variableContainer.lists_;
      for (b = 0;b < c.length;b++) {
        d = c[b], a.push([d.getName(), d.getId()]);
      }
      a && 0 !== a.length || a.push([Lang.Blocks.VARIABLE_list, "null"]);
      break;
    case "scenes":
      c = Entry.scene.scenes_;
      for (b = 0;b < c.length;b++) {
        d = c[b], a.push([d.name, d.id]);
      }
      break;
    case "sounds":
      c = Entry.playground.object.sounds;
      for (b = 0;b < c.length;b++) {
        d = c[b], a.push([d.name, d.id]);
      }
      break;
    case "clone":
      a.push([Lang.Blocks.oneself, "self"]);
      d = this.objects_.length;
      for (b = 0;b < d;b++) {
        e = this.objects_[b], a.push([e.name, e.id]);
      }
      break;
    case "objectSequence":
      for (d = this.getCurrentObjects().length, b = 0;b < d;b++) {
        a.push([(b + 1).toString(), b.toString()]);
      }
    ;
  }
  a.length || (a = [[Lang.Blocks.no_target, "null"]]);
  return a;
};
Entry.Container.prototype.clearRunningState = function() {
  this.mapObject(function(b) {
    b.entity.clearScript();
    for (var a = b.clonedEntities.length;0 < a;a--) {
      b.clonedEntities[a - 1].removeClone();
    }
    b.clonedEntities = [];
  });
};
Entry.Container.prototype.mapObject = function(b, a) {
  for (var c = this.objects_.length, d = 0;d < c;d++) {
    b(this.objects_[d], a);
  }
};
Entry.Container.prototype.mapObjectOnScene = function(b, a) {
  for (var c = this.getCurrentObjects(), d = c.length, e = 0;e < d;e++) {
    b(c[e], a);
  }
};
Entry.Container.prototype.clearRunningStateOnScene = function() {
  this.mapObjectOnScene(function(b) {
    b.entity.clearScript();
    for (var a = b.clonedEntities.length;0 < a;a--) {
      b.clonedEntities[a - 1].removeClone();
    }
    b.clonedEntities = [];
  });
};
Entry.Container.prototype.mapEntity = function(b, a) {
  for (var c = this.objects_.length, d = 0;d < c;d++) {
    b(this.objects_[d].entity, a);
  }
};
Entry.Container.prototype.mapEntityOnScene = function(b, a) {
  for (var c = this.getCurrentObjects(), d = c.length, e = 0;e < d;e++) {
    b(c[e].entity, a);
  }
};
Entry.Container.prototype.mapEntityIncludeClone = function(b, a) {
  for (var c = this.objects_, d = c.length, e = 0;e < d;e++) {
    var f = c[e], g = f.clonedEntities.length;
    b(f.entity, a);
    for (var h = 0;h < g;h++) {
      var k = f.clonedEntities[h];
      k && !k.isStamp && b(k, a);
    }
  }
};
Entry.Container.prototype.mapEntityIncludeCloneOnScene = function(b, a) {
  for (var c = this.getCurrentObjects(), d = c.length, e = 0;e < d;e++) {
    var f = c[e], g = f.clonedEntities.length;
    b(f.entity, a);
    for (var h = 0;h < g;h++) {
      var k = f.clonedEntities[h];
      k && !k.isStamp && b(k, a);
    }
  }
};
Entry.Container.prototype.getCachedPicture = function(b) {
  Entry.assert("string" == typeof b, "pictureId must be string");
  return this.cachedPicture[b];
};
Entry.Container.prototype.cachePicture = function(b, a) {
  this.cachedPicture[b] = a;
};
Entry.Container.prototype.toJSON = function() {
  for (var b = [], a = this.objects_.length, c = 0;c < a;c++) {
    b.push(this.objects_[c].toJSON());
  }
  return b;
};
Entry.Container.prototype.takeSequenceSnapshot = function() {
  for (var b = this.objects_.length, a = this.objects_, c = 0;c < b;c++) {
    a[c].index = c;
  }
};
Entry.Container.prototype.loadSequenceSnapshot = function() {
  for (var b = this.objects_.length, a = Array(b), c = 0;c < b;c++) {
    var d = this.objects_[c];
    a[d.index] = d;
    delete d.index;
  }
  this.objects_ = a;
  this.setCurrentObjects();
  Entry.stage.sortZorder();
  this.updateListView();
};
Entry.Container.prototype.getInputValue = function() {
  return this.inputValue.getValue();
};
Entry.Container.prototype.setInputValue = function(b) {
  b ? this.inputValue.setValue(b) : this.inputValue.setValue(0);
};
Entry.Container.prototype.resetSceneDuringRun = function() {
  this.mapEntityOnScene(function(b) {
    b.loadSnapshot();
    b.object.filters = [];
    b.resetFilter();
    b.dialog && b.dialog.remove();
    b.shape && b.removeBrush();
  });
  this.clearRunningStateOnScene();
};
Entry.Container.prototype.setCopiedObject = function(b) {
  this.copiedObject = b;
};
Entry.Container.prototype.updateObjectsOrder = function() {
  for (var b = Entry.scene.getScenes(), a = [], c = 0;c < b.length;c++) {
    for (var d = this.getSceneObjects(b[c]), e = 0;e < d.length;e++) {
      a.push(d[e]);
    }
  }
  this.objects_ = a;
};
Entry.Container.prototype.getSceneObjects = function(b) {
  b = b || Entry.scene.selectedScene;
  for (var a = [], c = this.getAllObjects(), d = 0;d < c.length;d++) {
    b.id == c[d].scene.id && a.push(c[d]);
  }
  return a;
};
Entry.Container.prototype.setCurrentObjects = function() {
  this.currentObjects_ = this.getSceneObjects();
};
Entry.Container.prototype.getCurrentObjects = function() {
  var b = this.currentObjects_;
  b && 0 !== b.length || this.setCurrentObjects();
  return this.currentObjects_;
};
Entry.Container.prototype.getProjectWithJSON = function(b) {
  b.objects = Entry.container.toJSON();
  b.variables = Entry.variableContainer.getVariableJSON();
  b.messages = Entry.variableContainer.getMessageJSON();
  b.scenes = Entry.scene.toJSON();
  return b;
};
Entry.Container.prototype.generateTabView = function() {
  var b = this._view, a = this;
  this.tabViews = [];
  var c = Entry.createElement("div");
  c.addClass("entryContainerTabViewWorkspace");
  b.appendChild(c);
  var d = Entry.createElement("span");
  d.addClass("entryContainerTabItemWorkspace");
  d.addClass("entryEllipsis");
  d.innerHTML = Lang.Menus.lecture_container_tab_object;
  d.bindOnClick(function() {
    a.changeTabView("object");
  });
  this.tabViews.push(d);
  c.appendChild(d);
  var e = Entry.createElement("span");
  e.addClass("entryContainerTabItemWorkspace", "entryRemove");
  e.addClass("entryEllipsis");
  e.innerHTML = Lang.Menus.lecture_container_tab_video;
  e.bindOnClick(function() {
    a.changeTabView("movie");
  });
  this.tabViews.push(e);
  c.appendChild(e);
  this.youtubeTab = e;
  e = Entry.createElement("span");
  e.addClass("entryContainerTabItemWorkspace", "entryRemove");
  e.addClass("entryEllipsis");
  e.innerHTML = Lang.Menus.lecture_container_tab_project;
  e.bindOnClick(function() {
    a.changeTabView("done");
  });
  this.tabViews.push(e);
  c.appendChild(e);
  this.iframeTab = e;
  e = Entry.createElement("span");
  e.addClass("entryContainerTabItemWorkspace");
  e.addClass("entryEllipsis");
  e.innerHTML = Lang.Menus.lecture_container_tab_help;
  e.bindOnClick(function() {
    a.changeTabView("helper");
  });
  this.tabViews.push(e);
  c.appendChild(e);
  c = Entry.createElement("div");
  c.addClass("entryContainerMovieWorkspace");
  c.addClass("entryHide");
  b.appendChild(c);
  this.movieContainer = c;
  c = Entry.createElement("div");
  c.addClass("entryContainerDoneWorkspace");
  c.addClass("entryHide");
  b.appendChild(c);
  this.doneContainer = c;
  c = Entry.createElement("div");
  c.addClass("entryContainerHelperWorkspace");
  c.addClass("entryHide");
  b.appendChild(c);
  this.helperContainer = c;
  d.addClass("selected");
};
Entry.Container.prototype.changeTabView = function(b) {
  for (var a = this.tabViews, c = 0, d = a.length;c < d;c++) {
    a[c].removeClass("selected");
  }
  this.movieContainer.addClass("entryHide");
  this.doneContainer.addClass("entryHide");
  this.helperContainer.addClass("entryHide");
  "object" == b ? a[0].addClass("selected") : "movie" == b ? (b = this._view, b = b.style.width.substring(0, b.style.width.length - 2), this.movieFrame.setAttribute("width", b), this.movieFrame.setAttribute("height", 9 * b / 16), this.movieContainer.removeClass("entryHide"), a[1].addClass("selected")) : "done" == b ? (c = $(this.doneContainer).height(), b = $(this.doneContainer).width(), 9 * b / 16 + 35 < c ? c = 9 * b / 16 + 35 : b = (c - 35) / 9 * 16, this.doneProjectFrame.setAttribute("width", 
  b), this.doneProjectFrame.setAttribute("height", c), this.doneContainer.removeClass("entryHide"), a[2].addClass("selected")) : "helper" == b && (Entry.helper.blockHelperOn(), this.helperContainer.removeClass("entryHide"), a[3].addClass("selected"));
};
Entry.Container.prototype.initYoutube = function(b) {
  this.youtubeHash = b;
  this.youtubeTab.removeClass("entryRemove");
  b = this._view;
  b = b.style.width.substring(0, b.style.width.length - 2);
  var a = this.movieContainer, c = Entry.createElement("iframe");
  c.setAttribute("width", b);
  c.setAttribute("height", 9 * b / 16);
  c.setAttribute("allowfullscreen", "");
  c.setAttribute("frameborder", 0);
  c.setAttribute("src", "https://www.youtube.com/embed/" + this.youtubeHash);
  this.movieFrame = c;
  a.appendChild(c);
};
Entry.Container.prototype.initTvcast = function(b) {
  this.tvcast = b;
  this.youtubeTab.removeClass("entryRemove");
  b = this._view;
  b = b.style.width.substring(0, b.style.width.length - 2);
  var a = this.movieContainer, c = Entry.createElement("iframe");
  c.setAttribute("width", b);
  c.setAttribute("height", 9 * b / 16);
  c.setAttribute("allowfullscreen", "");
  c.setAttribute("frameborder", 0);
  c.setAttribute("src", this.tvcast);
  this.movieFrame = c;
  a.appendChild(c);
};
Entry.Container.prototype.initDoneProject = function(b) {
  this.doneProject = b;
  this.iframeTab.removeClass("entryRemove");
  b = this._view;
  b = b.style.width.substring(0, b.style.width.length - 2);
  var a = Entry.createElement("iframe");
  a.setAttribute("width", b);
  a.setAttribute("height", 9 * b / 16 + 35);
  a.setAttribute("frameborder", 0);
  a.setAttribute("src", "/api/iframe/project/" + this.doneProject);
  this.doneProjectFrame = a;
  this.doneContainer.appendChild(a);
};
Entry.Container.prototype.blurAllInputs = function() {
  this.getSceneObjects().map(function(b) {
    b = b.view_.getElementsByTagName("input");
    for (var a = 0, c = b.length;a < c;a++) {
      b[a].blur();
    }
  });
};
Entry.Container.prototype.showProjectAnswer = function() {
  var b = this.inputValue;
  b && b.setVisible(!0);
};
Entry.Container.prototype.hideProjectAnswer = function(b) {
  var a = this.inputValue;
  if (a && a.isVisible() && !Entry.engine.isState("run")) {
    for (var c = Entry.container.getAllObjects(), d = ["ask_and_wait", "get_canvas_input_value", "set_visible_answer"], e = 0, f = c.length;e < f;e++) {
      for (var g = c[e].script.getElementsByTagName("block"), h = 0, k = g.length;h < k;h++) {
        if (-1 < d.indexOf(g[h].getAttribute("type")) && g[h].getAttribute("id") != b.getAttribute("id")) {
          return;
        }
      }
    }
    a.setVisible(!1);
  }
};
Entry.Container.prototype.getView = function() {
  return this._view;
};
Entry.Container.prototype.resize = function() {
};
Entry.db = {data:{}, typeMap:{}};
(function(b) {
  b.add = function(a) {
    this.data[a.id] = a;
    var b = a.type;
    void 0 === this.typeMap[b] && (this.typeMap[b] = {});
    this.typeMap[b][a.id] = a;
  };
  b.has = function(a) {
    return this.data.hasOwnProperty(a);
  };
  b.remove = function(a) {
    this.has(a) && (delete this.typeMap[this.data[a].type][a], delete this.data[a]);
  };
  b.get = function(a) {
    return this.data[a];
  };
  b.find = function() {
  };
  b.clear = function() {
    this.data = {};
    this.typeMap = {};
  };
})(Entry.db);
Entry.Dom = function(b, a) {
  var c = /<(\w+)>/, d;
  d = b instanceof HTMLElement ? $(b) : b instanceof jQuery ? b : c.test(b) ? $(b) : $("<" + b + "></" + b + ">");
  if (void 0 === a) {
    return d;
  }
  a.id && d.attr("id", a.id);
  a.class && d.addClass(a.class);
  a.classes && a.classes.map(function(a) {
    d.addClass(a);
  });
  a.parent && a.parent.append(d);
  d.bindOnClick = function() {
    var a, b, c = function(a) {
      a.stopImmediatePropagation();
      a.handled || (a.handled = !0, b.call(this, a));
    };
    1 < arguments.length ? (b = arguments[1] instanceof Function ? arguments[1] : function() {
    }, a = "string" === typeof arguments[0] ? arguments[0] : "") : b = arguments[0] instanceof Function ? arguments[0] : function() {
    };
    if (a) {
      $(this).on("click touchstart", a, c);
    } else {
      $(this).on("click touchstart", c);
    }
  };
  return d;
};
Entry.SVG = function(b) {
  b = document.getElementById(b);
  return Entry.SVG.createElement(b);
};
Entry.SVG.NS = "http://www.w3.org/2000/svg";
Entry.SVG.NS_XLINK = "http://www.w3.org/1999/xlink";
Entry.SVG.createElement = function(b, a) {
  var c;
  c = "string" === typeof b ? document.createElementNS(Entry.SVG.NS, b) : b;
  if (a) {
    a.href && (c.setAttributeNS(Entry.SVG.NS_XLINK, "href", a.href), delete a.href);
    for (var d in a) {
      c.setAttribute(d, a[d]);
    }
  }
  this instanceof SVGElement && this.appendChild(c);
  c.elem = Entry.SVG.createElement;
  c.attr = Entry.SVG.attr;
  c.addClass = Entry.SVG.addClass;
  c.removeClass = Entry.SVG.removeClass;
  c.hasClass = Entry.SVG.hasClass;
  c.remove = Entry.SVG.remove;
  return c;
};
Entry.SVG.attr = function(b, a) {
  if ("string" === typeof b) {
    var c = {};
    c[b] = a;
    b = c;
  }
  if (b) {
    b.href && (this.setAttributeNS(Entry.SVG.NS_XLINK, "href", b.href), delete b.href);
    for (var d in b) {
      this.setAttribute(d, b[d]);
    }
  }
  return this;
};
Entry.SVG.addClass = function(b) {
  for (var a = this.getAttribute("class"), c = 0;c < arguments.length;c++) {
    b = arguments[c], this.hasClass(b) || (a += " " + b);
  }
  this.setAttribute("class", a);
  return this;
};
Entry.SVG.removeClass = function(b) {
  for (var a = this.getAttribute("class"), c = 0;c < arguments.length;c++) {
    b = arguments[c], this.hasClass(b) && (a = a.replace(new RegExp("(\\s|^)" + b + "(\\s|$)"), " "));
  }
  this.setAttribute("class", a);
  return this;
};
Entry.SVG.hasClass = function(b) {
  var a = this.getAttribute("class");
  return a ? a.match(new RegExp("(\\s|^)" + b + "(\\s|$)")) : !1;
};
Entry.SVG.remove = function() {
  this.parentNode && this.parentNode.removeChild(this);
};
Entry.Dialog = function(b, a, c, d) {
  b.dialog && b.dialog.remove();
  b.dialog = this;
  this.parent = b;
  this.padding = 10;
  this.border = 2;
  "number" == typeof a && (a = String(a));
  this.message_ = a = a.match(/.{1,15}/g).join("\n");
  this.mode_ = c;
  "speak" == c && this.generateSpeak();
  d || Entry.stage.loadDialog(this);
};
Entry.Dialog.prototype.generateSpeak = function() {
  this.object = new createjs.Container;
  var b = new createjs.Text;
  b.font = "15px NanumGothic";
  b.textBaseline = "top";
  b.textAlign = "left";
  b.text = this.message_;
  var a = b.getTransformedBounds(), c = a.height, a = 10 <= a.width ? a.width : 17, d = new createjs.Shape;
  d.graphics.f("#f5f5f5").ss(2, "round").s("#6FC0DD").rr(-this.padding, -this.padding, a + 2 * this.padding, c + 2 * this.padding, this.padding);
  this.object.addChild(d);
  this.object.regX = a / 2;
  this.object.regY = c / 2;
  this.width = a;
  this.height = c;
  this.notch = this.createSpeakNotch("ne");
  this.update();
  this.object.addChild(this.notch);
  this.object.addChild(b);
};
Entry.Dialog.prototype.update = function() {
  var b = this.parent.object.getTransformedBounds(), a = "";
  -135 < b.y - this.height - 20 - this.border ? (this.object.y = b.y - this.height / 2 - 20 - this.padding, a += "n") : (this.object.y = b.y + b.height + this.height / 2 + 20 + this.padding, a += "s");
  240 > b.x + b.width + this.width ? (this.object.x = b.x + b.width + this.width / 2, a += "e") : (this.object.x = b.x - this.width / 2, a += "w");
  this.notch.type != a && (this.object.removeChild(this.notch), this.notch = this.createSpeakNotch(a), this.object.addChild(this.notch));
};
Entry.Dialog.prototype.createSpeakNotch = function(b) {
  var a = new createjs.Shape;
  a.type = b;
  "ne" == b ? a.graphics.f("#f5f5f5").ss(2, "round").s("#6FC0DD").mt(0, this.height + this.padding - 1.5).lt(-10, this.height + this.padding + 20).lt(20, this.height + this.padding - 1.5) : "nw" == b ? a.graphics.f("#f5f5f5").ss(2, "round").s("#6FC0DD").mt(this.width, this.height + this.padding - 1.5).lt(this.width + 10, this.height + this.padding + 20).lt(this.width - 20, this.height + this.padding - 1.5) : "se" == b ? a.graphics.f("#f5f5f5").ss(2, "round").s("#6FC0DD").mt(0, -this.padding + 1.5).lt(-10, 
  -this.padding - 20).lt(20, -this.padding + 1.5) : "sw" == b && a.graphics.f("#f5f5f5").ss(2, "round").s("#6FC0DD").mt(this.width, -this.padding + 1.5).lt(this.width + 10, -this.padding - 20).lt(this.width - 20, -this.padding + 1.5);
  return a;
};
Entry.Dialog.prototype.remove = function() {
  Entry.stage.unloadDialog(this);
  this.parent.dialog = null;
};
Entry.DoneProject = function(b) {
  this.generateView(b);
};
var p = Entry.DoneProject.prototype;
p.init = function(b) {
  this.projectId = b;
};
p.generateView = function(b) {
  var a = Entry.createElement("div");
  a.addClass("entryContainerDoneWorkspace");
  a.addClass("entryHidden");
  this.doneContainer = a;
  a = Entry.createElement("iframe");
  a.setAttribute("id", "doneProjectframe");
  a.setAttribute("frameborder", 0);
  a.setAttribute("src", "/api/iframe/project/" + b);
  this.doneProjectFrame = a;
  this.doneContainer.appendChild(a);
};
p.getView = function() {
  return this.doneContainer;
};
p.resize = function() {
  var b = document.getElementById("entryContainerWorkspaceId"), a = document.getElementById("doneProjectframe");
  w = b.offsetWidth;
  a.width = w + "px";
  a.height = 9 * w / 16 + "px";
};
Entry.Engine = function() {
  function b(a) {
    var b = [37, 38, 39, 40, 32], d = a.keyCode || a.which, e = Entry.stage.inputField;
    32 == d && e && e.hasFocus() || -1 < b.indexOf(d) && a.preventDefault();
  }
  this.state = "stop";
  this.popup = null;
  this.isUpdating = !0;
  this.speeds = [1, 15, 30, 45, 60];
  this.pressedKeys = [];
  Entry.addEventListener("keyPressed", this.captureKeyEvent);
  Entry.addEventListener("keyUpped", this.captureKeyUpEvent);
  Entry.addEventListener("canvasClick", function(a) {
    Entry.engine.fireEvent("mouse_clicked");
  });
  Entry.addEventListener("canvasClickCanceled", function(a) {
    Entry.engine.fireEvent("mouse_click_cancled");
  });
  Entry.addEventListener("entityClick", function(a) {
    Entry.engine.fireEventOnEntity("when_object_click", a);
  });
  Entry.addEventListener("entityClickCanceled", function(a) {
    Entry.engine.fireEventOnEntity("when_object_click_canceled", a);
  });
  "phone" != Entry.type && (Entry.addEventListener("stageMouseMove", function(a) {
    Entry.engine.updateMouseView();
  }), Entry.addEventListener("stageMouseOut", function(a) {
    Entry.engine.hideMouseView();
  }));
  Entry.addEventListener("run", function() {
    $(window).bind("keydown", b);
  });
  Entry.addEventListener("stop", function() {
    $(window).unbind("keydown", b);
  });
};
Entry.Engine.prototype.generateView = function(b, a) {
  if (a && "workspace" != a) {
    "minimize" == a ? (this.view_ = b, this.view_.addClass("entryEngine"), this.view_.addClass("entryEngineMinimize"), this.maximizeButton = Entry.createElement("button"), this.maximizeButton.addClass("entryEngineButtonMinimize"), this.maximizeButton.addClass("entryMaximizeButtonMinimize"), this.view_.appendChild(this.maximizeButton), this.maximizeButton.bindOnClick(function(a) {
      Entry.engine.toggleFullscreen();
    }), this.coordinateButton = Entry.createElement("button"), this.coordinateButton.addClass("entryEngineButtonMinimize"), this.coordinateButton.addClass("entryCoordinateButtonMinimize"), this.view_.appendChild(this.coordinateButton), this.coordinateButton.bindOnClick(function(a) {
      this.hasClass("toggleOn") ? this.removeClass("toggleOn") : this.addClass("toggleOn");
      Entry.stage.toggleCoordinator();
    }), this.runButton = Entry.createElement("button"), this.runButton.addClass("entryEngineButtonMinimize"), this.runButton.addClass("entryRunButtonMinimize"), this.runButton.innerHTML = Lang.Blocks.START, this.view_.appendChild(this.runButton), this.runButton.bindOnClick(function(a) {
      a.preventDefault();
      Entry.engine.toggleRun();
    }), this.runButton2 = Entry.createElement("button"), this.runButton2.addClass("entryEngineBigButtonMinimize_popup"), this.runButton2.addClass("entryEngineBigButtonMinimize_popup_run"), this.view_.appendChild(this.runButton2), this.runButton2.bindOnClick(function(a) {
      a.preventDefault();
      Entry.engine.toggleRun();
    }), this.stopButton = Entry.createElement("button"), this.stopButton.addClass("entryEngineButtonMinimize"), this.stopButton.addClass("entryStopButtonMinimize"), this.stopButton.addClass("entryRemove"), this.stopButton.innerHTML = Lang.Workspace.stop, this.view_.appendChild(this.stopButton), this.stopButton.bindOnClick(function(a) {
      this.blur();
      a.preventDefault();
      Entry.engine.toggleStop();
    }), this.pauseButton = Entry.createElement("button"), this.pauseButton.innerHTML = Lang.Workspace.pause, this.pauseButton.addClass("entryEngineButtonMinimize"), this.pauseButton.addClass("entryPauseButtonMinimize"), this.pauseButton.addClass("entryRemove"), this.view_.appendChild(this.pauseButton), this.pauseButton.bindOnClick(function(a) {
      this.blur();
      a.preventDefault();
      Entry.engine.togglePause();
    }), this.mouseView = Entry.createElement("div"), this.mouseView.addClass("entryMouseViewMinimize"), this.mouseView.addClass("entryRemove"), this.view_.appendChild(this.mouseView)) : "phone" == a && (this.view_ = b, this.view_.addClass("entryEngine", "entryEnginePhone"), this.headerView_ = Entry.createElement("div", "entryEngineHeader"), this.headerView_.addClass("entryEngineHeaderPhone"), this.view_.appendChild(this.headerView_), this.maximizeButton = Entry.createElement("button"), this.maximizeButton.addClass("entryEngineButtonPhone", 
    "entryMaximizeButtonPhone"), this.headerView_.appendChild(this.maximizeButton), this.maximizeButton.bindOnClick(function(a) {
      Entry.engine.footerView_.addClass("entryRemove");
      Entry.engine.headerView_.addClass("entryRemove");
      Entry.launchFullScreen(Entry.engine.view_);
    }), document.addEventListener("fullscreenchange", function(a) {
      Entry.engine.exitFullScreen();
    }), document.addEventListener("webkitfullscreenchange", function(a) {
      Entry.engine.exitFullScreen();
    }), document.addEventListener("mozfullscreenchange", function(a) {
      Entry.engine.exitFullScreen();
    }), this.footerView_ = Entry.createElement("div", "entryEngineFooter"), this.footerView_.addClass("entryEngineFooterPhone"), this.view_.appendChild(this.footerView_), this.runButton = Entry.createElement("button"), this.runButton.addClass("entryEngineButtonPhone", "entryRunButtonPhone"), Entry.objectAddable && this.runButton.addClass("small"), this.runButton.innerHTML = Lang.Workspace.run, this.footerView_.appendChild(this.runButton), this.runButton.bindOnClick(function(a) {
      a.preventDefault();
      Entry.engine.toggleRun();
    }), this.stopButton = Entry.createElement("button"), this.stopButton.addClass("entryEngineButtonPhone", "entryStopButtonPhone", "entryRemove"), Entry.objectAddable && this.stopButton.addClass("small"), this.stopButton.innerHTML = Lang.Workspace.stop, this.footerView_.appendChild(this.stopButton), this.stopButton.bindOnClick(function(a) {
      a.preventDefault();
      Entry.engine.toggleStop();
    }));
  } else {
    this.view_ = b;
    this.view_.addClass("entryEngine_w");
    this.view_.addClass("entryEngineWorkspace_w");
    var c = Entry.createElement("button");
    this.speedButton = c;
    this.speedButton.addClass("entrySpeedButtonWorkspace", "entryEngineTopWorkspace", "entryEngineButtonWorkspace_w");
    this.view_.appendChild(this.speedButton);
    this.speedButton.bindOnClick(function(a) {
      Entry.engine.toggleSpeedPanel();
      c.blur();
    });
    this.maximizeButton = Entry.createElement("button");
    this.maximizeButton.addClass("entryEngineButtonWorkspace_w", "entryEngineTopWorkspace", "entryMaximizeButtonWorkspace_w");
    this.view_.appendChild(this.maximizeButton);
    this.maximizeButton.bindOnClick(function(a) {
      Entry.engine.toggleFullscreen();
    });
    var d = Entry.createElement("button");
    this.coordinateButton = d;
    this.coordinateButton.addClass("entryEngineButtonWorkspace_w", "entryEngineTopWorkspace", "entryCoordinateButtonWorkspace_w");
    this.view_.appendChild(this.coordinateButton);
    this.coordinateButton.bindOnClick(function(a) {
      this.hasClass("toggleOn") ? this.removeClass("toggleOn") : this.addClass("toggleOn");
      d.blur();
      Entry.stage.toggleCoordinator();
    });
    this.addButton = Entry.createElement("button");
    this.addButton.addClass("entryEngineButtonWorkspace_w");
    this.addButton.addClass("entryAddButtonWorkspace_w");
    this.addButton.innerHTML = Lang.Workspace.add_object;
    this.addButton.bindOnClick(function(a) {
      Entry.dispatchEvent("openSpriteManager");
    });
    this.view_.appendChild(this.addButton);
    this.runButton = Entry.createElement("button");
    this.runButton.addClass("entryEngineButtonWorkspace_w");
    this.runButton.addClass("entryRunButtonWorkspace_w");
    this.runButton.innerHTML = Lang.Workspace.run;
    this.view_.appendChild(this.runButton);
    this.runButton.bindOnClick(function(a) {
      a.preventDefault();
      Entry.engine.toggleRun();
    });
    this.runButton2 = Entry.createElement("button");
    this.runButton2.addClass("entryEngineButtonWorkspace_w");
    this.runButton2.addClass("entryRunButtonWorkspace_w2");
    this.view_.appendChild(this.runButton2);
    this.runButton2.bindOnClick(function(a) {
      a.preventDefault();
      Entry.engine.toggleRun();
    });
    this.stopButton = Entry.createElement("button");
    this.stopButton.addClass("entryEngineButtonWorkspace_w");
    this.stopButton.addClass("entryStopButtonWorkspace_w");
    this.stopButton.addClass("entryRemove");
    this.stopButton.innerHTML = Lang.Workspace.stop;
    this.view_.appendChild(this.stopButton);
    this.stopButton.bindOnClick(function(a) {
      a.preventDefault();
      Entry.engine.toggleStop();
    });
    this.stopButton2 = Entry.createElement("button");
    this.stopButton2.addClass("entryEngineButtonWorkspace_w");
    this.stopButton2.addClass("entryStopButtonWorkspace_w2");
    this.stopButton2.addClass("entryRemove");
    this.stopButton2.innerHTML = Lang.Workspace.stop;
    this.view_.appendChild(this.stopButton2);
    this.stopButton2.bindOnClick(function(a) {
      a.preventDefault();
      Entry.engine.toggleStop();
    });
    this.pauseButton = Entry.createElement("button");
    this.pauseButton.addClass("entryEngineButtonWorkspace_w");
    this.pauseButton.addClass("entryPauseButtonWorkspace_w");
    this.pauseButton.addClass("entryRemove");
    this.view_.appendChild(this.pauseButton);
    this.pauseButton.bindOnClick(function(a) {
      a.preventDefault();
      Entry.engine.togglePause();
    });
    this.mouseView = Entry.createElement("div");
    this.mouseView.addClass("entryMouseViewWorkspace_w");
    this.mouseView.addClass("entryRemove");
    this.view_.appendChild(this.mouseView);
  }
};
Entry.Engine.prototype.toggleSpeedPanel = function() {
  if (this.speedPanelOn) {
    this.speedPanelOn = !1, $(Entry.stage.canvas.canvas).animate({top:"24px"}), this.coordinateButton.removeClass("entryRemove"), this.maximizeButton.removeClass("entryRemove"), this.mouseView.removeClass("entryRemoveElement"), $(this.speedLabel_).remove(), delete this.speedLabel_, $(this.speedProgress_).fadeOut(null, function(a) {
      $(this).remove();
      delete this.speedProgress_;
    }), $(this.speedHandle_).remove(), delete this.speedHandle_;
  } else {
    this.speedPanelOn = !0;
    $(Entry.stage.canvas.canvas).animate({top:"41px"});
    this.coordinateButton.addClass("entryRemove");
    this.maximizeButton.addClass("entryRemove");
    this.mouseView.addClass("entryRemoveElement");
    this.speedLabel_ = Entry.createElement("div", "entrySpeedLabelWorkspace");
    this.speedLabel_.innerHTML = Lang.Workspace.speed;
    this.view_.insertBefore(this.speedLabel_, this.maximizeButton);
    this.speedProgress_ = Entry.createElement("table", "entrySpeedProgressWorkspace");
    for (var b = Entry.createElement("tr"), a = this.speeds, c = 0;5 > c;c++) {
      (function(c) {
        var e = Entry.createElement("td", "progressCell" + c);
        e.bindOnClick(function() {
          Entry.engine.setSpeedMeter(a[c]);
        });
        b.appendChild(e);
      })(c);
    }
    this.view_.insertBefore(this.speedProgress_, this.maximizeButton);
    this.speedProgress_.appendChild(b);
    this.speedHandle_ = Entry.createElement("div", "entrySpeedHandleWorkspace");
    c = (Entry.interfaceState.canvasWidth - 84) / 5;
    $(this.speedHandle_).draggable({axis:"x", grid:[c, c], containment:[80, 0, 4 * c + 80, 0], drag:function(a, b) {
      var c = (b.position.left - 80) / (Entry.interfaceState.canvasWidth - 84) * 5, c = Math.floor(c);
      0 > c || Entry.engine.setSpeedMeter(Entry.engine.speeds[c]);
    }});
    this.view_.insertBefore(this.speedHandle_, this.maximizeButton);
    this.setSpeedMeter(Entry.FPS);
  }
};
Entry.Engine.prototype.setSpeedMeter = function(b) {
  var a = this.speeds.indexOf(b);
  0 > a || (a = Math.min(4, a), a = Math.max(0, a), this.speedPanelOn && (this.speedHandle_.style.left = (Entry.interfaceState.canvasWidth - 80) / 10 * (2 * a + 1) + 80 - 9 + "px"), Entry.FPS != b && (clearInterval(this.ticker), this.ticker = setInterval(this.update, Math.floor(1E3 / b)), Entry.FPS = b));
};
Entry.Engine.prototype.start = function(b) {
  createjs.Ticker.setFPS(Entry.FPS);
  this.ticker = setInterval(this.update, Math.floor(1E3 / Entry.FPS));
};
Entry.Engine.prototype.stop = function() {
  clearInterval(this.ticker);
  this.ticker = null;
};
Entry.Engine.prototype.update = function() {
  Entry.engine.isState("run") && (Entry.engine.computeObjects(), Entry.hw.update());
};
Entry.Engine.prototype.computeObjects = function() {
  Entry.container.mapEntityIncludeCloneOnScene(this.computeFunction);
};
Entry.Engine.prototype.computeFunction = function(b) {
  b = b.runningScript;
  for (var a = 0;a < b.length;a++) {
    for (var c = b.shift(), d = !0, e = !1;c && d && !e;) {
      try {
        var d = !c.isLooped, f = c.run(), e = f && f === c, c = f;
      } catch (g) {
        throw Entry.engine.toggleStop(), Entry.engine.isUpdating = !1, "workspace" == Entry.type && (Entry.container.selectObject(), Entry.container.selectObject(c.entity.parent.id, !0), Entry.playground.changeViewMode("code"), Blockly.mainWorkspace.activatePreviousBlock(c.id)), Entry.toast.alert(Lang.Msgs.runtime_error, Lang.Workspace.check_runtime_error, !0), g;
      }
    }
    c && b.push(c);
  }
};
Entry.Engine.computeThread = function(b, a) {
  Entry.engine.isContinue = !0;
  for (var c = !1;a && Entry.engine.isContinue && !c;) {
    Entry.engine.isContinue = !a.isRepeat;
    var d = a.run(), c = d && d === a;
    a = d;
  }
  return a;
};
Entry.Engine.prototype.isState = function(b) {
  return -1 < this.state.indexOf(b);
};
Entry.Engine.prototype.run = function() {
  this.isState("run") ? this.toggleStop() : (this.isState("stop") || this.isState("pause")) && this.toggleRun();
};
Entry.Engine.prototype.toggleRun = function() {
  Entry.addActivity("run");
  "stop" == this.state && (Entry.playground.syncObject(), Entry.container.mapEntity(function(b) {
    b.takeSnapshot();
  }), Entry.variableContainer.mapVariable(function(b) {
    b.takeSnapshot();
  }), Entry.variableContainer.mapList(function(b) {
    b.takeSnapshot();
  }), Entry.container.takeSequenceSnapshot(), Entry.scene.takeStartSceneSnapshot(), this.state = "run", this.fireEvent("when_run_button_click"));
  this.state = "run";
  "mobile" == Entry.type && this.view_.addClass("entryEngineBlueWorkspace");
  this.pauseButton.innerHTML = Lang.Workspace.pause;
  this.runButton.addClass("run");
  this.runButton.addClass("entryRemove");
  this.stopButton.removeClass("entryRemove");
  this.pauseButton && this.pauseButton.removeClass("entryRemove");
  this.runButton2 && this.runButton2.addClass("entryRemove");
  this.stopButton2 && this.stopButton2.removeClass("entryRemove");
  this.isUpdating || (Entry.engine.update(), Entry.engine.isUpdating = !0);
  Entry.stage.selectObject();
  Entry.dispatchEvent("run");
};
Entry.Engine.prototype.toggleStop = function() {
  Entry.addActivity("stop");
  var b = Entry.container, a = Entry.variableContainer;
  b.mapEntity(function(a) {
    a.loadSnapshot();
    a.object.filters = [];
    a.resetFilter();
    a.dialog && a.dialog.remove();
    a.brush && a.removeBrush();
  });
  a.mapVariable(function(a) {
    a.loadSnapshot();
  });
  a.mapList(function(a) {
    a.loadSnapshot();
    a.updateView();
  });
  this.stopProjectTimer();
  b.clearRunningState();
  b.loadSequenceSnapshot();
  b.setInputValue();
  Entry.scene.loadStartSceneSnapshot();
  Entry.Func.clearThreads();
  createjs.Sound.setVolume(1);
  createjs.Sound.stop();
  this.view_.removeClass("entryEngineBlueWorkspace");
  this.runButton.removeClass("entryRemove");
  this.stopButton.addClass("entryRemove");
  this.pauseButton && this.pauseButton.addClass("entryRemove");
  this.runButton2 && this.runButton2.removeClass("entryRemove");
  this.stopButton2 && this.stopButton2.addClass("entryRemove");
  this.state = "stop";
  Entry.dispatchEvent("stop");
  Entry.stage.hideInputField();
};
Entry.Engine.prototype.togglePause = function() {
  "pause" == this.state ? (this.state = "run", this.pauseButton.innerHTML = Lang.Workspace.pause) : (this.state = "pause", this.pauseButton.innerHTML = Lang.Workspace.restart, this.runButton.removeClass("entryRemove"), this.stopButton.removeClass("entryRemove"));
};
Entry.Engine.prototype.fireEvent = function(b) {
  "run" == this.state && Entry.container.mapEntityIncludeCloneOnScene(this.raiseEvent, b);
};
Entry.Engine.prototype.raiseEvent = function(b, a) {
  for (var c = b.parent.script.childNodes, d = 0;d < c.length;d++) {
    var e = c[d];
    if (Entry.Xml.isTypeOf(a, e)) {
      var f = new Entry.Script(b);
      f.init(e);
      b.runningScript.push(f);
    }
  }
};
Entry.Engine.prototype.fireEventOnEntity = function(b, a) {
  "run" == this.state && Entry.container.mapEntityIncludeCloneOnScene(this.raiseEventOnEntity, [a, b]);
};
Entry.Engine.prototype.raiseEventOnEntity = function(b, a) {
  if (b === a[0]) {
    for (var c = a[1], d = b.parent.script.childNodes, e = 0;e < d.length;e++) {
      var f = d[e];
      if (Entry.Xml.isTypeOf(c, f)) {
        var g = new Entry.Script(b);
        g.init(f);
        b.runningScript.push(g);
      }
    }
  }
};
Entry.Engine.prototype.captureKeyEvent = function(b) {
  var a = b.keyCode, c = Entry.type;
  0 > Entry.engine.pressedKeys.indexOf(a) && Entry.engine.pressedKeys.push(a);
  b.ctrlKey && "workspace" == c ? 83 == a ? (b.preventDefault(), Entry.dispatchEvent("saveWorkspace")) : 82 == a ? (b.preventDefault(), Entry.engine.run()) : 90 == a ? (b.preventDefault(), Entry.dispatchEvent(b.shiftKey ? "redo" : "undo")) : 48 < a && 58 > a && (b.preventDefault(), Entry.playground.selectMenu(a - 49)) : Entry.engine.isState("run") && (Entry.container.mapEntityIncludeCloneOnScene(Entry.engine.raiseKeyEvent, ["press_some_key", a]), Entry.container.mapEntityIncludeCloneOnScene(Entry.engine.raiseKeyEvent, 
  ["when_some_key_pressed", a]));
  Entry.engine.isState("stop") && "workspace" === c && 37 <= a && 40 >= a && Entry.stage.moveSprite(b);
};
Entry.Engine.prototype.captureKeyUpEvent = function(b) {
  b = b.keyCode;
  0 <= Entry.engine.pressedKeys.indexOf(b) && Entry.engine.pressedKeys.splice(Entry.engine.pressedKeys.indexOf(b), 1);
};
Entry.Engine.prototype.raiseKeyEvent = function(b, a) {
  for (var c = a[0], d = a[1], e = b.parent.script.childNodes, f = 0;f < e.length;f++) {
    var g = e[f], h = Entry.Xml.getField("VALUE", g);
    Entry.Xml.isTypeOf(c, g) && h == d && (h = new Entry.Script(b), h.init(g), b.runningScript.push(h));
  }
};
Entry.Engine.prototype.updateMouseView = function() {
  var b = Entry.stage.mouseCoordinate;
  this.mouseView.innerHTML = "X : " + b.x + ", Y : " + b.y;
  this.mouseView.removeClass("entryRemove");
};
Entry.Engine.prototype.hideMouseView = function() {
  this.mouseView.addClass("entryRemove");
};
Entry.Engine.prototype.toggleFullscreen = function() {
  if (this.popup) {
    this.popup.remove(), this.popup = null;
  } else {
    this.popup = new Entry.Popup;
    if ("workspace" != Entry.type) {
      var b = $(document);
      $(this.popup.body_).css("top", b.scrollTop());
      $("body").css("overflow", "hidden");
      popup.window_.appendChild(Entry.stage.canvas.canvas);
    }
    popup.window_.appendChild(Entry.engine.view_);
  }
};
Entry.Engine.prototype.exitFullScreen = function() {
  document.webkitIsFullScreen || document.mozIsFullScreen || document.isFullScreen || (Entry.engine.footerView_.removeClass("entryRemove"), Entry.engine.headerView_.removeClass("entryRemove"));
};
Entry.Engine.prototype.showProjectTimer = function() {
  Entry.engine.projectTimer && this.projectTimer.setVisible(!0);
};
Entry.Engine.prototype.hideProjectTimer = function(b) {
  var a = this.projectTimer;
  if (a && a.isVisible() && !this.isState("run")) {
    for (var c = Entry.container.getAllObjects(), d = ["get_project_timer_value", "reset_project_timer", "set_visible_project_timer"], e = 0, f = c.length;e < f;e++) {
      for (var g = c[e].script.getElementsByTagName("block"), h = 0, k = g.length;h < k;h++) {
        if (-1 < d.indexOf(g[h].getAttribute("type")) && g[h].getAttribute("id") != b.getAttribute("id")) {
          return;
        }
      }
    }
    a.setVisible(!1);
  }
};
Entry.Engine.prototype.clearTimer = function() {
  clearInterval(this.ticker);
  clearInterval(this.projectTimer.tick);
};
Entry.Engine.prototype.startProjectTimer = function() {
  var b = this.projectTimer;
  b && (b.start = (new Date).getTime(), b.isInit = !0, b.pausedTime = 0, b.tick = setInterval(function(a) {
    Entry.engine.updateProjectTimer();
  }, 1E3 / 60));
};
Entry.Engine.prototype.stopProjectTimer = function() {
  var b = this.projectTimer;
  b && (this.updateProjectTimer(0), b.isPaused = !1, b.isInit = !1, b.pausedTime = 0, clearInterval(b.tick));
};
Entry.Engine.prototype.updateProjectTimer = function(b) {
  var a = Entry.engine.projectTimer, c = (new Date).getTime();
  a && ("undefined" == typeof b ? a.isPaused || a.setValue((c - a.start - a.pausedTime) / 1E3) : (a.setValue(b), a.pausedTime = 0, a.start = c));
};
Entry.EntityObject = function(b) {
  this.parent = b;
  this.type = b.objectType;
  this.runningScript = [];
  this.flip = !1;
  this.collision = Entry.Utils.COLLISION.NONE;
  this.id = Entry.generateHash();
  "sprite" == this.type ? (this.object = new createjs.Bitmap, this.effect = {}, this.setInitialEffectValue()) : "textBox" == this.type && (this.object = new createjs.Container, this.textObject = new createjs.Text, this.textObject.font = "20px Nanum Gothic", this.textObject.textBaseline = "middle", this.textObject.textAlign = "center", this.bgObject = new createjs.Shape, this.bgObject.graphics.setStrokeStyle(1).beginStroke("#f00").drawRect(0, 0, 100, 100), this.object.addChild(this.bgObject), this.object.addChild(this.textObject), 
  this.fontType = "Nanum Gothic", this.fontSize = 20, this.strike = this.underLine = this.fontItalic = this.fontBold = !1);
  this.object.entity = this;
  this.object.cursor = "pointer";
  this.object.on("mousedown", function(a) {
    var b = this.entity.parent.id;
    Entry.dispatchEvent("entityClick", this.entity);
    Entry.stage.isObjectClick = !0;
    "minimize" != Entry.type && Entry.engine.isState("stop") && (this.offset = {x:-this.parent.x + this.entity.getX() - (.75 * a.stageX - 240), y:-this.parent.y - this.entity.getY() - (.75 * a.stageY - 135)}, this.cursor = "move", this.entity.initCommand(), Entry.container.selectObject(b));
  });
  this.object.on("pressup", function(a) {
    Entry.dispatchEvent("entityClickCanceled", this.entity);
    this.cursor = "pointer";
    this.entity.checkCommand();
  });
  this.object.on("pressmove", function(a) {
    "minimize" != Entry.type && Entry.engine.isState("stop") && !this.entity.parent.getLock() && (this.entity.doCommand(), this.entity.setX(.75 * a.stageX - 240 + this.offset.x), this.entity.setY(-(.75 * a.stageY - 135) - this.offset.y), Entry.stage.updateObject());
  });
};
Entry.EntityObject.prototype.injectModel = function(b, a) {
  if ("sprite" == this.type) {
    this.setImage(b);
  } else {
    if ("textBox" == this.type) {
      var c = this.parent;
      a.text = a.text || c.text || c.name;
      this.setFont(a.font);
      this.setBGColour(a.bgColor);
      this.setColour(a.colour);
      this.setUnderLine(a.underLine);
      this.setStrike(a.strike);
      this.setText(a.text);
    }
  }
  a && this.syncModel_(a);
};
Entry.EntityObject.prototype.syncModel_ = function(b) {
  this.setX(b.x);
  this.setY(b.y);
  this.setRegX(b.regX);
  this.setRegY(b.regY);
  this.setScaleX(b.scaleX);
  this.setScaleY(b.scaleY);
  this.setRotation(b.rotation);
  this.setDirection(b.direction, !0);
  this.setLineBreak(b.lineBreak);
  this.setWidth(b.width);
  this.setHeight(b.height);
  this.setText(b.text);
  this.setTextAlign(b.textAlign);
  this.setFontSize(b.fontSize || this.getFontSize());
  this.setVisible(b.visible);
};
Entry.EntityObject.prototype.initCommand = function() {
  Entry.engine.isState("stop") && (this.isCommandValid = !1, Entry.stateManager && Entry.stateManager.addCommand("edit entity", this, this.restoreEntity, this.toJSON()));
};
Entry.EntityObject.prototype.doCommand = function() {
  this.isCommandValid = !0;
};
Entry.EntityObject.prototype.checkCommand = function() {
  Entry.engine.isState("stop") && !this.isCommandValid && Entry.dispatchEvent("cancelLastCommand");
};
Entry.EntityObject.prototype.restoreEntity = function(b) {
  var a = this.toJSON();
  this.syncModel_(b);
  Entry.dispatchEvent("updateObject");
  Entry.stateManager && Entry.stateManager.addCommand("restore object", this, this.restoreEntity, a);
};
Entry.EntityObject.prototype.clearScript = function(b) {
  for (;this.runningScript.length;) {
    this.runningScript.pop();
  }
};
Entry.EntityObject.prototype.setX = function(b) {
  "number" == typeof b && (this.x = b, this.object.x = this.x, this.isClone || this.parent.updateCoordinateView(), this.updateDialog());
};
Entry.EntityObject.prototype.getX = function() {
  return this.x;
};
Entry.EntityObject.prototype.setY = function(b) {
  "number" == typeof b && (this.y = b, this.object.y = -this.y, this.isClone || this.parent.updateCoordinateView(), this.updateDialog());
};
Entry.EntityObject.prototype.getY = function() {
  return this.y;
};
Entry.EntityObject.prototype.getDirection = function() {
  return this.direction;
};
Entry.EntityObject.prototype.setDirection = function(b, a) {
  b || (b = 0);
  "vertical" != this.parent.getRotateMethod() || a || (0 <= this.direction && 180 > this.direction) == (0 <= b && 180 > b) || (this.setScaleX(-this.getScaleX()), Entry.stage.updateObject(), this.flip = !this.flip);
  this.direction = b.mod(360);
  this.object.direction = this.direction;
  this.isClone || this.parent.updateRotationView();
  Entry.dispatchEvent("updateObject");
};
Entry.EntityObject.prototype.setRotation = function(b) {
  "free" != this.parent.getRotateMethod() && (b = 0);
  this.rotation = b.mod(360);
  this.object.rotation = this.rotation;
  this.updateDialog();
  this.isClone || this.parent.updateRotationView();
  Entry.dispatchEvent("updateObject");
};
Entry.EntityObject.prototype.getRotation = function() {
  return this.rotation;
};
Entry.EntityObject.prototype.setRegX = function(b) {
  "textBox" == this.type && (b = 0);
  this.regX = b;
  this.object.regX = this.regX;
};
Entry.EntityObject.prototype.getRegX = function() {
  return this.regX;
};
Entry.EntityObject.prototype.setRegY = function(b) {
  "textBox" == this.type && (b = 0);
  this.regY = b;
  this.object.regY = this.regY;
};
Entry.EntityObject.prototype.getRegY = function() {
  return this.regY;
};
Entry.EntityObject.prototype.setScaleX = function(b) {
  this.scaleX = b;
  this.object.scaleX = this.scaleX;
  this.parent.updateCoordinateView();
  this.updateDialog();
};
Entry.EntityObject.prototype.getScaleX = function() {
  return this.scaleX;
};
Entry.EntityObject.prototype.setScaleY = function(b) {
  this.scaleY = b;
  this.object.scaleY = this.scaleY;
  this.parent.updateCoordinateView();
  this.updateDialog();
};
Entry.EntityObject.prototype.getScaleY = function() {
  return this.scaleY;
};
Entry.EntityObject.prototype.setSize = function(b) {
  1 > b && (b = 1);
  b /= this.getSize();
  this.setScaleX(this.getScaleX() * b);
  this.setScaleY(this.getScaleY() * b);
  this.isClone || this.parent.updateCoordinateView();
};
Entry.EntityObject.prototype.getSize = function() {
  return (this.getWidth() * Math.abs(this.getScaleX()) + this.getHeight() * Math.abs(this.getScaleY())) / 2;
};
Entry.EntityObject.prototype.setWidth = function(b) {
  this.width = b;
  this.object.width = this.width;
  this.textObject && this.getLineBreak() && (this.textObject.lineWidth = this.width);
  this.updateDialog();
  this.updateBG();
};
Entry.EntityObject.prototype.getWidth = function() {
  return this.width;
};
Entry.EntityObject.prototype.setHeight = function(b) {
  this.height = b;
  this.textObject && (this.object.height = this.height, this.alignTextBox());
  this.updateDialog();
  this.updateBG();
};
Entry.EntityObject.prototype.getHeight = function() {
  return this.height;
};
Entry.EntityObject.prototype.setColour = function(b) {
  b || (b = "#000000");
  this.colour = b;
  this.textObject && (this.textObject.color = this.colour);
};
Entry.EntityObject.prototype.getColour = function() {
  return this.colour;
};
Entry.EntityObject.prototype.setBGColour = function(b) {
  b || (b = "transparent");
  this.bgColor = b;
  this.updateBG();
};
Entry.EntityObject.prototype.getBGColour = function() {
  return this.bgColor;
};
Entry.EntityObject.prototype.setUnderLine = function(b) {
  void 0 === b && (b = !1);
  this.underLine = b;
  this.textObject.underLine = b;
};
Entry.EntityObject.prototype.getUnderLine = function() {
  return this.underLine;
};
Entry.EntityObject.prototype.setStrike = function(b) {
  void 0 === b && (b = !1);
  this.strike = b;
  this.textObject.strike = b;
};
Entry.EntityObject.prototype.getStrike = function() {
  return this.strike;
};
Entry.EntityObject.prototype.getFont = function() {
  var b = [];
  this.fontBold && b.push("bold");
  this.fontItalic && b.push("italic");
  b.push(this.getFontSize() + "px");
  b.push(this.fontType);
  return b.join(" ");
};
Entry.EntityObject.prototype.setFont = function(b) {
  if ("textBox" == this.parent.objectType && this.font !== b) {
    b || (b = "20px Nanum Gothic");
    var a = b.split(" "), c = 0;
    if (c = -1 < a.indexOf("bold")) {
      a.splice(c - 1, 1), this.setFontBold(!0);
    }
    if (c = -1 < a.indexOf("italic")) {
      a.splice(c - 1, 1), this.setFontItalic(!0);
    }
    c = parseInt(a.shift());
    this.setFontSize(c);
    this.setFontType(a.join(" "));
    this.font = this.getFont();
    this.textObject.font = b;
    Entry.stage.update();
    this.setWidth(this.textObject.getMeasuredWidth());
    this.updateBG();
    Entry.stage.updateObject();
  }
};
Entry.EntityObject.prototype.syncFont = function() {
  this.textObject.font = this.getFont();
  Entry.stage.update();
  this.getLineBreak() || this.setWidth(this.textObject.getMeasuredWidth());
  Entry.stage.updateObject();
};
Entry.EntityObject.prototype.getFontType = function() {
  return this.fontType;
};
Entry.EntityObject.prototype.setFontType = function(b) {
  "textBox" == this.parent.objectType && (this.fontType = b ? b : "Nanum Gothic", this.syncFont());
};
Entry.EntityObject.prototype.getFontSize = function(b) {
  return this.fontSize;
};
Entry.EntityObject.prototype.setFontSize = function(b) {
  "textBox" == this.parent.objectType && this.fontSize != b && (this.fontSize = b ? b : 20, this.syncFont(), this.alignTextBox());
};
Entry.EntityObject.prototype.setFontBold = function(b) {
  this.fontBold = b;
};
Entry.EntityObject.prototype.toggleFontBold = function() {
  this.fontBold = !this.fontBold;
  this.syncFont();
  return this.fontBold;
};
Entry.EntityObject.prototype.setFontItalic = function(b) {
  this.fontItalic = b;
};
Entry.EntityObject.prototype.toggleFontItalic = function() {
  this.fontItalic = !this.fontItalic;
  this.syncFont();
  return this.fontItalic;
};
Entry.EntityObject.prototype.setFontName = function(b) {
  for (var a = this.font.split(" "), c = [], d = 0, e = a.length;d < e;d++) {
    ("bold" === a[d] || "italic" === a[d] || -1 < a[d].indexOf("px")) && c.push(a[d]);
  }
  this.setFont(c.join(" ") + " " + b);
};
Entry.EntityObject.prototype.getFontName = function() {
  if ("textBox" == this.type) {
    if (!this.font) {
      return "";
    }
    for (var b = this.font.split(" "), a = [], c = 0, d = b.length;c < d;c++) {
      "bold" !== b[c] && "italic" !== b[c] && -1 === b[c].indexOf("px") && a.push(b[c]);
    }
    return a.join(" ").trim();
  }
};
Entry.EntityObject.prototype.setText = function(b) {
  "textBox" == this.parent.objectType && (void 0 === b && (b = ""), this.text = b, this.textObject.text = this.text, this.lineBreak || (this.setWidth(this.textObject.getMeasuredWidth()), this.parent.updateCoordinateView()), this.updateBG(), Entry.stage.updateObject());
};
Entry.EntityObject.prototype.getText = function() {
  return this.text;
};
Entry.EntityObject.prototype.setTextAlign = function(b) {
  "textBox" == this.parent.objectType && (void 0 === b && (b = Entry.TEXT_ALIGN_CENTER), this.textAlign = b, this.textObject.textAlign = Entry.TEXT_ALIGNS[this.textAlign], this.alignTextBox(), this.updateBG(), Entry.stage.updateObject());
};
Entry.EntityObject.prototype.getTextAlign = function() {
  return this.textAlign;
};
Entry.EntityObject.prototype.setLineBreak = function(b) {
  if ("textBox" == this.parent.objectType) {
    void 0 === b && (b = !1);
    var a = this.lineBreak;
    this.lineBreak = b;
    a && !this.lineBreak ? (this.textObject.lineWidth = null, this.setHeight(this.textObject.getMeasuredLineHeight()), this.setText(this.getText().replace(/\n/g, ""))) : !a && this.lineBreak && (this.setFontSize(this.getFontSize() * this.getScaleX()), this.setHeight(3 * this.textObject.getMeasuredLineHeight()), this.setWidth(this.getWidth() * this.getScaleX()), this.setScaleX(1), this.setScaleY(1), this.textObject.lineWidth = this.getWidth(), this.alignTextBox());
    Entry.stage.updateObject();
  }
};
Entry.EntityObject.prototype.getLineBreak = function() {
  return this.lineBreak;
};
Entry.EntityObject.prototype.setVisible = function(b) {
  void 0 === b && (b = !0);
  this.visible = b;
  this.object.visible = this.visible;
  this.dialog && this.syncDialogVisible();
  return this.visible;
};
Entry.EntityObject.prototype.getVisible = function() {
  return this.visible;
};
Entry.EntityObject.prototype.setImage = function(b) {
  delete b._id;
  Entry.assert("sprite" == this.type, "Set image is only for sprite object");
  b.id || (b.id = Entry.generateHash());
  this.picture = b;
  var a = this.picture.dimension, c = this.getRegX() - this.getWidth() / 2, d = this.getRegY() - this.getHeight() / 2;
  this.setWidth(a.width);
  this.setHeight(a.height);
  a.scaleX || (a.scaleX = this.getScaleX(), a.scaleY = this.getScaleY());
  this.setScaleX(this.scaleX);
  this.setScaleY(this.scaleY);
  this.setRegX(this.width / 2 + c);
  this.setRegY(this.height / 2 + d);
  var e = Entry.container.getCachedPicture(b.id);
  if (e) {
    Entry.image = e, this.object.image = e, this.object.cache(0, 0, this.getWidth(), this.getHeight());
  } else {
    e = new Image;
    b.fileurl ? e.src = b.fileurl : (a = b.filename, e.src = Entry.defaultPath + "/uploads/" + a.substring(0, 2) + "/" + a.substring(2, 4) + "/image/" + a + ".png");
    var f = this;
    e.onload = function(a) {
      Entry.container.cachePicture(b.id, e);
      Entry.image = e;
      f.object.image = e;
      f.object.cache(0, 0, f.getWidth(), f.getHeight());
      f = null;
    };
  }
  Entry.dispatchEvent("updateObject");
};
Entry.EntityObject.prototype.applyFilter = function() {
  var b = this.object, a = this.effect, c = [], d = Entry.adjustValueWithMaxMin;
  a.brightness = a.brightness;
  var e = new createjs.ColorMatrix;
  e.adjustColor(d(a.brightness, -100, 100), 0, 0, 0);
  e = new createjs.ColorMatrixFilter(e);
  c.push(e);
  a.hue = a.hue.mod(360);
  e = new createjs.ColorMatrix;
  e.adjustColor(0, 0, 0, a.hue);
  e = new createjs.ColorMatrixFilter(e);
  c.push(e);
  var e = [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1], f = 10.8 * a.hsv * Math.PI / 180, g = Math.cos(f), f = Math.sin(f), h = Math.abs(a.hsv / 100);
  1 < h && (h -= Math.floor(h));
  0 < h && .33 >= h ? e = [1, 0, 0, 0, 0, 0, g, f, 0, 0, 0, -1 * f, g, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1] : .66 >= h ? e = [g, 0, f, 0, 0, 0, 1, 0, 0, 0, f, 0, g, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1] : .99 >= h && (e = [g, f, 0, 0, 0, -1 * f, g, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1]);
  e = (new createjs.ColorMatrix).concat(e);
  e = new createjs.ColorMatrixFilter(e);
  c.push(e);
  b.alpha = a.alpha = d(a.alpha, 0, 1);
  b.filters = c;
  b.cache(0, 0, this.getWidth(), this.getHeight());
};
Entry.EntityObject.prototype.resetFilter = function() {
  "sprite" == this.parent.objectType && (this.object.filters = [], this.setInitialEffectValue(), this.object.alpha = this.effect.alpha, this.object.cache(0, 0, this.getWidth(), this.getHeight()));
};
Entry.EntityObject.prototype.updateDialog = function() {
  this.dialog && this.dialog.update();
};
Entry.EntityObject.prototype.takeSnapshot = function() {
  this.snapshot_ = this.toJSON();
  this.collision = Entry.Utils.COLLISION.NONE;
};
Entry.EntityObject.prototype.loadSnapshot = function() {
  this.snapshot_ && this.syncModel_(this.snapshot_);
  "sprite" == this.parent.objectType && this.setImage(this.parent.getPicture());
};
Entry.EntityObject.prototype.removeClone = function() {
  if (this.isClone) {
    this.dialog && this.dialog.remove();
    this.brush && this.removeBrush();
    Entry.stage.unloadEntity(this);
    var b = this.parent.clonedEntities.indexOf(this);
    this.parent.clonedEntities.splice(b, 1);
  }
};
Entry.EntityObject.prototype.toJSON = function() {
  var b = {};
  b.x = Entry.cutDecimal(this.getX());
  b.y = Entry.cutDecimal(this.getY());
  b.regX = Entry.cutDecimal(this.getRegX());
  b.regY = Entry.cutDecimal(this.getRegY());
  b.scaleX = this.getScaleX();
  b.scaleY = this.getScaleY();
  b.rotation = Entry.cutDecimal(this.getRotation());
  b.direction = Entry.cutDecimal(this.getDirection());
  b.width = Entry.cutDecimal(this.getWidth());
  b.height = Entry.cutDecimal(this.getHeight());
  b.font = this.getFont();
  b.visible = this.getVisible();
  "textBox" == this.parent.objectType && (b.colour = this.getColour(), b.text = this.getText(), b.textAlign = this.getTextAlign(), b.lineBreak = this.getLineBreak(), b.bgColor = this.getBGColour(), b.underLine = this.getUnderLine(), b.strike = this.getStrike(), b.fontSize = this.getFontSize());
  return b;
};
Entry.EntityObject.prototype.setInitialEffectValue = function() {
  this.effect = {blur:0, hue:0, hsv:0, brightness:0, contrast:0, saturation:0, alpha:1};
};
Entry.EntityObject.prototype.removeBrush = function() {
  Entry.stage.selectedObjectContainer.removeChild(this.shape);
  this.shape = this.brush = null;
};
Entry.EntityObject.prototype.updateBG = function() {
  if (this.bgObject) {
    this.bgObject.graphics.clear();
    var b = this.getWidth(), a = this.getHeight();
    this.bgObject.graphics.setStrokeStyle(1).beginStroke().beginFill(this.getBGColour()).drawRect(-b / 2, -a / 2, b, a);
    if (this.getLineBreak()) {
      this.bgObject.x = 0;
    } else {
      switch(this.getTextAlign()) {
        case Entry.TEXT_ALIGN_LEFT:
          this.bgObject.x = b / 2;
          break;
        case Entry.TEXT_ALIGN_CENTER:
          this.bgObject.x = 0;
          break;
        case Entry.TEXT_ALIGN_RIGHT:
          this.bgObject.x = -b / 2;
      }
    }
  }
};
Entry.EntityObject.prototype.alignTextBox = function() {
  if ("textBox" == this.type) {
    var b = this.textObject;
    if (this.lineBreak) {
      var a = b.getMeasuredLineHeight();
      b.y = a / 2 - this.getHeight() / 2;
      switch(this.textAlign) {
        case Entry.TEXT_ALIGN_CENTER:
          b.x = 0;
          break;
        case Entry.TEXT_ALIGN_LEFT:
          b.x = -this.getWidth() / 2;
          break;
        case Entry.TEXT_ALIGN_RIGHT:
          b.x = this.getWidth() / 2;
      }
      b.maxHeight = this.getHeight();
    } else {
      b.x = 0, b.y = 0;
    }
  }
};
Entry.EntityObject.prototype.syncDialogVisible = function() {
  this.dialog && (this.dialog.object.visible = this.visible);
};
Entry.Helper = function() {
  this.generateView();
};
p = Entry.Helper.prototype;
p.generateView = function() {
  this.blockHelpData = EntryStatic.blockInfo;
  var b = Entry.createElement("div", "entryBlockHelperWorkspace");
  this._view = b;
  Entry.isForLecture && b.addClass("lecture");
  var a = Entry.createElement("div", "entryBlockHelperHeaderWorkspace");
  a.innerHTML = Lang.Helper.Block_info;
  b.appendChild(a);
  a = Entry.createElement("div", "entryBlockHelperContentWorkspace");
  a.addClass("entryBlockHelperIntro");
  Entry.isForLecture && a.addClass("lecture");
  b.appendChild(a);
  this.blockHelperContent_ = a;
  this.blockHelperView_ = b;
  b = Entry.createElement("div", "entryBlockHelperBlockWorkspace");
  this.blockMenu_ = new Blockly.BlockMenu(b);
  this.blockMenu_.isViewOnly = !0;
  this.blockMenu_.isCenterAlign = !0;
  this.blockHelperContent_.appendChild(b);
  b = Entry.createElement("div", "entryBlockHelperDescriptionWorkspace");
  this.blockHelperContent_.appendChild(b);
  b.innerHTML = Lang.Helper.Block_click_msg;
  this.blockHelperDescription_ = b;
  this.first = !0;
};
p.getView = function() {
  this.bindEvent();
  return this._view;
};
p.bindEvent = function() {
  this.blockChangeEvent || (this.blockChangeEvent = Blockly.bindEvent_(Blockly.mainWorkspace.getCanvas(), "blocklySelectChange", this, this.updateSelectedBlock), Entry.playground.blockMenu && (this.menuBlockChangeEvent = Blockly.bindEvent_(Entry.playground.blockMenu.workspace_.getCanvas(), "blocklySelectChange", this, this.updateSelectedBlock)));
};
p.updateSelectedBlock = function() {
  Blockly.selected && (this.first && (this.blockHelperContent_.removeClass("entryBlockHelperIntro"), this.first = !1), this.renderBlock(Blockly.selected.type));
};
p.renderBlock = function(b) {
  var a = this.blockHelpData[b];
  a && (a = jQuery.parseXML(a.xml), a = this.blockMenu_.show(a.childNodes), this.blockHelperDescription_.innerHTML = Entry.makeAutolink(Lang.Helper[b]), $(this.blockHelperDescription_).css({top:a + 40}));
};
Entry.Activity = function(b, a) {
  this.name = b;
  this.timestamp = new Date;
  var c = [];
  if (void 0 !== a) {
    for (var d = 0, e = a.length;d < e;d++) {
      var f = a[d];
      c.push({key:f[0], value:f[1]});
    }
  }
  this.data = c;
};
Entry.ActivityReporter = function() {
  this._activities = [];
};
(function(b) {
  b.add = function(a) {
    if (!(a instanceof Entry.Activity)) {
      return console.error("Activity must be an instanceof Entry.MazeActivity");
    }
    this._activities.push(a);
  };
  b.clear = function() {
    this._activities = [];
  };
  b.get = function() {
    return this._activities;
  };
})(Entry.ActivityReporter.prototype);
Entry.EntryObject = function(b) {
  if (b) {
    this.id = b.id;
    this.name = b.name || b.sprite.name;
    this.text = b.text || this.name;
    this.objectType = b.objectType;
    this.objectType || (this.objectType = "sprite");
    this.script = b.script ? Blockly.Xml.textToDom(b.script) : Blockly.Xml.textToDom("<xml></xml>");
    this.pictures = b.sprite.pictures;
    this.sounds = [];
    this.sounds = b.sprite.sounds;
    for (var a = 0;a < this.sounds.length;a++) {
      this.sounds[a].id || (this.sounds[a].id = Entry.generateHash()), Entry.initSound(this.sounds[a]);
    }
    this.lock = b.lock ? b.lock : !1;
    this.isEditing = !1;
    "sprite" == this.objectType && (this.selectedPicture = b.selectedPictureId ? this.getPicture(b.selectedPictureId) : this.pictures[0]);
    this.scene = Entry.scene.getSceneById(b.scene) || Entry.scene.selectedScene;
    this.setRotateMethod(b.rotateMethod);
    this.entity = new Entry.EntityObject(this);
    this.entity.injectModel(this.selectedPicture ? this.selectedPicture : null, b.entity ? b.entity : this.initEntity(b));
    this.clonedEntities = [];
    Entry.stage.loadObject(this);
    for (a in this.pictures) {
      var c = this.pictures[a];
      c.id || (c.id = Entry.generateHash());
      var d = new Image;
      c.fileurl ? d.src = c.fileurl : c.fileurl ? d.src = c.fileurl : (b = c.filename, d.src = Entry.defaultPath + "/uploads/" + b.substring(0, 2) + "/" + b.substring(2, 4) + "/image/" + b + ".png");
      d.onload = function(a) {
        Entry.container.cachePicture(c.id, d);
      };
    }
  }
};
Entry.EntryObject.prototype.generateView = function() {
  if ("workspace" == Entry.type) {
    var b = Entry.createElement("li", this.id);
    b.addClass("entryContainerListElementWorkspace");
    b.object = this;
    b.bindOnClick(function(a) {
      Entry.container.getObject(this.id) && Entry.container.selectObject(this.id);
    });
    Entry.Utils.disableContextmenu(b);
    var a = this;
    $(b).on("contextmenu", function(b) {
      Entry.ContextMenu.show([{text:Lang.Workspace.context_rename, callback:function(b) {
        b.stopPropagation();
        b = a;
        b.setLock(!1);
        b.editObjectValues(!0);
        b.nameView_.select();
      }}, {text:Lang.Workspace.context_duplicate, callback:function() {
        Entry.container.addCloneObject(a);
      }}, {text:Lang.Workspace.context_remove, callback:function() {
        Entry.container.removeObject(a);
      }}, {text:Lang.Workspace.copy_file, callback:function() {
        Entry.container.setCopiedObject(a);
      }}, {text:Lang.Blocks.Paste_blocks, callback:function() {
        Entry.container.copiedObject ? Entry.container.addCloneObject(Entry.container.copiedObject) : Entry.toast.alert(Lang.Workspace.add_object_alert, Lang.Workspace.object_not_found_for_paste);
      }}], "workspace-contextmenu");
    });
    this.view_ = b;
    var c = this, b = Entry.createElement("ul");
    b.addClass("objectInfoView");
    Entry.objectEditable || b.addClass("entryHide");
    var d = Entry.createElement("li");
    d.addClass("objectInfo_visible");
    this.entity.getVisible() || d.addClass("objectInfo_unvisible");
    d.bindOnClick(function(a) {
      Entry.engine.isState("run") || (a = c.entity, a.setVisible(!a.getVisible()) ? this.removeClass("objectInfo_unvisible") : this.addClass("objectInfo_unvisible"));
    });
    var e = Entry.createElement("li");
    e.addClass("objectInfo_unlock");
    this.getLock() && e.addClass("objectInfo_lock");
    e.bindOnClick(function(a) {
      Entry.engine.isState("run") || (a = c, a.setLock(!a.getLock()) ? this.addClass("objectInfo_lock") : this.removeClass("objectInfo_lock"), a.updateInputViews(a.getLock()));
    });
    b.appendChild(d);
    b.appendChild(e);
    this.view_.appendChild(b);
    b = Entry.createElement("div");
    b.addClass("entryObjectThumbnailWorkspace");
    this.view_.appendChild(b);
    this.thumbnailView_ = b;
    b = Entry.createElement("div");
    b.addClass("entryObjectWrapperWorkspace");
    this.view_.appendChild(b);
    d = Entry.createElement("input");
    d.bindOnClick(function(a) {
      a.stopPropagation();
      this.select();
    });
    d.addClass("entryObjectNameWorkspace");
    b.appendChild(d);
    this.nameView_ = d;
    this.nameView_.entryObject = this;
    d.setAttribute("readonly", !0);
    var f = this;
    this.nameView_.onblur = function(a) {
      this.entryObject.name = this.value;
      Entry.playground.reloadPlayground();
    };
    this.nameView_.onkeypress = function(a) {
      13 == a.keyCode && f.editObjectValues(!1);
    };
    this.nameView_.value = this.name;
    d = Entry.createElement("div");
    d.addClass("entryObjectEditWorkspace");
    d.object = this;
    this.editView_ = d;
    this.view_.appendChild(d);
    Entry.objectEditable ? ($(d).mousedown(function(b) {
      var c = a.isEditing;
      b.stopPropagation();
      Entry.documentMousedown.notify(b);
      Entry.engine.isState("run") || !1 !== c || (a.editObjectValues(!c), Entry.playground.object !== a && Entry.container.selectObject(a.id), a.nameView_.select());
    }), d.blur = function(b) {
      a.editObjectComplete();
    }) : d.addClass("entryRemove");
    Entry.objectEditable && Entry.objectDeletable && (d = Entry.createElement("div"), d.addClass("entryObjectDeleteWorkspace"), d.object = this, this.deleteView_ = d, this.view_.appendChild(d), d.bindOnClick(function(a) {
      Entry.engine.isState("run") || Entry.container.removeObject(this.object);
    }));
    d = Entry.createElement("div");
    d.addClass("entryObjectInformationWorkspace");
    d.object = this;
    this.isInformationToggle = !1;
    b.appendChild(d);
    this.informationView_ = d;
    b = Entry.createElement("div");
    b.addClass("entryObjectRotationWrapperWorkspace");
    b.object = this;
    this.view_.appendChild(b);
    d = Entry.createElement("span");
    d.addClass("entryObjectCoordinateWorkspace");
    b.appendChild(d);
    e = Entry.createElement("span");
    e.addClass("entryObjectCoordinateSpanWorkspace");
    e.innerHTML = "X:";
    var g = Entry.createElement("input");
    g.addClass("entryObjectCoordinateInputWorkspace");
    g.setAttribute("readonly", !0);
    g.bindOnClick(function(a) {
      a.stopPropagation();
      this.select();
    });
    var h = Entry.createElement("span");
    h.addClass("entryObjectCoordinateSpanWorkspace");
    h.innerHTML = "Y:";
    var k = Entry.createElement("input");
    k.addClass("entryObjectCoordinateInputWorkspace entryObjectCoordinateInputWorkspace_right");
    k.bindOnClick(function(a) {
      a.stopPropagation();
      this.select();
    });
    k.setAttribute("readonly", !0);
    var l = Entry.createElement("span");
    l.addClass("entryObjectCoordinateSizeWorkspace");
    l.innerHTML = Lang.Workspace.Size + " : ";
    var q = Entry.createElement("input");
    q.addClass("entryObjectCoordinateInputWorkspace", "entryObjectCoordinateInputWorkspace_size");
    q.bindOnClick(function(a) {
      a.stopPropagation();
      this.select();
    });
    q.setAttribute("readonly", !0);
    d.appendChild(e);
    d.appendChild(g);
    d.appendChild(h);
    d.appendChild(k);
    d.appendChild(l);
    d.appendChild(q);
    d.xInput_ = g;
    d.yInput_ = k;
    d.sizeInput_ = q;
    this.coordinateView_ = d;
    c = this;
    g.onkeypress = function(a) {
      13 == a.keyCode && c.editObjectValues(!1);
    };
    g.onblur = function(a) {
      isNaN(g.value) || c.entity.setX(Number(g.value));
      c.updateCoordinateView();
      Entry.stage.updateObject();
    };
    k.onkeypress = function(a) {
      13 == a.keyCode && c.editObjectValues(!1);
    };
    k.onblur = function(a) {
      isNaN(k.value) || c.entity.setY(Number(k.value));
      c.updateCoordinateView();
      Entry.stage.updateObject();
    };
    q.onkeypress = function(a) {
      13 == a.keyCode && c.editObjectValues(!1);
    };
    q.onblur = function(a) {
      isNaN(q.value) || c.entity.setSize(Number(q.value));
      c.updateCoordinateView();
      Entry.stage.updateObject();
    };
    d = Entry.createElement("div");
    d.addClass("entryObjectRotateLabelWrapperWorkspace");
    this.view_.appendChild(d);
    this.rotateLabelWrapperView_ = d;
    e = Entry.createElement("span");
    e.addClass("entryObjectRotateSpanWorkspace");
    e.innerHTML = Lang.Workspace.rotation + " : ";
    var n = Entry.createElement("input");
    n.addClass("entryObjectRotateInputWorkspace");
    n.setAttribute("readonly", !0);
    n.bindOnClick(function(a) {
      a.stopPropagation();
      this.select();
    });
    this.rotateSpan_ = e;
    this.rotateInput_ = n;
    h = Entry.createElement("span");
    h.addClass("entryObjectDirectionSpanWorkspace");
    h.innerHTML = Lang.Workspace.direction + " : ";
    var m = Entry.createElement("input");
    m.addClass("entryObjectDirectionInputWorkspace");
    m.setAttribute("readonly", !0);
    m.bindOnClick(function(a) {
      a.stopPropagation();
      this.select();
    });
    this.directionInput_ = m;
    d.appendChild(e);
    d.appendChild(n);
    d.appendChild(h);
    d.appendChild(m);
    d.rotateInput_ = n;
    d.directionInput_ = m;
    c = this;
    n.onkeypress = function(a) {
      13 == a.keyCode && c.editObjectValues(!1);
    };
    n.onblur = function(a) {
      a = n.value;
      -1 != a.indexOf("\u02da") && (a = a.substring(0, a.indexOf("\u02da")));
      isNaN(a) || c.entity.setRotation(Number(a));
      c.updateRotationView();
      Entry.stage.updateObject();
    };
    m.onkeypress = function(a) {
      13 == a.keyCode && c.editObjectValues(!1);
    };
    m.onblur = function(a) {
      a = m.value;
      -1 != a.indexOf("\u02da") && (a = a.substring(0, a.indexOf("\u02da")));
      isNaN(a) || c.entity.setDirection(Number(a));
      c.updateRotationView();
      Entry.stage.updateObject();
    };
    d = Entry.createElement("div");
    d.addClass("rotationMethodWrapper");
    b.appendChild(d);
    this.rotationMethodWrapper_ = d;
    b = Entry.createElement("span");
    b.addClass("entryObjectRotateMethodLabelWorkspace");
    d.appendChild(b);
    b.innerHTML = Lang.Workspace.rotate_method + " : ";
    b = Entry.createElement("div");
    b.addClass("entryObjectRotateModeWorkspace");
    b.addClass("entryObjectRotateModeAWorkspace");
    b.object = this;
    this.rotateModeAView_ = b;
    d.appendChild(b);
    b.bindOnClick(function(a) {
      Entry.engine.isState("run") || this.object.getLock() || (this.object.initRotateValue("free"), this.object.setRotateMethod("free"));
    });
    b = Entry.createElement("div");
    b.addClass("entryObjectRotateModeWorkspace");
    b.addClass("entryObjectRotateModeBWorkspace");
    b.object = this;
    this.rotateModeBView_ = b;
    d.appendChild(b);
    b.bindOnClick(function(a) {
      Entry.engine.isState("run") || this.object.getLock() || (this.object.initRotateValue("vertical"), this.object.setRotateMethod("vertical"));
    });
    b = Entry.createElement("div");
    b.addClass("entryObjectRotateModeWorkspace");
    b.addClass("entryObjectRotateModeCWorkspace");
    b.object = this;
    this.rotateModeCView_ = b;
    d.appendChild(b);
    b.bindOnClick(function(a) {
      Entry.engine.isState("run") || this.object.getLock() || (this.object.initRotateValue("none"), this.object.setRotateMethod("none"));
    });
    this.updateThumbnailView();
    this.updateCoordinateView();
    this.updateRotateMethodView();
    this.updateInputViews();
    this.updateCoordinateView(!0);
    this.updateRotationView(!0);
    return this.view_;
  }
  if ("phone" == Entry.type) {
    return b = Entry.createElement("li", this.id), b.addClass("entryContainerListElementWorkspace"), b.object = this, b.bindOnClick(function(a) {
      Entry.container.getObject(this.id) && Entry.container.selectObject(this.id);
    }), $ && (a = this, context.attach("#" + this.id, [{text:Lang.Workspace.context_rename, href:"/", action:function(a) {
      a.preventDefault();
    }}, {text:Lang.Workspace.context_duplicate, href:"/", action:function(b) {
      b.preventDefault();
      Entry.container.addCloneObject(a);
    }}, {text:Lang.Workspace.context_remove, href:"/", action:function(b) {
      b.preventDefault();
      Entry.container.removeObject(a);
    }}])), this.view_ = b, b = Entry.createElement("ul"), b.addClass("objectInfoView"), d = Entry.createElement("li"), d.addClass("objectInfo_visible"), e = Entry.createElement("li"), e.addClass("objectInfo_lock"), b.appendChild(d), b.appendChild(e), this.view_.appendChild(b), b = Entry.createElement("div"), b.addClass("entryObjectThumbnailWorkspace"), this.view_.appendChild(b), this.thumbnailView_ = b, b = Entry.createElement("div"), b.addClass("entryObjectWrapperWorkspace"), this.view_.appendChild(b), 
    d = Entry.createElement("input"), d.addClass("entryObjectNameWorkspace"), b.appendChild(d), this.nameView_ = d, this.nameView_.entryObject = this, this.nameView_.onblur = function() {
      this.entryObject.name = this.value;
      Entry.playground.reloadPlayground();
    }, this.nameView_.onkeypress = function(a) {
      13 == a.keyCode && c.editObjectValues(!1);
    }, this.nameView_.value = this.name, Entry.objectEditable && Entry.objectDeletable && (d = Entry.createElement("div"), d.addClass("entryObjectDeletePhone"), d.object = this, this.deleteView_ = d, this.view_.appendChild(d), d.bindOnClick(function(a) {
      Entry.engine.isState("run") || Entry.container.removeObject(this.object);
    })), d = Entry.createElement("button"), d.addClass("entryObjectEditPhone"), d.object = this, d.bindOnClick(function(a) {
      if (a = Entry.container.getObject(this.id)) {
        Entry.container.selectObject(a.id), Entry.playground.injectObject(a);
      }
    }), this.view_.appendChild(d), d = Entry.createElement("div"), d.addClass("entryObjectInformationWorkspace"), d.object = this, this.isInformationToggle = !1, b.appendChild(d), this.informationView_ = d, d = Entry.createElement("div"), d.addClass("entryObjectRotateLabelWrapperWorkspace"), this.view_.appendChild(d), this.rotateLabelWrapperView_ = d, e = Entry.createElement("span"), e.addClass("entryObjectRotateSpanWorkspace"), e.innerHTML = Lang.Workspace.rotation + " : ", n = Entry.createElement("input"), 
    n.addClass("entryObjectRotateInputWorkspace"), this.rotateSpan_ = e, this.rotateInput_ = n, h = Entry.createElement("span"), h.addClass("entryObjectDirectionSpanWorkspace"), h.innerHTML = Lang.Workspace.direction + " : ", m = Entry.createElement("input"), m.addClass("entryObjectDirectionInputWorkspace"), this.directionInput_ = m, d.appendChild(e), d.appendChild(n), d.appendChild(h), d.appendChild(m), d.rotateInput_ = n, d.directionInput_ = m, c = this, n.onkeypress = function(a) {
      13 == a.keyCode && (a = n.value, -1 != a.indexOf("\u02da") && (a = a.substring(0, a.indexOf("\u02da"))), isNaN(a) || c.entity.setRotation(Number(a)), c.updateRotationView(), n.blur());
    }, n.onblur = function(a) {
      c.entity.setRotation(c.entity.getRotation());
      Entry.stage.updateObject();
    }, m.onkeypress = function(a) {
      13 == a.keyCode && (a = m.value, -1 != a.indexOf("\u02da") && (a = a.substring(0, a.indexOf("\u02da"))), isNaN(a) || c.entity.setDirection(Number(a)), c.updateRotationView(), m.blur());
    }, m.onblur = function(a) {
      c.entity.setDirection(c.entity.getDirection());
      Entry.stage.updateObject();
    }, b = Entry.createElement("div"), b.addClass("entryObjectRotationWrapperWorkspace"), b.object = this, this.view_.appendChild(b), d = Entry.createElement("span"), d.addClass("entryObjectCoordinateWorkspace"), b.appendChild(d), e = Entry.createElement("span"), e.addClass("entryObjectCoordinateSpanWorkspace"), e.innerHTML = "X:", g = Entry.createElement("input"), g.addClass("entryObjectCoordinateInputWorkspace"), h = Entry.createElement("span"), h.addClass("entryObjectCoordinateSpanWorkspace"), 
    h.innerHTML = "Y:", k = Entry.createElement("input"), k.addClass("entryObjectCoordinateInputWorkspace entryObjectCoordinateInputWorkspace_right"), l = Entry.createElement("span"), l.addClass("entryObjectCoordinateSpanWorkspace"), l.innerHTML = Lang.Workspace.Size, q = Entry.createElement("input"), q.addClass("entryObjectCoordinateInputWorkspace", "entryObjectCoordinateInputWorkspace_size"), d.appendChild(e), d.appendChild(g), d.appendChild(h), d.appendChild(k), d.appendChild(l), d.appendChild(q), 
    d.xInput_ = g, d.yInput_ = k, d.sizeInput_ = q, this.coordinateView_ = d, c = this, g.onkeypress = function(a) {
      13 == a.keyCode && (isNaN(g.value) || c.entity.setX(Number(g.value)), c.updateCoordinateView(), c.blur());
    }, g.onblur = function(a) {
      c.entity.setX(c.entity.getX());
      Entry.stage.updateObject();
    }, k.onkeypress = function(a) {
      13 == a.keyCode && (isNaN(k.value) || c.entity.setY(Number(k.value)), c.updateCoordinateView(), c.blur());
    }, k.onblur = function(a) {
      c.entity.setY(c.entity.getY());
      Entry.stage.updateObject();
    }, d = Entry.createElement("div"), d.addClass("rotationMethodWrapper"), b.appendChild(d), this.rotationMethodWrapper_ = d, b = Entry.createElement("span"), b.addClass("entryObjectRotateMethodLabelWorkspace"), d.appendChild(b), b.innerHTML = Lang.Workspace.rotate_method + " : ", b = Entry.createElement("div"), b.addClass("entryObjectRotateModeWorkspace"), b.addClass("entryObjectRotateModeAWorkspace"), b.object = this, this.rotateModeAView_ = b, d.appendChild(b), b.bindOnClick(function(a) {
      Entry.engine.isState("run") || this.object.setRotateMethod("free");
    }), b = Entry.createElement("div"), b.addClass("entryObjectRotateModeWorkspace"), b.addClass("entryObjectRotateModeBWorkspace"), b.object = this, this.rotateModeBView_ = b, d.appendChild(b), b.bindOnClick(function(a) {
      Entry.engine.isState("run") || this.object.setRotateMethod("vertical");
    }), b = Entry.createElement("div"), b.addClass("entryObjectRotateModeWorkspace"), b.addClass("entryObjectRotateModeCWorkspace"), b.object = this, this.rotateModeCView_ = b, d.appendChild(b), b.bindOnClick(function(a) {
      Entry.engine.isState("run") || this.object.setRotateMethod("none");
    }), this.updateThumbnailView(), this.updateCoordinateView(), this.updateRotateMethodView(), this.updateInputViews(), this.view_;
  }
};
Entry.EntryObject.prototype.setName = function(b) {
  Entry.assert("string" == typeof b, "object name must be string");
  this.name = b;
  this.nameView_.value = b;
};
Entry.EntryObject.prototype.setText = function(b) {
  Entry.assert("string" == typeof b, "object text must be string");
  this.text = b;
};
Entry.EntryObject.prototype.setScript = function(b) {
  this.script = b;
};
Entry.EntryObject.prototype.getScriptText = function(b) {
  b = Blockly.Xml.domToText(this.script);
  b = b.replace(/\sxmlns=\"(.*?)\"/, "");
  b = b.replace(/\sclass=\"(.*?)\"/g, "");
  b = b.replace(/\sid=\"(.*?)\"/g, "");
  return b = b.replace(/\sinline=\"(.*?)\"/g, "");
};
Entry.EntryObject.prototype.initEntity = function(b) {
  var a = {};
  a.x = a.y = 0;
  a.rotation = 0;
  a.direction = 90;
  if ("sprite" == this.objectType) {
    var c = b.sprite.pictures[0].dimension;
    a.regX = c.width / 2;
    a.regY = c.height / 2;
    a.scaleX = a.scaleY = "background" == b.sprite.category.main ? Math.max(270 / c.height, 480 / c.width) : "new" == b.sprite.category.main ? 1 : 200 / (c.width + c.height);
    a.width = c.width;
    a.height = c.height;
  } else {
    if ("textBox" == this.objectType) {
      if (a.regX = 25, a.regY = 12, a.scaleX = a.scaleY = 1.5, a.width = 50, a.height = 24, a.text = b.text, b.options) {
        if (b = b.options, c = "", b.bold && (c += "bold "), b.italic && (c += "italic "), a.underline = b.underline, a.strike = b.strike, a.font = c + "20px " + b.font.family, a.colour = b.colour, a.bgColor = b.background, a.lineBreak = b.lineBreak) {
          a.width = 256, a.height = .5625 * a.width, a.regX = a.width / 2, a.regY = a.height / 2;
        }
      } else {
        a.underline = !1, a.strike = !1, a.font = "20px Nanum Gothic", a.colour = "#000000", a.bgColor = "#ffffff";
      }
    }
  }
  return a;
};
Entry.EntryObject.prototype.updateThumbnailView = function() {
  if ("sprite" == this.objectType) {
    if (this.entity.picture.fileurl) {
      this.thumbnailView_.style.backgroundImage = 'url("' + this.entity.picture.fileurl + '")';
    } else {
      var b = this.entity.picture.filename;
      this.thumbnailView_.style.backgroundImage = 'url("' + Entry.defaultPath + "/uploads/" + b.substring(0, 2) + "/" + b.substring(2, 4) + "/thumb/" + b + '.png")';
    }
  } else {
    "textBox" == this.objectType && (this.thumbnailView_.style.backgroundImage = "url(" + (Entry.mediaFilePath + "/text_icon.png") + ")");
  }
};
Entry.EntryObject.prototype.updateCoordinateView = function(b) {
  if ((this.isSelected() || b) && this.coordinateView_ && this.coordinateView_.xInput_ && this.coordinateView_.yInput_) {
    b = this.coordinateView_.xInput_.value;
    var a = this.coordinateView_.yInput_.value, c = this.coordinateView_.sizeInput_.value, d = this.entity.getX().toFixed(1), e = this.entity.getY().toFixed(1), f = this.entity.getSize().toFixed(1);
    b != d && (this.coordinateView_.xInput_.value = d);
    a != e && (this.coordinateView_.yInput_.value = e);
    c != f && (this.coordinateView_.sizeInput_.value = f);
  }
};
Entry.EntryObject.prototype.updateRotationView = function(b) {
  if (this.isSelected() && this.view_ || b) {
    b = "", "free" == this.getRotateMethod() ? (this.rotateSpan_.removeClass("entryRemove"), this.rotateInput_.removeClass("entryRemove"), b += this.entity.getRotation().toFixed(1), this.rotateInput_.value = b + "\u02da") : (this.rotateSpan_.addClass("entryRemove"), this.rotateInput_.addClass("entryRemove")), b = "" + this.entity.getDirection().toFixed(1), b += "\u02da", this.directionInput_.value = b;
  }
};
Entry.EntryObject.prototype.select = function(b) {
  console.log(this);
};
Entry.EntryObject.prototype.addPicture = function(b, a) {
  Entry.stateManager && Entry.stateManager.addCommand("add sprite", this, this.removePicture, b.id);
  a || 0 === a ? (this.pictures.splice(a, 0, b), Entry.playground.injectPicture(this)) : this.pictures.push(b);
  return new Entry.State(this, this.removePicture, b.id);
};
Entry.EntryObject.prototype.removePicture = function(b) {
  if (2 > this.pictures.length) {
    return !1;
  }
  b = this.getPicture(b);
  var a = this.pictures.indexOf(b);
  Entry.stateManager && Entry.stateManager.addCommand("remove sprite", this, this.addPicture, b, a);
  this.pictures.splice(a, 1);
  b === this.selectedPicture && Entry.playground.selectPicture(this.pictures[0]);
  Entry.playground.injectPicture(this);
  Entry.playground.reloadPlayground();
  return new Entry.State(this, this.addPicture, b, a);
};
Entry.EntryObject.prototype.getPicture = function(b) {
  if (!b) {
    return this.selectedPicture;
  }
  b = b.trim();
  for (var a = this.pictures, c = a.length, d = 0;d < c;d++) {
    if (a[d].id == b) {
      return a[d];
    }
  }
  for (d = 0;d < c;d++) {
    if (a[d].name == b) {
      return a[d];
    }
  }
  b = Entry.parseNumber(b);
  if ((!1 !== b || "boolean" != typeof b) && c >= b && 0 < b) {
    return a[b - 1];
  }
  throw Error("No picture found");
};
Entry.EntryObject.prototype.setPicture = function(b) {
  for (var a in this.pictures) {
    if (b.id === this.pictures[a].id) {
      this.pictures[a] = b;
      return;
    }
  }
  throw Error("No picture found");
};
Entry.EntryObject.prototype.getPrevPicture = function(b) {
  for (var a = this.pictures, c = a.length, d = 0;d < c;d++) {
    if (a[d].id == b) {
      return a[0 == d ? c - 1 : d - 1];
    }
  }
};
Entry.EntryObject.prototype.getNextPicture = function(b) {
  for (var a = this.pictures, c = a.length, d = 0;d < c;d++) {
    if (a[d].id == b) {
      return a[d == c - 1 ? 0 : d + 1];
    }
  }
};
Entry.EntryObject.prototype.selectPicture = function(b) {
  var a = this.getPicture(b);
  if (a) {
    this.selectedPicture = a, this.entity.setImage(a), this.updateThumbnailView();
  } else {
    throw Error("No picture with pictureId : " + b);
  }
};
Entry.EntryObject.prototype.addSound = function(b, a) {
  b.id || (b.id = Entry.generateHash());
  Entry.stateManager && Entry.stateManager.addCommand("add sound", this, this.removeSound, b.id);
  Entry.initSound(b, a);
  a || 0 === a ? (this.sounds.splice(a, 0, b), Entry.playground.injectSound(this)) : this.sounds.push(b);
  return new Entry.State(this, this.removeSound, b.id);
};
Entry.EntryObject.prototype.removeSound = function(b) {
  var a;
  a = this.getSound(b);
  b = this.sounds.indexOf(a);
  Entry.stateManager && Entry.stateManager.addCommand("remove sound", this, this.addSound, a, b);
  this.sounds.splice(b, 1);
  Entry.playground.reloadPlayground();
  Entry.playground.injectSound(this);
  return new Entry.State(this, this.addSound, a, b);
};
Entry.EntryObject.prototype.getRotateMethod = function() {
  this.rotateMethod || (this.rotateMethod = "free");
  return this.rotateMethod;
};
Entry.EntryObject.prototype.setRotateMethod = function(b) {
  b || (b = "free");
  this.rotateMethod = b;
  this.updateRotateMethodView();
  Entry.stage.selectedObject && Entry.stage.selectedObject.entity && (Entry.stage.updateObject(), Entry.stage.updateHandle());
};
Entry.EntryObject.prototype.initRotateValue = function(b) {
  this.rotateMethod != b && (this.entity.rotation = 0, this.entity.direction = 90);
};
Entry.EntryObject.prototype.updateRotateMethodView = function() {
  var b = this.rotateMethod;
  this.rotateModeAView_ && (this.rotateModeAView_.removeClass("selected"), this.rotateModeBView_.removeClass("selected"), this.rotateModeCView_.removeClass("selected"), "free" == b ? this.rotateModeAView_.addClass("selected") : "vertical" == b ? this.rotateModeBView_.addClass("selected") : this.rotateModeCView_.addClass("selected"), this.updateRotationView());
};
Entry.EntryObject.prototype.toggleInformation = function(b) {
  this.setRotateMethod(this.getRotateMethod());
  void 0 === b && (b = this.isInformationToggle = !this.isInformationToggle);
  b ? this.view_.addClass("informationToggle") : this.view_.removeClass("informationToggle");
};
Entry.EntryObject.prototype.addCloneEntity = function(b, a, c) {
  this.clonedEntities.length > Entry.maxCloneLimit || (b = new Entry.EntityObject(this), a ? (b.injectModel(a.picture ? a.picture : null, a.toJSON()), b.snapshot_ = a.snapshot_, a.effect && (b.effect = Entry.cloneSimpleObject(a.effect), b.applyFilter()), a.brush && Entry.setCloneBrush(b, a.brush)) : (b.injectModel(this.entity.picture ? this.entity.picture : null, this.entity.toJSON(b)), b.snapshot_ = this.entity.snapshot_, this.entity.effect && (b.effect = Entry.cloneSimpleObject(this.entity.effect), 
  b.applyFilter()), this.entity.brush && Entry.setCloneBrush(b, this.entity.brush)), Entry.engine.raiseEventOnEntity(b, [b, "when_clone_start"]), b.isClone = !0, b.isStarted = !0, this.addCloneVariables(this, b, a ? a.variables : null, a ? a.lists : null), this.clonedEntities.push(b), Entry.stage.loadEntity(b));
};
Entry.EntryObject.prototype.initializeSplitter = function(b) {
  b.onmousedown = function(a) {
    Entry.container.disableSort();
    Entry.container.splitterEnable = !0;
  };
  document.addEventListener("mousemove", function(a) {
    Entry.container.splitterEnable && Entry.resizeElement({canvasWidth:a.x || a.clientX});
  });
  document.addEventListener("mouseup", function(a) {
    Entry.container.splitterEnable = !1;
    Entry.container.enableSort();
  });
};
Entry.EntryObject.prototype.isSelected = function() {
  return this.isSelected_;
};
Entry.EntryObject.prototype.toJSON = function() {
  var b = {};
  b.id = this.id;
  b.name = this.name;
  "textBox" == this.objectType && (b.text = this.text);
  b.script = this.getScriptText();
  "sprite" == this.objectType && (b.selectedPictureId = this.selectedPicture.id);
  b.objectType = this.objectType;
  b.rotateMethod = this.getRotateMethod();
  b.scene = this.scene.id;
  b.sprite = {pictures:Entry.getPicturesJSON(this.pictures), sounds:Entry.getSoundsJSON(this.sounds)};
  b.lock = this.lock;
  b.entity = this.entity.toJSON();
  return b;
};
Entry.EntryObject.prototype.destroy = function() {
  Entry.stage.unloadEntity(this.entity);
  this.view_ && Entry.removeElement(this.view_);
};
Entry.EntryObject.prototype.getSound = function(b) {
  b = b.trim();
  for (var a = this.sounds, c = a.length, d = 0;d < c;d++) {
    if (a[d].id == b) {
      return a[d];
    }
  }
  for (d = 0;d < c;d++) {
    if (a[d].name == b) {
      return a[d];
    }
  }
  b = Entry.parseNumber(b);
  if ((!1 !== b || "boolean" != typeof b) && c >= b && 0 < b) {
    return a[b - 1];
  }
  throw Error("No Sound");
};
Entry.EntryObject.prototype.addCloneVariables = function(b, a, c, d) {
  a.variables = [];
  a.lists = [];
  c || (c = Entry.findObjsByKey(Entry.variableContainer.variables_, "object_", b.id));
  d || (d = Entry.findObjsByKey(Entry.variableContainer.lists_, "object_", b.id));
  for (b = 0;b < c.length;b++) {
    a.variables.push(c[b].clone());
  }
  for (b = 0;b < d.length;b++) {
    a.lists.push(d[b].clone());
  }
};
Entry.EntryObject.prototype.getLock = function() {
  return this.lock;
};
Entry.EntryObject.prototype.setLock = function(b) {
  return this.lock = b;
};
Entry.EntryObject.prototype.updateInputViews = function(b) {
  b = b || this.getLock();
  var a = [this.nameView_, this.coordinateView_.xInput_, this.coordinateView_.yInput_, this.rotateInput_, this.directionInput_, this.coordinateView_.sizeInput_];
  if (b && 1 != a[0].getAttribute("readonly")) {
    for (b = 0;b < a.length;b++) {
      a[b].removeClass("selectedEditingObject"), a[b].setAttribute("readonly", !1), this.isEditing = !1;
    }
  }
};
Entry.EntryObject.prototype.editObjectValues = function(b) {
  var a;
  a = this.getLock() ? [this.nameView_] : [this.nameView_, this.coordinateView_.xInput_, this.coordinateView_.yInput_, this.rotateInput_, this.directionInput_, this.coordinateView_.sizeInput_];
  if (b) {
    $(a).removeClass("selectedNotEditingObject");
    for (b = 0;b < a.length;b++) {
      a[b].removeAttribute("readonly"), a[b].addClass("selectedEditingObject");
    }
    this.isEditing = !0;
  } else {
    for (b = 0;b < a.length;b++) {
      a[b].blur(!0);
    }
    this.blurAllInput();
    this.isEditing = !1;
  }
};
Entry.EntryObject.prototype.blurAllInput = function() {
  var b = document.getElementsByClassName("selectedEditingObject");
  $(b).removeClass("selectedEditingObject");
  for (var b = [this.nameView_, this.coordinateView_.xInput_, this.coordinateView_.yInput_, this.rotateInput_, this.directionInput_, this.coordinateView_.sizeInput_], a = 0;a < b.length;a++) {
    b[a].addClass("selectedNotEditingObject"), b[a].setAttribute("readonly", !0);
  }
};
Entry.EntryObject.prototype.addStampEntity = function(b) {
  b = new Entry.StampEntity(this, b);
  Entry.stage.loadEntity(b);
  this.clonedEntities.push(b);
  Entry.stage.sortZorder();
};
Entry.EntryObject.prototype.getClonedEntities = function() {
  var b = [];
  this.clonedEntities.map(function(a) {
    a.isStamp || b.push(a);
  });
  return b;
};
Entry.EntryObject.prototype.getStampEntities = function() {
  var b = [];
  this.clonedEntities.map(function(a) {
    a.isStamp && b.push(a);
  });
  return b;
};
Entry.Painter = function() {
  this.toolbox = {selected:"cursor"};
  this.stroke = {enabled:!1, fillColor:"#000000", lineColor:"#000000", thickness:1, fill:!0, transparent:!1, style:"line", locked:!1};
  this.file = {id:Entry.generateHash(), name:"\uc0c8\uadf8\ub9bc", modified:!1, mode:"new"};
  this.font = {name:"KoPub Batang", size:20, style:"normal"};
  this.selectArea = {};
  this.firstStatement = !1;
};
Entry.Painter.prototype.initialize = function(b) {
  this.generateView(b);
  this.canvas = document.getElementById("entryPainterCanvas");
  this.canvas_ = document.getElementById("entryPainterCanvas_");
  this.stage = new createjs.Stage(this.canvas);
  this.stage.autoClear = !0;
  this.stage.enableDOMEvents(!0);
  this.stage.enableMouseOver(10);
  this.stage.mouseMoveOutside = !0;
  createjs.Touch.enable(this.stage);
  this.objectContainer = new createjs.Container;
  this.objectContainer.name = "container";
  this.stage.addChild(this.objectContainer);
  this.ctx = this.stage.canvas.getContext("2d");
  this.ctx.imageSmoothingEnabled = !1;
  this.ctx.webkitImageSmoothingEnabled = !1;
  this.ctx.mozImageSmoothingEnabled = !1;
  this.ctx.msImageSmoothingEnabled = !1;
  this.ctx.oImageSmoothingEnabled = !1;
  this.ctx_ = this.canvas_.getContext("2d");
  this.initDashedLine();
  this.initPicture();
  this.initCoordinator();
  this.initHandle();
  this.initDraw();
  var a = this;
  Entry.addEventListener("textUpdate", function() {
    var b = a.inputField.value();
    "" === b ? (a.inputField.hide(), delete a.inputField) : (a.inputField.hide(), a.drawText(b), a.selectToolbox("cursor"));
  });
  this.selectToolbox("cursor");
};
Entry.Painter.prototype.initHandle = function() {
  this._handle = new createjs.Container;
  this._handle.rect = new createjs.Shape;
  this._handle.addChild(this._handle.rect);
  var b = new createjs.Container;
  b.name = "move";
  b.width = 90;
  b.height = 90;
  b.x = 90;
  b.y = 90;
  b.rect = new createjs.Shape;
  var a = this;
  b.rect.on("mousedown", function(c) {
    "cursor" === a.toolbox.selected && (a.initCommand(), this.offset = {x:this.parent.x - this.x - c.stageX, y:this.parent.y - this.y - c.stageY}, this.parent.handleMode = "move", b.isSelectCenter = !1);
  });
  b.rect.on("pressmove", function(c) {
    "cursor" !== a.toolbox.selected || b.isSelectCenter || (a.doCommand(), this.parent.x = c.stageX + this.offset.x, this.parent.y = c.stageY + this.offset.y, a.updateImageHandle());
  });
  b.on("mouseup", function(b) {
    a.checkCommand();
  });
  b.rect.cursor = "move";
  b.addChild(b.rect);
  b.notch = new createjs.Shape;
  b.addChild(b.notch);
  b.NEHandle = this.generateCornerHandle();
  b.addChild(b.NEHandle);
  b.NWHandle = this.generateCornerHandle();
  b.addChild(b.NWHandle);
  b.SWHandle = this.generateCornerHandle();
  b.addChild(b.SWHandle);
  b.SEHandle = this.generateCornerHandle();
  b.addChild(b.SEHandle);
  b.EHandle = this.generateXHandle();
  b.addChild(b.EHandle);
  b.WHandle = this.generateXHandle();
  b.addChild(b.WHandle);
  b.NHandle = this.generateYHandle();
  b.addChild(b.NHandle);
  b.SHandle = this.generateYHandle();
  b.addChild(b.SHandle);
  b.RHandle = new createjs.Shape;
  b.RHandle.graphics.ss(2, 2, 0).beginFill("#888").s("#c1c7cd").f("#c1c7cd").dr(-2, -2, 8, 8);
  b.RHandle.on("mousedown", function(b) {
    a.initCommand();
  });
  b.RHandle.on("pressmove", function(b) {
    a.doCommand();
    var d = b.stageX - this.parent.x;
    b = b.stageY - this.parent.y;
    this.parent.rotation = 0 <= d ? Math.atan(b / d) / Math.PI * 180 + 90 : Math.atan(b / d) / Math.PI * 180 + 270;
    a.updateImageHandle();
  });
  b.RHandle.cursor = "crosshair";
  b.addChild(b.RHandle);
  b.on("mouseup", function(b) {
    a.checkCommand();
  });
  b.visible = !1;
  this.handle = b;
  this.stage.addChild(b);
  this.updateImageHandleCursor();
};
Entry.Painter.prototype.generateCornerHandle = function() {
  var b = this, a = new createjs.Shape;
  a.graphics.beginFill("#c1c7cd").ss(2, 2, 0).s("#c1c7cd").dr(-4, -4, 8, 8);
  a.on("mousedown", function(a) {
    b.initCommand();
    this.offset = {x:a.stageX - this.parent.x + this.parent.regX, y:a.stageY - this.parent.y + this.parent.regY};
  });
  a.on("pressmove", function(a) {
    b.doCommand();
    var d = Math.sqrt(Math.abs((a.stageX - this.parent.x + this.parent.regX) / this.offset.x * (a.stageY - this.parent.y + this.parent.regY) / this.offset.y));
    10 < this.parent.width * d && 10 < this.parent.height * d && (this.parent.width *= d, this.parent.height *= d, this.offset = {x:a.stageX - this.parent.x + this.parent.regX, y:a.stageY - this.parent.y + this.parent.regY});
    b.updateImageHandle();
  });
  a.on("mouseup", function(a) {
    b.checkCommand();
  });
  return a;
};
Entry.Painter.prototype.generateXHandle = function() {
  var b = this, a = new createjs.Shape;
  a.graphics.beginFill("#c1c7cd").ss(2, 2, 0).s("#c1c7cd").dr(-4, -4, 8, 8);
  a.on("mousedown", function(a) {
    b.initCommand();
    this.offset = {x:a.stageX - this.parent.x + this.parent.regX};
  });
  a.on("pressmove", function(a) {
    b.doCommand();
    var d = Math.abs((a.stageX - this.parent.x + this.parent.regX) / this.offset.x);
    10 < this.parent.width * d && (this.parent.width *= d, this.offset = {x:a.stageX - this.parent.x + this.parent.regX});
    b.updateImageHandle();
  });
  a.on("mouseup", function(a) {
    b.checkCommand();
  });
  return a;
};
Entry.Painter.prototype.generateYHandle = function() {
  var b = this, a = new createjs.Shape;
  a.graphics.beginFill("#c1c7cd").ss(2, 2, 0).s("#c1c7cd").dr(-4, -4, 8, 8);
  a.on("mousedown", function(a) {
    b.initCommand();
    this.offset = {y:a.stageY - this.parent.y + this.parent.regY};
  });
  a.on("pressmove", function(a) {
    b.doCommand();
    var d = Math.abs((a.stageY - this.parent.y + this.parent.regY) / this.offset.y);
    10 < this.parent.height * d && (this.parent.height *= d, this.offset = {y:a.stageY - this.parent.y + this.parent.regY});
    b.updateImageHandle();
  });
  a.on("mouseup", function(a) {
    b.checkCommand();
  });
  return a;
};
Entry.Painter.prototype.updateImageHandle = function() {
  if (this.handle.visible) {
    var b = this.handle, a = b.direction, c = b.width, d = b.height, e = b.regX, f = b.regY;
    b.rect.graphics.clear().f("rgba(0,0,1,0.01)").ss(2, 2, 0).s("#c1c7cd").lt(-c / 2, -d / 2).lt(0, -d / 2).lt(0, -d / 2).lt(+c / 2, -d / 2).lt(+c / 2, +d / 2).lt(-c / 2, +d / 2).cp();
    b.notch.graphics.clear().f("rgba(0,0,1,0.01)").ss(2, 2, 0).s("#c1c7cd").lt(0, -d / 2).lt(0, -d / 2 - 20).cp();
    b.NEHandle.x = +b.width / 2;
    b.NEHandle.y = -b.height / 2;
    b.NWHandle.x = -b.width / 2;
    b.NWHandle.y = -b.height / 2;
    b.SWHandle.x = -b.width / 2;
    b.SWHandle.y = +b.height / 2;
    b.SEHandle.x = +b.width / 2;
    b.SEHandle.y = +b.height / 2;
    b.EHandle.x = +b.width / 2;
    b.EHandle.y = 0;
    b.WHandle.x = -b.width / 2;
    b.WHandle.y = 0;
    b.NHandle.x = 0;
    b.NHandle.y = -b.height / 2;
    b.SHandle.x = 0;
    b.SHandle.y = +b.height / 2;
    b.RHandle.x = -2;
    b.RHandle.y = -b.height / 2 - 20 - 2;
    this.handle.visible && (c = this.selectedObject, this.selectedObject.text ? (c.width = this.selectedObject.width, c.height = this.selectedObject.height) : (c.width = c.image.width, c.height = c.image.height), c.scaleX = b.width / c.width, c.scaleY = b.height / c.height, c.x = b.x, c.y = b.y, c.regX = c.width / 2 + e / c.scaleX, c.regY = c.height / 2 + f / c.scaleY, c.rotation = b.rotation, c.direction = a, this.selectArea.x1 = b.x - b.width / 2, this.selectArea.y1 = b.y - b.height / 2, this.selectArea.x2 = 
    b.width, this.selectArea.y2 = b.height, this.objectWidthInput.value = Math.abs(c.width * c.scaleX).toFixed(0), this.objectHeightInput.value = Math.abs(c.height * c.scaleY).toFixed(0), this.objectRotateInput.value = (1 * c.rotation).toFixed(0));
    this.updateImageHandleCursor();
    this.stage.update();
  }
};
Entry.Painter.prototype.updateImageHandleCursor = function() {
  var b = this.handle;
  b.rect.cursor = "move";
  b.RHandle.cursor = "crosshair";
  for (var a = ["nwse-resize", "ns-resize", "nesw-resize", "ew-resize"], c = Math.floor((b.rotation + 22.5) % 180 / 45), d = 0;d < c;d++) {
    a.push(a.shift());
  }
  b.NHandle.cursor = a[1];
  b.NEHandle.cursor = a[2];
  b.EHandle.cursor = a[3];
  b.SEHandle.cursor = a[0];
  b.SHandle.cursor = a[1];
  b.SWHandle.cursor = a[2];
  b.WHandle.cursor = a[3];
  b.NWHandle.cursor = a[0];
};
Entry.Painter.prototype.clearCanvas = function(b) {
  this.clearHandle();
  b || this.initCommand();
  this.objectContainer.removeAllChildren();
  this.stage.update();
  this.colorLayerData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
  b = 0;
  for (var a = this.colorLayerData.data.length;b < a;b++) {
    this.colorLayerData.data[b] = 255, this.colorLayerData.data[b + 1] = 255, this.colorLayerData.data[b + 2] = 255, this.colorLayerData.data[b + 3] = 255;
  }
  this.reloadContext();
};
Entry.Painter.prototype.newPicture = function() {
  var b = {dimension:{height:1, width:1}, fileurl:Entry.mediaFilePath + "_1x1.png", name:Lang.Workspace.new_picture};
  b.id = Entry.generateHash();
  Entry.playground.addPicture(b, !0);
};
Entry.Painter.prototype.initPicture = function() {
  var b = this;
  Entry.addEventListener("pictureSelected", function(a) {
    b.selectToolbox("cursor");
    if (b.file.id !== a.id) {
      b.file.modified && confirm("\uc218\uc815\ub41c \ub0b4\uc6a9\uc744 \uc800\uc7a5\ud558\uc2dc\uaca0\uc2b5\ub2c8\uae4c?") && (b.file_ = JSON.parse(JSON.stringify(b.file)), b.file_save(!0));
      b.file.modified = !1;
      b.clearCanvas(!0);
      var c = new Image;
      c.id = a.id ? a.id : Entry.generateHash();
      b.file.id = c.id;
      b.file.name = a.name;
      b.file.mode = "edit";
      c.src = a.fileurl ? a.fileurl : Entry.defaultPath + "/uploads/" + a.filename.substring(0, 2) + "/" + a.filename.substring(2, 4) + "/image/" + a.filename + ".png";
      c.onload = function(a) {
        b.addImage(a.target);
      };
    }
  });
  Entry.addEventListener("pictureImport", function(a) {
    b.addPicture(a);
  });
  Entry.addEventListener("pictureNameChanged", function(a) {
    b.file.name = a.name;
  });
  Entry.addEventListener("pictureClear", function(a) {
    b.file.modified = !1;
    b.file.id = "";
    b.file.name = "";
    b.clearCanvas();
  });
};
Entry.Painter.prototype.initDraw = function() {
  var b = this;
  this.stage.on("stagemousedown", function(a) {
    b.stagemousedown(a);
  });
  this.stage.on("stagemouseup", function(a) {
    b.stagemouseup(a);
  });
  this.stage.on("stagemousemove", function(a) {
    b.stagemousemove(a);
  });
};
Entry.Painter.prototype.selectObject = function(b, a) {
  this.selectedObject = b;
  this.handle.visible = b.visible;
  a ? (this.handle.width = this.copy.width, this.handle.height = this.copy.height, this.handle.x = this.selectArea.x1 + this.copy.width / 2, this.handle.y = this.selectArea.y1 + this.copy.height / 2) : (this.handle.width = b.scaleX * b.image.width, this.handle.height = b.scaleY * b.image.height, this.handle.x = b.x, this.handle.y = b.y, this.handle.regX = +(b.regX - b.image.width / 2) * b.scaleX, this.handle.regY = +(b.regY - b.image.height / 2) * b.scaleY);
  this.handle.rotation = b.rotation;
  this.handle.direction = 0;
  this.updateImageHandle();
};
Entry.Painter.prototype.selectTextObject = function(b) {
  this.selectedObject = b;
  var a = b.getTransformedBounds();
  this.handle.visible = b.visible;
  b.width || (this.selectedObject.width = a.width);
  b.height || (this.selectedObject.height = a.height);
  this.handle.width = b.scaleX * this.selectedObject.width;
  this.handle.height = b.scaleY * this.selectedObject.height;
  this.handle.x = b.x;
  this.handle.y = b.y;
  b.regX || (b.regX = b.width / 2);
  b.regY || (b.regY = b.height / 2);
  this.handle.regX = (b.regX - this.selectedObject.width / 2) * b.scaleX;
  this.handle.regY = (b.regY - this.selectedObject.height / 2) * b.scaleY;
  this.handle.rotation = b.rotation;
  this.handle.direction = 0;
  this.updateImageHandle();
};
Entry.Painter.prototype.updateHandle = function() {
  -1 < this.stage.getChildIndex(this._handle) && this.stage.removeChild(this._handle);
  -1 === this.stage.getChildIndex(this.handle) && this.stage.addChild(this.handle);
  var b = new createjs.Shape;
  b.graphics.clear().beginFill("#000").rect(this.selectArea.x1, this.selectArea.y1, this.selectArea.x2, this.selectArea.y2);
  this.handle.rect.hitArea = b;
  this.handle.rect.graphics.clear().setStrokeStyle(1, "round").beginStroke("#000000").drawDashedRect(this.selectArea.x1, this.selectArea.y1, this.selectArea.x2, this.selectArea.y2, 4);
  this.stage.update();
};
Entry.Painter.prototype.updateHandle_ = function() {
  this.stage.getChildIndex(-1 < this._handle) && this.stage.addChild(this._handle);
  this._handle.rect.graphics.clear().setStrokeStyle(1, "round").beginStroke("#cccccc").drawDashedRect(this.selectArea.x1, this.selectArea.y1, this.selectArea.x2, this.selectArea.y2, 2);
  this.stage.update();
};
Entry.Painter.prototype.matchTolerance = function(b, a, c, d, e) {
  var f = this.colorLayerData.data[b], g = this.colorLayerData.data[b + 1];
  b = this.colorLayerData.data[b + 2];
  return f >= a - e / 100 * a && f <= a + e / 100 * a && g >= c - e / 100 * c && g <= c + e / 100 * c && b >= d - e / 100 * d && b <= d + e / 100 * d;
};
Entry.Painter.prototype.matchColorOnly = function(b, a, c, d) {
  return a === this.colorLayerData.data[b] && c === this.colorLayerData.data[b + 1] && d === this.colorLayerData.data[b + 2] ? !0 : !1;
};
Entry.Painter.prototype.matchColor = function(b, a, c, d, e) {
  return a === this.colorLayerData.data[b] && c === this.colorLayerData.data[b + 1] && d === this.colorLayerData.data[b + 2] && e === this.colorLayerData.data[b + 3] ? !0 : !1;
};
Entry.Painter.prototype.colorPixel = function(b, a, c, d, e) {
  e || (e = 255);
  this.stroke.transparent && (e = d = c = a = 0);
  this.colorLayerData.data[b] = a;
  this.colorLayerData.data[b + 1] = c;
  this.colorLayerData.data[b + 2] = d;
  this.colorLayerData.data[b + 3] = e;
};
Entry.Painter.prototype.pickStrokeColor = function(b) {
  b = 4 * (Math.round(b.stageY) * this.canvas.width + Math.round(b.stageX));
  this.stroke.lineColor = Entry.rgb2hex(this.colorLayerData.data[b], this.colorLayerData.data[b + 1], this.colorLayerData.data[b + 2]);
  document.getElementById("entryPainterAttrCircle").style.backgroundColor = this.stroke.lineColor;
  document.getElementById("entryPainterAttrCircleInput").value = this.stroke.lineColor;
};
Entry.Painter.prototype.drawText = function(b) {
  var a = document.getElementById("entryPainterAttrFontStyle").value, c = document.getElementById("entryPainterAttrFontName").value, d = document.getElementById("entryPainterAttrFontSize").value;
  b = new createjs.Text(b, a + " " + d + 'px "' + c + '"', this.stroke.lineColor);
  b.textBaseline = "top";
  b.x = this.oldPt.x;
  b.y = this.oldPt.y;
  this.objectContainer.addChild(b);
  this.selectTextObject(b);
  this.file.modified = !0;
};
Entry.Painter.prototype.addImage = function(b) {
  var a = new createjs.Bitmap(b);
  this.objectContainer.addChild(a);
  a.x = this.stage.canvas.width / 2;
  a.y = this.stage.canvas.height / 2;
  a.regX = a.image.width / 2 | 0;
  a.regY = a.image.height / 2 | 0;
  if (540 < a.image.height) {
    var c = 540 / a.image.height;
    a.scaleX = c;
    a.scaleY = c;
  }
  a.name = b.id;
  a.id = b.id;
  this.selectObject(a);
  this.stage.update();
};
Entry.Painter.prototype.createBrush = function() {
  this.initCommand();
  this.brush = new createjs.Shape;
  this.objectContainer.addChild(this.brush);
  this.stage.update();
};
Entry.Painter.prototype.createEraser = function() {
  this.initCommand();
  this.eraser = new createjs.Shape;
  this.objectContainer.addChild(this.eraser);
  this.stage.update();
};
Entry.Painter.prototype.clearHandle = function() {
  this.handle.visible && (this.handle.visible = !1);
  this.coordinator.visible && (this.coordinator.visible = !1);
  this.stage.update();
};
Entry.Painter.prototype.initCommand = function() {
  var b = !1;
  this.handle.visible && (b = !0, this.handle.visible = !1);
  var a = !1;
  this.coordinator.visible && (a = !0, this.coordinator.visible = !1);
  (b || a) && this.stage.update();
  this.isCommandValid = !1;
  this.colorLayerModel = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
  Entry.stateManager && this.firstStatement && Entry.stateManager.addCommand("edit sprite", this, this.restorePainter, this.colorLayerModel);
  this.firstStatement = !0;
  b && (this.handle.visible = !0);
  a && (this.coordinator.visible = !0);
  (b || a) && this.stage.update();
};
Entry.Painter.prototype.doCommand = function() {
  this.isCommandValid = !0;
};
Entry.Painter.prototype.checkCommand = function() {
  this.isCommandValid || Entry.dispatchEvent("cancelLastCommand");
};
Entry.Painter.prototype.restorePainter = function(b) {
  this.clearHandle();
  var a = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  this.ctx.putImageData(b, 0, 0);
  b = new Image;
  b.src = this.canvas.toDataURL();
  var c = this;
  b.onload = function(a) {
    a = new createjs.Bitmap(a.target);
    c.objectContainer.removeAllChildren();
    c.objectContainer.addChild(a);
  };
  Entry.stateManager && Entry.stateManager.addCommand("restore sprite", this, this.restorePainter, a);
};
Entry.Painter.prototype.platten = function() {
  this.colorLayerData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
  this.reloadContext();
};
Entry.Painter.prototype.fill = function() {
  if (!this.stroke.locked) {
    this.stroke.locked = !0;
    this.initCommand();
    this.doCommand();
    this.clearHandle();
    var b = this.canvas.width, a = this.canvas.height;
    this.colorLayerData = this.ctx.getImageData(0, 0, b, a);
    var c = new createjs.Point(this.stage.mouseX, this.stage.mouseY);
    c.x = Math.round(c.x);
    c.y = Math.round(c.y);
    for (var d = 4 * (c.y * b + c.x), e = this.colorLayerData.data[d], f = this.colorLayerData.data[d + 1], g = this.colorLayerData.data[d + 2], h = this.colorLayerData.data[d + 3], k, l, c = [[c.x, c.y]], q = Entry.hex2rgb(this.stroke.lineColor);c.length;) {
      for (var d = c.pop(), n = d[0], m = d[1], d = 4 * (m * b + n);0 <= m && this.matchColor(d, e, f, g, h);) {
        --m, d -= 4 * b;
      }
      d += 4 * b;
      m += 1;
      for (l = k = !1;m < a - 1 && this.matchColor(d, e, f, g, h);) {
        m += 1, this.colorPixel(d, q.r, q.g, q.b), 0 < n && (this.matchColor(d - 4, e, f, g, h) ? k || (c.push([n - 1, m]), k = !0) : k && (k = !1)), n < b - 1 && (this.matchColor(d + 4, e, f, g, h) ? l || (c.push([n + 1, m]), l = !0) : l && (l = !1)), d += 4 * b;
      }
      if (1080 < c.length) {
        break;
      }
    }
    this.file.modified = !0;
    this.reloadContext();
  }
};
Entry.Painter.prototype.reloadContext = function() {
  delete this.selectedObject;
  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  this.ctx.putImageData(this.colorLayerData, 0, 0);
  var b = new Image;
  b.src = this.canvas.toDataURL();
  var a = this;
  b.onload = function(b) {
    b = new createjs.Bitmap(b.target);
    a.objectContainer.removeAllChildren();
    a.objectContainer.addChild(b);
    a.stroke.locked = !1;
  };
};
Entry.Painter.prototype.move_pen = function() {
  var b = new createjs.Point(this.oldPt.x + this.stage.mouseX >> 1, this.oldPt.y + this.stage.mouseY >> 1);
  this.brush.graphics.setStrokeStyle(this.stroke.thickness, "round").beginStroke(this.stroke.lineColor).moveTo(b.x, b.y).curveTo(this.oldPt.x, this.oldPt.y, this.oldMidPt.x, this.oldMidPt.y);
  this.oldPt.x = this.stage.mouseX;
  this.oldPt.y = this.stage.mouseY;
  this.oldMidPt.x = b.x;
  this.oldMidPt.y = b.y;
  this.file.modified = !0;
  this.stage.update();
};
Entry.Painter.prototype.move_line = function() {
  this.brush.graphics.clear().beginStroke(this.stroke.lineColor).setStrokeStyle(this.stroke.thickness, "round").moveTo(this.oldPt.x, this.oldPt.y).lineTo(this.stage.mouseX, this.stage.mouseY);
  this.file.modified = !0;
  this.stage.update();
};
Entry.Painter.prototype.move_rect = function() {
  var b = this.stage.mouseX - this.oldPt.x, a = this.stage.mouseY - this.oldPt.y;
  event.shiftKey && (a = b);
  this.stroke.fill ? 0 === this.stroke.thickness ? this.brush.graphics.clear().setStrokeStyle(this.stroke.thickness, "round").beginFill(this.stroke.fillColor).drawRect(this.oldPt.x, this.oldPt.y, b, a) : this.brush.graphics.clear().beginStroke(this.stroke.lineColor).setStrokeStyle(this.stroke.thickness, "round").beginFill(this.stroke.fillColor).drawRect(this.oldPt.x, this.oldPt.y, b, a) : 0 === this.stroke.thickness ? this.brush.graphics.clear().setStrokeStyle(this.stroke.thickness, "round").drawRect(this.oldPt.x, 
  this.oldPt.y, b, a) : this.brush.graphics.clear().beginStroke(this.stroke.lineColor).setStrokeStyle(this.stroke.thickness, "round").drawRect(this.oldPt.x, this.oldPt.y, b, a);
  this.file.modified = !0;
  this.stage.update();
};
Entry.Painter.prototype.move_circle = function() {
  var b = this.stage.mouseX - this.oldPt.x, a = this.stage.mouseY - this.oldPt.y;
  event.shiftKey && (a = b);
  this.stroke.fill ? 0 === this.stroke.thickness ? this.brush.graphics.clear().beginStroke(this.stroke.fillColor).setStrokeStyle(this.stroke.thickness, "round").beginFill(this.stroke.fillColor).drawEllipse(this.oldPt.x, this.oldPt.y, b, a) : this.brush.graphics.clear().beginStroke(this.stroke.lineColor).setStrokeStyle(this.stroke.thickness, "round").beginFill(this.stroke.fillColor).drawEllipse(this.oldPt.x, this.oldPt.y, b, a) : this.stroke.fill || (0 === this.stroke.thickness ? this.brush.graphics.clear().drawEllipse(this.oldPt.x, 
  this.oldPt.y, b, a) : this.brush.graphics.clear().beginStroke(this.stroke.lineColor).setStrokeStyle(this.stroke.thickness, "round").drawEllipse(this.oldPt.x, this.oldPt.y, b, a));
  this.file.modified = !0;
  this.stage.update();
};
Entry.Painter.prototype.edit_copy = function() {
  this.selectArea ? (this.clearHandle(), this.selectedObject && delete this.selectedObject, this.copyLayerData = this.ctx.getImageData(this.selectArea.x1, this.selectArea.y1, this.selectArea.x2, this.selectArea.y2), this.copy = {}, this.copy.width = this.selectArea.x2, this.copy.height = this.selectArea.y2, this.canvas_.width = this.copy.width, this.canvas_.height = this.copy.height, this.ctx_.clearRect(0, 0, this.canvas_.width, this.canvas_.height), this.ctx_.putImageData(this.copyLayerData, 0, 
  0)) : alert("\ubcf5\uc0ac\ud560 \uc601\uc5ed\uc744 \uc120\ud0dd\ud558\uc138\uc694.");
};
Entry.Painter.prototype.edit_cut = function() {
  this.selectArea ? (this.clearHandle(), this.selectedObject && delete this.selectedObject, this.copyLayerData = this.ctx.getImageData(this.selectArea.x1, this.selectArea.y1, this.selectArea.x2, this.selectArea.y2), this.copy = {}, this.copy.width = this.selectArea.x2, this.copy.height = this.selectArea.y2, this.canvas_.width = this.copy.width, this.canvas_.height = this.copy.height, this.ctx_.clearRect(0, 0, this.canvas_.width, this.canvas_.height), this.ctx_.putImageData(this.copyLayerData, 0, 
  0), this.ctx.clearRect(this.selectArea.x1, this.selectArea.y1, this.selectArea.x2, this.selectArea.y2), this.colorLayerData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height), this.reloadContext(), this.file.modified = !0) : alert("\uc790\ub97c \uc601\uc5ed\uc744 \uc120\ud0dd\ud558\uc138\uc694.");
};
Entry.Painter.prototype.edit_paste = function() {
  var b = new Image;
  b.src = this.canvas_.toDataURL();
  var a = this;
  b.onload = function(b) {
    b = new createjs.Bitmap(b.target);
    b.x = a.canvas.width / 2;
    b.y = a.canvas.height / 2;
    b.regX = a.copy.width / 2 | 0;
    b.regY = a.copy.height / 2 | 0;
    b.id = Entry.generateHash();
    a.objectContainer.addChild(b);
    a.selectObject(b, !0);
  };
  this.file.modified = !0;
};
Entry.Painter.prototype.edit_select = function() {
  this.clearHandle();
  this.selectedObject && delete this.selectedObject;
  this.copyLayerData = this.ctx.getImageData(this.selectArea.x1, this.selectArea.y1, this.selectArea.x2, this.selectArea.y2);
  this.copy = {};
  this.copy.width = this.selectArea.x2;
  this.copy.height = this.selectArea.y2;
  this.canvas_.width = this.copy.width;
  this.canvas_.height = this.copy.height;
  this.ctx_.clearRect(0, 0, this.canvas_.width, this.canvas_.height);
  this.ctx_.putImageData(this.copyLayerData, 0, 0);
  this.ctx.clearRect(this.selectArea.x1, this.selectArea.y1, this.selectArea.x2, this.selectArea.y2);
  this.colorLayerData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  this.ctx.putImageData(this.colorLayerData, 0, 0);
  var b = new Image;
  b.src = this.canvas.toDataURL();
  var a = this;
  b.onload = function(b) {
    b = new createjs.Bitmap(b.target);
    a.objectContainer.removeAllChildren();
    a.objectContainer.addChild(b);
    b = new Image;
    b.src = a.canvas_.toDataURL();
    b.onload = function(b) {
      b = new createjs.Bitmap(b.target);
      b.x = a.selectArea.x1 + a.copy.width / 2;
      b.y = a.selectArea.y1 + a.copy.height / 2;
      b.regX = a.copy.width / 2 | 0;
      b.regY = a.copy.height / 2 | 0;
      b.id = Entry.generateHash();
      b.name = b.id;
      a.objectContainer.addChild(b);
      a.selectObject(b, !0);
    };
  };
};
Entry.Painter.prototype.move_erase = function(b) {
  b = new createjs.Point(this.oldPt.x + this.stage.mouseX >> 1, this.oldPt.y + this.stage.mouseY >> 1);
  this.eraser.graphics.setStrokeStyle(this.stroke.thickness, "round").beginStroke("#ffffff").moveTo(b.x, b.y).curveTo(this.oldPt.x, this.oldPt.y, this.oldMidPt.x, this.oldMidPt.y);
  this.oldPt.x = this.stage.mouseX;
  this.oldPt.y = this.stage.mouseY;
  this.oldMidPt.x = b.x;
  this.oldMidPt.y = b.y;
  this.file.modified = !0;
  this.stage.update();
};
Entry.Painter.prototype.settingShapeBlur = function() {
  this.objectWidthInput.blur();
  this.objectHeightInput.blur();
  this.objectRotateInput.blur();
};
Entry.Painter.prototype.stagemousedown = function(b) {
  "picture" == Entry.playground.getViewMode() && (this.settingShapeBlur(), this.oldPt = new createjs.Point(b.stageX, b.stageY), this.oldMidPt = this.oldPt.clone(), "select" === this.toolbox.selected ? this.stage.addChild(this._handle) : "spoid" === this.toolbox.selected ? this.pickStrokeColor(b) : "text" === this.toolbox.selected ? (this.showInputField(b), this.stage.update()) : "erase" === this.toolbox.selected ? (this.createEraser(), this.stroke.enabled = !0) : "fill" === this.toolbox.selected ? 
  this.fill() : "cursor" !== this.toolbox.selected && (this.createBrush(), this.stroke.enabled = !0));
};
Entry.Painter.prototype.stagemousemove = function(b) {
  "picture" == Entry.playground.getViewMode() && ("select" === this.toolbox.selected && -1 < this.stage.getChildIndex(this._handle) ? (this.selectArea.x1 = this.oldPt.x, this.selectArea.y1 = this.oldPt.y, this.selectArea.x2 = b.stageX - this.oldPt.x, this.selectArea.y2 = b.stageY - this.oldPt.y, this.updateHandle_()) : this.stroke.enabled && (this.doCommand(), "pen" === this.toolbox.selected ? this.move_pen(b) : "line" === this.toolbox.selected ? this.move_line(b) : "rect" === this.toolbox.selected ? 
  this.move_rect(b) : "circle" === this.toolbox.selected ? this.move_circle(b) : "erase" === this.toolbox.selected && this.move_erase(b)), this.painterTopStageXY.innerHTML = "x:" + b.stageX.toFixed(1) + ", y:" + b.stageY.toFixed(1));
};
Entry.Painter.prototype.stagemouseup = function(b) {
  "picture" == Entry.playground.getViewMode() && ("select" === this.toolbox.selected ? (this.selectArea.x1 = this.oldPt.x, this.selectArea.y1 = this.oldPt.y, this.selectArea.x2 = b.stageX - this.oldPt.x, this.selectArea.y2 = b.stageY - this.oldPt.y, this.stage.removeChild(this._handle), this.stage.update(), 0 < this.selectArea.x2 && 0 < this.selectArea.y2 && this.edit_select(), this.selectToolbox("cursor")) : "cursor" !== this.toolbox.selected && this.stroke.enabled && (-1 < this.objectContainer.getChildIndex(this.eraser) && 
  this.eraser.graphics.endStroke(), -1 < this.objectContainer.getChildIndex(this.brush) && this.brush.graphics.endStroke(), this.clearHandle(), this.platten(), this.stroke.enabled = !1, this.checkCommand()));
};
Entry.Painter.prototype.file_save = function(b) {
  this.clearHandle();
  this.transparent();
  this.trim();
  var a = this.canvas_.toDataURL();
  Entry.dispatchEvent("saveCanvasImage", {file:b ? this.file_ : this.file, image:a});
  this.file.modified = !1;
};
Entry.Painter.prototype.transparent = function() {
  var b = this.canvas.width, a = this.canvas.height;
  this.colorLayerData = this.ctx.getImageData(0, 0, b, a);
  var c = b * (a - 1) * 4, d = 4 * (b - 1), e = 4 * (b * a - 1);
  this.matchColorOnly(0, 255, 255, 255) ? this.fillTransparent(1, 1) : this.matchColorOnly(c, 255, 255, 255) ? this.fillTransparent(1, a) : this.matchColorOnly(d, 255, 255, 255) ? this.fillTransparent(b, 1) : this.matchColorOnly(e, 255, 255, 255) && this.fillTransparent(b, a);
};
Entry.Painter.prototype.fillTransparent = function(b, a) {
  this.stage.mouseX = b;
  this.stage.mouseY = a;
  this.stroke.transparent = !0;
  this.fill();
};
Entry.Painter.prototype.trim = function() {
  var b = this.canvas.width, a = this.ctx.getImageData(0, 0, b, this.canvas.height), c = a.data.length, d, e = null, f = null, g = null, h = null, k;
  for (d = 0;d < c;d += 4) {
    0 !== a.data[d + 3] && (g = d / 4 % b, k = ~~(d / 4 / b), null === e && (e = k), null === f ? f = g : g < f && (f = g), null === h ? h = k : h < k && (h = k));
  }
  b = h - e;
  a = g - f;
  c = null;
  0 === b || 0 === a ? (c = this.ctx.getImageData(0, 0, 1, 1), c.data[0] = 255, c.data[1] = 255, c.data[2] = 255, c.data[3] = 255, this.canvas_.width = 1, this.canvas_.height = 1) : (c = this.ctx.getImageData(f, e, a, b), this.canvas_.width = a, this.canvas_.height = b);
  this.ctx_.putImageData(c, 0, 0);
};
Entry.Painter.prototype.showInputField = function(b) {
  this.inputField ? (Entry.dispatchEvent("textUpdate"), delete this.inputField) : (this.initCommand(), this.doCommand(), this.inputField = new CanvasInput({canvas:document.getElementById("entryPainterCanvas"), fontSize:20, fontFamily:this.font.name, fontColor:"#000", width:650, padding:8, borderWidth:1, borderColor:"#000", borderRadius:3, boxShadow:"1px 1px 0px #fff", innerShadow:"0px 0px 5px rgba(0, 0, 0, 0.5)", x:b.stageX, y:b.stageY, onsubmit:function() {
    Entry.dispatchEvent("textUpdate");
  }}), this.inputField.show());
};
Entry.Painter.prototype.addPicture = function(b) {
  this.initCommand();
  var a = new Image;
  a.id = Entry.generateHash();
  a.src = b.fileurl ? b.fileurl : Entry.defaultPath + "/uploads/" + b.filename.substring(0, 2) + "/" + b.filename.substring(2, 4) + "/image/" + b.filename + ".png";
  var c = this;
  a.onload = function(a) {
    c.addImage(a.target);
    c.selectToolbox("cursor");
  };
};
Entry.Painter.prototype.initCoordinator = function() {
  var b = new createjs.Container, a = new createjs.Bitmap(Entry.mediaFilePath + "/workspace_coordinate.png");
  b.addChild(a);
  this.stage.addChild(b);
  b.visible = !1;
  this.coordinator = b;
};
Entry.Painter.prototype.toggleCoordinator = function() {
  this.coordinator.visible = !this.coordinator.visible;
  this.stage.update();
};
Entry.Painter.prototype.initDashedLine = function() {
  createjs.Graphics.prototype.dashedLineTo = function(b, a, c, d, e) {
    this.moveTo(b, a);
    var f = c - b, g = d - a;
    e = Math.floor(Math.sqrt(f * f + g * g) / e);
    for (var f = f / e, g = g / e, h = 0;h++ < e;) {
      b += f, a += g, this[0 === h % 2 ? "moveTo" : "lineTo"](b, a);
    }
    this[0 === h % 2 ? "moveTo" : "lineTo"](c, d);
    return this;
  };
  createjs.Graphics.prototype.drawDashedRect = function(b, a, c, d, e) {
    this.moveTo(b, a);
    c = b + c;
    d = a + d;
    this.dashedLineTo(b, a, c, a, e);
    this.dashedLineTo(c, a, c, d, e);
    this.dashedLineTo(c, d, b, d, e);
    this.dashedLineTo(b, d, b, a, e);
    return this;
  };
  createjs.Graphics.prototype.drawResizableDashedRect = function(b, a, c, d, e, f) {
    this.moveTo(b, a);
    c = b + c;
    d = a + d;
    this.dashedLineTo(b + f, a, c - f, a, e);
    this.dashedLineTo(c, a + f, c, d - f, e);
    this.dashedLineTo(c - f, d, b + f, d, e);
    this.dashedLineTo(b, d - f, b, a + f, e);
    return this;
  };
};
Entry.Painter.prototype.generateView = function(b) {
  var a = this;
  this.view_ = b;
  if (!Entry.type || "workspace" == Entry.type) {
    this.view_.addClass("entryPainterWorkspace");
    var c = Entry.createElement("div", "entryPainterTop");
    c.addClass("entryPlaygroundPainterTop");
    this.view_.appendChild(c);
    var d = Entry.createElement("div", "entryPainterToolbox");
    d.addClass("entryPlaygroundPainterToolbox");
    this.view_.appendChild(d);
    var e = Entry.createElement("div", "entryPainterToolboxTop");
    e.addClass("entryPainterToolboxTop");
    d.appendChild(e);
    var f = Entry.createElement("div", "entryPainterContainer");
    f.addClass("entryPlaygroundPainterContainer");
    this.view_.appendChild(f);
    e = Entry.createElement("canvas", "entryPainterCanvas");
    e.width = 960;
    e.height = 540;
    e.addClass("entryPlaygroundPainterCanvas");
    f.appendChild(e);
    e = Entry.createElement("canvas", "entryPainterCanvas_");
    e.addClass("entryRemove");
    e.width = 960;
    e.height = 540;
    f.appendChild(e);
    var g = Entry.createElement("div", "entryPainterAttr");
    g.addClass("entryPlaygroundPainterAttr");
    this.view_.appendChild(g);
    this.flipObject = Entry.createElement("div", "entryPictureFlip");
    this.flipObject.addClass("entryPlaygroundPainterFlip");
    g.appendChild(this.flipObject);
    e = Entry.createElement("div", "entryPictureFlipX");
    e.title = "\uc88c\uc6b0\ub4a4\uc9d1\uae30";
    e.bindOnClick(function() {
      a.selectedObject && (a.selectedObject.scaleX *= -1, a.selectedObject.text ? a.selectTextObject(a.selectedObject) : a.selectObject(a.selectedObject), a.updateImageHandle(), a.stage.update());
    });
    e.addClass("entryPlaygroundPainterFlipX");
    this.flipObject.appendChild(e);
    e = Entry.createElement("div", "entryPictureFlipY");
    e.title = "\uc0c1\ud558\ub4a4\uc9d1\uae30";
    e.bindOnClick(function() {
      a.selectedObject && (a.selectedObject.scaleY *= -1, a.selectedObject.text ? a.selectTextObject(a.selectedObject) : a.selectObject(a.selectedObject), a.updateImageHandle(), a.stage.update());
    });
    e.addClass("entryPlaygroundPainterFlipY");
    this.flipObject.appendChild(e);
    Entry.addEventListener("windowResized", function(a) {
      var c = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
      a = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
      var d = parseInt(document.getElementById("entryCanvas").style.width), c = c - (d + 240), d = a - 349;
      b.style.width = c + "px";
      f.style.width = c - 54 + "px";
      f.style.height = d + "px";
      g.style.top = d + 30 + "px";
      g.style.height = a - d + "px";
    });
    var h = Entry.createElement("nav", "entryPainterTopMenu");
    h.addClass("entryPlaygroundPainterTopMenu");
    c.appendChild(h);
    e = Entry.createElement("ul");
    h.appendChild(e);
    var k = Entry.createElement("li");
    h.appendChild(k);
    h = Entry.createElement("a", "entryPainterTopMenuFileNew");
    h.bindOnClick(function() {
      a.newPicture();
    });
    h.addClass("entryPlaygroundPainterTopMenuFileNew");
    h.innerHTML = Lang.Workspace.new_picture;
    k.appendChild(h);
    h = Entry.createElement("li", "entryPainterTopMenuFile");
    h.addClass("entryPlaygroundPainterTopMenuFile");
    h.innerHTML = Lang.Workspace.painter_file;
    e.appendChild(h);
    k = Entry.createElement("ul");
    h.appendChild(k);
    h = Entry.createElement("li");
    k.appendChild(h);
    var l = Entry.createElement("a", "entryPainterTopMenuFileSave");
    l.bindOnClick(function() {
      a.file_save(!1);
    });
    l.addClass("entryPainterTopMenuFileSave");
    l.innerHTML = Lang.Workspace.painter_file_save;
    h.appendChild(l);
    h = Entry.createElement("li");
    k.appendChild(h);
    k = Entry.createElement("a", "entryPainterTopMenuFileSaveAs");
    k.bindOnClick(function() {
      a.file.mode = "new";
      a.file_save(!1);
    });
    k.addClass("entryPlaygroundPainterTopMenuFileSaveAs");
    k.innerHTML = Lang.Workspace.painter_file_saveas;
    h.appendChild(k);
    k = Entry.createElement("li", "entryPainterTopMenuEdit");
    k.addClass("entryPlaygroundPainterTopMenuEdit");
    k.innerHTML = Lang.Workspace.painter_edit;
    e.appendChild(k);
    e = Entry.createElement("ul");
    k.appendChild(e);
    k = Entry.createElement("li");
    e.appendChild(k);
    h = Entry.createElement("a", "entryPainterTopMenuEditImportLink");
    h.bindOnClick(function() {
      Entry.dispatchEvent("openPictureImport");
    });
    h.addClass("entryPainterTopMenuEditImport");
    h.innerHTML = Lang.Workspace.get_file;
    k.appendChild(h);
    k = Entry.createElement("li");
    e.appendChild(k);
    h = Entry.createElement("a", "entryPainterTopMenuEditCopy");
    h.bindOnClick(function() {
      a.edit_copy();
    });
    h.addClass("entryPlaygroundPainterTopMenuEditCopy");
    h.innerHTML = Lang.Workspace.copy_file;
    k.appendChild(h);
    k = Entry.createElement("li");
    e.appendChild(k);
    h = Entry.createElement("a", "entryPainterTopMenuEditCut");
    h.bindOnClick(function() {
      a.edit_cut();
    });
    h.addClass("entryPlaygroundPainterTopMenuEditCut");
    h.innerHTML = Lang.Workspace.cut_picture;
    k.appendChild(h);
    k = Entry.createElement("li");
    e.appendChild(k);
    h = Entry.createElement("a", "entryPainterTopMenuEditPaste");
    h.bindOnClick(function() {
      a.edit_paste();
    });
    h.addClass("entryPlaygroundPainterTopMenuEditPaste");
    h.innerHTML = Lang.Workspace.paste_picture;
    k.appendChild(h);
    k = Entry.createElement("li");
    e.appendChild(k);
    e = Entry.createElement("a", "entryPainterTopMenuEditEraseAll");
    e.addClass("entryPlaygroundPainterTopMenuEditEraseAll");
    e.innerHTML = Lang.Workspace.remove_all;
    e.bindOnClick(function() {
      a.clearCanvas();
    });
    k.appendChild(e);
    this.painterTopStageXY = e = Entry.createElement("div", "entryPainterTopStageXY");
    e.addClass("entryPlaygroundPainterTopStageXY");
    c.appendChild(e);
    e = Entry.createElement("ul", "entryPainterTopToolbar");
    e.addClass("entryPlaygroundPainterTopToolbar");
    c.appendChild(e);
    c = Entry.createElement("li", "entryPainterTopToolbarUndo");
    c.bindOnClick(function() {
    });
    c.addClass("entryPlaygroundPainterTopToolbar");
    e.appendChild(c);
    c = Entry.createElement("li", "entryPainterTopToolbarRedo");
    c.bindOnClick(function() {
    });
    c.addClass("entryPlaygroundPainterTopToolbar");
    e.appendChild(c);
    c = Entry.createElement("ul");
    c.addClass("entryPlaygroundPainterToolboxContainer");
    d.appendChild(c);
    this.toolboxCursor = Entry.createElement("li", "entryPainterToolboxCursor");
    this.toolboxCursor.title = "\uc774\ub3d9";
    this.toolboxCursor.bindOnClick(function() {
      a.selectToolbox("cursor");
    });
    this.toolboxCursor.addClass("entryPlaygroundPainterToolboxCursor");
    c.appendChild(this.toolboxCursor);
    this.toolboxSelect = Entry.createElement("li", "entryPainterToolboxSelect");
    this.toolboxSelect.title = "\uc790\ub974\uae30";
    this.toolboxSelect.bindOnClick(function() {
      a.selectToolbox("select");
    });
    this.toolboxSelect.addClass("entryPlaygroundPainterToolboxSelect");
    c.appendChild(this.toolboxSelect);
    this.toolboxPen = Entry.createElement("li", "entryPainterToolboxPen");
    this.toolboxPen.title = "\ud39c";
    this.toolboxPen.bindOnClick(function() {
      a.selectToolbox("pen");
    });
    this.toolboxPen.addClass("entryPlaygroundPainterToolboxPen");
    c.appendChild(this.toolboxPen);
    this.toolboxLine = Entry.createElement("li", "entryPainterToolboxLine");
    this.toolboxLine.title = "\uc9c1\uc120";
    this.toolboxLine.bindOnClick(function() {
      a.selectToolbox("line");
    });
    this.toolboxLine.addClass("entryPlaygroundPainterToolboxLine");
    c.appendChild(this.toolboxLine);
    this.toolboxRect = Entry.createElement("li", "entryPainterToolboxRect");
    this.toolboxRect.title = "\uc0ac\uac01\ud615";
    this.toolboxRect.bindOnClick(function() {
      a.selectToolbox("rect");
    });
    this.toolboxRect.addClass("entryPlaygroundPainterToolboxRect");
    c.appendChild(this.toolboxRect);
    this.toolboxCircle = Entry.createElement("li", "entryPainterToolboxCircle");
    this.toolboxCircle.title = "\uc6d0";
    this.toolboxCircle.bindOnClick(function() {
      a.selectToolbox("circle");
    });
    this.toolboxCircle.addClass("entryPlaygroundPainterToolboxCircle");
    c.appendChild(this.toolboxCircle);
    this.toolboxText = Entry.createElement("li", "entryPainterToolboxText");
    this.toolboxText.title = "\uae00\uc0c1\uc790";
    this.toolboxText.bindOnClick(function() {
      a.selectToolbox("text");
    });
    this.toolboxText.addClass("entryPlaygroundPainterToolboxText");
    c.appendChild(this.toolboxText);
    this.toolboxFill = Entry.createElement("li", "entryPainterToolboxFill");
    this.toolboxFill.bindOnClick(function() {
      a.selectToolbox("fill");
    });
    this.toolboxFill.addClass("entryPlaygroundPainterToolboxFill");
    c.appendChild(this.toolboxFill);
    this.toolboxErase = Entry.createElement("li", "entryPainterToolboxErase");
    this.toolboxErase.title = "\uc9c0\uc6b0\uae30";
    this.toolboxErase.bindOnClick(function() {
      a.selectToolbox("erase");
    });
    this.toolboxErase.addClass("entryPlaygroundPainterToolboxErase");
    c.appendChild(this.toolboxErase);
    d = Entry.createElement("li", "entryPainterToolboxCoordinate");
    d.title = "\uc88c\ud45c";
    d.bindOnClick(function() {
      a.toggleCoordinator();
    });
    d.addClass("entryPlaygroundPainterToolboxCoordinate");
    c.appendChild(d);
    this.attrResizeArea = Entry.createElement("fieldset", "painterAttrResize");
    this.attrResizeArea.addClass("entryPlaygroundPainterAttrResize");
    g.appendChild(this.attrResizeArea);
    d = Entry.createElement("legend");
    d.innerHTML = Lang.Workspace.picture_size;
    this.attrResizeArea.appendChild(d);
    d = Entry.createElement("div");
    d.addClass("entryPlaygroundPainterAttrResizeX");
    this.attrResizeArea.appendChild(d);
    c = Entry.createElement("div");
    c.addClass("entryPlaygroundPainterAttrResizeXTop");
    c.innerHTML = "X";
    d.appendChild(c);
    this.objectWidthInput = Entry.createElement("input", "entryPainterAttrWidth");
    this.objectWidthInput.onblur = function() {
      if (isNaN(this.value)) {
        return alert("\uc22b\uc790\ub9cc \uc785\ub825 \uac00\ub2a5\ud569\ub2c8\ub2e4."), !1;
      }
      a.handle.width = this.value;
      a.updateImageHandle();
    };
    this.objectWidthInput.addClass("entryPlaygroundPainterNumberInput");
    d.appendChild(this.objectWidthInput);
    d = Entry.createElement("div");
    d.addClass("entryPlaygroundPainterSizeText");
    d.innerHTML = "x";
    this.attrResizeArea.appendChild(d);
    d = Entry.createElement("div");
    d.addClass("entryPlaygroundAttrReiszeY");
    this.attrResizeArea.appendChild(d);
    c = Entry.createElement("div");
    c.addClass("entryPlaygroundPainterAttrResizeYTop");
    c.innerHTML = "Y";
    d.appendChild(c);
    this.objectHeightInput = Entry.createElement("input", "entryPainterAttrHeight");
    this.objectHeightInput.onblur = function() {
      if (isNaN(this.value)) {
        return alert("\uc22b\uc790\ub9cc \uc785\ub825 \uac00\ub2a5\ud569\ub2c8\ub2e4."), !1;
      }
      a.handle.height = this.value;
      a.updateImageHandle();
    };
    this.objectHeightInput.addClass("entryPlaygroundPainterNumberInput");
    d.appendChild(this.objectHeightInput);
    this.attrRotateArea = Entry.createElement("div", "painterAttrRotateArea");
    this.attrRotateArea.addClass("painterAttrRotateArea");
    g.appendChild(this.attrRotateArea);
    d = Entry.createElement("fieldset", "entryPainterAttrRotate");
    d.addClass("entryPlaygroundPainterAttrRotate");
    this.attrRotateArea.appendChild(d);
    c = Entry.createElement("div");
    c.addClass("painterAttrRotateName");
    c.innerHTML = Lang.Workspace.picture_rotation;
    this.attrRotateArea.appendChild(c);
    c = Entry.createElement("div");
    c.addClass("painterAttrRotateTop");
    c.innerHTML = "\u03bf";
    d.appendChild(c);
    this.objectRotateInput = Entry.createElement("input", "entryPainterAttrDegree");
    this.objectRotateInput.onblur = function() {
      if (isNaN(this.value)) {
        return alert("\uc22b\uc790\ub9cc \uc785\ub825 \uac00\ub2a5\ud569\ub2c8\ub2e4."), !1;
      }
      360 <= this.value ? this.value %= 360 : 0 > this.value && (this.value = 360 + this.value % 360);
      a.handle.rotation = this.value;
      a.updateImageHandle();
    };
    this.objectRotateInput.addClass("entryPlaygroundPainterNumberInput");
    this.objectRotateInput.defaultValue = "0";
    d.appendChild(this.objectRotateInput);
    this.attrColorArea = Entry.createElement("fieldset", "entryPainterAttrColor");
    this.attrColorArea.addClass("entryPlaygroundPainterAttrColor");
    g.appendChild(this.attrColorArea);
    var q = Entry.createElement("div");
    q.addClass("entryPlaygroundPainterAttrColorContainer");
    this.attrColorArea.appendChild(q);
    this.attrCircleArea = Entry.createElement("div");
    this.attrCircleArea.addClass("painterAttrCircleArea");
    g.appendChild(this.attrCircleArea);
    d = Entry.createElement("div", "entryPainterAttrCircle");
    d.addClass("painterAttrCircle");
    this.attrCircleArea.appendChild(d);
    this.attrCircleArea.painterAttrCircle = d;
    d = Entry.createElement("input", "entryPainterAttrCircleInput");
    d.value = "#000000";
    d.addClass("painterAttrCircleInput");
    this.attrCircleArea.appendChild(d);
    this.attrColorSpoid = Entry.createElement("div");
    this.attrColorSpoid.bindOnClick(function() {
      a.selectToolbox("spoid");
    });
    this.attrColorSpoid.addClass("painterAttrColorSpoid");
    g.appendChild(this.attrColorSpoid);
    Entry.getColourCodes().forEach(function(b) {
      var c = Entry.createElement("div");
      c.addClass("entryPlaygroundPainterAttrColorElement");
      "transparent" === b ? c.style.backgroundImage = "url(" + (Entry.mediaFilePath + "/transparent.png") + ")" : c.style.backgroundColor = b;
      c.bindOnClick(function(c) {
        "transparent" === b ? (a.stroke.transparent = !0, a.stroke.lineColor = "#ffffff") : (a.stroke.transparent = !1, r && (document.getElementById("entryPainterShapeBackgroundColor").style.backgroundColor = b, a.stroke.fillColor = b), r || (document.getElementById("entryPainterShapeLineColor").style.backgroundColor = b, a.stroke.lineColor = b));
        document.getElementById("entryPainterAttrCircle").style.backgroundColor = a.stroke.lineColor;
        document.getElementById("entryPainterAttrCircleInput").value = b;
      });
      q.appendChild(c);
    });
    this.attrThickArea = Entry.createElement("div", "painterAttrThickArea");
    this.attrThickArea.addClass("entryPlaygroundentryPlaygroundPainterAttrThickArea");
    g.appendChild(this.attrThickArea);
    d = Entry.createElement("legend");
    d.addClass("painterAttrThickName");
    d.innerHTML = Lang.Workspace.thickness;
    this.attrThickArea.appendChild(d);
    var n = Entry.createElement("fieldset", "entryPainterAttrThick");
    n.addClass("entryPlaygroundPainterAttrThick");
    this.attrThickArea.appendChild(n);
    d = Entry.createElement("div");
    d.addClass("paintAttrThickTop");
    n.appendChild(d);
    e = Entry.createElement("select", "entryPainterAttrThick");
    e.addClass("entryPlaygroundPainterAttrThickInput");
    e.size = "1";
    e.onchange = function(b) {
      a.stroke.thickness = b.target.value;
    };
    for (d = 1;10 >= d;d++) {
      c = Entry.createElement("option"), c.value = d, c.innerHTML = d, e.appendChild(c);
    }
    n.appendChild(e);
    d = Entry.createElement("div", "entryPainterShapeLineColor");
    d.addClass("painterAttrShapeLineColor");
    c = Entry.createElement("div", "entryPainterShapeInnerBackground");
    c.addClass("painterAttrShapeInnerBackground");
    d.appendChild(c);
    n.appendChild(d);
    this.attrThickArea.painterAttrShapeLineColor = d;
    n.bindOnClick(function() {
      m.style.zIndex = "1";
      this.style.zIndex = "10";
      r = !1;
    });
    this.attrBackgroundArea = Entry.createElement("div", "painterAttrBackgroundArea");
    this.attrBackgroundArea.addClass("entryPlaygroundPainterBackgroundArea");
    g.appendChild(this.attrBackgroundArea);
    d = Entry.createElement("fieldset", "entryPainterAttrbackground");
    d.addClass("entryPlaygroundPainterAttrBackground");
    this.attrBackgroundArea.appendChild(d);
    c = Entry.createElement("div");
    c.addClass("paintAttrBackgroundTop");
    d.appendChild(c);
    var m = Entry.createElement("div", "entryPainterShapeBackgroundColor");
    m.addClass("painterAttrShapeBackgroundColor");
    this.attrBackgroundArea.painterAttrShapeBackgroundColor = m;
    c.appendChild(m);
    var r = !1;
    m.bindOnClick(function(a) {
      n.style.zIndex = "1";
      this.style.zIndex = "10";
      r = !0;
    });
    this.attrFontArea = Entry.createElement("div", "painterAttrFont");
    this.attrFontArea.addClass("entryPlaygroundPainterAttrFont");
    g.appendChild(this.attrFontArea);
    e = Entry.createElement("div");
    e.addClass("entryPlaygroundPainterAttrTop");
    this.attrFontArea.appendChild(e);
    d = Entry.createElement("div");
    d.addClass("entryPlaygroundPaintAttrTop_");
    e.appendChild(d);
    d = Entry.createElement("legend");
    d.addClass("panterAttrFontTitle");
    d.innerHTML = Lang.Workspace.textStyle;
    k = Entry.createElement("select", "entryPainterAttrFontName");
    k.addClass("entryPlaygroundPainterAttrFontName");
    k.size = "1";
    k.onchange = function(b) {
      a.font.name = b.target.value;
    };
    for (d = 0;d < Entry.fonts.length;d++) {
      h = Entry.fonts[d], c = Entry.createElement("option"), c.value = h.family, c.innerHTML = h.name, k.appendChild(c);
    }
    e.appendChild(k);
    e = Entry.createElement("div");
    e.addClass("painterAttrFontSizeArea");
    this.attrFontArea.appendChild(e);
    d = Entry.createElement("div");
    d.addClass("painterAttrFontSizeTop");
    e.appendChild(d);
    k = Entry.createElement("select", "entryPainterAttrFontSize");
    k.addClass("entryPlaygroundPainterAttrFontSize");
    k.size = "1";
    k.onchange = function(b) {
      a.font.size = b.target.value;
    };
    for (d = 20;72 >= d;d++) {
      c = Entry.createElement("option"), c.value = d, c.innerHTML = d, k.appendChild(c);
    }
    e.appendChild(k);
    e = Entry.createElement("div");
    e.addClass("entryPlaygroundPainterAttrFontStyleArea");
    this.attrFontArea.appendChild(e);
    d = Entry.createElement("div");
    d.addClass("entryPlaygroundPainterAttrFontTop");
    e.appendChild(d);
    k = Entry.createElement("select", "entryPainterAttrFontStyle");
    k.addClass("entryPlaygroundPainterAttrFontStyle");
    k.size = "1";
    k.onchange = function(b) {
      a.font.style = b.target.value;
    };
    h = [{label:"\ubcf4\ud1b5", value:"normal"}, {label:"\uad75\uac8c", value:"bold"}, {label:"\uae30\uc6b8\uc784", value:"italic"}];
    for (d = 0;d < h.length;d++) {
      l = h[d], c = Entry.createElement("option"), c.value = l.value, c.innerHTML = l.label, k.appendChild(c);
    }
    e.appendChild(k);
    this.attrLineArea = Entry.createElement("div", "painterAttrLineStyle");
    this.attrLineArea.addClass("entryPlaygroundPainterAttrLineStyle");
    g.appendChild(this.attrLineArea);
    var t = Entry.createElement("div");
    t.addClass("entryPlaygroundPainterAttrLineStyleLine");
    this.attrLineArea.appendChild(t);
    var u = Entry.createElement("div");
    u.addClass("entryPlaygroundPaitnerAttrLineArea");
    this.attrLineArea.appendChild(u);
    d = Entry.createElement("div");
    d.addClass("entryPlaygroundPainterAttrLineStyleLine1");
    u.appendChild(d);
    d.value = "line";
    var v = Entry.createElement("div");
    v.addClass("painterAttrLineStyleBackgroundLine");
    t.bindOnClick(function(a) {
      u.removeClass("entryRemove");
    });
    u.blur = function(a) {
      this.addClass("entryRemove");
    };
    u.onmouseleave = function(a) {
      this.addClass("entryRemove");
    };
    d.bindOnClick(function(a) {
      this.attrLineArea.removeClass(t);
      this.attrLineArea.appendChild(v);
      this.attrLineArea.onchange(a);
      u.blur();
    });
    v.bindOnClick(function(a) {
      u.removeClass("entryRemove");
    });
    this.attrLineArea.onchange = function(b) {
      a.stroke.style = b.target.value;
    };
    u.blur();
  }
};
Entry.Painter.prototype.restoreHandle = function() {
  this.selectedObject && !1 === this.handle.visible && (this.handle.visible = !0, this.stage.update());
};
Entry.Painter.prototype.initDisplay = function() {
  this.stroke.enabled = !1;
  this.toolboxCursor.addClass("entryPlaygroundPainterToolboxCursor");
  this.toolboxCursor.removeClass("entryToolboxCursorClicked");
  this.toolboxSelect.addClass("entryPlaygroundPainterToolboxSelect");
  this.toolboxSelect.removeClass("entryToolboxSelectClicked");
  this.toolboxPen.addClass("entryPlaygroundPainterToolboxPen");
  this.toolboxPen.removeClass("entryToolboxPenClicked");
  this.toolboxLine.addClass("entryPlaygroundPainterToolboxLine");
  this.toolboxLine.removeClass("entryToolboxLineClicked");
  this.toolboxRect.addClass("entryPlaygroundPainterToolboxRect");
  this.toolboxRect.removeClass("entryToolboxRectClicked");
  this.toolboxCircle.addClass("entryPlaygroundPainterToolboxCircle");
  this.toolboxCircle.removeClass("entryToolBoxCircleClicked");
  this.toolboxText.addClass("entryPlaygroundPainterToolboxText");
  this.toolboxText.removeClass("entryToolBoxTextClicked");
  this.toolboxFill.addClass("entryPlaygroundPainterToolboxFill");
  this.toolboxFill.removeClass("entryToolBoxFillClicked");
  this.toolboxErase.addClass("entryPlaygroundPainterToolboxErase");
  this.toolboxErase.removeClass("entryToolBoxEraseClicked");
  this.attrColorSpoid.addClass("painterAttrColorSpoid");
  this.attrColorSpoid.removeClass("painterAttrColorSpoidClicked");
  this.attrResizeArea.addClass("entryRemove");
  this.attrRotateArea.addClass("entryRemove");
  this.attrThickArea.addClass("entryRemove");
  this.attrFontArea.addClass("entryRemove");
  this.attrLineArea.addClass("entryRemove");
  this.attrColorArea.addClass("entryRemove");
  this.attrCircleArea.addClass("entryRemove");
  this.attrColorSpoid.addClass("entryRemove");
  this.attrFontArea.addClass("entryRemove");
  this.attrBackgroundArea.addClass("entryRemove");
  this.flipObject.addClass("entryRemove");
  this.attrThickArea.painterAttrShapeLineColor.addClass("entryRemove");
  this.attrBackgroundArea.painterAttrShapeBackgroundColor.addClass("entryRemove");
  this.attrCircleArea.painterAttrCircle.addClass("entryRemove");
  this.inputField && !this.inputField._isHidden && (this.inputField.hide(), this.stage.update());
};
Entry.Painter.prototype.selectToolbox = function(b) {
  this.toolbox.selected = b;
  "erase" != b && $(".entryPlaygroundPainterContainer").removeClass("dd");
  this.initDisplay();
  "cursor" !== b && this.clearHandle();
  "text" !== b && this.inputField && delete this.inputField;
  switch(b) {
    case "cursor":
      this.restoreHandle();
      this.toolboxCursor.addClass("entryToolboxCursorClicked");
      this.attrResizeArea.removeClass("entryRemove");
      this.attrRotateArea.removeClass("entryRemove");
      this.flipObject.removeClass("entryRemove");
      break;
    case "select":
      this.toolboxSelect.addClass("entryToolboxSelectClicked");
      break;
    case "pen":
      this.toolboxPen.addClass("entryToolboxPenClicked");
      this.attrThickArea.removeClass("entryRemove");
      this.attrColorArea.removeClass("entryRemove");
      this.attrCircleArea.removeClass("entryRemove");
      this.attrColorSpoid.removeClass("entryRemove");
      this.attrThickArea.painterAttrShapeLineColor.removeClass("entryRemove");
      break;
    case "line":
      this.toolboxLine.addClass("entryToolboxLineClicked");
      this.attrThickArea.removeClass("entryRemove");
      this.attrColorArea.removeClass("entryRemove");
      this.attrCircleArea.removeClass("entryRemove");
      this.attrColorSpoid.removeClass("entryRemove");
      this.attrThickArea.painterAttrShapeLineColor.removeClass("entryRemove");
      break;
    case "rect":
      this.toolboxRect.addClass("entryToolboxRectClicked");
      this.attrThickArea.removeClass("entryRemove");
      this.attrColorArea.removeClass("entryRemove");
      this.attrCircleArea.removeClass("entryRemove");
      this.attrColorSpoid.removeClass("entryRemove");
      this.attrBackgroundArea.removeClass("entryRemove");
      this.attrThickArea.painterAttrShapeLineColor.removeClass("entryRemove");
      this.attrBackgroundArea.painterAttrShapeBackgroundColor.removeClass("entryRemove");
      break;
    case "circle":
      this.toolboxCircle.addClass("entryToolBoxCircleClicked");
      this.attrThickArea.removeClass("entryRemove");
      this.attrColorArea.removeClass("entryRemove");
      this.attrCircleArea.removeClass("entryRemove");
      this.attrColorSpoid.removeClass("entryRemove");
      this.attrThickArea.painterAttrShapeLineColor.removeClass("entryRemove");
      this.attrBackgroundArea.removeClass("entryRemove");
      this.attrBackgroundArea.painterAttrShapeBackgroundColor.removeClass("entryRemove");
      break;
    case "text":
      this.toolboxText.addClass("entryToolBoxTextClicked");
      this.attrFontArea.removeClass("entryRemove");
      this.attrColorArea.removeClass("entryRemove");
      this.attrCircleArea.removeClass("entryRemove");
      this.attrColorSpoid.removeClass("entryRemove");
      this.attrCircleArea.painterAttrCircle.removeClass("entryRemove");
      break;
    case "fill":
      this.toolboxFill.addClass("entryToolBoxFillClicked");
      this.attrColorArea.removeClass("entryRemove");
      this.attrCircleArea.removeClass("entryRemove");
      this.attrColorSpoid.removeClass("entryRemove");
      this.attrCircleArea.painterAttrCircle.removeClass("entryRemove");
      break;
    case "erase":
      $(".entryPlaygroundPainterContainer").addClass("dd");
      this.toolboxErase.addClass("entryToolBoxEraseClicked");
      this.attrThickArea.removeClass("entryRemove");
      break;
    case "spoid":
      this.attrColorArea.removeClass("entryRemove");
      this.attrCircleArea.removeClass("entryRemove");
      this.attrColorSpoid.removeClass("entryRemove");
      this.attrColorSpoid.removeClass("painterAttrColorSpoid");
      this.attrColorSpoid.addClass("painterAttrColorSpoidClicked");
      break;
    case "coordinate":
      this.toggleCoordinator();
  }
};
Entry.Playground = function() {
  this.menuBlocks_ = {};
  this.enableArduino = this.isTextBGMode_ = !1;
  this.viewMode_ = "default";
  Entry.addEventListener("textEdited", this.injectText);
  Entry.addEventListener("entryBlocklyChanged", this.editBlock);
  Entry.addEventListener("entryBlocklyMouseUp", this.mouseupBlock);
  Entry.addEventListener("hwChanged", this.updateHW);
};
Entry.Playground.prototype.generateView = function(b, a) {
  this.view_ = b;
  this.view_.addClass("entryPlayground");
  if (a && "workspace" != a) {
    "phone" == a && (this.view_.addClass("entryPlaygroundPhone"), c = Entry.createElement("div", "entryCategoryTab"), c.addClass("entryPlaygroundTabPhone"), Entry.view_.insertBefore(c, this.view_), this.generateTabView(c), this.tabView_ = c, c = Entry.createElement("div", "entryCurtain"), c.addClass("entryPlaygroundCurtainPhone"), c.addClass("entryRemove"), c.innerHTML = Lang.Workspace.cannot_edit_click_to_stop, c.bindOnClick(function() {
      Entry.engine.toggleStop();
    }), this.view_.appendChild(c), this.curtainView_ = c, Entry.pictureEditable && (c = Entry.createElement("div", "entryPicture"), c.addClass("entryPlaygroundPicturePhone"), c.addClass("entryRemove"), this.view_.appendChild(c), this.generatePictureView(c), this.pictureView_ = c), c = Entry.createElement("div", "entryText"), c.addClass("entryRemove"), this.view_.appendChild(c), this.generateTextView(c), this.textView_ = c, Entry.soundEditable && (c = Entry.createElement("div", "entrySound"), c.addClass("entryPlaygroundSoundWorkspacePhone"), 
    c.addClass("entryRemove"), this.view_.appendChild(c), this.generateSoundView(c), this.soundView_ = c), c = Entry.createElement("div", "entryDefault"), this.view_.appendChild(c), this.generateDefaultView(c), this.defaultView_ = c, c = Entry.createElement("div", "entryCode"), c.addClass("entryPlaygroundCodePhone"), this.view_.appendChild(c), this.generateCodeView(c), this.codeView_ = this.codeView_ = c, Entry.addEventListener("run", function(a) {
      Entry.playground.curtainView_.removeClass("entryRemove");
    }), Entry.addEventListener("stop", function(a) {
      Entry.playground.curtainView_.addClass("entryRemove");
    }));
  } else {
    this.view_.addClass("entryPlaygroundWorkspace");
    var c = Entry.createElement("div", "entryCategoryTab");
    c.addClass("entryPlaygroundTabWorkspace");
    this.view_.appendChild(c);
    this.generateTabView(c);
    this.tabView_ = c;
    c = Entry.createElement("div", "entryCurtain");
    c.addClass("entryPlaygroundCurtainWorkspace");
    c.addClass("entryRemove");
    var d = Lang.Workspace.cannot_edit_click_to_stop.split(".");
    c.innerHTML = d[0] + ".<br/>" + d[1];
    c.addEventListener("click", function() {
      Entry.engine.toggleStop();
    });
    this.view_.appendChild(c);
    this.curtainView_ = c;
    Entry.pictureEditable && (c = Entry.createElement("div", "entryPicture"), c.addClass("entryPlaygroundPictureWorkspace"), c.addClass("entryRemove"), this.view_.appendChild(c), this.generatePictureView(c), this.pictureView_ = c);
    c = Entry.createElement("div", "entryText");
    c.addClass("entryPlaygroundTextWorkspace");
    c.addClass("entryRemove");
    this.view_.appendChild(c);
    this.generateTextView(c);
    this.textView_ = c;
    Entry.soundEditable && (c = Entry.createElement("div", "entrySound"), c.addClass("entryPlaygroundSoundWorkspace"), c.addClass("entryRemove"), this.view_.appendChild(c), this.generateSoundView(c), this.soundView_ = c);
    c = Entry.createElement("div", "entryDefault");
    c.addClass("entryPlaygroundDefaultWorkspace");
    this.view_.appendChild(c);
    this.generateDefaultView(c);
    this.defaultView_ = c;
    c = Entry.createElement("div", "entryCode");
    c.addClass("entryPlaygroundCodeWorkspace");
    c.addClass("entryRemove");
    this.view_.appendChild(c);
    this.generateCodeView(c);
    this.codeView_ = c;
    d = Entry.createElement("div");
    d.addClass("entryPlaygroundResizeWorkspace", "entryRemove");
    this.resizeHandle_ = d;
    this.view_.appendChild(d);
    this.initializeResizeHandle(d);
    this.codeView_ = c;
    Entry.addEventListener("run", function(a) {
      Entry.playground.curtainView_.removeClass("entryRemove");
    });
    Entry.addEventListener("stop", function(a) {
      Entry.playground.curtainView_.addClass("entryRemove");
    });
  }
};
Entry.Playground.prototype.generateDefaultView = function(b) {
  return b;
};
Entry.Playground.prototype.generateTabView = function(b) {
  var a = Entry.createElement("ul");
  a.addClass("entryTabListWorkspace");
  this.tabList_ = a;
  b.appendChild(a);
  this.tabViewElements = {};
  b = Entry.createElement("li", "entryCodeTab");
  b.innerHTML = Lang.Workspace.tab_code;
  b.addClass("entryTabListItemWorkspace");
  b.addClass("entryTabSelected");
  a.appendChild(b);
  b.bindOnClick(function(a) {
    Entry.playground.changeViewMode("code");
  });
  this.tabViewElements.code = b;
  Entry.pictureEditable && (b = Entry.createElement("li", "entryPictureTab"), b.innerHTML = Lang.Workspace.tab_picture, b.addClass("entryTabListItemWorkspace"), a.appendChild(b), b.bindOnClick(function(a) {
    Entry.playground.changeViewMode("picture");
  }), this.tabViewElements.picture = b, b = Entry.createElement("li", "entryTextboxTab"), b.innerHTML = Lang.Workspace.tab_text, b.addClass("entryTabListItemWorkspace"), a.appendChild(b), b.bindOnClick(function(a) {
    Entry.playground.changeViewMode("text");
  }), this.tabViewElements.text = b, b.addClass("entryRemove"));
  Entry.soundEditable && (b = Entry.createElement("li", "entrySoundTab"), b.innerHTML = Lang.Workspace.tab_sound, b.addClass("entryTabListItemWorkspace"), a.appendChild(b), b.bindOnClick(function(a) {
    Entry.playground.changeViewMode("sound");
  }), this.tabViewElements.sound = b);
  Entry.hasVariableManager && (b = Entry.createElement("li", "entryVariableTab"), b.innerHTML = Lang.Workspace.tab_attribute, b.addClass("entryTabListItemWorkspace"), b.addClass("entryVariableTabWorkspace"), a.appendChild(b), b.bindOnClick(function(a) {
    Entry.playground.toggleOnVariableView();
    Entry.playground.changeViewMode("variable");
  }), this.tabViewElements.variable = b);
};
Entry.Playground.prototype.generateCodeView = function(b) {
  if (!Entry.type || "workspace" == Entry.type) {
    var a = Entry.createElement("div", "entryCategory");
    a.addClass("entryCategoryWorkspace");
    b.appendChild(a);
    this.categoryView_ = a;
    var c = Entry.createElement("ul", "entryCategoryList");
    c.addClass("entryCategoryListWorkspace");
    a.appendChild(c);
    this.categoryListView_ = c;
    var d = Entry.createElement("div", "entryBlocklyWorkspace");
    d.addClass("entryBlockMenuWorkspace");
    b.appendChild(d);
    $(d).mouseenter(function(a) {
      Entry.playground.resizing || (Entry.playground.focusBlockMenu = !0, a = Blockly.mainWorkspace.blockMenu.blockMenuWidth + 84, a > Entry.interfaceState.menuWidth && (this.widthBackup = Entry.interfaceState.menuWidth, $(".entryBlockMenuWorkspace>svg").stop().animate({width:a - 64}, 200)));
    });
    $(d).mouseleave(function(a) {
      Entry.playground.resizing || (d.widthBackup && !Blockly.mainWorkspace.blockMenu.hasStalkerBlock && $(".entryBlockMenuWorkspace>svg").stop().animate({width:this.widthBackup - 64}, 200), delete this.widthBackup, delete Entry.playground.focusBlockMenu);
    });
    Entry.addEventListener("entryBlocklyChanged", function(a) {
      a = Entry.playground.blockMenuView_;
      a.widthBackup && Entry.resizeElement({menuWidth:a.widthBackup});
      delete a.widthBackup;
      delete Entry.playground.focusBlockMenu;
    });
    this.blockMenuView_ = d;
    a = this.createVariableView();
    b.appendChild(a);
    this.variableView_ = a;
    a = Entry.createElement("div", "entryBlockly");
    a.addClass("entryBlocklyWorkspace");
    this.blocklyView_ = a;
    Entry.bindAnimationCallback(this.blocklyView_, function(a) {
      Blockly.fireUiEvent(window, "resize");
      Entry.playground.blocklyView_.removeClass("foldOut");
    });
    b.appendChild(a);
    c = Entry.parseTexttoXML("<xml></xml>");
    Blockly.inject(a, {path:Entry.blockInjectPath || ".././", toolbox:c, trashcan:!0, blockmenu:this.blockMenuView_, mediaFilePath:Entry.mediaFilePath});
    Blockly.mainWorkspace.flyout_.hide();
    Blockly.mainWorkspace.blockMenu.hide();
    document.addEventListener("blocklyWorkspaceChange", this.syncObjectWithEvent, !1);
    this.blockMenu = Blockly.mainWorkspace.blockMenu;
    Entry.hw.banHW();
    return b;
  }
  if ("phone" == Entry.type) {
    return a = Entry.createElement("div", "entryCategory"), a.addClass("entryCategoryPhone"), b.appendChild(a), this.categoryView_ = a, c = Entry.createElement("ul", "entryCategoryList"), c.addClass("entryCategoryListPhone"), a.appendChild(c), this.categoryListView_ = c, a = this.createVariableView(), b.appendChild(a), this.variableView_ = a, a = Entry.createElement("div", "entryBlockly"), a.addClass("entryBlocklyPhone"), this.blocklyView_ = a, b.appendChild(a), c = Entry.parseTexttoXML("<xml></xml>"), 
    Blockly.inject(a, {path:Entry.blockInjectPath || ".././", toolbox:c, trashcan:!0, mediaFilePath:Entry.mediaFilePath}), Blockly.mainWorkspace.flyout_.autoClose = !0, Blockly.mainWorkspace.flyout_.hide(), document.addEventListener("blocklyWorkspaceChange", this.syncObjectWithEvent, !1), this.blockMenu = Blockly.mainWorkspace.flyout_, Entry.hw.banHW(), b;
  }
};
Entry.Playground.prototype.generatePictureView = function(b) {
  if ("workspace" == Entry.type) {
    var a = Entry.createElement("div", "entryAddPicture");
    a.addClass("entryPlaygroundAddPicture");
    a.bindOnClick(function(a) {
      Entry.dispatchEvent("openPictureManager");
    });
    var c = Entry.createElement("div", "entryAddPictureInner");
    c.addClass("entryPlaygroundAddPictureInner");
    c.innerHTML = Lang.Workspace.picture_add;
    a.appendChild(c);
    b.appendChild(a);
    a = Entry.createElement("ul", "entryPictureList");
    a.addClass("entryPlaygroundPictureList");
    $ && $(a).sortable({start:function(a, b) {
      b.item.data("start_pos", b.item.index());
    }, stop:function(a, b) {
      var c = b.item.data("start_pos"), g = b.item.index();
      Entry.playground.movePicture(c, g);
    }, axis:"y"});
    b.appendChild(a);
    this.pictureListView_ = a;
    a = Entry.createElement("div", "entryPainter");
    a.addClass("entryPlaygroundPainter");
    b.appendChild(a);
    this.painter = new Entry.Painter;
    this.painter.initialize(a);
  } else {
    "phone" == Entry.type && (a = Entry.createElement("div", "entryAddPicture"), a.addClass("entryPlaygroundAddPicturePhone"), a.bindOnClick(function(a) {
      Entry.dispatchEvent("openPictureManager");
    }), c = Entry.createElement("div", "entryAddPictureInner"), c.addClass("entryPlaygroundAddPictureInnerPhone"), c.innerHTML = Lang.Workspace.picture_add, a.appendChild(c), b.appendChild(a), a = Entry.createElement("ul", "entryPictureList"), a.addClass("entryPlaygroundPictureListPhone"), $ && $(a).sortable({start:function(a, b) {
      b.item.data("start_pos", b.item.index());
    }, stop:function(a, b) {
      var c = b.item.data("start_pos"), g = b.item.index();
      Entry.playground.movePicture(c, g);
    }, axis:"y"}), b.appendChild(a), this.pictureListView_ = a);
  }
};
Entry.Playground.prototype.generateTextView = function(b) {
  var a = Entry.createElement("div");
  b.appendChild(a);
  b = Entry.createElement("div");
  b.addClass("textProperties");
  a.appendChild(b);
  var c = Entry.createElement("div");
  c.addClass("entryTextFontSelect");
  b.appendChild(c);
  var d = Entry.createElement("select", "entryPainterAttrFontName");
  d.addClass("entryPlaygroundPainterAttrFontName", "entryTextFontSelecter");
  d.size = "1";
  d.onchange = function(a) {
    Entry.playground.object.entity.setFontType(a.target.value);
  };
  for (var e = 0;e < Entry.fonts.length;e++) {
    var f = Entry.fonts[e], g = Entry.createElement("option");
    g.value = f.family;
    g.innerHTML = f.name;
    d.appendChild(g);
  }
  this.fontName_ = d;
  c.appendChild(d);
  e = Entry.createElement("ul");
  e.addClass("entryPlayground_text_buttons");
  b.appendChild(e);
  c = Entry.createElement("li");
  c.addClass("entryPlaygroundTextAlignLeft");
  c.bindOnClick(function(a) {
    Entry.playground.setFontAlign(Entry.TEXT_ALIGN_LEFT);
  });
  e.appendChild(c);
  this.alignLeftBtn = c;
  c = Entry.createElement("li");
  c.addClass("entryPlaygroundTextAlignCenter");
  c.bindOnClick(function(a) {
    Entry.playground.setFontAlign(Entry.TEXT_ALIGN_CENTER);
  });
  e.appendChild(c);
  this.alignCenterBtn = c;
  c = Entry.createElement("li");
  c.addClass("entryPlaygroundTextAlignRight");
  c.bindOnClick(function(a) {
    Entry.playground.setFontAlign(Entry.TEXT_ALIGN_RIGHT);
  });
  e.appendChild(c);
  this.alignRightBtn = c;
  c = Entry.createElement("li");
  e.appendChild(c);
  d = Entry.createElement("a");
  c.appendChild(d);
  d.bindOnClick(function() {
    Entry.playground.object.entity.toggleFontBold() ? h.src = Entry.mediaFilePath + "text_button_bold_true.png" : h.src = Entry.mediaFilePath + "text_button_bold_false.png";
  });
  var h = Entry.createElement("img", "entryPlaygroundText_boldImage");
  d.appendChild(h);
  h.src = Entry.mediaFilePath + "text_button_bold_false.png";
  c = Entry.createElement("li");
  e.appendChild(c);
  d = Entry.createElement("a");
  c.appendChild(d);
  d.bindOnClick(function() {
    var a = !Entry.playground.object.entity.getUnderLine() || !1;
    k.src = Entry.mediaFilePath + "text_button_underline_" + a + ".png";
    Entry.playground.object.entity.setUnderLine(a);
  });
  var k = Entry.createElement("img", "entryPlaygroundText_underlineImage");
  d.appendChild(k);
  k.src = Entry.mediaFilePath + "text_button_underline_false.png";
  c = Entry.createElement("li");
  e.appendChild(c);
  d = Entry.createElement("a");
  c.appendChild(d);
  d.bindOnClick(function() {
    Entry.playground.object.entity.toggleFontItalic() ? l.src = Entry.mediaFilePath + "text_button_italic_true.png" : l.src = Entry.mediaFilePath + "/text_button_italic_false.png";
  });
  var l = Entry.createElement("img", "entryPlaygroundText_italicImage");
  d.appendChild(l);
  l.src = Entry.mediaFilePath + "text_button_italic_false.png";
  c = Entry.createElement("li");
  e.appendChild(c);
  d = Entry.createElement("a");
  c.appendChild(d);
  d.bindOnClick(function() {
    var a = !Entry.playground.object.entity.getStrike() || !1;
    Entry.playground.object.entity.setStrike(a);
    q.src = Entry.mediaFilePath + "text_button_strike_" + a + ".png";
  });
  var q = Entry.createElement("img", "entryPlaygroundText_strikeImage");
  d.appendChild(q);
  q.src = Entry.mediaFilePath + "text_button_strike_false.png";
  d = Entry.createElement("li");
  e.appendChild(d);
  c = Entry.createElement("a");
  d.appendChild(c);
  c.bindOnClick(function() {
    Entry.playground.toggleColourChooser("foreground");
  });
  d = Entry.createElement("img");
  c.appendChild(d);
  d.src = Entry.mediaFilePath + "text_button_color_false.png";
  c = Entry.createElement("li");
  e.appendChild(c);
  e = Entry.createElement("a");
  c.appendChild(e);
  e.bindOnClick(function() {
    Entry.playground.toggleColourChooser("background");
  });
  c = Entry.createElement("img");
  e.appendChild(c);
  c.src = Entry.mediaFilePath + "text_button_background_false.png";
  e = Entry.createElement("div");
  e.addClass("entryPlayground_fgColorDiv");
  c = Entry.createElement("div");
  c.addClass("entryPlayground_bgColorDiv");
  b.appendChild(e);
  b.appendChild(c);
  d = Entry.createElement("div");
  d.addClass("entryPlaygroundTextColoursWrapper");
  this.coloursWrapper = d;
  a.appendChild(d);
  b = Entry.getColourCodes();
  for (e = 0;e < b.length;e++) {
    c = Entry.createElement("div"), c.addClass("modal_colour"), c.setAttribute("colour", b[e]), c.style.backgroundColor = b[e], 0 === e && c.addClass("modalColourTrans"), c.bindOnClick(function(a) {
      Entry.playground.setTextColour(a.target.getAttribute("colour"));
    }), d.appendChild(c);
  }
  d.style.display = "none";
  d = Entry.createElement("div");
  d.addClass("entryPlaygroundTextBackgroundsWrapper");
  this.backgroundsWrapper = d;
  a.appendChild(d);
  for (e = 0;e < b.length;e++) {
    c = Entry.createElement("div"), c.addClass("modal_colour"), c.setAttribute("colour", b[e]), c.style.backgroundColor = b[e], 0 === e && c.addClass("modalColourTrans"), c.bindOnClick(function(a) {
      Entry.playground.setBackgroundColour(a.target.getAttribute("colour"));
    }), d.appendChild(c);
  }
  d.style.display = "none";
  b = Entry.createElement("input");
  b.addClass("entryPlayground_textBox");
  b.onkeyup = function() {
    Entry.playground.object.setText(this.value);
    Entry.playground.object.entity.setText(this.value);
  };
  b.onblur = function() {
    Entry.dispatchEvent("textEdited");
  };
  this.textEditInput = b;
  a.appendChild(b);
  b = Entry.createElement("textarea");
  b.addClass("entryPlayground_textArea");
  b.style.display = "none";
  b.onkeyup = function() {
    Entry.playground.object.setText(this.value);
    Entry.playground.object.entity.setText(this.value);
  };
  b.onblur = function() {
    Entry.dispatchEvent("textEdited");
  };
  this.textEditArea = b;
  a.appendChild(b);
  b = Entry.createElement("div");
  b.addClass("entryPlaygroundFontSizeWrapper");
  a.appendChild(b);
  this.fontSizeWrapper = b;
  var n = Entry.createElement("div");
  n.addClass("entryPlaygroundFontSizeSlider");
  b.appendChild(n);
  var m = Entry.createElement("div");
  m.addClass("entryPlaygroundFontSizeIndicator");
  n.appendChild(m);
  this.fontSizeIndiciator = m;
  var r = Entry.createElement("div");
  r.addClass("entryPlaygroundFontSizeKnob");
  n.appendChild(r);
  this.fontSizeKnob = r;
  e = Entry.createElement("div");
  e.addClass("entryPlaygroundFontSizeLabel");
  e.innerHTML = "\uae00\uc790 \ud06c\uae30";
  b.appendChild(e);
  var t = !1, u = 0;
  r.onmousedown = function(a) {
    t = !0;
    u = $(n).offset().left;
  };
  document.addEventListener("mousemove", function(a) {
    t && (a = a.pageX - u, a = Math.max(a, 5), a = Math.min(a, 88), r.style.left = a + "px", a /= .88, m.style.width = a + "%", Entry.playground.object.entity.setFontSize(a));
  });
  document.addEventListener("mouseup", function(a) {
    t = !1;
  });
  b = Entry.createElement("div");
  b.addClass("entryPlaygroundLinebreakWrapper");
  a.appendChild(b);
  a = Entry.createElement("hr");
  a.addClass("entryPlaygroundLinebreakHorizontal");
  b.appendChild(a);
  a = Entry.createElement("div");
  a.addClass("entryPlaygroundLinebreakButtons");
  b.appendChild(a);
  e = Entry.createElement("img");
  e.bindOnClick(function() {
    Entry.playground.toggleLineBreak(!1);
    v.innerHTML = Lang.Menus.linebreak_off_desc_1;
    x.innerHTML = Lang.Menus.linebreak_off_desc_2;
    y.innerHTML = Lang.Menus.linebreak_off_desc_3;
  });
  e.src = Entry.mediaFilePath + "text-linebreak-off-true.png";
  a.appendChild(e);
  this.linebreakOffImage = e;
  e = Entry.createElement("img");
  e.bindOnClick(function() {
    Entry.playground.toggleLineBreak(!0);
    v.innerHTML = Lang.Menus.linebreak_on_desc_1;
    x.innerHTML = Lang.Menus.linebreak_on_desc_2;
    y.innerHTML = Lang.Menus.linebreak_on_desc_3;
  });
  e.src = Entry.mediaFilePath + "text-linebreak-on-false.png";
  a.appendChild(e);
  this.linebreakOnImage = e;
  a = Entry.createElement("div");
  a.addClass("entryPlaygroundLinebreakDescription");
  b.appendChild(a);
  var v = Entry.createElement("p");
  v.innerHTML = Lang.Menus.linebreak_off_desc_1;
  a.appendChild(v);
  b = Entry.createElement("ul");
  a.appendChild(b);
  var x = Entry.createElement("li");
  x.innerHTML = Lang.Menus.linebreak_off_desc_2;
  b.appendChild(x);
  var y = Entry.createElement("li");
  y.innerHTML = Lang.Menus.linebreak_off_desc_3;
  b.appendChild(y);
};
Entry.Playground.prototype.generateSoundView = function(b) {
  if ("workspace" == Entry.type) {
    var a = Entry.createElement("div", "entryAddSound");
    a.addClass("entryPlaygroundAddSound");
    a.bindOnClick(function(a) {
      Entry.dispatchEvent("openSoundManager");
    });
    var c = Entry.createElement("div", "entryAddSoundInner");
    c.addClass("entryPlaygroundAddSoundInner");
    c.innerHTML = Lang.Workspace.sound_add;
    a.appendChild(c);
    b.appendChild(a);
    a = Entry.createElement("ul", "entrySoundList");
    a.addClass("entryPlaygroundSoundList");
    $ && $(a).sortable({start:function(a, b) {
      b.item.data("start_pos", b.item.index());
    }, stop:function(a, b) {
      var c = b.item.data("start_pos"), g = b.item.index();
      Entry.playground.moveSound(c, g);
    }, axis:"y"});
    b.appendChild(a);
    this.soundListView_ = a;
  } else {
    "phone" == Entry.type && (a = Entry.createElement("div", "entryAddSound"), a.addClass("entryPlaygroundAddSoundPhone"), a.bindOnClick(function(a) {
      Entry.dispatchEvent("openSoundManager");
    }), c = Entry.createElement("div", "entryAddSoundInner"), c.addClass("entryPlaygroundAddSoundInnerPhone"), c.innerHTML = Lang.Workspace.sound_add, a.appendChild(c), b.appendChild(a), a = Entry.createElement("ul", "entrySoundList"), a.addClass("entryPlaygroundSoundListPhone"), $ && $(a).sortable({start:function(a, b) {
      b.item.data("start_pos", b.item.index());
    }, stop:function(a, b) {
      var c = b.item.data("start_pos"), g = b.item.index();
      Entry.playground.moveSound(c, g);
    }, axis:"y"}), b.appendChild(a), this.soundListView_ = a);
  }
};
Entry.Playground.prototype.injectObject = function(b) {
  if (!b) {
    this.changeViewMode("code"), this.object = null;
  } else {
    if (b !== this.object) {
      this.object && (this.syncObject(this.object), this.object.toggleInformation(!1));
      this.object = b;
      this.setMenu(b.objectType);
      this.injectCode();
      "sprite" == b.objectType && Entry.pictureEditable ? (this.tabViewElements.text && this.tabViewElements.text.addClass("entryRemove"), this.tabViewElements.picture && this.tabViewElements.picture.removeClass("entryRemove")) : "textBox" == b.objectType && (this.tabViewElements.picture && this.tabViewElements.picture.addClass("entryRemove"), this.tabViewElements.text && this.tabViewElements.text.removeClass("entryRemove"));
      var a = this.viewMode_;
      "default" == a ? this.changeViewMode("code") : "picture" != a && "text" != a || "textBox" != b.objectType ? "text" != a && "picture" != a || "sprite" != b.objectType ? "sound" == a && this.changeViewMode("sound") : this.changeViewMode("picture") : this.changeViewMode("text");
      this.menuInjected || this.selectMenu(0);
    }
  }
};
Entry.Playground.prototype.injectCode = function() {
  var b = this.object;
  Blockly.mainWorkspace.clear();
  Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, b.script);
  var a = 0, c = 0, d = null;
  $(b.script).children("block").each(function(b) {
    var e = Number($(this).attr("x")), f = Number($(this).attr("y"));
    0 == b && (a = e, c = f, d = this);
    e < a && (a = e, d = this);
    f < c && (varyTopY = f);
  });
  if (null != d) {
    var b = Number($(d).attr("x")), e = Number($(d).attr("y")), f = Blockly.mainWorkspace.getMetrics(), g = (.1 * f.viewWidth).toFixed(1), h = (.4 * f.viewHeight).toFixed(1);
    e == c && (h = (.1 * f.viewHeight).toFixed(1));
    Blockly.mainWorkspace.scrollbar.set(b - f.contentLeft - g, e - f.contentTop - h);
  }
};
Entry.Playground.prototype.adjustScroll = function(b, a) {
  var c = Blockly.mainWorkspace.scrollbar.vScroll;
  Blockly.mainWorkspace.scrollbar.hScroll.svgGroup_.setAttribute("opacity", "1");
  c.svgGroup_.setAttribute("opacity", "1");
  if (Blockly.mainWorkspace.getMetrics()) {
    Blockly.removeAllRanges();
    var c = Blockly.mainWorkspace.getMetrics(), d, e;
    d = Math.min(b, -c.contentLeft);
    e = Math.min(a, -c.contentTop);
    d = Math.max(d, c.viewWidth - c.contentLeft - c.contentWidth);
    e = Math.max(e, c.viewHeight - c.contentTop - c.contentHeight);
    Blockly.mainWorkspace.scrollbar.set(-d - c.contentLeft, -e - c.contentTop);
  }
};
Entry.Playground.prototype.injectPicture = function() {
  var b = this.pictureListView_;
  if (b) {
    for (;b.hasChildNodes();) {
      b.removeChild(b.lastChild);
    }
    if (this.object) {
      for (var a = this.object.pictures, c = 0, d = a.length;c < d;c++) {
        var e = a[c].view;
        e || console.log(e);
        e.orderHolder.innerHTML = c + 1;
        b.appendChild(e);
      }
      this.selectPicture(this.object.selectedPicture);
    } else {
      Entry.dispatchEvent("pictureClear");
    }
  }
};
Entry.Playground.prototype.addPicture = function(b, a) {
  var c = Entry.cloneSimpleObject(b);
  delete c.id;
  delete c.view;
  b = JSON.parse(JSON.stringify(c));
  b.id = Entry.generateHash();
  b.name = Entry.getOrderedName(b.name, this.object.pictures);
  this.generatePictureElement(b);
  this.object.addPicture(b);
  this.injectPicture();
  this.selectPicture(b);
};
Entry.Playground.prototype.setPicture = function(b) {
  var a = Entry.container.getPictureElement(b.id), c = $(a);
  if (a) {
    b.view = a;
    a.picture = b;
    a = c.find("#t_" + b.id)[0];
    if (b.fileurl) {
      a.style.backgroundImage = 'url("' + b.fileurl + '")';
    } else {
      var d = b.filename;
      a.style.backgroundImage = 'url("' + Entry.defaultPath + "/uploads/" + d.substring(0, 2) + "/" + d.substring(2, 4) + "/thumb/" + d + '.png")';
    }
    c.find("#s_" + b.id)[0].innerHTML = b.dimension.width + " X " + b.dimension.height;
  }
  Entry.container.setPicture(b);
};
Entry.Playground.prototype.clonePicture = function(b) {
  b = Entry.playground.object.getPicture(b);
  this.addPicture(b, !0);
};
Entry.Playground.prototype.selectPicture = function(b) {
  for (var a = this.object.pictures, c = 0, d = a.length;c < d;c++) {
    var e = a[c];
    e.id === b.id ? e.view.addClass("entryPictureSelected") : e.view.removeClass("entryPictureSelected");
  }
  var f;
  b && b.id && (f = Entry.container.selectPicture(b.id));
  this.object.id === f && Entry.dispatchEvent("pictureSelected", b);
};
Entry.Playground.prototype.movePicture = function(b, a) {
  this.object.pictures.splice(a, 0, this.object.pictures.splice(b, 1)[0]);
  this.injectPicture();
  Entry.stage.sortZorder();
};
Entry.Playground.prototype.injectText = function() {
  if (Entry.playground.object) {
    Entry.playground.textEditInput.value = Entry.playground.object.entity.getText();
    Entry.playground.textEditArea.value = Entry.playground.object.entity.getText();
    Entry.playground.fontName_.value = Entry.playground.object.entity.getFontName();
    if (Entry.playground.object.entity.font) {
      var b = -1 < Entry.playground.object.entity.font.indexOf("bold") || !1;
      $("#entryPlaygroundText_boldImage").attr("src", Entry.mediaFilePath + "text_button_bold_" + b + ".png");
      b = -1 < Entry.playground.object.entity.font.indexOf("italic") || !1;
      $("#entryPlaygroundText_italicImage").attr("src", Entry.mediaFilePath + "text_button_italic_" + b + ".png");
    }
    b = Entry.playground.object.entity.getUnderLine() || !1;
    $("#entryPlaygroundText_underlineImage").attr("src", Entry.mediaFilePath + "text_button_underline_" + b + ".png");
    b = Entry.playground.object.entity.getStrike() || !1;
    $("#entryPlaygroundText_strikeImage").attr("src", Entry.mediaFilePath + "text_button_strike_" + b + ".png");
    $(".entryPlayground_fgColorDiv").css("backgroundColor", Entry.playground.object.entity.colour);
    $(".entryPlayground_bgColorDiv").css("backgroundColor", Entry.playground.object.entity.bgColour);
    Entry.playground.toggleLineBreak(Entry.playground.object.entity.getLineBreak());
    Entry.playground.object.entity.getLineBreak() && ($(".entryPlaygroundLinebreakDescription > p").html(Lang.Menus.linebreak_on_desc_1), $(".entryPlaygroundLinebreakDescription > ul > li").eq(0).html(Lang.Menus.linebreak_on_desc_2), $(".entryPlaygroundLinebreakDescription > ul > li").eq(1).html(Lang.Menus.linebreak_on_desc_3));
    Entry.playground.setFontAlign(Entry.playground.object.entity.getTextAlign());
    b = Entry.playground.object.entity.getFontSize();
    Entry.playground.fontSizeIndiciator.style.width = b + "%";
    Entry.playground.fontSizeKnob.style.left = .88 * b + "px";
  }
};
Entry.Playground.prototype.injectSound = function() {
  var b = this.soundListView_;
  if (b) {
    for (;b.hasChildNodes();) {
      b.removeChild(b.lastChild);
    }
    if (this.object) {
      for (var a = this.object.sounds, c = 0, d = a.length;c < d;c++) {
        var e = a[c].view;
        e.orderHolder.innerHTML = c + 1;
        b.appendChild(e);
      }
    }
  }
};
Entry.Playground.prototype.moveSound = function(b, a) {
  this.object.sounds.splice(a, 0, this.object.sounds.splice(b, 1)[0]);
  this.updateListViewOrder("sound");
  Entry.stage.sortZorder();
};
Entry.Playground.prototype.addSound = function(b, a) {
  var c = Entry.cloneSimpleObject(b);
  delete c.view;
  delete c.id;
  b = JSON.parse(JSON.stringify(c));
  b.id = Entry.generateHash();
  b.name = Entry.getOrderedName(b.name, this.object.sounds);
  this.generateSoundElement(b);
  this.object.addSound(b);
  this.injectSound();
};
Entry.Playground.prototype.changeViewMode = function(b) {
  for (var a in this.tabViewElements) {
    this.tabViewElements[a].removeClass("entryTabSelected");
  }
  "default" != b && this.tabViewElements[b].addClass("entryTabSelected");
  if ("variable" != b) {
    var c = this.view_.children;
    this.viewMode_ = b;
    for (a = 0;a < c.length;a++) {
      var d = c[a];
      -1 < d.id.toUpperCase().indexOf(b.toUpperCase()) ? d.removeClass("entryRemove") : d.addClass("entryRemove");
    }
    if ("picture" == b && (!this.pictureView_.object || this.pictureView_.object != this.object)) {
      this.pictureView_.object = this.object, this.injectPicture();
    } else {
      if ("sound" == b && (!this.soundView_.object || this.soundView_.object != this.object)) {
        this.soundView_.object = this.object, this.injectSound();
      } else {
        if ("text" == b && "textBox" == this.object.objectType || this.textView_.object != this.object) {
          this.textView_.object = this.object, this.injectText();
        }
      }
    }
    "code" == b && this.resizeHandle_ && this.resizeHandle_.removeClass("entryRemove");
    Entry.engine.isState("run") && this.curtainView_.removeClass("entryRemove");
    this.viewMode_ = b;
    this.toggleOffVariableView();
  }
};
Entry.Playground.prototype.createVariableView = function() {
  var b = Entry.createElement("div");
  Entry.type && "workspace" != Entry.type ? "phone" == Entry.type && b.addClass("entryVariablePanelPhone") : b.addClass("entryVariablePanelWorkspace");
  this.variableViewWrapper_ = b;
  Entry.variableContainer.createDom(b);
  return b;
};
Entry.Playground.prototype.toggleOnVariableView = function() {
  Entry.playground.changeViewMode("code");
  this.categoryView_.addClass("entryRemove");
  this.blockMenuView_ && this.blockMenuView_.addClass("entryHidden");
  Entry.variableContainer.updateList();
  this.variableView_.removeClass("entryRemove");
  this.resizeHandle_.removeClass("entryRemove");
};
Entry.Playground.prototype.toggleOffVariableView = function() {
  this.categoryView_.removeClass("entryRemove");
  this.blockMenuView_ && this.blockMenuView_.removeClass("entryHidden");
  this.variableView_.addClass("entryRemove");
};
Entry.Playground.prototype.syncObject = function(b) {
  this.object && !b && (b = this.object);
  b && b.setScript(Blockly.Xml.workspaceToDom(Blockly.mainWorkspace));
};
Entry.Playground.prototype.editBlock = function() {
  var b = Entry.playground;
  Entry.stateManager && Entry.stateManager.addCommand("edit block", b, b.restoreBlock, b.object, b.object.getScriptText());
};
Entry.Playground.prototype.mouseupBlock = function() {
  if (Entry.reporter) {
    var b = Entry.playground, a = b.object;
    Entry.reporter.report(new Entry.State("edit block mouseup", b, b.restoreBlock, a, a.getScriptText()));
  }
};
Entry.Playground.prototype.restoreBlock = function(b, a) {
  Entry.container.selectObject(b.id);
  Entry.stateManager && Entry.stateManager.addCommand("restore block", this, this.restoreBlock, this.object, this.object.getScriptText());
  var c = Blockly.Xml.textToDom(a);
  Blockly.mainWorkspace.clear();
  Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, c);
  this.syncObject();
};
Entry.Playground.prototype.syncObjectWithEvent = function(b) {
  Entry.playground.syncObject();
};
Entry.Playground.prototype.setMenu = function(b) {
  if (this.currentObjectType != b) {
    this.categoryListView_.innerHTML = "";
    this.blockMenu.unbanClass(this.currentObjectType);
    this.blockMenu.banClass(b);
    for (var a in this.blockJSON) {
      var c = this.blockJSON[a].category, d = Entry.createElement("li", "entryCategory" + c);
      ("brush" == c && "textBox" == b || "text" == c && "sprite" == b || !("func" == c || this.blockJSON[a].blocks && this.blockJSON[a].blocks.length)) && d.addClass("entryRemove");
      d.innerHTML = Lang.Blocks[c.toUpperCase()];
      d.bindOnClick(function() {
        Entry.playground.selectMenu(this.id.substring(13));
      });
      Entry.type && "workspace" != Entry.type ? "phone" == Entry.type && d.addClass("entryCategoryElementPhone") : d.addClass("entryCategoryElementWorkspace");
      this.categoryListView_.appendChild(d);
    }
    this.selectMenu(0);
    this.currentObjectType = b;
  }
};
Entry.Playground.prototype.selectMenu = function(b, a) {
  if (this.object) {
    this.lastSelector = b;
    var c = this.categoryListView_.children;
    if (!Entry.type || "workspace" == Entry.type) {
      for (var d in this.blockJSON) {
        var e = this.blockJSON[d].category;
        "string" == typeof b && e == b || "number" == typeof b && b == d ? c[d].hasClass("entrySelectedCategory") && !a ? (this.blocklyView_.addClass("folding"), this.blocklyView_.removeClass("foldOut"), this.hideTabs(), c[d].removeClass("entrySelectedCategory"), delete this.selectedMenu) : ("func" == e ? this.blockMenu.show(Entry.Func.getMenuXml()) : ("variable" == e && this.checkVariables(), this.blockMenu.showCategory(this.blockJSON[d])), this.menuInjected = !0, this.blocklyView_.hasClass("folding") && 
        (this.blocklyView_.addClass("foldOut"), this.blocklyView_.removeClass("folding")), this.showTabs(), c[d].addClass("entrySelectedCategory"), this.selectedMenu = e) : c[d].removeClass("entrySelectedCategory");
      }
    } else {
      if ("phone" == Entry.type) {
        var f = [];
        for (d = 0;d < f.length;d++) {
          e = f[d].attributes[0].value, "string" == typeof b && e == b || "number" == typeof b && b == d ? c[d].hasClass("entrySelectedCategory") ? (this.blockMenu.hide(), c[d].removeClass("entrySelectedCategory"), this.menuInjected = !0, this.selectedMenu = e) : (c[d].addClass("entrySelectedCategory"), this.blockMenu.show(f[d].childNodes), this.menuInjected = !0, delete this.selctedMenu) : c[d].removeClass("entrySelectedCategory");
        }
      }
    }
  } else {
    Entry.toast.alert(Lang.Workspace.add_object_alert, Lang.Workspace.add_object_alert_msg);
  }
};
Entry.Playground.prototype.hideTabs = function() {
  var b = ["picture", "text", "sound", "variable"], a;
  for (a in b) {
    this.hideTab([b[a]]);
  }
};
Entry.Playground.prototype.hideTab = function(b) {
  this.tabViewElements[b] && (this.tabViewElements[b].addClass("hideTab"), this.tabViewElements[b].removeClass("showTab"));
};
Entry.Playground.prototype.showTabs = function() {
  var b = ["picture", "text", "sound", "variable"], a;
  for (a in b) {
    this.showTab(b[a]);
  }
};
Entry.Playground.prototype.showTab = function(b) {
  this.tabViewElements[b] && (this.tabViewElements[b].addClass("showTab"), this.tabViewElements[b].removeClass("hideTab"));
};
Entry.Playground.prototype.setBlockMenu = function(b) {
  b || (b = EntryStatic.getAllBlocks());
  Entry.functionEnable && 1 < b.length && "arduino" == b[b.length - 1].category && b.splice(b.length - 1, 0, {category:"func"});
  Entry.messageEnable || this.blockMenu.banClass("message");
  Entry.variableEnable || this.blockMenu.banClass("variable");
  Entry.listEnable || this.blockMenu.banClass("list");
  this.updateHW();
  if (!Entry.sceneEditable) {
    for (var a in b) {
      "scene" == b[a].category && b.splice(a, 1);
    }
  }
  this.blockJSON = b;
};
Entry.Playground.prototype.initializeResizeHandle = function(b) {
  b.onmousedown = function(a) {
    Entry.playground.resizing = !0;
  };
  document.addEventListener("mousemove", function(a) {
    Entry.playground.resizing && Entry.resizeElement({menuWidth:a.x - Entry.interfaceState.canvasWidth});
  });
  document.addEventListener("mouseup", function(a) {
    Entry.playground.resizing = !1;
  });
};
Entry.Playground.prototype.reloadPlayground = function() {
  var b, a;
  document.getElementsByClassName("entrySelectedCategory")[0] && (b = document.getElementsByClassName("entrySelectedCategory")[0], a = b.getAttribute("id").substring(13), b.removeClass("entrySelectedCategory"), Entry.playground.selectMenu(a));
  Entry.stage.selectedObject && (Blockly.mainWorkspace.clear(), Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, Entry.stage.selectedObject.script));
};
Entry.Playground.prototype.flushPlayground = function() {
  this.object = null;
  Entry.playground && Entry.playground.view_ && (Blockly.mainWorkspace.clear(), this.injectPicture(), this.injectSound());
};
Entry.Playground.prototype.refreshPlayground = function() {
  Entry.playground && Entry.playground.view_ && (this.injectPicture(), this.injectSound());
};
Entry.Playground.prototype.updateListViewOrder = function(b) {
  b = "picture" == b ? this.pictureListView_.childNodes : this.soundListView_.childNodes;
  for (var a = 0, c = b.length;a < c;a++) {
    b[a].orderHolder.innerHTML = a + 1;
  }
};
Entry.Playground.prototype.generatePictureElement = function(b) {
  function a() {
    if ("" === this.value.trim()) {
      Entry.deAttachEventListener(this, "blur", a), alert("\uc774\ub984\uc744 \uc785\ub825\ud558\uc5ec \uc8fc\uc138\uc694."), this.focus(), Entry.attachEventListener(this, "blur", a);
    } else {
      for (var b = $(".entryPlaygroundPictureName"), c = 0;c < b.length;c++) {
        if (b.eq(c).val() == f.value && b[c] != this) {
          Entry.deAttachEventListener(this, "blur", a);
          alert("\uc774\ub984\uc774 \uc911\ubcf5 \ub418\uc5c8\uc2b5\ub2c8\ub2e4.");
          this.focus();
          Entry.attachEventListener(this, "blur", a);
          return;
        }
      }
      this.picture.name = this.value;
      Entry.playground.reloadPlayground();
      Entry.dispatchEvent("pictureNameChanged", this.picture);
    }
  }
  var c = Entry.createElement("li", b.id);
  b.view = c;
  c.addClass("entryPlaygroundPictureElement");
  c.picture = b;
  c.bindOnClick(function(a) {
    Entry.playground.selectPicture(this.picture);
  });
  Entry.Utils.disableContextmenu(b.view);
  $(b.view).on("contextmenu", function() {
    Entry.ContextMenu.show([{text:Lang.Workspace.context_rename, callback:function() {
      f.focus();
    }}, {text:Lang.Workspace.context_duplicate, callback:function() {
      Entry.playground.clonePicture(b.id);
    }}, {text:Lang.Workspace.context_remove, callback:function() {
      Entry.playground.object.removePicture(b.id) ? (Entry.removeElement(c), Entry.toast.success(Lang.Workspace.shape_remove_ok, b.name + " " + Lang.Workspace.shape_remove_ok_msg)) : Entry.toast.alert(Lang.Workspace.shape_remove_fail, Lang.Workspace.shape_remove_fail_msg);
    }}, {divider:!0}, {text:Lang.Workspace.context_download, callback:function() {
      b.fileurl ? window.open(b.fileurl) : window.open("/api/sprite/download/image/" + encodeURIComponent(b.filename) + "/" + encodeURIComponent(b.name) + ".png");
    }}], "workspace-contextmenu");
  });
  var d = Entry.createElement("div");
  d.addClass("entryPlaygroundPictureOrder");
  c.orderHolder = d;
  c.appendChild(d);
  d = Entry.createElement("div", "t_" + b.id);
  d.addClass("entryPlaygroundPictureThumbnail");
  if (b.fileurl) {
    d.style.backgroundImage = 'url("' + b.fileurl + '")';
  } else {
    var e = b.filename;
    d.style.backgroundImage = 'url("' + Entry.defaultPath + "/uploads/" + e.substring(0, 2) + "/" + e.substring(2, 4) + "/thumb/" + e + '.png")';
  }
  c.appendChild(d);
  var f = Entry.createElement("input");
  f.addClass("entryPlaygroundPictureName");
  f.addClass("entryEllipsis");
  f.picture = b;
  f.value = b.name;
  Entry.attachEventListener(f, "blur", a);
  f.onkeypress = function(a) {
    13 == a.keyCode && this.blur();
  };
  c.appendChild(f);
  d = Entry.createElement("div", "s_" + b.id);
  d.addClass("entryPlaygroundPictureSize");
  d.innerHTML = b.dimension.width + " X " + b.dimension.height;
  c.appendChild(d);
};
Entry.Playground.prototype.generateSoundElement = function(b) {
  var a = Entry.createElement("sound", b.id);
  b.view = a;
  a.addClass("entryPlaygroundSoundElement");
  a.sound = b;
  Entry.Utils.disableContextmenu(b.view);
  $(b.view).on("contextmenu", function() {
    Entry.ContextMenu.show([{text:Lang.Workspace.context_rename, callback:function() {
      g.focus();
    }}, {text:Lang.Workspace.context_duplicate, callback:function() {
      Entry.playground.addSound(b, !0);
    }}, {text:Lang.Workspace.context_remove, callback:function() {
      Entry.playground.object.removeSound(b.id) ? (Entry.removeElement(a), Entry.toast.success(Lang.Workspace.sound_remove_ok, b.name + " " + Lang.Workspace.sound_remove_ok_msg)) : Entry.toast.alert(Lang.Workspace.sound_remove_fail, "");
      Entry.removeElement(a);
    }}], "workspace-contextmenu");
  });
  var c = Entry.createElement("div");
  c.addClass("entryPlaygroundSoundOrder");
  a.orderHolder = c;
  a.appendChild(c);
  var d = Entry.createElement("div");
  d.addClass("entryPlaygroundSoundThumbnail");
  d.addClass("entryPlaygroundSoundPlay");
  var e = !1, f;
  d.addEventListener("click", function() {
    e ? (e = !1, d.removeClass("entryPlaygroundSoundStop"), d.addClass("entryPlaygroundSoundPlay"), f.stop()) : (e = !0, d.removeClass("entryPlaygroundSoundPlay"), d.addClass("entryPlaygroundSoundStop"), f = createjs.Sound.play(b.id), f.addEventListener("complete", function(a) {
      d.removeClass("entryPlaygroundSoundStop");
      d.addClass("entryPlaygroundSoundPlay");
      e = !1;
    }), f.addEventListener("loop", function(a) {
    }), f.addEventListener("failed", function(a) {
    }));
  });
  a.appendChild(d);
  var g = Entry.createElement("input");
  g.addClass("entryPlaygroundSoundName");
  g.sound = b;
  g.value = b.name;
  var h = document.getElementsByClassName("entryPlaygroundSoundName");
  g.onblur = function() {
    if ("" === this.value) {
      alert("\uc774\ub984\uc744 \uc785\ub825\ud558\uc5ec \uc8fc\uc138\uc694."), this.focus();
    } else {
      for (var a = 0, b = 0;b < h.length;b++) {
        if (h[b].value == g.value && (a += 1, 1 < a)) {
          alert("\uc774\ub984\uc774 \uc911\ubcf5 \ub418\uc5c8\uc2b5\ub2c8\ub2e4.");
          this.focus();
          return;
        }
      }
      this.sound.name = this.value;
    }
  };
  g.onkeypress = function(a) {
    13 == a.keyCode && this.blur();
  };
  a.appendChild(g);
  c = Entry.createElement("div");
  c.addClass("entryPlaygroundSoundLength");
  c.innerHTML = b.duration + " \ucd08";
  a.appendChild(c);
};
Entry.Playground.prototype.toggleColourChooser = function(b) {
  "foreground" === b ? "none" === this.coloursWrapper.style.display ? (this.coloursWrapper.style.display = "block", this.backgroundsWrapper.style.display = "none") : this.coloursWrapper.style.display = "none" : "background" === b && ("none" === this.backgroundsWrapper.style.display ? (this.backgroundsWrapper.style.display = "block", this.coloursWrapper.style.display = "none") : this.backgroundsWrapper.style.display = "none");
};
Entry.Playground.prototype.setTextColour = function(b) {
  Entry.playground.object.entity.setColour(b);
  Entry.playground.toggleColourChooser("foreground");
  $(".entryPlayground_fgColorDiv").css("backgroundColor", b);
};
Entry.Playground.prototype.setBackgroundColour = function(b) {
  Entry.playground.object.entity.setBGColour(b);
  Entry.playground.toggleColourChooser("background");
  $(".entryPlayground_bgColorDiv").css("backgroundColor", b);
};
Entry.Playground.prototype.isTextBGMode = function() {
  return this.isTextBGMode_;
};
Entry.Playground.prototype.checkVariables = function() {
  Entry.forEBS || (Entry.variableContainer.lists_.length ? this.blockMenu.unbanClass("listNotExist") : this.blockMenu.banClass("listNotExist"), Entry.variableContainer.variables_.length ? this.blockMenu.unbanClass("variableNotExist") : this.blockMenu.banClass("variableNotExist"));
};
Entry.Playground.prototype.getViewMode = function() {
  return this.viewMode_;
};
Entry.Playground.prototype.updateHW = function() {
  var b = Entry.playground;
  if (b.blockMenu) {
    var a = Entry.hw;
    a && a.connected ? (b.blockMenu.unbanClass("arduinoConnected"), b.blockMenu.banClass("arduinoDisconnected"), a.banHW(), a.hwModule && b.blockMenu.unbanClass(a.hwModule.name)) : (b.blockMenu.banClass("arduinoConnected"), b.blockMenu.unbanClass("arduinoDisconnected"), Entry.hw.banHW());
    b.object && b.selectMenu(b.lastSelector, !0);
  }
};
Entry.Playground.prototype.toggleLineBreak = function(b) {
  this.object && "textBox" == this.object.objectType && (b ? (Entry.playground.object.entity.setLineBreak(!0), $(".entryPlayground_textArea").css("display", "block"), $(".entryPlayground_textBox").css("display", "none"), this.linebreakOffImage.src = Entry.mediaFilePath + "text-linebreak-off-false.png", this.linebreakOnImage.src = Entry.mediaFilePath + "text-linebreak-on-true.png", this.fontSizeWrapper.removeClass("entryHide")) : (Entry.playground.object.entity.setLineBreak(!1), $(".entryPlayground_textArea").css("display", 
  "none"), $(".entryPlayground_textBox").css("display", "block"), this.linebreakOffImage.src = Entry.mediaFilePath + "text-linebreak-off-true.png", this.linebreakOnImage.src = Entry.mediaFilePath + "text-linebreak-on-false.png", this.fontSizeWrapper.addClass("entryHide")));
};
Entry.Playground.prototype.setFontAlign = function(b) {
  if ("textBox" == this.object.objectType) {
    this.alignLeftBtn.removeClass("toggle");
    this.alignCenterBtn.removeClass("toggle");
    this.alignRightBtn.removeClass("toggle");
    switch(b) {
      case Entry.TEXT_ALIGN_LEFT:
        this.alignLeftBtn.addClass("toggle");
        break;
      case Entry.TEXT_ALIGN_CENTER:
        this.alignCenterBtn.addClass("toggle");
        break;
      case Entry.TEXT_ALIGN_RIGHT:
        this.alignRightBtn.addClass("toggle");
    }
    this.object.entity.setTextAlign(b);
  }
};
Entry.Popup = function() {
  Entry.assert(!window.popup, "Popup exist");
  this.body_ = Entry.createElement("div");
  this.body_.addClass("entryPopup");
  this.body_.bindOnClick(function(b) {
    b.target == this && this.popup.remove();
  });
  this.body_.popup = this;
  document.body.appendChild(this.body_);
  this.window_ = Entry.createElement("div");
  this.window_.addClass("entryPopupWindow");
  this.window_.bindOnClick(function() {
  });
  Entry.addEventListener("windowResized", this.resize);
  window.popup = this;
  this.resize();
  this.body_.appendChild(this.window_);
};
Entry.Popup.prototype.remove = function() {
  for (;this.window_.hasChildNodes();) {
    "workspace" == Entry.type ? Entry.view_.insertBefore(this.window_.firstChild, Entry.container.view_) : Entry.view_.insertBefore(this.window_.lastChild, Entry.view_.firstChild);
  }
  $("body").css("overflow", "auto");
  Entry.removeElement(this.body_);
  window.popup = null;
  Entry.removeEventListener("windowResized", this.resize);
  Entry.engine.popup = null;
};
Entry.Popup.prototype.resize = function(b) {
  b = window.popup.window_;
  var a = .9 * window.innerWidth, c = .9 * window.innerHeight - 35;
  9 * a <= 16 * c ? c = a / 16 * 9 : a = 16 * c / 9;
  b.style.width = String(a) + "px";
  b.style.height = String(c + 35) + "px";
};
Entry.popupHelper = function(b) {
  this.popupList = {};
  this.nowContent;
  b && (window.popupHelper = null);
  Entry.assert(!window.popupHelper, "Popup exist");
  var a = ["confirm", "spinner"], c = ["entryPopupHelperTopSpan", "entryPopupHelperBottomSpan", "entryPopupHelperLeftSpan", "entryPopupHelperRightSpan"];
  this.body_ = Entry.Dom("div", {classes:["entryPopup", "hiddenPopup", "popupHelper"]});
  var d = this;
  this.body_.bindOnClick(function(b) {
    if (!(d.nowContent && -1 < a.indexOf(d.nowContent.prop("type")))) {
      var f = $(b.target);
      c.forEach(function(a) {
        f.hasClass(a) && this.popup.hide();
      }.bind(this));
      b.target == this && this.popup.hide();
    }
  });
  window.popupHelper = this;
  this.body_.prop("popup", this);
  Entry.Dom("div", {class:"entryPopupHelperTopSpan", parent:this.body_});
  b = Entry.Dom("div", {class:"entryPopupHelperMiddleSpan", parent:this.body_});
  Entry.Dom("div", {class:"entryPopupHelperBottomSpan", parent:this.body_});
  Entry.Dom("div", {class:"entryPopupHelperLeftSpan", parent:b});
  this.window_ = Entry.Dom("div", {class:"entryPopupHelperWindow", parent:b});
  Entry.Dom("div", {class:"entryPopupHelperRightSpan", parent:b});
  $("body").append(this.body_);
};
Entry.popupHelper.prototype.clearPopup = function() {
  for (var b = this.popupWrapper_.children.length - 1;2 < b;b--) {
    this.popupWrapper_.removeChild(this.popupWrapper_.children[b]);
  }
};
Entry.popupHelper.prototype.addPopup = function(b, a) {
  var c = Entry.Dom("div"), d = Entry.Dom("div", {class:"entryPopupHelperCloseButton"});
  d.bindOnClick(function() {
    a.closeEvent ? a.closeEvent(this) : this.hide();
  }.bind(this));
  var e = Entry.Dom("div", {class:"entryPopupHelperWrapper"});
  e.append(d);
  a.title && (d = Entry.Dom("div", {class:"entryPopupHelperTitle"}), e.append(d), d.text(a.title));
  c.addClass(b);
  c.append(e);
  c.popupWrapper_ = e;
  c.prop("type", a.type);
  "function" === typeof a.setPopupLayout && a.setPopupLayout(c);
  this.popupList[b] = c;
};
Entry.popupHelper.prototype.hasPopup = function(b) {
  return !!this.popupList[b];
};
Entry.popupHelper.prototype.setPopup = function(b) {
};
Entry.popupHelper.prototype.remove = function(b) {
  0 < this.window_.children().length && this.window_.children().remove();
  this.window_.remove();
  delete this.popupList[b];
  this.nowContent = void 0;
  this.body_.addClass("hiddenPopup");
};
Entry.popupHelper.prototype.resize = function(b) {
};
Entry.popupHelper.prototype.show = function(b) {
  0 < this.window_.children().length && this.window_.children().detach();
  this.window_.append(this.popupList[b]);
  this.nowContent = this.popupList[b];
  this.body_.removeClass("hiddenPopup");
};
Entry.popupHelper.prototype.hide = function() {
  this.nowContent = void 0;
  this.body_.addClass("hiddenPopup");
};
Entry.getStartProject = function(b) {
  return {category:"\uae30\ud0c0", scenes:[{name:Lang.Blocks.SCENE + " 1", id:"7dwq"}], variables:[{name:Lang.Blocks.CALC_choose_project_timer_action_1, id:"brih", visible:!1, value:"0", variableType:"timer", x:150, y:-70, array:[], object:null, isCloud:!1}, {name:Lang.Blocks.VARIABLE_get_canvas_input_value, id:"1vu8", visible:!1, value:"0", variableType:"answer", x:150, y:-100, array:[], object:null, isCloud:!1}], objects:[{id:"7y0y", name:Lang.Blocks.entry_bot_name, script:'<xml><block type="when_run_button_click" x="136" y="47"><next><block type="repeat_basic"><value name="VALUE"><block type="number"><field name="NUM">10</field></block></value><statement name="DO"><block type="move_direction"><value name="VALUE"><block type="number"><field name="NUM">10</field></block></value></block></statement></block></next></block></xml>', 
  selectedPictureId:"vx80", objectType:"sprite", rotateMethod:"free", scene:"7dwq", sprite:{sounds:[{duration:1.3, ext:".mp3", id:"8el5", fileurl:b + "media/bark.mp3", name:Lang.Blocks.bark_dog}], pictures:[{id:"vx80", fileurl:b + "media/entrybot1.png", name:Lang.Blocks.walking_entryBot + "1", scale:100, dimension:{width:284, height:350}}, {id:"4t48", fileurl:b + "media/entrybot2.png", name:Lang.Blocks.walking_entryBot + "2", scale:100, dimension:{width:284, height:350}}]}, entity:{x:0, y:0, regX:142, 
  regY:175, scaleX:.3154574132492113, scaleY:.3154574132492113, rotation:0, direction:90, width:284, height:350, visible:!0}, lock:!1, active:!0}], speed:60};
};
Entry.PropertyPanel = function() {
  this.modes = {};
  this.selected = null;
};
(function(b) {
  b.generateView = function(a, b) {
    this._view = Entry.Dom("div", {class:"propertyPanel", parent:$(a)});
    this._tabView = Entry.Dom("div", {class:"propertyTab", parent:this._view});
    this._contentView = Entry.Dom("div", {class:"propertyContent", parent:this._view});
    var d = Entry.createElement("div");
    d.addClass("entryObjectSelectedImgWorkspace");
    this.selectedImgView_ = d;
    this._view.append(d);
    this.initializeSplitter(d);
    this.splitter = d;
  };
  b.addMode = function(a, b) {
    var d = b.getView(), d = Entry.Dom(d, {parent:this._contentView}), e = Entry.Dom("<div>" + a + "</div>", {classes:["propertyTabElement", "propertyTab" + a], parent:this._tabView}), f = this;
    e.bindOnClick(function() {
      f.select(a);
    });
    this.modes[a] && (this.modes[a].tabDom.remove(), this.modes[a].contentDom.remove());
    this.modes[a] = {obj:b, tabDom:e, contentDom:d};
  };
  b.resize = function(a) {
    this._view.css({width:a + "px", top:9 * a / 16 + 123 - 22 + "px"});
    430 <= a ? this._view.removeClass("collapsed") : this._view.addClass("collapsed");
    Entry.dispatchEvent("windowResized");
    (a = this.modes[this.selected].obj.resize) && "hw" != this.selected ? a() : "hw" == this.selected && this.modes.hw.obj.listPorts ? this.modes[this.selected].obj.resizeList() : "hw" == this.selected && this.modes[this.selected].obj.resize();
  };
  b.select = function(a) {
    for (var b in this.modes) {
      var d = this.modes[b];
      d.tabDom.removeClass("selected");
      d.contentDom.addClass("entryHidden");
    }
    b = this.modes[a];
    b.tabDom.addClass("selected");
    b.contentDom.removeClass("entryHidden");
    b.obj.resize && b.obj.resize();
    this.selected = a;
  };
  b.initializeSplitter = function(a) {
    a.onmousedown = function(a) {
      Entry.container.disableSort();
      Entry.container.splitterEnable = !0;
    };
    document.addEventListener("mousemove", function(a) {
      Entry.container.splitterEnable && Entry.resizeElement({canvasWidth:a.x || a.clientX});
    });
    document.addEventListener("mouseup", function(a) {
      Entry.container.splitterEnable = !1;
      Entry.container.enableSort();
    });
  };
})(Entry.PropertyPanel.prototype);
Entry.init = function(b, a) {
  Entry.assert("object" === typeof a, "Init option is not object");
  this.events_ = {};
  this.interfaceState = {menuWidth:264};
  Entry.Utils.bindGlobalEvent(["mousedown", "mousemove"]);
  this.options = a;
  this.parseOptions(a);
  this.mediaFilePath = (a.libDir ? a.libDir : "/lib") + "/entryjs/images/";
  this.defaultPath = a.defaultDir || "";
  this.blockInjectPath = a.blockInjectDir || "";
  "workspace" == this.type && this.isPhone() && (this.type = "phone");
  this.initialize_();
  this.view_ = b;
  this.view_.setAttribute("class", "entry");
  Entry.initFonts(a.fonts);
  this.createDom(b, this.type);
  this.loadInterfaceState();
  this.overridePrototype();
  this.maxCloneLimit = 302;
  this.cloudSavable = !0;
  this.startTime = (new Date).getTime();
  document.onkeydown = function(a) {
    Entry.dispatchEvent("keyPressed", a);
  };
  document.onkeyup = function(a) {
    Entry.dispatchEvent("keyUpped", a);
  };
  window.onresize = function(a) {
    Entry.dispatchEvent("windowResized", a);
  };
  window.onbeforeunload = this.beforeUnload;
  Entry.addEventListener("saveWorkspace", function(a) {
    Entry.addActivity("save");
  });
  "IE" != Entry.getBrowserType().substr(0, 2) || window.flashaudio ? createjs.Sound.registerPlugins([createjs.WebAudioPlugin]) : (createjs.FlashAudioPlugin.swfPath = this.mediaFilePath + "media/", createjs.Sound.registerPlugins([createjs.FlashAudioPlugin]), window.flashaudio = !0);
  Entry.soundQueue = new createjs.LoadQueue;
  Entry.soundQueue.installPlugin(createjs.Sound);
  Entry.loadAudio_([Entry.mediaFilePath + "media/click.mp3", Entry.mediaFilePath + "media/click.wav", Entry.mediaFilePath + "media/click.ogg"], "click");
  Entry.loadAudio_([Entry.mediaFilePath + "media/delete.mp3", Entry.mediaFilePath + "media/delete.ogg", Entry.mediaFilePath + "media/delete.wav"], "delete");
};
Entry.loadAudio_ = function(b, a) {
  if (window.Audio && b.length) {
    for (;0 < b.length;) {
      var c = b[0];
      c.match(/\/([^.]+)./);
      Entry.soundQueue.loadFile({id:a, src:c, type:createjs.LoadQueue.SOUND});
      break;
    }
  }
};
Entry.initialize_ = function() {
  this.stage = new Entry.Stage;
  Entry.engine && Entry.engine.clearTimer();
  this.engine = new Entry.Engine;
  this.propertyPanel = new Entry.PropertyPanel;
  this.container = new Entry.Container;
  this.helper = new Entry.Helper;
  this.youtube = new Entry.Youtube;
  this.variableContainer = new Entry.VariableContainer;
  if ("workspace" == this.type || "phone" == this.type) {
    this.stateManager = new Entry.StateManager;
  }
  this.scene = new Entry.Scene;
  this.playground = new Entry.Playground;
  this.toast = new Entry.Toast;
  this.hw && this.hw.closeConnection();
  this.hw = new Entry.HW;
  if (Entry.enableActivityLogging) {
    this.reporter = new Entry.Reporter(!1);
  } else {
    if ("workspace" == this.type || "phone" == this.type) {
      this.reporter = new Entry.Reporter(!0);
    }
  }
};
Entry.createDom = function(b, a) {
  if (a && "workspace" != a) {
    "minimize" == a ? (c = Entry.createElement("canvas"), c.className = "entryCanvasWorkspace", c.id = "entryCanvas", c.width = 640, c.height = 360, d = Entry.createElement("div", "entryCanvasWrapper"), d.appendChild(c), b.appendChild(d), this.canvas_ = c, this.stage.initStage(this.canvas_), d = Entry.createElement("div"), b.appendChild(d), this.engineView = d, this.engine.generateView(this.engineView, a)) : "phone" == a && (this.stateManagerView = c = Entry.createElement("div"), this.stateManager.generateView(this.stateManagerView, 
    a), d = Entry.createElement("div"), b.appendChild(d), this.engineView = d, this.engine.generateView(this.engineView, a), c = Entry.createElement("canvas"), c.addClass("entryCanvasPhone"), c.id = "entryCanvas", c.width = 640, c.height = 360, d.insertBefore(c, this.engine.footerView_), this.canvas_ = c, this.stage.initStage(this.canvas_), c = Entry.createElement("div"), b.appendChild(c), this.containerView = c, this.container.generateView(this.containerView, a), c = Entry.createElement("div"), 
    b.appendChild(c), this.playgroundView = c, this.playground.generateView(this.playgroundView, a));
  } else {
    Entry.documentMousedown.attach(this, this.cancelObjectEdit);
    var c = Entry.createElement("div");
    b.appendChild(c);
    this.sceneView = c;
    this.scene.generateView(this.sceneView, a);
    c = Entry.createElement("div");
    this.sceneView.appendChild(c);
    this.stateManagerView = c;
    this.stateManager.generateView(this.stateManagerView, a);
    var d = Entry.createElement("div");
    b.appendChild(d);
    this.engineView = d;
    this.engine.generateView(this.engineView, a);
    c = Entry.createElement("canvas");
    c.addClass("entryCanvasWorkspace");
    c.id = "entryCanvas";
    c.width = 640;
    c.height = 360;
    d.insertBefore(c, this.engine.addButton);
    c.addEventListener("mousewheel", function(a) {
      var b = Entry.variableContainer.getListById(Entry.stage.mouseCoordinate);
      a = 0 < a.wheelDelta ? !0 : !1;
      for (var c = 0;c < b.length;c++) {
        var d = b[c];
        d.scrollButton_.y = a ? 46 <= d.scrollButton_.y ? d.scrollButton_.y - 23 : 23 : d.scrollButton_.y + 23;
        d.updateView();
      }
    });
    this.canvas_ = c;
    this.stage.initStage(this.canvas_);
    c = Entry.createElement("div");
    this.propertyPanel.generateView(b, a);
    this.containerView = c;
    this.container.generateView(this.containerView, a);
    c = Entry.createElement("div");
    b.appendChild(c);
    this.playgroundView = c;
    this.playground.generateView(this.playgroundView, a);
    this.propertyPanel.addMode("object", this.container);
    this.propertyPanel.addMode("helper", this.helper);
    this.propertyPanel.select("object");
  }
};
Entry.start = function(b) {
  this.FPS || (this.FPS = 60);
  Entry.assert("number" == typeof this.FPS, "FPS must be number");
  Entry.engine.start(this.FPS);
};
Entry.parseOptions = function(b) {
  this.type = b.type;
  this.projectSaveable = b.projectsaveable;
  void 0 === this.projectSaveable && (this.projectSaveable = !0);
  this.objectAddable = b.objectaddable;
  void 0 === this.objectAddable && (this.objectAddable = !0);
  this.objectEditable = b.objectEditable;
  void 0 === this.objectEditable && (this.objectEditable = !0);
  this.objectEditable || (this.objectAddable = !1);
  this.objectDeletable = b.objectdeletable;
  void 0 === this.objectDeletable && (this.objectDeletable = !0);
  this.soundEditable = b.soundeditable;
  void 0 === this.soundEditable && (this.soundEditable = !0);
  this.pictureEditable = b.pictureeditable;
  void 0 === this.pictureEditable && (this.pictureEditable = !0);
  this.sceneEditable = b.sceneEditable;
  void 0 === this.sceneEditable && (this.sceneEditable = !0);
  this.functionEnable = b.functionEnable;
  void 0 === this.functionEnable && (this.functionEnable = !0);
  this.messageEnable = b.messageEnable;
  void 0 === this.messageEnable && (this.messageEnable = !0);
  this.variableEnable = b.variableEnable;
  void 0 === this.variableEnable && (this.variableEnable = !0);
  this.listEnable = b.listEnable;
  void 0 === this.listEnable && (this.listEnable = !0);
  this.hasVariableManager = b.hasvariablemanager;
  this.variableEnable || this.messageEnable || this.listEnable || this.functionEnable ? void 0 === this.hasVariableManager && (this.hasVariableManager = !0) : this.hasVariableManager = !1;
  this.isForLecture = b.isForLecture;
};
Entry.initFonts = function(b) {
  this.fonts = b;
  b || (this.fonts = []);
};
Entry.Reporter = function(b) {
  this.projectId = this.userId = null;
  this.isRealTime = b;
  this.activities = [];
};
Entry.Reporter.prototype.start = function(b, a, c) {
  this.isRealTime && (-1 < window.location.href.indexOf("localhost") ? this.io = io("localhost:7000") : this.io = io("play04.play-entry.com:7000"), this.io.emit("activity", {message:"start", userId:a, projectId:b, time:c}));
  this.userId = a;
  this.projectId = b;
};
Entry.Reporter.prototype.report = function(b) {
  if (!this.isRealTime || this.io) {
    var a = [], c;
    for (c in b.params) {
      var d = b.params[c];
      "object" !== typeof d ? a.push(d) : d.id && a.push(d.id);
    }
    b = {message:b.message, userId:this.userId, projectId:this.projectId, time:b.time, params:a};
    this.isRealTime ? this.io.emit("activity", b) : this.activities.push(b);
  }
};
Entry.Scene = function() {
  var b = this;
  this.scenes_ = [];
  this.selectedScene = null;
  this.maxCount = 20;
  $(window).on("resize", function(a) {
    b.resize();
  });
};
Entry.Scene.viewBasicWidth = 70;
Entry.Scene.prototype.generateView = function(b, a) {
  var c = this;
  this.view_ = b;
  this.view_.addClass("entryScene");
  if (!a || "workspace" == a) {
    this.view_.addClass("entrySceneWorkspace");
    $(this.view_).on("mousedown", function(a) {
      var b = $(this).offset(), d = $(window), h = a.pageX - b.left + d.scrollLeft();
      a = a.pageY - b.top + d.scrollTop();
      a = 40 - a;
      b = -40 / 55;
      d = $(c.selectedScene.view).find(".entrySceneRemoveButtonCoverWorkspace").offset().left;
      !(h < d || h > d + 55) && a > 40 + b * (h - d) && (h = c.getNextScene()) && (h = $(h.view), $(document).trigger("mouseup"), h.trigger("mousedown"));
    });
    var d = Entry.createElement("ul");
    d.addClass("entrySceneListWorkspace");
    Entry.sceneEditable && $ && $(d).sortable({start:function(a, b) {
      b.item.data("start_pos", b.item.index());
      $(b.item[0]).clone(!0);
    }, stop:function(a, b) {
      var c = b.item.data("start_pos"), d = b.item.index();
      Entry.scene.moveScene(c, d);
    }, axis:"x", tolerance:"pointer"});
    this.view_.appendChild(d);
    this.listView_ = d;
    Entry.sceneEditable && (d = Entry.createElement("span"), d.addClass("entrySceneElementWorkspace"), d.addClass("entrySceneAddButtonWorkspace"), d.bindOnClick(function(a) {
      Entry.engine.isState("run") || Entry.scene.addScene();
    }), this.view_.appendChild(d), this.addButton_ = d);
  }
};
Entry.Scene.prototype.generateElement = function(b) {
  var a = this, c = Entry.createElement("li", b.id);
  c.addClass("entrySceneElementWorkspace");
  c.addClass("entrySceneButtonWorkspace");
  c.addClass("minValue");
  $(c).on("mousedown", function(a) {
    Entry.engine.isState("run") ? a.preventDefault() : Entry.scene.selectScene(b);
  });
  var d = Entry.createElement("input");
  d.addClass("entrySceneFieldWorkspace");
  d.value = b.name;
  Entry.sceneEditable || (d.disabled = "disabled");
  var e = Entry.createElement("span");
  e.addClass("entrySceneLeftWorkspace");
  c.appendChild(e);
  var f = Entry.createElement("span");
  f.addClass("entrySceneInputCover");
  f.style.width = Entry.computeInputWidth(b.name);
  c.appendChild(f);
  b.inputWrapper = f;
  d.onkeyup = function(c) {
    c = c.keyCode;
    Entry.isArrowOrBackspace(c) || (b.name = this.value, f.style.width = Entry.computeInputWidth(b.name), a.resize(), 13 == c && this.blur(), 9 < this.value.length && (this.value = this.value.substring(0, 10), this.blur()));
  };
  d.onblur = function(a) {
    d.value = this.value;
    b.name = this.value;
    f.style.width = Entry.computeInputWidth(b.name);
  };
  f.appendChild(d);
  e = Entry.createElement("span");
  e.addClass("entrySceneRemoveButtonCoverWorkspace");
  c.appendChild(e);
  if (Entry.sceneEditable) {
    var g = Entry.createElement("button");
    g.addClass("entrySceneRemoveButtonWorkspace");
    g.innerHTML = "x";
    g.scene = b;
    g.bindOnClick(function(a) {
      a.stopPropagation();
      Entry.engine.isState("run") || confirm(Lang.Workspace.will_you_delete_scene) && Entry.scene.removeScene(this.scene);
    });
    e.appendChild(g);
  }
  Entry.Utils.disableContextmenu(c);
  $(c).on("contextmenu", function() {
    Entry.ContextMenu.show([{text:Lang.Workspace.duplicate_scene, callback:function() {
      Entry.scene.cloneScene(b);
    }}], "workspace-contextmenu");
  });
  return b.view = c;
};
Entry.Scene.prototype.updateView = function() {
  if (!Entry.type || "workspace" == Entry.type) {
    for (var b = this.listView_;b.hasChildNodes();) {
      b.lastChild.removeClass("selectedScene"), b.removeChild(b.lastChild);
    }
    for (var a in this.getScenes()) {
      var c = this.scenes_[a];
      b.appendChild(c.view);
      this.selectedScene.id == c.id && c.view.addClass("selectedScene");
    }
    this.addButton_ && (this.getScenes().length < this.maxCount ? this.addButton_.removeClass("entryRemove") : this.addButton_.addClass("entryRemove"));
  }
  this.resize();
};
Entry.Scene.prototype.addScenes = function(b) {
  if ((this.scenes_ = b) && 0 !== b.length) {
    for (var a = 0, c = b.length;a < c;a++) {
      this.generateElement(b[a]);
    }
  } else {
    this.scenes_ = [], this.scenes_.push(this.createScene());
  }
  this.selectScene(this.getScenes()[0]);
  this.updateView();
};
Entry.Scene.prototype.addScene = function(b, a) {
  void 0 === b && (b = this.createScene());
  b.view || this.generateElement(b);
  a || "number" == typeof a ? this.getScenes().splice(a, 0, b) : this.getScenes().push(b);
  Entry.stage.objectContainers.push(Entry.stage.createObjectContainer(b));
  Entry.playground.flushPlayground();
  this.selectScene(b);
  this.updateView();
  return b;
};
Entry.Scene.prototype.removeScene = function(b) {
  if (1 >= this.getScenes().length) {
    Entry.toast.alert(Lang.Msgs.runtime_error, Lang.Workspace.Scene_delete_error, !1);
  } else {
    var a = this.getScenes().indexOf(this.getSceneById(b.id));
    this.getScenes().splice(a, 1);
    this.selectScene();
    for (var a = Entry.container.getSceneObjects(b), c = 0;c < a.length;c++) {
      Entry.container.removeObject(a[c]);
    }
    Entry.stage.removeObjectContainer(b);
    this.updateView();
  }
};
Entry.Scene.prototype.selectScene = function(b) {
  b = b || this.getScenes()[0];
  this.selectedScene && this.selectedScene.id == b.id || (Entry.engine.isState("run") && Entry.container.resetSceneDuringRun(), this.selectedScene = b, Entry.container.setCurrentObjects(), Entry.stage.objectContainers && 0 !== Entry.stage.objectContainers.length && Entry.stage.selectObjectContainer(b), (b = Entry.container.getCurrentObjects()[0]) && "minimize" != Entry.type ? (Entry.container.selectObject(b.id), Entry.playground.refreshPlayground()) : (Entry.stage.selectObject(null), Entry.playground.flushPlayground(), 
  Entry.variableContainer.updateList()), Entry.container.listView_ || Entry.stage.sortZorder(), Entry.container.updateListView(), this.updateView());
};
Entry.Scene.prototype.toJSON = function() {
  for (var b = [], a = this.getScenes().length, c = 0;c < a;c++) {
    var d = this.getScenes()[c], e = d.view, f = d.inputWrapper;
    delete d.view;
    delete d.inputWrapper;
    b.push(JSON.parse(JSON.stringify(d)));
    d.view = e;
    d.inputWrapper = f;
  }
  return b;
};
Entry.Scene.prototype.moveScene = function(b, a) {
  this.getScenes().splice(a, 0, this.getScenes().splice(b, 1)[0]);
  Entry.container.updateObjectsOrder();
  Entry.stage.sortZorder();
};
Entry.Scene.prototype.getSceneById = function(b) {
  for (var a = this.getScenes(), c = 0;c < a.length;c++) {
    if (a[c].id == b) {
      return a[c];
    }
  }
  return !1;
};
Entry.Scene.prototype.getScenes = function() {
  return this.scenes_;
};
Entry.Scene.prototype.takeStartSceneSnapshot = function() {
  this.sceneBeforeRun = this.selectedScene;
};
Entry.Scene.prototype.loadStartSceneSnapshot = function() {
  this.selectScene(this.sceneBeforeRun);
  this.sceneBeforeRun = null;
};
Entry.Scene.prototype.createScene = function() {
  var b = {name:Lang.Blocks.SCENE + " " + (this.getScenes().length + 1), id:Entry.generateHash()};
  this.generateElement(b);
  return b;
};
Entry.Scene.prototype.cloneScene = function(b) {
  if (this.scenes_.length >= this.maxCount) {
    Entry.toast.alert(Lang.Msgs.runtime_error, Lang.Workspace.Scene_add_error, !1);
  } else {
    var a = {name:b.name + Lang.Workspace.replica_of_object, id:Entry.generateHash()};
    this.generateElement(a);
    this.addScene(a);
    b = Entry.container.getSceneObjects(b);
    for (var c = b.length - 1;0 <= c;c--) {
      Entry.container.addCloneObject(b[c], a.id);
    }
  }
};
Entry.Scene.prototype.resize = function() {
  var b = this.getScenes(), a = this.selectedScene, c = b[0];
  if (0 !== b.length && c) {
    var d = $(c.view).offset().left, c = parseFloat($(a.view).css("margin-left")), e = $(this.view_).width() - d, f = 0, g;
    for (g in b) {
      var d = b[g], h = d.view;
      h.addClass("minValue");
      $(h).removeProp("style");
      $(d.inputWrapper).width(Entry.computeInputWidth(d.name));
      h = $(h);
      f = f + h.width() + c;
    }
    if (f > e) {
      for (g in e -= $(a.view).width(), c = e / (b.length - 1) - (Entry.Scene.viewBasicWidth + c), b) {
        d = b[g], a.id != d.id ? (d.view.removeClass("minValue"), $(d.inputWrapper).width(c)) : d.view.addClass("minValue");
      }
    }
  }
};
Entry.Scene.prototype.getNextScene = function() {
  var b = this.getScenes();
  return b[b.indexOf(this.selectedScene) + 1];
};
Entry.Script = function(b) {
  this.entity = b;
};
p = Entry.Script.prototype;
p.init = function(b, a, c) {
  Entry.assert("BLOCK" == b.tagName.toUpperCase(), b.tagName);
  this.type = b.getAttribute("type");
  this.id = Number(b.getAttribute("id"));
  b.getElementsByTagName("mutation").length && b.getElementsByTagName("mutation")[0].hasAttribute("hashid") && (this.hashId = b.childNodes[0].getAttribute("hashid"));
  "REPEAT" == this.type.substr(0, 6).toUpperCase() && (this.isRepeat = !0);
  a instanceof Entry.Script && (this.previousScript = a, a.parentScript && (this.parentScript = a.parentScript));
  c instanceof Entry.Script && (this.parentScript = c);
  b = b.childNodes;
  for (a = 0;a < b.length;a++) {
    if (c = b[a], "NEXT" == c.tagName.toUpperCase()) {
      this.nextScript = new Entry.Script(this.entity), this.register && (this.nextScript.register = this.register), this.nextScript.init(b[a].childNodes[0], this);
    } else {
      if ("VALUE" == c.tagName.toUpperCase()) {
        this.values || (this.values = {});
        var d = new Entry.Script(this.entity);
        this.register && (d.register = this.register);
        d.init(c.childNodes[0]);
        this.values[c.getAttribute("name")] = d;
      } else {
        "FIELD" == c.tagName.toUpperCase() ? (this.fields || (this.fields = {}), this.fields[c.getAttribute("name")] = c.textContent) : "STATEMENT" == c.tagName.toUpperCase() && (this.statements || (this.statements = {}), d = new Entry.Script(this.entity), this.register && (d.register = this.register), d.init(c.childNodes[0], null, this), d.key = c.getAttribute("name"), this.statements[c.getAttribute("name")] = d);
      }
    }
  }
};
p.clone = function(b, a) {
  var c = new Entry.Script(b);
  c.id = this.id;
  c.type = this.type;
  c.isRepeat = this.isRepeat;
  if (this.parentScript && !this.previousScript && 2 != a) {
    c.parentScript = this.parentScript.clone(b);
    for (var d = c.parentScript.statements[this.key] = c;d.nextScript;) {
      d = d.nextScript, d.parentScript = c.parentScript;
    }
  }
  this.nextScript && 1 != a && (c.nextScript = this.nextScript.clone(b, 0), c.nextScript.previousScript = this);
  this.previousScript && 0 !== a && (c.previousScript = this.previousScript.clone(b, 1), c.previousScript.previousScript = this);
  if (this.fields) {
    c.fields = {};
    for (var e in this.fields) {
      c.fields[e] = this.fields[e];
    }
  }
  if (this.values) {
    for (e in c.values = {}, this.values) {
      c.values[e] = this.values[e].clone(b);
    }
  }
  if (this.statements) {
    for (e in c.statements = {}, this.statements) {
      for (c.statements[e] = this.statements[e].clone(b, 2), d = c.statements[e], d.parentScript = c;d.nextScript;) {
        d = d.nextScript, d.parentScript = c;
      }
    }
  }
  return c;
};
p.getStatement = function(b) {
  return this.statements[b];
};
p.compute = function() {
};
p.getValue = function(b) {
  return this.values[b].run();
};
p.getNumberValue = function(b) {
  return Number(this.values[b].run());
};
p.getStringValue = function(b) {
  return String(this.values[b].run());
};
p.getBooleanValue = function(b) {
  return this.values[b].run() ? !0 : !1;
};
p.getField = function(b) {
  return this.fields[b];
};
p.getStringField = function(b) {
  return String(this.fields[b]);
};
p.getNumberField = function(b) {
  return Number(this.fields[b]);
};
p.callReturn = function() {
  return this.nextScript ? this.nextScript : this.parentScript ? this.parentScript : null;
};
p.run = function() {
  return Entry.block[this.type](this.entity, this);
};
Entry.Stage = function() {
  this.variables = {};
  this.background = new createjs.Shape;
  this.background.graphics.beginFill("#ffffff").drawRect(-480, -240, 960, 480);
  this.objectContainers = [];
  this.selectedObjectContainer = null;
  this.variableContainer = new createjs.Container;
  this.dialogContainer = new createjs.Container;
  this.selectedObject = null;
  this.isObjectClick = !1;
};
Entry.Stage.prototype.initStage = function(b) {
  this.canvas = new createjs.Stage(b.id);
  this.canvas.x = 320;
  this.canvas.y = 180;
  this.canvas.scaleX = this.canvas.scaleY = 2 / 1.5;
  createjs.Touch.enable(this.canvas);
  this.canvas.enableMouseOver(10);
  this.canvas.mouseMoveOutside = !0;
  this.canvas.addChild(this.background);
  this.canvas.addChild(this.variableContainer);
  this.canvas.addChild(this.dialogContainer);
  this.inputField = null;
  this.initCoordinator();
  this.initHandle();
  this.mouseCoordinate = {x:0, y:0};
  if (Entry.isPhone()) {
    b.ontouchstart = function(a) {
      Entry.dispatchEvent("canvasClick", a);
      Entry.stage.isClick = !0;
    }, b.ontouchend = function(a) {
      Entry.stage.isClick = !1;
      Entry.dispatchEvent("canvasClickCanceled", a);
    };
  } else {
    var a = function(a) {
      Entry.dispatchEvent("canvasClick", a);
      Entry.stage.isClick = !0;
    };
    b.onmousedown = a;
    b.ontouchstart = a;
    a = function(a) {
      Entry.stage.isClick = !1;
      Entry.dispatchEvent("canvasClickCanceled", a);
    };
    b.onmouseup = a;
    b.ontouchend = a;
    $(document).click(function(a) {
      Entry.stage.focused = "entryCanvas" === a.target.id ? !0 : !1;
    });
  }
  Entry.addEventListener("canvasClick", function(a) {
    Entry.stage.isObjectClick = !1;
  });
  a = function(a) {
    a.preventDefault();
    var b = this.getBoundingClientRect(), e;
    -1 < Entry.getBrowserType().indexOf("IE") ? (e = 480 * ((a.pageX - b.left - document.documentElement.scrollLeft) / b.width - .5), a = -270 * ((a.pageY - b.top - document.documentElement.scrollTop) / b.height - .5)) : a.changedTouches ? (e = 480 * ((a.changedTouches[0].pageX - b.left - document.body.scrollLeft) / b.width - .5), a = -270 * ((a.changedTouches[0].pageY - b.top - document.body.scrollTop) / b.height - .5)) : (e = 480 * ((a.pageX - b.left - document.body.scrollLeft) / b.width - .5), 
    a = -270 * ((a.pageY - b.top - document.body.scrollTop) / b.height - .5));
    Entry.stage.mouseCoordinate = {x:e.toFixed(1), y:a.toFixed(1)};
    Entry.dispatchEvent("stageMouseMove");
  };
  b.onmousemove = a;
  b.ontouchmove = a;
  b.onmouseout = function(a) {
    Entry.dispatchEvent("stageMouseOut");
  };
  Entry.addEventListener("updateObject", function(a) {
    Entry.engine.isState("stop") && Entry.stage.updateObject();
  });
  Entry.addEventListener("canvasInputComplete", function(a) {
    try {
      var b = Entry.stage.inputField.value();
      Entry.stage.hideInputField();
      if (b) {
        var e = Entry.container;
        e.setInputValue(b);
        e.inputValue.complete = !0;
      }
    } catch (f) {
    }
  });
  this.initWall();
  this.render();
};
Entry.Stage.prototype.render = function() {
  Entry.stage.timer && clearTimeout(Entry.stage.timer);
  var b = (new Date).getTime();
  Entry.stage.update();
  b = (new Date).getTime() - b;
  Entry.stage.timer = setTimeout(Entry.stage.render, 16 - b % 16 + 16 * Math.floor(b / 16));
};
Entry.Stage.prototype.update = function() {
  Entry.engine.isState("stop") && this.objectUpdated ? (this.canvas.update(), this.objectUpdated = !1) : this.canvas.update();
  this.inputField && !this.inputField._isHidden && this.inputField.render();
};
Entry.Stage.prototype.loadObject = function(b) {
  var a = b.entity.object;
  this.getObjectContainerByScene(b.scene).addChild(a);
  this.canvas.update();
};
Entry.Stage.prototype.loadEntity = function(b) {
  Entry.stage.getObjectContainerByScene(b.parent.scene).addChild(b.object);
  this.sortZorder();
};
Entry.Stage.prototype.unloadEntity = function(b) {
  Entry.stage.getObjectContainerByScene(b.parent.scene).removeChild(b.object);
};
Entry.Stage.prototype.loadVariable = function(b) {
  var a = b.view_;
  this.variables[b.id] = a;
  this.variableContainer.addChild(a);
  this.canvas.update();
};
Entry.Stage.prototype.removeVariable = function(b) {
  this.variableContainer.removeChild(b.view_);
  this.canvas.update();
};
Entry.Stage.prototype.loadDialog = function(b) {
  this.dialogContainer.addChild(b.object);
};
Entry.Stage.prototype.unloadDialog = function(b) {
  this.dialogContainer.removeChild(b.object);
};
Entry.Stage.prototype.sortZorder = function() {
  for (var b = Entry.container.getCurrentObjects(), a = this.selectedObjectContainer, c = 0, d = b.length - 1;0 <= d;d--) {
    for (var e = b[d], f = e.entity, e = e.clonedEntities, g = 0, h = e.length;g < h;g++) {
      e[g].shape && a.setChildIndex(e[g].shape, c++), a.setChildIndex(e[g].object, c++);
    }
    f.shape && a.setChildIndex(f.shape, c++);
    a.setChildIndex(f.object, c++);
  }
};
Entry.Stage.prototype.initCoordinator = function() {
  var b = new createjs.Container, a = new createjs.Bitmap(Entry.mediaFilePath + "workspace_coordinate.png");
  a.scaleX = .5;
  a.scaleY = .5;
  a.x = -240;
  a.y = -135;
  b.addChild(a);
  this.canvas.addChild(b);
  b.visible = !1;
  this.coordinator = b;
};
Entry.Stage.prototype.toggleCoordinator = function() {
  this.coordinator.visible = !this.coordinator.visible;
};
Entry.Stage.prototype.selectObject = function(b) {
  this.selectedObject = b ? b : null;
  this.updateObject();
};
Entry.Stage.prototype.initHandle = function() {
  this.handle = new EaselHandle(this.canvas);
  this.handle.setChangeListener(this, this.updateHandle);
  this.handle.setEditStartListener(this, this.startEdit);
  this.handle.setEditEndListener(this, this.endEdit);
};
Entry.Stage.prototype.updateObject = function() {
  this.handle.setDraggable(!0);
  if (!this.editEntity) {
    var b = this.selectedObject;
    if (b) {
      "textBox" == b.objectType ? this.handle.toggleCenter(!1) : this.handle.toggleCenter(!0);
      "free" == b.getRotateMethod() ? this.handle.toggleRotation(!0) : this.handle.toggleRotation(!1);
      this.handle.toggleDirection(!0);
      b.getLock() ? (this.handle.toggleRotation(!1), this.handle.toggleDirection(!1), this.handle.toggleResize(!1), this.handle.toggleCenter(!1), this.handle.setDraggable(!1)) : this.handle.toggleResize(!0);
      this.handle.setVisible(!0);
      var a = b.entity;
      this.handle.setWidth(a.getScaleX() * a.getWidth());
      this.handle.setHeight(a.getScaleY() * a.getHeight());
      var c, d;
      if ("textBox" == a.type) {
        if (a.getLineBreak()) {
          c = a.regX * a.scaleX, d = -a.regY * a.scaleY;
        } else {
          var e = a.getTextAlign();
          d = -a.regY * a.scaleY;
          switch(e) {
            case Entry.TEXT_ALIGN_LEFT:
              c = -a.getWidth() / 2 * a.scaleX;
              break;
            case Entry.TEXT_ALIGN_CENTER:
              c = a.regX * a.scaleX;
              break;
            case Entry.TEXT_ALIGN_RIGHT:
              c = a.getWidth() / 2 * a.scaleX;
          }
        }
      } else {
        c = (a.regX - a.width / 2) * a.scaleX, d = (a.height / 2 - a.regY) * a.scaleY;
      }
      e = a.getRotation() / 180 * Math.PI;
      this.handle.setX(a.getX() - c * Math.cos(e) - d * Math.sin(e));
      this.handle.setY(-a.getY() - c * Math.sin(e) + d * Math.cos(e));
      this.handle.setRegX((a.regX - a.width / 2) * a.scaleX);
      this.handle.setRegY((a.regY - a.height / 2) * a.scaleY);
      this.handle.setRotation(a.getRotation());
      this.handle.setDirection(a.getDirection());
      this.objectUpdated = !0;
      this.handle.setVisible(b.entity.getVisible());
      b.entity.getVisible() && this.handle.render();
    } else {
      this.handle.setVisible(!1);
    }
  }
};
Entry.Stage.prototype.updateHandle = function() {
  this.editEntity = !0;
  var b = this.handle, a = this.selectedObject.entity;
  a.lineBreak ? (a.setHeight(b.height / a.getScaleY()), a.setWidth(b.width / a.getScaleX())) : (0 !== a.width && (0 > a.getScaleX() ? a.setScaleX(-b.width / a.width) : a.setScaleX(b.width / a.width)), 0 !== a.height && a.setScaleY(b.height / a.height));
  var c = b.rotation / 180 * Math.PI;
  if ("textBox" == a.type) {
    var d = b.regX / a.scaleX, d = b.regY / a.scaleY;
    if (a.getLineBreak()) {
      a.setX(b.x), a.setY(-b.y);
    } else {
      switch(a.getTextAlign()) {
        case Entry.TEXT_ALIGN_LEFT:
          a.setX(b.x - b.width / 2 * Math.cos(c));
          a.setY(-b.y + b.width / 2 * Math.sin(c));
          break;
        case Entry.TEXT_ALIGN_CENTER:
          a.setX(b.x);
          a.setY(-b.y);
          break;
        case Entry.TEXT_ALIGN_RIGHT:
          a.setX(b.x + b.width / 2 * Math.cos(c)), a.setY(-b.y - b.width / 2 * Math.sin(c));
      }
    }
  } else {
    d = a.width / 2 + b.regX / a.scaleX, a.setX(b.x + b.regX * Math.cos(c) - b.regY * Math.sin(c)), a.setRegX(d), d = a.height / 2 + b.regY / a.scaleY, a.setY(-b.y - b.regX * Math.sin(c) - b.regY * Math.cos(c)), a.setRegY(d);
  }
  a.setDirection(b.direction);
  a.setRotation(b.rotation);
  this.selectedObject.entity.doCommand();
  this.editEntity = !1;
};
Entry.Stage.prototype.startEdit = function() {
  this.selectedObject.entity.initCommand();
};
Entry.Stage.prototype.endEdit = function() {
  this.selectedObject.entity.checkCommand();
};
Entry.Stage.prototype.initWall = function() {
  var b = new createjs.Container, a = new Image;
  a.src = Entry.mediaFilePath + "media/bound.png";
  b.up = new createjs.Bitmap;
  b.up.scaleX = 16;
  b.up.y = -165;
  b.up.x = -240;
  b.up.image = a;
  b.addChild(b.up);
  b.down = new createjs.Bitmap;
  b.down.scaleX = 16;
  b.down.y = 135;
  b.down.x = -240;
  b.down.image = a;
  b.addChild(b.down);
  b.right = new createjs.Bitmap;
  b.right.scaleY = 9;
  b.right.y = -135;
  b.right.x = 240;
  b.right.image = a;
  b.addChild(b.right);
  b.left = new createjs.Bitmap;
  b.left.scaleY = 9;
  b.left.y = -135;
  b.left.x = -270;
  b.left.image = a;
  b.addChild(b.left);
  this.canvas.addChild(b);
  this.wall = b;
};
Entry.Stage.prototype.showInputField = function(b) {
  b = 1 / 1.5;
  this.inputField || (this.inputField = new CanvasInput({canvas:document.getElementById("entryCanvas"), fontSize:30 * b, fontFamily:"NanumGothic", fontColor:"#212121", width:556 * b, height:26 * b, padding:8 * b, borderWidth:1 * b, borderColor:"#000", borderRadius:3 * b, boxShadow:"none", innerShadow:"0px 0px 5px rgba(0, 0, 0, 0.5)", x:202 * b, y:450 * b, topPosition:!0, onsubmit:function() {
    Entry.dispatchEvent("canvasInputComplete");
  }}));
  b = new createjs.Container;
  var a = new Image;
  a.src = Entry.mediaFilePath + "confirm_button.png";
  var c = new createjs.Bitmap;
  c.scaleX = .23;
  c.scaleY = .23;
  c.x = 160;
  c.y = 89;
  c.cursor = "pointer";
  c.image = a;
  b.addChild(c);
  b.on("mousedown", function(a) {
    Entry.dispatchEvent("canvasInputComplete");
  });
  this.inputSubmitButton || (this.inputField.value(""), this.canvas.addChild(b), this.inputSubmitButton = b);
  this.inputField.show();
};
Entry.Stage.prototype.hideInputField = function() {
  this.inputField && this.inputField.value() && this.inputField.value("");
  this.inputSubmitButton && (this.canvas.removeChild(this.inputSubmitButton), this.inputSubmitButton = null);
  this.inputField && this.inputField.hide();
};
Entry.Stage.prototype.initObjectContainers = function() {
  var b = Entry.scene.scenes_;
  if (b && 0 !== b.length) {
    for (var a = 0;a < b.length;a++) {
      this.objectContainers[a] = this.createObjectContainer(b[a]);
    }
    this.selectedObjectContainer = this.objectContainers[0];
  } else {
    b = this.createObjectContainer(Entry.scene.selectedScene), this.objectContainers.push(b), this.selectedObjectContainer = b;
  }
  this.canvas.addChild(this.selectedObjectContainer);
  this.selectObjectContainer(Entry.scene.selectedScene);
};
Entry.Stage.prototype.selectObjectContainer = function(b) {
  if (this.canvas) {
    for (var a = this.objectContainers, c = 0;c < a.length;c++) {
      this.canvas.removeChild(a[c]);
    }
    this.selectedObjectContainer = this.getObjectContainerByScene(b);
    this.canvas.addChildAt(this.selectedObjectContainer, 2);
  }
};
Entry.Stage.prototype.reAttachToCanvas = function() {
  for (var b = [this.selectedObjectContainer, this.variableContainer, this.coordinator, this.handle, this.dialogContainer], a = 0;a < b.length;a++) {
    this.canvas.removeChild(b[a]), this.canvas.addChild(b[a]);
  }
  console.log(this.canvas.getChildIndex(this.selectedObjectContainer));
};
Entry.Stage.prototype.createObjectContainer = function(b) {
  var a = new createjs.Container;
  a.scene = b;
  return a;
};
Entry.Stage.prototype.removeObjectContainer = function(b) {
  var a = this.objectContainers;
  b = this.getObjectContainerByScene(b);
  this.canvas.removeChild(b);
  a.splice(this.objectContainers.indexOf(b), 1);
};
Entry.Stage.prototype.getObjectContainerByScene = function(b) {
  for (var a = this.objectContainers, c = 0;c < a.length;c++) {
    if (a[c].scene.id == b.id) {
      return a[c];
    }
  }
};
Entry.Stage.prototype.moveSprite = function(b) {
  if (this.selectedObject && Entry.stage.focused && !this.selectedObject.getLock()) {
    var a = 5;
    b.shiftKey && (a = 1);
    var c = this.selectedObject.entity;
    switch(b.keyCode) {
      case 38:
        c.setY(c.getY() + a);
        break;
      case 40:
        c.setY(c.getY() - a);
        break;
      case 37:
        c.setX(c.getX() - a);
        break;
      case 39:
        c.setX(c.getX() + a);
    }
    this.updateObject();
  }
};
Entry.StampEntity = function(b, a) {
  this.parent = b;
  this.type = b.objectType;
  this.isStamp = this.isClone = !0;
  this.width = a.getWidth();
  this.height = a.getHeight();
  "sprite" == this.type && (this.object = a.object.clone(!0), this.object.filters = null, a.effect && (this.effect = Entry.cloneSimpleObject(a.effect), this.applyFilter()));
  this.object.entity = this;
  if (a.dialog) {
    var c = a.dialog;
    new Entry.Dialog(this, c.message_, c.mode_, !0);
    this.dialog.object = a.dialog.object.clone(!0);
    Entry.stage.loadDialog(this.dialog);
  }
};
var EntityPrototype = Entry.EntityObject.prototype;
Entry.StampEntity.prototype.applyFilter = EntityPrototype.applyFilter;
Entry.StampEntity.prototype.removeClone = EntityPrototype.removeClone;
Entry.StampEntity.prototype.getWidth = EntityPrototype.getWidth;
Entry.StampEntity.prototype.getHeight = EntityPrototype.getHeight;
Entry.State = function(b, a, c, d) {
  this.caller = a;
  this.func = c;
  3 < arguments.length && (this.params = Array.prototype.slice.call(arguments).slice(3));
  this.message = b;
  this.time = Entry.getUpTime();
};
Entry.State.prototype.generateMessage = function() {
};
Entry.StateManager = function() {
  this.undoStack_ = [];
  this.redoStack_ = [];
  this.isIgnore = this.isRestore = !1;
  Entry.addEventListener("cancelLastCommand", function(b) {
    Entry.stateManager.cancelLastCommand();
  });
  Entry.addEventListener("run", function(b) {
    Entry.stateManager.updateView();
  });
  Entry.addEventListener("stop", function(b) {
    Entry.stateManager.updateView();
  });
  Entry.addEventListener("saveWorkspace", function(b) {
    Entry.stateManager.addStamp();
  });
  Entry.addEventListener("undo", function(b) {
    Entry.stateManager.undo();
  });
  Entry.addEventListener("redo", function(b) {
    Entry.stateManager.redo();
  });
};
Entry.StateManager.prototype.generateView = function(b, a) {
};
Entry.StateManager.prototype.addCommand = function(b, a, c, d) {
  if (!this.isIgnoring()) {
    if (this.isRestoring()) {
      var e = new Entry.State, f = Array.prototype.slice.call(arguments);
      Entry.State.prototype.constructor.apply(e, f);
      this.redoStack_.push(e);
      Entry.reporter && Entry.reporter.report(e);
    } else {
      e = new Entry.State, f = Array.prototype.slice.call(arguments), Entry.State.prototype.constructor.apply(e, f), this.undoStack_.push(e), Entry.reporter && Entry.reporter.report(e), this.updateView();
    }
    Entry.dispatchEvent("saveLocalStorageProject");
  }
};
Entry.StateManager.prototype.cancelLastCommand = function() {
  this.canUndo() && (this.undoStack_.pop(), this.updateView(), Entry.dispatchEvent("saveLocalStorageProject"));
};
Entry.StateManager.prototype.undo = function() {
  if (this.canUndo() && !this.isRestoring()) {
    this.addActivity("undo");
    this.startRestore();
    var b = this.undoStack_.pop();
    b.func.apply(b.caller, b.params);
    this.updateView();
    this.endRestore();
    Entry.dispatchEvent("saveLocalStorageProject");
  }
};
Entry.StateManager.prototype.redo = function() {
  if (this.canRedo() && !this.isRestoring()) {
    this.addActivity("redo");
    var b = this.redoStack_.pop();
    b.func.apply(b.caller, b.params);
    this.updateView();
    Entry.dispatchEvent("saveLocalStorageProject");
  }
};
Entry.StateManager.prototype.updateView = function() {
  this.undoButton && this.redoButton && (this.canUndo() ? this.undoButton.addClass("active") : this.undoButton.removeClass("active"), this.canRedo() ? this.redoButton.addClass("active") : this.redoButton.removeClass("active"));
};
Entry.StateManager.prototype.startRestore = function() {
  this.isRestore = !0;
};
Entry.StateManager.prototype.endRestore = function() {
  this.isRestore = !1;
};
Entry.StateManager.prototype.isRestoring = function() {
  return this.isRestore;
};
Entry.StateManager.prototype.startIgnore = function() {
  this.isIgnore = !0;
};
Entry.StateManager.prototype.endIgnore = function() {
  this.isIgnore = !1;
};
Entry.StateManager.prototype.isIgnoring = function() {
  return this.isIgnore;
};
Entry.StateManager.prototype.canUndo = function() {
  return 0 < this.undoStack_.length && Entry.engine.isState("stop");
};
Entry.StateManager.prototype.canRedo = function() {
  return 0 < this.redoStack_.length && Entry.engine.isState("stop");
};
Entry.StateManager.prototype.addStamp = function() {
  this.stamp = Entry.generateHash();
  this.undoStack_.length && (this.undoStack_[this.undoStack_.length - 1].stamp = this.stamp);
};
Entry.StateManager.prototype.isSaved = function() {
  return 0 === this.undoStack_.length || this.undoStack_[this.undoStack_.length - 1].stamp == this.stamp && "string" == typeof this.stamp;
};
Entry.StateManager.prototype.addActivity = function(b) {
  Entry.reporter && Entry.reporter.report(new Entry.State(b));
};
Entry.Toast = function() {
  this.toasts_ = [];
  var b = document.getElementById("entryToastContainer");
  b && document.body.removeChild(b);
  this.body_ = Entry.createElement("div", "entryToastContainer");
  this.body_.addClass("entryToastContainer");
  document.body.appendChild(this.body_);
};
Entry.Toast.prototype.warning = function(b, a, c) {
  var d = Entry.createElement("div", "entryToast");
  d.addClass("entryToast");
  d.addClass("entryToastWarning");
  d.bindOnClick(function() {
    Entry.toast.body_.removeChild(this);
  });
  var e = Entry.createElement("div", "entryToast");
  e.addClass("entryToastTitle");
  e.innerHTML = b;
  d.appendChild(e);
  b = Entry.createElement("p", "entryToast");
  b.addClass("entryToastMessage");
  b.innerHTML = a;
  d.appendChild(b);
  this.toasts_.push(d);
  this.body_.appendChild(d);
  c || window.setTimeout(function() {
    d.style.opacity = 1;
    var a = setInterval(function() {
      .05 > d.style.opacity && (clearInterval(a), d.style.display = "none", Entry.removeElement(d));
      d.style.opacity *= .9;
    }, 20);
  }, 1E3);
};
Entry.Toast.prototype.success = function(b, a, c) {
  var d = Entry.createElement("div", "entryToast");
  d.addClass("entryToast");
  d.addClass("entryToastSuccess");
  d.bindOnClick(function() {
    Entry.toast.body_.removeChild(this);
  });
  var e = Entry.createElement("div", "entryToast");
  e.addClass("entryToastTitle");
  e.innerHTML = b;
  d.appendChild(e);
  b = Entry.createElement("p", "entryToast");
  b.addClass("entryToastMessage");
  b.innerHTML = a;
  d.appendChild(b);
  this.toasts_.push(d);
  this.body_.appendChild(d);
  c || window.setTimeout(function() {
    d.style.opacity = 1;
    var a = setInterval(function() {
      .05 > d.style.opacity && (clearInterval(a), d.style.display = "none", Entry.removeElement(d));
      d.style.opacity *= .9;
    }, 20);
  }, 1E3);
};
Entry.Toast.prototype.alert = function(b, a, c) {
  var d = Entry.createElement("div", "entryToast");
  d.addClass("entryToast");
  d.addClass("entryToastAlert");
  d.bindOnClick(function() {
    Entry.toast.body_.removeChild(this);
  });
  var e = Entry.createElement("div", "entryToast");
  e.addClass("entryToastTitle");
  e.innerHTML = b;
  d.appendChild(e);
  b = Entry.createElement("p", "entryToast");
  b.addClass("entryToastMessage");
  b.innerHTML = a;
  d.appendChild(b);
  this.toasts_.push(d);
  this.body_.appendChild(d);
  c || window.setTimeout(function() {
    d.style.opacity = 1;
    var a = setInterval(function() {
      .05 > d.style.opacity && (clearInterval(a), d.style.display = "none", Entry.toast.body_.removeChild(d));
      d.style.opacity *= .9;
    }, 20);
  }, 5E3);
};
Entry.TvCast = function(b) {
  this.generateView(b);
};
p = Entry.TvCast.prototype;
p.init = function(b) {
  this.tvCastHash = b;
};
p.generateView = function(b) {
  var a = Entry.createElement("div");
  a.addClass("entryContainerMovieWorkspace");
  a.addClass("entryHidden");
  this.movieContainer = a;
  a = Entry.createElement("iframe");
  a.setAttribute("id", "tvCastIframe");
  a.setAttribute("allowfullscreen", "");
  a.setAttribute("frameborder", 0);
  a.setAttribute("src", b);
  this.movieFrame = a;
  this.movieContainer.appendChild(this.movieFrame);
};
p.getView = function() {
  return this.movieContainer;
};
p.resize = function() {
  var b = document.getElementById("entryContainerWorkspaceId"), a = document.getElementById("tvCastIframe");
  w = b.offsetWidth;
  a.width = w + "px";
  a.height = 9 * w / 16 + "px";
};
Entry.ContextMenu = {};
(function(b) {
  b.createDom = function() {
    this.dom = Entry.Dom("ul", {id:"entry-contextmenu", parent:$("body")});
    Entry.Utils.disableContextmenu(this.dom);
    Entry.documentMousedown.attach(this, function() {
      this.hide();
    });
  };
  b.show = function(a, b) {
    this.dom || this.createDom();
    if (0 !== a.length) {
      var d = this;
      void 0 !== b && (this._className = b, this.dom.addClass(b));
      var e = this.dom;
      e.empty();
      for (var f = 0, g = a.length;f < g;f++) {
        var h = a[f], k = h.text, l = !1 !== h.enable, q = Entry.Dom("li", {class:l ? "menuAble" : "menuDisable", parent:e});
        q.text(k);
        l && h.callback && function(a, b) {
          a.mousedown(function(a) {
            a.preventDefault();
            d.hide();
            b(a);
          });
        }(q, h.callback);
      }
      e.removeClass("entryRemove");
      this.position(Entry.mouseCoordinate);
    }
  };
  b.position = function(a) {
    var b = this.dom;
    b.css({left:0, top:0});
    var d = b.width(), e = b.height(), f = $(window), g = f.width(), f = f.height();
    a.x + d > g && (a.x -= d + 3);
    a.y + e > f && (a.y -= e);
    b.css({left:a.x, top:a.y});
  };
  b.hide = function() {
    this.dom.empty();
    this.dom.addClass("entryRemove");
    this._className && (this.dom.removeClass(this._className), delete this._className);
  };
})(Entry.ContextMenu);
Entry.STATIC = {OBJECT:0, ENTITY:1, SPRITE:2, SOUND:3, VARIABLE:4, FUNCTION:5, SCENE:6, MESSAGE:7, BLOCK_MODEL:8, BLOCK_RENDER_MODEL:9, BOX_MODEL:10, THREAD_MODEL:11, DRAG_INSTANCE:12, BLOCK_STATIC:0, BLOCK_MOVE:1, BLOCK_FOLLOW:2, RETURN:0, CONTINUE:1};
Entry.Utils = {};
Entry.overridePrototype = function() {
  Number.prototype.mod = function(b) {
    return (this % b + b) % b;
  };
};
Entry.Utils.generateId = function() {
  return ("0000" + (Math.random() * Math.pow(36, 4) << 0).toString(36)).substr(-4);
};
Entry.Utils.intersectArray = function(b, a) {
  for (var c = [], d = 0;d < b.length;d++) {
    for (var e = 0;e < a.length;e++) {
      if (b[d] == a[e]) {
        c.push(b[d]);
        break;
      }
    }
  }
  return c;
};
Entry.Utils.isPointInMatrix = function(b, a, c) {
  c = void 0 === c ? 0 : c;
  var d = b.offsetX ? b.x + b.offsetX : b.x, e = b.offsetY ? b.y + b.offsety : b.y;
  return d - c <= a.x && d + b.width + c >= a.x && e - c <= a.y && e + b.height + c >= a.y;
};
Entry.Utils.colorDarken = function(b, a) {
  var c, d, e;
  7 === b.length ? (c = parseInt(b.substr(1, 2), 16), d = parseInt(b.substr(3, 2), 16), e = parseInt(b.substr(5, 2), 16)) : (c = parseInt(b.substr(1, 2), 16), d = parseInt(b.substr(2, 2), 16), e = parseInt(b.substr(3, 2), 16));
  a = void 0 === a ? .7 : a;
  c = Math.floor(c * a).toString(16);
  d = Math.floor(d * a).toString(16);
  e = Math.floor(e * a).toString(16);
  return "#" + c + d + e;
};
Entry.Utils.bindGlobalEvent = function(b) {
  void 0 === b && (b = ["resize", "mousedown", "mousemove", "keydown", "keyup"]);
  !Entry.windowReszied && -1 < b.indexOf("resize") && (Entry.windowResized = new Entry.Event(window), $(window).on("resize", function(a) {
    Entry.windowResized.notify(a);
  }));
  !Entry.documentMousedown && -1 < b.indexOf("mousedown") && (Entry.documentMousedown = new Entry.Event(window), $(document).on("mousedown", function(a) {
    Entry.documentMousedown.notify(a);
  }));
  !Entry.documentMousemove && -1 < b.indexOf("mousemove") && (Entry.mouseCoordinate = {}, Entry.documentMousemove = new Entry.Event(window), $(document).on("mousemove", function(a) {
    Entry.documentMousemove.notify(a);
    Entry.mouseCoordinate.x = a.clientX;
    Entry.mouseCoordinate.y = a.clientY;
  }));
  !Entry.keyPressed && -1 < b.indexOf("keydown") && (Entry.pressedKeys = [], Entry.keyPressed = new Entry.Event(window), $(document).on("keydown", function(a) {
    var b = a.keyCode;
    0 > Entry.pressedKeys.indexOf(b) && Entry.pressedKeys.push(b);
    Entry.keyPressed.notify(a);
  }));
  !Entry.keyUpped && -1 < b.indexOf("keyup") && (Entry.keyUpped = new Entry.Event(window), $(document).on("keyup", function(a) {
    var b = Entry.pressedKeys.indexOf(a.keyCode);
    -1 < b && Entry.pressedKeys.splice(b, 1);
    Entry.keyUpped.notify(a);
  }));
};
Entry.Utils.makeActivityReporter = function() {
  Entry.activityReporter = new Entry.ActivityReporter;
  return Entry.activityReporter;
};
Entry.Utils.initEntryEvent_ = function() {
  Entry.events_ || (Entry.events_ = []);
};
Entry.sampleColours = [];
Entry.assert = function(b, a) {
  if (!b) {
    throw Error(a || "Assert failed");
  }
};
Entry.parseTexttoXML = function(b) {
  var a;
  window.ActiveXObject ? (a = new ActiveXObject("Microsoft.XMLDOM"), a.async = "false", a.loadXML(b)) : a = (new DOMParser).parseFromString(b, "text/xml");
  return a;
};
Entry.createElement = function(b, a) {
  var c = document.createElement(b);
  a && (c.id = a);
  c.hasClass = function(a) {
    return this.className.match(new RegExp("(\\s|^)" + a + "(\\s|$)"));
  };
  c.addClass = function(a) {
    for (var b = 0;b < arguments.length;b++) {
      a = arguments[b], this.hasClass(a) || (this.className += " " + a);
    }
  };
  c.removeClass = function(a) {
    for (var b = 0;b < arguments.length;b++) {
      a = arguments[b], this.hasClass(a) && (this.className = this.className.replace(new RegExp("(\\s|^)" + a + "(\\s|$)"), " "));
    }
  };
  c.bindOnClick = function(a) {
    $(this).on("click touchstart", function(b) {
      b.stopImmediatePropagation();
      b.handled || (b.handled = !0, a.call(this, b));
    });
  };
  return c;
};
Entry.makeAutolink = function(b) {
  return b ? b.replace(/(http|https|ftp|telnet|news|irc):\/\/([-/.a-zA-Z0-9_~#%$?&=:200-377()][^)\]}]+)/gi, "<a href='$1://$2' target='_blank'>$1://$2</a>").replace(/([xA1-xFEa-z0-9_-]+@[xA1-xFEa-z0-9-]+.[a-z0-9-]+)/gi, "<a href='mailto:$1'>$1</a>") : "";
};
Entry.generateHash = function() {
  return ("0000" + (Math.random() * Math.pow(36, 4) << 0).toString(36)).substr(-4);
};
Entry.addEventListener = function(b, a) {
  this.events_ || (this.events_ = {});
  this.events_[b] || (this.events_[b] = []);
  a instanceof Function && this.events_[b].push(a);
  return !0;
};
Entry.dispatchEvent = function(b, a) {
  this.events_ || (this.events_ = {});
  if (this.events_[b]) {
    for (var c = 0, d = this.events_[b].length;c < d;c++) {
      this.events_[b][c].call(window, a);
    }
  }
};
Entry.removeEventListener = function(b, a) {
  if (this.events_[b]) {
    for (var c = 0, d = this.events_[b].length;c < d;c++) {
      if (this.events_[b][c] === a) {
        this.events_[b].splice(c, 1);
        break;
      }
    }
  }
};
Entry.removeAllEventListener = function(b) {
  this.events_ && this.events_[b] && delete this.events_[b];
};
Entry.addTwoNumber = function(b, a) {
  if (isNaN(b) || isNaN(a)) {
    return b + a;
  }
  b += "";
  a += "";
  var c = b.indexOf("."), d = a.indexOf("."), e = 0, f = 0;
  0 < c && (e = b.length - c - 1);
  0 < d && (f = a.length - d - 1);
  return 0 < e || 0 < f ? e >= f ? (parseFloat(b) + parseFloat(a)).toFixed(e) : (parseFloat(b) + parseFloat(a)).toFixed(f) : parseInt(b) + parseInt(a);
};
Entry.hex2rgb = function(b) {
  return (b = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(b)) ? {r:parseInt(b[1], 16), g:parseInt(b[2], 16), b:parseInt(b[3], 16)} : null;
};
Entry.rgb2hex = function(b, a, c) {
  return "#" + (16777216 + (b << 16) + (a << 8) + c).toString(16).slice(1);
};
Entry.generateRgb = function() {
  return {r:Math.floor(256 * Math.random()), g:Math.floor(256 * Math.random()), b:Math.floor(256 * Math.random())};
};
Entry.adjustValueWithMaxMin = function(b, a, c) {
  return b > c ? c : b < a ? a : b;
};
Entry.isExist = function(b, a, c) {
  for (var d = 0;d < c.length;d++) {
    if (c[d][a] == b) {
      return c[d];
    }
  }
  return !1;
};
Entry.getColourCodes = function() {
  return "transparent #660000 #663300 #996633 #003300 #003333 #003399 #000066 #330066 #660066 #FFFFFF #990000 #993300 #CC9900 #006600 #336666 #0033FF #000099 #660099 #990066 #000000 #CC0000 #CC3300 #FFCC00 #009900 #006666 #0066FF #0000CC #663399 #CC0099 #333333 #FF0000 #FF3300 #FFFF00 #00CC00 #009999 #0099FF #0000FF #9900CC #FF0099 #666666 #CC3333 #FF6600 #FFFF33 #00FF00 #00CCCC #00CCFF #3366FF #9933FF #FF00FF #999999 #FF6666 #FF6633 #FFFF66 #66FF66 #66CCCC #00FFFF #3399FF #9966FF #FF66FF #BBBBBB #FF9999 #FF9966 #FFFF99 #99FF99 #66FFCC #99FFFF #66CCff #9999FF #FF99FF #CCCCCC #FFCCCC #FFCC99 #FFFFCC #CCFFCC #99FFCC #CCFFFF #99CCFF #CCCCFF #FFCCFF".split(" ");
};
Entry.removeElement = function(b) {
  b && b.parentNode && b.parentNode.removeChild(b);
};
Entry.getElementsByClassName = function(b) {
  for (var a = [], c = document.getElementsByTagName("*"), d = 0;d < c.length;d++) {
    -1 < (" " + c[d].className + " ").indexOf(" " + b + " ") && a.push(c[d]);
  }
  return a;
};
Entry.parseNumber = function(b) {
  return "string" != typeof b || isNaN(Number(b)) ? "number" != typeof b || isNaN(Number(b)) ? !1 : b : Number(b);
};
Entry.countStringLength = function(b) {
  var a, c = 0;
  for (a = 0;a < b.length;a++) {
    255 < b.charCodeAt(a) ? c += 2 : c++;
  }
  return c;
};
Entry.cutStringByLength = function(b, a) {
  var c, d = 0;
  for (c = 0;d < a && c < b.length;c++) {
    255 < b.charCodeAt(c) ? d += 2 : d++;
  }
  return b.substr(0, c);
};
Entry.isChild = function(b, a) {
  if (!a) {
    for (;a.parentNode;) {
      if ((a = a.parentNode) == b) {
        return !0;
      }
    }
  }
  return !1;
};
Entry.launchFullScreen = function(b) {
  b.requestFullscreen ? b.requestFullscreen() : b.mozRequestFulScreen ? b.mozRequestFulScreen() : b.webkitRequestFullscreen ? b.webkitRequestFullscreen() : b.msRequestFullScreen && b.msRequestFullScreen();
};
Entry.exitFullScreen = function() {
  document.exitFullScreen ? document.exitFullScreen() : document.mozCancelFullScreen ? document.mozCancelFullScreen() : document.webkitExitFullscreen && document.webkitExitFullscreen();
};
Entry.isPhone = function() {
  return !1;
};
Entry.getKeyCodeMap = function() {
  return {65:"a", 66:"b", 67:"c", 68:"d", 69:"e", 70:"f", 71:"g", 72:"h", 73:"i", 74:"j", 75:"k", 76:"l", 77:"m", 78:"n", 79:"o", 80:"p", 81:"q", 82:"r", 83:"s", 84:"t", 85:"u", 86:"v", 87:"w", 88:"x", 89:"y", 90:"z", 32:Lang.Blocks.START_press_some_key_space, 37:Lang.Blocks.START_press_some_key_left, 38:Lang.Blocks.START_press_some_key_up, 39:Lang.Blocks.START_press_some_key_right, 40:Lang.Blocks.START_press_some_key_down, 48:"0", 49:"1", 50:"2", 51:"3", 52:"4", 53:"5", 54:"6", 55:"7", 56:"8", 57:"9", 
  13:Lang.Blocks.START_press_some_key_enter};
};
Entry.checkCollisionRect = function(b, a) {
  return !(b.y + b.height < a.y || b.y > a.y + a.height || b.x + b.width < a.x || b.x > a.x + a.width);
};
Entry.bindAnimationCallback = function(b, a) {
  b.addEventListener("webkitAnimationEnd", a, !1);
  b.addEventListener("animationend", a, !1);
  b.addEventListener("oanimationend", a, !1);
};
Entry.cloneSimpleObject = function(b) {
  var a = {}, c;
  for (c in b) {
    a[c] = b[c];
  }
  return a;
};
Entry.nodeListToArray = function(b) {
  for (var a = Array(b.length), c = -1, d = b.length;++c !== d;a[c] = b[c]) {
  }
  return a;
};
Entry.computeInputWidth = function(b) {
  var a = document.createElement("span");
  a.className = "tmp-element";
  a.innerHTML = b.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  document.body.appendChild(a);
  b = a.offsetWidth;
  document.body.removeChild(a);
  return Number(b + 10) + "px";
};
Entry.isArrowOrBackspace = function(b) {
  return -1 < [37, 38, 39, 40, 8].indexOf(b);
};
Entry.hexStringToBin = function(b) {
  for (var a = [], c = 0;c < b.length - 1;c += 2) {
    a.push(parseInt(b.substr(c, 2), 16));
  }
  return String.fromCharCode.apply(String, a);
};
Entry.findObjsByKey = function(b, a, c) {
  for (var d = [], e = 0;e < b.length;e++) {
    b[e][a] == c && d.push(b[e]);
  }
  return d;
};
Entry.factorials = [];
Entry.factorial = function(b) {
  return 0 === b || 1 == b ? 1 : 0 < Entry.factorials[b] ? Entry.factorials[b] : Entry.factorials[b] = Entry.factorial(b - 1) * b;
};
Entry.getListRealIndex = function(b, a) {
  if (isNaN(b)) {
    switch(b) {
      case "FIRST":
        b = 1;
        break;
      case "LAST":
        b = a.array_.length;
        break;
      case "RANDOM":
        b = Math.floor(Math.random() * a.array_.length) + 1;
    }
  }
  return b;
};
Entry.toRadian = function(b) {
  return b * Math.PI / 180;
};
Entry.toDegrees = function(b) {
  return 180 * b / Math.PI;
};
Entry.getPicturesJSON = function(b) {
  for (var a = [], c = 0, d = b.length;c < d;c++) {
    var e = b[c], f = {};
    f._id = e._id;
    f.id = e.id;
    f.dimension = e.dimension;
    f.filename = e.filename;
    f.fileurl = e.fileurl;
    f.name = e.name;
    f.scale = e.scale;
    a.push(f);
  }
  return a;
};
Entry.getSoundsJSON = function(b) {
  for (var a = [], c = 0, d = b.length;c < d;c++) {
    var e = b[c], f = {};
    f._id = e._id;
    f.duration = e.duration;
    f.ext = e.ext;
    f.id = e.id;
    f.filename = e.filename;
    f.fileurl = e.fileurl;
    f.name = e.name;
    a.push(f);
  }
  return a;
};
Entry.cutDecimal = function(b) {
  return Math.round(100 * b) / 100;
};
Entry.getBrowserType = function() {
  if (Entry.userAgent) {
    return Entry.userAgent;
  }
  var b = navigator.userAgent, a, c = b.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
  if (/trident/i.test(c[1])) {
    return a = /\brv[ :]+(\d+)/g.exec(b) || [], "IE " + (a[1] || "");
  }
  if ("Chrome" === c[1] && (a = b.match(/\b(OPR|Edge)\/(\d+)/), null != a)) {
    return a.slice(1).join(" ").replace("OPR", "Opera");
  }
  c = c[2] ? [c[1], c[2]] : [navigator.appName, navigator.appVersion, "-?"];
  null != (a = b.match(/version\/(\d+)/i)) && c.splice(1, 1, a[1]);
  b = c.join(" ");
  return Entry.userAgent = b;
};
Entry.setBasicBrush = function(b) {
  var a = new createjs.Graphics;
  a.thickness = 1;
  a.rgb = Entry.hex2rgb("#ff0000");
  a.opacity = 100;
  a.setStrokeStyle(1);
  a.beginStroke("rgba(255,0,0,1)");
  var c = new createjs.Shape(a);
  Entry.stage.selectedObjectContainer.addChild(c);
  b.brush && (b.brush = null);
  b.brush = a;
  b.shape && (b.shape = null);
  b.shape = c;
};
Entry.setCloneBrush = function(b, a) {
  var c = new createjs.Graphics;
  c.thickness = a.thickness;
  c.rgb = a.rgb;
  c.opacity = a.opacity;
  c.setStrokeStyle(c.thickness);
  c.beginStroke("rgba(" + c.rgb.r + "," + c.rgb.g + "," + c.rgb.b + "," + c.opacity / 100 + ")");
  var d = new createjs.Shape(c);
  Entry.stage.selectedObjectContainer.addChild(d);
  b.brush && (b.brush = null);
  b.brush = c;
  b.shape && (b.shape = null);
  b.shape = d;
};
Entry.isFloat = function(b) {
  return /\d+\.{1}\d+/.test(b);
};
Entry.getStringIndex = function(b) {
  if (!b) {
    return "";
  }
  for (var a = {string:b, index:1}, c = 0, d = [], e = b.length - 1;0 < e;--e) {
    var f = b.charAt(e);
    if (isNaN(f)) {
      break;
    } else {
      d.unshift(f), c = e;
    }
  }
  0 < c && (a.string = b.substring(0, c), a.index = parseInt(d.join("")) + 1);
  return a;
};
Entry.getOrderedName = function(b, a, c) {
  if (!b) {
    return "untitled";
  }
  if (!a || 0 === a.length) {
    return b;
  }
  c || (c = "name");
  for (var d = 0, e = Entry.getStringIndex(b), f = 0, g = a.length;f < g;f++) {
    var h = Entry.getStringIndex(a[f][c]);
    e.string === h.string && h.index > d && (d = h.index);
  }
  return 0 < d ? e.string + d : b;
};
Entry.changeXmlHashId = function(b) {
  if (/function_field/.test(b.getAttribute("type"))) {
    for (var a = b.getElementsByTagName("mutation"), c = 0, d = a.length;c < d;c++) {
      a[c].setAttribute("hashid", Entry.generateHash());
    }
  }
  return b;
};
Entry.getMaxFloatPoint = function(b) {
  for (var a = 0, c = 0, d = b.length;c < d;c++) {
    var e = String(b[c]), f = e.indexOf(".");
    -1 !== f && (e = e.length - (f + 1), e > a && (a = e));
  }
  return Math.min(a, 20);
};
Entry.convertToRoundedDecimals = function(b, a) {
  return isNaN(b) || !this.isFloat(b) ? b : Number(Math.round(b + "e" + a) + "e-" + a);
};
Entry.attachEventListener = function(b, a, c) {
  setTimeout(function() {
    b.addEventListener(a, c);
  }, 0);
};
Entry.deAttachEventListener = function(b, a, c) {
  b.removeEventListener(a, c);
};
Entry.isEmpty = function(b) {
  if (!b) {
    return !0;
  }
  for (var a in b) {
    if (b.hasOwnProperty(a)) {
      return !1;
    }
  }
  return !0;
};
Entry.Utils.disableContextmenu = function(b) {
  if (b) {
    $(b).on("contextmenu", function(a) {
      a.stopPropagation();
      a.preventDefault();
      return !1;
    });
  }
};
Entry.Utils.isRightButton = function(b) {
  return 2 == b.button || b.ctrlKey;
};
Entry.Utils.COLLISION = {NONE:0, UP:1, RIGHT:2, LEFT:3, DOWN:4};
Entry.Model = function(b, a) {
  var c = Entry.Model;
  c.generateSchema(b);
  c.generateSetter(b);
  c.generateObserve(b);
  (void 0 === a || a) && Object.seal(b);
  return b;
};
(function(b) {
  b.generateSchema = function(a) {
    var b = a.schema;
    if (void 0 !== b) {
      b = JSON.parse(JSON.stringify(b));
      a.data = {};
      for (var d in b) {
        (function(d) {
          a.data[d] = b[d];
          Object.defineProperty(a, d, {get:function() {
            return a.data[d];
          }});
        })(d);
      }
      a._toJSON = this._toJSON;
    }
  };
  b.generateSetter = function(a) {
    a.set = this.set;
  };
  b.set = function(a, b) {
    var d = {}, e;
    for (e in this.data) {
      void 0 !== a[e] && (a[e] === this.data[e] ? delete a[e] : (d[e] = this.data[e], this.data[e] = a[e]));
    }
    b || this.notify(Object.keys(a), d);
  };
  b.generateObserve = function(a) {
    a.observers = [];
    a.observe = this.observe;
    a.unobserve = this.unobserve;
    a.notify = this.notify;
  };
  b.observe = function(a, b, d, e) {
    d = new Entry.Observer(this.observers, a, b, d);
    if (!1 !== e) {
      a[b]([]);
    }
    return d;
  };
  b.unobserve = function(a) {
    a.destroy();
  };
  b.notify = function(a, b) {
    "string" === typeof a && (a = [a]);
    var d = this;
    d.observers.map(function(e) {
      var f = a;
      void 0 !== e.attrs && (f = Entry.Utils.intersectArray(e.attrs, a));
      if (f.length) {
        e.object[e.funcName](f.map(function(a) {
          return {name:a, object:d, oldValue:b[a]};
        }));
      }
    });
  };
  b._toJSON = function() {
    var a = {}, b;
    for (b in this.data) {
      a[b] = this.data[b];
    }
    return a;
  };
})(Entry.Model);
Entry.Func = function() {
  this.id = Entry.generateHash();
  this.content = Blockly.Xml.textToDom(Entry.Func.CREATE_BLOCK);
  this.block = null;
  this.stringHash = {};
  this.booleanHash = {};
};
Entry.Func.threads = {};
Entry.Func.registerFunction = function(b, a) {
  var c = Entry.generateHash(), d = Entry.variableContainer.getFunction(b), e = new Entry.Script(a);
  e.init(d.content.childNodes[0]);
  this.threads[c] = e;
  return c;
};
Entry.Func.executeFunction = function(b) {
  var a = this.threads[b];
  if (a = Entry.Engine.computeThread(a.entity, a)) {
    return this.threads[b] = a, !0;
  }
  delete this.threads[b];
  return !1;
};
Entry.Func.clearThreads = function() {
  this.threads = {};
};
Entry.Func.prototype.init = function(b) {
  this.id = b.id;
  this.content = Blockly.Xml.textToDom(b.content);
  this.block = Blockly.Xml.textToDom("<xml>" + b.block + "</xml>").childNodes[0];
};
Entry.Func.CREATE_BTN = '<xml><btn text="Lang.Workspace.create_function" onclick="Entry.variableContainer.createFunction()"></btn></xml>';
Entry.Func.createBtn = Entry.nodeListToArray(Blockly.Xml.textToDom(Entry.Func.CREATE_BTN).childNodes);
Entry.Func.FIELD_BLOCK = '<xml><block type="function_field_label"></block><block type="function_field_string"><value name="PARAM"><block type="function_param_string"><mutation hashid="#1"/></block></value></block><block type="function_field_boolean"><value name="PARAM"><block type="function_param_boolean"><mutation hashid="#2"/></block></value></block></xml>';
Entry.Func.fieldBlocks = Entry.nodeListToArray(Blockly.Xml.textToDom(Entry.Func.FIELD_BLOCK).childNodes);
Entry.Func.CREATE_BLOCK = '<xml><block type="function_create" deletable="false" x="28" y="28"></block></xml>';
Entry.Func.edit = function(b) {
  this.srcFName = "";
  for (var a = $(b.content.innerHTML).find("field"), c = 0;c < a.length;c++) {
    "NAME" === $(a[c]).attr("name") && (this.srcFName += $(a[c]).text(), this.srcFName += " ");
  }
  this.srcFName = this.srcFName.trim();
  this.cancelEdit();
  this.workspace && (this.workspace.visible = !0);
  this.initEditView();
  this.targetFunc = b;
  this.workspace.clear();
  Blockly.Xml.domToWorkspace(this.workspace, b.content);
  this.updateMenu();
  this.position_();
};
Entry.Func.initEditView = function() {
  this.parentView = Entry.playground.blocklyView_;
  if (!this.svg) {
    this.svg = Blockly.createSvgElement("svg", {xmlns:"http://www.w3.org/2000/svg", "xmlns:html":"http://www.w3.org/1999/xhtml", "xmlns:xlink":"http://www.w3.org/1999/xlink", version:"1.1", "class":"blocklySvg entryFunctionEdit"});
    this.workspace = new Blockly.Workspace;
    this.workspace.visible = !0;
    this.generateButtons();
    this.svg.appendChild(this.workspace.createDom());
    this.workspace.scrollbar = new Blockly.ScrollbarPair(this.workspace);
    var b = this.workspace.scrollbar;
    b.resize();
    this.workspace.addTrashcan();
    Blockly.bindEvent_(window, "resize", b, b.resize);
    document.addEventListener("blocklyWorkspaceChange", this.syncFunc, !1);
    var a = this.workspace;
    Blockly.bindEvent_(this.svg, "mousedown", null, function(b) {
      a.dragMode = !0;
      a.startDragMouseX = b.clientX;
      a.startDragMouseY = b.clientY;
      a.startDragMetrics = a.getMetrics();
      a.startScrollX = a.scrollX;
      a.startScrollY = a.scrollY;
    });
    Blockly.bindEvent_(this.svg, "mousemove", null, function(c) {
      var d = b.hScroll;
      b.hScroll.svgGroup_.setAttribute("opacity", "1");
      d.svgGroup_.setAttribute("opacity", "1");
      if (a.dragMode) {
        Blockly.removeAllRanges();
        var d = a.startDragMetrics, e = a.startScrollX + (c.clientX - a.startDragMouseX);
        c = a.startScrollY + (c.clientY - a.startDragMouseY);
        e = Math.min(e, -d.contentLeft);
        c = Math.min(c, -d.contentTop);
        e = Math.max(e, d.viewWidth - d.contentLeft - d.contentWidth);
        c = Math.max(c, d.viewHeight - d.contentTop - d.contentHeight);
        b.set(-e - d.contentLeft, -c - d.contentTop);
      }
    });
    Blockly.bindEvent_(this.svg, "mouseup", null, function(b) {
      a.dragMode = !1;
    });
  }
  Blockly.mainWorkspace.blockMenu.targetWorkspace = this.workspace;
  this.doWhenInit();
  this.parentView.appendChild(this.svg);
};
Entry.Func.save = function() {
  var b = "";
  this.targetFunc.content = Blockly.Xml.workspaceToDom(this.workspace);
  this.targetFunc.generateBlock(!0);
  Entry.variableContainer.saveFunction(this.targetFunc);
  for (var a = $(this.targetFunc.content.innerHTML).find("field"), c = 0;c < a.length;c++) {
    "NAME" === $(a[c]).attr("name") && (b += $(a[c]).text(), b += " ");
  }
  b = b.trim();
  this.syncFuncName(b);
  this.cancelEdit();
};
Entry.Func.syncFuncName = function(b) {
  var a = 0, c = [], c = b.split(" "), d = "";
  b = [];
  b = Blockly.mainWorkspace.getAllBlocks();
  for (var e = 0;e < b.length;e++) {
    var f = b[e];
    if ("function_general" === f.type) {
      for (var g = [], g = f.inputList, h = 0;h < g.length;h++) {
        f = g[h], 0 < f.fieldRow.length && f.fieldRow[0] instanceof Blockly.FieldLabel && void 0 != f.fieldRow[0].text_ && (d += f.fieldRow[0].text_, d += " ");
      }
      d = d.trim();
      if (d === this.srcFName && this.srcFName.split(" ").length == c.length) {
        for (d = 0;d < g.length;d++) {
          if (f = g[d], 0 < f.fieldRow.length && f.fieldRow[0] instanceof Blockly.FieldLabel && void 0 != f.fieldRow[0].text_) {
            if (void 0 === c[a]) {
              g.splice(d, 1);
              break;
            } else {
              f.fieldRow[0].text_ = c[a];
            }
            a++;
          }
        }
      }
      d = "";
      a = 0;
    }
  }
  a = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);
  Blockly.mainWorkspace.clear();
  Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, a);
};
Entry.Func.cancelEdit = function() {
  this.svg && this.targetFunc && (this.workspace.visible = !1, this.parentView.removeChild(this.svg), Entry.Func.isEdit = !1, Blockly.mainWorkspace.blockMenu.targetWorkspace = Blockly.mainWorkspace, this.targetFunc.block || (delete Entry.variableContainer.functions_[this.targetFunc.id], delete Entry.variableContainer.selected), delete this.targetFunc, this.updateMenu(), this.doWhenCancel(), Entry.variableContainer.updateList());
};
Entry.Func.getMenuXml = function() {
  var b = [];
  this.targetFunc || (b = b.concat(this.createBtn));
  if (this.targetFunc) {
    var a = this.FIELD_BLOCK, a = a.replace("#1", Entry.generateHash()), a = a.replace("#2", Entry.generateHash()), a = Blockly.Xml.textToDom(a).childNodes, b = b.concat(Entry.nodeListToArray(a))
  }
  for (var c in Entry.variableContainer.functions_) {
    a = Entry.variableContainer.functions_[c], a === this.targetFunc ? (a = Entry.Func.generateBlock(this.targetFunc, Blockly.Xml.workspaceToDom(Entry.Func.workspace), a.id).block, b.push(a)) : b.push(a.block);
  }
  return b;
};
Entry.Func.syncFunc = function() {
  var b = Entry.Func;
  if (b.targetFunc) {
    var a = b.workspace.topBlocks_[0].toString(), c = b.workspace.topBlocks_.length;
    (b.fieldText != a || b.workspaceLength != c) && 1 > Blockly.Block.dragMode_ && (b.updateMenu(), b.fieldText = a, b.workspaceLength = c);
  }
};
Entry.Func.updateMenu = function() {
  if ("func" == Entry.playground.selectedMenu && (Entry.playground.blockMenu.hide(), Entry.playground.blockMenu.show(Entry.Func.getMenuXml()), !Blockly.WidgetDiv.field_ && Entry.Func.targetFunc)) {
    var b = Entry.Func.targetFunc, a = Blockly.Xml.workspaceToDom(Entry.Func.workspace), c = a.getElementsByClassName("function_general"), d = b.id, e, c = Entry.nodeListToArray(c), f = [], g = {};
    c.map(function(a) {
      var b = a.getElementsByTagName("mutation")[0].getAttribute("hashid");
      b == d ? f.push(a) : (g[b] || (g[b] = []), g[b].push(a));
    });
    f.map(function(b) {
      e = Entry.Func.generateWsBlock(a, Blockly.Xml.workspaceToDom(Entry.Func.workspace), d).block;
      for (var c = [], f = !1;b.firstChild;) {
        var g = b.firstChild, h = g.tagName;
        if (f || "NEXT" == h) {
          f = !0, c.push(g);
        }
        b.removeChild(g);
      }
      for (;e.firstChild;) {
        b.appendChild(e.firstChild);
      }
      for (;c.length;) {
        b.appendChild(c.shift());
      }
    });
    for (var h in g) {
      var b = g[h], k = Entry.variableContainer.getFunction(h).content;
      b.map(function(b) {
        e = Entry.Func.generateWsBlock(a, k, h).block;
        for (var c = [], d = !1;b.firstChild;) {
          var f = b.firstChild, g = f.tagName;
          if (d || "NEXT" == g) {
            d = !0, c.push(f);
          }
          b.removeChild(f);
        }
        for (;e.firstChild;) {
          b.appendChild(e.firstChild);
        }
        for (;c.length;) {
          b.appendChild(c.shift());
        }
      });
    }
    Entry.Func.workspace.clear();
    Blockly.Xml.domToWorkspace(Entry.Func.workspace, a);
  }
};
Entry.Func.prototype.edit = function() {
  Entry.Func.isEdit || (Entry.Func.isEdit = !0, Entry.Func.svg ? this.parentView.appendChild(this.svg) : Entry.Func.initEditView());
};
Entry.Func.generateBlock = function(b, a, c) {
  a = Entry.nodeListToArray(a.childNodes);
  var d, e;
  for (e in a) {
    "function_create" == a[e].getAttribute("type") && (d = a[e]);
  }
  e = new Entry.Script;
  e.init(d);
  d = e;
  d.values && (d = e.values.FIELD);
  e = '<mutation hashid="' + c + '">';
  c = a = "";
  var f = 0, g = 0;
  b.stringHash = {};
  for (b.booleanHash = {};;) {
    switch(d.type) {
      case "function_field_label":
        e += '<field type="label" content="' + d.fields.NAME.replace("<", "&lt;").replace(">", "&gt;") + '"></field>';
        c += d.fields.NAME;
        break;
      case "function_field_boolean":
        var h = d.values.PARAM.hashId;
        e += '<field type="boolean" hashid="' + h + '"></field>';
        a += '<value name="' + h + '"><block type="True"></block></value>';
        b.booleanHash[h] = g;
        g++;
        c += "\ub17c\ub9ac\uac12" + g;
        break;
      case "function_field_string":
        h = d.values.PARAM.hashId, e += '<field type="string" hashid="' + h + '"></field>', a += '<value name="' + h + '"><block type="text"><field name="NAME">10</field></block></value>', b.stringHash[h] = f, f++, c += "\ubb38\uc790\uac12" + f;
    }
    if (d.values && d.values.NEXT) {
      d = d.values.NEXT;
    } else {
      break;
    }
    c += " ";
  }
  b = Blockly.Xml.textToDom('<xml><block type="function_general">' + (e + "</mutation>") + a + "</block></xml>").childNodes[0];
  c || (c = "\ud568\uc218");
  return {block:b, description:c};
};
Entry.Func.prototype.generateBlock = function(b) {
  b = Entry.Func.generateBlock(this, this.content, this.id);
  this.block = b.block;
  this.description = b.description;
};
Entry.Func.prototype.syncViewSize_ = function() {
  var b = this.parentView.getBoundingClientRect();
  this.svg.style.width = b.width;
  this.svg.style.height = b.height;
};
Entry.Func.generateButtons = function() {
  var b = this, a = Blockly.createSvgElement("g", {}, this.svg);
  this.btnWrapper = a;
  var c = Blockly.createSvgElement("text", {x:"27", y:"33", "class":"entryFunctionButtonText"}, a), d = document.createTextNode(Lang.Buttons.save);
  c.appendChild(d);
  var d = Blockly.createSvgElement("text", {x:"102.5", y:"33", "class":"entryFunctionButtonText"}, a), e = document.createTextNode(Lang.Buttons.cancel);
  d.appendChild(e);
  e = Blockly.createSvgElement("circle", {cx:"27.5", cy:"27.5", r:"27.5", "class":"entryFunctionButton"}, a);
  a = Blockly.createSvgElement("circle", {cx:"102.5", cy:"27.5", r:"27.5", "class":"entryFunctionButton"}, a);
  e.onclick = function(a) {
    b.save();
  };
  c.onclick = function(a) {
    b.save();
  };
  a.onclick = function(a) {
    b.cancelEdit();
  };
  d.onclick = function(a) {
    b.cancelEdit();
  };
};
Entry.Func.position_ = function() {
  var b = this.workspace.getMetrics();
  if (b && this.workspace.visible) {
    var a = this.btnWrapper;
    a.setAttribute("transform", "translate(30, 501)");
    Blockly.RTL ? this.left_ = this.MARGIN_SIDE_ : a.left_ = b.viewWidth / 2 + b.absoluteLeft - 60;
    a.top_ = b.viewHeight + b.absoluteTop - 200;
    a.setAttribute("transform", "translate(" + a.left_ + "," + a.top_ + ")");
  }
};
Entry.Func.positionBlock_ = function(b) {
  var a = this.workspace.getMetrics();
  if (a && this.workspace.visible) {
    var c = b.getSvgRoot(), c = Blockly.getSvgXY_(c);
    b.getHeightWidth();
    b.moveBy(a.viewWidth / 2 - 80 - c.x, a.viewHeight / 2 - 50 - c.y);
  }
};
Entry.Func.doWhenInit = function() {
  var b = this.svg;
  b.appendChild(Blockly.fieldKeydownDom);
  b.appendChild(Blockly.fieldDropdownDom);
  b.appendChild(Blockly.contextMenu);
  Blockly.bindEvent_(window, "resize", this, this.position_);
  Blockly.bindEvent_(b, "mousedown", null, Blockly.onMouseDown_);
  Blockly.bindEvent_(b, "contextmenu", null, Blockly.onContextMenu_);
};
Entry.Func.doWhenCancel = function() {
  Blockly.clipboard_ = null;
  var b = Blockly.svg;
  b.appendChild(Blockly.fieldKeydownDom);
  b.appendChild(Blockly.fieldDropdownDom);
  b.appendChild(Blockly.contextMenu);
  Blockly.unbindEvent_(window, "resize", this, this.position_);
  Blockly.unbindEvent_(b, "mousedown", null, Blockly.onMouseDown_);
  Blockly.unbindEvent_(b, "contextmenu", null, Blockly.onContextMenu_);
};
Entry.Func.generateWsBlock = function(b, a, c) {
  a = a.childNodes;
  var d, e;
  for (e in a) {
    if ("function_create" == a[e].getAttribute("type")) {
      d = a[e];
      break;
    }
  }
  e = new Entry.Script;
  e.init(d);
  d = e;
  d.values && (d = e.values.FIELD);
  c = '<mutation hashid="' + c + '">';
  a = e = "";
  var f = 0, g = 0;
  b.stringHash = {};
  for (b.booleanHash = {};;) {
    switch(d.type) {
      case "function_field_label":
        c += '<field type="label" content="' + d.fields.NAME.replace("<", "&lt;").replace(">", "&gt;") + '"></field>';
        a += d.fields.NAME;
        break;
      case "function_field_boolean":
        var h = d.values.PARAM.hashId;
        c += '<field type="boolean" hashid="' + h + '"></field>';
        e += '<value name="' + h + '"><block type="function_param_boolean"><mutation hashid="' + h + '"></mutation></block></value>';
        b.booleanHash[h] = g;
        g++;
        a += "\ub17c\ub9ac\uac12" + g;
        break;
      case "function_field_string":
        h = d.values.PARAM.hashId, c += '<field type="string" hashid="' + h + '"></field>', e += '<value name="' + h + '"><block type="function_param_string"><mutation hashid="' + h + '"></mutation></block></value>', b.stringHash[h] = f, f++, a += "\ubb38\uc790\uac12" + f;
    }
    if (d.values && d.values.NEXT) {
      d = d.values.NEXT;
    } else {
      break;
    }
    a += " ";
  }
  a || (a = "\ud568\uc218");
  return {block:Blockly.Xml.textToDom('<xml><block type="function_general">' + (c + "</mutation>") + e + "</block></xml>").childNodes[0], description:a};
};
Entry.HWMontior = {};
Entry.HWMonitor = function(b) {
  this.svgDom = Entry.Dom($('<svg id="hwMonitor" width="100%" height="100%"version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>'));
  this._hwModule = b;
  var a = this;
  Entry.addEventListener("windowResized", function() {
    var b = a._hwModule.monitorTemplate.mode;
    "both" == b && (a.resize(), a.resizeList());
    "list" == b ? a.resizeList() : a.resize();
  });
  this.scale = .5;
  this._portViews = {};
  this._listPortViews = {};
  this._portMap = {n:[], e:[], s:[], w:[]};
  this._portMapList = {n:[], e:[], s:[], w:[]};
};
(function(b) {
  b.generateView = function() {
    this.snap = Entry.SVG("hwMonitor");
    this._svgGroup = this.snap.elem("g");
    var a = this._hwModule.monitorTemplate, b = {href:Entry.mediaFilePath + a.imgPath, x:-a.width / 2, y:-a.height / 2, width:a.width, height:a.height};
    this.hwView = this._svgGroup.elem("image");
    this.hwView = this.hwView.attr(b);
    this._template = a;
    a = a.ports;
    this.pathGroup = this._svgGroup.elem("g");
    var b = [], d;
    for (d in a) {
      var e = this.generatePortView(a[d], "_svgGroup");
      this._portViews[d] = e;
      b.push(e);
    }
    b.sort(function(a, b) {
      return a.box.x - b.box.x;
    });
    var f = this._portMap;
    b.map(function(a) {
      (1 > (Math.atan2(-a.box.y, a.box.x) / Math.PI + 2) % 2 ? f.n : f.s).push(a);
    });
    this.resize();
  };
  b.generateListView = function() {
    this.listsnap = Entry.SVG("hwMonitor");
    this._svglistGroup = this.listsnap.elem("g");
    var a = this._hwModule.monitorTemplate;
    this._template = a;
    a = a.listPorts;
    this.pathGroup = this._svglistGroup.elem("g");
    var b = [], d;
    for (d in a) {
      var e = this.generatePortView(a[d], "_svglistGroup");
      this._listPortViews[d] = e;
      b.push(e);
    }
    var f = this._portMapList;
    b.map(function(a) {
      switch(Math.round(Math.atan2(a.box.y, a.box.x) / Math.PI * 2)) {
        case -1:
          f.n.push(a);
          break;
        case 0:
          f.e.push(a);
          break;
        case 1:
          f.s.push(a);
          break;
        case 2:
          f.w.push(a);
      }
    });
    this.resizeList();
  };
  b.generatePortView = function(a, b) {
    var d = this[b].elem("g");
    d.addClass("hwComponent");
    var e = null, e = this.pathGroup.elem("path").attr({d:"m0,0", fill:"none", stroke:"input" === a.type ? "#00979d" : "#A751E3", "stroke-width":3}), f = d.elem("rect").attr({x:0, y:0, width:150, height:22, rx:4, ry:4, fill:"#fff", stroke:"#a0a1a1"}), g = d.elem("text").attr({x:4, y:12, fill:"#000", "class":"hwComponentName", "alignment-baseline":"central"});
    g.textContent = a.name;
    g = g.getComputedTextLength();
    d.elem("rect").attr({x:g + 8, y:2, width:30, height:18, rx:9, ry:9, fill:"input" === a.type ? "#00979d" : "#A751E3"});
    var h = d.elem("text").attr({x:g + 13, y:12, fill:"#fff", "class":"hwComponentValue", "alignment-baseline":"central"});
    h.textContent = 0;
    g += 40;
    f.attr({width:g});
    d = {group:d, value:h, type:a.type, path:e, box:{x:a.pos.x - this._template.width / 2, y:a.pos.y - this._template.height / 2, width:g}, width:g};
    "both" == this._hwModule.monitorTemplate.mode && (d.box.y += 100);
    return d;
  };
  b.getView = function() {
    return this.svgDom;
  };
  b.update = function() {
    var a = Entry.hw.portData, b = Entry.hw.sendQueue, d = this._hwModule.monitorTemplate.mode, e = [];
    if ("list" == d) {
      e = this._listPortViews;
    } else {
      if ("both" == d) {
        if (e = this._listPortViews, this._portViews) {
          for (var f in this._portViews) {
            e[f] = this._portViews[f];
          }
        }
      } else {
        e = this._portViews;
      }
    }
    if (b) {
      for (f in b) {
        0 != b[f] && e[f] && (e[f].type = "output");
      }
    }
    for (var g in e) {
      d = e[g], "input" == d.type ? (f = a[g], d.value.textContent = f ? f : 0, d.group.getElementsByTagName("rect")[1].attr({fill:"#00979D"})) : (f = b[g], d.value.textContent = f ? f : 0, d.group.getElementsByTagName("rect")[1].attr({fill:"#A751E3"}));
    }
  };
  b.resize = function() {
    this.hwView && this.hwView.attr({transform:"scale(" + this.scale + ")"});
    if (this.svgDom) {
      var a = this.svgDom.get(0).getBoundingClientRect()
    }
    this._svgGroup.attr({transform:"translate(" + a.width / 2 + "," + a.height / 1.8 + ")"});
    this._rect = a;
    if (!(0 >= this._template.height || 0 >= a.height)) {
      this.scale = this._template.height / 100 * (a.height / 1E3);
      var b = (this._template.height - a.height) / a.height;
      this._template.height * this.scale > a.height && (this.scale = a.height / this._template.height - b);
      this.align();
    }
  };
  b.resizeList = function() {
    var a = this.svgDom.get(0).getBoundingClientRect();
    this._svglistGroup.attr({transform:"translate(" + a.width / 2 + "," + a.height / 2 + ")"});
    this._rect = a;
    this.alignList();
  };
  b.align = function() {
    var a = [], a = this._portMap.s.concat();
    this._alignNS(a, this.scale / 3 * this._template.height + 5, 27);
    a = this._portMap.n.concat();
    this._alignNS(a, -this._template.height * this.scale / 3 - 32, -27);
    a = this._portMap.e.concat();
    this._alignEW(a, -this._template.width * this.scale / 3 - 5, -27);
    a = this._portMap.w.concat();
    this._alignEW(a, this._template.width * this.scale / 3 - 32, -27);
  };
  b.alignList = function() {
    for (var a = this._portMapList.n, b = a.length, d = 0;d < a.length;d++) {
      a[d].group.attr({transform:"translate(" + this._template.width * (d / b - .5) + "," + (-this._template.width / 2 - 30) + ")"});
    }
    a = this._portMapList.s.concat();
    this._alignNSList(a, this._template.width * this.scale / 2 + 5, 27);
    a = this._portMapList.n.concat();
    this._alignNSList(a, -this._template.width * this.scale / 2 - 32, -27);
  };
  b._alignEW = function(a, b, d) {
    var e = a.length, f = this._rect.height - 50;
    tP = -f / 2;
    bP = f / 2;
    height = this._rect.height;
    listVLine = wholeHeight = 0;
    mode = this._hwModule.monitorTemplate;
    for (f = 0;f < e;f++) {
      wholeHeight += a[f].height + 5;
    }
    wholeHeight < bP - tP && (bP = wholeHeight / 2 + 3, tP = -wholeHeight / 2 - 3);
    for (;1 < e;) {
      var g = a.shift(), f = a.pop(), h = tP, k = bP, l = d;
      wholeWidth <= bP - tP ? (tP += g.width + 5, bP -= f.width + 5, l = 0) : 0 === a.length ? (tP = (tP + bP) / 2 - 3, bP = tP + 6) : (tP = Math.max(tP, -width / 2 + g.width) + 15, bP = Math.min(bP, width / 2 - f.width) - 15);
      wholeWidth -= g.width + f.width + 10;
      b += l;
    }
    a.length && a[0].group.attr({transform:"translate(" + b + ",60)"});
    g && rPort && (this._movePort(g, b, tP, h), this._movePort(rPort, b, bP, k));
  };
  b._alignNS = function(a, b, d) {
    for (var e = -this._rect.width / 2, f = this._rect.width / 2, g = this._rect.width, h = 0, k = 0;k < a.length;k++) {
      h += a[k].width + 5;
    }
    h < f - e && (f = h / 2 + 3, e = -h / 2 - 3);
    for (;1 < a.length;) {
      var k = a.shift(), l = a.pop(), q = e, n = f, m = d;
      h <= f - e ? (e += k.width + 5, f -= l.width + 5, m = 0) : 0 === a.length ? (e = (e + f) / 2 - 3, f = e + 6) : (e = Math.max(e, -g / 2 + k.width) + 15, f = Math.min(f, g / 2 - l.width) - 15);
      this._movePort(k, e, b, q);
      this._movePort(l, f, b, n);
      h -= k.width + l.width + 10;
      b += m;
    }
    a.length && this._movePort(a[0], (f + e - a[0].width) / 2, b, 100);
  };
  b._alignNSList = function(a, b) {
    var d = this._rect.width;
    initX = -this._rect.width / 2 + 10;
    initY = -this._rect.height / 2 + 10;
    for (var e = listLine = wholeWidth = 0;e < a.length;e++) {
      wholeWidth += a[e].width;
    }
    for (var f = 0, g = 0, h = initX, k = 0, l = 0, q = 0, e = 0;e < a.length;e++) {
      l = a[e], e != a.length - 1 && (q = a[e + 1]), g += l.width, lP = initX, k = initY + 30 * f, l.group.attr({transform:"translate(" + lP + "," + k + ")"}), initX += l.width + 10, g > d - (l.width + q.width / 2.2) && (f += 1, initX = h, g = 0);
    }
  };
  b._movePort = function(a, b, d, e) {
    var f = b, g = a.box.x * this.scale, h = a.box.y * this.scale;
    b > e ? (f = b - a.width, b = b > g && g > e ? "M" + g + "," + d + "L" + g + "," + h : "M" + (b + e) / 2 + "," + d + "l0," + (h > d ? 28 : -3) + "H" + g + "L" + g + "," + h) : b = b < g && g < e ? "m" + g + "," + d + "L" + g + "," + h : "m" + (e + b) / 2 + "," + d + "l0," + (h > d ? 28 : -3) + "H" + g + "L" + g + "," + h;
    a.group.attr({transform:"translate(" + f + "," + d + ")"});
    a.path.attr({d:b});
  };
})(Entry.HWMonitor.prototype);
Entry.HW = function() {
  this.connectTrial = 0;
  this.isFirstConnect = !0;
  this.initSocket();
  this.connected = !1;
  this.portData = {};
  this.sendQueue = {};
  this.outputQueue = {};
  this.settingQueue = {};
  this.socketType = this.hwModule = this.selectedDevice = null;
  Entry.addEventListener("stop", this.setZero);
  this.hwInfo = {11:Entry.Arduino, 12:Entry.SensorBoard, 13:Entry.CODEino, 15:Entry.dplay, 24:Entry.Hamster, 25:Entry.Albert, 31:Entry.Bitbrick, 42:Entry.Arduino, 51:Entry.Neobot, 71:Entry.Robotis_carCont, 72:Entry.Robotis_openCM70, 81:Entry.Xbot};
};
Entry.HW.TRIAL_LIMIT = 1;
p = Entry.HW.prototype;
p.initSocket = function() {
  try {
    if (this.connectTrial >= Entry.HW.TRIAL_LIMIT) {
      this.isFirstConnect || Entry.toast.alert(Lang.Menus.connect_hw, Lang.Menus.connect_fail, !1), this.isFirstConnect = !1;
    } else {
      var b = this, a, c;
      if (-1 < location.protocol.indexOf("https")) {
        c = new WebSocket("wss://localhost:23518");
      } else {
        try {
          a = new WebSocket("ws://localhost:23518");
        } catch (d) {
        }
        try {
          c = new WebSocket("wss://localhost:23518");
        } catch (d) {
        }
      }
      this.connected = !1;
      a.binaryType = "arraybuffer";
      c.binaryType = "arraybuffer";
      this.connectTrial++;
      a.onopen = function() {
        b.socketType = "WebSocket";
        b.initHardware(a);
      };
      a.onmessage = function(a) {
        a = JSON.parse(a.data);
        b.checkDevice(a);
        b.updatePortData(a);
      };
      a.onclose = function() {
        "WebSocket" === b.socketType && (this.socket = null, b.initSocket());
      };
      c.onopen = function() {
        b.socketType = "WebSocketSecurity";
        b.initHardware(c);
      };
      c.onmessage = function(a) {
        a = JSON.parse(a.data);
        b.checkDevice(a);
        b.updatePortData(a);
      };
      c.onclose = function() {
        "WebSocketSecurity" === b.socketType && (this.socket = null, b.initSocket());
      };
      Entry.dispatchEvent("hwChanged");
    }
  } catch (d) {
  }
};
p.retryConnect = function() {
  this.connectTrial = 0;
  this.initSocket();
};
p.initHardware = function(b) {
  this.socket = b;
  this.connectTrial = 0;
  this.connected = !0;
  Entry.dispatchEvent("hwChanged");
  Entry.playground && Entry.playground.object && Entry.playground.setMenu(Entry.playground.object.objectType);
};
p.setDigitalPortValue = function(b, a) {
  this.sendQueue[b] = a;
  this.removePortReadable(b);
};
p.getAnalogPortValue = function(b) {
  return this.connected ? this.portData["a" + b] : 0;
};
p.getDigitalPortValue = function(b) {
  if (!this.connected) {
    return 0;
  }
  this.setPortReadable(b);
  return void 0 !== this.portData[b] ? this.portData[b] : 0;
};
p.setPortReadable = function(b) {
  this.sendQueue.readablePorts || (this.sendQueue.readablePorts = []);
  var a = !1, c;
  for (c in this.sendQueue.readablePorts) {
    if (this.sendQueue.readablePorts[c] == b) {
      a = !0;
      break;
    }
  }
  a || this.sendQueue.readablePorts.push(b);
};
p.removePortReadable = function(b) {
  if (this.sendQueue.readablePorts || Array.isArray(this.sendQueue.readablePorts)) {
    var a, c;
    for (c in this.sendQueue.readablePorts) {
      if (this.sendQueue.readablePorts[c] == b) {
        a = Number(c);
        break;
      }
    }
    void 0 != a ? this.sendQueue.readablePorts = this.sendQueue.readablePorts.slice(0, a).concat(this.sendQueue.readablePorts.slice(a + 1, this.sendQueue.readablePorts.length)) : (this.sendQueue = [], this.sendQueue.readablePorts = []);
  }
};
p.update = function() {
  this.socket && 1 == this.socket.readyState && this.socket.send(JSON.stringify(this.sendQueue));
};
p.updatePortData = function(b) {
  this.portData = b;
  this.hwMonitor && this.hwMonitor.update();
};
p.closeConnection = function() {
  this.socket && this.socket.close();
};
p.downloadConnector = function() {
  window.open("https://github.com/entrylabs/entry-hw/releases/download/1.1.4/Entry_HW_v1.1.4.exe", "_blank").focus();
};
p.downloadSource = function() {
  window.open("http://play-entry.com/down/board.ino", "_blank").focus();
};
p.setZero = function() {
  Entry.hw.hwModule && Entry.hw.hwModule.setZero();
};
p.checkDevice = function(b) {
  void 0 !== b.company && (b = "" + b.company + b.model, b != this.selectedDevice && (this.selectedDevice = b, this.hwModule = this.hwInfo[b], Entry.dispatchEvent("hwChanged"), Entry.toast.success(Lang.Menus.connect_hw, Lang.Menus.connect_message.replace("%1", Lang.Device[Entry.hw.hwModule.name]), !1), this.hwModule.monitorTemplate && (this.hwMonitor = new Entry.HWMonitor(this.hwModule), Entry.propertyPanel.addMode("hw", this.hwMonitor), b = this.hwModule.monitorTemplate, "both" == b.mode ? (b.mode = 
  "list", this.hwMonitor.generateListView(), b.mode = "general", this.hwMonitor.generateView(), b.mode = "both") : "list" == b.mode ? this.hwMonitor.generateListView() : this.hwMonitor.generateView())));
};
p.banHW = function() {
  var b = this.hwInfo, a;
  for (a in b) {
    Entry.playground.blockMenu.banClass(b[a].name);
  }
};
Entry.BlockModel = function() {
  Entry.Model(this);
};
Entry.BlockModel.prototype.schema = {id:null, x:0, y:0, type:null, params:{}, statements:{}, prev:null, next:null, view:null};
Entry.BlockRenderModel = function() {
  Entry.Model(this);
};
Entry.BlockRenderModel.prototype.schema = {id:0, type:Entry.STATIC.BLOCK_RENDER_MODEL, x:0, y:0, width:0, height:0, magneting:!1};
Entry.BoxModel = function() {
  Entry.Model(this);
};
Entry.BoxModel.prototype.schema = {id:0, type:Entry.STATIC.BOX_MODEL, x:0, y:0, width:0, height:0};
Entry.DragInstance = function(b) {
  Entry.Model(this);
  this.set(b);
};
Entry.DragInstance.prototype.schema = {type:Entry.STATIC.DRAG_INSTANCE, startX:0, startY:0, offsetX:0, offsetY:0, prev:null, height:0, mode:0, isNew:!1};
Entry.ThreadModel = function() {
  Entry.Model(this);
};
Entry.ThreadModel.prototype.schema = {id:0, type:Entry.STATIC.THREAD_MODEL, x:0, y:0, width:0, minWidth:0, height:0};
Entry.Variable = function(b) {
  Entry.assert("string" == typeof b.name, "Variable name must be given");
  this.name_ = b.name;
  this.id_ = b.id ? b.id : Entry.generateHash();
  this.type = b.variableType ? b.variableType : "variable";
  this.object_ = b.object || null;
  this.isCloud_ = b.isCloud || !1;
  var a = Entry.parseNumber(b.value);
  this.value_ = "number" == typeof a ? a : b.value ? b.value : 0;
  "slide" == this.type && (this.minValue_ = b.minValue ? b.minValue : 0, this.maxValue_ = b.maxValue ? b.maxValue : 100);
  b.isClone || (this.visible_ = b.visible || "boolean" == typeof b.visible ? b.visible : !0, this.x_ = b.x ? b.x : null, this.y_ = b.y ? b.y : null, "list" == this.type && (this.width_ = b.width ? b.width : 100, this.height_ = b.height ? b.height : 120, this.array_ = b.array ? b.array : [], this.scrollPosition = 0), this.BORDER = 6, this.FONT = "10pt NanumGothic");
};
Entry.Variable.prototype.generateView = function(b) {
  var a = this.type;
  if ("variable" == a || "timer" == a || "answer" == a) {
    this.view_ = new createjs.Container, this.rect_ = new createjs.Shape, this.view_.addChild(this.rect_), this.view_.variable = this, this.wrapper_ = new createjs.Shape, this.view_.addChild(this.wrapper_), this.textView_ = new createjs.Text("asdf", this.FONT, "#000000"), this.textView_.textBaseline = "alphabetic", this.textView_.x = 4, this.textView_.y = 1, this.view_.addChild(this.textView_), this.valueView_ = new createjs.Text("asdf", "10pt NanumGothic", "#ffffff"), this.valueView_.textBaseline = 
    "alphabetic", a = Entry.variableContainer.variables_.length, this.getX() && this.getY() ? (this.setX(this.getX()), this.setY(this.getY())) : (this.setX(-230 + 80 * Math.floor(a / 11)), this.setY(24 * b + 20 - 135 - 264 * Math.floor(a / 11))), this.view_.visible = this.visible_, this.view_.addChild(this.valueView_), this.view_.on("mousedown", function(a) {
      "workspace" == Entry.type && (this.offset = {x:this.x - (.75 * a.stageX - 240), y:this.y - (.75 * a.stageY - 135)}, this.cursor = "move");
    }), this.view_.on("pressmove", function(a) {
      "workspace" == Entry.type && (this.variable.setX(.75 * a.stageX - 240 + this.offset.x), this.variable.setY(.75 * a.stageY - 135 + this.offset.y), this.variable.updateView());
    });
  } else {
    if ("slide" == a) {
      var c = this;
      this.view_ = new createjs.Container;
      this.rect_ = new createjs.Shape;
      this.view_.addChild(this.rect_);
      this.view_.variable = this;
      this.wrapper_ = new createjs.Shape;
      this.view_.addChild(this.wrapper_);
      this.textView_ = new createjs.Text("name", this.FONT, "#000000");
      this.textView_.textBaseline = "alphabetic";
      this.textView_.x = 4;
      this.textView_.y = 1;
      this.view_.addChild(this.textView_);
      this.valueView_ = new createjs.Text("value", "10pt NanumGothic", "#ffffff");
      this.valueView_.textBaseline = "alphabetic";
      this.view_.on("mousedown", function(a) {
        "workspace" == Entry.type && (this.offset = {x:this.x - (.75 * a.stageX - 240), y:this.y - (.75 * a.stageY - 135)});
      });
      this.view_.on("pressmove", function(a) {
        "workspace" != Entry.type || c.isAdjusting || (this.variable.setX(.75 * a.stageX - 240 + this.offset.x), this.variable.setY(.75 * a.stageY - 135 + this.offset.y), this.variable.updateView());
      });
      this.view_.visible = this.visible_;
      this.view_.addChild(this.valueView_);
      a = this.textView_.getMeasuredWidth() + this.valueView_.getMeasuredWidth() + 26;
      a = Math.max(a, 90);
      this.maxWidth = a - 20;
      this.slideBar_ = new createjs.Shape;
      this.slideBar_.graphics.beginFill("#A0A1A1").s("#A0A1A1").ss(1).dr(10, 10, this.maxWidth, 1.5);
      this.view_.addChild(this.slideBar_);
      a = this.getSlidePosition(this.maxWidth);
      this.valueSetter_ = new createjs.Shape;
      this.valueSetter_.graphics.beginFill("#1bafea").s("#A0A1A1").ss(1).dc(a, 10.5, 3);
      this.valueSetter_.cursor = "pointer";
      this.valueSetter_.on("mousedown", function(a) {
        Entry.engine.isState("run") && (c.isAdjusting = !0, this.offsetX = -(this.x - .75 * a.stageX + 240));
      });
      this.valueSetter_.on("pressmove", function(a) {
        if (Entry.engine.isState("run")) {
          var b = .75 * a.stageX - 240 - this.offsetX, f = this.graphics.command.x;
          0 >= b + f ? c.setSlideCommandX(0, !0) : b + f > c.maxWidth + 10 ? c.setSlideCommandX(c.maxWidth, !0) : (this.offsetX = -(this.x - .75 * a.stageX + 240), c.setSlideCommandX(b));
        }
      });
      this.valueSetter_.on("pressup", function(a) {
        c.isAdjusting = !1;
        delete c.viewValue_;
      });
      this.view_.addChild(this.valueSetter_);
      a = Entry.variableContainer.variables_.length;
      this.getX() && this.getY() ? (this.setX(this.getX()), this.setY(this.getY())) : (this.setX(-230 + 80 * Math.floor(a / 11)), this.setY(24 * b + 20 - 135 - 264 * Math.floor(a / 11)));
    } else {
      this.view_ = new createjs.Container, this.rect_ = new createjs.Shape, this.view_.addChild(this.rect_), this.view_.variable = this, this.titleView_ = new createjs.Text("asdf", this.FONT, "#000"), this.titleView_.textBaseline = "alphabetic", this.titleView_.textAlign = "center", this.titleView_.width = this.width_ - 2 * this.BORDER, this.titleView_.y = this.BORDER + 10, this.titleView_.x = this.width_ / 2, this.view_.addChild(this.titleView_), this.resizeHandle_ = new createjs.Shape, this.resizeHandle_.graphics.f("#1bafea").ss(1, 
      0, 0).s("#1bafea").lt(0, -9).lt(-9, 0).lt(0, 0), this.view_.addChild(this.resizeHandle_), this.resizeHandle_.list = this, this.resizeHandle_.on("mouseover", function(a) {
        this.cursor = "nwse-resize";
      }), this.resizeHandle_.on("mousedown", function(a) {
        this.list.isResizing = !0;
        this.offset = {x:.75 * a.stageX - this.list.getWidth(), y:.75 * a.stageY - this.list.getHeight()};
        this.parent.cursor = "nwse-resize";
      }), this.resizeHandle_.on("pressmove", function(a) {
        this.list.setWidth(.75 * a.stageX - this.offset.x);
        this.list.setHeight(.75 * a.stageY - this.offset.y);
        this.list.updateView();
      }), this.view_.on("mouseover", function(a) {
        this.cursor = "move";
      }), this.view_.on("mousedown", function(a) {
        "workspace" != Entry.type || this.variable.isResizing || (this.offset = {x:this.x - (.75 * a.stageX - 240), y:this.y - (.75 * a.stageY - 135)}, this.cursor = "move");
      }), this.view_.on("pressup", function(a) {
        this.cursor = "initial";
        this.variable.isResizing = !1;
      }), this.view_.on("pressmove", function(a) {
        "workspace" != Entry.type || this.variable.isResizing || (this.variable.setX(.75 * a.stageX - 240 + this.offset.x), this.variable.setY(.75 * a.stageY - 135 + this.offset.y), this.variable.updateView());
      }), this.elementView = new createjs.Container, a = new createjs.Text("asdf", this.FONT, "#000"), a.textBaseline = "middle", a.y = 5, this.elementView.addChild(a), this.elementView.indexView = a, a = new createjs.Shape, this.elementView.addChild(a), this.elementView.valueWrapper = a, a = new createjs.Text("fdsa", this.FONT, "#eee"), a.x = 24, a.y = 6, a.textBaseline = "middle", this.elementView.addChild(a), this.elementView.valueView = a, this.elementView.x = this.BORDER, this.scrollButton_ = 
      new createjs.Shape, this.scrollButton_.graphics.f("#aaa").rr(0, 0, 7, 30, 3.5), this.view_.addChild(this.scrollButton_), this.scrollButton_.y = 23, this.scrollButton_.list = this, this.scrollButton_.on("mousedown", function(a) {
        this.list.isResizing = !0;
        this.cursor = "pointer";
        this.offsetY = isNaN(this.offsetY) || 0 > this.offsetY ? a.rawY / 2 : this.offsetY;
      }), this.scrollButton_.on("pressmove", function(a) {
        void 0 === this.moveAmount ? (this.y = a.target.y, this.moveAmount = !0) : this.y = a.rawY / 2 - this.offsetY + this.list.height_ / 100 * 23;
        23 > this.y && (this.y = 23);
        this.y > this.list.getHeight() - 40 && (this.y = this.list.getHeight() - 40);
        this.list.updateView();
      }), this.scrollButton_.on("pressup", function(a) {
        this.moveAmount = void 0;
      }), this.getX() && this.getY() ? (this.setX(this.getX()), this.setY(this.getY())) : (a = Entry.variableContainer.lists_.length, this.setX(110 * -Math.floor(a / 6) + 120), this.setY(24 * b + 20 - 135 - 145 * Math.floor(a / 6)));
    }
  }
  this.setVisible(this.isVisible());
  this.updateView();
  Entry.stage.loadVariable(this);
};
Entry.Variable.prototype.updateView = function() {
  if (this.view_ && this.isVisible()) {
    if ("variable" == this.type) {
      this.view_.x = this.getX();
      this.view_.y = this.getY();
      if (this.object_) {
        var b = Entry.container.getObject(this.object_);
        this.textView_.text = b ? b.name + ":" + this.getName() : this.getName();
      } else {
        this.textView_.text = this.getName();
      }
      this.valueView_.x = this.textView_.getMeasuredWidth() + 14;
      this.valueView_.y = 1;
      this.isNumber() ? this.valueView_.text = this.getValue().toFixed(2).replace(".00", "") : this.valueView_.text = this.getValue();
      this.rect_.graphics.clear().f("#ffffff").ss(1, 2, 0).s("#A0A1A1").rc(0, -14, this.textView_.getMeasuredWidth() + this.valueView_.getMeasuredWidth() + 26, 20, 4, 4, 4, 4);
      this.wrapper_.graphics.clear().f("#1bafea").ss(1, 2, 0).s("#1bafea").rc(this.textView_.getMeasuredWidth() + 7, -11, this.valueView_.getMeasuredWidth() + 15, 14, 7, 7, 7, 7);
    } else {
      if ("slide" == this.type) {
        this.view_.x = this.getX(), this.view_.y = this.getY(), this.object_ ? (b = Entry.container.getObject(this.object_), this.textView_.text = b ? b.name + ":" + this.getName() : this.getName()) : this.textView_.text = this.getName(), this.valueView_.x = this.textView_.getMeasuredWidth() + 14, this.valueView_.y = 1, this.isNumber() ? this.valueView_.text = this.getValue().toFixed(2).replace(".00", "") : this.valueView_.text = this.getValue(), b = this.textView_.getMeasuredWidth() + this.valueView_.getMeasuredWidth() + 
        26, b = Math.max(b, 90), this.rect_.graphics.clear().f("#ffffff").ss(1, 2, 0).s("#A0A1A1").rc(0, -14, b, 33, 4, 4, 4, 4), this.wrapper_.graphics.clear().f("#1bafea").ss(1, 2, 0).s("#1bafea").rc(this.textView_.getMeasuredWidth() + 7, -11, this.valueView_.getMeasuredWidth() + 15, 14, 7, 7, 7, 7), b = this.textView_.getMeasuredWidth() + this.valueView_.getMeasuredWidth() + 26, b = Math.max(b, 90), this.maxWidth = b - 20, this.slideBar_.graphics.clear().beginFill("#A0A1A1").s("#A0A1A1").ss(1).dr(10, 
        10, this.maxWidth, 1.5), b = this.getSlidePosition(this.maxWidth), this.valueSetter_.graphics.clear().beginFill("#1bafea").s("#A0A1A1").ss(1).dc(b, 10.5, 3);
      } else {
        if ("list" == this.type) {
          this.view_.x = this.getX();
          this.view_.y = this.getY();
          this.resizeHandle_.x = this.width_ - 2;
          this.resizeHandle_.y = this.height_ - 2;
          var a = this.getName();
          this.object_ && (b = Entry.container.getObject(this.object_)) && (a = b.name + ":" + a);
          a = 7 < a.length ? a.substr(0, 6) + ".." : a;
          this.titleView_.text = a;
          this.titleView_.x = this.width_ / 2;
          for (this.rect_.graphics.clear().f("#ffffff").ss(1, 2, 0).s("#A0A1A1").rect(0, 0, this.width_, this.height_);this.view_.children[4];) {
            this.view_.removeChild(this.view_.children[4]);
          }
          b = Math.floor((this.getHeight() - 20) / 20);
          b < this.array_.length ? (this.scrollButton_.y > this.getHeight() - 40 && (this.scrollButton_.y = this.getHeight() - 40), this.elementView.valueWrapper.graphics.clear().f("#1bafea").rr(20, -2, this.getWidth() - 20 - 10 - 2 * this.BORDER, 17, 2), this.scrollButton_.visible = !0, this.scrollButton_.x = this.getWidth() - 12, this.scrollPosition = Math.floor((this.scrollButton_.y - 23) / (this.getHeight() - 23 - 40) * (this.array_.length - b))) : (this.elementView.valueWrapper.graphics.clear().f("#1bafea").rr(20, 
          -2, this.getWidth() - 20 - 2 * this.BORDER, 17, 2), this.scrollButton_.visible = !1, this.scrollPosition = 0);
          for (a = this.scrollPosition;a < this.scrollPosition + b && a < this.array_.length;a++) {
            this.elementView.indexView.text = a + 1;
            var c = String(this.array_[a].data), d = Math.floor((this.getWidth() - 50) / 7), c = Entry.cutStringByLength(c, d), c = String(this.array_[a].data).length > c.length ? c + ".." : c;
            this.elementView.valueView.text = c;
            c = this.elementView.clone(!0);
            c.y = 20 * (a - this.scrollPosition) + 23;
            this.view_.addChild(c);
          }
        } else {
          "answer" == this.type ? (this.view_.x = this.getX(), this.view_.y = this.getY(), this.textView_.text = this.getName(), this.valueView_.x = this.textView_.getMeasuredWidth() + 14, this.valueView_.y = 1, this.isNumber() ? parseInt(this.getValue(), 10) == this.getValue() ? this.valueView_.text = this.getValue() : this.valueView_.text = this.getValue().toFixed(1).replace(".00", "") : this.valueView_.text = this.getValue(), this.rect_.graphics.clear().f("#ffffff").ss(1, 2, 0).s("#A0A1A1").rc(0, 
          -14, this.textView_.getMeasuredWidth() + this.valueView_.getMeasuredWidth() + 26, 20, 4, 4, 4, 4), this.wrapper_.graphics.clear().f("#E457DC").ss(1, 2, 0).s("#E457DC").rc(this.textView_.getMeasuredWidth() + 7, -11, this.valueView_.getMeasuredWidth() + 15, 14, 7, 7, 7, 7)) : (this.view_.x = this.getX(), this.view_.y = this.getY(), this.textView_.text = this.getName(), this.valueView_.x = this.textView_.getMeasuredWidth() + 14, this.valueView_.y = 1, this.isNumber() ? this.valueView_.text = 
          this.getValue().toFixed(1).replace(".00", "") : this.valueView_.text = this.getValue(), this.rect_.graphics.clear().f("#ffffff").ss(1, 2, 0).s("#A0A1A1").rc(0, -14, this.textView_.getMeasuredWidth() + this.valueView_.getMeasuredWidth() + 26, 20, 4, 4, 4, 4), this.wrapper_.graphics.clear().f("#ffbb14").ss(1, 2, 0).s("orange").rc(this.textView_.getMeasuredWidth() + 7, -11, this.valueView_.getMeasuredWidth() + 15, 14, 7, 7, 7, 7));
        }
      }
    }
  }
};
Entry.Variable.prototype.getName = function() {
  return this.name_;
};
Entry.Variable.prototype.setName = function(b) {
  Entry.assert("string" == typeof b, "Variable name must be string");
  this.name_ = b;
  this.updateView();
};
Entry.Variable.prototype.getId = function() {
  return this.id_;
};
Entry.Variable.prototype.getValue = function() {
  return this.isNumber() ? Number(this.value_) : this.value_;
};
Entry.Variable.prototype.isNumber = function() {
  return isNaN(this.value_) ? !1 : !0;
};
Entry.Variable.prototype.setValue = function(b) {
  if ("slide" != this.type) {
    this.value_ = b;
  } else {
    var a = Entry.isFloat(this.minValue_), c = Entry.isFloat(this.maxValue_);
    this.value_ = b < this.minValue_ ? this.minValue_ : b > this.maxValue_ ? this.maxValue_ : b;
    a || c || (this.viewValue_ = this.value_, this.value_ = Math.floor(this.value_));
  }
  this.isCloud_ && Entry.variableContainer.updateCloudVariables();
  this.updateView();
};
Entry.Variable.prototype.isVisible = function() {
  return this.visible_;
};
Entry.Variable.prototype.setVisible = function(b) {
  Entry.assert("boolean" == typeof b, "Variable visible state must be boolean");
  (this.visible_ = this.view_.visible = b) && this.updateView();
};
Entry.Variable.prototype.setX = function(b) {
  this.x_ = b;
  this.updateView();
};
Entry.Variable.prototype.getX = function() {
  return this.x_;
};
Entry.Variable.prototype.setY = function(b) {
  this.y_ = b;
  this.updateView();
};
Entry.Variable.prototype.getY = function() {
  return this.y_;
};
Entry.Variable.prototype.setWidth = function(b) {
  this.width_ = 100 > b ? 100 : b;
  this.updateView();
};
Entry.Variable.prototype.getWidth = function() {
  return this.width_;
};
Entry.Variable.prototype.isInList = function(b, a) {
  this.getX();
  this.getY();
};
Entry.Variable.prototype.setHeight = function(b) {
  this.height_ = 100 > b ? 100 : b;
  this.updateView();
};
Entry.Variable.prototype.getHeight = function() {
  return this.height_;
};
Entry.Variable.prototype.takeSnapshot = function() {
  this.snapshot_ = this.toJSON();
};
Entry.Variable.prototype.loadSnapshot = function() {
  this.snapshot_ && !this.isCloud_ && this.syncModel_(this.snapshot_);
};
Entry.Variable.prototype.syncModel_ = function(b) {
  this.setX(b.x);
  this.setY(b.y);
  this.id_ = b.id;
  this.setVisible(b.visible);
  this.setValue(b.value);
  this.setName(b.name);
  this.isCloud_ = b.isCloud;
  "list" == this.type && (this.setWidth(b.width), this.setHeight(b.height), this.array_ = b.array);
};
Entry.Variable.prototype.toJSON = function() {
  var b = {};
  b.name = this.name_;
  b.id = this.id_;
  b.visible = this.visible_;
  b.value = this.value_;
  b.variableType = this.type;
  "list" == this.type ? (b.width = this.getWidth(), b.height = this.getHeight(), b.array = JSON.parse(JSON.stringify(this.array_))) : "slide" == this.type && (b.minValue = this.minValue_, b.maxValue = this.maxValue_);
  b.isCloud = this.isCloud_;
  b.object = this.object_;
  b.x = this.x_;
  b.y = this.y_;
  return b;
};
Entry.Variable.prototype.remove = function() {
  Entry.stage.removeVariable(this);
};
Entry.Variable.prototype.clone = function() {
  var b = this.toJSON();
  b.isClone = !0;
  return b = new Entry.Variable(b);
};
Entry.Variable.prototype.getType = function() {
  return this.type;
};
Entry.Variable.prototype.setType = function(b) {
  this.type = b;
};
Entry.Variable.prototype.getSlidePosition = function(b) {
  var a = this.minValue_;
  return Math.abs((this.viewValue_ || this.value_) - a) / Math.abs(this.maxValue_ - a) * b + 10;
};
Entry.Variable.prototype.setSlideCommandX = function(b, a) {
  var c = this.valueSetter_.graphics.command;
  b = "undefined" == typeof b ? 10 : b;
  c.x = a ? b + 10 : c.x + b;
  this.updateSlideValueByView();
};
Entry.Variable.prototype.updateSlideValueByView = function() {
  var b = Math.max(this.valueSetter_.graphics.command.x - 10, 0) / this.maxWidth;
  0 > b && (b = 0);
  1 < b && (b = 1);
  var a = parseFloat(this.minValue_), c = parseFloat(this.maxValue_), b = (a + Number(Math.abs(c - a) * b)).toFixed(2), b = parseFloat(b);
  b < a ? this.setValue(this.minValue_) : b > c ? this.setValue(this.maxValue_) : this.setValue(b);
};
Entry.Variable.prototype.getMinValue = function() {
  return this.minValue_;
};
Entry.Variable.prototype.setMinValue = function(b) {
  this.minValue_ = b;
  this.value_ < b && (this.value_ = b);
  this.updateView();
};
Entry.Variable.prototype.getMaxValue = function() {
  return this.maxValue_;
};
Entry.Variable.prototype.setMaxValue = function(b) {
  this.maxValue_ = b;
  this.value_ > b && (this.value_ = b);
  this.updateView();
};
Entry.VariableContainer = function() {
  this.variables_ = [];
  this.messages_ = [];
  this.lists_ = [];
  this.functions_ = {};
  this.viewMode_ = "all";
  this.selected = null;
  this.variableAddPanel = {isOpen:!1, info:{object:null, isCloud:!1}};
  this.listAddPanel = {isOpen:!1, info:{object:null, isCloud:!1}};
  this.selectedVariable = null;
};
Entry.VariableContainer.prototype.createDom = function(b) {
  var a = this;
  this.view_ = b;
  var c = Entry.createElement("table");
  c.addClass("entryVariableSelectorWorkspace");
  this.view_.appendChild(c);
  var d = Entry.createElement("tr");
  c.appendChild(d);
  var e = this.createSelectButton("all");
  e.setAttribute("rowspan", "2");
  e.addClass("selected", "allButton");
  d.appendChild(e);
  d.appendChild(this.createSelectButton("variable", Entry.variableEnable));
  d.appendChild(this.createSelectButton("message", Entry.messageEnable));
  d = Entry.createElement("tr");
  d.appendChild(this.createSelectButton("list", Entry.listEnable));
  d.appendChild(this.createSelectButton("func", Entry.functionEnable));
  c.appendChild(d);
  c = Entry.createElement("ul");
  c.addClass("entryVariableListWorkspace");
  this.view_.appendChild(c);
  this.listView_ = c;
  c = Entry.createElement("li");
  c.addClass("entryVariableAddWorkspace");
  c.addClass("entryVariableListElementWorkspace");
  c.innerHTML = "+ " + Lang.Workspace.variable_create;
  var f = this;
  this.variableAddButton_ = c;
  c.bindOnClick(function(b) {
    b = f.variableAddPanel;
    var c = b.view.name.value.trim();
    b.isOpen ? c && 0 !== c.length ? a.addVariable() : (b.view.addClass("entryRemove"), b.isOpen = !1) : (b.view.removeClass("entryRemove"), b.view.name.focus(), b.isOpen = !0);
  });
  this.generateVariableAddView();
  this.generateListAddView();
  this.generateVariableSplitterView();
  this.generateVariableSettingView();
  this.generateListSettingView();
  c = Entry.createElement("li");
  c.addClass("entryVariableAddWorkspace");
  c.addClass("entryVariableListElementWorkspace");
  c.innerHTML = "+ " + Lang.Workspace.message_create;
  this.messageAddButton_ = c;
  c.bindOnClick(function(b) {
    a.addMessage({name:Lang.Workspace.message + " " + (a.messages_.length + 1)});
  });
  c = Entry.createElement("li");
  c.addClass("entryVariableAddWorkspace");
  c.addClass("entryVariableListElementWorkspace");
  c.innerHTML = "+ " + Lang.Workspace.list_create;
  this.listAddButton_ = c;
  c.bindOnClick(function(b) {
    b = f.listAddPanel;
    var c = b.view.name.value.trim();
    b.isOpen ? c && 0 !== c.length ? a.addList() : (b.view.addClass("entryRemove"), b.isOpen = !1) : (b.view.removeClass("entryRemove"), b.view.name.focus(), b.isOpen = !0);
  });
  c = Entry.createElement("li");
  c.addClass("entryVariableAddWorkspace");
  c.addClass("entryVariableListElementWorkspace");
  c.innerHTML = "+ " + Lang.Workspace.function_create;
  this.functionAddButton_ = c;
  c.bindOnClick(function(b) {
    Entry.playground.changeViewMode("code");
    "func" != Entry.playground.selectedMenu && Entry.playground.selectMenu("func");
    a.createFunction();
  });
  return b;
};
Entry.VariableContainer.prototype.createSelectButton = function(b, a) {
  var c = this;
  void 0 === a && (a = !0);
  var d = Entry.createElement("td");
  d.addClass("entryVariableSelectButtonWorkspace", b);
  d.innerHTML = Lang.Workspace[b];
  a ? d.bindOnClick(function(a) {
    c.selectFilter(b);
    this.addClass("selected");
  }) : d.addClass("disable");
  return d;
};
Entry.VariableContainer.prototype.selectFilter = function(b) {
  for (var a = this.view_.getElementsByTagName("td"), c = 0;c < a.length;c++) {
    a[c].removeClass("selected"), a[c].hasClass(b) && a[c].addClass("selected");
  }
  this.viewMode_ = b;
  this.select();
  this.updateList();
};
Entry.VariableContainer.prototype.updateVariableAddView = function(b) {
  b = "variable" == (b ? b : "variable") ? this.variableAddPanel : this.listAddPanel;
  var a = b.info, c = b.view;
  b.view.addClass("entryRemove");
  c.cloudCheck.removeClass("entryVariableAddChecked");
  c.localCheck.removeClass("entryVariableAddChecked");
  c.globalCheck.removeClass("entryVariableAddChecked");
  c.cloudWrapper.removeClass("entryVariableAddSpaceUnCheckedWorkspace");
  a.isCloud && c.cloudCheck.addClass("entryVariableAddChecked");
  b.isOpen && (c.removeClass("entryRemove"), c.name.focus());
  a.object ? (c.localCheck.addClass("entryVariableAddChecked"), c.cloudWrapper.addClass("entryVariableAddSpaceUnCheckedWorkspace")) : c.globalCheck.addClass("entryVariableAddChecked");
};
Entry.VariableContainer.prototype.select = function(b) {
  b = this.selected == b ? null : b;
  this.selected && (this.selected.listElement.removeClass("selected"), this.listView_.removeChild(this.selected.callerListElement), delete this.selected.callerListElement, this.selected = null);
  b && (b.listElement.addClass("selected"), this.selected = b, b instanceof Entry.Variable ? (this.renderVariableReference(b), b.object_ && Entry.container.selectObject(b.object_, !0)) : b instanceof Entry.Func ? this.renderFunctionReference(b) : this.renderMessageReference(b));
};
Entry.VariableContainer.prototype.renderMessageReference = function(b) {
  var a = this, c = Entry.container.objects_, d = ["when_message_cast", "message_cast", "message_cast_wait"], e = [], f = Entry.createElement("ul");
  f.addClass("entryVariableListCallerListWorkspace");
  for (var g in c) {
    for (var h = c[g], k = h.script.getElementsByTagName("block"), l = 0;l < k.length;l++) {
      var q = k[l], n = q.getAttribute("type");
      if (-1 < d.indexOf(n)) {
        n = Entry.Xml.getField("VALUE", q), n == b.id && e.push({object:h, block:q});
      } else {
        if ("function_general" == n) {
          var m = q.getElementsByTagName("mutation")[0].getAttribute("hashid");
          if (m = Entry.variableContainer.getFunction(m)) {
            for (var m = m.content, m = m.getElementsByTagName("block"), r = 0;r < m.length;r++) {
              var t = m[r], n = t.getAttribute("type");
              -1 < d.indexOf(n) && (n = Entry.Xml.getField("VALUE", t), n == b.id && e.push({object:h, block:t, funcBlock:q}));
            }
          }
        }
      }
    }
  }
  for (g in e) {
    c = e[g], d = Entry.createElement("li"), d.addClass("entryVariableListCallerWorkspace"), d.appendChild(c.object.thumbnailView_.cloneNode()), h = Entry.createElement("div"), h.addClass("entryVariableListCallerNameWorkspace"), h.innerHTML = c.object.name + " : " + Lang.Blocks["START_" + c.block.getAttribute("type")], d.appendChild(h), d.caller = c, d.message = b, d.bindOnClick(function(b) {
      Entry.playground.object != this.caller.object && (Entry.container.selectObject(), Entry.container.selectObject(this.caller.object.id, !0), a.select(null), a.select(this.message));
      b = this.caller;
      b = b.funcBlock ? b.funcBlock.getAttribute("id") : b.block.getAttribute("id");
      Blockly.mainWorkspace.activatePreviousBlock(Number(b));
      Entry.playground.toggleOnVariableView();
      Entry.playground.changeViewMode("variable");
    }), f.appendChild(d);
  }
  0 === e.length && (d = Entry.createElement("li"), d.addClass("entryVariableListCallerWorkspace"), d.addClass("entryVariableListCallerNoneWorkspace"), d.innerHTML = Lang.Workspace.no_use, f.appendChild(d));
  b.callerListElement = f;
  this.listView_.insertBefore(f, b.listElement);
  this.listView_.insertBefore(b.listElement, f);
};
Entry.VariableContainer.prototype.renderVariableReference = function(b) {
  var a = this, c = Entry.container.objects_, d = "get_variable change_variable hide_variable set_variable show_variable add_value_to_list remove_value_from_list insert_value_to_list change_value_list_index value_of_index_from_list length_of_list show_list hide_list is_included_in_list".split(" "), e = [], f = Entry.createElement("ul");
  f.addClass("entryVariableListCallerListWorkspace");
  var g, h;
  for (h in c) {
    for (var k = c[h], l = k.script.getElementsByTagName("block"), q = 0;q < l.length;q++) {
      var n = l[q];
      g = n.getAttribute("type");
      if (-1 < d.indexOf(g)) {
        g = Entry.Xml.getField("VARIABLE", n) || Entry.Xml.getField("LIST", n), g == b.id_ && e.push({object:k, block:n});
      } else {
        if ("function_general" == g) {
          var m = n.getElementsByTagName("mutation")[0].getAttribute("hashid");
          if (m = Entry.variableContainer.getFunction(m)) {
            for (var m = m.content, m = m.getElementsByTagName("block"), r = 0;r < m.length;r++) {
              var t = m[r];
              g = t.getAttribute("type");
              -1 < d.indexOf(g) && (g = Entry.Xml.getField("VARIABLE", t) || Entry.Xml.getField("LIST", t), g == b.id_ && e.push({object:k, block:t, funcBlock:n}));
            }
          }
        }
      }
    }
  }
  for (h in e) {
    c = e[h], d = Entry.createElement("li"), d.addClass("entryVariableListCallerWorkspace"), d.appendChild(c.object.thumbnailView_.cloneNode()), k = Entry.createElement("div"), k.addClass("entryVariableListCallerNameWorkspace"), k.innerHTML = c.object.name + " : " + Lang.Blocks["VARIABLE_" + c.block.getAttribute("type")], d.appendChild(k), d.caller = c, d.variable = b, d.bindOnClick(function(b) {
      Entry.playground.object != this.caller.object && (Entry.container.selectObject(), Entry.container.selectObject(this.caller.object.id, !0), a.select(null));
      b = this.caller;
      b = b.funcBlock ? b.funcBlock.getAttribute("id") : b.block.getAttribute("id");
      Blockly.mainWorkspace.activatePreviousBlock(Number(b));
      Entry.playground.toggleOnVariableView();
      Entry.playground.changeViewMode("variable");
    }), f.appendChild(d);
  }
  0 === e.length && (d = Entry.createElement("li"), d.addClass("entryVariableListCallerWorkspace"), d.addClass("entryVariableListCallerNoneWorkspace"), d.innerHTML = Lang.Workspace.no_use, f.appendChild(d));
  b.callerListElement = f;
  this.listView_.insertBefore(f, b.listElement);
  this.listView_.insertBefore(b.listElement, f);
};
Entry.VariableContainer.prototype.renderFunctionReference = function(b) {
  var a = this, c = Entry.container.objects_, d = [], e = Entry.createElement("ul");
  e.addClass("entryVariableListCallerListWorkspace");
  for (var f in c) {
    for (var g = c[f], h = g.script.getElementsByTagName("block"), k = 0;k < h.length;k++) {
      var l = h[k];
      "function_general" == l.getAttribute("type") && l.getElementsByTagName("mutation")[0].getAttribute("hashid") == b.id && d.push({object:g, block:l});
    }
  }
  for (f in d) {
    c = d[f], g = Entry.createElement("li"), g.addClass("entryVariableListCallerWorkspace"), g.appendChild(c.object.thumbnailView_.cloneNode()), h = Entry.createElement("div"), h.addClass("entryVariableListCallerNameWorkspace"), h.innerHTML = c.object.name, g.appendChild(h), g.caller = c, g.bindOnClick(function(c) {
      Entry.playground.object != this.caller.object && (Entry.container.selectObject(), Entry.container.selectObject(this.caller.object.id, !0), a.select(null), a.select(b));
      c = this.caller.block.getAttribute("id");
      Blockly.mainWorkspace.activatePreviousBlock(Number(c));
      Entry.playground.toggleOnVariableView();
      Entry.playground.changeViewMode("variable");
    }), e.appendChild(g);
  }
  0 === d.length && (g = Entry.createElement("li"), g.addClass("entryVariableListCallerWorkspace"), g.addClass("entryVariableListCallerNoneWorkspace"), g.innerHTML = Lang.Workspace.no_use, e.appendChild(g));
  b.callerListElement = e;
  this.listView_.insertBefore(e, b.listElement);
  this.listView_.insertBefore(b.listElement, e);
};
Entry.VariableContainer.prototype.updateList = function() {
  if (this.listView_) {
    this.variableSettingView.addClass("entryRemove");
    for (this.listSettingView.addClass("entryRemove");this.listView_.firstChild;) {
      this.listView_.removeChild(this.listView_.firstChild);
    }
    var b = this.viewMode_, a = [];
    if ("all" == b || "message" == b) {
      "message" == b && this.listView_.appendChild(this.messageAddButton_);
      for (var c in this.messages_) {
        var d = this.messages_[c];
        a.push(d);
        var e = d.listElement;
        this.listView_.appendChild(e);
        d.callerListElement && this.listView_.appendChild(d.callerListElement);
      }
    }
    if ("all" == b || "variable" == b) {
      if ("variable" == b) {
        e = this.variableAddPanel.info;
        e.object && !Entry.playground.object && (e.object = null);
        this.listView_.appendChild(this.variableAddButton_);
        this.listView_.appendChild(this.variableAddPanel.view);
        this.variableSplitters.top.innerHTML = Lang.Workspace.Variable_used_at_all_objects;
        this.listView_.appendChild(this.variableSplitters.top);
        for (c in this.variables_) {
          d = this.variables_[c], d.object_ || (a.push(d), e = d.listElement, this.listView_.appendChild(e), d.callerListElement && this.listView_.appendChild(d.callerListElement));
        }
        this.variableSplitters.bottom.innerHTML = Lang.Workspace.Variable_used_at_special_object;
        this.listView_.appendChild(this.variableSplitters.bottom);
        for (c in this.variables_) {
          d = this.variables_[c], d.object_ && (a.push(d), e = d.listElement, this.listView_.appendChild(e), d.callerListElement && this.listView_.appendChild(d.callerListElement));
        }
        this.updateVariableAddView("variable");
      } else {
        for (c in this.variables_) {
          d = this.variables_[c], a.push(d), e = d.listElement, this.listView_.appendChild(e), d.callerListElement && this.listView_.appendChild(d.callerListElement);
        }
      }
    }
    if ("all" == b || "list" == b) {
      if ("list" == b) {
        e = this.listAddPanel.info;
        e.object && !Entry.playground.object && (e.object = null);
        this.listView_.appendChild(this.listAddButton_);
        this.listView_.appendChild(this.listAddPanel.view);
        this.variableSplitters.top.innerHTML = Lang.Workspace.List_used_all_objects;
        this.listView_.appendChild(this.variableSplitters.top);
        this.updateVariableAddView("list");
        for (c in this.lists_) {
          d = this.lists_[c], d.object_ || (a.push(d), e = d.listElement, this.listView_.appendChild(e), d.callerListElement && this.listView_.appendChild(d.callerListElement));
        }
        this.variableSplitters.bottom.innerHTML = Lang.Workspace.list_used_specific_objects;
        this.listView_.appendChild(this.variableSplitters.bottom);
        for (c in this.lists_) {
          d = this.lists_[c], d.object_ && (a.push(d), e = d.listElement, this.listView_.appendChild(e), d.callerListElement && this.listView_.appendChild(d.callerListElement));
        }
        this.updateVariableAddView("variable");
      } else {
        for (c in this.lists_) {
          d = this.lists_[c], a.push(d), e = d.listElement, this.listView_.appendChild(e), d.callerListElement && this.listView_.appendChild(d.callerListElement);
        }
      }
    }
    if ("all" == b || "func" == b) {
      for (c in "func" == b && this.listView_.appendChild(this.functionAddButton_), this.functions_) {
        b = this.functions_[c], a.push(b), e = b.listElement, this.listView_.appendChild(e), b.callerListElement && this.listView_.appendChild(b.callerListElement);
      }
    }
    this.listView_.appendChild(this.variableSettingView);
    this.listView_.appendChild(this.listSettingView);
    0 !== a.length && this.select(a[0]);
  }
};
Entry.VariableContainer.prototype.setMessages = function(b) {
  for (var a in b) {
    var c = b[a];
    c.id || (c.id = Entry.generateHash());
    this.createMessageView(c);
    this.messages_.push(c);
  }
  Entry.playground.reloadPlayground();
  this.updateList();
};
Entry.VariableContainer.prototype.setVariables = function(b) {
  for (var a in b) {
    var c = new Entry.Variable(b[a]), d = c.getType();
    "variable" == d || "slide" == d ? (c.generateView(this.variables_.length), this.createVariableView(c), this.variables_.push(c)) : "list" == d ? (c.generateView(this.lists_.length), this.createListView(c), this.lists_.push(c)) : "timer" == d ? this.generateTimer(c) : "answer" == d && this.generateAnswer(c);
  }
  Entry.isEmpty(Entry.engine.projectTimer) && Entry.variableContainer.generateTimer();
  Entry.isEmpty(Entry.container.inputValue) && Entry.variableContainer.generateAnswer();
  Entry.playground.reloadPlayground();
  this.updateList();
};
Entry.VariableContainer.prototype.setFunctions = function(b) {
  for (var a in b) {
    var c = new Entry.Func;
    c.init(b[a]);
    c.generateBlock();
    this.createFunctionView(c);
    this.functions_[c.id] = c;
  }
  this.updateList();
};
Entry.VariableContainer.prototype.getFunction = function(b) {
  return this.functions_[b];
};
Entry.VariableContainer.prototype.getVariable = function(b, a) {
  var c = Entry.findObjsByKey(this.variables_, "id_", b)[0];
  a && a.isClone && c.object_ && (c = Entry.findObjsByKey(a.variables, "id_", b)[0]);
  return c;
};
Entry.VariableContainer.prototype.getList = function(b, a) {
  var c = Entry.findObjsByKey(this.lists_, "id_", b)[0];
  a && a.isClone && c.object_ && (c = Entry.findObjsByKey(a.lists, "id_", b)[0]);
  return c;
};
Entry.VariableContainer.prototype.createFunction = function() {
  if (!Entry.Func.isEdit) {
    var b = new Entry.Func;
    Entry.Func.edit(b);
    this.saveFunction(b);
  }
};
Entry.VariableContainer.prototype.addFunction = function(b) {
};
Entry.VariableContainer.prototype.removeFunction = function(b) {
  delete this.functions_[b.id];
  this.updateList();
};
Entry.VariableContainer.prototype.checkListPosition = function(b, a) {
  var c = b.x_ + b.width_, d = -b.y_, e = -b.y_ + -b.height_;
  return a.x > b.x_ && a.x < c && a.y < d && a.y > e ? !0 : !1;
};
Entry.VariableContainer.prototype.getListById = function(b) {
  var a = this.lists_, c = [];
  if (0 < a.length) {
    for (var d = 0;d < a.length;d++) {
      this.checkListPosition(a[d], b) && c.push(a[d]);
    }
    return c;
  }
  return !1;
};
Entry.VariableContainer.prototype.editFunction = function(b, a) {
};
Entry.VariableContainer.prototype.saveFunction = function(b) {
  this.functions_[b.id] || (this.functions_[b.id] = b, this.createFunctionView(b));
  b.listElement.nameField.innerHTML = b.description;
  this.updateList();
};
Entry.VariableContainer.prototype.createFunctionView = function(b) {
  var a = this, c = Entry.createElement("li");
  c.addClass("entryVariableListElementWorkspace");
  c.addClass("entryFunctionElementWorkspace");
  c.bindOnClick(function(c) {
    c.stopPropagation();
    a.select(b);
  });
  var d = Entry.createElement("button");
  d.addClass("entryVariableListElementDeleteWorkspace");
  d.bindOnClick(function(c) {
    c.stopPropagation();
    a.removeFunction(b);
    a.selected = null;
  });
  var e = Entry.createElement("button");
  e.addClass("entryVariableListElementEditWorkspace");
  e.bindOnClick(function(a) {
    a.stopPropagation();
    Entry.Func.edit(b);
    Entry.playground && (Entry.playground.changeViewMode("code"), "func" != Entry.playground.selectedMenu && Entry.playground.selectMenu("func"));
  });
  var f = Entry.createElement("div");
  f.addClass("entryVariableFunctionElementNameWorkspace");
  f.innerHTML = b.description;
  c.nameField = f;
  c.appendChild(f);
  c.appendChild(e);
  c.appendChild(d);
  b.listElement = c;
};
Entry.VariableContainer.prototype.checkAllVariableName = function(b, a) {
  a = this[a];
  for (var c = 0;c < a.length;c++) {
    if (a[c].name_ == b) {
      return !0;
    }
  }
  return !1;
};
Entry.VariableContainer.prototype.addVariable = function(b) {
  if (!b) {
    var a = this.variableAddPanel;
    b = a.view.name.value.trim();
    b && 0 !== b.length || (b = Lang.Workspace.variable);
    b = this.checkAllVariableName(b, "variables_") ? Entry.getOrderedName(b, this.variables_, "name_") : b;
    var c = a.info;
    b = {name:b, isCloud:c.isCloud, object:c.object, variableType:"variable"};
    a.view.addClass("entryRemove");
    this.resetVariableAddPanel("variable");
  }
  b = new Entry.Variable(b);
  Entry.stateManager && Entry.stateManager.addCommand("add variable", this, this.removeVariable, b);
  b.generateView(this.variables_.length);
  this.createVariableView(b);
  this.variables_.unshift(b);
  Entry.playground.reloadPlayground();
  this.updateList();
  b.listElement.nameField.focus();
  return new Entry.State(this, this.removeVariable, b);
};
Entry.VariableContainer.prototype.removeVariable = function(b) {
  var a = this.variables_.indexOf(b), c = b.toJSON();
  this.selected == b && this.select(null);
  b.remove();
  this.variables_.splice(a, 1);
  Entry.stateManager && Entry.stateManager.addCommand("remove variable", this, this.addVariable, c);
  Entry.playground.reloadPlayground();
  this.updateList();
  return new Entry.State(this, this.addVariable, c);
};
Entry.VariableContainer.prototype.changeVariableName = function(b, a) {
  b.name_ != a && (Entry.isExist(a, "name_", this.variables_) ? (b.listElement.nameField.value = b.name_, Entry.toast.alert(Lang.Workspace.variable_rename_failed, Lang.Workspace.variable_dup)) : 10 < a.length ? (b.listElement.nameField.value = b.name_, Entry.toast.alert(Lang.Workspace.variable_rename_failed, Lang.Workspace.variable_too_long)) : (b.name_ = a, b.updateView(), Entry.playground.reloadPlayground(), Entry.toast.success(Lang.Workspace.variable_rename, Lang.Workspace.variable_rename_ok)));
};
Entry.VariableContainer.prototype.changeListName = function(b, a) {
  b.name_ != a && (Entry.isExist(a, "name_", this.lists_) ? (b.listElement.nameField.value = b.name_, Entry.toast.alert(Lang.Workspace.list_rename_failed, Lang.Workspace.list_dup)) : 10 < a.length ? (b.listElement.nameField.value = b.name_, Entry.toast.alert(Lang.Workspace.list_rename_failed, Lang.Workspace.list_too_long)) : (b.name_ = a, b.updateView(), Entry.playground.reloadPlayground(), Entry.toast.success(Lang.Workspace.list_rename, Lang.Workspace.list_rename_ok)));
};
Entry.VariableContainer.prototype.removeList = function(b) {
  var a = this.lists_.indexOf(b), c = b.toJSON();
  Entry.stateManager && Entry.stateManager.addCommand("remove list", this, this.addList, c);
  this.selected == b && this.select(null);
  b.remove();
  this.lists_.splice(a, 1);
  Entry.playground.reloadPlayground();
  this.updateList();
  return new Entry.State(this, this.addList, c);
};
Entry.VariableContainer.prototype.createVariableView = function(b) {
  var a = this, c = Entry.createElement("li"), d = Entry.createElement("div");
  d.addClass("entryVariableListElementWrapperWorkspace");
  c.appendChild(d);
  c.addClass("entryVariableListElementWorkspace");
  b.object_ ? c.addClass("entryVariableLocalElementWorkspace") : b.isCloud_ ? c.addClass("entryVariableCloudElementWorkspace") : c.addClass("entryVariableGlobalElementWorkspace");
  c.bindOnClick(function(c) {
    a.select(b);
  });
  var e = Entry.createElement("button");
  e.addClass("entryVariableListElementDeleteWorkspace");
  e.bindOnClick(function(c) {
    c.stopPropagation();
    a.removeVariable(b);
    a.selectedVariable = null;
    a.variableSettingView.addClass("entryRemove");
  });
  var f = Entry.createElement("button");
  f.addClass("entryVariableListElementEditWorkspace");
  f.bindOnClick(function(c) {
    c.stopPropagation();
    h.removeAttribute("disabled");
    g.removeClass("entryRemove");
    this.addClass("entryRemove");
    a.updateSelectedVariable(b);
    h.focus();
  });
  c.editButton = f;
  var g = Entry.createElement("button");
  g.addClass("entryVariableListElementEditWorkspace");
  g.addClass("entryRemove");
  g.bindOnClick(function(b) {
    b.stopPropagation();
    h.blur();
    h.setAttribute("disabled", "disabled");
    f.removeClass("entryRemove");
    this.addClass("entryRemove");
    a.updateSelectedVariable(null, "variable");
  });
  c.editSaveButton = g;
  var h = Entry.createElement("input");
  h.addClass("entryVariableListElementNameWorkspace");
  h.setAttribute("disabled", "disabled");
  h.value = b.name_;
  h.bindOnClick(function(a) {
    a.stopPropagation();
  });
  h.onblur = function(c) {
    (c = this.value.trim()) && 0 !== c.length ? a.changeVariableName(b, this.value) : (Entry.toast.alert(Lang.Msgs.warn, Lang.Workspace.variable_can_not_space), this.value = b.getName());
  };
  h.onkeydown = function(a) {
    13 == a.keyCode && this.blur();
  };
  c.nameField = h;
  d.appendChild(h);
  d.appendChild(f);
  d.appendChild(g);
  d.appendChild(e);
  b.listElement = c;
};
Entry.VariableContainer.prototype.addMessage = function(b) {
  b.id || (b.id = Entry.generateHash());
  Entry.stateManager && Entry.stateManager.addCommand("add message", this, this.removeMessage, b);
  this.createMessageView(b);
  this.messages_.unshift(b);
  Entry.playground.reloadPlayground();
  this.updateList();
  b.listElement.nameField.focus();
  return new Entry.State(this, this.removeMessage, b);
};
Entry.VariableContainer.prototype.removeMessage = function(b) {
  this.selected == b && this.select(null);
  Entry.stateManager && Entry.stateManager.addCommand("remove message", this, this.addMessage, b);
  var a = this.messages_.indexOf(b);
  this.messages_.splice(a, 1);
  this.updateList();
  Entry.playground.reloadPlayground();
  return new Entry.State(this, this.addMessage, b);
};
Entry.VariableContainer.prototype.changeMessageName = function(b, a) {
  b.name != a && (Entry.isExist(a, "name", this.messages_) ? (b.listElement.nameField.value = b.name, Entry.toast.alert(Lang.Workspace.message_rename_failed, Lang.Workspace.message_dup)) : 10 < a.length ? (b.listElement.nameField.value = b.name, Entry.toast.alert(Lang.Workspace.message_rename_failed, Lang.Workspace.message_too_long)) : (b.name = a, Entry.playground.reloadPlayground(), Entry.toast.success(Lang.Workspace.message_rename, Lang.Workspace.message_rename_ok)));
};
Entry.VariableContainer.prototype.createMessageView = function(b) {
  var a = this, c = Entry.createElement("li");
  c.addClass("entryVariableListElementWorkspace");
  c.addClass("entryMessageElementWorkspace");
  c.bindOnClick(function(c) {
    a.select(b);
  });
  var d = Entry.createElement("button");
  d.addClass("entryVariableListElementDeleteWorkspace");
  d.bindOnClick(function(c) {
    c.stopPropagation();
    a.removeMessage(b);
  });
  var e = Entry.createElement("button");
  e.addClass("entryVariableListElementEditWorkspace");
  e.bindOnClick(function(a) {
    a.stopPropagation();
    g.removeAttribute("disabled");
    g.focus();
    f.removeClass("entryRemove");
    this.addClass("entryRemove");
  });
  var f = Entry.createElement("button");
  f.addClass("entryVariableListElementEditWorkspace");
  f.addClass("entryRemove");
  f.bindOnClick(function(a) {
    a.stopPropagation();
    g.blur();
    e.removeClass("entryRemove");
    this.addClass("entryRemove");
  });
  var g = Entry.createElement("input");
  g.addClass("entryVariableListElementNameWorkspace");
  g.value = b.name;
  g.bindOnClick(function(a) {
    a.stopPropagation();
  });
  g.onblur = function(c) {
    (c = this.value.trim()) && 0 !== c.length ? (a.changeMessageName(b, this.value), e.removeClass("entryRemove"), f.addClass("entryRemove"), g.setAttribute("disabled", "disabled")) : (Entry.toast.alert(Lang.Msgs.warn, Lang.Msgs.sign_can_not_space), this.value = b.name);
  };
  g.onkeydown = function(a) {
    13 == a.keyCode && this.blur();
  };
  c.nameField = g;
  c.appendChild(g);
  c.appendChild(e);
  c.appendChild(f);
  c.appendChild(d);
  b.listElement = c;
};
Entry.VariableContainer.prototype.addList = function(b) {
  if (!b) {
    var a = this.listAddPanel;
    b = a.view.name.value.trim();
    b && 0 !== b.length || (b = Lang.Workspace.list);
    var c = a.info;
    b = this.checkAllVariableName(b, "lists_") ? Entry.getOrderedName(b, this.lists_, "name_") : b;
    b = {name:b, isCloud:c.isCloud, object:c.object, variableType:"list"};
    a.view.addClass("entryRemove");
    this.resetVariableAddPanel("list");
  }
  b = new Entry.Variable(b);
  Entry.stateManager && Entry.stateManager.addCommand("add list", this, this.removeList, b);
  b.generateView(this.lists_.length);
  this.createListView(b);
  this.lists_.unshift(b);
  Entry.playground.reloadPlayground();
  this.updateList();
  b.listElement.nameField.focus();
  return new Entry.State(this, this.removelist, b);
};
Entry.VariableContainer.prototype.createListView = function(b) {
  var a = this, c = Entry.createElement("li"), d = Entry.createElement("div");
  d.addClass("entryVariableListElementWrapperWorkspace");
  c.appendChild(d);
  c.addClass("entryVariableListElementWorkspace");
  b.object_ ? c.addClass("entryListLocalElementWorkspace") : b.isCloud_ ? c.addClass("entryListCloudElementWorkspace") : c.addClass("entryListGlobalElementWorkspace");
  c.bindOnClick(function(c) {
    a.select(b);
  });
  var e = Entry.createElement("button");
  e.addClass("entryVariableListElementDeleteWorkspace");
  e.bindOnClick(function(c) {
    c.stopPropagation();
    a.removeList(b);
    a.selectedList = null;
    a.listSettingView.addClass("entryRemove");
  });
  var f = Entry.createElement("button");
  f.addClass("entryVariableListElementEditWorkspace");
  f.bindOnClick(function(c) {
    c.stopPropagation();
    h.removeAttribute("disabled");
    g.removeClass("entryRemove");
    this.addClass("entryRemove");
    a.updateSelectedVariable(b);
    h.focus();
  });
  c.editButton = f;
  var g = Entry.createElement("button");
  g.addClass("entryVariableListElementEditWorkspace");
  g.addClass("entryRemove");
  g.bindOnClick(function(c) {
    c.stopPropagation();
    h.blur();
    h.setAttribute("disabled", "disabled");
    f.removeClass("entryRemove");
    this.addClass("entryRemove");
    a.select(b);
    a.updateSelectedVariable(null, "list");
  });
  c.editSaveButton = g;
  var h = Entry.createElement("input");
  h.setAttribute("disabled", "disabled");
  h.addClass("entryVariableListElementNameWorkspace");
  h.value = b.name_;
  h.bindOnClick(function(a) {
    a.stopPropagation();
  });
  h.onblur = function(c) {
    (c = this.value.trim()) && 0 !== c.length ? a.changeListName(b, this.value) : (Entry.toast.alert(Lang.Msgs.warn, Lang.Msgs.list_can_not_space), this.value = b.getName());
  };
  h.onkeydown = function(a) {
    13 == a.keyCode && this.blur();
  };
  c.nameField = h;
  d.appendChild(h);
  d.appendChild(f);
  d.appendChild(g);
  d.appendChild(e);
  b.listElement = c;
};
Entry.VariableContainer.prototype.mapVariable = function(b, a) {
  for (var c = this.variables_.length, d = 0;d < c;d++) {
    b(this.variables_[d], a);
  }
};
Entry.VariableContainer.prototype.mapList = function(b, a) {
  for (var c = this.lists_.length, d = 0;d < c;d++) {
    b(this.lists_[d], a);
  }
};
Entry.VariableContainer.prototype.getVariableJSON = function() {
  for (var b = [], a = 0;a < this.variables_.length;a++) {
    b.push(this.variables_[a].toJSON());
  }
  for (a = 0;a < this.lists_.length;a++) {
    b.push(this.lists_[a].toJSON());
  }
  Entry.engine.projectTimer && b.push(Entry.engine.projectTimer);
  a = Entry.container.inputValue;
  Entry.isEmpty(a) || b.push(a);
  return b;
};
Entry.VariableContainer.prototype.getMessageJSON = function() {
  for (var b = [], a = 0;a < this.messages_.length;a++) {
    b.push({id:this.messages_[a].id, name:this.messages_[a].name});
  }
  return b;
};
Entry.VariableContainer.prototype.getFunctionJSON = function() {
  var b = [], a;
  for (a in this.functions_) {
    var c = this.functions_[a], c = {id:c.id, block:Blockly.Xml.domToText(c.block), content:Blockly.Xml.domToText(c.content)};
    b.push(c);
  }
  return b;
};
Entry.VariableContainer.prototype.resetVariableAddPanel = function(b) {
  b = b || "variable";
  var a = "variable" == b ? this.variableAddPanel : this.listAddPanel, c = a.info;
  c.isCloud = !1;
  c.object = null;
  a.view.name.value = "";
  a.isOpen = !1;
  this.updateVariableAddView(b);
};
Entry.VariableContainer.prototype.generateVariableAddView = function() {
  var b = this, a = Entry.createElement("li");
  this.variableAddPanel.view = a;
  this.variableAddPanel.isOpen = !1;
  a.addClass("entryVariableAddSpaceWorkspace");
  a.addClass("entryRemove");
  var c = Entry.createElement("div");
  c.addClass("entryVariableAddSpaceNameWrapperWorkspace");
  a.appendChild(c);
  var d = Entry.createElement("input");
  d.addClass("entryVariableAddSpaceInputWorkspace");
  d.setAttribute("placeholder", Lang.Workspace.Variable_placeholder_name);
  d.variableContainer = this;
  d.onkeypress = function(a) {
    13 == a.keyCode && (Entry.variableContainer.addVariable(), b.updateSelectedVariable(b.variables_[0]), a = b.variables_[0].listElement, a.editButton.addClass("entryRemove"), a.editSaveButton.removeClass("entryRemove"), a.nameField.removeAttribute("disabled"), a.nameField.focus());
  };
  this.variableAddPanel.view.name = d;
  c.appendChild(d);
  c = Entry.createElement("div");
  c.addClass("entryVariableAddSpaceGlobalWrapperWorkspace");
  c.bindOnClick(function(a) {
    b.variableAddPanel.info.object = null;
    b.updateVariableAddView("variable");
  });
  a.appendChild(c);
  d = Entry.createElement("span");
  d.innerHTML = Lang.Workspace.Variable_use_all_objects;
  c.appendChild(d);
  d = Entry.createElement("span");
  d.addClass("entryVariableAddSpaceCheckWorkspace");
  this.variableAddPanel.view.globalCheck = d;
  this.variableAddPanel.info.object || d.addClass("entryVariableAddChecked");
  c.appendChild(d);
  c = Entry.createElement("div");
  c.addClass("entryVariableAddSpaceLocalWrapperWorkspace");
  c.bindOnClick(function(a) {
    Entry.playground.object && (a = b.variableAddPanel.info, a.object = Entry.playground.object.id, a.isCloud = !1, b.updateVariableAddView("variable"));
  });
  a.appendChild(c);
  d = Entry.createElement("span");
  d.innerHTML = Lang.Workspace.Variable_use_this_object;
  c.appendChild(d);
  d = Entry.createElement("span");
  d.addClass("entryVariableAddSpaceCheckWorkspace");
  this.variableAddPanel.view.localCheck = d;
  this.variableAddPanel.info.object && d.addClass("entryVariableAddChecked");
  c.appendChild(d);
  c = Entry.createElement("div");
  a.cloudWrapper = c;
  c.addClass("entryVariableAddSpaceCloudWrapperWorkspace");
  c.bindOnClick(function(a) {
    a = b.variableAddPanel.info;
    a.object || (a.isCloud = !a.isCloud, b.updateVariableAddView("variable"));
  });
  a.appendChild(c);
  d = Entry.createElement("span");
  d.addClass("entryVariableAddSpaceCloudSpanWorkspace");
  d.innerHTML = Lang.Workspace.Variable_create_cloud;
  c.appendChild(d);
  d = Entry.createElement("span");
  this.variableAddPanel.view.cloudCheck = d;
  d.addClass("entryVariableAddSpaceCheckWorkspace");
  d.addClass("entryVariableAddSpaceCloudCheckWorkspace");
  this.variableAddPanel.info.isCloud && d.addClass("entryVariableAddChecked");
  c.appendChild(d);
  c = Entry.createElement("div");
  c.addClass("entryVariableAddSpaceButtonWrapperWorkspace");
  a.appendChild(c);
  a = Entry.createElement("span");
  a.addClass("entryVariableAddSpaceCancelWorkspace");
  a.addClass("entryVariableAddSpaceButtonWorkspace");
  a.innerHTML = Lang.Buttons.cancel;
  a.bindOnClick(function(a) {
    b.variableAddPanel.view.addClass("entryRemove");
    b.resetVariableAddPanel("variable");
  });
  c.appendChild(a);
  a = Entry.createElement("span");
  a.addClass("entryVariableAddSpaceConfirmWorkspace");
  a.addClass("entryVariableAddSpaceButtonWorkspace");
  a.innerHTML = Lang.Buttons.save;
  a.variableContainer = this;
  a.bindOnClick(function(a) {
    Entry.variableContainer.addVariable();
    b.updateSelectedVariable(b.variables_[0]);
    a = b.variables_[0].listElement;
    a.editButton.addClass("entryRemove");
    a.editSaveButton.removeClass("entryRemove");
    a.nameField.removeAttribute("disabled");
    a.nameField.focus();
  });
  c.appendChild(a);
};
Entry.VariableContainer.prototype.generateListAddView = function() {
  var b = this, a = Entry.createElement("li");
  this.listAddPanel.view = a;
  this.listAddPanel.isOpen = !1;
  a.addClass("entryVariableAddSpaceWorkspace");
  a.addClass("entryRemove");
  var c = Entry.createElement("div");
  c.addClass("entryVariableAddSpaceNameWrapperWorkspace");
  c.addClass("entryListAddSpaceNameWrapperWorkspace");
  a.appendChild(c);
  var d = Entry.createElement("input");
  d.addClass("entryVariableAddSpaceInputWorkspace");
  d.setAttribute("placeholder", Lang.Workspace.list_name);
  this.listAddPanel.view.name = d;
  d.variableContainer = this;
  d.onkeypress = function(a) {
    13 == a.keyCode && (b.addList(), a = b.lists_[0], b.updateSelectedVariable(a), a = a.listElement, a.editButton.addClass("entryRemove"), a.editSaveButton.removeClass("entryRemove"), a.nameField.removeAttribute("disabled"), a.nameField.focus());
  };
  c.appendChild(d);
  c = Entry.createElement("div");
  c.addClass("entryVariableAddSpaceGlobalWrapperWorkspace");
  c.bindOnClick(function(a) {
    b.listAddPanel.info.object = null;
    b.updateVariableAddView("list");
  });
  a.appendChild(c);
  d = Entry.createElement("span");
  d.innerHTML = Lang.Workspace.use_all_objects;
  c.appendChild(d);
  d = Entry.createElement("span");
  d.addClass("entryVariableAddSpaceCheckWorkspace");
  this.listAddPanel.view.globalCheck = d;
  this.listAddPanel.info.object || d.addClass("entryVariableAddChecked");
  c.appendChild(d);
  c = Entry.createElement("div");
  c.addClass("entryVariableAddSpaceLocalWrapperWorkspace");
  c.bindOnClick(function(a) {
    Entry.playground.object && (a = b.listAddPanel.info, a.object = Entry.playground.object.id, a.isCloud = !1, b.updateVariableAddView("list"));
  });
  a.appendChild(c);
  d = Entry.createElement("span");
  d.innerHTML = Lang.Workspace.Variable_use_this_object;
  c.appendChild(d);
  d = Entry.createElement("span");
  d.addClass("entryVariableAddSpaceCheckWorkspace");
  this.listAddPanel.view.localCheck = d;
  this.variableAddPanel.info.object && addVariableLocalCheck.addClass("entryVariableAddChecked");
  c.appendChild(d);
  c = Entry.createElement("div");
  a.cloudWrapper = c;
  c.addClass("entryVariableAddSpaceCloudWrapperWorkspace");
  c.bindOnClick(function(a) {
    a = b.listAddPanel.info;
    a.object || (a.isCloud = !a.isCloud, b.updateVariableAddView("list"));
  });
  a.appendChild(c);
  d = Entry.createElement("span");
  d.addClass("entryVariableAddSpaceCloudSpanWorkspace");
  d.innerHTML = Lang.Workspace.List_create_cloud;
  c.appendChild(d);
  d = Entry.createElement("span");
  this.listAddPanel.view.cloudCheck = d;
  d.addClass("entryVariableAddSpaceCheckWorkspace");
  d.addClass("entryVariableAddSpaceCloudCheckWorkspace");
  this.listAddPanel.info.isCloud && d.addClass("entryVariableAddChecked");
  c.appendChild(d);
  c = Entry.createElement("div");
  c.addClass("entryVariableAddSpaceButtonWrapperWorkspace");
  a.appendChild(c);
  a = Entry.createElement("span");
  a.addClass("entryVariableAddSpaceCancelWorkspace");
  a.addClass("entryVariableAddSpaceButtonWorkspace");
  a.innerHTML = Lang.Buttons.cancel;
  a.bindOnClick(function(a) {
    b.listAddPanel.view.addClass("entryRemove");
    b.resetVariableAddPanel("list");
  });
  c.appendChild(a);
  a = Entry.createElement("span");
  a.addClass("entryVariableAddSpaceConfirmWorkspace");
  a.addClass("entryVariableAddSpaceButtonWorkspace");
  a.innerHTML = Lang.Buttons.save;
  a.variableContainer = this;
  a.bindOnClick(function(a) {
    b.addList();
    a = b.lists_[0];
    b.updateSelectedVariable(a);
    a = a.listElement;
    a.editButton.addClass("entryRemove");
    a.editSaveButton.removeClass("entryRemove");
    a.nameField.removeAttribute("disabled");
    a.nameField.focus();
  });
  c.appendChild(a);
};
Entry.VariableContainer.prototype.generateVariableSplitterView = function() {
  var b = Entry.createElement("li");
  b.addClass("entryVariableSplitterWorkspace");
  var a = Entry.createElement("li");
  a.addClass("entryVariableSplitterWorkspace");
  this.variableSplitters = {top:b, bottom:a};
};
Entry.VariableContainer.prototype.openVariableAddPanel = function(b) {
  b = b ? b : "variable";
  Entry.playground.toggleOnVariableView();
  Entry.playground.changeViewMode("variable");
  "variable" == b ? this.variableAddPanel.isOpen = !0 : this.listAddPanel.isOpen = !0;
  this.selectFilter(b);
  this.updateVariableAddView(b);
};
Entry.VariableContainer.prototype.getMenuXml = function(b) {
  for (var a = [], c = 0 !== this.variables_.length, d = 0 !== this.lists_.length, e, f = 0, g;g = b[f];f++) {
    var h = g.tagName;
    h && "BLOCK" == h.toUpperCase() ? (e = g.getAttribute("bCategory"), !c && "variable" == e || !d && "list" == e || a.push(g)) : !h || "SPLITTER" != h.toUpperCase() && "BTN" != h.toUpperCase() || !c && "variable" == e || (d || "list" != e) && a.push(g);
  }
  return a;
};
Entry.VariableContainer.prototype.addCloneLocalVariables = function(b) {
  var a = [], c = this;
  this.mapVariable(function(b, c) {
    if (b.object_ && b.object_ == c.objectId) {
      var f = b.toJSON();
      f.originId = f.id;
      f.id = Entry.generateHash();
      f.object = c.newObjectId;
      delete f.x;
      delete f.y;
      a.push(f);
      c.json.script = c.json.script.replace(new RegExp(f.originId, "g"), f.id);
    }
  }, b);
  a.map(function(a) {
    c.addVariable(a);
  });
};
Entry.VariableContainer.prototype.generateTimer = function(b) {
  b || (b = {}, b.id = Entry.generateHash(), b.name = Lang.Workspace.Variable_Timer, b.value = 0, b.variableType = "timer", b.visible = !1, b.x = 150, b.y = -70, b = new Entry.Variable(b));
  b.generateView();
  b.tick = null;
  Entry.engine.projectTimer = b;
  Entry.addEventListener("stop", function() {
    Entry.engine.stopProjectTimer();
  });
};
Entry.VariableContainer.prototype.generateAnswer = function(b) {
  b || (b = new Entry.Variable({id:Entry.generateHash(), name:Lang.Blocks.VARIABLE_get_canvas_input_value, value:0, variableType:"answer", visible:!1, x:150, y:-100}));
  b.generateView();
  Entry.container.inputValue = b;
};
Entry.VariableContainer.prototype.generateVariableSettingView = function() {
  var b = this, a = Entry.createElement("div");
  a.bindOnClick(function(a) {
    a.stopPropagation();
  });
  this.variableSettingView = a;
  a.addClass("entryVariableSettingWorkspace");
  this.listView_.appendChild(a);
  a.addClass("entryRemove");
  var c = Entry.createElement("div");
  c.addClass("entryVariableSettingVisibleWrapperWorkspace");
  c.bindOnClick(function(a) {
    a = b.selectedVariable;
    var c = b.variableSettingView.visibleCheck;
    a.setVisible(!a.isVisible());
    a.isVisible() ? c.addClass("entryVariableSettingChecked") : c.removeClass("entryVariableSettingChecked");
  });
  a.appendChild(c);
  var d = Entry.createElement("span");
  d.innerHTML = Lang.Workspace.show_variable;
  c.appendChild(d);
  d = Entry.createElement("span");
  d.addClass("entryVariableSettingCheckWorkspace");
  a.visibleCheck = d;
  c.appendChild(d);
  c = Entry.createElement("div");
  c.addClass("entryVariableSettingInitValueWrapperWorkspace");
  a.appendChild(c);
  d = Entry.createElement("span");
  d.innerHTML = Lang.Workspace.default_value;
  c.appendChild(d);
  d = Entry.createElement("input");
  d.addClass("entryVariableSettingInitValueInputWorkspace");
  a.initValueInput = d;
  d.value = 0;
  d.onkeyup = function(a) {
    b.selectedVariable.setValue(this.value);
  };
  d.onblur = function(a) {
    b.selectedVariable.setValue(this.value);
  };
  a.initValueInput = d;
  c.appendChild(d);
  c = Entry.createElement("div");
  c.addClass("entryVariableSettingSplitterWorkspace");
  a.appendChild(c);
  c = Entry.createElement("div");
  c.addClass("entryVariableSettingSlideWrapperWorkspace");
  a.appendChild(c);
  d = Entry.createElement("span");
  d.innerHTML = Lang.Workspace.slide;
  c.appendChild(d);
  d = Entry.createElement("span");
  d.addClass("entryVariableSettingCheckWorkspace");
  a.slideCheck = d;
  c.appendChild(d);
  c.bindOnClick(function(a) {
    var c;
    a = b.selectedVariable;
    var d = b.variables_, f = a.getType();
    "variable" == f ? (c = a.toJSON(), c.variableType = "slide", c = new Entry.Variable(c), d.splice(d.indexOf(a), 0, c), 0 > c.getValue() && c.setValue(0), 100 < c.getValue() && c.setValue(100), e.removeAttribute("disabled"), g.removeAttribute("disabled")) : "slide" == f && (c = a.toJSON(), c.variableType = "variable", c = new Entry.Variable(c), d.splice(d.indexOf(a), 0, c), e.setAttribute("disabled", "disabled"), g.setAttribute("disabled", "disabled"));
    b.createVariableView(c);
    b.removeVariable(a);
    b.updateSelectedVariable(c);
    c.generateView();
  });
  c = Entry.createElement("div");
  a.minMaxWrapper = c;
  c.addClass("entryVariableSettingMinMaxWrapperWorkspace");
  a.appendChild(c);
  d = Entry.createElement("span");
  d.innerHTML = Lang.Workspace.min_value;
  c.appendChild(d);
  var e = Entry.createElement("input");
  e.addClass("entryVariableSettingMinValueInputWorkspace");
  d = b.selectedVariable;
  e.value = d && "slide" == d.type ? d.minValue_ : 0;
  e.onblur = function(a) {
    isNaN(this.value) || (a = b.selectedVariable, a.setMinValue(this.value), b.updateVariableSettingView(a));
  };
  a.minValueInput = e;
  c.appendChild(e);
  var f = Entry.createElement("span");
  f.addClass("entryVariableSettingMaxValueSpanWorkspace");
  f.innerHTML = Lang.Workspace.max_value;
  c.appendChild(f);
  var g = Entry.createElement("input");
  g.addClass("entryVariableSettingMaxValueInputWorkspace");
  g.value = d && "slide" == d.type ? d.maxValue_ : 100;
  g.onblur = function(a) {
    isNaN(this.value) || (a = b.selectedVariable, a.setMaxValue(this.value), b.updateVariableSettingView(a));
  };
  a.maxValueInput = g;
  c.appendChild(g);
};
Entry.VariableContainer.prototype.updateVariableSettingView = function(b) {
  var a = this.variableSettingView, c = a.visibleCheck, d = a.initValueInput, e = a.slideCheck, f = a.minValueInput, g = a.maxValueInput, h = a.minMaxWrapper;
  c.removeClass("entryVariableSettingChecked");
  b.isVisible() && c.addClass("entryVariableSettingChecked");
  e.removeClass("entryVariableSettingChecked");
  "slide" == b.getType() ? (e.addClass("entryVariableSettingChecked"), f.removeAttribute("disabled"), g.removeAttribute("disabled"), f.value = b.getMinValue(), g.value = b.getMaxValue(), h.removeClass("entryVariableMinMaxDisabledWorkspace")) : (h.addClass("entryVariableMinMaxDisabledWorkspace"), f.setAttribute("disabled", "disabled"), g.setAttribute("disabled", "disabled"));
  d.value = b.getValue();
  b.listElement.appendChild(a);
  a.removeClass("entryRemove");
};
Entry.VariableContainer.prototype.generateListSettingView = function() {
  var b = this, a = Entry.createElement("div");
  a.bindOnClick(function(a) {
    a.stopPropagation();
  });
  this.listSettingView = a;
  a.addClass("entryListSettingWorkspace");
  this.listView_.appendChild(a);
  a.addClass("entryRemove");
  var c = Entry.createElement("div");
  c.addClass("entryListSettingVisibleWrapperWorkspace");
  c.bindOnClick(function(a) {
    a = b.selectedList;
    var c = b.listSettingView.visibleCheck;
    a.setVisible(!a.isVisible());
    a.isVisible() ? c.addClass("entryListSettingCheckedWorkspace") : c.removeClass("entryListSettingCheckedWorkspace");
  });
  a.appendChild(c);
  var d = Entry.createElement("span");
  d.innerHTML = Lang.Workspace.show_list_workspace;
  c.appendChild(d);
  d = Entry.createElement("span");
  d.addClass("entryListSettingCheckWorkspace");
  a.visibleCheck = d;
  c.appendChild(d);
  d = Entry.createElement("div");
  d.addClass("entryListSettingLengthWrapperWorkspace");
  c = Entry.createElement("span");
  c.addClass("entryListSettingLengthSpanWorkspace");
  c.innerHTML = Lang.Workspace.number_of_list;
  d.appendChild(c);
  a.appendChild(d);
  c = Entry.createElement("div");
  c.addClass("entryListSettingLengthControllerWorkspace");
  d.appendChild(c);
  d = Entry.createElement("span");
  d.addClass("entryListSettingMinusWorkspace");
  d.bindOnClick(function(a) {
    b.selectedList.array_.pop();
    b.updateListSettingView(b.selectedList);
  });
  c.appendChild(d);
  d = Entry.createElement("input");
  d.addClass("entryListSettingLengthInputWorkspace");
  d.onblur = function() {
    b.setListLength(this.value);
  };
  d.onkeypress = function(a) {
    13 == a.keyCode && this.blur();
  };
  a.lengthInput = d;
  c.appendChild(d);
  d = Entry.createElement("span");
  d.addClass("entryListSettingPlusWorkspace");
  d.bindOnClick(function(a) {
    b.selectedList.array_.push({data:0});
    b.updateListSettingView(b.selectedList);
  });
  c.appendChild(d);
  c = Entry.createElement("div");
  a.seperator = c;
  a.appendChild(c);
  c.addClass("entryListSettingSeperatorWorkspace");
  c = Entry.createElement("div");
  c.addClass("entryListSettingListValuesWorkspace");
  a.listValues = c;
  a.appendChild(c);
};
Entry.VariableContainer.prototype.updateListSettingView = function(b) {
  var a = this;
  b = b || this.selectedList;
  var c = this.listSettingView, d = c.listValues, e = c.visibleCheck, f = c.lengthInput, g = c.seperator;
  e.removeClass("entryListSettingCheckedWorkspace");
  b.isVisible() && e.addClass("entryListSettingCheckedWorkspace");
  f.value = b.array_.length;
  for (b.listElement.appendChild(c);d.firstChild;) {
    d.removeChild(d.firstChild);
  }
  var h = b.array_;
  0 === h.length ? g.addClass("entryRemove") : g.removeClass("entryRemove");
  for (e = 0;e < h.length;e++) {
    (function(c) {
      var e = Entry.createElement("div");
      e.addClass("entryListSettingValueWrapperWorkspace");
      var f = Entry.createElement("span");
      f.addClass("entryListSettingValueNumberSpanWorkspace");
      f.innerHTML = c + 1;
      e.appendChild(f);
      f = Entry.createElement("input");
      f.value = h[c].data;
      f.onblur = function() {
        h[c].data = this.value;
        b.updateView();
      };
      f.onkeypress = function(a) {
        13 == a.keyCode && this.blur();
      };
      f.addClass("entryListSettingEachInputWorkspace");
      e.appendChild(f);
      f = Entry.createElement("span");
      f.bindOnClick(function() {
        h.splice(c, 1);
        a.updateListSettingView();
      });
      f.addClass("entryListSettingValueRemoveWorkspace");
      e.appendChild(f);
      d.appendChild(e);
    })(e);
  }
  b.updateView();
  c.removeClass("entryRemove");
};
Entry.VariableContainer.prototype.setListLength = function(b) {
  b = Number(b);
  var a = this.selectedList.array_;
  if (!isNaN(b)) {
    var c = a.length;
    if (c < b) {
      for (b -= c, c = 0;c < b;c++) {
        a.push({data:0});
      }
    } else {
      c > b && (a.length = b);
    }
  }
  this.updateListSettingView();
};
Entry.VariableContainer.prototype.updateViews = function() {
  var b = this.lists_;
  this.variables_.map(function(a) {
    a.updateView();
  });
  b.map(function(a) {
    a.updateView();
  });
};
Entry.VariableContainer.prototype.updateSelectedVariable = function(b, a) {
  b ? "variable" == b.type ? (this.selectedVariable = b, this.updateVariableSettingView(b)) : "slide" == b.type ? (this.selectedVariable = b, this.updateVariableSettingView(b)) : "list" == b.type && (this.selectedList = b, this.updateListSettingView(b)) : (this.selectedVariable = null, "variable" == (a || "variable") ? this.variableSettingView.addClass("entryRemove") : this.listSettingView.addClass("entryRemove"));
};
Entry.VariableContainer.prototype.removeLocalVariables = function(b) {
  var a = [], c = this;
  this.mapVariable(function(b, c) {
    b.object_ && b.object_ == c && a.push(b);
  }, b);
  a.map(function(a) {
    c.removeVariable(a);
  });
};
Entry.VariableContainer.prototype.updateCloudVariables = function() {
  var b = Entry.projectId;
  if (Entry.cloudSavable && b) {
    var a = Entry.variableContainer, b = a.variables_.filter(function(a) {
      return a.isCloud_;
    }), b = b.map(function(a) {
      return a.toJSON();
    }), a = a.lists_.filter(function(a) {
      return a.isCloud_;
    }), a = a.map(function(a) {
      return a.toJSON();
    });
    $.ajax({url:"/api/project/variable/" + Entry.projectId, type:"PUT", data:{variables:b, lists:a}}).done(function() {
    });
  }
};
Entry.block.run = {skeleton:"basic", color:"#3BBD70", contents:["this is", "basic block"], func:function() {
}};
Entry.block.jr_start = {skeleton:"pebble_event", event:"start", color:"#3BBD70", contents:[{type:"Indicator", img:"/img/assets/ntry/bitmap/jr/block_play_image.png", highlightColor:"#3BBD70", size:22}], func:function() {
  var b = Ntry.entityManager.getEntitiesByComponent(Ntry.STATIC.UNIT), a;
  for (a in b) {
    this._unit = b[a];
  }
  Ntry.unitComp = Ntry.entityManager.getComponent(this._unit.id, Ntry.STATIC.UNIT);
}};
Entry.block.jr_repeat = {skeleton:"pebble_loop", color:"#127CDB", contents:[{type:"Dropdown", key:"REPEAT", options:[[1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6], [7, 7], [8, 8], [9, 9], [10, 10]], value:1}, {type:"Text", text:"\ubc18\ubcf5"}, {type:"Statement", key:"STATEMENT", accept:"pebble_basic"}], func:function() {
  if (void 0 === this.repeatCount) {
    return this.repeatCount = this.block.values.REPEAT, Entry.STATIC.CONTINUE;
  }
  if (0 < this.repeatCount) {
    return console.log(this.repeatCount), this.repeatCount--, this.executor.stepInto(this.block.values.STATEMENT), Entry.STATIC.CONTINUE;
  }
  delete this.repeatCount;
}};
Entry.block.jr_item = {skeleton:"pebble_basic", color:"#F46C6C", contents:[{type:"Text", text:"\uaf43 \ubaa8\uc73c\uae30"}, {type:"Indicator", img:"/img/assets/ntry/bitmap/jr/block_item_image.png", highlightColor:"#FFF", position:{x:83, y:0}, size:22}], func:function() {
  if (this.isContinue) {
    if (this.isAction) {
      return Entry.STATIC.CONTINUE;
    }
    delete this.isAction;
    delete this.isContinue;
  } else {
    this.isAction = this.isContinue = !0;
    var b = this;
    Ntry.dispatchEvent("unitAction", Ntry.STATIC.GET_ITEM, function() {
      Ntry.dispatchEvent("getItem");
      b.isAction = !1;
    });
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.cparty_jr_item = {skeleton:"pebble_basic", color:"#8ABC1D", contents:[{type:"Text", text:"\uc5f0\ud544 \uc90d\uae30"}, {type:"Indicator", img:"/img/assets/ntry/bitmap/cpartyjr/pen.png", highlightColor:"#FFF", position:{x:83, y:0}, size:22}], func:function() {
  if (this.isContinue) {
    if (this.isAction) {
      return Entry.STATIC.CONTINUE;
    }
    delete this.isAction;
    delete this.isContinue;
  } else {
    this.isAction = this.isContinue = !0;
    var b = this;
    Ntry.dispatchEvent("unitAction", Ntry.STATIC.GET_ITEM, function() {
      Ntry.dispatchEvent("getItem");
      b.isAction = !1;
    });
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.jr_north = {skeleton:"pebble_basic", color:"#A751E3", contents:[{type:"Text", text:"  \uc704\ucabd"}, {type:"Indicator", img:"/img/assets/ntry/bitmap/jr/block_up_image.png", position:{x:83, y:0}, size:22}], func:function() {
  if (this.isContinue) {
    if (this.isAction) {
      return Entry.STATIC.CONTINUE;
    }
    delete this.isAction;
    delete this.isContinue;
  } else {
    this.isAction = this.isContinue = !0;
    var b = Ntry.STATIC, a = this, c = function() {
      window.setTimeout(function() {
        Ntry.dispatchEvent("unitAction", Ntry.STATIC.WALK, function() {
          a.isAction = !1;
        });
      }, 3);
    }, d;
    switch(Ntry.unitComp.direction) {
      case Ntry.STATIC.EAST:
        d = b.TURN_LEFT;
        break;
      case Ntry.STATIC.SOUTH:
        d = b.HALF_ROTATION;
        break;
      case Ntry.STATIC.WEST:
        d = b.TURN_RIGHT;
        break;
      default:
        c();
    }
    d && Ntry.dispatchEvent("unitAction", d, c);
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.jr_east = {skeleton:"pebble_basic", color:"#A751E3", contents:[{type:"Text", text:"\uc624\ub978\ucabd"}, {type:"Indicator", img:"/img/assets/ntry/bitmap/jr/block_right_image.png", position:{x:83, y:0}, size:22}], func:function() {
  var b = Ntry.STATIC;
  if (this.isContinue) {
    if (this.isAction) {
      return Entry.STATIC.CONTINUE;
    }
    delete this.isAction;
    delete this.isContinue;
  } else {
    this.isAction = this.isContinue = !0;
    var a = this, c = function() {
      window.setTimeout(function() {
        Ntry.dispatchEvent("unitAction", b.WALK, function() {
          a.isAction = !1;
        });
      }, 3);
    }, d;
    switch(Ntry.unitComp.direction) {
      case b.SOUTH:
        d = b.TURN_LEFT;
        break;
      case b.WEST:
        d = b.HALF_ROTATION;
        break;
      case b.NORTH:
        d = b.TURN_RIGHT;
        break;
      default:
        c();
    }
    d && Ntry.dispatchEvent("unitAction", d, c);
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.jr_south = {skeleton:"pebble_basic", color:"#A751E3", contents:[{type:"Text", text:"  \uc544\ub798\ucabd"}, {type:"Indicator", img:"/img/assets/ntry/bitmap/jr/block_down_image.png", position:{x:83, y:0}, size:22}], func:function() {
  if (this.isContinue) {
    if (this.isAction) {
      return Entry.STATIC.CONTINUE;
    }
    delete this.isAction;
    delete this.isContinue;
  } else {
    this.isAction = this.isContinue = !0;
    var b = Ntry.STATIC, a = this, c = function() {
      window.setTimeout(function() {
        Ntry.dispatchEvent("unitAction", Ntry.STATIC.WALK, function() {
          a.isAction = !1;
        });
      }, 3);
    }, d;
    switch(Ntry.unitComp.direction) {
      case b.EAST:
        d = b.TURN_RIGHT;
        break;
      case b.NORTH:
        d = b.HALF_ROTATION;
        break;
      case b.WEST:
        d = b.TURN_LEFT;
        break;
      default:
        c();
    }
    d && Ntry.dispatchEvent("unitAction", d, c);
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.jr_west = {skeleton:"pebble_basic", color:"#A751E3", contents:[{type:"Text", text:"  \uc67c\ucabd"}, {type:"Indicator", img:"/img/assets/ntry/bitmap/jr/block_left_image.png", position:{x:83, y:0}, size:22}], func:function() {
  if (this.isContinue) {
    if (this.isAction) {
      return Entry.STATIC.CONTINUE;
    }
    delete this.isAction;
    delete this.isContinue;
  } else {
    this.isAction = this.isContinue = !0;
    var b = Ntry.STATIC, a = this, c = function() {
      window.setTimeout(function() {
        Ntry.dispatchEvent("unitAction", b.WALK, function() {
          a.isAction = !1;
        });
      }, 3);
    }, d;
    switch(Ntry.unitComp.direction) {
      case b.SOUTH:
        d = b.TURN_RIGHT;
        break;
      case b.EAST:
        d = b.HALF_ROTATION;
        break;
      case b.NORTH:
        d = b.TURN_LEFT;
        break;
      default:
        c();
    }
    d && Ntry.dispatchEvent("unitAction", d, c);
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.jr_start_basic = {skeleton:"basic_event", event:"start", color:"#3BBD70", contents:[{type:"Indicator", boxMultiplier:1, img:"/img/assets/block_icon/start_icon_play.png", highlightColor:"#3BBD70", size:17, position:{x:0, y:-2}}, "\uc2dc\uc791 \ubc84\ud2bc\uc744 \ub20c\ub800\uc744 \ub54c"], func:function() {
  var b = Ntry.entityManager.getEntitiesByComponent(Ntry.STATIC.UNIT), a;
  for (a in b) {
    this._unit = b[a];
  }
  Ntry.unitComp = Ntry.entityManager.getComponent(this._unit.id, Ntry.STATIC.UNIT);
}};
Entry.block.jr_go_straight = {skeleton:"basic", color:"#A751E3", contents:["\uc55e\uc73c\ub85c \uac00\uae30", {type:"Image", img:"/img/assets/ntry/bitmap/jr/cparty_go_straight.png", size:24}], func:function() {
  if (this.isContinue) {
    if (this.isAction) {
      return Entry.STATIC.CONTINUE;
    }
    delete this.isAction;
    delete this.isContinue;
  } else {
    this.isAction = this.isContinue = !0;
    var b = this;
    Ntry.dispatchEvent("unitAction", Ntry.STATIC.WALK, function() {
      b.isAction = !1;
    });
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.jr_turn_left = {skeleton:"basic", color:"#A751E3", contents:["\uc67c\ucabd\uc73c\ub85c \ub3cc\uae30", {type:"Image", img:"/img/assets/ntry/bitmap/jr/cparty_rotate_l.png", size:24}], func:function() {
  if (this.isContinue) {
    if (this.isAction) {
      return Entry.STATIC.CONTINUE;
    }
    delete this.isAction;
    delete this.isContinue;
  } else {
    this.isAction = this.isContinue = !0;
    var b = this;
    Ntry.dispatchEvent("unitAction", Ntry.STATIC.TURN_LEFT, function() {
      b.isAction = !1;
    });
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.jr_turn_right = {skeleton:"basic", color:"#A751E3", contents:["\uc624\ub978\ucabd\uc73c\ub85c \ub3cc\uae30", {type:"Image", img:"/img/assets/ntry/bitmap/jr/cparty_rotate_r.png", size:24}], func:function() {
  if (this.isContinue) {
    if (this.isAction) {
      return Entry.STATIC.CONTINUE;
    }
    delete this.isAction;
    delete this.isContinue;
  } else {
    this.isAction = this.isContinue = !0;
    var b = this;
    Ntry.dispatchEvent("unitAction", Ntry.STATIC.TURN_RIGHT, function() {
      b.isAction = !1;
    });
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.jr_go_slow = {skeleton:"basic", color:"#f46c6c", contents:["\ucc9c\ucc9c\ud788 \uac00\uae30", {type:"Image", img:"/img/assets/ntry/bitmap/jr/cparty_go_slow.png", size:24}], func:function() {
  if (this.isContinue) {
    if (this.isAction) {
      return Entry.STATIC.CONTINUE;
    }
    delete this.isAction;
    delete this.isContinue;
  } else {
    this.isAction = this.isContinue = !0;
    var b = this;
    Ntry.dispatchEvent("unitAction", Ntry.STATIC.GO_SLOW, function() {
      b.isAction = !1;
    });
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.jr_repeat_until_dest = {skeleton:"basic_loop", color:"#498DEB", contents:[{type:"Image", img:"/img/assets/ntry/bitmap/jr/jr_goal_image.png", size:18}, "\ub9cc\ub0a0 \ub54c \uae4c\uc9c0 \ubc18\ubcf5\ud558\uae30", {type:"Image", img:"/img/assets/week/blocks/for.png", size:24}, {type:"Statement", key:"STATEMENT", accept:"basic", alignY:15, alignX:2}], func:function() {
  if (1 !== this.block.values.STATEMENT.getBlocks().length) {
    return this.executor.stepInto(this.block.values.STATEMENT), Entry.STATIC.CONTINUE;
  }
}};
Entry.block.jr_if_construction = {skeleton:"basic_loop", color:"#498DEB", contents:["\ub9cc\uc57d", {type:"Image", img:"/img/assets/ntry/bitmap/jr/jr_construction_image.png", size:18}, "\uc55e\uc5d0 \uc788\ub2e4\uba74", {type:"Image", img:"/img/assets/week/blocks/for.png", size:24}, {type:"Statement", key:"STATEMENT", accept:"basic", alignY:15, alignX:2}], func:function() {
  if (!this.isContinue) {
    var b = Ntry.entityManager.getEntitiesByComponent(Ntry.STATIC.UNIT), a, c;
    for (c in b) {
      a = b[c];
    }
    b = Ntry.entityManager.getComponent(a.id, Ntry.STATIC.UNIT);
    a = Ntry.entityManager.getComponent(a.id, Ntry.STATIC.GRID);
    a = {x:a.x, y:a.y};
    Ntry.addVectorByDirection(a, b.direction, 1);
    a = Ntry.entityManager.find({type:Ntry.STATIC.GRID, x:a.x, y:a.y}, {type:Ntry.STATIC.TILE, tileType:Ntry.STATIC.OBSTACLE_REPAIR});
    this.isContinue = !0;
    b = this.block.values.STATEMENT;
    if (0 !== a.length && 1 !== b.getBlocks().length) {
      return this.executor.stepInto(b), Entry.STATIC.CONTINUE;
    }
  }
}};
Entry.block.jr_if_speed = {skeleton:"basic_loop", color:"#498DEB", contents:["\ub9cc\uc57d", {type:"Image", img:"/img/assets/ntry/bitmap/jr/jr_speed_image.png", size:18}, "\uc55e\uc5d0 \uc788\ub2e4\uba74", {type:"Image", img:"/img/assets/week/blocks/for.png", size:24}, {type:"Statement", key:"STATEMENT", accept:"basic", alignY:15, alignX:2}], func:function() {
  if (!this.isContinue) {
    var b = Ntry.entityManager.getEntitiesByComponent(Ntry.STATIC.UNIT), a, c;
    for (c in b) {
      a = b[c];
    }
    b = Ntry.entityManager.getComponent(a.id, Ntry.STATIC.UNIT);
    a = Ntry.entityManager.getComponent(a.id, Ntry.STATIC.GRID);
    a = {x:a.x, y:a.y};
    Ntry.addVectorByDirection(a, b.direction, 1);
    a = Ntry.entityManager.find({type:Ntry.STATIC.GRID, x:a.x, y:a.y}, {type:Ntry.STATIC.TILE, tileType:Ntry.STATIC.OBSTACLE_SLOW});
    this.isContinue = !0;
    b = this.block.values.STATEMENT;
    if (0 !== a.length && 1 !== b.getBlocks().length) {
      return this.executor.stepInto(b), Entry.STATIC.CONTINUE;
    }
  }
}};
Entry.BlockMenu = function(b, a) {
  Entry.Model(this, !1);
  this._align = a || "CENTER";
  b = "string" === typeof b ? $("#" + b) : $(b);
  if ("DIV" !== b.prop("tagName")) {
    return console.error("Dom is not div element");
  }
  if ("function" !== typeof window.Snap) {
    return console.error("Snap library is required");
  }
  this.svgDom = Entry.Dom($('<svg id="blockMenu" width="100%" height="100%"version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>'), {parent:b});
  this.offset = this.svgDom.offset();
  this._svgWidth = this.svgDom.width();
  this.snap = Snap("#blockMenu");
  this.svgGroup = this.snap.group();
  this.svgThreadGroup = this.svgGroup.group();
  this.svgThreadGroup.board = this;
  this.svgBlockGroup = this.svgGroup.group();
  this.svgBlockGroup.board = this;
  this.changeEvent = new Entry.Event(this);
  this.observe(this, "generateDragBlockObserver", ["dragBlock"]);
  Entry.documentMousedown && Entry.documentMousedown.attach(this, this.setSelectedBlock);
};
(function(b) {
  b.schema = {code:null, dragBlock:null, closeBlock:null, selectedBlockView:null};
  b.changeCode = function(a) {
    if (!(a instanceof Entry.Code)) {
      return console.error("You must inject code instance");
    }
    this.codeListener && this.code.changeEvent.detach(this.codeListener);
    this.set({code:a});
    var b = this;
    this.codeListener = this.code.changeEvent.attach(this, function() {
      b.changeEvent.notify();
    });
    a.createView(this);
    this.align();
  };
  b.bindCodeView = function(a) {
    this.svgBlockGroup.remove();
    this.svgThreadGroup.remove();
    this.svgBlockGroup = a.svgBlockGroup;
    this.svgThreadGroup = a.svgThreadGroup;
    this.svgGroup.append(this.svgThreadGroup);
    this.svgGroup.append(this.svgBlockGroup);
  };
  b.align = function() {
    for (var a = this.code.getThreads(), b = 10, d = "LEFT" == this._align ? 20 : this.svgDom.width() / 2, e = 0, f = a.length;e < f;e++) {
      var g = a[e].getFirstBlock(), h = g.view;
      g.set({x:d, y:b});
      h._moveTo(d, b, !1);
      b += h.height + 15;
    }
    this.changeEvent.notify();
  };
  b.generateDragBlockObserver = function() {
    var a = this.dragBlock;
    a && (this.dragBlockObserver && this.removeDragBlockObserver(), this.dragBlockObserver = a.observe(this, "cloneThread", ["x", "y"], !1));
  };
  b.removeDragBlockObserver = function() {
    var a = this.dragBlockObserver;
    null !== a && (a.destroy(), this.dragBlockObserver = null);
  };
  b.cloneThread = function(a) {
    a = void 0 === a ? !0 : a;
    if (null !== this.dragBlock) {
      this.dragBlockObserver && this.removeDragBlockObserver();
      var b = this._svgWidth, d = this.dragBlock, e = d.block, f = this.code, g = e.getThread();
      e && g && (f.cloneThread(g), a && d.observe(this, "moveBoardBlock", ["x", "y"], !1), d.dominate(), a = this.workspace.getBoard(), this._boardBlockView = a.code.cloneThread(g).getFirstBlock().view, this._boardBlockView.dragInstance = new Entry.DragInstance({height:0, isNew:!0}), a.set({dragBlock:this._boardBlockView}), a.setSelectedBlock(this._boardBlockView), this._boardBlockView.addDragging(), this._boardBlockView.dragMode = Entry.DRAG_MODE_MOUSEDOWN, this._boardBlockView._moveTo(d.x - b, 
      d.y - 0, !1));
      if (this._boardBlockView) {
        return this._boardBlockView.block.id;
      }
    }
  };
  b.terminateDrag = function() {
    if (this._boardBlockView) {
      var a = this._boardBlockView;
      if (a) {
        var b = a.block, d = this.dragBlock, e = d.block, f = this.code, g = this.workspace, h = g.getBoard().code, k = !1;
        a.dragMode = 0;
        a.removeDragging();
        d.x < this._svgWidth ? (k = !0, h.destroyThread(b.getThread(), k)) : b.view.terminateDrag();
        g.getBoard().set({dragBlock:null});
        f.destroyThread(e.getThread(), k);
        delete a.dragInstance;
        this._boardBlockView = null;
      }
    }
  };
  b.dominate = function(a) {
    this.snap.append(a.svgGroup);
  };
  b.getCode = function(a) {
    return this._code;
  };
  b.moveBoardBlock = function() {
    var a = this.workspace.getBoard().offset, b = this.offset, d = a.left - b.left, a = a.top - b.top, e = this.dragBlock, b = this._boardBlockView, f = b.dragInstance, g = Entry.mouseCoordinate;
    f.set({offsetX:g.x, offsetY:g.y});
    if (0 === f.height) {
      for (var g = b.block, h = 0;g;) {
        h += g.view.height, g = g.next;
      }
      f.set({height:h});
    }
    e && b && (f = e.x, e = e.y, b.dragMode = 2, b._moveTo(f - d, e - a, !1));
  };
  b.setMagnetedBlock = function() {
  };
  b.findById = function(a) {
    for (var b = this.code.getThreads(), d = 0, e = b.length;d < e;d++) {
      var f = b[d];
      if (f && (f = f.getFirstBlock()) && f.id == a) {
        return f;
      }
    }
  };
  b.setSelectedBlock = function(a) {
    var b = this.selectedBlockView;
    b && b.removeSelected();
    a instanceof Entry.BlockView ? a.addSelected() : a = null;
    this.set({selectedBlockView:a});
  };
})(Entry.BlockMenu.prototype);
Entry.BlockView = function(b, a) {
  Entry.Model(this, !1);
  this.block = b;
  this._board = a;
  this.set(b);
  this.svgGroup = a.svgBlockGroup.group();
  this.svgGroup.block = this.block;
  this._schema = Entry.block[b.type];
  this._skeleton = Entry.skeleton[this._schema.skeleton];
  this._contents = [];
  this.isInBlockMenu = !(this.getBoard() instanceof Entry.Board);
  this._skeleton.morph && this.block.observe(this, "_renderPath", this._skeleton.morph, !1);
  this.prevObserver = null;
  this._startRender(b);
  this.block.observe(this, "_bindPrev", ["prev"]);
  this.block.observe(this, "_createEmptyBG", ["next"]);
  this.observe(this, "_updateBG", ["magneting"]);
  a.code.observe(this, "_setBoard", ["board"], !1);
  this.dragMode = Entry.DRAG_MODE_NONE;
  Entry.Utils.disableContextmenu(this.svgGroup.node);
};
(function(b) {
  b.schema = {id:0, type:Entry.STATIC.BLOCK_RENDER_MODEL, x:0, y:0, offsetX:0, offsetY:0, width:0, height:0, contentWidth:0, contentHeight:0, magneting:!1, animating:!1};
  b._startRender = function(a) {
    this.svgGroup.attr({class:"block"});
    a = this._skeleton.path(this);
    this._darkenPath = this.svgGroup.path(a);
    this._darkenPath.attr({transform:"t0 1", fill:Entry.Utils.colorDarken(this._schema.color, .7)});
    this._path = this.svgGroup.path(a);
    this._path.attr({strokeWidth:"2", fill:this._schema.color});
    this._moveTo(this.x, this.y, !1);
    this._startContentRender();
    this._addControl();
  };
  b._startContentRender = function() {
    this.contentSvgGroup && this.contentSvgGroup.remove();
    this.contentSvgGroup = this.svgGroup.group();
    var a = this._skeleton.contentPos();
    this.contentSvgGroup.transform("t" + a.x + " " + a.y);
    for (var a = this._schema.contents, b = 0;b < a.length;b++) {
      var d = a[b];
      "string" === typeof d ? this._contents.push(new Entry.FieldText({text:d}, this)) : this._contents.push(new Entry["Field" + d.type](d, this));
    }
    this.alignContent(!1);
  };
  b.alignContent = function(a) {
    !0 !== a && (a = !1);
    for (var b = 0, d = 0, e = 0;e < this._contents.length;e++) {
      d = this._contents[e];
      d.align(b, 0, a);
      e !== this._contents.length - 1 && (b += 5);
      var f = d.box, d = Math.max(f.y + f.height), b = b + f.width;
    }
    this.set({contentWidth:b, contentHeight:d});
    this._render();
  };
  b._bindPrev = function() {
    this.prevObserver && this.prevObserver.destroy();
    this.block.prev ? (this._toLocalCoordinate(this.block.prev.view.svgGroup), this.prevObserver = this.block.prev.view.observe(this, "_align", ["height"])) : (this._toGlobalCoordinate(), delete this.prevObserver);
  };
  b._render = function() {
    this._renderPath();
    this.set(this._skeleton.box(this));
  };
  b._renderPath = function() {
    var a = this._skeleton.path(this);
    this._darkenPath.attr({d:a});
    this._path.attr({d:a});
    this.set({animating:!1});
  };
  b._align = function(a) {
    if (null !== this.block.prev) {
      var b = this.block.prev.view;
      !0 === a && this.set({animating:!0});
      this.set({x:0, y:b.height + 1});
      this._setPosition(!0 === a || this.animating);
    }
  };
  b._setPosition = function(a) {
    a = void 0 === a ? !0 : a;
    var b = "t" + this.x + " " + this.y;
    this.svgGroup.stop();
    a && 0 !== Entry.ANIMATION_DURATION ? this.svgGroup.animate({transform:b}, Entry.ANIMATION_DURATION, mina.easeinout) : $(this.svgGroup.node).attr({transform:"translate(" + this.x + " " + this.y + ")"});
  };
  b._toLocalCoordinate = function(a) {
    var b = a.transform().globalMatrix, d = this.svgGroup.transform().globalMatrix;
    this._moveTo(d.e - b.e, d.f - b.f, !1);
    a.append(this.svgGroup);
  };
  b._toGlobalCoordinate = function() {
    var a = this.svgGroup.transform().globalMatrix;
    this._moveTo(a.e, a.f, !1);
    this._board.svgBlockGroup.append(this.svgGroup);
  };
  b._moveTo = function(a, b, d) {
    this.set({x:a, y:b});
    this._setPosition(d);
  };
  b._moveBy = function(a, b, d) {
    return this._moveTo(this.x + a, this.y + b, d);
  };
  b._addControl = function() {
    var a = this;
    this.svgGroup.mousedown(function() {
      a.onMouseDown.apply(a, arguments);
    });
  };
  b.onMouseDown = function(a) {
    function b(a) {
      var c = k.mouseDownCoordinate;
      if ((k.dragMode == Entry.DRAG_MODE_DRAG || a.pageX !== c.x || a.pageY !== c.y) && k.block.isMovable()) {
        k.block.prev && (k.block.prev.setNext(null), k.block.setPrev(null), k.block.thread.changeEvent.notify());
        this.animating && this.set({animating:!1});
        if (0 === k.dragInstance.height) {
          for (var c = k.block, d = -1;c;) {
            d += c.view.height + 1, c = c.next;
          }
          k.dragInstance.set({height:d});
        }
        a.originalEvent.touches && (a = a.originalEvent.touches[0]);
        c = k.dragInstance;
        k._moveBy(a.pageX - c.offsetX, a.pageY - c.offsetY, !1);
        c.set({offsetX:a.pageX, offsetY:a.pageY});
        k.dragMode = Entry.DRAG_MODE_DRAG;
        (a = k._getCloseBlock()) ? (l = a.view.getBoard(), l.setMagnetedBlock(a.view)) : l.setMagnetedBlock(null);
      }
    }
    function d(a) {
      $(document).unbind(".block");
      delete this.mouseDownCoordinate;
      k.terminateDrag();
      l && l.set({dragBlock:null});
      delete k.dragInstance;
    }
    a.stopPropagation();
    a.preventDefault();
    Entry.documentMousedown && Entry.documentMousedown.notify();
    this.getBoard().setSelectedBlock(this);
    this.dominate();
    if (0 === a.button || a instanceof Touch) {
      this.mouseDownCoordinate = {x:a.pageX, y:a.pageY};
      var e = $(document);
      e.bind("mousemove.block", b);
      e.bind("mouseup.block", d);
      e.bind("touchmove.block", b);
      e.bind("touchend.block", d);
      this.getBoard().set({dragBlock:this});
      this.dragInstance = new Entry.DragInstance({startX:a.pageX, startY:a.pageY, offsetX:a.pageX, offsetY:a.pageY, prev:this.block.prev, height:0, mode:!0});
      this.addDragging();
      this.dragMode = Entry.DRAG_MODE_MOUSEDOWN;
    } else {
      if (Entry.Utils.isRightButton(a)) {
        var f = this, g = f.block;
        if (this.isInBlockMenu || g.isReadOnly()) {
          return;
        }
        var e = [], h = {text:"\ube14\ub85d \uc0ad\uc81c", enable:g.isDeletable(), callback:function() {
          f.block.doDestroyAlone(!0);
        }};
        e.push({text:"\ube14\ub85d \ubcf5\uc0ac & \ubd99\uc5ec\ub123\uae30", callback:function() {
          for (var a = g.getThread(), b = a.getBlocks().indexOf(g), c = a.toJSON(!0, b), b = [], d = new Entry.Thread([], g.getCode()), e = 0;e < c.length;e++) {
            b.push(new Entry.Block(c[e], d));
          }
          c = f.svgGroup.transform().globalMatrix;
          b[0].set({x:c.e + 20, y:c.f + 20});
          b[0].doAdd();
          a.getCode().createThread(b);
        }});
        e.push(h);
        Entry.ContextMenu.show(e);
      }
    }
    var k = this, l = this.getBoard();
    a.stopPropagation();
  };
  b.terminateDrag = function() {
    var a = this.getBoard(), b = this.dragMode, d = this.block;
    this.removeDragging();
    if (a instanceof Entry.BlockMenu) {
      a.terminateDrag();
    } else {
      if (b !== Entry.DRAG_MODE_MOUSEDOWN) {
        this.dragInstance && this.dragInstance.isNew && d.doAdd();
        var e = this.dragInstance && this.dragInstance.prev, f = this._getCloseBlock();
        e || f ? f ? (this.set({animating:!0}), f.next && f.next.view.set({animating:!0}), d.doInsert(f), createjs.Sound.play("entryMagneting")) : d.doSeparate() : b == Entry.DRAG_MODE_DRAG && d.doMove();
        a.setMagnetedBlock(null);
      }
    }
    this.dragMode = Entry.DRAG_MODE_NONE;
    this.destroyShadow();
  };
  b._getCloseBlock = function() {
    var a = this.getBoard(), b = a instanceof Entry.BlockMenu, d = this.x, e = this.y;
    b && (d -= a._svgWidth, a = a.workspace.getBoard());
    var f = a.relativeOffset, d = Snap.getElementByPoint(d + f.left, e + f.top);
    if (null !== d) {
      for (e = d.block;!e && d.parent() && "svg" !== d.type && "BODY" !== d.type;) {
        d = d.parent(), e = d.block;
      }
      return void 0 === e || e === this.block ? null : b ? e : e.view.getBoard() == a ? e : null;
    }
  };
  b._inheritAnimate = function() {
    var a = this.block.prev.view;
    a && this.set({animating:a.animating});
  };
  b.dominate = function() {
    for (var a = this.getBoard().svgBlockGroup, b = this.svgGroup;b.parent() !== a;) {
      b = b.parent();
    }
    a.append(b);
  };
  b.getBoard = function() {
    return this._board;
  };
  b._setBoard = function() {
    this._board = this._board.code.board;
  };
  b.destroy = function(a) {
    var b = this.svgGroup;
    a ? b.animate({opacity:0}, 100, null, function() {
      this.remove();
    }) : b.remove();
  };
  b.getShadow = function() {
    this._shadow || (this._shadow = this.svgGroup.clone(), this._shadow.attr({opacity:.5}));
    return this._shadow;
  };
  b.destroyShadow = function() {
    delete this._shadow;
  };
  b._updateBG = function() {
    if (this._board.dragBlock && this._board.dragBlock.dragInstance) {
      var a = this._board.dragBlock.dragInstance.height, b = this, d = b.svgGroup;
      if (b.magneting) {
        var e = this._board.dragBlock.getShadow();
        $(e.node).attr({transform:"translate(0 " + (this.height + 1) + ")"});
        this.svgGroup.prepend(e);
        this._clonedShadow = e;
        b.background && (b.background.remove(), b.nextBackground.remove(), delete b.background, delete b.nextBackground);
        a = b.height + a;
        e = d.rect(0 - b.width / 2, 1.5 * b.height + 1, b.width, Math.max(0, a - 1.5 * b.height));
        e.block = b.block.next;
        b.nextBackground = e;
        e.attr({fill:"transparent"});
        d.prepend(e);
        e = d.rect(0 - b.width / 2, 0, b.width, a);
        b.background = e;
        e.attr({fill:"transparent"});
        d.prepend(e);
        b.originalHeight = b.height;
        b.set({height:a});
      } else {
        if (this._clonedShadow && (this._clonedShadow.remove(), delete this._clonedShadow), a = b.originalHeight) {
          setTimeout(function() {
            b.background && (b.background.remove(), b.nextBackground.remove(), delete b.background, delete b.nextBackground);
          }, Entry.ANIMATION_DURATION), b.set({height:a}), delete b.originalHeight;
        }
      }
      b.block.thread.changeEvent.notify();
    }
  };
  b._createEmptyBG = function() {
    if (this.block.next) {
      this.emptyBackground && (this.emptyBackground.remove(), delete this.emptyBackground);
    } else {
      var a = this.svgGroup.rect(0 + this.offsetX, this.height, this.width, 20);
      this.emptyBackground = a;
      a.attr({fill:"transparent"});
      this.svgGroup.prepend(a);
    }
  };
  b.addDragging = function() {
    this.svgGroup.addClass("dragging");
  };
  b.removeDragging = function() {
    this.svgGroup.removeClass("dragging");
  };
  b.addSelected = function() {
    this.svgGroup.addClass("selected");
  };
  b.removeSelected = function() {
    this.svgGroup.removeClass("selected");
  };
  b.getSkeleton = function() {
    return this._skeleton;
  };
})(Entry.BlockView.prototype);
Entry.Code = function(b) {
  Entry.Model(this, !1);
  this._data = new Entry.Collection;
  this._eventMap = {};
  this.executors = [];
  this.executeEndEvent = new Entry.Event(this);
  this.changeEvent = new Entry.Event(this);
  this.load(b);
};
(function(b) {
  b.schema = {view:null, board:null};
  b.load = function(a) {
    if (!(a instanceof Array)) {
      return console.error("code must be array");
    }
    for (var b = 0;b < a.length;b++) {
      this._data.push(new Entry.Thread(a[b], this));
    }
  };
  b.createView = function(a) {
    null === this.view ? this.set({view:new Entry.CodeView(this, a), board:a}) : (this.set({board:a}), a.bindCodeView(this.view));
  };
  b.registerEvent = function(a, b) {
    this._eventMap[b] || (this._eventMap[b] = []);
    this._eventMap[b].push(a);
  };
  b.raiseEvent = function(a) {
    a = this._eventMap[a];
    if (void 0 !== a) {
      for (var b = 0;b < a.length;b++) {
        this.executors.push(new Entry.Executor(a[b]));
      }
    }
  };
  b.getEventMap = function(a) {
    return this._eventMap;
  };
  b.map = function(a) {
    this._data.map(a);
  };
  b.tick = function() {
    for (var a = this.executors, b = 0;b < a.length;b++) {
      var d = a[b];
      d.execute();
      null === d.scope.block && (a.splice(b, 1), b--, 0 === a.length && this.executeEndEvent.notify());
    }
  };
  b.clearExecutors = function() {
    this.executors = [];
  };
  b.createThread = function(a) {
    if (!(a instanceof Array)) {
      return console.error("blocks must be array");
    }
    this._data.push(new Entry.Thread(a, this));
  };
  b.cloneThread = function(a) {
    a = a.clone(this);
    this._data.push(a);
    return a;
  };
  b.destroyThread = function(a, b) {
    var d = this._data, e = d.indexOf(a);
    0 > e || (d.splice(e, 1), (d = a.getFirstBlock()) && d.destroy(b));
  };
  b.doDestroyThread = function(a, b) {
    var d = this._data, e = d.indexOf(a);
    0 > e || (d.splice(e, 1), (d = a.getFirstBlock()) && d.doDestroy(b));
  };
  b.getThreads = function() {
    return this._data;
  };
  b.toJSON = function() {
    for (var a = this.getThreads(), b = [], d = 0, e = a.length;d < e;d++) {
      b.push(a[d].toJSON());
    }
    return b;
  };
  b.countBlock = function() {
    for (var a = this.getThreads(), b = 0, d = 0;d < a.length;d++) {
      b += a[d].countBlock();
    }
    return b;
  };
  b.moveBy = function(a, b) {
    for (var d = this.getThreads(), e = 0, f = d.length;e < f;e++) {
      var g = d[e].getFirstBlock();
      g && g.view._moveBy(a, b, !1);
    }
  };
  b.stringify = function() {
    return JSON.stringify(this.toJSON());
  };
})(Entry.Code.prototype);
Entry.CodeView = function(b, a) {
  Entry.Model(this, !1);
  this.code = b;
  this.set({board:a});
  this.svgThreadGroup = a.svgGroup.group();
  this.svgThreadGroup.attr({class:"svgThreadGroup"});
  this.svgThreadGroup.board = a;
  this.svgBlockGroup = a.svgGroup.group();
  this.svgBlockGroup.attr({class:"svgBlockGroup"});
  this.svgBlockGroup.board = a;
  a.bindCodeView(this);
  this.code.map(function(b) {
    b.createView(a);
  });
  b.observe(this, "_setBoard", ["board"]);
};
(function(b) {
  b.schema = {board:null, scrollX:0, scrollY:0};
  b._setBoard = function() {
    this.set({board:this.code.board});
  };
})(Entry.CodeView.prototype);
Entry.Executor = function(b) {
  this.scope = {block:b, executor:this};
  this._callStack = [];
};
(function(b) {
  b.execute = function() {
    void 0 === this.scope.block._schema.func.call(this.scope) && (this.scope = {block:this.scope.block.next, executor:this});
    null === this.scope.block && this._callStack.length && (this.scope = this._callStack.pop());
  };
  b.stepInto = function(a) {
    a instanceof Entry.Thread || console.error("Must step in to thread");
    this._callStack.push(this.scope);
    a = a.getFirstBlock();
    a instanceof Entry.DummyBlock && (a = a.next);
    this.scope = {block:a, executor:this};
  };
})(Entry.Executor.prototype);
Entry.FieldDropdown = function(b, a) {
  this._block = a.block;
  this.box = new Entry.BoxModel;
  this.svgGroup = null;
  this._contents = b;
  this.key = b.key;
  this.value = this._block.values[this.key];
  this.renderStart(a);
};
(function(b) {
  b.renderStart = function(a) {
    var b = this;
    this.svgGroup = a.contentSvgGroup.group();
    this.svgGroup.attr({class:"entry-field-dropdown"});
    this.textElement = this.svgGroup.text(2, 3, this.getTextByValue(this.value));
    a = this.textElement.node.getComputedTextLength() + 18;
    this._header = this.svgGroup.rect(0, -12, a, 23, 3).attr({fill:"#80cbf8"});
    this.svgGroup.append(this.textElement);
    this._arrow = this.svgGroup.polygon(0, -2, 6, -2, 3, 2).attr({fill:"#127cbd", stroke:"#127cbd", transform:"t" + (a - 11) + " 0"});
    this.svgGroup.mouseup(function(a) {
      b._block.view.dragMode == Entry.DRAG_MODE_MOUSEDOWN && b.renderOptions();
    });
    this.box.set({x:0, y:0, width:a, height:23});
  };
  b.resize = function() {
    var a = this.textElement.node.getComputedTextLength() + 18;
    this._header.attr({width:a});
    this._arrow.attr({transform:"t" + (a - 11) + " 0"});
    this.box.set({width:a});
    this._block.view.alignContent();
  };
  b.renderOptions = function() {
    var a = this;
    this.destroyOption();
    var b = this._block.view;
    this.documentDownEvent = Entry.documentMousedown.attach(this, function() {
      Entry.documentMousedown.detach(this.documentDownEvent);
      a.optionGroup.remove();
    });
    this.optionGroup = b.getBoard().svgGroup.group();
    var d = b.svgGroup.transform().globalMatrix, b = this._contents.options;
    this.optionGroup.attr({class:"entry-field-dropdown", transform:"t" + (d.e - 60) + " " + (d.f + 35)});
    var d = [], e = 0;
    d.push(this.optionGroup.rect(0, 0, 0, 23 * b.length).attr({fill:"white"}));
    for (var f = 0, g = b.length;f < g;f++) {
      var h = b[f], k = h[0], h = h[1], l = this.optionGroup.group().attr({class:"rect", transform:"t0 " + 23 * f});
      d.push(l.rect(0, 0, 0, 23));
      this.value == h && l.text(5, 13, "\u2713").attr({"alignment-baseline":"central"});
      k = l.text(20, 13, k).attr({"alignment-baseline":"central"});
      e = Math.max(k.node.getComputedTextLength() + 50, e);
      (function(b, c) {
        b.mousedown(function() {
          a.applyValue(c);
          a.destroyOption();
        });
      })(l, h);
    }
    var q = {width:e};
    d.forEach(function(a) {
      a.attr(q);
    });
  };
  b.align = function(a, b, d) {
    var e = this.svgGroup, f = "t" + a + " " + b;
    void 0 === d || d ? e.animate({transform:f}, 300, mina.easeinout) : e.attr({transform:f});
    this.box.set({x:a, y:b});
  };
  b.applyValue = function(a) {
    this.value != a && (this.value = this._block.values[this.key] = a, this.textElement.node.textContent = this.getTextByValue(a), this.resize());
  };
  b.destroyOption = function() {
    this.documentDownEvent && (Entry.documentMousedown.detach(this.documentDownEvent), delete this.documentDownEvent);
    this.optionGroup && (this.optionGroup.remove(), delete this.optionGroup);
  };
  b.getTextByValue = function(a) {
    for (var b = this._contents.options, d = 0, e = b.length;d < e;d++) {
      var f = b[d];
      if (f[1] == a) {
        return f[0];
      }
    }
    return a;
  };
})(Entry.FieldDropdown.prototype);
Entry.FieldImage = function(b, a) {
  this._block = a;
  this.box = new Entry.BoxModel;
  this._size = b.size;
  this._imgUrl = b.img;
  this._highlightColor = b.highlightColor ? b.highlightColor : "#F59900";
  this._position = b.position;
  this._imgElement = this._path = this.svgGroup = null;
  this.renderStart();
};
(function(b) {
  b.renderStart = function() {
    this.svgGroup = this._block.contentSvgGroup.group();
    this._imgElement = this.svgGroup.image(this._imgUrl, 0, -.5 * this._size, this._size, this._size);
    this.box.set({x:this._size, y:0, width:this._size, height:this._size});
  };
  b.align = function(a, b, d) {
    var e = this.svgGroup;
    this._position && (a = this._position.x);
    var f = "t" + a + " " + b;
    void 0 === d || d ? e.animate({transform:f}, 300, mina.easeinout) : e.attr({transform:f});
    this.box.set({x:a, y:b});
  };
  b.enableHighlight = function() {
    var a = this._path.getTotalLength(), b = this._path;
    this._path.attr({stroke:this._highlightColor, strokeWidth:2, "stroke-linecap":"round", "stroke-dasharray":a + " " + a, "stroke-dashoffset":a});
    setInterval(function() {
      b.attr({"stroke-dashoffset":a}).animate({"stroke-dashoffset":0}, 300);
    }, 1400, mina.easeout);
    setTimeout(function() {
      setInterval(function() {
        b.animate({"stroke-dashoffset":-a}, 300);
      }, 1400, mina.easeout);
    }, 500);
  };
})(Entry.FieldImage.prototype);
Entry.FieldIndicator = function(b, a) {
  this._block = a;
  this.box = new Entry.BoxModel;
  this._size = b.size;
  this._imgUrl = b.img;
  this._boxMultiplier = b.boxMultiplier || 2;
  this._highlightColor = b.highlightColor ? b.highlightColor : "#F59900";
  this._position = b.position;
  this._imgElement = this._path = this.svgGroup = null;
  this.renderStart();
};
(function(b) {
  b.renderStart = function() {
    this.svgGroup = this._block.contentSvgGroup.group();
    this._imgElement = this.svgGroup.image(this._imgUrl, -1 * this._size, -1 * this._size, 2 * this._size, 2 * this._size);
    var a = "m 0,-%s a %s,%s 0 1,1 -0.1,0 z".replace(/%s/gi, this._size);
    this._path = this.svgGroup.path(a);
    this._path.attr({stroke:"none", fill:"none"});
    this.box.set({x:this._size, y:0, width:this._size * this._boxMultiplier, height:this._size * this._boxMultiplier});
  };
  b.align = function(a, b, d) {
    var e = this.svgGroup;
    this._position && (a = this._position.x, b = this._position.y);
    var f = "t" + a + " " + b;
    void 0 === d || d ? e.animate({transform:f}, 300, mina.easeinout) : e.attr({transform:f});
    this.box.set({x:a, y:b});
  };
  b.enableHighlight = function() {
    var a = this._path.getTotalLength(), b = this._path;
    this._path.attr({stroke:this._highlightColor, strokeWidth:2, "stroke-linecap":"round", "stroke-dasharray":a + " " + a, "stroke-dashoffset":a});
    setInterval(function() {
      b.attr({"stroke-dashoffset":a}).animate({"stroke-dashoffset":0}, 300);
    }, 1400, mina.easeout);
    setTimeout(function() {
      setInterval(function() {
        b.animate({"stroke-dashoffset":-a}, 300);
      }, 1400, mina.easeout);
    }, 500);
  };
})(Entry.FieldIndicator.prototype);
Entry.FieldStatement = function(b, a) {
  this._blockView = a;
  this.block = a.block;
  this.key = b.key;
  this.box = new Entry.BoxModel;
  this.acceptType = b.accept;
  this.dummyBlock = this.svgGroup = null;
  b.alignX && (this._alignX = b.alignX);
  b.alignY && (this._alignY = b.alignY);
  this.box.observe(a, "alignContent", ["height"]);
  this.renderStart(a.getBoard());
  this.block.observe(this, "_updateThread", ["thread"]);
};
(function(b) {
  b.renderStart = function(a) {
    this.svgGroup = this._blockView.contentSvgGroup.group();
    this.box.set({x:46, y:0, width:20, height:20});
    this._thread = this._blockView.block.values[this.key];
    this.dummyBlock = new Entry.DummyBlock(this, this._blockView);
    this._thread.insertDummyBlock(this.dummyBlock);
    this._thread.createView(a);
    this._thread.changeEvent.attach(this, this.calcHeight);
    this.calcHeight();
  };
  b.calcHeight = function() {
    for (var a = this.dummyBlock, b = -1;a;) {
      b += a.view.height + 1, a = a.next;
    }
    this.box.set({height:b});
  };
  b.align = function(a, b, d) {
    var e = this.svgGroup;
    a = this._alignX || 46;
    b = this._alignY || 14;
    a = "t" + a + " " + b;
    void 0 === d || d ? e.animate({transform:a}, 300, mina.easeinout) : e.attr({transform:a});
  };
  b._updateThread = function() {
    this._threadChangeEvent && this._thread.changeEvent.detach(this._threadChangeEvent);
    var a = this.block.thread;
    this._threadChangeEvent = this._thread.changeEvent.attach(this, function() {
      a.changeEvent.notify();
    });
  };
})(Entry.FieldStatement.prototype);
Entry.DummyBlock = function(b, a) {
  Entry.Model(this, !1);
  this.view = this;
  this.originBlockView = a;
  this._schema = {};
  this._thread = b._thread;
  this.statementField = b;
  this.svgGroup = b.svgGroup.group();
  this.svgGroup.block = this;
  var c = Entry.skeleton[b.acceptType].box();
  this.path = this.svgGroup.rect(c.offsetX, c.offsetY - 10, c.width, c.height);
  this.path.attr({fill:"transparent"});
  this.prevObserver = a.observe(this, "_align", ["x", "y"]);
  this.prevAnimatingObserver = a.observe(this, "_inheritAnimate", ["animating"]);
  this.observe(this, "_updateBG", ["magneting"]);
  this._align();
};
(function(b) {
  b.schema = {x:0, y:0, width:0, height:0, animating:!1, magneting:!1};
  b._align = function(a) {
    this.set({x:this.originBlockView.x, y:this.originBlockView.y});
  };
  b.insertAfter = function(a) {
    this._thread.insertByBlock(this, a);
    this.statementField.calcHeight();
  };
  b.createView = function() {
  };
  b.setThread = function() {
  };
  b.setPrev = function() {
  };
  b.setNext = function(a) {
    this.next = a;
  };
  b.getBoard = function() {
    return this.originBlockView.getBoard();
  };
  b._inheritAnimate = function() {
    this.set({animating:this.originBlockView.animating});
  };
  b._updateBG = function() {
    if (this.magneting) {
      var a = this.getBoard().dragBlock.dragInstance.height;
      this.set({height:a});
      a = this.getBoard().dragBlock.getShadow();
      a.attr({transform:"t0 0"});
      this.svgGroup.prepend(a);
      this._clonedShadow = a;
    } else {
      this._clonedShadow && (this._clonedShadow.remove(), delete this._clonedShadow), this.set({height:0});
    }
    this._thread.changeEvent.notify();
  };
  b.dominate = function() {
    this.originBlockView.dominate();
  };
})(Entry.DummyBlock.prototype);
Entry.FieldText = function(b, a) {
  this._block = a;
  this.box = new Entry.BoxModel;
  this._fontSize = b.fontSize || a.getSkeleton().fontSize || 12;
  this._text = b.text;
  this.textElement = null;
  this.renderStart();
};
(function(b) {
  b.renderStart = function() {
    this.textElement = this._block.contentSvgGroup.text(0, 0, this._text);
    this.textElement.attr({style:"white-space: pre; font-size:" + this._fontSize + "px", "class":"dragNone", fill:"white"});
    var a = this.textElement.getBBox();
    this.textElement.attr({y:.25 * a.height});
    this.box.set({x:0, y:0, width:this.textElement.node.getComputedTextLength(), height:a.height});
  };
  b.align = function(a, b, d) {
    !0 !== d && (d = !1);
    var e = this.textElement, f = {x:a};
    d ? e.animate(f, 300, mina.easeinout) : e.attr(f);
    this.box.set({x:a, width:this.textElement.node.getComputedTextLength(), y:b});
  };
})(Entry.FieldText.prototype);
Entry.Scroller = function(b, a, c) {
  this._horizontal = void 0 === a ? !0 : a;
  this._vertical = void 0 === c ? !0 : c;
  this.board = b;
  this.board.changeEvent.attach(this, this.resizeScrollBar);
  this.svgGroup = null;
  this.vRatio = this.vY = this.vWidth = this.hRatio = this.hX = this.hWidth = 0;
  this._visible = !0;
  this.createScrollBar();
  Entry.windowResized && Entry.windowResized.attach(this, this.resizeScrollBar);
};
Entry.Scroller.RADIUS = 7;
(function(b) {
  b.createScrollBar = function() {
    var a = Entry.Scroller.RADIUS, b = this;
    this.svgGroup = this.board.snap.group().attr({class:"boardScrollbar"});
    this._horizontal && (this.hScrollbar = this.svgGroup.rect(0, 0, 0, 2 * a, a), this.hScrollbar.mousedown(function(a) {
      function e(a) {
        a.stopPropagation();
        a.preventDefault();
        a.originalEvent.touches && (a = a.originalEvent.touches[0]);
        var d = b.dragInstance;
        b.scroll((a.pageX - d.offsetX) / b.hRatio, 0);
        d.set({offsetX:a.pageX, offsetY:a.pageY});
      }
      function f(a) {
        $(document).unbind(".scroll");
        delete b.dragInstance;
      }
      if (0 === a.button || a instanceof Touch) {
        Entry.documentMousedown && Entry.documentMousedown.notify(a);
        var g = $(document);
        g.bind("mousemove.scroll", e);
        g.bind("mouseup.scroll", f);
        g.bind("touchmove.scroll", e);
        g.bind("touchend.scroll", f);
        b.dragInstance = new Entry.DragInstance({startX:a.pageX, startY:a.pageY, offsetX:a.pageX, offsetY:a.pageY});
      }
      a.stopPropagation();
    }));
    this._vertical && (this.vScrollbar = this.svgGroup.rect(0, 0, 2 * a, 0, a), this.vScrollbar.mousedown(function(a) {
      function e(a) {
        a.stopPropagation();
        a.preventDefault();
        a.originalEvent.touches && (a = a.originalEvent.touches[0]);
        var d = b.dragInstance;
        b.scroll(0, (a.pageY - d.offsetY) / b.vRatio);
        d.set({offsetX:a.pageX, offsetY:a.pageY});
      }
      function f(a) {
        $(document).unbind(".scroll");
        delete b.dragInstance;
      }
      if (0 === a.button || a instanceof Touch) {
        Entry.documentMousedown && Entry.documentMousedown.notify(a);
        var g = $(document);
        g.bind("mousemove.scroll", e);
        g.bind("mouseup.scroll", f);
        g.bind("touchmove.scroll", e);
        g.bind("touchend.scroll", f);
        b.dragInstance = new Entry.DragInstance({startX:a.pageX, startY:a.pageY, offsetX:a.pageX, offsetY:a.pageY});
      }
      a.stopPropagation();
    }));
    this.resizeScrollBar();
  };
  b.resizeScrollBar = function() {
    var a = this.board.svgBlockGroup.getBBox(), b = this.board.svgDom, d = b.width(), b = b.height();
    this.setVisible(!0);
    if (this._horizontal) {
      var e = -a.width + Entry.BOARD_PADDING, f = d - Entry.BOARD_PADDING, g = (d + 2 * Entry.Scroller.RADIUS) * a.width / (f - e + a.width);
      isNaN(g) && (g = 0);
      this.hX = (a.x - e) / (f - e) * (d - g - 2 * Entry.Scroller.RADIUS);
      this.hScrollbar.attr({width:g, x:this.hX, y:b - 2 * Entry.Scroller.RADIUS});
      this.hRatio = (d - g - 2 * Entry.Scroller.RADIUS) / (f - e);
    }
    this._vertical && (e = -a.height + Entry.BOARD_PADDING, f = b - Entry.BOARD_PADDING, g = (b + 2 * Entry.Scroller.RADIUS) * a.height / (f - e + a.height), this.vY = (a.y - e) / (f - e) * (b - g - 2 * Entry.Scroller.RADIUS), this.vScrollbar.attr({height:g, y:this.vY, x:d - 2 * Entry.Scroller.RADIUS}), this.vRatio = (b - g - 2 * Entry.Scroller.RADIUS) / (f - e));
  };
  b.updateScrollBar = function(a, b) {
    this._horizontal && (this.hX += a * this.hRatio, this.hScrollbar.attr({x:this.hX}));
    this._vertical && (this.vY += b * this.vRatio, this.vScrollbar.attr({y:this.vY}));
  };
  b.scroll = function(a, b) {
    var d = this.board.svgBlockGroup.getBBox(), e = this.board.svgDom;
    a = Math.max(-d.width + Entry.BOARD_PADDING - d.x, a);
    b = Math.max(-d.height + Entry.BOARD_PADDING - d.y, b);
    a = Math.min(e.width() - Entry.BOARD_PADDING - d.x, a);
    b = Math.min(e.height() - Entry.BOARD_PADDING - d.y, b);
    this.board.code.moveBy(a, b);
    this.updateScrollBar(a, b);
  };
  b.setVisible = function(a) {
    a != this.isVisible() && (this._visible = a, this.svgGroup.attr({display:!0 === a ? "block" : "none"}));
  };
  b.isVisible = function() {
    return this._visible;
  };
})(Entry.Scroller.prototype);
Entry.skeleton = function() {
};
Entry.skeleton.basic = {path:function(b) {
  b = b.contentWidth;
  b = Math.max(0, b - 6);
  return "m -8,0 l 8,8 8,-8 h %w a 15,15 0 0,1 0,30 h -%w l -8,8 -8,-8 v -30 z".replace(/%w/gi, b);
}, box:function(b) {
  return {offsetX:0, offsetY:0, width:(b ? b.contentWidth : 150) + 30, height:30, marginBottom:0};
}, magnets:{previous:{}, next:{x:0, y:31}}, contentPos:function(b) {
  return {x:14, y:15};
}};
Entry.skeleton.basic_event = {path:function(b) {
  b = b.contentWidth;
  b = Math.max(0, b);
  return "m -8,0 m 0,-5 a 19.5,19.5 0, 0,1 16,0 c 10,5 15,5 20,5 h %w a 15,15 0 0,1 0,30 H 8 l -8,8 -8,-8 l 0,0.5 a 19.5,19.5 0, 0,1 0,-35 z".replace(/%w/gi, b - 30);
}, box:function(b) {
  return {offsetX:0, offsetY:0, width:b.contentWidth + 30, height:30, marginBottom:0};
}, magnets:{previous:{}, next:{x:0, y:31}}, contentPos:function(b) {
  return {x:1, y:15};
}};
Entry.skeleton.basic_loop = {path:function(b) {
  var a = Math.max(b.contentHeight, 25);
  return "m -8,0 l 8,8 8,-8 h %cw a 15,15 0 0,1 0,30 H 24 l -8,8 -8,-8 h -0.4 v %ch h 0.4 l 8,8 8,-8 h %cw h -8 a 8,8 0 0,1 0,16 H 8 l -8,8 -8,-8 z".replace(/%cw/gi, Math.max(0, b.contentWidth - 31)).replace(/%ch/gi, a);
}, magnets:function() {
  return {previous:{x:0, y:0}, next:{x:0, y:105}};
}, box:function(b) {
  return {offsetX:0, offsetY:0, width:b.contentWidth, height:Math.max(b.contentHeight, 25) + 46, marginBottom:0};
}, contentPos:function() {
  return {x:14, y:15};
}};
Entry.skeleton.pebble_event = {path:function(b) {
  return "m 0,0 a 25,25 0 0,1 9,48.3 a 9,9 0 0,1 -18,0 a 25,25 0 0,1 9,-48.3 z";
}, box:function(b) {
  return {offsetX:-25, offsetY:0, width:50, height:48.3, marginBottom:0};
}, magnets:function(b) {
  return {next:{x:0, y:49.3}};
}, contentPos:function() {
  return {x:0, y:25};
}};
Entry.skeleton.pebble_loop = {fontSize:16, path:function(b) {
  b = Math.max(b.contentHeight, 50);
  return "M 0,9 a 9,9 0 0,0 9,-9 h %cw q 25,0 25,25 v %ch q 0,25 -25,25 h -%cw a 9,9 0 0,1 -18,0 h -%cw q -25,0 -25,-25 v -%ch q 0,-25 25,-25 h %cw a 9,9 0 0,0 9,9 M 0,49 a 9,9 0 0,1 -9,-9 h -28 a 25,25 0 0,0 -25,25 v %cih a 25,25 0 0,0 25,25 h 28 a 9,9 0 0,0 18,0 h 28 a 25,25 0 0,0 25,-25 v -%cih a 25,25 0 0,0 -25,-25 h -28 a 9,9 0 0,1 -9,9 z".replace(/%cw/gi, 41).replace(/%ch/gi, b + 4).replace(/%cih/gi, b - 50);
}, magnets:function() {
  return {previous:{x:0, y:0}, next:{x:0, y:105}};
}, box:function(b) {
  return {offsetX:-75, offsetY:0, width:150, height:Math.max(b.contentHeight, 50) + 54, marginBottom:0};
}, contentPos:function() {
  return {x:-46, y:25};
}};
Entry.skeleton.pebble_basic = {fontSize:16, morph:["prev", "next"], path:function(b) {
  var a = b.block;
  b = a.prev && "pebble_basic" === a.prev._schema.skeleton;
  a = a.next && "pebble_basic" === a.next._schema.skeleton;
  return "m 0,9 a 9,9 0 0,0 9,-9 h 28 " + (b ? "l 25,0 0,25" : "q 25,0 25,25") + (a ? "l 0,25 -25,0" : "q 0,25 -25,25") + "h -28 a 9,9 0 0,1 -18,0 h -28 " + (a ? "l -25,0 0,-25" : "q -25,0 -25,-25") + (b ? "l 0,-25 25,0" : "q 0,-25 25,-25") + "h 28 a 9,9 0 0,0 9,9 z";
}, magnets:function() {
  return {previous:{x:0, y:0}, next:{x:0, y:51}};
}, box:function() {
  return {offsetX:-62, offsetY:0, width:124, height:50, marginBottom:0};
}, contentPos:function() {
  return {x:-46, y:25};
}};
Entry.Block = function(b, a) {
  Entry.Model(this, !1);
  this._schema = null;
  this.setThread(a);
  this.load(b);
};
Entry.Block.MAGNET_RANGE = 10;
Entry.Block.MAGNET_OFFSET = .4;
(function(b) {
  b.schema = {id:null, name:null, x:0, y:0, type:null, values:{}, prev:null, next:null, view:null, thread:null, movable:!0, deletable:!0, readOnly:!1};
  b.load = function(a) {
    a.id || (a.id = Entry.Utils.generateId());
    this.set(a);
    this.getSchema();
  };
  b.getSchema = function() {
    this._schema = Entry.block[this.type];
    this._schema.event && this.thread.registerEvent(this, this._schema.event);
    for (var a = this._schema.contents, b = 0;b < a.length;b++) {
      var d = a[b];
      !this.values[d.key] && d.value && (this.values[d.key] = d.value);
      "Statement" == d.type && (this.values[d.key] = new Entry.Thread(this.values[d.key], this.getCode()));
    }
  };
  b.setThread = function(a) {
    this.set({thread:a});
  };
  b.getThread = function() {
    return this.thread;
  };
  b.setPrev = function(a) {
    a !== this && this.set({prev:a});
  };
  b.setNext = function(a) {
    a !== this && this.set({next:a});
  };
  b.next = function() {
    return this.next;
  };
  b.insertAfter = function(a) {
    this.thread.insertByBlock(this, a);
  };
  b._updatePos = function() {
    this.view && this.set({x:this.view.x, y:this.view.y});
    this.next && this.next._updatePos();
  };
  b.createView = function(a) {
    this.view || (this.set({view:new Entry.BlockView(this, a)}), this._updatePos());
  };
  b.clone = function(a) {
    return new Entry.Block(this.toJSON(!0), a);
  };
  b.toJSON = function(a) {
    var b = this._toJSON();
    delete b.prev;
    delete b.next;
    delete b.view;
    delete b.thread;
    a && delete b.id;
    var d = {}, e;
    for (e in b.values) {
      d[e] = b.values[e];
    }
    b.values = d;
    d = this._schema.contents;
    for (e = 0;e < d.length;e++) {
      var f = d[e];
      "Statement" == f.type && (b.values[f.key] = this.values[f.key].toJSON(a));
    }
    return b;
  };
  b.destroy = function(a) {
    this.view && this.view.destroy(a);
    (!this.prev || this.prev instanceof Entry.DummyBlock) && this.thread.destroy();
    var b = this.values.STATEMENT;
    b && (b = b.getFirstBlock(), b instanceof Entry.DummyBlock && (b = b.next), b && b.destroy(a));
    this.next && this.next.destroy(a);
  };
  b.destroyAlone = function(a) {
    this.view && this.view.destroy(a);
    this.getThread().spliceBlock(this);
  };
  b.getView = function() {
    return this.view;
  };
  b.setMovable = function(a) {
    this.movable != a && this.set({movable:a});
  };
  b.isMovable = function() {
    return this.movable;
  };
  b.setDeletable = function(a) {
    this.deletable != a && this.set({deletable:a});
  };
  b.isDeletable = function() {
    return this.deletable;
  };
  b.isReadOnly = function() {
    return this.readOnly;
  };
  b.getCode = function() {
    return this.thread.getCode();
  };
  b.doAdd = function() {
    var a = this.id;
    console.log("doAdd", a);
    Entry.activityReporter && (a = [["blockId", a], ["code", this.getCode().stringify()]], Entry.activityReporter.add(new Entry.Activity("addBlock", a)));
    this.getCode().changeEvent.notify();
  };
  b.doMove = function() {
    var a = this.id, b = this.view.x - this.x, d = this.view.y - this.y;
    console.log("doMove", a, b, d);
    this._updatePos();
    this.getCode().changeEvent.notify();
    Entry.activityReporter && (a = [["blockId", a], ["moveX", b], ["moveY", d], ["code", this.getCode().stringify()]], Entry.activityReporter.add(new Entry.Activity("moveBlock", a)));
  };
  b.doSeparate = function() {
    var a = this.id, b = this.x, d = this.y;
    console.log("separate", a, b, d);
    this.thread.separate(this);
    this._updatePos();
    this.getCode().changeEvent.notify();
    Entry.activityReporter && (a = [["blockId", a], ["positionX", b], ["positionY", d], ["code", this.getCode().stringify()]], Entry.activityReporter.add(new Entry.Activity("seperateBlock", a)));
  };
  b.doInsert = function(a) {
    var b = this.id, d = a.id, e = this.x, f = this.y;
    console.log("insert", b, d, e, f);
    var g = this.thread.cut(this);
    a.insertAfter(g);
    this._updatePos();
    this.getCode().changeEvent.notify();
    Entry.activityReporter && (a = [["targetBlockId", d], ["blockId", b], ["positionX", e], ["positionY", f], ["code", this.getCode().stringify()]], Entry.activityReporter.add(new Entry.Activity("insertBlock", a)));
  };
  b.doDestroy = function(a) {
    var b = this.id, d = this.x, e = this.y;
    console.log("destroy", b, d, e);
    this.destroy(a);
    this.getCode().changeEvent.notify();
    Entry.activityReporter && (a = [["blockId", b], ["positionX", d], ["positionY", e], ["code", this.getCode().stringify()]], Entry.activityReporter.add(new Entry.Activity("destroyBlock", a)));
  };
  b.doDestroyAlone = function(a) {
    if (this.isDeletable()) {
      var b = this.id, d = this.x, e = this.y;
      console.log("destroy alone", b, d, e);
      this.destroyAlone(a);
      this.getCode().changeEvent.notify();
      Entry.activityReporter && (a = [["blockId", b], ["positionX", d], ["positionY", e], ["code", this.getCode().stringify()]], Entry.activityReporter.add(new Entry.Activity("destroyBlockAlone", a)));
      return !0;
    }
  };
})(Entry.Block.prototype);
Entry.Thread = function(b, a) {
  this._data = new Entry.Collection;
  this._code = a;
  this.changeEvent = new Entry.Event(this);
  this.changeEvent.attach(this, this.inspectExist);
  this.load(b);
};
(function(b) {
  b.load = function(a) {
    void 0 === a && (a = []);
    if (!(a instanceof Array)) {
      return console.error("thread must be array");
    }
    for (var b = 0;b < a.length;b++) {
      var d = a[b];
      d instanceof Entry.Block || d instanceof Entry.DummyBlock ? (d.setThread(this), this._data.push(d)) : this._data.push(new Entry.Block(d, this));
    }
    this._setRelation();
    (a = this._code.view) && this.createView(a.board);
  };
  b._setRelation = function() {
    var a = this._data.getAll();
    if (0 !== a.length) {
      var b = a[0];
      b.setPrev(null);
      a[a.length - 1].setNext(null);
      for (var d = 1;d < a.length;d++) {
        var e = a[d];
        e.setPrev(b);
        b.setNext(e);
        b = e;
      }
    }
  };
  b.registerEvent = function(a, b) {
    this._code.registerEvent(a, b);
  };
  b.createView = function(a) {
    this.view || (this.view = new Entry.ThreadView(this, a));
    this._data.map(function(b) {
      b.createView(a);
    });
  };
  b.separate = function(a) {
    this._data.has(a.id) && (a.prev && (a.prev.setNext(null), a.setPrev(null)), a = this._data.splice(this._data.indexOf(a)), this._code.createThread(a), this.changeEvent.notify());
  };
  b.cut = function(a) {
    a = this._data.indexOf(a);
    var b = this._data.splice(a);
    this._data[a - 1] && this._data[a - 1].setNext(null);
    this.changeEvent.notify();
    return b;
  };
  b.insertDummyBlock = function(a) {
    this._data.unshift(a);
    this._data[1] && (this._data[1].setPrev(a), a.setNext(this._data[1]));
  };
  b.insertByBlock = function(a, b) {
    var d = this._data.indexOf(a);
    a.setNext(b[0]);
    b[0].setPrev(a);
    for (var e in b) {
      b[e].setThread(this);
    }
    this._data.splice.apply(this._data, [d + 1, 0].concat(b));
    this._setRelation();
    this.changeEvent.notify();
  };
  b.clone = function(a) {
    a = a || this._code;
    a = new Entry.Thread([], a);
    for (var b = this._data, d = [], e = 0, f = b.length;e < f;e++) {
      d.push(b[e].clone(a));
    }
    a.load(d);
    return a;
  };
  b.toJSON = function(a, b) {
    for (var d = [], e = void 0 === b ? 0 : b;e < this._data.length;e++) {
      this._data[e] instanceof Entry.Block && d.push(this._data[e].toJSON(a));
    }
    return d;
  };
  b.destroy = function(a) {
    this._code.destroyThread(this, !1);
    this.view && this.view.destroy(a);
  };
  b.getFirstBlock = function() {
    return this._data[0];
  };
  b.getBlocks = function() {
    return this._data;
  };
  b.countBlock = function() {
    for (var a = 0, b = 0;b < this._data.length;b++) {
      var d = this._data[b];
      if (d.type) {
        a++;
        for (var e = Entry.block[d.type].contents, f = 0;f < e.length;f++) {
          var g = e[f];
          "Statement" == g.type && (a += d.values[g.key].countBlock());
        }
      }
    }
    return a;
  };
  b.inspectExist = function() {
  };
  b.getCode = function() {
    return this._code;
  };
  b.setCode = function(a) {
    this._code = a;
  };
  b.spliceBlock = function(a) {
    var b = this.getBlocks();
    b.remove(a);
    0 !== b.length ? (null === a.prev ? a.next.setPrev(null) : null === a.next ? a.prev.setNext(null) : (a.prev.setNext(a.next), a.next.setPrev(a.prev)), this._setRelation()) : this.destroy();
    this.changeEvent.notify();
  };
})(Entry.Thread.prototype);
Entry.ThreadView = function(b, a) {
  Entry.Model(this, !1);
  this.thread = b;
  this.svgGroup = a.svgThreadGroup.group();
};
(function(b) {
  b.schema = {scrollX:0, scrollY:0};
  b.destroy = function() {
    this.svgGroup.remove();
  };
})(Entry.ThreadView.prototype);
Entry.FieldTrashcan = function(b) {
  this.board = b;
  this.svgGroup = b.snap.group();
  this.renderStart();
  this.dragBlockObserver = this.dragBlock = null;
  this.isOver = !1;
  b.observe(this, "updateDragBlock", ["dragBlock"]);
  this.setPosition();
  Entry.windowResized && Entry.windowResized.attach(this, this.setPosition);
};
(function(b) {
  b.renderStart = function() {
    var a = Entry.mediaFilePath + "delete_";
    this.trashcanTop = this.svgGroup.image(a + "cover.png", 0, 0, 60, 20);
    this.trashcan = this.svgGroup.image(a + "body.png", 0, 20, 60, 60);
    a = this.svgGroup.filter(Snap.filter.shadow(1, 1, 2));
    this.svgGroup.attr({filter:a});
  };
  b.updateDragBlock = function() {
    var a = this.board.dragBlock, b = this.dragBlockObserver;
    a ? a.observe(this, "checkBlock", ["x", "y"]) : (b && b.destroy(), this.isOver && this.dragBlock && (this.dragBlock.block.doDestroy(!0), createjs.Sound.play("entryDelete")), this.tAnimation(!1));
    this.dragBlock = a;
  };
  b.checkBlock = function() {
    var a = this.dragBlock;
    if (a && a.block.isDeletable()) {
      var b = this.board.offset, d = this.getPosition(), e = d.x + b.left, b = d.y + b.top, f, g;
      if (a = a.dragInstance) {
        f = a.offsetX, g = a.offsetY;
      }
      this.tAnimation(f >= e && g >= b);
    }
  };
  b.align = function() {
    var a = this.getPosition();
    this.svgGroup.attr({transform:"t" + a.x + " " + a.y});
  };
  b.setPosition = function() {
    var a = this.board.svgDom;
    this._x = a.width() - 110;
    this._y = a.height() - 110;
    this.align();
  };
  b.getPosition = function() {
    return {x:this._x, y:this._y};
  };
  b.tAnimation = function(a) {
    if (a !== this.isOver) {
      a = void 0 === a ? !0 : a;
      var b = this.trashcanTop;
      a ? b.animate({transform:"t5 -20 r30"}, 50) : b.animate({transform:"r0"}, 50);
      this.isOver = a;
    }
  };
})(Entry.FieldTrashcan.prototype);
Entry.Board = function(b) {
  function a(a) {
    var b = $(window);
    a = b.scrollTop();
    var b = b.scrollLeft(), f = c.offset;
    c.relativeOffset = {top:f.top - a, left:f.left - b};
    console.log("update");
  }
  b = "string" === typeof b ? $("#" + b) : $(b);
  if ("DIV" !== b.prop("tagName")) {
    return console.error("Dom is not div element");
  }
  if ("function" !== typeof window.Snap) {
    return console.error("Snap library is required");
  }
  Entry.Model(this, !1);
  this.svgDom = Entry.Dom($('<svg id="play" class="entryBoard" width="100%" height="100%"version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>'), {parent:b});
  this.offset = this.svgDom.offset();
  this.offset.top = 130;
  this.offset.left -= $(window).scrollLeft();
  this.relativeOffset = this.offset;
  var c = this;
  $(window).scroll(a);
  Entry.windowResized.attach(this, a);
  this.snap = Snap("#play");
  this._blockViews = [];
  this.trashcan = new Entry.FieldTrashcan(this);
  this.svgGroup = this.snap.group();
  this.svgThreadGroup = this.svgGroup.group();
  this.svgThreadGroup.board = this;
  this.svgBlockGroup = this.svgGroup.group();
  this.svgBlockGroup.board = this;
  Entry.ANIMATION_DURATION = 200;
  Entry.BOARD_PADDING = 100;
  this.changeEvent = new Entry.Event(this);
  this.scroller = new Entry.Scroller(this, !0, !0);
  this._addControl(b);
  Entry.documentMousedown && Entry.documentMousedown.attach(this, this.setSelectedBlock);
  Entry.keyPressed && Entry.keyPressed.attach(this, this._keyboardControl);
};
(function(b) {
  b.schema = {code:null, dragBlock:null, magnetedBlockView:null, selectedBlockView:null};
  b.changeCode = function(a) {
    this.codeListener && this.code.changeEvent.detach(this.codeListener);
    this.set({code:a});
    var b = this;
    this.codeListener = this.code.changeEvent.attach(this, function() {
      b.changeEvent.notify();
    });
    a.createView(this);
    this.changeEvent.notify();
  };
  b.bindCodeView = function(a) {
    this.svgBlockGroup.remove();
    this.svgThreadGroup.remove();
    this.svgBlockGroup = a.svgBlockGroup;
    this.svgThreadGroup = a.svgThreadGroup;
    this.svgGroup.append(this.svgThreadGroup);
    this.svgGroup.append(this.svgBlockGroup);
  };
  b.setMagnetedBlock = function(a) {
    if (this.magnetedBlockView) {
      if (this.magnetedBlockView === a) {
        return;
      }
      this.magnetedBlockView.set({magneting:!1});
    }
    this.set({magnetedBlockView:a});
    a && (a.set({magneting:!0, animating:!0}), a.dominate(), this.dragBlock.dominate());
  };
  b.getCode = function() {
    return this.code;
  };
  b.findById = function(a) {
    for (var b = this.code.getThreads(), d = 0, e = b.length;d < e;d++) {
      var f = b[d];
      if (f) {
        for (var f = f.getBlocks(), g = 0, e = f.length;g < e;g++) {
          if (f[g] && f[g].id == a) {
            return f[g];
          }
        }
      }
    }
  };
  b._addControl = function(a) {
    var b = this;
    a.mousedown(function() {
      b.onMouseDown.apply(b, arguments);
    });
    a.bind("touchstart", function() {
      b.onMouseDown.apply(b, arguments);
    });
    a.on("mousewheel", function() {
      b.mouseWheel.apply(b, arguments);
    });
  };
  b.onMouseDown = function(a) {
    function b(a) {
      a.stopPropagation();
      a.preventDefault();
      a.originalEvent.touches && (a = a.originalEvent.touches[0]);
      var c = f.dragInstance;
      f.scroller.scroll(a.pageX - c.offsetX, a.pageY - c.offsetY);
      c.set({offsetX:a.pageX, offsetY:a.pageY});
    }
    function d(a) {
      $(document).unbind(".entryBoard");
      delete f.dragInstance;
    }
    a.originalEvent.touches && (a = a.originalEvent.touches[0]);
    if (0 === a.button || a instanceof Touch) {
      Entry.documentMousedown && Entry.documentMousedown.notify(a);
      var e = $(document);
      e.bind("mousemove.entryBoard", b);
      e.bind("mouseup.entryBoard", d);
      e.bind("touchmove.entryBoard", b);
      e.bind("touchend.entryBoard", d);
      this.dragInstance = new Entry.DragInstance({startX:a.pageX, startY:a.pageY, offsetX:a.pageX, offsetY:a.pageY});
    }
    var f = this;
    a.stopPropagation();
  };
  b.mouseWheel = function(a) {
    a = a.originalEvent;
    this.scroller.scroll(a.wheelDeltaX || -a.deltaX, a.wheelDeltaY || -a.deltaY);
  };
  b.setSelectedBlock = function(a) {
    var b = this.selectedBlockView;
    b && b.removeSelected();
    a instanceof Entry.BlockView ? a.addSelected() : a = null;
    this.set({selectedBlockView:a});
  };
  b._keyboardControl = function(a, b) {
    var d = this.selectedBlockView;
    d && 46 == b.keyCode && d.block.doDestroyAlone(!0) && this.set({selectedBlockView:null});
  };
})(Entry.Board.prototype);
Entry.Workspace = function(b, a) {
  Entry.Model(this, !1);
  b.workspace = this;
  a.workspace = this;
  this._blockMenu = b;
  this._board = a;
  this.svgGroup = b.snap.group();
  this._stopEvent = new Entry.Event(this);
};
(function(b) {
  b.getBoard = function() {
    return this._board;
  };
  b.getBlockMenu = function() {
    return this._blockMenu;
  };
  b.playAddBlock = function(a) {
    var b = this, d;
    a.cloneId ? (d = this._blockMenu.findById(a.cloneId)) || (d = this._board.findById(a.cloneId)) : d = this._blockMenu.findById(a.target);
    if (d) {
      if (a.dest.id) {
        var e = this._board.findById(a.dest.id);
        a.dest.x = this.getBlockMenu()._svgWidth + e.view.x;
        a.dest.y = e.view.y + e.view.height;
      }
      var f = d.view, g = f.getBoard();
      g.set({dragBlock:f});
      d = g.cloneThread();
      a.cloneId = d;
      (d = f.moveBoardBlockObserver) && d.destroy();
      d = a.dest.x;
      e = a.dest.y;
      f._moveTo(d, e, !0, a.duration - 300);
      var h = this.getBoard().offset, k = this.getBlockMenu().offset, l = h.left - k.left, h = h.top - k.top;
      this.getBoard().dragBlock._moveTo(d - l, e - h, !0, a.duration - 300);
      setTimeout(function() {
        f._align(!0);
        var d = f._getCloseBlock();
        d ? g.setMagnetedBlock(d.view) : g.setMagnetedBlock(null);
        f.terminateDrag();
        g && g.set({dragBoard:null});
        b._stopEvent.notify(a);
      }, a.duration - 300);
    }
  };
  b.playMoveBlock = function(a) {
    var b = this, d;
    console.log("cloneId=", a.cloneId);
    d = a.cloneId ? this._board.findById(a.cloneId) : this._board.findById(a.target);
    if (a.dest.id) {
      var e = this._board.findById(a.dest.id);
      a.dest.x = this.getBlockMenu()._svgWidth + e.view.x;
      a.dest.y = e.view.y + e.view.height;
    }
    var f = d.view, g = f.getBoard();
    g.set({dragBlock:f});
    (d = f.moveBoardBlockObserver) && d.destroy();
    d = a.dest.x;
    e = a.dest.y;
    f._moveTo(d, e, !0, a.duration - 300);
    var h = this.getBoard().offset, k = this.getBlockMenu().offset;
    f._moveTo(d - (h.left - k.left), e - (h.top - k.top), !0, a.duration - 300);
    setTimeout(function() {
      f._align(!0);
      var d = f._getCloseBlock();
      d ? g.setMagnetedBlock(d.view) : g.setMagnetedBlock(null);
      f.terminateDrag();
      g && g.set({dragBoard:null});
      b._stopEvent.notify(a);
    }, a.duration - 300);
  };
  b.moveMouse = function(a, b) {
  };
  b.generateImage = function(a) {
    var b = this.getBoard().svgDom[0], d = b.clientWidth / 2, b = b.clientHeight / 2;
    this.svgGroup = this._board.snap.group();
    this.image = this.svgGroup.image(a, d, b, 30, 30);
  };
})(Entry.Workspace.prototype);
Entry.Xml = {};
Entry.Xml.isTypeOf = function(b, a) {
  return a.getAttribute("type") == b;
};
Entry.Xml.getNextBlock = function(b) {
  b = b.childNodes;
  for (var a = 0;a < b.length;a++) {
    if ("NEXT" == b[a].tagName.toUpperCase()) {
      return b[a].children[0];
    }
  }
  return null;
};
Entry.Xml.getStatementBlock = function(b, a) {
  var c = a.getElementsByTagName("statement");
  if (!c.length) {
    return a;
  }
  for (var d in c) {
    if (c[d].getAttribute("name") == b) {
      return c[d].children[0];
    }
  }
  return null;
};
Entry.Xml.getParentLoop = function(b) {
  for (;;) {
    if (!b) {
      return null;
    }
    if ((b = b.parentNode) && "STATEMENT" == b.tagName.toUpperCase()) {
      return b.parentNode;
    }
    if (b) {
      b = b.parentNode;
    } else {
      return null;
    }
  }
};
Entry.Xml.getParentIterateLoop = function(b) {
  for (;;) {
    if (!b) {
      return null;
    }
    if ((b = b.parentNode) && b.getAttribute("type") && "REPEAT" == b.getAttribute("type").toUpperCase().substr(0, 6)) {
      return b;
    }
    if (!b) {
      return null;
    }
  }
};
Entry.Xml.getParentBlock = function(b) {
  return (b = b.parentNode) ? b.parentNode : null;
};
Entry.Xml.callReturn = function(b) {
  var a = Entry.Xml.getNextBlock(b);
  return a ? a : Entry.Xml.getParentLoop(b);
};
Entry.Xml.isRootBlock = function(b) {
};
Entry.Xml.getValue = function(b, a) {
  var c = a.childNodes;
  if (!c.length) {
    return null;
  }
  for (var d in c) {
    if ("VALUE" == c[d].tagName.toUpperCase() && c[d].getAttribute("name") == b) {
      return c[d].children[0];
    }
  }
  return null;
};
Entry.Xml.getNumberValue = function(b, a, c) {
  c = c.childNodes;
  if (!c.length) {
    return null;
  }
  for (var d in c) {
    if (c[d].tagName && "VALUE" == c[d].tagName.toUpperCase() && c[d].getAttribute("name") == a) {
      return Number(Entry.Xml.operate(b, c[d].children[0]));
    }
  }
  return null;
};
Entry.Xml.getField = function(b, a) {
  var c = a.childNodes;
  if (!c.length) {
    return null;
  }
  for (var d in c) {
    if (c[d].tagName && "FIELD" == c[d].tagName.toUpperCase() && c[d].getAttribute("name") == b) {
      return c[d].textContent;
    }
  }
};
Entry.Xml.getNumberField = function(b, a) {
  var c = a.childNodes;
  if (!c.length) {
    return null;
  }
  for (var d in c) {
    if ("FIELD" == c[d].tagName.toUpperCase() && c[d].getAttribute("name") == b) {
      return Number(c[d].textContent);
    }
  }
};
Entry.Xml.getBooleanValue = function(b, a, c) {
  c = c.getElementsByTagName("value");
  if (!c.length) {
    return null;
  }
  for (var d in c) {
    if (c[d].getAttribute("name") == a) {
      return Entry.Xml.operate(b, c[d].children[0]);
    }
  }
  return null;
};
Entry.Xml.operate = function(b, a) {
  return Entry.block[a.getAttribute("type")](b, a);
};
Entry.Xml.cloneBlock = function(b, a, c) {
  var d = b.cloneNode();
  b.parentNode && "xml" != b.parentNode.tagName && Entry.Xml.cloneBlock(b.parentNode, d, "parent");
  for (var e = 0;e < b.childNodes.length;e++) {
    var f = b.childNodes[e];
    f instanceof Text ? d.textContent = f.textContent : "parent" == c ? d.appendChild(a) : d.appendChild(Entry.Xml.cloneBlock(f, d, "child"));
  }
  return d;
};
Entry.Youtube = function(b) {
  this.generateView(b);
};
p = Entry.Youtube.prototype;
p.init = function(b) {
  this.youtubeHash = b;
  this.generateView();
};
p.generateView = function(b) {
  var a = Entry.createElement("div");
  a.addClass("entryContainerMovieWorkspace");
  a.addClass("entryHidden");
  this.movieContainer = a;
  a = Entry.createElement("iframe");
  a.setAttribute("id", "youtubeIframe");
  a.setAttribute("allowfullscreen", "");
  a.setAttribute("frameborder", 0);
  a.setAttribute("src", "https://www.youtube.com/embed/" + b);
  this.movieFrame = a;
  this.movieContainer.appendChild(a);
};
p.getView = function() {
  return this.movieContainer;
};
p.resize = function() {
  var b = document.getElementById("entryContainerWorkspaceId"), a = document.getElementById("youtubeIframe");
  w = b.offsetWidth;
  a.width = w + "px";
  a.height = 9 * w / 16 + "px";
};

