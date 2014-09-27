ChaiBioTech.app.Views = ChaiBioTech.app.Views || {};

ChaiBioTech.app.Views.mainCanvas = null; // This could be used across application to fire

ChaiBioTech.app.Views.fabricCanvas = function(model, appRouter) {

  this.model = model;
  this.allStepViews = [];
  var that = this;
  ChaiBioTech.app.Views.mainCanvas = this.canvas = new fabric.Canvas('canvas', {
    backgroundColor: '#ffb400',
    selection: false,
    stateful: true
  });
  // Moving event handlers into canvas object
  // For better performance and in accordance with fabric js specific
  // For mouse down
  this.canvas.on("mouse:down", function(evt) {
    if(evt.target) {
      switch(evt.target.name)  {

      case "step":
        var me = evt.target.me;
        me.parentStage.selectStage();
        me.selectStep();
        // Sending data to backbone
        appRouter.editStageStep.trigger("stepSelected", me);
      break;

      case "controlCircleGroup":
        var me = evt.target.me;
        me.manageClick();
        appRouter.editStageStep.trigger("stepSelected", me.parent);
      break;
      }
    }
  });
  // For dragging
  this.canvas.on('object:moving', function(evt) {
    if(evt.target) {
      switch(evt.target.name) {
        case "controlCircleGroup":
          var targetCircleGroup = evt.target,
          me = evt.target.me;
          me.manageDrag(targetCircleGroup);
          appRouter.editStageStep.trigger("stepDrag", me);
        break;
      }
    }
  });
  // when scrolling is finished
  this.canvas.on('object:modified', function(evt) {
    if(evt.target) {
      if(evt.target.name === "controlCircleGroup") {// Right now we have only one item here otherwise switch case

        var me = evt.target.me,
        temp = evt.target.me.temperature.text;
        me.model.changeTemperature(parseInt(temp.substr(0, temp.length - 1)));
      }
    }
  });
  // We add this handler so that canvas works when scrolled
  $(".canvas-containing").scroll(function(){
    that.canvas.calcOffset();
  });

  this.canvas.on("footerImagesLoaded", function() {
    that.addTemperatureLines();
    that.selectStep();
    that.canvas.renderAll();
  })
  this.setDefaultWidthHeight = function() {
    this.canvas.setHeight(420);
    var width = (this.allStepViews.length * 122 > 1024) ? this.allStepViews.length * 120 : 1024
    this.canvas.setWidth(width + 50);
    this.canvas.renderAll();
  };

  this.canvas.on("modelChanged", function(evt) {
    that.model.getLatestModel(that.canvas);
    that.canvas.clear();
    that.canvas.renderAll();
  });

  this.canvas.on("latestData", function() {
    while(that.allStepViews.length > 0) {
      that.allStepViews.pop();
    }
    ChaiBioTech.app.selectedStage = null;
    ChaiBioTech.app.selectedStep = null;
    ChaiBioTech.app.selectedCircle = null;
    that.addStages();
    that.setDefaultWidthHeight();
    that.addinvisibleFooterToStep();
  })

  this.selectStep = function() {
    this.allStepViews[0].parentStage.selectStage();
    this.allStepViews[0].selectStep();
    this.canvas.renderAll();
    appRouter.editStageStep.trigger("stepSelected", this.allStepViews[0]);
  }
  this.addStages = function() {
    var allStages = this.model.get("experiment").protocol.stages;
    var stage = {};
    var previousStage = null;

    for (stageIndex in allStages) {
      stageModel = new ChaiBioTech.Models.Stage({"stage": allStages[stageIndex].stage});
      stageView = new ChaiBioTech.app.Views.fabricStage(stageModel, this.canvas, this.allStepViews, stageIndex, this);

      if(previousStage){
        previousStage.nextStage = stageView;
        stageView.previousStage = previousStage;
      }

      previousStage = stageView;
      stageView.render();
    }
    // Only for the last stage
    stageView.borderRight();
    this.canvas.add(stageView.borderRight);
  };

  this.addTemperatureLines = function() {
    this.allCircles = null;
    this.allCircles = this.findAllCircles();
    var i = 0, limit = this.allCircles.length;

    for(i = 0; i < limit; i++) {
      this.allCircles[i].getLinesAndCircles();
    }
  }

  this.addinvisibleFooterToStep = function() {
    var count = 0, limit = this.allStepViews.length,
    stepDark = "assets/selected-step-01.png",
    stepWhite = "assets/selected-step-02.png",
    stepCommon = "assets/common-step.png",
    gatherData = "assets/gather-data.png";
    addImage = function(count, that, url, image, callBack) {
      fabric.Image.fromURL(url, function(img) {
        img.left = that.allStepViews[count].left - 1;
        img.top = 383;
        img.selectable = false;
        img.visible = false;

        if(image == "darkFooter") {
          that.allStepViews[count].darkFooterImage = img;
          that.canvas.add(that.allStepViews[count].darkFooterImage);
        } else if(image == "whiteFooter") {
          img.top = 363;
          img.left = that.allStepViews[count].left;
          that.allStepViews[count].whiteFooterImage = img;
          that.canvas.add(that.allStepViews[count].whiteFooterImage);
        } else if(image == "commonFooter") {
          that.allStepViews[count].commonFooterImage = img;
          that.canvas.add(that.allStepViews[count].commonFooterImage);
        }

        //that.canvas.add(img);
        count = count + 1;

        if(count < limit) {
          addImage(count, that, url, image, callBack);
        } else if(callBack) { // I want it to be called at the end of all the functioin Calls
          callBack();
        }
      });
    }

    addGatheDataImage = function(that, url, count) {
        fabric.Image.fromURL(url, function(img) {
          img.originX = "center";
          img.originY = "center";
          that.allStepViews[count].circle.gatherDataImage = img;
          count = count + 1;
          if(count < limit) {
            addGatheDataImage(that, url, count);
          }
        });
    }
    addGatheDataImage(this, gatherData, 0);
    addImage(0, this, stepCommon, "commonFooter");
    addImage(0, this, stepDark, "darkFooter");
    addImage(0, this, stepWhite, "whiteFooter", function() {
      // This is sent as callback, we need this to be executed after all
      // images are loaded.
      that.canvas.fire("footerImagesLoaded");
    });

  }


  this.findAllCircles = function() {
    var i = 0, limit = this.allStepViews.length, circles = [], tempCirc = null;
    for(i = 0; i < limit; i++) {
      if(tempCirc) {
        // U could do the switch with array itself,
        // but definitely it doesn't look good.
        this.allStepViews[i].circle["previous"] = tempCirc;
        tempCirc.next = this.allStepViews[i].circle;
      }
      tempCirc = this.allStepViews[i].circle;
      circles.push(this.allStepViews[i].circle);
    }
    return circles;
  }

  return this;
}
