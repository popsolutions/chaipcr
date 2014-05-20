ChaiBioTech.Views.Design = ChaiBioTech.Views.Design || {} ;

ChaiBioTech.Views.Design.holdTime = Backbone.View.extend({
	
	template: JST["backbone/templates/design/hold-time"],
	events: {
		"click .minutes": "editMinute",
		"click .seconds": "editSeconds"
	},

	editMinute: function(evt) {
		evt.preventDefault();
		evt.stopPropagation();
	},

	editSeconds: function(evt) {
		evt.preventDefault();
		evt.stopPropagation();
	},

	initialize: function() {
		console.log(this.model["hold_time"]);
	},

	render: function() {
		timeInSeconds = parseInt(this.model["hold_time"]);
		minutes = (timeInSeconds >= 60) ? timeInSeconds / 60 : "0";
		seconds = timeInSeconds % 60;
		minutes = (minutes < 10) ? "0"+minutes.toString() : minutes;
		seconds = (seconds < 10) ? "0"+seconds.toString() : seconds;
		console.log(minutes, seconds);
		time = {
			minutes: minutes,
			seconds: seconds
		}
		$(this.el).html(this.template(time));
		return this
	}

});